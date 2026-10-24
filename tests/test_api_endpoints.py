"""
SAÚDE SYNC — Testes Automatizados: Endpoints da API FastAPI
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

@pytest.fixture
def client():
    return TestClient(app)

def test_endpoint_health(client):
    """Testa o endpoint de diagnóstico /api/health."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["dataset_loaded"] is True
    assert data["dataset_rows"] == 1200

def test_endpoint_schema(client):
    """Testa o endpoint de schema /api/dataset/schema."""
    response = client.get("/api/dataset/schema")
    assert response.status_code == 200
    data = response.json()
    assert data["total_rows"] == 1200
    assert data["total_columns"] >= 24

def test_endpoint_dashboard_summary(client):
    """Testa o endpoint de KPIs do painel."""
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_atendimentos"] == 1200
    assert data["tempo_medio_espera_min"] > 0
    assert data["acima_tempo_referencia"] > 0

def test_endpoint_dashboard_charts(client):
    """Testa o endpoint com os gráficos para Plotly.js."""
    response = client.get("/api/dashboard/charts")
    assert response.status_code == 200
    data = response.json()
    assert "distribuicao_manchester" in data
    assert "tempo_real_vs_limite" in data
    assert "status_atendimento" in data
    assert "volume_por_horario" in data

def test_endpoint_analytics_pagination(client):
    """Testa a paginação de registros em /api/analytics."""
    response = client.get("/api/analytics?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert data["page"] == 1
    assert data["page_size"] == 10
    assert len(data["records"]) == 10
    assert data["total"] == 1200
