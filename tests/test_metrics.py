"""
SAÚDE SYNC — Testes Automatizados: Métricas Estatísticas e Filtros
"""

import pytest
import numpy as np
from backend.app.services.csv_service import CsvService

@pytest.fixture
def csv_service():
    return CsvService()

def test_summary_statistical_metrics(csv_service):
    """Valida o cálculo determinístico de média, mediana e P90."""
    summary = csv_service.calculate_summary()
    assert summary["total_atendimentos"] == 1200
    assert summary["tempo_medio_espera_min"] > 55.0
    assert summary["tempo_mediano_espera_min"] > 45.0
    assert summary["p90_espera_min"] > 110.0
    assert summary["acima_tempo_referencia"] > 0
    assert summary["dentro_tempo_referencia"] > 0
    assert summary["acima_tempo_referencia"] + summary["dentro_tempo_referencia"] == 1200

def test_red_zero_minute_division_safety(csv_service):
    """Garante que a classe Vermelha (0 min) é tratada sem provocar divisão por zero."""
    df = csv_service.get_raw_df()
    vermelhos = df[df["classificacao_manchester"] == "Vermelho - Emergência"]
    assert len(vermelhos) > 0
    assert (vermelhos["tempo_espera_max_min"] == 0).all()
    # Qualquer paciente vermelho com tempo real > 0 deve ser classificado como tempo excedido
    excedidos = (vermelhos["tempo_espera_real_min"] > vermelhos["tempo_espera_max_min"]).sum()
    assert excedidos > 0

def test_filtering_by_municipio(csv_service):
    """Valida o isolamento de dados ao filtrar por município polo (Ourinhos)."""
    df_ourinhos = csv_service.filter_data(municipio="Ourinhos")
    assert len(df_ourinhos) == 535
    assert (df_ourinhos["municipio_origem"] == "Ourinhos").all()

def test_filtering_by_classificacao(csv_service):
    """Valida filtragem por nível de prioridade (ex: Laranja)."""
    df_laranja = csv_service.filter_data(classificacao="Laranja - Muito Urgente")
    assert len(df_laranja) == 202
    assert (df_laranja["classificacao_manchester"] == "Laranja - Muito Urgente").all()

def test_combined_filters_consistency(csv_service):
    """Valida o comportamento com múltiplos filtros aplicados em conjunto."""
    df_combo = csv_service.filter_data(
        municipio="Ourinhos",
        classificacao="Amarelo - Urgente",
        sexo="F"
    )
    assert len(df_combo) > 0
    assert (df_combo["municipio_origem"] == "Ourinhos").all()
    assert (df_combo["classificacao_manchester"] == "Amarelo - Urgente").all()
    assert (df_combo["paciente_sexo"] == "F").all()
