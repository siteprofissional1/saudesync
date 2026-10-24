/**
 * SAÚDE SYNC — Componente Header Superior
 */

export function renderHeader(title = 'Visão Geral', subtitle = 'Central Operacional de Triagem') {
  const header = document.getElementById('app-header');
  if (!header) return;

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';

  header.innerHTML = `
    <div class="header-left">
      <button id="btn-mobile-toggle" class="btn-mobile-menu" aria-label="Abrir Menu">
        <span>☰</span>
      </button>
      <div class="header-title-wrapper">
        <h2 id="header-page-title">${title}</h2>
        <span class="header-subtitle">${subtitle}</span>
      </div>
    </div>

    <div class="header-right" style="display: flex; align-items: center; gap: 0.75rem;">
      <button id="btn-user-guide" class="btn btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.82rem; display: inline-flex; align-items: center; gap: 0.35rem;" title="Como Usar o Portal & Roteiro de Demonstração">
        <span>💡</span> <span>Guia do Portal</span>
      </button>

      <div id="realtime-status-badge" class="system-status-pill" title="Sincronização reativa ativa">
        <span class="status-dot pulse"></span>
        <span id="realtime-status-text" style="font-size: 0.8rem; font-weight: 500;">Realtime Ativo</span>
      </div>

      <button id="btn-theme-toggle" class="btn-theme-toggle" title="Alternar Dark / Light Mode" aria-label="Alternar Tema">
        ${currentTheme === 'dark' ? '☀️' : '🌙'}
      </button>
    </div>
  `;

  // Listener para Menu Mobile
  const btnMobile = document.getElementById('btn-mobile-toggle');
  const sidebar = document.getElementById('app-sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  btnMobile?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
    overlay?.classList.toggle('active');
  });

  overlay?.addEventListener('click', () => {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('active');
  });

  // Listener para o Guia do Portal (Ajuda amigável ao usuário e professor)
  document.getElementById('btn-user-guide')?.addEventListener('click', () => {
    openUserGuideModal();
  });

  // Listener para Theme Toggle
  const btnTheme = document.getElementById('btn-theme-toggle');
  btnTheme?.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('saudesync_theme', newTheme);
    btnTheme.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';

    // Disparar evento para atualizar gráficos Plotly se existirem
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
  });
}

/**
 * Modal Instrutivo Interativo: O que é o portal e como apresentar
 */
function openUserGuideModal() {
  const existing = document.getElementById('modal-user-guide');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'modal-user-guide';
  modal.className = 'saude-modal-overlay';
  modal.innerHTML = `
    <div class="saude-modal-card" style="max-width: 650px;">
      <div class="saude-modal-header">
        <div class="saude-modal-title">
          <span>🏥</span>
          <span>Guia do Usuário — Central Saúde Sync</span>
        </div>
        <button class="saude-modal-close" id="btn-close-guide">&times;</button>
      </div>

      <div class="saude-modal-body">
        <div style="background: rgba(2, 132, 199, 0.12); border-left: 4px solid var(--brand-accent); padding: 0.85rem 1rem; border-radius: 4px; font-size: 0.85rem;">
          <strong>🎯 Propósito do Portal:</strong> Esta é uma aplicação profissional desenvolvida para a 
          <strong>equipe médica e de gestão hospitalar</strong> para operacionalizar a triagem de Manchester, 
          controlar a fila em tempo real e monitorar a capacidade de leitos.
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
          <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin-top: 0.5rem;">
            🚀 Roteiro Rápido para Apresentação no Telão:
          </h4>

          <div style="display: flex; gap: 0.75rem; align-items: flex-start; font-size: 0.85rem;">
            <span style="background: var(--brand-glow); color: var(--brand-primary); font-weight: 700; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">1</span>
            <div>
              <strong>Fila em Tempo Real (#queue):</strong> Acesse a fila, clique em <em>'Auto-Play'</em> ou nos botões coloridos de Manchester (🔴, 🟠, 🟡, 🟢, 🔵) para ver pacientes entrando com sintomas reais e toque no botão <em>'Chamar'</em> para ver o Telão de Senhas hospitalar com alerta sonoro.
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem; align-items: flex-start; font-size: 0.85rem;">
            <span style="background: var(--brand-glow); color: var(--brand-primary); font-weight: 700; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">2</span>
            <div>
              <strong>Triagem com IA Local RAG (#triage):</strong> Clique em um dos cenários pré-configurados (ex: <em>'Dor Precordial'</em>) e clique em <em>'Classificar Paciente'</em> para ver o motor RAG justificando a cor de Manchester e o leito indicado.
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem; align-items: flex-start; font-size: 0.85rem;">
            <span style="background: var(--brand-glow); color: var(--brand-primary); font-weight: 700; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">3</span>
            <div>
              <strong>Dashboard & Gráficos Plotly (#dashboard):</strong> Mostre a distribuição de atendimentos e filtros dinâmicos por prioridade e município.
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem; align-items: flex-start; font-size: 0.85rem;">
            <span style="background: var(--brand-glow); color: var(--brand-primary); font-weight: 700; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">4</span>
            <div>
              <strong>Rede Externa de Ourinhos (#livedata):</strong> Mostre os dados reais coletados de postos de saúde e farmácias de plantão de Ourinhos.
            </div>
          </div>
        </div>

        <div style="margin-top: 0.5rem; padding: 0.75rem; background-color: var(--bg-surface-elevated); border-radius: var(--radius-sm); font-size: 0.8rem; color: var(--text-muted);">
          📱 <strong>Acesso por Celular:</strong> Este portal é 100% responsivo! Acesse pelo celular na mesma rede Wi-Fi via IP local da máquina.
        </div>
      </div>

      <div class="saude-modal-footer">
        <button class="btn btn-primary" id="btn-ok-guide">Entendido! Continuar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => modal.remove();
  document.getElementById('btn-close-guide')?.addEventListener('click', closeModal);
  document.getElementById('btn-ok-guide')?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

