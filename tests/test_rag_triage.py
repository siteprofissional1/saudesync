"""
SAÚDE SYNC — Testes Automatizados: Motor RAG e Simulador de Triagem
"""

import pytest
from backend.app.services.rag_service import RagService
from backend.app.models.triage import TriageSimulationRequest

@pytest.fixture
def rag_service():
    return RagService()

def test_triage_simulation_valid_response(rag_service):
    """Valida a execução completa da simulação de triagem por similaridade."""
    req = TriageSimulationRequest(
        paciente_idade=45,
        paciente_sexo="M",
        municipio_origem="Ourinhos",
        sintoma_principal="Febre alta (39°C), mialgia retro-orbitária intensa e exantema (Suspeita de Dengue)",
        comorbidades="Nenhuma declarada",
        pressao_sistolica_mmhg=115,
        pressao_diastolica_mmhg=75,
        frequencia_cardiaca_bpm=92,
        temperatura_axilar_c=39.1,
        saturacao_o2_percent=98,
        glicemia_capilar_mg_dl=100,
        escala_dor_0_10=6
    )
    res = rag_service.simulate_triage(req)
    assert res.classificacao_sugerida in [
        "Vermelho - Emergência", "Laranja - Muito Urgente", "Amarelo - Urgente",
        "Verde - Pouco Urgente", "Azul - Não Urgente"
    ]
    assert res.confianca_estatistica_pct > 0.0
    assert len(res.casos_similares) > 0
    assert "explicabilidade" in res.model_dump()
    assert "disclaimer" in res.model_dump()

def test_triage_disclaimer_and_no_prescriptions(rag_service):
    """Garante que a resposta contém os avisos normativos de caráter acadêmico."""
    req = TriageSimulationRequest(
        paciente_idade=60,
        paciente_sexo="F",
        municipio_origem="Ourinhos",
        sintoma_principal="Dor torácica súbita irradiada para braço esquerdo e sudorese fria",
        comorbidades="Hipertensão Arterial Sistêmica (HAS)",
        pressao_sistolica_mmhg=180,
        pressao_diastolica_mmhg=110,
        frequencia_cardiaca_bpm=120,
        temperatura_axilar_c=36.7,
        saturacao_o2_percent=89,
        glicemia_capilar_mg_dl=150,
        escala_dor_0_10=9
    )
    res = rag_service.simulate_triage(req)
    # Casos com dor torácica aguda e dessaturação devem tender a alta prioridade (Vermelho ou Laranja)
    assert res.classificacao_sugerida in ["Vermelho - Emergência", "Laranja - Muito Urgente"]
    assert "Não substitui avaliação" in res.disclaimer
