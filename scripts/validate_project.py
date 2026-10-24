"""
SAÚDE SYNC — Validador Geral de Integridade do Projeto
Verifica a existência de todos os arquivos obrigatórios, diretivas, CSVs e contratos.
"""

import os
import sys

# Garantir UTF-8 no console Windows
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Lista de arquivos e pastas obrigatórias para conformidade 100%
REQUIRED_PATHS = [
    # Dados
    "data/data_saudesync_triagem.csv",
    "data_saudesync_triagem.csv",
    # Governança & Diretivas
    "directives/ideia-projeto.md",
    "directives/projeto-modelo.md",
    "directives/projeto.md",
    "directives/prompt-iaexterna-gemini.md",
    "directives/design/ideia-design.md",
    "directives/design/design.md",
    "directives/design/prompt-iaexterna-design.md",
    "directives/design/prompt-stitch-design.md",
    "directives/SOP/01-dataset-rag.md",
    "directives/SOP/02-dashboard-analytics.md",
    "directives/SOP/03-fila-realtime.md",
    "directives/SOP/04-triagem-simulada.md",
    "directives/SOP/05-multiagentes-gemini.md",
    "directives/SOP/06-scraping-dados-vivos.md",
    "directives/SOP/07-firebase-firestore.md",
    "directives/SOP/08-seguranca.md",
    "directives/SOP/09-deploy-ci-cd.md",
    "directives/SOP/10-testes-resiliencia.md",
    # Governança Institucional & Histórico
    "documentation/promptHistory.md",
    # Segurança & Infraestrutura
    ".gitignore",
    ".env.example",
    "firestore.rules",
    "mcp_config.json",
    # Scripts Operacionais
    "scripts/analyze_dataset.py",
    "scripts/check_secrets.py",
    "scripts/seed_firestore.py",
    "scripts/validate_project.py"
]

def validate_project():
    print("=" * 60)
    print("SAÚDE SYNC — VALIDAÇÃO GERAL DE REQUISITOS DO PROJETO")
    print("=" * 60)

    missing = []
    for path in REQUIRED_PATHS:
        if not os.path.exists(path):
            missing.append(path)

    if missing:
        print(f"❌ Falha de validação! {len(missing)} arquivo(s) obrigatório(s) ausente(s):")
        for m in missing:
            print(f"   - {m}")
        print("=" * 60)
        return 1
    else:
        print(f"✅ Todos os {len(REQUIRED_PATHS)} arquivos normativos obrigatórios estão presentes!")
        print("=" * 60)
        return 0

if __name__ == "__main__":
    sys.exit(validate_project())
