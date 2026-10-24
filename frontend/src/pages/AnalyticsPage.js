/**
 * SAÚDE SYNC — Página de Analytics e Exploração Paginada do Dataset
 */

import { api } from '../services/api.js';
import { createManchesterBadge } from '../components/ManchesterBadge.js';
import { formatDateTime } from '../utils/formatters.js';
import { showToast } from '../components/Toast.js';

export async function renderAnalytics(container) {
  let currentPage = 1;
  let pageSize = 20;
  let totalPages = 1;
  let currentFilters = {};

  container.innerHTML = `
    <!-- Barra de Controles e Filtros de Pesquisa -->
    <div class="filter-bar-card" style="margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <h3 style="font-size: 1.15rem; font-weight: 700;">Exploração do Dataset Histórico (1.200 Registros)</h3>
          <span style="font-size: 0.8rem; color: var(--text-muted);">
            Tabela paginada e ordenável para mineração analítica de atendimentos
          </span>
        </div>
        <button id="btn-export-csv" class="btn btn-secondary" title="Exportar resultado atual para planilha">
          <span>📥</span> Exportar CSV
        </button>
      </div>

      <div class="filter-grid" style="grid-template-columns: 2fr 1fr 1fr auto;">
        <div class="filter-group">
          <label for="search-sintoma">Buscar por Sintoma / Queixa</label>
          <input type="text" id="search-sintoma" class="filter-control" placeholder="Digite uma queixa ou sintoma (ex: Febre, Dor, Coriza)..." />
        </div>

        <div class="filter-group">
          <label for="analytics-filter-classificacao">Classificação</label>
          <select id="analytics-filter-classificacao" class="filter-control">
            <option value="">Todas</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="analytics-filter-municipio">Município</label>
          <select id="analytics-filter-municipio" class="filter-control">
            <option value="">Todos</option>
          </select>
        </div>

        <div class="filter-group" style="display: flex; align-items: flex-end;">
          <button id="btn-apply-analytics-filter" class="btn btn-primary">
            <span>🔍</span> Filtrar
          </button>
        </div>
      </div>
    </div>

    <!-- Tabela Responsiva de Atendimentos -->
    <div class="table-responsive-wrapper">
      <table class="saude-table" id="analytics-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Data/Hora</th>
            <th>Senha</th>
            <th>Idade/Sexo</th>
            <th>Município</th>
            <th>Sintoma Principal</th>
            <th>Manchester</th>
            <th>Tempo Real / Limite</th>
            <th>Especialidade</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody id="analytics-table-body">
          <tr>
            <td colspan="10" style="text-align: center; padding: 2.5rem;">
              <div class="spinner" style="margin: 0 auto 1rem;"></div>
              <span>Carregando registros do dataset...</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Controles de Paginação -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem; flex-wrap: wrap; gap: 1rem;">
      <div style="font-size: 0.85rem; color: var(--text-muted);" id="pagination-info">
        Exibindo página 1...
      </div>

      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <label for="select-page-size" style="font-size: 0.85rem; color: var(--text-muted);">Itens por página:</label>
        <select id="select-page-size" class="filter-control" style="width: auto; padding: 0.35rem 0.65rem;">
          <option value="10">10</option>
          <option value="20" selected>20</option>
          <option value="50">50</option>
        </select>

        <button id="btn-prev-page" class="btn btn-secondary" style="padding: 0.4rem 0.85rem;" disabled>
          ◀ Anterior
        </button>
        <button id="btn-next-page" class="btn btn-secondary" style="padding: 0.4rem 0.85rem;">
          Próxima ▶
        </button>
      </div>
    </div>
  `;

  // Carregar opções de filtro
  try {
    const filters = await api.getFilters();
    populateSelect('analytics-filter-classificacao', filters.classificacoes);
    populateSelect('analytics-filter-municipio', filters.municipios);
  } catch (err) {
    console.warn('Erro ao popular filtros de analytics:', err);
  }

  // Função para buscar e renderizar a página
  async function loadPage(page = 1) {
    currentPage = page;
    const tbody = document.getElementById('analytics-table-body');
    if (!tbody) return;

    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 2rem;">
          <div class="spinner" style="margin: 0 auto 0.5rem; width: 32px; height: 32px;"></div>
          <span>Buscando registros...</span>
        </td>
      </tr>
    `;

    try {
      const data = await api.getAnalytics({
        page: currentPage,
        page_size: pageSize,
        ...currentFilters
      });

      totalPages = data.total_pages || 1;
      document.getElementById('pagination-info').textContent = 
        `Página ${data.page} de ${totalPages} (Total de ${data.total.toLocaleString('pt-BR')} registros)`;

      document.getElementById('btn-prev-page').disabled = currentPage <= 1;
      document.getElementById('btn-next-page').disabled = currentPage >= totalPages;

      if (!data.records || data.records.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="10" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
              Nenhum registro encontrado para os filtros selecionados.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = data.records.map(row => `
        <tr>
          <td style="font-family: monospace; font-size: 0.82rem; color: var(--brand-accent);">${row.atendimento_id}</td>
          <td style="font-size: 0.8rem; color: var(--text-muted);">${formatDateTime(row.data_hora_chegada)}</td>
          <td class="ticket-cell" style="font-size: 0.9rem;">${row.senha_painel}</td>
          <td>${row.paciente_idade} anos (${row.paciente_sexo})</td>
          <td>${row.municipio_origem}</td>
          <td style="max-width: 280px; font-size: 0.82rem;" title="${row.sintoma_principal}">
            ${row.sintoma_principal}
          </td>
          <td>${createManchesterBadge(row.classificacao_manchester, row.tempo_espera_real_min, row.tempo_espera_max_min)}</td>
          <td>
            <strong>${row.tempo_espera_real_min}m</strong> / <span style="color: var(--text-muted);">${row.tempo_espera_max_min}m</span>
          </td>
          <td style="font-size: 0.82rem;">${row.especialidade_requerida}</td>
          <td style="font-size: 0.8rem;">${row.status_atendimento}</td>
        </tr>
      `).join('');
    } catch (e) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; padding: 2rem; color: var(--manchester-vermelho);">
            Erro ao carregar registros: ${e.message}
          </td>
        </tr>
      `;
    }
  }

  // Listeners de paginação
  document.getElementById('btn-prev-page')?.addEventListener('click', () => {
    if (currentPage > 1) loadPage(currentPage - 1);
  });

  document.getElementById('btn-next-page')?.addEventListener('click', () => {
    if (currentPage < totalPages) loadPage(currentPage + 1);
  });

  document.getElementById('select-page-size')?.addEventListener('change', (e) => {
    pageSize = Number(e.target.value);
    loadPage(1);
  });

  // Filtros
  document.getElementById('btn-apply-analytics-filter')?.addEventListener('click', () => {
    currentFilters = {
      sintoma: document.getElementById('search-sintoma').value.trim(),
      classificacao: document.getElementById('analytics-filter-classificacao').value,
      municipio: document.getElementById('analytics-filter-municipio').value
    };
    loadPage(1);
    showToast('Filtro aplicado na listagem.', 'info');
  });

  // Exportar CSV
  document.getElementById('btn-export-csv')?.addEventListener('click', () => {
    const url = api.getExportUrl(currentFilters);
    window.open(url, '_blank');
    showToast('Download do CSV iniciado!', 'success');
  });

  // Carga inicial
  await loadPage(1);
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
