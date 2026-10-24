/**
 * SAÚDE SYNC — Ponto de Entrada Principal (Frontend Vite)
 * Hackathon Antigravity — SENAI Ourinhos
 */

import { initRouter } from './router.js';

// Inicializar Tema (Dark Mode como padrão, respeitando preferência do usuário)
const savedTheme = localStorage.getItem('saudesync_theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

// Inicializar Roteador SPA
document.addEventListener('DOMContentLoaded', () => {
  initRouter();
  console.log('%c⚡ SAÚDE SYNC — Central de Triagem Inicializada!', 'color: #2F80ED; font-size: 14px; font-weight: bold;');
});
