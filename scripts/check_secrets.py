"""
SAÚDE SYNC — Auditoria e Scanner de Segredos
Verifica se existem credenciais reais, tokens ou segredos expostos no código-fonte.
"""

import os
import re
import sys

# Garantir saída UTF-8 no Windows
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Padrões de risco
SECRET_PATTERNS = [
    (r"ghp_[0-9a-zA-Z]{36}", "GitHub Personal Access Token"),
    (r"github_pat_[0-9a-zA-Z_]{82}", "GitHub Fine-Grained Token"),
    (r"-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----", "Chave Privada PEM"),
    (r"AIza[0-9A-Za-z-_]{35}", "Chave Google/Firebase em arquivo versionado"),
    (r"sk-[a-zA-Z0-9]{48}", "Chave OpenAI"),
]

# Pastas e arquivos ignorados
IGNORED_DIRS = {
    ".git", ".tmp", "node_modules", "__pycache__", ".pytest_cache",
    ".venv", "venv", "dist", "build", ".ag-kit"
}
IGNORED_FILES = {
    ".env", ".env.local", ".env.production", "check_secrets.py"
}

def scan_file(filepath: str):
    issues = []
    # Ignorar arquivos binários e CSVs
    if filepath.endswith((".csv", ".png", ".jpg", ".jpeg", ".ico", ".svg", ".lock")):
        return issues

    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            for line_no, line in enumerate(f, start=1):
                # Se for .env.example, ignorar menção da chave de exemplo
                if "example" in filepath.lower() or ".env.example" in filepath:
                    continue
                for pattern, desc in SECRET_PATTERNS:
                    if re.search(pattern, line):
                        issues.append((filepath, line_no, desc))
    except Exception as e:
        pass
    return issues

def run_scanner(root_dir="."):
    print("=" * 55)
    print("SAÚDE SYNC — AUDITORIA DE SEGURANÇA E SEGREDOS")
    print("=" * 55)

    all_issues = []
    total_files = 0

    for root, dirs, files in os.walk(root_dir):
        # Filtrar diretórios ignorados
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS and not d.startswith(".tmp")]

        for file in files:
            if file in IGNORED_FILES:
                continue
            filepath = os.path.join(root, file)
            total_files += 1
            issues = scan_file(filepath)
            if issues:
                all_issues.extend(issues)

    print(f"Arquivos inspecionados: {total_files}")

    if all_issues:
        print("\n[ALERTA] Segredos potenciais detectados:")
        for path, line, desc in all_issues:
            print(f"  ❌ {path}:{line} -> {desc}")
        print("\nRemova ou oculte as credenciais antes de realizar o deploy!")
        return 1
    else:
        print("\n✅ Nenhum segredo ou chave privada exposta no código versionável!")
        print("=" * 55)
        return 0

if __name__ == "__main__":
    exit_code = run_scanner(".")
    sys.exit(exit_code)
