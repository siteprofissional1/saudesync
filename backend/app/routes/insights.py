"""
SAÚDE SYNC — Rotas de Insights Estratégicos & Multi-Agentes
"""

from fastapi import APIRouter
from backend.app.agents.orchestrator import MultiAgentOrchestrator

router = APIRouter(tags=["Insights"])
orchestrator = MultiAgentOrchestrator()

@router.get("/api/insights")
def get_operational_insights():
    """
    Retorna os insights executivos atualmente consolidados pelo sistema.
    """
    return {
        "total_insights": len(orchestrator.orchestrate_insights_generation(force_refresh=False)),
        "insights": orchestrator.orchestrate_insights_generation(force_refresh=False)
    }

@router.post("/api/insights/generate")
def generate_new_insights():
    """
    Aciona a esteira multi-agentes (Data Agent -> Operations Agent -> Gemini Agent) para sintetizar novos insights.
    """
    insights = orchestrator.orchestrate_insights_generation(force_refresh=True)
    return {
        "status": "success",
        "message": "Novos insights operacionais gerados com sucesso pela esteira de agentes.",
        "insights": insights
    }
