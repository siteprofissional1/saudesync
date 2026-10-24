"""
SAÚDE SYNC — Modelos Pydantic para Dashboard e Métricas
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class DashboardSummaryResponse(BaseModel):
    """
    KPIs consolidados do painel operacional.
    """
    total_atendimentos: int
    aguardando_fila: int
    tempo_medio_espera_min: float
    tempo_mediano_espera_min: float
    p90_espera_min: float
    acima_tempo_referencia: int
    percentual_acima_tempo: float
    dentro_tempo_referencia: int
    percentual_dentro_tempo: float
    especialidade_mais_demandada: str
    municipio_maior_volume: str
    periodo_inicio: str
    periodo_fim: str

class ChartPlotlyPayload(BaseModel):
    """
    Estrutura compatível diretamente com Plotly.js.
    """
    id: str
    title: str
    type: str
    data: List[Dict[str, Any]]
    layout: Dict[str, Any]

class DashboardChartsResponse(BaseModel):
    """
    Conjunto com os 8 gráficos obrigatórios + 2 adicionais.
    """
    distribuicao_manchester: ChartPlotlyPayload
    status_atendimento: ChartPlotlyPayload
    tempo_real_vs_limite: ChartPlotlyPayload
    volume_por_horario: ChartPlotlyPayload
    sintomas_mais_frequentes: ChartPlotlyPayload
    volume_por_municipio: ChartPlotlyPayload
    especialidades_demandadas: ChartPlotlyPayload
    evolucao_temporal: ChartPlotlyPayload
    distribuicao_faixa_etaria: Optional[ChartPlotlyPayload] = None
    taxa_cumprimento_meta: Optional[ChartPlotlyPayload] = None
