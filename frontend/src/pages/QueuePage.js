/**
 * SAÚDE SYNC — Página de Fila em Tempo Real (Realtime NoSQL & Simulação Hospitalar)
 * Suporte a múltiplos níveis de prioridade do Protocolo de Manchester (Vermelho, Laranja, Amarelo, Verde, Azul),
 * Telão de Senha em Tempo Real, Auto-Play contínuo e Prontuário Clínico.
 */

import { subscribeQueue, addPatientToQueue, callPatientInQueue } from '../services/firebase.js';
import { createManchesterBadge } from '../components/ManchesterBadge.js';
import { formatDateTime, getManchesterInfo } from '../utils/formatters.js';
import { showToast } from '../components/Toast.js';
import { playHospitalChime } from '../utils/audio.js';

// Perfis Clínicos Realistas por Nível de Manchester
const CLINICAL_PROFILES = {
  vermelho: [
    {
      classificacao: 'Vermelho - Emergência',
      prefix: 'E-',
      maxMin: 0,
      sintoma: 'Dor precordial opressiva súbita irradiando p/ MSE com sudorese fria e hipotensão',
      especialidade: 'Cardiologia / Emergência',
      medico: 'Dr. Lucas Silveira (CRM-SP 142301)',
      leito: 'Sala Vermelha 01',
      vitals: { pa: '80/50 mmHg', fc: '128 bpm', temp: '36.2 °C', spo2: '89%' },
      idade: 62, sexo: 'M'
    },
    {
      classificacao: 'Vermelho - Emergência',
      prefix: 'E-',
      maxMin: 0,
      sintoma: 'Parada cardiorrespiratória em transporte SAMU revertida - Paciente instável',
      especialidade: 'Emergência Crítica / UTI',
      medico: 'Dra. Vanessa Matos (CRM-SP 165840)',
      leito: 'Box Ressuscitação 02',
      vitals: { pa: '90/60 mmHg', fc: '136 bpm', temp: '35.9 °C', spo2: '90%' },
      idade: 55, sexo: 'F'
    },
    {
      classificacao: 'Vermelho - Emergência',
      prefix: 'E-',
      maxMin: 0,
      sintoma: 'Déficit neurológico focal agudo com hemiplegia D e afasia (Janela AVC < 3h)',
      especialidade: 'Neurologia / Emergência',
      medico: 'Dr. Lucas Silveira (CRM-SP 142301)',
      leito: 'Sala Vermelha 02',
      vitals: { pa: '190/115 mmHg', fc: '92 bpm', temp: '36.8 °C', spo2: '96%' },
      idade: 71, sexo: 'M'
    }
  ],
  laranja: [
    {
      classificacao: 'Laranja - Muito Urgente',
      prefix: 'U-',
      maxMin: 10,
      sintoma: 'Cefaleia súbita e explosiva com alteração de acuidade visual e PA 210/120',
      especialidade: 'Clínica Médica / Emergência',
      medico: 'Dra. Camila Ribeiro (CRM-SP 158900)',
      leito: 'Observação Rápida 01',
      vitals: { pa: '210/120 mmHg', fc: '98 bpm', temp: '36.9 °C', spo2: '97%' },
      idade: 48, sexo: 'F'
    },
    {
      classificacao: 'Laranja - Muito Urgente',
      prefix: 'U-',
      maxMin: 10,
      sintoma: 'Dispneia moderada com tiragem intercostal e SpO2 91% em ar ambiente',
      especialidade: 'Pneumologia / Emergência',
      medico: 'Dr. Fernando Dias (CRM-SP 173420)',
      leito: 'Box Laranja 03',
      vitals: { pa: '135/85 mmHg', fc: '108 bpm', temp: '37.3 °C', spo2: '91%' },
      idade: 36, sexo: 'M'
    },
    {
      classificacao: 'Laranja - Muito Urgente',
      prefix: 'U-',
      maxMin: 10,
      sintoma: 'Dor abdominal aguda em fossa ilíaca direita com sinal de descompressão dolorosa',
      especialidade: 'Cirurgia Geral',
      medico: 'Dra. Camila Ribeiro (CRM-SP 158900)',
      leito: 'Observação Rápida 02',
      vitals: { pa: '125/80 mmHg', fc: '102 bpm', temp: '38.4 °C', spo2: '98%' },
      idade: 27, sexo: 'M'
    }
  ],
  amarelo: [
    {
      classificacao: 'Amarelo - Urgente',
      prefix: 'A-',
      maxMin: 60,
      sintoma: 'Febre 39.2 °C persistente há 48h associada a calafrios e dor lombar',
      especialidade: 'Clínica Geral',
      medico: 'Dr. Fernando Dias (CRM-SP 173420)',
      leito: 'Consultório 03',
      vitals: { pa: '120/80 mmHg', fc: '96 bpm', temp: '39.2 °C', spo2: '97%' },
      idade: 33, sexo: 'F'
    },
    {
      classificacao: 'Amarelo - Urgente',
      prefix: 'A-',
      maxMin: 60,
      sintoma: 'Cólica renal severa unilateral paroxística com episódios de náuseas',
      especialidade: 'Urologia / Clínica Geral',
      medico: 'Dra. Beatriz Prado (CRM-SP 181930)',
      leito: 'Poltrona de Medicação 04',
      vitals: { pa: '140/90 mmHg', fc: '90 bpm', temp: '37.0 °C', spo2: '99%' },
      idade: 42, sexo: 'M'
    },
    {
      classificacao: 'Amarelo - Urgente',
      prefix: 'A-',
      maxMin: 60,
      sintoma: 'Traumatismo em queda ao solo com ferimento corto-contuso em fronte sem perda de sentidos',
      especialidade: 'Ortopedia / Cirurgia',
      medico: 'Dr. Fernando Dias (CRM-SP 173420)',
      leito: 'Consultório 04',
      vitals: { pa: '130/80 mmHg', fc: '82 bpm', temp: '36.7 °C', spo2: '98%' },
      idade: 19, sexo: 'M'
    }
  ],
  verde: [
    {
      classificacao: 'Verde - Pouco Urgente',
      prefix: 'P-',
      maxMin: 120,
      sintoma: 'Sintomas respiratórios leves (coriza, odinofagia) há 3 dias sem dispneia',
      especialidade: 'Clínica Geral',
      medico: 'Dra. Beatriz Prado (CRM-SP 181930)',
      leito: 'Consultório 02',
      vitals: { pa: '115/75 mmHg', fc: '76 bpm', temp: '37.4 °C', spo2: '98%' },
      idade: 29, sexo: 'F'
    },
    {
      classificacao: 'Verde - Pouco Urgente',
      prefix: 'P-',
      maxMin: 120,
      sintoma: 'Entorse leve de tornozelo ao descer escada, sem deformidade aparente',
      especialidade: 'Ortopedia',
      medico: 'Dra. Beatriz Prado (CRM-SP 181930)',
      leito: 'Consultório Ortopédico',
      vitals: { pa: '120/80 mmHg', fc: '78 bpm', temp: '36.5 °C', spo2: '99%' },
      idade: 24, sexo: 'M'
    },
    {
      classificacao: 'Verde - Pouco Urgente',
      prefix: 'P-',
      maxMin: 120,
      sintoma: 'Lombalgia mecânica crônica após esforço físico postural',
      especialidade: 'Clínica Geral',
      medico: 'Dr. Lucas Silveira (CRM-SP 142301)',
      leito: 'Sala de Acolhimento',
      vitals: { pa: '125/82 mmHg', fc: '74 bpm', temp: '36.6 °C', spo2: '99%' },
      idade: 51, sexo: 'F'
    }
  ],
  azul: [
    {
      classificacao: 'Azul - Não Urgente',
      prefix: 'N-',
      maxMin: 240,
      sintoma: 'Renovação de receita de uso contínuo para hipertensão arterial',
      especialidade: 'Clínica Médica Ambulatorial',
      medico: 'Dra. Camila Ribeiro (CRM-SP 158900)',
      leito: 'Ambulatório 01',
      vitals: { pa: '128/82 mmHg', fc: '72 bpm', temp: '36.4 °C', spo2: '98%' },
      idade: 67, sexo: 'M'
    },
    {
      classificacao: 'Azul - Não Urgente',
      prefix: 'N-',
      maxMin: 240,
      sintoma: 'Retirada de pontos em ferimento cicatrizado de antebraço esquerdo',
      especialidade: 'Enfermagem / Clínica Geral',
      medico: 'Dra. Beatriz Prado (CRM-SP 181930)',
      leito: 'Sala de Curativos',
      vitals: { pa: '120/75 mmHg', fc: '70 bpm', temp: '36.5 °C', spo2: '99%' },
      idade: 38, sexo: 'F'
    },
    {
      classificacao: 'Azul - Não Urgente',
      prefix: 'N-',
      maxMin: 240,
      sintoma: 'Solicitação de encaminhamento ambulatorial para avaliação de rotina',
      especialidade: 'Clínica Geral',
      medico: 'Dr. Fernando Dias (CRM-SP 173420)',
      leito: 'Ambulatório 02',
      vitals: { pa: '118/76 mmHg', fc: '68 bpm', temp: '36.6 °C', spo2: '99%' },
      idade: 45, sexo: 'M'
    }
  ]
};

// Pesos canônicos de Manchester para ordenação da fila
const PRIORITY_WEIGHTS = {
  'Vermelho - Emergência': 1,
  'Laranja - Muito Urgente': 2,
  'Amarelo - Urgente': 3,
  'Verde - Pouco Urgente': 4,
  'Azul - Não Urgente': 5
};

export function renderQueue(container) {
  let unsubscribe = null;
  let currentList = [];
  let currentFilterColor = 'all';
  let searchQuery = '';
  let autoPlayTimer = null;
  let callHistory = [];
  let lastCalled = null;

  container.innerHTML = `
    <!-- TELÃO HOSPITALAR DE CHAMADA DE SENHAS -->
    <section class="hospital-call-display" aria-label="Painel de Chamada Hospitalar em Tempo Real">
      <div class="call-main-box">
        <div>
          <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--brand-accent); letter-spacing: 0.05em; display: block; margin-bottom: 0.25rem;">
            📢 Painel de Chamada Hospitalar — Telão de Senhas
          </span>
          <div class="call-ticket-badge" id="call-ticket-display">
            <span id="call-ticket-text">AGUARDANDO CHAMADA</span>
          </div>
        </div>

        <div class="call-meta-info" id="call-meta-box">
          <div class="call-room" id="call-room-display">
            <span>📍</span>
            <span id="call-room-text">Selecione ou clique em 'Chamar' na fila</span>
          </div>
          <div class="call-detail" id="call-doctor-display">
            Equipe médica em atendimento regular
          </div>
        </div>
      </div>

      <div class="call-history-section">
        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">
          Últimas Senhas Chamadas:
        </span>
        <div class="call-history-chips" id="call-history-chips">
          <span class="history-chip" style="color: var(--text-muted);">Nenhuma recente</span>
        </div>
      </div>
    </section>

    <!-- BARRA DE SIMULAÇÃO E CONTROLES INTERATIVOS -->
    <div style="background-color: var(--bg-surface); border: 1px solid var(--border-default); border-radius: var(--radius-lg); padding: 1.25rem; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span class="status-dot pulse" style="width: 12px; height: 12px;"></span>
          <div>
            <h3 style="font-size: 1.1rem; font-weight: 700; margin: 0;">Fila de Espera Ativa (Tempo Real)</h3>
            <span id="queue-sync-mode" style="font-size: 0.8rem; color: var(--text-muted);">
              Sincronização reativa com Firebase Firestore ativa
            </span>
          </div>
        </div>

        <!-- Ações Principais -->
        <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
          <a href="#tv" class="btn btn-secondary" style="text-decoration: none;" title="Abrir Modo TV / Telão de Parede em tela cheia">
            <span>📺</span> Abrir Painel TV
          </a>

          <button id="btn-toggle-autoplay" class="btn-autoplay" title="Alterna simulação automática contínua de fluxo hospitalar">
            <span id="autoplay-icon">▶️</span>
            <span id="autoplay-text">Simulação Automática (Auto-Play)</span>
          </button>

          <button id="btn-call-next" class="btn btn-secondary" title="Chama o próximo paciente com maior gravidade">
            <span>🔔</span> Chamar Próximo
          </button>

          <button id="btn-sim-random" class="btn btn-primary" title="Adiciona paciente com distribuição probabilística Manchester realista">
            <span>🎲</span> + Paciente (Fluxo Geral)
          </button>
        </div>
      </div>

      <!-- Barra de Simulação Específica por Cor Manchester (Permite demonstrar qualquer nível) -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--border-subtle);">
        <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);">
          Simular Inserção Direta por Manchester:
        </span>
        <div class="btn-manchester-group">
          <button class="btn-manchester red" data-color="vermelho" title="Adicionar caso grave (Emergência Imediata)">
            <span>🚨</span> + Vermelho (0m)
          </button>
          <button class="btn-manchester orange" data-color="laranja" title="Adicionar Muito Urgente (10 min)">
            <span>⚠️</span> + Laranja (10m)
          </button>
          <button class="btn-manchester yellow" data-color="amarelo" title="Adicionar Urgente (60 min)">
            <span>⚡</span> + Amarelo (60m)
          </button>
          <button class="btn-manchester green" data-color="verde" title="Adicionar Pouco Urgente (120 min)">
            <span>🟢</span> + Verde (120m)
          </button>
          <button class="btn-manchester blue" data-color="azul" title="Adicionar Não Urgente (240 min)">
            <span>🔵</span> + Azul (240m)
          </button>
        </div>
      </div>
    </div>

    <!-- CONTADORES RÁPIDOS POR NÍVEL DE MANCHESTER -->
    <div class="kpi-grid" style="margin-bottom: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
      <div class="kpi-card accent-red" style="padding: 1rem 1.25rem;">
        <div class="kpi-title">Vermelho</div>
        <div id="count-vermelho" class="kpi-value" style="font-size: 1.7rem;">0</div>
        <div class="kpi-subtitle">Emergência (Imediato)</div>
      </div>
      <div class="kpi-card accent-orange" style="padding: 1rem 1.25rem;">
        <div class="kpi-title">Laranja</div>
        <div id="count-laranja" class="kpi-value" style="font-size: 1.7rem;">0</div>
        <div class="kpi-subtitle">Muito Urgente (10 min)</div>
      </div>
      <div class="kpi-card" style="padding: 1rem 1.25rem; border-left: 3px solid var(--manchester-amarelo);">
        <div class="kpi-title">Amarelo</div>
        <div id="count-amarelo" class="kpi-value" style="font-size: 1.7rem; color: var(--manchester-amarelo);">0</div>
        <div class="kpi-subtitle">Urgente (60 min)</div>
      </div>
      <div class="kpi-card" style="padding: 1rem 1.25rem; border-left: 3px solid var(--manchester-verde);">
        <div class="kpi-title">Verde</div>
        <div id="count-verde" class="kpi-value" style="font-size: 1.7rem; color: var(--manchester-verde);">0</div>
        <div class="kpi-subtitle">Pouco Urgente (120 min)</div>
      </div>
      <div class="kpi-card" style="padding: 1rem 1.25rem; border-left: 3px solid var(--manchester-azul);">
        <div class="kpi-title">Azul</div>
        <div id="count-azul" class="kpi-value" style="font-size: 1.7rem; color: var(--manchester-azul);">0</div>
        <div class="kpi-subtitle">Não Urgente (240 min)</div>
      </div>
    </div>

    <!-- FILTROS E BUSCA INSTANTÂNEA NA FILA -->
    <div style="background-color: var(--bg-surface); border: 1px solid var(--border-default); border-radius: var(--radius-lg); padding: 1rem 1.25rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
      <div class="queue-filter-pills" id="filter-pills-container">
        <button class="filter-pill active" data-filter="all">Todas as Senhas</button>
        <button class="filter-pill" data-filter="vermelho">🔴 Vermelho</button>
        <button class="filter-pill" data-filter="laranja">🟠 Laranja</button>
        <button class="filter-pill" data-filter="amarelo">🟡 Amarelo</button>
        <button class="filter-pill" data-filter="verde">🟢 Verde</button>
        <button class="filter-pill" data-filter="azul">🔵 Azul</button>
      </div>

      <div style="display: flex; gap: 0.5rem; align-items: center; width: 100%; max-width: 320px;">
        <input 
          type="text" 
          id="queue-search-input" 
          class="filter-control" 
          placeholder="Buscar senha, queixa ou médico..." 
          style="padding: 0.45rem 0.85rem; font-size: 0.85rem;"
        />
        <button id="btn-clear-queue-search" class="btn btn-secondary" style="padding: 0.45rem 0.65rem;" title="Limpar busca">
          ✕
        </button>
      </div>
    </div>

    <!-- TABELA DA FILA EM TEMPO REAL -->
    <div class="table-responsive-wrapper">
      <table class="saude-table" id="queue-table">
        <thead>
          <tr>
            <th>Senha</th>
            <th>Classificação Manchester</th>
            <th>Sintoma / Queixa Relatada</th>
            <th>Espera & SLA Manchester</th>
            <th>Especialidade & Plantonista</th>
            <th>Leito / Box</th>
            <th>Status</th>
            <th style="text-align: right;">Ações Médicas</th>
          </tr>
        </thead>
        <tbody id="queue-table-body">
          <tr>
            <td colspan="8" style="text-align: center; padding: 2rem;">
              <div class="spinner" style="margin: 0 auto 1rem;"></div>
              <span>Conectando ao Firestore em tempo real...</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- CONTAINER DE MODAL DINÂMICO DE PRONTUÁRIO -->
    <div id="patient-modal-container"></div>
  `;

  // Função para Gerar Paciente Clínico Realista
  function generatePatient(colorKey = null) {
    // Se não especificado, distribuição baseada no fluxo epidemiológico de pronto-socorro:
    // Vermelho: 4%, Laranja: 14%, Amarelo: 38%, Verde: 32%, Azul: 12%
    if (!colorKey) {
      const rand = Math.random();
      if (rand < 0.05) colorKey = 'vermelho';
      else if (rand < 0.20) colorKey = 'laranja';
      else if (rand < 0.58) colorKey = 'amarelo';
      else if (rand < 0.88) colorKey = 'verde';
      else colorKey = 'azul';
    }

    const profiles = CLINICAL_PROFILES[colorKey] || CLINICAL_PROFILES.amarelo;
    const template = profiles[Math.floor(Math.random() * profiles.length)];

    // Gerar senha com prefixo próprio da cor e 3 dígitos
    const num = Math.floor(100 + Math.random() * 899);
    const senha = `${template.prefix}${num}`;

    // Tempo de espera inicial realista por cor
    let tempoEspera = 1;
    if (colorKey === 'vermelho') tempoEspera = Math.floor(Math.random() * 3);
    else if (colorKey === 'laranja') tempoEspera = Math.floor(2 + Math.random() * 10);
    else if (colorKey === 'amarelo') tempoEspera = Math.floor(10 + Math.random() * 45);
    else if (colorKey === 'verde') tempoEspera = Math.floor(20 + Math.random() * 80);
    else if (colorKey === 'azul') tempoEspera = Math.floor(30 + Math.random() * 120);

    return {
      atendimento_id: `ATD-SIM-${Date.now()}-${num}`,
      senha_painel: senha,
      classificacao: template.classificacao,
      tempo_espera_real_min: tempoEspera,
      tempo_espera_max_min: template.maxMin,
      sintoma_principal: template.sintoma,
      especialidade: template.especialidade,
      medico_plantonista: template.medico,
      leito: template.leito,
      vitals: template.vitals,
      paciente_idade: template.idade,
      paciente_sexo: template.sexo,
      municipio_origem: 'Ourinhos/SP',
      data_hora_chegada: new Date().toISOString(),
      status: 'Aguardando na Fila'
    };
  }

  // Ordenação Canônica: Gravidade Manchester -> Tempo de espera decorrido
  function sortQueue(items) {
    return [...items].sort((a, b) => {
      const pA = PRIORITY_WEIGHTS[a.classificacao] || 99;
      const pB = PRIORITY_WEIGHTS[b.classificacao] || 99;
      if (pA !== pB) return pA - pB;
      // Em empate de cor, quem espera há mais tempo é priorizado
      return (Number(b.tempo_espera_real_min) || 0) - (Number(a.tempo_espera_real_min) || 0);
    });
  }

  // Atualização Visual da Tabela e dos Contadores
  function updateTableUI(items, mode) {
    currentList = items;
    const modeEl = document.getElementById('queue-sync-mode');
    if (modeEl && mode) {
      modeEl.textContent = mode === 'firestore_live' 
        ? '⚡ Conectado ao Firebase Cloud Firestore (onSnapshot ativo)' 
        : '🔄 Sincronização Local Demonstrativa Ativa';
    }

    const sorted = sortQueue(currentList);

    // Atualizar Contadores de Manchester
    const counts = { vermelho: 0, laranja: 0, amarelo: 0, verde: 0, azul: 0 };
    sorted.forEach(item => {
      const c = (item.classificacao || '').toLowerCase();
      if (c.includes('vermelho')) counts.vermelho++;
      else if (c.includes('laranja')) counts.laranja++;
      else if (c.includes('amarelo')) counts.amarelo++;
      else if (c.includes('verde')) counts.verde++;
      else if (c.includes('azul')) counts.azul++;
    });

    document.getElementById('count-vermelho').textContent = counts.vermelho;
    document.getElementById('count-laranja').textContent = counts.laranja;
    document.getElementById('count-amarelo').textContent = counts.amarelo;
    document.getElementById('count-verde').textContent = counts.verde;
    document.getElementById('count-azul').textContent = counts.azul;

    // Aplicar Filtro de Cor e Busca
    let displayList = sorted;
    if (currentFilterColor !== 'all') {
      displayList = displayList.filter(item => 
        (item.classificacao || '').toLowerCase().includes(currentFilterColor)
      );
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      displayList = displayList.filter(item => 
        (item.senha_painel || '').toLowerCase().includes(q) ||
        (item.sintoma_principal || '').toLowerCase().includes(q) ||
        (item.medico_plantonista || '').toLowerCase().includes(q) ||
        (item.especialidade || '').toLowerCase().includes(q) ||
        (item.leito || '').toLowerCase().includes(q)
      );
    }

    const tbody = document.getElementById('queue-table-body');
    if (!tbody) return;

    if (displayList.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
            Nenhum paciente localizado para os filtros selecionados.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = displayList.map(item => {
      const real = Number(item.tempo_espera_real_min) || 0;
      const max = Number(item.tempo_espera_max_min) || 1;
      
      // Cálculo de SLA
      let slaPct = max > 0 ? Math.min(Math.round((real / max) * 100), 100) : 100;
      let barColor = 'var(--manchester-verde)';
      if (max === 0 || real > max) {
        barColor = 'var(--manchester-vermelho)';
        slaPct = 100;
      } else if (slaPct > 75) {
        barColor = 'var(--manchester-laranja)';
      }

      const isCalled = (item.status || '').includes('Chamado') || (item.status || '').includes('Atendimento');

      return `
        <tr style="${isCalled ? 'background-color: rgba(2, 132, 199, 0.08);' : ''}">
          <td class="ticket-cell" style="font-weight: 800;">
            ${item.senha_painel || '---'}
          </td>
          <td>
            ${createManchesterBadge(item.classificacao, item.tempo_espera_real_min, item.tempo_espera_max_min)}
          </td>
          <td style="max-width: 260px; font-size: 0.82rem;" title="${item.sintoma_principal || ''}">
            <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.15rem;">
              ${item.paciente_idade ? `${item.paciente_idade} anos, ${item.paciente_sexo || 'M/F'}` : 'Paciente'}
            </div>
            <div style="color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${item.sintoma_principal || 'Queixa em avaliação clínica'}
            </div>
          </td>
          <td>
            <div class="sla-bar-wrapper">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem;">
                <strong>${real} min</strong>
                <span style="color: var(--text-muted); font-size: 0.72rem;">limite: ${max}m</span>
              </div>
              <div class="sla-bar-track">
                <div class="sla-bar-fill" style="width: ${slaPct}%; background-color: ${barColor};"></div>
              </div>
            </div>
          </td>
          <td style="font-size: 0.82rem;">
            <div style="font-weight: 600;">${item.especialidade || 'Clínica Geral'}</div>
            <div style="color: var(--text-muted); font-size: 0.75rem;">${item.medico_plantonista || 'Em escala'}</div>
          </td>
          <td>
            <span style="padding: 0.25rem 0.55rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 4px; font-size: 0.78rem; font-weight: 600;">
              ${item.leito || 'Recepção'}
            </span>
          </td>
          <td>
            <span style="font-size: 0.8rem; font-weight: 700; color: ${isCalled ? '#38BDF8' : 'var(--text-secondary)'};">
              ${isCalled ? '🔔 ' + item.status : item.status || 'Aguardando'}
            </span>
          </td>
          <td style="text-align: right;">
            <div style="display: inline-flex; gap: 0.35rem;">
              <button class="btn-table-action call" data-action="call" data-id="${item.atendimento_id}" title="Chamar no Telão">
                <span>🔔</span> Chamar
              </button>
              <button class="btn-table-action" data-action="chart" data-id="${item.atendimento_id}" title="Ver Prontuário Rápido">
                <span>📋</span>
              </button>
              <button class="btn-table-action" data-action="finish" data-id="${item.atendimento_id}" title="Finalizar Atendimento">
                <span>✅</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Adicionar Listeners de Ação em cada Linha da Tabela
    tbody.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');
        const patient = currentList.find(p => p.atendimento_id === id);
        if (!patient) return;

        if (action === 'call') {
          triggerCallPatient(patient);
        } else if (action === 'chart') {
          openPatientModal(patient);
        } else if (action === 'finish') {
          finishPatient(patient);
        }
      });
    });
  }

  // Função para Chamar Paciente no Telão
  function triggerCallPatient(patient) {
    patient.status = 'Em Atendimento Médico (Chamado)';
    lastCalled = patient;

    // Atualizar Display do Telão
    const badgeEl = document.getElementById('call-ticket-display');
    const textEl = document.getElementById('call-ticket-text');
    const roomEl = document.getElementById('call-room-text');
    const doctorEl = document.getElementById('call-doctor-display');

    if (badgeEl && textEl && roomEl && doctorEl) {
      textEl.textContent = `SENHA ${patient.senha_painel}`;
      roomEl.textContent = `${patient.leito || 'Consultório 01'} — ${patient.especialidade || 'Clínica Médica'}`;
      doctorEl.textContent = `Plantonista: ${patient.medico_plantonista || 'Dr. Plantão'} | Classificação: ${patient.classificacao}`;
      
      // Animação de pulso
      badgeEl.classList.remove('pulse');
      void badgeEl.offsetWidth; // trigger reflow
      badgeEl.classList.add('pulse');
    }

    // Adicionar ao Histórico
    if (!callHistory.find(h => h.senha === patient.senha_painel)) {
      callHistory.unshift({
        senha: patient.senha_painel,
        cor: patient.classificacao,
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      });
      if (callHistory.length > 4) callHistory.pop();
    }

    // Renderizar Chips de Histórico
    const chipsContainer = document.getElementById('call-history-chips');
    if (chipsContainer) {
      chipsContainer.innerHTML = callHistory.map(h => `
        <span class="history-chip">
          <strong>${h.senha}</strong> <span style="font-size: 0.7rem; color: var(--text-muted);">${h.hora}</span>
        </span>
      `).join('');
    }

    // Tocar Áudio Hospitalar
    playHospitalChime();

    // Notificar Painel TV da Sala de Espera e outras abas
    callPatientInQueue(patient);

    // Atualizar UI
    updateTableUI(currentList, 'simulated_realtime');
    showToast(`🔔 SENHA ${patient.senha_painel} chamada para ${patient.leito}!`, 'success');
  }

  // Concluir Atendimento
  function finishPatient(patient) {
    currentList = currentList.filter(p => p.atendimento_id !== patient.atendimento_id);
    updateTableUI(currentList, 'simulated_realtime');
    showToast(`Atendimento da Senha ${patient.senha_painel} finalizado com sucesso!`, 'info');
  }

  // Modal de Prontuário Rápido com Sinais Vitais
  function openPatientModal(patient) {
    const containerEl = document.getElementById('patient-modal-container');
    if (!containerEl) return;

    const vitals = patient.vitals || {
      pa: '120/80 mmHg',
      fc: '78 bpm',
      temp: '36.6 °C',
      spo2: '98%'
    };

    containerEl.innerHTML = `
      <div class="saude-modal-overlay" id="patient-modal-overlay">
        <div class="saude-modal-card">
          <div class="saude-modal-header">
            <div class="saude-modal-title">
              <span>📋</span>
              <span>Prontuário de Triagem — Senha ${patient.senha_painel}</span>
            </div>
            <button class="saude-modal-close" id="btn-close-patient-modal">&times;</button>
          </div>

          <div class="saude-modal-body">
            <!-- Header do Paciente -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-subtle);">
              <div>
                <h4 style="font-size: 1.1rem; font-weight: 700; margin: 0;">
                  Paciente: ${patient.paciente_idade || '45'} anos, ${patient.paciente_sexo || 'M'} (${patient.municipio_origem || 'Ourinhos/SP'})
                </h4>
                <span style="font-size: 0.8rem; color: var(--text-muted);">
                  Chegada: ${formatDateTime(patient.data_hora_chegada)} | ID: ${patient.atendimento_id}
                </span>
              </div>
              <div>
                ${createManchesterBadge(patient.classificacao, patient.tempo_espera_real_min, patient.tempo_espera_max_min)}
              </div>
            </div>

            <!-- Sinais Vitais Aferidos -->
            <div>
              <span style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--brand-accent); letter-spacing: 0.04em;">
                Sinais Vitais na Entrada:
              </span>
              <div class="vitals-cards-grid" style="margin-top: 0.5rem;">
                <div class="vital-metric-card">
                  <div class="vital-label">Pressão Arterial</div>
                  <div class="vital-val">${vitals.pa}</div>
                </div>
                <div class="vital-metric-card">
                  <div class="vital-label">Freq. Cardíaca</div>
                  <div class="vital-val">${vitals.fc}</div>
                </div>
                <div class="vital-metric-card">
                  <div class="vital-label">Temperatura</div>
                  <div class="vital-val">${vitals.temp}</div>
                </div>
                <div class="vital-metric-card">
                  <div class="vital-label">Sat. O2 (SpO2)</div>
                  <div class="vital-val">${vitals.spo2}</div>
                </div>
              </div>
            </div>

            <!-- Queixa Clínica e Conduta -->
            <div style="background-color: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
              <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-primary);">
                🩺 Queixa Clínica Principal (Triagem Manchester):
              </span>
              <p style="margin: 0; font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5;">
                "${patient.sintoma_principal || 'Queixa clínica descrita pelo paciente na recepção.'}"
              </p>
            </div>

            <!-- Alocação e Conduta -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; font-size: 0.82rem;">
              <div style="padding: 0.75rem; background: var(--bg-surface-elevated); border-radius: 4px;">
                <span style="color: var(--text-muted); display: block;">Local de Atendimento:</span>
                <strong style="color: var(--text-primary); font-size: 0.95rem;">${patient.leito || 'Recepção / Box Geral'}</strong>
              </div>
              <div style="padding: 0.75rem; background: var(--bg-surface-elevated); border-radius: 4px;">
                <span style="color: var(--text-muted); display: block;">Plantonista Responsável:</span>
                <strong style="color: var(--text-primary); font-size: 0.95rem;">${patient.medico_plantonista || 'Dr. Plantão'}</strong>
              </div>
            </div>
          </div>

          <div class="saude-modal-footer">
            <button class="btn btn-secondary" id="btn-cancel-modal">Fechar</button>
            <button class="btn btn-primary" id="btn-modal-call">
              <span>🔔</span> Chamar para Consultório Agora
            </button>
          </div>
        </div>
      </div>
    `;

    const overlay = document.getElementById('patient-modal-overlay');
    const close = () => { containerEl.innerHTML = ''; };

    document.getElementById('btn-close-patient-modal')?.addEventListener('click', close);
    document.getElementById('btn-cancel-modal')?.addEventListener('click', close);
    document.getElementById('btn-modal-call')?.addEventListener('click', () => {
      close();
      triggerCallPatient(patient);
    });

    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
  }

  // Sincronização em Tempo Real (Firebase Firestore ou Fallback)
  unsubscribe = subscribeQueue(
    (items, mode) => {
      // Mesclar pacientes e manter ordenação
      updateTableUI(items, mode);
    },
    (err) => {
      console.warn('Fallback ativado na fila:', err);
    }
  );

  // --- BOTÕES DE SIMULAÇÃO HOSPITALAR ---

  // Botão 1: Inserir Paciente de Fluxo Geral (Distribuição Realista Ponderada)
  document.getElementById('btn-sim-random')?.addEventListener('click', () => {
    const novo = generatePatient(null);
    currentList.unshift(novo);
    addPatientToQueue(novo);
    updateTableUI(currentList, 'simulated_realtime');
    showToast(`Novo paciente na fila: ${novo.senha_painel} (${novo.classificacao.split(' - ')[0]})!`, 'info');
  });

  // Botão 2: Botões Coloridos Específicos por Manchester (Vermelho, Laranja, Amarelo, Verde, Azul)
  document.querySelectorAll('.btn-manchester[data-color]').forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.getAttribute('data-color');
      const novo = generatePatient(color);
      currentList.unshift(novo);
      addPatientToQueue(novo);
      updateTableUI(currentList, 'simulated_realtime');
      const info = getManchesterInfo(novo.classificacao);
      showToast(`${info.icon} Paciente ${novo.senha_painel} (${info.label}) inserido na fila!`, 'info');
    });
  });

  // Botão 3: Chamar Próximo Paciente da Fila (Prioridade Máxima)
  document.getElementById('btn-call-next')?.addEventListener('click', () => {
    const sorted = sortQueue(currentList);
    const waiting = sorted.find(p => !p.status?.includes('Chamado') && !p.status?.includes('Atendimento'));
    if (waiting) {
      triggerCallPatient(waiting);
    } else if (sorted.length > 0) {
      triggerCallPatient(sorted[0]);
    } else {
      showToast('Nenhum paciente aguardando na fila.', 'info');
    }
  });

  // Botão 4: Auto-Play Contínuo (Simula vida hospitalar a cada 5s)
  const btnAutoPlay = document.getElementById('btn-toggle-autoplay');
  const autoPlayIcon = document.getElementById('autoplay-icon');
  const autoPlayText = document.getElementById('autoplay-text');

  btnAutoPlay?.addEventListener('click', () => {
    if (autoPlayTimer) {
      // Pausar
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
      btnAutoPlay.classList.remove('active');
      autoPlayIcon.textContent = '▶️';
      autoPlayText.textContent = 'Simulação Automática (Auto-Play)';
      showToast('Simulação contínua pausada.', 'info');
    } else {
      // Iniciar
      btnAutoPlay.classList.add('active');
      autoPlayIcon.textContent = '⏸️';
      autoPlayText.textContent = 'Auto-Play Ativo (5s)';
      showToast('Simulação automática hospitalar ATIVADA!', 'success');

      autoPlayTimer = setInterval(() => {
        // 1. Incrementar tempo de espera dos pacientes
        currentList.forEach(p => {
          if (!p.status?.includes('Chamado') && !p.status?.includes('Atendimento')) {
            p.tempo_espera_real_min = (Number(p.tempo_espera_real_min) || 0) + 1;
          }
        });

        // 2. 45% de chance de chegada de novo paciente aleatório
        if (Math.random() < 0.45) {
          const novo = generatePatient(null);
          currentList.unshift(novo);
          showToast(`⚡ Nova entrada: ${novo.senha_painel} (${novo.classificacao.split(' - ')[0]})`, 'info');
        }

        // 3. 50% de chance de consultório chamar próximo
        if (Math.random() < 0.50) {
          const sorted = sortQueue(currentList);
          const next = sorted.find(p => !p.status?.includes('Chamado') && !p.status?.includes('Atendimento'));
          if (next) {
            triggerCallPatient(next);
          }
        }

        updateTableUI(currentList, 'simulated_realtime');
      }, 5000);
    }
  });

  // --- FILTROS DE MANCHESTER E BUSCA ---
  const filterPills = document.querySelectorAll('#filter-pills-container .filter-pill');
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilterColor = pill.getAttribute('data-filter');
      updateTableUI(currentList);
    });
  });

  const searchInput = document.getElementById('queue-search-input');
  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    updateTableUI(currentList);
  });

  document.getElementById('btn-clear-queue-search')?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    searchQuery = '';
    updateTableUI(currentList);
  });

  // Cleanup ao trocar de página
  return () => {
    if (unsubscribe) unsubscribe();
    if (autoPlayTimer) clearInterval(autoPlayTimer);
  };
}
