# SOP 09 — Deploy em Nuvem & CI/CD

## 1. Objetivo
Padronizar a esteira de integração contínua (CI/CD) via GitHub Actions, a containerização do backend para Google Cloud Run e o deploy estático do frontend no GitHub Pages.

---

## 2. Deploy do Frontend (GitHub Pages)
* Build Tool: Vite
* Configuração do `vite.config.js`:
  ```javascript
  export default {
    base: './', // Caminho relativo essencial para funcionar em qualquer subpasta do GitHub Pages
    build: {
      outDir: 'dist',
      assetsDir: 'assets'
    }
  }
  ```
* Roteamento SPA: Fallback elegante que não quebra no carregamento de rotas em subpastas.

---

## 3. Deploy do Backend (Google Cloud Run)
* Containerização: `backend/Dockerfile`
* Boas Práticas:
  - Base Image enxuta: `python:3.12-slim`
  - Utilização da variável de ambiente `$PORT` (Cloud Run define a porta dinamicamente, com padrão `8000`).
  - Health check operacional mapeado em `/api/health`.
  - Cópia do arquivo de dados `data/data_saudesync_triagem.csv` para dentro da imagem.

---

## 4. Pipeline GitHub Actions (`.github/workflows/deploy.yml`)
1. **Etapa de Lint & Validação:**
   - Checagem de sintaxe e padrões.
   - Execução de `scripts/check_secrets.py`.
2. **Etapa de Testes Automatizados:**
   - Execução do `pytest tests/`.
3. **Etapa de Build do Frontend:**
   - `npm install` e `npm run build`.
4. **Deploy Automático no GitHub Pages:**
   - Upload de artefatos da pasta `dist/` e publicação no branch `gh-pages` ou ambiente Pages.

---

## 5. Integração com GitHub MCP Server
* Configuração formal no arquivo `mcp_config.json`.
* Permite ao assistente criar commits estruturados, branches e gerenciar configurações de repositório remotamente de forma declarativa.

---

## 6. Critérios de Aceite
- [x] Build do frontend gerado sem avisos críticos.
- [x] Dockerfile executável localmente via `docker build`.
- [x] Pipeline de CI/CD validado e documentado.
