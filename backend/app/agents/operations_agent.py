"""
SAÚDE SYNC — Operations Agent
Agente determinístico focado em gestão operacional, cumprimento de metas e detecção de gargalos.
"""

from typing import Dict, Any, List
from backend.app.services.csv_service import CsvService

class OperationsAgent:
    """
    Agente de Operações: Avalia violações de referência, capacidade e gargalos.
    """
    def __init__(self):
        self.csv_service = CsvService()

    def analyze_operational_bottlenecks(self) -> Dict[str, Any]:
        """
        Calcula indicadores de gargalo sobre os dados históricos.
        """
        df = self.csv_service.get_raw_df()

        # Violações de tempo por classificação
        violacoes_por_classe = {}
        for manch, group in df.groupby("classificacao_manchester"):
            total_classe = len(group)
            acima = int((group["tempo_espera_real_min"] > group["tempo_espera_max_min"]).sum())
            perc = round((acima / total_classe) * 100, 1) if total_classe > 0 else 0.0
            violacoes_por_classe[manch] = {
                "total": total_classe,
                "acima_do_tempo": acima,
                "taxa_inadimplencia_pct": perc,
                "tempo_medio_real": round(float(group["tempo_espera_real_min"].mean()), 1),
                "limite_referencia": int(group["tempo_espera_max_min"].iloc[0])
            }

        # Concentração regional (Ourinhos vs Demais Municípios)
        total_pacientes = len(df)
        ourinhos_total = int((df["municipio_origem"] == "Ourinhos").sum())
        ourinhos_pct = round((ourinhos_total / total_pacientes) * 100, 1)

        # Concentração na especialidade principal (Clínica Geral)
        clinica_total = int((df["especialidade_requerida"] == "Clínica Geral").sum())
        clinica_pct = round((clinica_total / total_pacientes) * 100, 1)

        # Taxa de ocupação de leitos/salas vermelhas
        vermelho_total = int((df["classificacao_manchester"] == "Vermelho - Emergência").sum())

        return {
            "violacoes_por_classe": violacoes_por_classe,
            "concentracao_regional": {
                "polo_ourinhos_pct": ourinhos_pct,
                "pacientes_outros_municipios_pct": round(100 - ourinhos_pct, 1)
            },
            "especialidade_concentrada": {
                "nome": "Clínica Geral",
                "participacao_pct": clinica_pct,
                "volume": clinica_total
            },
            "casos_criticos_emergencia": vermelho_total
        }
