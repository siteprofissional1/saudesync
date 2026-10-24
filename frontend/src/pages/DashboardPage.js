/**
 * SAÚDE SYNC — Página de Visão Geral (Dashboard Operacional)
 */

import { api } from '../services/api.js';
import { formatMinutes } from '../utils/formatters.js';
import { renderPlotlyChart } from '../components/PlotlyWrapper.js';
import { showToast } from '../components/Toast.js';

export async function renderDashboard(container) {
  container.innerHTML = `
    <!-- Card de Boas-Vindas e Ajuda Rápida -->
    <div style="background: linear-gradient(135deg, rgba(2, 132, 199, 0.12) 0%, rgba(3, 105, 161, 0.08) 100%); border: 1px solid rgba(2, 132, 199, 0.3); border-radius: var(--radius-lg); padding: 1rem 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span style="font-size: 1.5rem;">📊</span>
        <div>
          <strong style="font-size: 0.95rem; color: var(--text-primary); display: block;">Painel Gerencial de Triagem e Capacidade Hospitalar</strong>
          <span style="font-size: 0.82rem; color: var(--text-secondary);">
            Visão consolidada do fluxo de pacientes. Use os filtros abaixo para explorar tempos de espera e distribuição de gravidade em tempo real.
          </span>
        </div>
      </div>
      <a href="#queue" class="btn btn-primary" style="font-size: 0.82rem; padding: 0.45rem 0.9rem; text-decoration: none;">
        <span>🔔</span> Ir para Fila ao Vivo
      </a>
    </div>

    <!-- Barra de Filtros Globais -->
    <section class="filter-bar-card" aria-label="Filtros Globais de Análise">
      <form id="dashboard-filter-form" class="filter-grid">
        <div class="filter-group">
          <label for="filter-classificacao">Prioridade Manchester</label>
          <select id="filter-classificacao" class="filter-control">
            <option value="">Todas as Classificações</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="filter-municipio">Município</label>
          <select id="filter-municipio" class="filter-control">
            <option value="">Todos os Municípios</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="filter-especialidade">Especialidade</label>
          <select id="filter-especialidade" class="filter-control">
            <option value="">Todas as Especialidades</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="filter-status">Status</label>
          <select id="filter-status" class="filter-control">
            <option value="">Todos os Status</option>
          </select>
        </div>

        <div class="filter-group" style="display: flex; gap: 0.5rem; align-items: flex-end;">
          <button type="submit" class="btn btn-primary" style="flex: 1;">
            <span>🔍</span> Filtrar
          </button>
          <button type="button" id="btn-clear-filters" class="btn btn-secondary" title="Limpar Filtros">
            Limpar
          </button>
        </div>
      </form>
    </section>

    <!-- Grid de KPIs Operacionais Centrais -->
    <section id="kpi-container" class="kpi-grid">
      <div class="kpi-card accent-blue">
        <div class="kpi-card-header">
          <span class="kpi-title">Total de Atendimentos</span>
          <span class="kpi-icon">📋</span>
        </div>
        <div id="kpi-total" class="kpi-value">--</div>
        <div id="kpi-periodo" class="kpi-subtitle">Base histórica completa</div>
      </div>

      <div class="kpi-card accent-cyan">
        <div class="kpi-card-header">
          <span class="kpi-title">Aguardando na Fila</span>
          <span class="kpi-icon">⏳</span>
        </div>
        <div id="kpi-fila" class="kpi-value">--</div>
        <div class="kpi-subtitle">Pacientes em espera ou triagem</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-title">Tempo Médio de Espera</span>
          <span class="kpi-icon">⏱️</span>
        </div>
        <div id="kpi-tempo-medio" class="kpi-value">--</div>
        <div id="kpi-p90" class="kpi-subtitle">P90: calculando...</div>
      </div>

      <div class="kpi-card accent-red">
        <div class="kpi-card-header">
          <span class="kpi-title">Tempo Excedido</span>
          <span class="kpi-icon">⚠️</span>
        </div>
        <div id="kpi-excedidos" class="kpi-value">--</div>
        <div id="kpi-taxa-excedida" class="kpi-subtitle">Acima da meta Manchester</div>
      </div>
    </section>

    <!-- Grid com os Gráficos Plotly.js -->
    <section class="charts-grid">
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Distribuição Manchester</h3>
        </div>
        <div id="chart-container-manchester" class="chart-container"></div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Tempo Médio Real vs Limite (min)</h3>
        </div>
        <div id="chart-container-tempo" class="chart-container"></div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Status dos Atendimentos</h3>
        </div>
        <div id="chart-container-status" class="chart-container"></div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Volume por Faixa Horária (24h)</h3>
        </div>
        <div id="chart-container-horario" class="chart-container"></div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Sintomas Mais Recorrentes</h3>
        </div>
        <div id="chart-container-sintomas" class="chart-container"></div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Volume por Município</h3>
        </div>
        <div id="chart-container-municipios" class="chart-container"></div>
      </div>

      <div class="chart-card full-width">
        <div class="chart-header">
          <h3 class="chart-title">Evolução Histórica Diária de Atendimentos</h3>
        </div>
        <div id="chart-container-evolucao" class="chart-container"></div>
      </div>
    </section>
  `;

  // Carregar filtros disponíveis
  try {
    const filters = await api.getFilters();
    populateSelect('filter-classificacao', filters.classificacoes);
    populateSelect('filter-municipio', filters.municipios);
    populateSelect('filter-especialidade', filters.especialidades);
    populateSelect('filter-status', filters.status_atendimento);
  } catch (err) {
    console.warn('Erro ao carregar opções de filtro:', err);
  }

  // Função interna para atualizar dashboard
  async function loadDashboardData(filterParams = {}) {
    try {
      // 1. Carregar KPIs
      const summary = await api.getSummary(filterParams);
      document.getElementById('kpi-total').textContent = summary.total_atendimentos.toLocaleString('pt-BR');
      document.getElementById('kpi-fila').textContent = summary.aguardando_fila.toLocaleString('pt-BR');
      document.getElementById('kpi-tempo-medio').textContent = formatMinutes(summary.tempo_medio_espera_min);
      document.getElementById('kpi-p90').textContent = `Mediana: ${summary.tempo_mediano_espera_min} min | P90: ${summary.p90_espera_min} min`;
      document.getElementById('kpi-excedidos').textContent = `${summary.acima_tempo_referencia} (${summary.percentual_acima_tempo}%)`;
      document.getElementById('kpi-taxa-excedida').textContent = `${summary.dentro_tempo_referencia} dentro da meta (${summary.percentual_dentro_tempo}%)`;
      if (summary.periodo_inicio !== 'N/A') {
        document.getElementById('kpi-periodo').textContent = `Período: ${summary.periodo_inicio} a ${summary.periodo_fim}`;
      }

      // 2. Carregar e Renderizar Gráficos Plotly
      const charts = await api.getCharts(filterParams);
      if (charts.distribuicao_manchester) renderPlotlyChart('chart-container-manchester', charts.distribuicao_manchester);
      if (charts.tempo_real_vs_limite) renderPlotlyChart('chart-container-tempo', charts.tempo_real_vs_limite);
      if (charts.status_atendimento) renderPlotlyChart('chart-container-status', charts.status_atendimento);
      if (charts.volume_por_horario) renderPlotlyChart('chart-container-horario', charts.volume_por_horario);
      if (charts.sintomas_mais_frequentes) renderPlotlyChart('chart-container-sintomas', charts.sintomas_mais_frequentes);
      if (charts.volume_por_municipio) renderPlotlyChart('chart-container-municipios', charts.volume_por_municipio);
      if (charts.evolucao_temporal) renderPlotlyChart('chart-container-evolucao', charts.evolucao_temporal);
    } catch (e) {
      showToast('Erro ao sincronizar dados do dashboard com a API.', 'error');
    }
  }

  // Listener do Formulário de Filtros
  const form = document.getElementById('dashboard-filter-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const params = {
      classificacao: document.getElementById('filter-classificacao').value,
      municipio: document.getElementById('filter-municipio').value,
      especialidade: document.getElementById('filter-especialidade').value,
      status: document.getElementById('filter-status').value
    };
    loadDashboardData(params);
    showToast('Filtros aplicados com sucesso!', 'info');
  });

  document.getElementById('btn-clear-filters')?.addEventListener('click', () => {
    form.reset();
    loadDashboardData({});
    showToast('Filtros redefinidos para a base completa.', 'info');
  });

  // Re-renderizar gráficos se o tema mudar
  const themeHandler = () => {
    const params = {
      classificacao: document.getElementById('filter-classificacao')?.value,
      municipio: document.getElementById('filter-municipio')?.value,
      especialidade: document.getElementById('filter-especialidade')?.value,
      status: document.getElementById('filter-status')?.value
    };
    loadDashboardData(params);
  };
  window.addEventListener('themeChanged', themeHandler);

  // Carga inicial
  await loadDashboardData();
}

function populateSelect(id, items = []) {
  const el = document.getElementById(id);
  if (!el) return;
  items.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item;
    opt.textContent = item;
    el.appendChild(opt);
  });
}
