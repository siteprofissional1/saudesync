/**
 * SAÚDE SYNC — Roteador SPA Baseado em Hash
 * Navegação fluida sem F5, 100% compatível com GitHub Pages.
 */

import { renderSidebar } from './components/Sidebar.js';
import { renderHeader } from './components/Header.js';
import { renderDashboard } from './pages/DashboardPage.js';
import { renderQueue } from './pages/QueuePage.js';
import { renderTriage } from './pages/TriagePage.js';
import { renderAnalytics } from './pages/AnalyticsPage.js';
import { renderLiveData } from './pages/LiveDataPage.js';
import { renderInsights } from './pages/InsightsPage.js';
import { renderAbout } from './pages/AboutPage.js';
import { renderTvPage } from './pages/TvPage.js';

const routes = {
  '#dashboard': {
    title: 'Visão Geral & Dashboard',
    subtitle: 'Indicadores Consolidados de Atendimento',
    render: renderDashboard
  },
  '#queue': {
    title: 'Fila em Tempo Real',
    subtitle: 'Sincronização Reativa com Firebase Firestore',
    render: renderQueue
  },
  '#tv': {
    title: 'Painel TV (Sala de Espera)',
    subtitle: 'Telão Fullscreen em Tempo Real com Áudio e Chamadas',
    render: renderTvPage
  },
  '#triage': {
    title: 'Triagem Simulada',
    subtitle: 'Classificação Acadêmica Explicável via RAG Local',
    render: renderTriage
  },
  '#analytics': {
    title: 'Analytics & Exploração',
    subtitle: 'Tabela Paginada e Mineração do Dataset Histórico',
    render: renderAnalytics
  },
  '#livedata': {
    title: 'Dados Vivos da Rede de Saúde',
    subtitle: 'Web Scraping de Estabelecimentos e Farmácias de Ourinhos/SP',
    render: renderLiveData
  },
  '#insights': {
    title: 'Insights IA (Multi-Agentes)',
    subtitle: 'Síntese Executiva Contextual com Gemini AI',
    render: renderInsights
  },
  '#about': {
    title: 'Sobre o Projeto',
    subtitle: 'Os 9 Pilares do Hackathon Antigravity SENAI',
    render: renderAbout
  }
};

let currentCleanup = null;

export function initRouter() {
  const contentEl = document.getElementById('app-content');

  async function handleRouteChange() {
    const hash = window.location.hash || '#dashboard';
    const route = routes[hash] || routes['#dashboard'];

    // Executar cleanup da página anterior (ex: desinscrever listener do Firestore)
    if (typeof currentCleanup === 'function') {
      try {
        currentCleanup();
      } catch (e) {
        console.warn('Erro ao executar cleanup de rota:', e);
      }
      currentCleanup = null;
    }

    // Atualizar Sidebar e Header
    renderSidebar(hash);
    renderHeader(route.title, route.subtitle);

    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Renderizar página
    contentEl.innerHTML = '';
    try {
      const cleanup = await route.render(contentEl);
      if (typeof cleanup === 'function') {
        currentCleanup = cleanup;
      }
    } catch (err) {
      contentEl.innerHTML = `
        <div class="error-banner" style="margin: 2rem 0;">
          <span>❌</span>
          <span>Erro ao carregar a visualização: ${err.message}</span>
        </div>
      `;
    }
  }

  window.addEventListener('hashchange', handleRouteChange);
  // Inicialização na primeira carga
  handleRouteChange();
}
