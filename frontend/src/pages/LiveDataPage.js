/**
 * SAÚDE SYNC — Página de Dados Vivos (Web Scraping de Ourinhos/SP)
 */

import { api } from '../services/api.js';
import { showToast } from '../components/Toast.js';

export async function renderLiveData(container) {
  container.innerHTML = `
    <!-- Cabeçalho da Seção de Dados Externos -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h3 style="font-size: 1.2rem; font-weight: 700;">Rede de Saúde e Plantão (Ourinhos/SP)</h3>
        <p id="live-data-subtitle" style="font-size: 0.82rem; color: var(--text-muted);">
          Monitoramento público automatizado via Web Scraping com cache inteligente
        </p>
      </div>

      <button id="btn-refresh-scraper" class="btn btn-primary">
        <span>🔄</span> Atualizar Dados Externos
      </button>
    </div>

    <!-- Metadata e Fonte da Raspagem -->
    <div style="background-color: var(--bg-surface-elevated); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: 1rem 1.25rem; margin-bottom: 1.5rem; font-size: 0.85rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
      <div>
        <strong>Origem / Fonte Pública:</strong> 
        <a id="scraper-source-link" href="#" target="_blank" rel="noopener noreferrer" style="color: var(--brand-accent); margin-left: 0.25rem;">
          Portal Oficial da Saúde de Ourinhos
        </a>
      </div>
      <div>
        <strong>Última Coleta:</strong> <span id="scraper-timestamp">Carregando...</span> 
        <span id="scraper-cache-badge" style="margin-left: 0.5rem; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; background: var(--bg-surface); border: 1px solid var(--border-subtle);">
          Cache ativo
        </span>
      </div>
    </div>

    <!-- Grid de Estabelecimentos e Farmácias -->
    <div id="facilities-container" class="facility-grid">
      <div class="state-container" style="grid-column: 1 / -1;">
        <div class="spinner"></div>
        <p>Consultando dados da rede de saúde...</p>
      </div>
    </div>
  `;

  async function loadData(forceRefresh = false) {
    const facilitiesGrid = document.getElementById('facilities-container');
    const refreshBtn = document.getElementById('btn-refresh-scraper');

    if (forceRefresh) {
      if (refreshBtn) refreshBtn.disabled = true;
      facilitiesGrid.innerHTML = `
        <div class="state-container" style="grid-column: 1 / -1;">
          <div class="spinner"></div>
          <p>Realizando nova raspagem contra a fonte de saúde de Ourinhos...</p>
        </div>
      `;
    }

    try {
      const res = forceRefresh ? await api.refreshLiveData() : await api.getLiveData();

      document.getElementById('scraper-source-link').href = res.fonte_url;
      document.getElementById('scraper-source-link').textContent = res.fonte_url;
      document.getElementById('scraper-timestamp').textContent = res.ultima_atualizacao;
      
      const cacheBadge = document.getElementById('scraper-cache-badge');
      if (cacheBadge) {
        cacheBadge.textContent = res.is_cached ? '📦 Cache (30 min)' : '⚡ Coleta Viva';
        cacheBadge.style.color = res.is_cached ? 'var(--text-muted)' : 'var(--brand-accent)';
      }

      if (!res.estabelecimentos || res.estabelecimentos.length === 0) {
        facilitiesGrid.innerHTML = `
          <div class="state-container" style="grid-column: 1 / -1;">
            <p>Nenhum estabelecimento registrado no momento.</p>
          </div>
        `;
        return;
      }

      facilitiesGrid.innerHTML = res.estabelecimentos.map(item => `
        <div class="facility-card">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; gap: 0.5rem;">
              <span class="facility-name">${item.nome}</span>
              <span style="font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px; background: rgba(47, 128, 237, 0.15); color: var(--brand-primary); white-space: nowrap;">
                ${item.tipo}
              </span>
            </div>
            <div class="facility-meta">
              <span>📍 <strong>Endereço:</strong> ${item.endereco} (${item.municipio}/SP)</span>
              <span>📞 <strong>Telefone:</strong> ${item.telefone}</span>
              <span>🕒 <strong>Horário:</strong> ${item.horario_funcionamento}</span>
            </div>
          </div>

          <div style="border-top: 1px solid var(--border-subtle); padding-top: 0.75rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem;">
            <span style="color: var(--brand-accent); font-weight: 600;">
              ● ${item.status_plantao}
            </span>
            <span style="color: var(--text-muted); font-size: 0.75rem;">
              ${item.observacoes || 'Rede de Apoio'}
            </span>
          </div>
        </div>
      `).join('');

      if (forceRefresh) {
        showToast('Dados de saúde de Ourinhos atualizados com sucesso!', 'success');
      }
    } catch (e) {
      facilitiesGrid.innerHTML = `
        <div class="error-banner" style="grid-column: 1 / -1;">
          <span>❌</span>
          <span>Fonte temporariamente indisponível: ${e.message}</span>
        </div>
      `;
    } finally {
      if (refreshBtn) refreshBtn.disabled = false;
    }
  }

  document.getElementById('btn-refresh-scraper')?.addEventListener('click', () => {
    loadData(true);
  });

  await loadData(false);
}
