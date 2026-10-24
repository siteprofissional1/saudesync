"""
SAÚDE SYNC — Testes Automatizados: Scraper e Resiliência de Dados Vivos
"""

import pytest
from backend.app.services.scraper_service import ScraperService

@pytest.fixture
def scraper_service():
    return ScraperService()

def test_scraper_returns_health_facilities(scraper_service):
    """Garante que o scraper retorna estabelecimentos de saúde estruturados de Ourinhos."""
    data = scraper_service.fetch_live_data(force_refresh=False)
    assert data.total_estabelecimentos >= 4
    assert len(data.estabelecimentos) >= 4
    primeiro = data.estabelecimentos[0]
    assert primeiro.nome != ""
    assert primeiro.tipo != ""
    assert "Ourinhos" in primeiro.municipio

def test_scraper_cache_mechanism(scraper_service):
    """Valida se requisições consecutivas utilizam o cache."""
    # Primeira chamada
    data1 = scraper_service.fetch_live_data(force_refresh=False)
    # Segunda chamada imediata deve estar em cache
    data2 = scraper_service.fetch_live_data(force_refresh=False)
    assert data2.is_cached is True
    assert data2.total_estabelecimentos == data1.total_estabelecimentos
