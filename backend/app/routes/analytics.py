"""
SAÚDE SYNC — Rotas de Exploração do Dataset e Analytics Paginado
"""

from fastapi import APIRouter, Query, Response
from typing import Optional
from backend.app.services.csv_service import CsvService

router = APIRouter(tags=["Analytics"])
csv_service = CsvService()

@router.get("/api/analytics")
def get_analytics_records(
    page: int = Query(1, ge=1, description="Número da página"),
    page_size: int = Query(20, ge=5, le=100, description="Registros por página"),
    sort_by: str = Query("data_hora_chegada", description="Coluna para ordenação"),
    sort_desc: bool = Query(True, description="Ordenação decrescente"),
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
    Retorna tabela paginada e filtrada sem renderizar 1.200 linhas simultaneamente no cliente.
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
    return csv_service.get_paginated_records(
        df=df_filtrado,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_desc=sort_desc
    )

@router.get("/api/analytics/export")
def export_filtered_csv(
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
    Exporta os registros filtrados em formato CSV para download.
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
    csv_content = csv_service.export_csv(df_filtrado)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=saudesync_export.csv"}
    )
