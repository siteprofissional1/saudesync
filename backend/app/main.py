"""
SAÚDE SYNC — Aplicação Principal FastAPI
Backend de Inteligência Operacional e Gestão de Triagem em Saúde
Hackathon Antigravity — SENAI Ourinhos
"""

import sys
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import ALLOWED_ORIGINS, PORT, HOST
from backend.app.routes import (
    health_router,
    dashboard_router,
    analytics_router,
    triage_router,
    insights_router,
    live_data_router
)

# Garantir UTF-8 no console Windows
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Configuração de Logs
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("saudesync.main")

# Inicialização da Aplicação FastAPI
app = FastAPI(
    title="Saúde Sync — API de Inteligência Operacional",
    description=(
        "Central inteligente de gestão de triagem, filas em tempo real e analytics preditivo-descritivo em saúde. "
        "Desenvolvido para o Hackathon Antigravity — Projeto Final SENAI Ourinhos."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuração de CORS Restritivo e Seguro
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Inclusão dos Roteadores Modulares
app.include_router(health_router)
app.include_router(dashboard_router)
app.include_router(analytics_router)
app.include_router(triage_router)
app.include_router(insights_router)
app.include_router(live_data_router)

@app.on_event("startup")
async def startup_event():
    logger.info("==================================================")
    logger.info("SAÚDE SYNC API INICIADA COM SUCESSO!")
    logger.info(f"Origens CORS permitidas: {ALLOWED_ORIGINS}")
    logger.info("Docs disponíveis em: /docs")
    logger.info("==================================================")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=HOST, port=PORT, reload=True)
