/**
 * SAÚDE SYNC — Formatadores e Utilitários de Apresentação
 */

/**
 * Formata minutos em texto amigável (ex: 45 min ou 2h 15min)
 */
export function formatMinutes(min) {
  if (min === null || min === undefined || isNaN(min)) return '--';
  const val = Number(min);
  if (val < 60) return `${Math.round(val)} min`;
  const hours = Math.floor(val / 60);
  const remaining = Math.round(val % 60);
  return remaining > 0 ? `${hours}h ${remaining}min` : `${hours}h`;
}

/**
 * Formata data e hora para o padrão brasileiro (dd/mm/aaaa hh:mm)
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '--';
  try {
    const d = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Retorna a classe CSS e cor correspondente à classificação Manchester
 */
export function getManchesterInfo(classificacao) {
  if (!classificacao) return { cssClass: 'amarelo', cor: '#EAB308', label: 'Não classificado' };
  const lower = classificacao.toLowerCase();
  if (lower.includes('vermelho')) return { cssClass: 'vermelho', cor: '#EF4444', label: 'Vermelho - Emergência', icon: '🚨' };
  if (lower.includes('laranja')) return { cssClass: 'laranja', cor: '#F97316', label: 'Laranja - Muito Urgente', icon: '⚠️' };
  if (lower.includes('amarelo')) return { cssClass: 'amarelo', cor: '#EAB308', label: 'Amarelo - Urgente', icon: '⚡' };
  if (lower.includes('verde')) return { cssClass: 'verde', cor: '#22C55E', label: 'Verde - Pouco Urgente', icon: '🟢' };
  if (lower.includes('azul')) return { cssClass: 'azul', cor: '#3B82F6', label: 'Azul - Não Urgente', icon: '🔵' };
  return { cssClass: 'amarelo', cor: '#EAB308', label: classificacao, icon: '📋' };
}
