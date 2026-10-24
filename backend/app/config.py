"""
SAÚDE SYNC — Configurações Gerais da Aplicação
Carrega variáveis de ambiente e define caminhos e parâmetros globais.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Localizar raiz do projeto
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Carregar arquivo .env se existir na raiz
env_file = BASE_DIR / ".env"
if env_file.exists():
    load_dotenv(env_file)

# Configurações do Servidor
PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "0.0.0.0")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# CORS Origins
raw_origins = os.getenv(
    "FRONTEND_ORIGIN",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000,http://localhost:3000"
)
ALLOWED_ORIGINS = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

# Caminhos dos Dados
DATA_FILE_PATH = os.getenv(
    "DATA_FILE_PATH",
    str(BASE_DIR / "data" / "data_saudesync_triagem.csv")
)
# Fallback caso execute a partir de subpasta
if not os.path.exists(DATA_FILE_PATH):
    alt_path = BASE_DIR / "data_saudesync_triagem.csv"
    if alt_path.exists():
        DATA_FILE_PATH = str(alt_path)

# Configurações de IA (Google Gemini)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Configurações do Firebase
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "saudesync")
GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT", "saudesync")
GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")

# Web Scraping de Saúde de Ourinhos e Região
LIVE_HEALTH_SOURCE_URL = os.getenv(
    "LIVE_HEALTH_SOURCE_URL",
    "https://www.ourinhos.sp.gov.br/portal/secretarias/13/secretaria-municipal-de-saude/"
)
SCRAPER_CACHE_TTL_SECONDS = int(os.getenv("SCRAPER_CACHE_TTL_SECONDS", 1800))  # 30 minutos
