"""
SAÚDE SYNC — Modelos Pydantic para Dados Vivos e Web Scraping
"""

from typing import List, Optional
from pydantic import BaseModel

class HealthFacilityItem(BaseModel):
    """
    Estabelecimento ou serviço de saúde monitorado.
    """
    id: str
    nome: str
    tipo: str
    endereco: str
    municipio: str = "Ourinhos"
    telefone: Optional[str] = "Não informado"
    horario_funcionamento: str
    status_plantao: str
    observacoes: Optional[str] = None

class LiveDataResponse(BaseModel):
    """
    Resposta estruturada do serviço de dados externos.
    """
    fonte_url: str
    status: str
    mensagem: str
    is_cached: bool
    ultima_atualizacao: str
    total_estabelecimentos: int
    estabelecimentos: List[HealthFacilityItem]
