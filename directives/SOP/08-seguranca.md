# SOP 08 — Governança, Menor Privilégio & Scanner de Segredos

## 1. Objetivo
Garantir que o repositório e os serviços em produção não exponham credenciais sensíveis, chaves de API, credenciais de Service Account ou tokens de acesso, aplicando o princípio de menor privilégio e auditoria contínua de segurança.

---

## 2. Proteção de Arquivos e `.gitignore`
Arquivos obrigatoriamente excluídos do controle de versão:
```text
.env
.env.*
!.env.example
*.pem
*.key
service-account*.json
firebase-adminsdk*.json
node_modules/
__pycache__/
.pytest_cache/
.venv/
venv/
.tmp/
dist/
```

---

## 3. Gestão de Variáveis de Ambiente
* O arquivo `.env.example` deve listar todos os nomes das variáveis necessárias sem conter segredos reais.
* Variáveis do Backend:
  - `GEMINI_API_KEY`: Chave de acesso à API do Google Gemini.
  - `FIREBASE_PROJECT_ID`: ID do projeto no Firebase.
  - `GOOGLE_APPLICATION_CREDENTIALS`: Caminho para chave da conta de serviço (se aplicável).
  - `LIVE_HEALTH_SOURCE_URL`: URL da fonte pública para web scraping.
  - `FRONTEND_ORIGIN`: Origens permitidas no CORS (ex: `http://localhost:5173,https://siteprofissional.github.io`).
* Variáveis do Frontend (Públicas):
  - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` (credenciais públicas do cliente web).
  - `VITE_API_BASE_URL`: URL base da API FastAPI.

---

## 4. Script de Auditoria de Segredos (`scripts/check_secrets.py`)
* O script deve escanear todo o código-fonte procurando padrões de alto risco:
  - Tokens GitHub: `ghp_`, `github_pat_`
  - Chaves Google/Firebase: `AIza[0-9A-Za-z-_]{35}`
  - Chaves privadas: `BEGIN PRIVATE KEY`, `BEGIN RSA PRIVATE KEY`
  - Chaves OpenAI / Anthropic genéricas
* Se algum segredo for detectado fora de arquivos de teste autorizados ou `.env.example`, o script deve retornar código de saída `1` (falha no pipeline).

---

## 5. Políticas de CORS
* Em desenvolvimento: aceitar requisições de `http://localhost:5173` e `http://127.0.0.1:5173`.
* Em produção: restringir estritamente à URL do GitHub Pages e domínio oficial.
* Proibido o uso cego de `allow_origins=["*"]` com `allow_credentials=True` em produção.

---

## 6. Critérios de Aceite
- [x] Zero segredos reais versionados no Git.
- [x] Execução limpa do script `check_secrets.py` sem alertas falsos.
- [x] Template `.env.example` completo e autoexplicativo.
