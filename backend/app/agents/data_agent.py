"""
SAÚDE SYNC — Data Agent
Agente determinístico responsável por mineração, agregações e métricas do dataset.
"""

from typing import Dict, Any
from backend.app.services.csv_service import CsvService

class DataAgent:
    """
    Agente de Dados: Responsável exclusivo pela integridade e cálculo de métricas sobre o CSV.
    Não consome tokens de IA.
    """
    def __init__(self):
        self.csv_service = CsvService()

    def get_data_insights_payload(self) -> Dict[str, Any]:
        """
        Calcula agregações exatas sobre a base completa de 1.200 atendimentos.
        """
        df = self.csv_service.get_raw_df()
        summary = self.csv_service.calculate_summary(df)

        # Distribuição de Manchester
        manch_counts = df["classificacao_manchester"].value_counts().to_dict()

        # Top 5 sintomas
        top_sintomas = df["sintoma_principal"].value_counts().head(5).to_dict()

        # Top 5 especialidades
        top_especialidades = df["especialidade_requerida"].value_counts().head(5).to_dict()

        # Top 5 municípios de origem
        top_municipios = df["municipio_origem"].value_counts().head(5).to_dict()

        # Picos de horário
        pico_horario = int(df["hora_apenas"].value_counts().idxmax())
        volume_pico = int(df["hora_apenas"].value_counts().max())

        return {
            "total_atendimentos": summary["total_atendimentos"],
            "tempo_medio_espera_min": summary["tempo_medio_espera_min"],
            "tempo_mediano_espera_min": summary["tempo_mediano_espera_min"],
            "p90_espera_min": summary["p90_espera_min"],
            "pacientes_acima_tempo": summary["acima_tempo_referencia"],
            "percentual_acima_tempo": summary["percentual_acima_tempo"],
            "especialidade_lider": summary["especialidade_mais_demandada"],
            "municipio_lider": summary["municipio_maior_volume"],
            "distribuicao_manchester": manch_counts,
            "top_sintomas": top_sintomas,
            "top_especialidades": top_especialidades,
            "top_municipios": top_municipios,
            "horario_pico": f"{pico_horario:02d}:00",
            "volume_no_pico": volume_pico
        }
