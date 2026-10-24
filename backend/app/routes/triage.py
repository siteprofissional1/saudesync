"""
SAÚDE SYNC — Rotas de Simulação de Triagem & RAG Local
"""

from fastapi import APIRouter
from backend.app.models.triage import TriageSimulationRequest, TriageSimulationResponse
from backend.app.services.rag_service import RagService

router = APIRouter(tags=["Triage"])
rag_service = RagService()

@router.post("/api/triage/simulate", response_model=TriageSimulationResponse)
def simulate_patient_triage(req: TriageSimulationRequest):
    """
    Classifica um cenário clínico fictício através de vizinhos mais próximos no dataset.
    """
    return rag_service.simulate_triage(req)

@router.get("/api/triage/defaults")
def get_sample_triage_scenarios():
    """
    Retorna 3 cenários clínicos pré-configurados para teste imediato de demonstração.
    """
    return {
        "scenarios": [
            {
                "nome": "Cenário 1 — Suspeita de Dengue com Febre Alta (Urgente)",
                "data": {
                    "paciente_idade": 34,
                    "paciente_sexo": "M",
                    "municipio_origem": "Ourinhos",
                    "sintoma_principal": "Febre alta (39°C), mialgia retro-orbitária intensa e exantema (Suspeita de Dengue)",
                    "comorbidades": "Nenhuma declarada",
                    "pressao_sistolica_mmhg": 118,
                    "pressao_diastolica_mmhg": 78,
                    "frequencia_cardiaca_bpm": 96,
                    "temperatura_axilar_c": 39.2,
                    "saturacao_o2_percent": 97,
                    "glicemia_capilar_mg_dl": 105,
                    "escala_dor_0_10": 7
                }
            },
            {
                "nome": "Cenário 2 — Dor Torácica Súbita com Sudorese (Emergência)",
                "data": {
                    "paciente_idade": 58,
                    "paciente_sexo": "M",
                    "municipio_origem": "Ourinhos",
                    "sintoma_principal": "Dor torácica súbita irradiada para braço esquerdo e sudorese fria",
                    "comorbidades": "Hipertensão Arterial Sistêmica (HAS)",
                    "pressao_sistolica_mmhg": 175,
                    "pressao_diastolica_mmhg": 105,
                    "frequencia_cardiaca_bpm": 118,
                    "temperatura_axilar_c": 36.6,
                    "saturacao_o2_percent": 91,
                    "glicemia_capilar_mg_dl": 160,
                    "escala_dor_0_10": 9
                }
            },
            {
                "nome": "Cenário 3 — Sintomas Gripais Leves / Coriza (Pouco Urgente)",
                "data": {
                    "paciente_idade": 28,
                    "paciente_sexo": "F",
                    "municipio_origem": "Ourinhos",
                    "sintoma_principal": "Coriza hialina, espirros, tosse seca leve há 3 dias e afebril (IVAS não complicada)",
                    "comorbidades": "Nenhuma declarada",
                    "pressao_sistolica_mmhg": 115,
                    "pressao_diastolica_mmhg": 75,
                    "frequencia_cardiaca_bpm": 72,
                    "temperatura_axilar_c": 36.5,
                    "saturacao_o2_percent": 99,
                    "glicemia_capilar_mg_dl": 92,
                    "escala_dor_0_10": 2
                }
            }
        ]
    }
