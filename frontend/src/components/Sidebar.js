/**
 * SAÚDE SYNC — Componente Sidebar de Navegação
 */

export function renderSidebar(currentRoute = '#dashboard') {
  const sidebar = document.getElementById('app-sidebar');
  if (!sidebar) return;

  const navItems = [
    { id: '#dashboard', label: 'Visão Geral', icon: '📊' },
    { id: '#queue', label: 'Fila em Tempo Real', icon: '⏱️' },
    { id: '#tv', label: 'Painel TV (Sala de Espera)', icon: '📺' },
    { id: '#triage', label: 'Triagem Simulada', icon: '🩺' },
    { id: '#analytics', label: 'Analytics & Dataset', icon: '📈' },
    { id: '#livedata', label: 'Dados Vivos (Ourinhos)', icon: '🏥' },
    { id: '#insights', label: 'Insights IA (Gemini)', icon: '💡' },
    { id: '#about', label: 'Sobre o Projeto', icon: 'ℹ️' }
  ];

  sidebar.innerHTML = `
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <span>⚡</span>
      </div>
      <div class="sidebar-brand-text">
        <h1>Saúde Sync</h1>
        <span class="badge-hackathon">Hackathon SENAI</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      ${navItems.map(item => `
        <a href="${item.id}" class="nav-item ${currentRoute === item.id ? 'active' : ''}" data-route="${item.id}">
          <span class="nav-icon">${item.icon}</span>
          <span class="nav-label">${item.label}</span>
        </a>
      `).join('')}
    </nav>

    <div class="sidebar-footer">
      <div class="system-status-pill">
        <span class="status-dot pulse"></span>
        <span>Backend: FastAPI Online</span>
      </div>
      <div class="system-status-pill">
        <span class="status-dot"></span>
        <span>Modo: Acadêmico 1.0.0</span>
      </div>
    </div>
  `;

  // Fechar sidebar no mobile ao clicar em um link
  sidebar.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', () => {
      sidebar.classList.remove('open');
      document.getElementById('sidebar-overlay')?.classList.remove('active');
    });
  });
}
