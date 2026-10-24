/**
 * SAÚDE SYNC — Painel de TV da Sala de Espera (Telão Fullscreen em Tempo Real)
 * Desenvolvido especificamente para exibição em TVs/Monitores de parede da sala de espera hospitalar.
 * Sincronizado reativamente via Firebase Firestore e BroadcastChannel multi-abas.
 */

import { subscribeQueue } from '../services/firebase.js';
import { createManchesterBadge } from '../components/ManchesterBadge.js';
import { playHospitalChime } from '../utils/audio.js';
import { getManchesterInfo } from '../utils/formatters.js';

const PRIORITY_WEIGHTS = {
  'Vermelho - Emergência': 1,
  'Laranja - Muito Urgente': 2,
  'Amarelo - Urgente': 3,
  'Verde - Pouco Urgente': 4,
  'Azul - Não Urgente': 5
};

export function renderTvPage(container) {
  let unsubscribe = null;
  let clockInterval = null;
  let currentList = [];
  let callHistory = [];
  let currentCalled = null;

  container.innerHTML = `
    <div class="tv-dashboard-wrapper" id="tv-fullscreen-container">
      <!-- Barra Superior do Telão da TV -->
      <header class="tv-header">
        <div class="tv-brand">
          <span class="tv-logo-icon">🏥</span>
          <div>
            <h1 class="tv-hospital-title">SAÚDE SYNC — PRONTO ATENDIMENTO CENTRAL</h1>
            <span class="tv-hospital-subtitle">Sistema Integrado de Chamada & Triagem de Manchester</span>
          </div>
        </div>

        <div class="tv-header-right">
          <div class="tv-clock-box">
            <span id="tv-live-clock" class="tv-clock-digits">--:--:--</span>
            <span id="tv-live-date" class="tv-date-text">Carregando data...</span>
          </div>

          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <button id="btn-tv-fullscreen" class="btn btn-secondary" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;" title="Alternar Tela Cheia">
              <span>⛶</span> Tela Cheia
            </button>
            <a href="#queue" class="btn btn-secondary" style="font-size: 0.85rem; padding: 0.4rem 0.8rem; text-decoration: none;" title="Voltar ao Painel Médico">
              <span>⚙️</span> Painel Médico
            </a>
          </div>
        </div>
      </header>

      <!-- Grade Principal do Telão (Hero Call à esquerda + Listas à direita) -->
      <main class="tv-main-grid">
        <!-- COLUNA ESQUERDA: SENHA EM ATENDIMENTO (DESTAQUE GIGANTE) -->
        <section class="tv-hero-call-card" id="tv-hero-card">
          <div class="tv-hero-header">
            <span class="tv-pulse-beacon"></span>
            <span class="tv-hero-title-tag">📢 SENHA CHAMADA NO MOMENTO</span>
          </div>

          <div class="tv-hero-ticket-display" id="tv-hero-ticket-box">
            <span id="tv-ticket-prefix" class="tv-ticket-prefix">SENHA</span>
            <span id="tv-ticket-number" class="tv-ticket-number">---</span>
          </div>

          <div class="tv-hero-badge-container" id="tv-hero-badge">
            <span class="badge-manchester amarelo" style="font-size: 1.2rem; padding: 0.5rem 1.25rem;">
              <span>⏳</span> Aguardando Primeira Chamada
            </span>
          </div>

          <div class="tv-hero-location-box">
            <div class="tv-location-item">
              <span class="tv-loc-label">LOCAL / SALA DE ATENDIMENTO:</span>
              <strong id="tv-room-name" class="tv-loc-value">---</strong>
            </div>

            <div class="tv-location-item">
              <span class="tv-loc-label">MÉDICO PLANTONISTA RESPONSÁVEL:</span>
              <strong id="tv-doctor-name" class="tv-loc-value">Equipe em Escala Regular</strong>
            </div>
          </div>

          <div class="tv-hero-footer-note" id="tv-call-timestamp">
            Aguarde o anúncio da sua senha no painel sonoro.
          </div>
        </section>

        <!-- COLUNA DIREITA: HISTÓRICO RECENTE & PRÓXIMAS SENHAS -->
        <aside class="tv-side-panel">
          <!-- Bloco 1: Histórico Recente de Senhas Chamadas -->
          <div class="tv-side-card">
            <div class="tv-side-card-title">
              <span>🕒</span>
              <span>ÚLTIMAS SENHAS CHAMADAS</span>
            </div>
            <div class="tv-history-list" id="tv-history-list">
              <div style="text-align: center; color: var(--text-muted); padding: 1.5rem; font-size: 0.9rem;">
                Nenhuma senha chamada recentemente.
              </div>
            </div>
          </div>

          <!-- Bloco 2: Próximas Senhas Aguardando na Fila -->
          <div class="tv-side-card" style="flex: 1;">
            <div class="tv-side-card-title">
              <span>👥</span>
              <span>PRÓXIMAS SENHAS AGUARDANDO (PRIORIDADE MANCHESTER)</span>
            </div>
            <div class="tv-waiting-list" id="tv-waiting-list">
              <div style="text-align: center; color: var(--text-muted); padding: 1.5rem; font-size: 0.9rem;">
                Carregando fila em tempo real...
              </div>
            </div>
          </div>
        </aside>
      </main>

      <!-- Barra de Rolagem de Avisos Institucionais (Ticker / Marquee) -->
      <footer class="tv-ticker-bar">
        <div class="tv-ticker-tag">AVISO AOS PACIENTES</div>
        <div class="tv-ticker-content">
          <span>⚠️ <strong>Atenção:</strong> O atendimento no Pronto Atendimento segue estritamente a <strong>Gravidade Clínica do Protocolo de Manchester</strong> e NÃO a ordem de chegada. Em caso de piora súbita ou sintomas agudos, procure imediatamente a equipe de enfermagem da Triagem.</span>
        </div>
      </footer>
    </div>
  `;

  // Atualizador do Relógio em Tempo Real
  function updateClock() {
    const now = new Date();
    const clockEl = document.getElementById('tv-live-clock');
    const dateEl = document.getElementById('tv-live-date');

    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }

    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    }
  }

  updateClock();
  clockInterval = setInterval(updateClock, 1000);

  // Ordenação Estrita de Manchester
  function sortQueue(items) {
    return [...items].sort((a, b) => {
      const pA = PRIORITY_WEIGHTS[a.classificacao] || 99;
      const pB = PRIORITY_WEIGHTS[b.classificacao] || 99;
      if (pA !== pB) return pA - pB;
      return (Number(b.tempo_espera_real_min) || 0) - (Number(a.tempo_espera_real_min) || 0);
    });
  }

  // Função para Exibir Chamada de Senha no Telão
  function displayCalledTicket(patient, playSound = true) {
    currentCalled = patient;
    const ticketBox = document.getElementById('tv-hero-ticket-box');
    const ticketNum = document.getElementById('tv-ticket-number');
    const badgeContainer = document.getElementById('tv-hero-badge');
    const roomEl = document.getElementById('tv-room-name');
    const doctorEl = document.getElementById('tv-doctor-name');
    const timeEl = document.getElementById('tv-call-timestamp');

    if (!ticketNum) return;

    ticketNum.textContent = patient.senha_painel || '---';
    badgeContainer.innerHTML = createManchesterBadge(patient.classificacao, patient.tempo_espera_real_min, patient.tempo_espera_max_min);
    roomEl.textContent = patient.leito || 'Consultório 01 (Atendimento Médico)';
    doctorEl.textContent = patient.medico_plantonista || 'Médico Plantonista Responsável';

    const hora = patient.hora_chamada || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    timeEl.innerHTML = `Chamado às <strong>${hora}</strong> — Favor dirigir-se à sala indicada`;

    // Animação de Pulso Luminoso
    ticketBox.classList.remove('pulse-glow');
    void ticketBox.offsetWidth;
    ticketBox.classList.add('pulse-glow');

    // Atualizar Histórico de Chamadas
    if (!callHistory.some(h => h.senha === patient.senha_painel)) {
      callHistory.unshift({
        senha: patient.senha_painel,
        classificacao: patient.classificacao,
        leito: patient.leito || 'Consultório',
        hora: hora
      });
      if (callHistory.length > 5) callHistory.pop();
      renderHistoryList();
    }

    if (playSound) {
      playHospitalChime();
    }
  }

  function renderHistoryList() {
    const listEl = document.getElementById('tv-history-list');
    if (!listEl) return;

    if (callHistory.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 1.5rem; font-size: 0.9rem;">
          Nenhuma senha chamada recentemente.
        </div>
      `;
      return;
    }

    listEl.innerHTML = callHistory.map(item => `
      <div class="tv-history-row">
        <div class="tv-hist-ticket">${item.senha}</div>
        <div class="tv-hist-meta">
          <strong>${item.leito}</strong>
          <span style="font-size: 0.75rem; color: var(--text-muted);">${item.hora}</span>
        </div>
        <div>
          ${createManchesterBadge(item.classificacao)}
        </div>
      </div>
    `).join('');
  }

  function renderWaitingList(items) {
    const listEl = document.getElementById('tv-waiting-list');
    if (!listEl) return;

    const waiting = items.filter(p => !p.status?.includes('Chamado') && !p.status?.includes('Atendimento'));

    if (waiting.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 2rem; font-size: 0.95rem;">
          Nenhum paciente aguardando no momento.
        </div>
      `;
      return;
    }

    // Exibir as próximas 6 senhas
    listEl.innerHTML = waiting.slice(0, 6).map((item, idx) => `
      <div class="tv-waiting-row">
        <div class="tv-wait-pos">#${idx + 1}</div>
        <div class="tv-wait-ticket">${item.senha_painel}</div>
        <div style="flex: 1;">${createManchesterBadge(item.classificacao)}</div>
        <div class="tv-wait-time">
          <span>⏳ ${item.tempo_espera_real_min || 0} min</span>
        </div>
      </div>
    `).join('');
  }

  // Listener Reativo em Tempo Real
  unsubscribe = subscribeQueue(
    (items, mode, eventMeta) => {
      currentList = sortQueue(items);

      // Se o evento for de chamada específica transmitida por outra aba
      if (eventMeta && eventMeta.type === 'CALL_PATIENT' && eventMeta.patient) {
        displayCalledTicket(eventMeta.patient, true);
      } else if (!currentCalled) {
        // Se ainda não tiver nenhuma chamada na tela, verificar se há alguém chamado na lista
        const alreadyCalled = currentList.find(p => p.status?.includes('Chamado') || p.status?.includes('Atendimento'));
        if (alreadyCalled) {
          displayCalledTicket(alreadyCalled, false);
        } else if (currentList.length > 0) {
          // Mostrar o primeiro da fila como próximo esperado
          const first = currentList[0];
          document.getElementById('tv-room-name').textContent = `${first.leito} — Em Preparação`;
        }
      }

      renderWaitingList(currentList);
    },
    (err) => {
      console.warn('Erro na sincronização do Telão TV:', err);
    }
  );

  // Botão de Fullscreen
  const btnFullscreen = document.getElementById('btn-tv-fullscreen');
  btnFullscreen?.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Fullscreen não suportado ou negado:', err);
      });
      btnFullscreen.innerHTML = '<span>✕</span> Sair da Tela Cheia';
    } else {
      document.exitFullscreen().catch(() => {});
      btnFullscreen.innerHTML = '<span>⛶</span> Tela Cheia';
    }
  });

  return () => {
    if (unsubscribe) unsubscribe();
    if (clockInterval) clearInterval(clockInterval);
  };
}
