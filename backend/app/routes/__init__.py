"""
SAÚDE SYNC — Módulo de Rotas da API
"""
from backend.app.routes.health import router as health_router
from backend.app.routes.dashboard import router as dashboard_router
from backend.app.routes.analytics import router as analytics_router
from backend.app.routes.triage import router as triage_router
from backend.app.routes.insights import router as insights_router
from backend.app.routes.live_data import router as live_data_router

__all__ = [
    "health_router",
    "dashboard_router",
    "analytics_router",
    "triage_router",
    "insights_router",
    "live_data_router"
]
