"""
SAÚDE SYNC — Rotas de Dados Vivos (Scraping) e Fila
"""

from fastapi import APIRouter
from backend.app.services.scraper_service import ScraperService
from backend.app.services.firebase_service import FirebaseService
from backend.app.models.live_data import LiveDataResponse

router = APIRouter(tags=["Live Data & Queue"])
scraper_service = ScraperService()
firebase_service = FirebaseService()

@router.get("/api/live-data", response_model=LiveDataResponse)
def get_live_health_data():
    """
    Retorna os dados externos de postos e farmácias de plantão de Ourinhos.
    """
    return scraper_service.fetch_live_data(force_refresh=False)

@router.post("/api/live-data/refresh", response_model=LiveDataResponse)
def refresh_live_health_data():
    """
    Força uma nova coleta contra a fonte pública externa.
    """
    return scraper_service.fetch_live_data(force_refresh=True)

@router.get("/api/queue")
def get_active_queue():
    """
    Retorna a fila de espera ativa em tempo real.
    """
    records = firebase_service.get_queue_records()
    return {
        "total_em_fila": len(records),
        "fila": records
    }
