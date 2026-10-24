"""
SAÚDE SYNC — Rotas de Diagnóstico e Saúde do Sistema (Health Check)
"""

from fastapi import APIRouter
from backend.app.services.csv_service import CsvService
from backend.app.config import GEMINI_API_KEY, FIREBASE_PROJECT_ID

router = APIRouter(tags=["Health"])
csv_service = CsvService()

@router.get("/api/health")
def get_health_status():
    """
    Retorna o estado de saúde do backend e seus serviços integrados.
    """
    try:
        df = csv_service.get_raw_df()
        dataset_loaded = True
        dataset_rows = len(df)
    except Exception:
        dataset_loaded = False
        dataset_rows = 0

    return {
        "status": "ok",
        "service": "saude-sync-api",
        "version": "1.0.0",
        "dataset_loaded": dataset_loaded,
        "dataset_rows": dataset_rows,
        "firebase": "configured" if FIREBASE_PROJECT_ID else "demo_mode",
        "gemini": "configured" if GEMINI_API_KEY else "rule_based_fallback",
        "scraper": "available"
    }

@router.get("/api/dataset/schema")
def get_dataset_schema():
    """
    Retorna a estrutura de colunas e tipos do dataset de triagem.
    """
    df = csv_service.get_raw_df()
    columns_info = []
    for col in df.columns:
        if col in ["data_hora_chegada_dt", "data_apenas", "hora_apenas"]:
            continue
        columns_info.append({
            "column": col,
            "type": str(df[col].dtype),
            "sample_value": str(df[col].iloc[0]) if len(df) > 0 else None,
            "null_count": int(df[col].isnull().sum()),
            "unique_count": int(df[col].nunique())
        })

    return {
        "total_rows": len(df),
        "total_columns": len(columns_info),
        "columns": columns_info
    }
