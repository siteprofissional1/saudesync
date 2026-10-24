"""
SAÚDE SYNC — Testes Automatizados: Dataset e Integridade de Schema
"""

import os
import pytest
import pandas as pd
from backend.app.services.csv_service import CsvService

@pytest.fixture
def csv_service():
    return CsvService()

def test_dataset_exists(csv_service):
    """Valida se o CSV operacional existe e não está vazio."""
    df = csv_service.get_raw_df()
    assert df is not None
    assert len(df) == 1200
    assert len(df.columns) >= 24

def test_dataset_critical_columns(csv_service):
    """Valida se todas as colunas essenciais estão presentes no schema."""
    df = csv_service.get_raw_df()
    critical_cols = [
        "atendimento_id",
        "data_hora_chegada",
        "senha_painel",
        "paciente_idade",
        "paciente_sexo",
        "municipio_origem",
        "sintoma_principal",
        "classificacao_manchester",
        "tempo_espera_max_min",
        "tempo_espera_real_min",
        "especialidade_requerida",
        "status_atendimento"
    ]
    for col in critical_cols:
        assert col in df.columns, f"Coluna crítica ausente: {col}"

def test_dataset_zero_nulls_in_critical_fields(csv_service):
    """Garante que não existem valores nulos nas colunas de atendimento."""
    df = csv_service.get_raw_df()
    assert df["atendimento_id"].isnull().sum() == 0
    assert df["classificacao_manchester"].isnull().sum() == 0
    assert df["tempo_espera_real_min"].isnull().sum() == 0
    assert df["tempo_espera_max_min"].isnull().sum() == 0

def test_datetime_parsing_integrity(csv_service):
    """Garante que as datas estão no formato esperado YYYY-MM-DD HH:mm e dentro de agosto de 2026."""
    df = csv_service.get_raw_df()
    assert df["data_hora_chegada_dt"].isnull().sum() == 0
    min_date = df["data_hora_chegada_dt"].min()
    max_date = df["data_hora_chegada_dt"].max()
    assert min_date.year == 2026
    assert min_date.month == 8
    assert max_date.year == 2026
    assert max_date.month == 8

def test_manchester_categories_distribution(csv_service):
    """Valida a presença de todas as 5 categorias do Protocolo Manchester."""
    df = csv_service.get_raw_df()
    classes = set(df["classificacao_manchester"].unique())
    expected = {
        "Vermelho - Emergência",
        "Laranja - Muito Urgente",
        "Amarelo - Urgente",
        "Verde - Pouco Urgente",
        "Azul - Não Urgente"
    }
    assert classes == expected
