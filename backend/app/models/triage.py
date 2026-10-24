"""
SAÚDE SYNC — Modelos Pydantic para Simulação de Triagem
Validação de entrada estrita para sinais vitais e integridade de dados.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, field_validator

class TriageSimulationRequest(BaseModel):
    """
    Dados de entrada para o simulador de triagem baseado em similaridade histórica.
    """
    paciente_nome: Optional[str] = Field(default="Paciente Demonstrativo", description="Nome completo do paciente")
    paciente_idade: int = Field(..., ge=0, le=125, description="Idade do paciente em anos")
    paciente_sexo: str = Field(..., description="Sexo do paciente ('M' ou 'F')")
    municipio_origem: str = Field(default="Ourinhos", description="Município de residência")
    sintoma_principal: str = Field(..., min_length=3, description="Queixa ou sintoma principal")
    comorbidades: str = Field(default="Nenhuma declarada", description="Comorbidades prévias")
    
    # Sinais Vitais
    pressao_sistolica_mmhg: int = Field(..., ge=40, le=280, description="Pressão arterial sistólica em mmHg")
    pressao_diastolica_mmhg: int = Field(..., ge=20, le=160, description="Pressão arterial diastólica em mmHg")
    frequencia_cardiaca_bpm: int = Field(..., ge=30, le=240, description="Frequência cardíaca em batimentos por minuto")
    temperatura_axilar_c: float = Field(..., ge=32.0, le=44.0, description="Temperatura axilar em graus Celsius")
    saturacao_o2_percent: int = Field(..., ge=40, le=100, description="Saturação de oxigênio em %")
    glicemia_capilar_mg_dl: int = Field(..., ge=20, le=700, description="Glicemia capilar em mg/dL")
    escala_dor_0_10: int = Field(..., ge=0, le=10, description="Escala de dor referida de 0 a 10")

    @field_validator("paciente_sexo")
    @classmethod
    def validate_sexo(cls, v: str) -> str:
        v_upper = v.strip().upper()
        if v_upper not in ["M", "F", "OUTRO"]:
            raise ValueError("Sexo deve ser 'M', 'F' ou 'OUTRO'")
        return v_upper

class SimilarCaseItem(BaseModel):
    """
    Representação compacta de caso análogo recuperado pelo RAG local.
    """
    atendimento_id: str
    sintoma_principal: str
    classificacao_manchester: str
    tempo_espera_real_min: int
    tempo_espera_max_min: int
    especialidade_requerida: str
    conduta_historica_simulada: str

class TriageSimulationResponse(BaseModel):
    """
    Resultado explicável da classificação acadêmica com base no dataset.
    """
    paciente_nome: str = "Paciente Demonstrativo"
    classificacao_sugerida: str
    cor_hex: str
    tempo_referencia_max_min: int
    confianca_estatistica_pct: float
    total_casos_analisados: int
    distribuicao_classes: Dict[str, int]
    tempo_medio_espera_historico_min: float
    especialidade_mais_frequente: str
    explicabilidade: str
    casos_similares: List[SimilarCaseItem]
    disclaimer: str = (
        "Classificação acadêmica demonstrativa baseada no dataset histórico. "
        "Não substitui avaliação, diagnóstico ou decisão clínica realizada por profissionais de saúde."
    )
