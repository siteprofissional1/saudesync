"""
SAÚDE SYNC — Serviço do Firebase Cloud Firestore
Gerencia acesso e sincronização da coleção 'fila_atendimento' com fallback local.
"""

import os
import json
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from backend.app.config import FIREBASE_PROJECT_ID, GOOGLE_APPLICATION_CREDENTIALS

logger = logging.getLogger("saudesync.firebase")

class FirebaseService:
    """
    Abstração de acesso ao Firestore no backend.
    """
    _sample_file = ".tmp/firestore_seed_sample.json"

    def __init__(self):
        self.project_id = FIREBASE_PROJECT_ID
        self.is_configured = bool(self.project_id and self.project_id != "")

    def get_queue_records(self) -> List[Dict[str, Any]]:
        """
        Retorna os atendimentos ativos da fila em tempo real.
        """
        # Se arquivo de amostra existir em .tmp/, carregar
        if os.path.exists(self._sample_file):
            try:
                with open(self._sample_file, "r", encoding="utf-8") as f:
                    records = json.load(f)
                    return records
            except Exception as e:
                logger.warning(f"Erro ao ler amostra local do Firestore: {e}")

        # Se não existir em .tmp/, gerar a partir do CSV
        from backend.app.services.csv_service import CsvService
        csv_service = CsvService()
        df = csv_service.get_raw_df()
        
        status_alvo = ["Aguardando na Fila", "Aguardando Chamada Prioritária", "Em Atendimento Médico"]
        subset = df[df["status_atendimento"].isin(status_alvo)].head(35)
        
        records = []
        for _, row in subset.iterrows():
            records.append({
                "atendimento_id": str(row["atendimento_id"]),
                "senha_painel": str(row["senha_painel"]),
                "paciente_idade": int(row["paciente_idade"]),
                "paciente_sexo": str(row["paciente_sexo"]),
                "municipio_origem": str(row["municipio_origem"]),
                "sintoma_principal": str(row["sintoma_principal"]),
                "classificacao": str(row["classificacao_manchester"]),
                "tempo_espera_real_min": int(row["tempo_espera_real_min"]),
                "tempo_espera_max_min": int(row["tempo_espera_max_min"]),
                "especialidade": str(row["especialidade_requerida"]),
                "medico_plantonista": str(row["medico_plantonista"]),
                "leito": str(row["leito_disponivel"]),
                "status": str(row["status_atendimento"]),
                "data_hora_chegada": str(row["data_hora_chegada"]),
                "updated_at": datetime.now().isoformat()
            })
        return records
