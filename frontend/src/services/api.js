/**
 * SAÚDE SYNC — Cliente HTTP da API FastAPI
 * Comunicação com o backend com tratamento de erros e resiliência.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function fetchJson(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.detail || `Erro HTTP ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.warn(`[API Warning] Falha na rota ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Diagnóstico e Status
  async getHealth() {
    return fetchJson('/api/health');
  },

  async getSchema() {
    return fetchJson('/api/dataset/schema');
  },

  // Dashboard & Gráficos
  async getSummary(params = {}) {
    const qs = new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== ''));
    return fetchJson(`/api/dashboard/summary?${qs.toString()}`);
  },

  async getCharts(params = {}) {
    const qs = new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== ''));
    return fetchJson(`/api/dashboard/charts?${qs.toString()}`);
  },

  async getFilters() {
    return fetchJson('/api/dashboard/filters');
  },

  // Analytics Paginado
  async getAnalytics(params = {}) {
    const qs = new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== ''));
    return fetchJson(`/api/analytics?${qs.toString()}`);
  },

  getExportUrl(params = {}) {
    const qs = new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== ''));
    return `${BASE_URL}/api/analytics/export?${qs.toString()}`;
  },

  // Triagem & RAG Local
  async simulateTriage(payload) {
    return fetchJson('/api/triage/simulate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getTriageDefaults() {
    return fetchJson('/api/triage/defaults');
  },

  // Insights IA & Multi-Agentes
  async getInsights() {
    return fetchJson('/api/insights');
  },

  async generateInsights() {
    return fetchJson('/api/insights/generate', { method: 'POST' });
  },

  // Dados Vivos (Scraper Ourinhos)
  async getLiveData() {
    return fetchJson('/api/live-data');
  },

  async refreshLiveData() {
    return fetchJson('/api/live-data/refresh', { method: 'POST' });
  },

  // Fila em Tempo Real (Fallback Backend)
  async getQueue() {
    return fetchJson('/api/queue');
  }
};
