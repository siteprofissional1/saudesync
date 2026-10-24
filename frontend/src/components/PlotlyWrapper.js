/**
 * SAÚDE SYNC — Wrapper Integrador com Plotly.js
 * Adapta layouts de gráficos dinamicamente para os modos Dark e Light.
 */

export function renderPlotlyChart(containerId, chartPayload) {
  if (!window.Plotly) {
    console.warn('[Plotly] Biblioteca Plotly.js ainda não carregada.');
    return;
  }

  const container = document.getElementById(containerId);
  if (!container || !chartPayload) return;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#F5F9FC' : '#102A43';
  const gridColor = isDark ? '#1E3349' : '#E2E8F0';
  const hoverBg = isDark ? '#07111F' : '#FFFFFF';
  const hoverTextColor = isDark ? '#FFFFFF' : '#07111F';
  const hoverBorderColor = isDark ? '#00D2FF' : '#0284C7';

  const defaultLayout = {
    autosize: true,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    hoverlabel: {
      bgcolor: hoverBg,
      bordercolor: hoverBorderColor,
      font: {
        family: 'Inter, sans-serif',
        size: 13,
        color: hoverTextColor
      },
      align: 'left'
    },
    font: {
      family: 'Inter, sans-serif',
      color: textColor,
      size: 11
    },
    xaxis: {
      gridcolor: gridColor,
      zerolinecolor: gridColor,
      tickfont: { color: textColor }
    },
    yaxis: {
      gridcolor: gridColor,
      zerolinecolor: gridColor,
      tickfont: { color: textColor }
    },
    margin: { t: 20, b: 40, l: 40, r: 20 },
    ...(chartPayload.layout || {})
  };

  const config = {
    responsive: true,
    displayModeBar: false
  };

  try {
    window.Plotly.newPlot(containerId, chartPayload.data, defaultLayout, config);
  } catch (err) {
    console.error(`[Plotly Render Error] no container ${containerId}:`, err);
  }
}
