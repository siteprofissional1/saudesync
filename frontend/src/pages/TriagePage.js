/**
 * SAÚDE SYNC — Página de Triagem Simulada (RAG Local & Explicabilidade)
 */

import { api } from '../services/api.js';
import { createManchesterBadge } from '../components/ManchesterBadge.js';
import { showToast } from '../components/Toast.js';
import { addPatientToQueue } from '../services/firebase.js';

export async function renderTriage(container) {
  container.innerHTML = `
    <!-- Banner Explicativo e Interativo -->
    <div style="background: linear-gradient(135deg, rgba(2, 132, 199, 0.12) 0%, rgba(3, 105, 161, 0.08) 100%); border: 1px solid rgba(2, 132, 199, 0.3); border-radius: var(--radius-lg); padding: 1rem 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span style="font-size: 1.5rem;">💡</span>
        <div>
          <strong style="font-size: 0.92rem; color: var(--text-primary); display: block;">Dica de Demonstração Interativa (RAG Local):</strong>
          <span style="font-size: 0.82rem; color: var(--text-secondary);">
            Clique em um dos 5 cenários coloridos abaixo para preencher os sinais vitais instantaneamente e clique em <em>'Classificar Paciente com RAG Local'</em> para ver a IA justificando a prioridade clínica!
          </span>
        </div>
      </div>
    </div>

    <!-- Barra de Cenários Pré-configurados para Demonstração (Todos os 5 Níveis Manchester) -->
    <div class="quick-scenario-bar" style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem;">
      <span style="font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">
        🎯 Cenários Pré-Configurados por Gravidade:
      </span>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
        <button type="button" id="btn-scenario-red" class="btn-manchester red" style="font-size: 0.8rem; padding: 0.45rem 0.85rem;">
          🚨 Vermelho: Dor Torácica / IAM
        </button>
        <button type="button" id="btn-scenario-orange" class="btn-manchester orange" style="font-size: 0.8rem; padding: 0.45rem 0.85rem;">
          ⚠️ Laranja: Crise Hipertensiva 210/120
        </button>
        <button type="button" id="btn-scenario-yellow" class="btn-manchester yellow" style="font-size: 0.8rem; padding: 0.45rem 0.85rem;">
          ⚡ Amarelo: Dengue / Febre Alta
        </button>
        <button type="button" id="btn-scenario-green" class="btn-manchester green" style="font-size: 0.8rem; padding: 0.45rem 0.85rem;">
          🟢 Verde: Sintomas Gripais Leves
        </button>
        <button type="button" id="btn-scenario-blue" class="btn-manchester blue" style="font-size: 0.8rem; padding: 0.45rem 0.85rem;">
          🔵 Azul: Renovação de Receita
        </button>
      </div>
    </div>

    <div class="triage-container">
      <!-- Formulário de Entrada Clínico-Demográfica -->
      <div class="triage-form-card">
        <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem;">Entrada de Dados da Triagem</h3>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1.25rem;">
          Insira os sinais vitais e a queixa do paciente para minerar casos análogos na base histórica.
        </p>

        <form id="triage-form">
          <div class="filter-group" style="margin-bottom: 0.85rem;">
            <label for="input-nome">Nome Completo do Paciente</label>
            <input type="text" id="input-nome" class="filter-control" placeholder="Ex: Carlos Eduardo da Silva" value="Carlos Eduardo da Silva" required />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; margin-bottom: 0.85rem;">
            <div class="filter-group">
              <label for="input-idade">Idade (anos)</label>
              <input type="number" id="input-idade" class="filter-control" min="0" max="120" value="35" required />
            </div>
            <div class="filter-group">
              <label for="input-sexo">Sexo</label>
              <select id="input-sexo" class="filter-control" required>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>
          </div>

          <div class="filter-group" style="margin-bottom: 0.85rem;">
            <label for="input-municipio">Município de Origem</label>
            <select id="input-municipio" class="filter-control" required></select>
          </div>

          <div class="filter-group" style="margin-bottom: 0.85rem;">
            <label for="input-sintoma">Sintoma Principal / Queixa</label>
            <select id="input-sintoma" class="filter-control" required></select>
          </div>

          <div class="filter-group" style="margin-bottom: 1.25rem;">
            <label for="input-comorbidades">Comorbidades Declaradas</label>
            <input type="text" id="input-comorbidades" class="filter-control" value="Nenhuma declarada" />
          </div>

          <!-- Sinais Vitais -->
          <h4 style="font-size: 0.9rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 0.5rem; letter-spacing: 0.04em;">
            Sinais Vitais e Escala de Dor
          </h4>

          <div class="vitals-grid">
            <div class="filter-group">
              <label for="input-pa-sistolica">PA Sistólica (mmHg)</label>
              <input type="number" id="input-pa-sistolica" class="filter-control" min="50" max="260" value="120" required />
            </div>
            <div class="filter-group">
              <label for="input-pa-diastolica">PA Diastólica (mmHg)</label>
              <input type="number" id="input-pa-diastolica" class="filter-control" min="30" max="150" value="80" required />
            </div>
            <div class="filter-group">
              <label for="input-fc">Freq. Cardíaca (BPM)</label>
              <input type="number" id="input-fc" class="filter-control" min="30" max="220" value="78" required />
            </div>
            <div class="filter-group">
              <label for="input-temp">Temperatura (°C)</label>
              <input type="number" step="0.1" id="input-temp" class="filter-control" min="33" max="43" value="36.8" required />
            </div>
            <div class="filter-group">
              <label for="input-spo2">Saturação O₂ (%)</label>
              <input type="number" id="input-spo2" class="filter-control" min="40" max="100" value="98" required />
            </div>
            <div class="filter-group">
              <label for="input-glicemia">Glicemia (mg/dL)</label>
              <input type="number" id="input-glicemia" class="filter-control" min="20" max="600" value="95" required />
            </div>
          </div>

          <div class="filter-group" style="margin-top: 1rem; margin-bottom: 1.5rem;">
            <label for="input-dor" style="display: flex; justify-content: space-between;">
              <span>Escala de Dor Referida (0 a 10)</span>
              <strong id="val-dor-display" style="color: var(--brand-accent);">3</strong>
            </label>
            <input type="range" id="input-dor" min="0" max="10" value="3" style="width: 100%; accent-color: var(--brand-primary);" />
          </div>

          <button type="submit" id="btn-submit-triage" class="btn btn-primary" style="width: 100%;">
            <span>⚡</span> Executar Simulação por Similaridade Histórica
          </button>
        </form>
      </div>

      <!-- Card de Resultado da Simulação -->
      <div id="triage-result-container" class="triage-result-card">
        <div class="state-container" style="padding: 4rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.7;">🩺</div>
          <h4 style="color: var(--text-primary); font-size: 1.1rem;">Pronto para Simulação</h4>
          <p style="color: var(--text-muted); font-size: 0.88rem; max-width: 380px;">
            Preencha os dados ou selecione um dos cenários rápidos no topo para recuperar os casos mais próximos do dataset.
          </p>
        </div>
      </div>
    </div>
  `;

  // Carregar listas para selects
  try {
    const filters = await api.getFilters();
    populateSelect('input-municipio', filters.municipios, 'Ourinhos');
    populateSelect('input-sintoma', filters.sintomas, filters.sintomas[0]);
  } catch (err) {
    console.warn('Erro ao carregar opções de triagem:', err);
  }

  // Atualização em tempo real do slider de dor
  const dorSlider = document.getElementById('input-dor');
  const dorDisplay = document.getElementById('val-dor-display');
  dorSlider?.addEventListener('input', (e) => {
    if (dorDisplay) dorDisplay.textContent = e.target.value;
  });

  // Função para aplicar dados de um cenário no form
  function applyScenario(data) {
    document.getElementById('input-nome').value = data.paciente_nome || 'Paciente Demonstrativo';
    document.getElementById('input-idade').value = data.paciente_idade;
    document.getElementById('input-sexo').value = data.paciente_sexo;
    document.getElementById('input-municipio').value = data.municipio_origem;
    document.getElementById('input-sintoma').value = data.sintoma_principal;
    document.getElementById('input-comorbidades').value = data.comorbidades;
    document.getElementById('input-pa-sistolica').value = data.pressao_sistolica_mmhg;
    document.getElementById('input-pa-diastolica').value = data.pressao_diastolica_mmhg;
    document.getElementById('input-fc').value = data.frequencia_cardiaca_bpm;
    document.getElementById('input-temp').value = data.temperatura_axilar_c;
    document.getElementById('input-spo2').value = data.saturacao_o2_percent;
    document.getElementById('input-glicemia').value = data.glicemia_capilar_mg_dl;
    document.getElementById('input-dor').value = data.escala_dor_0_10;
    if (dorDisplay) dorDisplay.textContent = data.escala_dor_0_10;
    showToast(`Cenário de ${data.paciente_nome} carregado no formulário!`, 'info');
  }

  // Perfis de Cenários Completos de Manchester para Teste Instantâneo
  const SCENARIOS = {
    red: {
      paciente_nome: 'Carlos Eduardo da Silva',
      paciente_idade: 62, paciente_sexo: 'M', municipio_origem: 'Ourinhos',
      sintoma_principal: 'Dor no peito com irradiação para o braço esquerdo',
      comorbidades: 'Hipertensão, Diabetes Tipo 2',
      pressao_sistolica_mmhg: 85, pressao_diastolica_mmhg: 55,
      frequencia_cardiaca_bpm: 124, temperatura_axilar_c: 36.2,
      saturacao_o2_percent: 89, glicemia_capilar_mg_dl: 165, escala_dor_0_10: 9
    },
    orange: {
      paciente_nome: 'Maria Aparecida dos Santos',
      paciente_idade: 48, paciente_sexo: 'F', municipio_origem: 'Ourinhos',
      sintoma_principal: 'Cefaleia intensa súbita',
      comorbidades: 'Hipertensão arterial não controlada',
      pressao_sistolica_mmhg: 210, pressao_diastolica_mmhg: 120,
      frequencia_cardiaca_bpm: 104, temperatura_axilar_c: 37.1,
      saturacao_o2_percent: 96, glicemia_capilar_mg_dl: 140, escala_dor_0_10: 8
    },
    yellow: {
      paciente_nome: 'Lucas Ferreira Lima',
      paciente_idade: 35, paciente_sexo: 'M', municipio_origem: 'Ourinhos',
      sintoma_principal: 'Febre alta persistente',
      comorbidades: 'Nenhuma comorbidade prévia',
      pressao_sistolica_mmhg: 110, pressao_diastolica_mmhg: 70,
      frequencia_cardiaca_bpm: 98, temperatura_axilar_c: 39.4,
      saturacao_o2_percent: 97, glicemia_capilar_mg_dl: 95, escala_dor_0_10: 7
    },
    green: {
      paciente_nome: 'Juliana Mendes Castro',
      paciente_idade: 28, paciente_sexo: 'F', municipio_origem: 'Ourinhos',
      sintoma_principal: 'Tosse e coriza',
      comorbidades: 'Nenhuma',
      pressao_sistolica_mmhg: 120, pressao_diastolica_mmhg: 80,
      frequencia_cardiaca_bpm: 78, temperatura_axilar_c: 37.4,
      saturacao_o2_percent: 98, glicemia_capilar_mg_dl: 90, escala_dor_0_10: 3
    },
    blue: {
      paciente_nome: 'Roberto Alves de Souza',
      paciente_idade: 52, paciente_sexo: 'M', municipio_origem: 'Ourinhos',
      sintoma_principal: 'Renovação de receita médica',
      comorbidades: 'Hipertensão controlada',
      pressao_sistolica_mmhg: 125, pressao_diastolica_mmhg: 80,
      frequencia_cardiaca_bpm: 72, temperatura_axilar_c: 36.5,
      saturacao_o2_percent: 99, glicemia_capilar_mg_dl: 98, escala_dor_0_10: 0
    }
  };

  document.getElementById('btn-scenario-red')?.addEventListener('click', () => applyScenario(SCENARIOS.red));
  document.getElementById('btn-scenario-orange')?.addEventListener('click', () => applyScenario(SCENARIOS.orange));
  document.getElementById('btn-scenario-yellow')?.addEventListener('click', () => applyScenario(SCENARIOS.yellow));
  document.getElementById('btn-scenario-green')?.addEventListener('click', () => applyScenario(SCENARIOS.green));
  document.getElementById('btn-scenario-blue')?.addEventListener('click', () => applyScenario(SCENARIOS.blue));

  // Submissão do formulário
  const form = document.getElementById('triage-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const resultBox = document.getElementById('triage-result-container');
    resultBox.innerHTML = `
      <div class="state-container">
        <div class="spinner"></div>
        <p>Minerando casos semelhantes e calculando vizinhança clínica...</p>
      </div>
    `;

    const payload = {
      paciente_nome: document.getElementById('input-nome').value.trim() || 'Paciente Demonstrativo',
      paciente_idade: Number(document.getElementById('input-idade').value),
      paciente_sexo: document.getElementById('input-sexo').value,
      municipio_origem: document.getElementById('input-municipio').value,
      sintoma_principal: document.getElementById('input-sintoma').value,
      comorbidades: document.getElementById('input-comorbidades').value,
      pressao_sistolica_mmhg: Number(document.getElementById('input-pa-sistolica').value),
      pressao_diastolica_mmhg: Number(document.getElementById('input-pa-diastolica').value),
      frequencia_cardiaca_bpm: Number(document.getElementById('input-fc').value),
      temperatura_axilar_c: Number(document.getElementById('input-temp').value),
      saturacao_o2_percent: Number(document.getElementById('input-spo2').value),
      glicemia_capilar_mg_dl: Number(document.getElementById('input-glicemia').value),
      escala_dor_0_10: Number(document.getElementById('input-dor').value)
    };

    try {
      const res = await api.simulateTriage(payload);
      renderTriageResult(resultBox, res, payload);
      showToast(`Triagem de ${payload.paciente_nome} calculada com sucesso!`, 'success');
    } catch (err) {
      resultBox.innerHTML = `
        <div class="error-banner">
          <span>❌</span>
          <span>Erro ao processar simulação: ${err.message}</span>
        </div>
      `;
    }
  });
}


function renderTriageResult(container, res, inputPayload = {}) {
  const nomePaciente = inputPayload.paciente_nome || res.paciente_nome || 'Paciente Demonstrativo';

  container.innerHTML = `
    <div style="border-bottom: 1px solid var(--border-subtle); padding-bottom: 1rem; margin-bottom: 1.25rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
        <span style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em;">
          Classificação Acadêmica Demonstrativa
        </span>
        <span style="font-size: 0.92rem; font-weight: 700; color: var(--brand-accent); background: var(--bg-surface-elevated); padding: 0.25rem 0.65rem; border-radius: 4px; border: 1px solid var(--border-subtle);">
          👤 ${nomePaciente}
        </span>
      </div>
      <div style="margin-top: 0.5rem;">
        ${createManchesterBadge(res.classificacao_sugerida)}
      </div>
      <div style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 0.5rem;">
        Tempo de Referência Máximo: <strong>${res.tempo_referencia_max_min} minutos</strong>
        | Concordância Estatística: <strong style="color: var(--brand-accent);">${res.confianca_estatistica_pct}%</strong>
      </div>
    </div>

    <!-- Botão de Ação Direta: Encaminhar para a Fila Realtime -->
    <div style="margin-bottom: 1.5rem; padding: 1.1rem; background: linear-gradient(135deg, rgba(2, 132, 199, 0.12) 0%, rgba(3, 105, 161, 0.06) 100%); border: 1px solid var(--brand-accent); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 0.6rem;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">
          ⚡ Concluir Triagem & Encaminhar para Atendimento:
        </span>
      </div>
      <button type="button" id="btn-triage-send-queue" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 0.75rem 1.25rem; font-size: 0.92rem; font-weight: 700;">
        <span>➕</span> Encaminhar ${nomePaciente} para a Fila em Tempo Real Agora
      </button>
      <span style="font-size: 0.75rem; color: var(--text-muted);">
        A senha será gerada e sincronizada instantaneamente na Fila Ativa e no Telão de TV da sala de espera.
      </span>
    </div>

    <!-- Explicabilidade Baseada em Casos -->
    <div style="background-color: var(--bg-surface-elevated); padding: 1rem 1.25rem; border-radius: var(--radius-md); border-left: 3px solid var(--brand-primary); margin-bottom: 1.5rem;">
      <h4 style="font-size: 0.88rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-primary);">
        🧠 Explicabilidade do Modelo (RAG Local):
      </h4>
      <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
        ${res.explicabilidade}
      </p>
    </div>

    <!-- Amostra de Casos Análogos no Dataset -->
    <h4 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 0.75rem; letter-spacing: 0.03em;">
      Casos Históricos Mais Próximos Identificados:
    </h4>

    <div class="similar-cases-list">
      ${res.casos_similares.map(caso => `
        <div class="similar-case-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
            <span class="ticket-cell" style="font-size: 0.85rem;">${caso.atendimento_id}</span>
            ${createManchesterBadge(caso.classificacao_manchester)}
          </div>
          <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem;">
            ${caso.sintoma_principal}
          </div>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.4rem;">
            Tempo real de espera registrado: ${caso.tempo_espera_real_min} min | Especialidade: ${caso.especialidade_requerida}
          </div>
          <div style="background: var(--bg-canvas); padding: 0.45rem 0.65rem; border-radius: 4px; font-size: 0.78rem; color: var(--text-secondary); border: 1px solid var(--border-subtle);">
            <strong>Conduta registrada no conjunto de dados simulado:</strong> ${caso.conduta_historica_simulada}
          </div>
        </div>
      `).join('')}
    </div>

    <div style="margin-top: 1.5rem; font-size: 0.75rem; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 0.75rem;">
      <em>* ${res.disclaimer}</em>
    </div>
  `;

  // Listener para Encaminhar à Fila
  document.getElementById('btn-triage-send-queue')?.addEventListener('click', () => {
    const cor = res.classificacao_sugerida || '';
    let prefix = 'A-';
    let leito = 'Consultório 03';
    if (cor.includes('Vermelho')) { prefix = 'E-'; leito = 'Sala Vermelha 01'; }
    else if (cor.includes('Laranja')) { prefix = 'U-'; leito = 'Observação Rápida 01'; }
    else if (cor.includes('Amarelo')) { prefix = 'A-'; leito = 'Consultório 03'; }
    else if (cor.includes('Verde')) { prefix = 'P-'; leito = 'Consultório 02'; }
    else if (cor.includes('Azul')) { prefix = 'N-'; leito = 'Ambulatório 01'; }

    const num = Math.floor(100 + Math.random() * 899);
    const senha = `${prefix}${num}`;

    const newPatient = {
      atendimento_id: `ATD-TRG-${Date.now()}-${num}`,
      senha_painel: senha,
      paciente_nome: nomePaciente,
      paciente_idade: inputPayload.paciente_idade || 35,
      paciente_sexo: inputPayload.paciente_sexo || 'M',
      municipio_origem: inputPayload.municipio_origem || 'Ourinhos',
      sintoma_principal: inputPayload.sintoma_principal || 'Queixa triada via RAG',
      classificacao: res.classificacao_sugerida,
      tempo_espera_real_min: 0,
      tempo_espera_max_min: res.tempo_referencia_max_min || 60,
      especialidade: res.especialidade_mais_frequente || 'Clínica Geral',
      medico_plantonista: 'Dr. Plantonista Escala',
      leito: leito,
      vitals: {
        pa: `${inputPayload.pressao_sistolica_mmhg || 120}/${inputPayload.pressao_diastolica_mmhg || 80} mmHg`,
        fc: `${inputPayload.frequencia_cardiaca_bpm || 78} bpm`,
        temp: `${inputPayload.temperatura_axilar_c || 36.8} °C`,
        spo2: `${inputPayload.saturacao_o2_percent || 98}%`
      },
      data_hora_chegada: new Date().toISOString(),
      status: 'Aguardando na Fila'
    };

    addPatientToQueue(newPatient);
    showToast(`✅ Paciente ${nomePaciente} inserido na Fila com Senha ${senha}!`, 'success');

    // Desabilitar botão após envio para evitar duplicidade
    const btnSend = document.getElementById('btn-triage-send-queue');
    if (btnSend) {
      btnSend.disabled = true;
      btnSend.innerHTML = `<span>✔️</span> Encaminhado com Sucesso! Senha: <strong>${senha}</strong>`;
      btnSend.style.backgroundColor = 'var(--manchester-verde)';
      btnSend.style.borderColor = 'var(--manchester-verde)';
    }
  });
}


function populateSelect(id, items = [], defaultVal = '') {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = '';
  items.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item;
    opt.textContent = item;
    if (item === defaultVal) opt.selected = true;
    el.appendChild(opt);
  });
}
