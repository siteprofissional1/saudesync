/**
 * SAÚDE SYNC — Sincronização em Tempo Real (Firebase Cloud Firestore & BroadcastChannel)
 * Listener ativo onSnapshot com canal de sincronização multi-abas e contingência demonstrativa.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, doc, updateDoc } from 'firebase/firestore';
import { api } from './api.js';

// Configuração do Firebase Web Client (lida de variáveis de ambiente VITE_)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "saudesync.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "saudesync",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "saudesync.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "287641911764",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:287641911764:web:cb77166673396833b49641",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-MR6WTK599S"
};

let app = null;
let db = null;
let isFirebaseActive = false;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  isFirebaseActive = true;
} catch (e) {
  console.warn('[Firebase] SDK client operando em modo local demonstrativo:', e.message);
}

// Memória local reativa compartilhada
let activeQueueMemory = [];
const subscribers = new Set();

// Canal de comunicação inter-abas (Permite sincronizar Painel de Controle e Painel TV da Sala de Espera)
const queueChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('saudesync_queue_channel') : null;

if (queueChannel) {
  queueChannel.onmessage = (event) => {
    const { type, queue, patient, action } = event.data || {};
    if (Array.isArray(queue)) {
      activeQueueMemory = queue;
    }
    // Notificar assinantes locais
    subscribers.forEach(cb => {
      try {
        cb(activeQueueMemory, 'broadcast_live', { type, patient, action });
      } catch (err) {
        console.warn('Erro em subscriber de fila:', err);
      }
    });
  };
}

/**
 * Escuta atualizações da fila de atendimento em tempo real.
 */
export function subscribeQueue(onData, onError) {
  let unsubscribeFirestore = null;
  let fallbackInterval = null;

  subscribers.add(onData);

  // Se já temos dados em memória, entregar imediatamente
  if (activeQueueMemory.length > 0) {
    onData(activeQueueMemory, isFirebaseActive ? 'firestore_live' : 'simulated_realtime', null);
  }

  if (isFirebaseActive && db) {
    try {
      const q = collection(db, 'fila_atendimento');
      unsubscribeFirestore = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const items = [];
            snapshot.forEach((doc) => {
              items.push({ id: doc.id, ...doc.data() });
            });
            activeQueueMemory = items;
            onData(activeQueueMemory, 'firestore_live', null);
            return;
          }
          loadFallbackData(onData);
        },
        (error) => {
          console.warn('[Firebase Snapshot Error] Fallback demonstrativo:', error.message);
          loadFallbackData(onData);
          fallbackInterval = setInterval(() => loadFallbackData(onData), 15000);
          if (onError) onError(error);
        }
      );
    } catch (err) {
      console.warn('[Firebase Init Error]', err);
      loadFallbackData(onData);
      fallbackInterval = setInterval(() => loadFallbackData(onData), 15000);
    }
  } else {
    loadFallbackData(onData);
    fallbackInterval = setInterval(() => loadFallbackData(onData), 15000);
  }

  return () => {
    subscribers.delete(onData);
    if (unsubscribeFirestore) unsubscribeFirestore();
    if (fallbackInterval) clearInterval(fallbackInterval);
  };
}

/**
 * Adiciona um novo paciente na fila e transmite para todas as telas (incluindo o telão TV)
 */
export function addPatientToQueue(patient) {
  activeQueueMemory.unshift(patient);

  // Tentar salvar no Firestore se disponível
  if (isFirebaseActive && db) {
    try {
      addDoc(collection(db, 'fila_atendimento'), patient).catch(e => console.warn('Erro ao salvar no Firestore:', e));
    } catch {}
  }

  // Notificar outras abas (TV da sala de espera, etc.)
  queueChannel?.postMessage({
    type: 'ADD_PATIENT',
    queue: activeQueueMemory,
    patient,
    action: 'add'
  });

  // Notificar assinantes na aba atual
  subscribers.forEach(cb => cb(activeQueueMemory, 'simulated_realtime', { type: 'ADD_PATIENT', patient }));
}

/**
 * Chama um paciente para atendimento médico e transmite o alerta para a TV da sala de espera
 */
export function callPatientInQueue(patient) {
  patient.status = 'Em Atendimento Médico (Chamado)';
  patient.hora_chamada = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Transmitir para o Painel TV
  queueChannel?.postMessage({
    type: 'CALL_PATIENT',
    queue: activeQueueMemory,
    patient,
    action: 'call'
  });

  // Notificar assinantes na aba atual
  subscribers.forEach(cb => cb(activeQueueMemory, 'simulated_realtime', { type: 'CALL_PATIENT', patient }));
}

/**
 * Retorna os dados atuais da fila em memória
 */
export function getQueueCache() {
  return [...activeQueueMemory];
}

async function loadFallbackData(onData) {
  try {
    const res = await api.getQueue();
    if (res && res.fila) {
      // Manter pacientes locais adicionados dinamicamente
      const localSims = activeQueueMemory.filter(p => p.atendimento_id?.startsWith('ATD-'));
      const combined = [...localSims, ...res.fila.filter(f => !localSims.some(s => s.senha_painel === f.senha_painel))];
      activeQueueMemory = combined;
      onData(activeQueueMemory, 'simulated_realtime', null);
    }
  } catch (e) {
    console.warn('[Queue Fallback Error]', e.message);
  }
}
