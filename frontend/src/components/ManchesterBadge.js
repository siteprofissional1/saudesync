/**
 * SAÚDE SYNC — Componente Badge Manchester
 */

import { getManchesterInfo } from '../utils/formatters.js';

export function createManchesterBadge(classificacao, tempoReal = null, tempoMax = null) {
  const info = getManchesterInfo(classificacao);
  let html = `
    <span class="badge-manchester ${info.cssClass}">
      <span>${info.icon}</span>
      <span>${info.label}</span>
    </span>
  `;

  // Se os tempos forem fornecidos, validar se excedeu o tempo de referência
  if (tempoReal !== null && tempoMax !== null) {
    const real = Number(tempoReal);
    const max = Number(tempoMax);
    if (real > max) {
      const atraso = real - max;
      html += `
        <span class="badge-tempo-alerta" title="Tempo de referência excedido pelo protocolo de atendimento">
          <span>⚠️</span>
          <span>+${atraso} min</span>
        </span>
      `;
    }
  }

  return html;
}
