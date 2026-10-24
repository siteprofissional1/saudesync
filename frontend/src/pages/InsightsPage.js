/**
 * SAÚDE SYNC — Página de Insights IA & Multi-Agentes (Gemini AI)
 */

import { api } from '../services/api.js';
import { showToast } from '../components/Toast.js';

export async function renderInsights(container) {
  container.innerHTML = `
    <!-- Cabeçalho com Botão de Geração de Novos Insights -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h3 style="font-size: 1.2rem; font-weight: 700;">Inteligência Operacional & Multi-Agentes</h3>
        <p style="font-size: 0.82rem; color: var(--text-muted);">
          Síntese executiva contextualizada com base em cálculos exatos e Gemini AI
        </p>
      </div>

      <button id="btn-generate-insights" class="btn btn-primary">
        <span>✨</span> Gerar Novos Insights com IA
      </button>
    </div>

    <!-- Banner Didático da Arquitetura de Agentes -->
    <div style="background-color: var(--bg-surface-elevated); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: 1rem 1.25rem; margin-bottom: 1.5rem; font-size: 0.85rem; display: flex; align-items: center; gap: 1rem;">
      <span style="font-size: 1.5rem;">🤖</span>
      <div>
        <strong>Esteira Multi-Agentes:</strong> 
        <span>Data Agent (Pandas) ➔ Operations Agent (Gargalos) ➔ Gemini Agent (Síntese Executiva).</span>
        <span style="display: block; font-size: 0.78rem; color: var(--text-muted); margin-top: 0.2rem;">
          Python calcula de forma determinística. O Gemini interpreta e formula a narrativa executiva sem inventar números.
        </span>
      </div>
    </div>

    <!-- Grid de Cards de Insights -->
    <div id="insights-container" class="insights-grid">
      <div class="state-container" style="grid-column: 1 / -1;">
        <div class="spinner"></div>
        <p>Consultando insights consolidados pela esteira de IA...</p>
      </div>
    </div>
  `;

  async function loadInsights(generateNew = false) {
    const grid = document.getElementById('insights-container');
    const btn = document.getElementById('btn-generate-insights');

    if (generateNew) {
      if (btn) btn.disabled = true;
      grid.innerHTML = `
        <div class="state-container" style="grid-column: 1 / -1;">
          <div class="spinner"></div>
          <p>Orquestrando agentes e sintetizando dados com Gemini AI...</p>
        </div>
      `;
    }

    try {
      const res = generateNew ? await api.generateInsights() : await api.getInsights();
      const list = res.insights || [];

      if (list.length === 0) {
        grid.innerHTML = `
          <div class="state-container" style="grid-column: 1 / -1;">
            <p>Nenhum insight gerado até o momento. Clique em "Gerar Novos Insights".</p>
          </div>
        `;
        return;
      }

      grid.innerHTML = list.map(item => `
        <div class="insight-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="insight-badge">${item.categoria || 'Geral'}</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${item.timestamp || ''}</span>
          </div>

          <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); line-height: 1.3;">
            ${item.titulo}
          </h4>

          <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5;">
            ${item.texto}
          </p>

          <div class="insight-metrics">
            <strong>Métricas Exatas Utilizadas:</strong> ${item.metricas_utilizadas}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 0.5rem;">
            <span>Origem: <strong>${item.origem || 'Multi-Agentes'}</strong></span>
            <span>✅ Auditoria Determinística</span>
          </div>
        </div>
      `).join('');

      if (generateNew) {
        showToast('Novos insights gerados com sucesso!', 'success');
      }
    } catch (e) {
      grid.innerHTML = `
        <div class="error-banner" style="grid-column: 1 / -1;">
          <span>❌</span>
          <span>Erro ao gerar insights: ${e.message}</span>
        </div>
      `;
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  document.getElementById('btn-generate-insights')?.addEventListener('click', () => {
    loadInsights(true);
  });

  await loadInsights(false);
}
