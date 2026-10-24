"""
SAÚDE SYNC — Rotas de Dashboard, KPIs e Gráficos Plotly.js
"""

from fastapi import APIRouter, Query
from typing import Optional
from backend.app.services.csv_service import CsvService
from backend.app.models.dashboard import DashboardSummaryResponse

router = APIRouter(tags=["Dashboard"])
csv_service = CsvService()

@router.get("/api/dashboard/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    data_inicio: Optional[str] = Query(None, description="Data inicial YYYY-MM-DD"),
    data_fim: Optional[str] = Query(None, description="Data final YYYY-MM-DD"),
    classificacao: Optional[str] = Query(None, description="Classificação Manchester"),
    municipio: Optional[str] = Query(None, description="Município de origem"),
    especialidade: Optional[str] = Query(None, description="Especialidade requerida"),
    status: Optional[str] = Query(None, description="Status de atendimento"),
    sexo: Optional[str] = Query(None, description="Sexo ('M' ou 'F')"),
    faixa_etaria: Optional[str] = Query(None, description="Faixa etária ('0-12', '13-18', '19-59', '60+')"),
    sintoma: Optional[str] = Query(None, description="Busca no sintoma principal")
):
    """
    Retorna os KPIs operacionais recalculados deterministicamente a partir dos filtros.
    """
    df_filtrado = csv_service.filter_data(
        data_inicio=data_inicio,
        data_fim=data_fim,
        classificacao=classificacao,
        municipio=municipio,
        especialidade=especialidade,
        status=status,
        sexo=sexo,
        faixa_etaria=faixa_etaria,
        sintoma=sintoma
    )
    summary = csv_service.calculate_summary(df_filtrado)
    return summary

@router.get("/api/dashboard/charts")
def get_dashboard_charts(
    data_inicio: Optional[str] = Query(None),
    data_fim: Optional[str] = Query(None),
    classificacao: Optional[str] = Query(None),
    municipio: Optional[str] = Query(None),
    especialidade: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    sexo: Optional[str] = Query(None),
    faixa_etaria: Optional[str] = Query(None),
    sintoma: Optional[str] = Query(None)
):
    """
    Gera as séries e layouts para os 8 gráficos obrigatórios do Plotly.js.
    """
    df_filtrado = csv_service.filter_data(
        data_inicio=data_inicio,
        data_fim=data_fim,
        classificacao=classificacao,
        municipio=municipio,
        especialidade=especialidade,
        status=status,
        sexo=sexo,
        faixa_etaria=faixa_etaria,
        sintoma=sintoma
    )
    return csv_service.generate_charts(df_filtrado)

@router.get("/api/dashboard/filters")
def get_available_filter_options():
    """
    Retorna as opções existentes no dataset para popular os filtros dinâmicos na interface.
    """
    df = csv_service.get_raw_df()
    return {
        "classificacoes": sorted(list(df["classificacao_manchester"].dropna().unique())),
        "municipios": sorted(list(df["municipio_origem"].dropna().unique())),
        "especialidades": sorted(list(df["especialidade_requerida"].dropna().unique())),
        "status_atendimento": sorted(list(df["status_atendimento"].dropna().unique())),
        "sintomas": sorted(list(df["sintoma_principal"].dropna().unique())),
        "faixas_etarias": ["0-12", "13-18", "19-59", "60+"],
        "sexos": ["M", "F"]
    }
