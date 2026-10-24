# SOP 10 — Testes Automatizados, Resiliência & Self-Annealing

## 1. Objetivo
Estabelecer a matriz de testes automatizados unitários, de integração e de estresse, bem como o protocolo operacional de autorrecuperação (Self-Annealing) para assegurar que nenhum bug passe desapercebido durante o desenvolvimento e apresentação.

---

## 2. Matriz de Testes (`tests/`)
A suíte de testes deve validar rigorosamente os seguintes aspectos:
1. **`test_dataset.py`:**
   - Carregamento do CSV e contagem de registros (1.200).
   - Validação de 0 valores nulos e 0 duplicidades de IDs.
   - Parse correto de datas no formato `YYYY-MM-DD HH:mm`.
   - Distribuição de classificações Manchester.
2. **`test_metrics.py`:**
   - Cálculo exato de média de espera, mediana e percentil 90.
   - Tratamento de tempo excedido para classificação Vermelha com tempo zero (evitando divisão por zero).
3. **`test_rag_triage.py`:**
   - Recuperação contextual de casos similares.
   - Validação de limites fisiológicos e geração de erro 422 para entradas impossíveis.
   - Formato correto da explicação sem prescrição de medicamentos.
4. **`test_api_endpoints.py`:**
   - Endpoint `/api/health` retornando status "ok" e contagem correta de linhas.
   - Endpoint `/api/dashboard/summary` com todos os campos numéricos presentes.
   - Endpoint `/api/dashboard/charts` com os 8 gráficos estruturados.
5. **`test_scraper_resilience.py`:**
   - Comportamento de cache em requisições consecutivas.
   - Retorno do fallback gracioso quando a fonte externa falha.
6. **`test_security.py`:**
   - Varredura de segredos garantindo que nenhuma chave real está versionada.

---

## 3. Protocolo de Self-Annealing (Loop de Autorrecuperação)
Em caso de falha em qualquer teste ou endpoint:
1. **Captura:** Obter o traceback completo e salvar em `.tmp/error_trace.log`.
2. **Diagnóstico de Causa Raiz:** Distinguir entre erro determinístico (ex: conversão de tipo em pandas), erro de rede (ex: timeout de API) ou erro de schema (ex: coluna ausente).
3. **Reparo Mínimo:** Corrigir a lógica no módulo específico em `backend/app/` ou `frontend/src/` sem remover a regra de negócio.
4. **Validação:** Reexecutar o teste pontual e, em seguida, a suíte completa de testes.
5. **Atualização Normativa:** Se a correção exigiu mudança de contrato, atualizar imediatamente o SOP correspondente.

---

## 4. Script de Validação Geral (`scripts/validate_project.py`)
* Verifica a existência de todos os arquivos obrigatórios do projeto.
* Valida a presença de diretivas, SOPs, CSV de trabalho e original.
* Valida existência de `.env.example`, `.gitignore`, `firestore.rules`, `README.md`, scripts de inicialização e build do frontend.
* Retorna código de saída `0` se o projeto estiver 100% em conformidade.

---

## 5. Critérios de Aceite
- [x] 100% dos testes do `pytest tests/` aprovados com sucesso.
- [x] Script `validate_project.py` retorna código de saída `0`.
- [x] Resposta resiliente em todos os fluxos com fallbacks ativos.
