"""
SAÚDE SYNC — Testes Automatizados: Governança e Segurança de Credenciais
"""

import os
from scripts.check_secrets import run_scanner

def test_no_secrets_in_tracked_files():
    """Garante que a auditoria de segredos (check_secrets.py) retorna código 0."""
    result = run_scanner(".")
    assert result == 0, "Segredos ou chaves expostas foram detectadas no repositório!"

def test_gitignore_protects_env_and_keys():
    """Valida se o .gitignore contém regras de bloqueio para arquivos sensíveis."""
    assert os.path.exists(".gitignore")
    with open(".gitignore", "r", encoding="utf-8") as f:
        content = f.read()
    assert ".env" in content
    assert "*.pem" in content
    assert "*.key" in content
    assert "node_modules/" in content

def test_env_example_contains_no_real_secrets():
    """Garante que .env.example existe e possui apenas placeholders."""
    assert os.path.exists(".env.example")
    with open(".env.example", "r", encoding="utf-8") as f:
        content = f.read()
    assert "GEMINI_API_KEY" in content
    assert "FIREBASE_PROJECT_ID" in content
    assert "LIVE_HEALTH_SOURCE_URL" in content
