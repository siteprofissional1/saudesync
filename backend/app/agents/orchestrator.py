"""
SAÚDE SYNC — Multi-Agent Orchestrator
Coordena a colaboração entre Data Agent, Operations Agent e Gemini Agent.
"""

from typing import List, Dict, Any
from backend.app.agents.data_agent import DataAgent
from backend.app.agents.operations_agent import OperationsAgent
from backend.app.agents.gemini_agent import GeminiAgent

class MultiAgentOrchestrator:
    """
    Maestro do fluxo multi-agentes do Saúde Sync.
    Garante o cumprimento da regra: Python calcula. Gemini interpreta.
    """
    def __init__(self):
        self.data_agent = DataAgent()
        self.operations_agent = OperationsAgent()
        self.gemini_agent = GeminiAgent()
        self._cached_insights: List[Dict[str, Any]] = []

    def orchestrate_insights_generation(self, force_refresh: bool = False) -> List[Dict[str, Any]]:
        """
        Executa a esteira multi-agentes de ponta a ponta:
        1. Data Agent minera dados determinísticos
        2. Operations Agent avalia gargalos operacionais
        3. Contexto consolidado é estruturado
        4. Gemini Agent sintetiza narrativa executiva
        """
        if self._cached_insights and not force_refresh:
            return self._cached_insights

        # Etapa 1: Agente de Dados
        data_payload = self.data_agent.get_data_insights_payload()

        # Etapa 2: Agente de Operações
        ops_payload = self.operations_agent.analyze_operational_bottlenecks()

        # Etapa 3: Consolidação do Contexto
        consolidated_context = {
            **data_payload,
            "violacoes_por_classe": ops_payload["violacoes_por_classe"],
            "concentracao_ourinhos_pct": ops_payload["concentracao_regional"]["polo_ourinhos_pct"],
            "casos_criticos_emergencia": ops_payload["casos_criticos_emergencia"]
        }

        # Etapa 4: Agente Gemini AI
        insights = self.gemini_agent.generate_insights_from_context(consolidated_context)
        self._cached_insights = insights
        return insights
