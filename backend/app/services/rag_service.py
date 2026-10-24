"""
SAÚDE SYNC — Serviço RAG Local & Simulador Baseado em Similaridade
Recupera casos históricos similares deterministicamente e calcula a classe Manchester sugerida.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List
from backend.app.services.csv_service import CsvService, MANCHESTER_COLORS
from backend.app.models.triage import TriageSimulationRequest, TriageSimulationResponse, SimilarCaseItem

class RagService:
    """
    Motor RAG determinístico sobre o dataset local de triagem.
    """
    def __init__(self):
        self.csv_service = CsvService()

    def simulate_triage(self, req: TriageSimulationRequest) -> TriageSimulationResponse:
        """
        Executa a simulação explicável de triagem por vizinhança clínica.
        """
        df = self.csv_service.get_raw_df()

        # 1. Filtro por sintoma principal (casos idênticos ou que compartilham queixa)
        sintoma_busca = req.sintoma_principal.strip()
        subset = df[df["sintoma_principal"].str.contains(sintoma_busca[:25], case=False, na=False, regex=False)].copy()

        # Se houver poucos registros pelo sintoma exato, ampliar para a base total
        if len(subset) < 10:
            subset = df.copy()

        # 2. Normalização e cálculo de distância clínica ponderada
        # Features: idade, PA Sistólica, FC, Temp, SpO2, Dor
        idade_diff = np.abs(subset["paciente_idade"] - req.paciente_idade) / 100.0
        pa_diff = np.abs(subset["pressao_sistolica_mmhg"] - req.pressao_sistolica_mmhg) / 150.0
        fc_diff = np.abs(subset["frequencia_cardiaca_bpm"] - req.frequencia_cardiaca_bpm) / 120.0
        temp_diff = np.abs(subset["temperatura_axilar_c"] - req.temperatura_axilar_c) / 4.0
        spo2_diff = np.abs(subset["saturacao_o2_percent"] - req.saturacao_o2_percent) / 20.0
        dor_diff = np.abs(subset["escala_dor_0_10"] - req.escala_dor_0_10) / 10.0

        # Ponderação clínica: SpO2 crítica e Dor intensa têm peso maior na emergência
        distancia = (
            (idade_diff * 1.0) +
            (pa_diff * 1.5) +
            (fc_diff * 1.5) +
            (temp_diff * 1.2) +
            (spo2_diff * 2.5) +
            (dor_diff * 2.0)
        )
        subset["distancia_clinica"] = distancia

        # Selecionar os 15 vizinhos mais próximos
        k_vizinhos = subset.sort_values(by="distancia_clinica").head(15)

        # 3. Votação ponderada
        pesos = 1.0 / (k_vizinhos["distancia_clinica"] + 0.05)
        votos_por_classe: Dict[str, float] = {}
        contagem_classes: Dict[str, int] = {}

        for idx, row in k_vizinhos.iterrows():
            cls = row["classificacao_manchester"]
            peso = pesos.loc[idx]
            votos_por_classe[cls] = votos_por_classe.get(cls, 0.0) + peso
            contagem_classes[cls] = contagem_classes.get(cls, 0) + 1

        # Identificar classe vencedora
        classe_vencedora = max(votos_por_classe.items(), key=lambda x: x[1])[0]
        total_pesos = sum(votos_por_classe.values())
        confianca_pct = round((votos_por_classe[classe_vencedora] / total_pesos) * 100, 1)

        # Tempo de referência da classe
        tempo_ref_map = {
            "Vermelho - Emergência": 0,
            "Laranja - Muito Urgente": 10,
            "Amarelo - Urgente": 60,
            "Verde - Pouco Urgente": 120,
            "Azul - Não Urgente": 240
        }
        tempo_ref = tempo_ref_map.get(classe_vencedora, 60)
        cor_hex = MANCHESTER_COLORS.get(classe_vencedora, "#2F80ED")

        # Tempo médio histórico e especialidade dos casos similares
        tempo_medio_hist = float(k_vizinhos["tempo_espera_real_min"].mean())
        esp_mode = k_vizinhos["especialidade_requerida"].mode()
        especialidade_predom = str(esp_mode[0]) if not esp_mode.empty else "Clínica Geral"

        # Formatar amostra de casos análogos
        casos_amostra = []
        for _, row in k_vizinhos.head(4).iterrows():
            casos_amostra.append(SimilarCaseItem(
                atendimento_id=str(row["atendimento_id"]),
                sintoma_principal=str(row["sintoma_principal"]),
                classificacao_manchester=str(row["classificacao_manchester"]),
                tempo_espera_real_min=int(row["tempo_espera_real_min"]),
                tempo_espera_max_min=int(row["tempo_espera_max_min"]),
                especialidade_requerida=str(row["especialidade_requerida"]),
                conduta_historica_simulada=str(row.get("protocolo_sugerido_ia", "Orientação padrão"))
            ))

        # Texto de explicabilidade determinística
        explicabilidade = (
            f"Análise baseada em {len(k_vizinhos)} registros históricos com perfil clínico similar. "
            f"A classificação predominante foi '{classe_vencedora}' com índice de concordância de {confianca_pct}%. "
            f"Casos com dor nível {req.escala_dor_0_10}/10, saturação de {req.saturacao_o2_percent}% e queixa de "
            f"'{req.sintoma_principal[:40]}' historicamente foram acolhidos pela especialidade '{especialidade_predom}' "
            f"com tempo médio de espera de {tempo_medio_hist:.1f} minutos na base analisada."
        )

        return TriageSimulationResponse(
            paciente_nome=req.paciente_nome or "Paciente Demonstrativo",
            classificacao_sugerida=classe_vencedora,
            cor_hex=cor_hex,
            tempo_referencia_max_min=tempo_ref,
            confianca_estatistica_pct=confianca_pct,
            total_casos_analisados=len(k_vizinhos),
            distribuicao_classes=contagem_classes,
            tempo_medio_espera_historico_min=round(tempo_medio_hist, 1),
            especialidade_mais_frequente=especialidade_predom,
            explicabilidade=explicabilidade,
            casos_similares=casos_amostra
        )

    def retrieve_context_for_gemini(self, query: str = "") -> Dict[str, Any]:
        """
        Gera um payload compacto de contexto RAG determinístico para síntese pelo Gemini.
        """
        summary = self.csv_service.calculate_summary()
        df = self.csv_service.get_raw_df()

        # Distribuição de Manchester
        dist_manch = df["classificacao_manchester"].value_counts().to_dict()
        top_sintomas = df["sintoma_principal"].value_counts().head(5).to_dict()
        top_municipios = df["municipio_origem"].value_counts().head(5).to_dict()

        return {
            "total_atendimentos": summary["total_atendimentos"],
            "tempo_medio_minutos": summary["tempo_medio_espera_min"],
            "p90_minutos": summary["p90_espera_min"],
            "pacientes_acima_tempo_meta": summary["acima_tempo_referencia"],
            "percentual_acima_tempo": summary["percentual_acima_tempo"],
            "distribuicao_manchester": dist_manch,
            "principais_sintomas": top_sintomas,
            "principais_municipios": top_municipios,
            "especialidade_lider": summary["especialidade_mais_demandada"]
        }
