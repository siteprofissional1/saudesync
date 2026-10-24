"""
SAÚDE SYNC — Script de Seeding do Firebase Cloud Firestore
Lê o dataset de triagem e popula uma amostra representativa de atendimentos
ativos em espera na coleção 'fila_atendimento'.
"""

import os
import sys
import json
import pandas as pd
from datetime import datetime

# Garantir UTF-8 no console Windows
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def seed_firestore(csv_path="data/data_saudesync_triagem.csv", limit=35):
    print("=" * 55)
    print("SAÚDE SYNC — POVOAMENTO (SEED) DO FIRESTORE")
    print("=" * 55)

    if not os.path.exists(csv_path):
        print(f"Erro: Arquivo CSV não encontrado em {csv_path}")
        return 1

    df = pd.read_csv(csv_path, encoding="utf-8")

    # Filtrar preferencialmente registros com status de fila ou atendimento ativo
    status_alvo = [
        "Aguardando na Fila",
        "Aguardando Chamada Prioritária",
        "Em Atendimento Médico",
        "Em Medicação / Hidratação",
        "Aguardando Resultado de Exame"
    ]
    df_ativos = df[df["status_atendimento"].isin(status_alvo)]
    if len(df_ativos) < limit:
        df_ativos = df

    # Amostragem equilibrada cobrindo todas as 5 cores do Manchester
    amostras = []
    classes = df_ativos["classificacao_manchester"].unique()
    qtd_por_classe = max(1, limit // len(classes))

    for cls in classes:
        subset = df_ativos[df_ativos["classificacao_manchester"] == cls]
        amostras.append(subset.head(qtd_por_classe))

    df_amostra = pd.concat(amostras).drop_duplicates(subset=["atendimento_id"]).head(limit)

    documentos = []
    for _, row in df_amostra.iterrows():
        doc = {
            "atendimento_id": str(row["atendimento_id"]),
            "senha_painel": str(row["senha_painel"]),
            "paciente_idade": int(row["paciente_idade"]),
            "paciente_sexo": str(row["paciente_sexo"]),
            "municipio_origem": str(row["municipio_origem"]),
            "sintoma_principal": str(row["sintoma_principal"]),
            "classificacao": str(row["classificacao_manchester"]),
            "tempo_espera_real_min": int(row["tempo_espera_real_min"]),
            "tempo_espera_max_min": int(row["tempo_espera_max_min"]),
            "especialidade": str(row["especialidade_requerida"]),
            "medico_plantonista": str(row["medico_plantonista"]),
            "leito": str(row["leito_disponivel"]),
            "status": str(row["status_atendimento"]),
            "data_hora_chegada": str(row["data_hora_chegada"]),
            "updated_at": datetime.now().isoformat()
        }
        documentos.append(doc)

    # Salvar snapshot local da amostra em .tmp/
    os.makedirs(".tmp", exist_ok=True)
    sample_file = ".tmp/firestore_seed_sample.json"
    with open(sample_file, "w", encoding="utf-8") as f:
        json.dump(documentos, f, indent=2, ensure_ascii=False)

    print(f"Dataset lido: {len(df)} registros.")
    print(f"Amostra selecionada: {len(documentos)} documentos ativos.")
    print(f"Distribuição da amostra por Manchester:")
    contagem_classes = df_amostra["classificacao_manchester"].value_counts().to_dict()
    for c, q in contagem_classes.items():
        print(f"  - {c}: {q}")

    # Tentativa de inserção via Firebase Admin SDK se credenciais existirem
    firebase_inserido = False
    project_id = os.getenv("FIREBASE_PROJECT_ID", "saudesync")
    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

    if cred_path and os.path.exists(cred_path):
        try:
            import firebase_admin
            from firebase_admin import credentials, firestore

            if not firebase_admin._apps:
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred, {"projectId": project_id})

            db = firestore.client()
            batch = db.batch()
            for doc in documentos:
                doc_ref = db.collection("fila_atendimento").document(doc["atendimento_id"])
                batch.set(doc_ref, doc)
            batch.commit()
            firebase_inserido = True
            print("✅ Documentos sincronizados diretamente no Firebase Cloud Firestore!")
        except Exception as e:
            print(f"Nota: Inserção direta via Admin SDK não completada ({e}).")

    if not firebase_inserido:
        print(f"ℹ️ Amostra gerada e persistida em '{sample_file}'.")
        print("   O frontend e backend utilizarão esta amostra no modo realtime/demo!")

    print("=" * 55)
    return 0

if __name__ == "__main__":
    seed_firestore()
