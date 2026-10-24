# SOP Mestre: Saúde Sync

**Status:** Inicialização / Implementação Ativa  
**Versão:** 1.0.0  
**Autor:** Antigravity Architect & Engineering Team (SENAI Ourinhos)  
**Data:** 24/10/2026  

---

## 1. Visão Geral
O **Saúde Sync** é uma central inteligente e reativa de gestão de triagem, filas de pronto atendimento e analytics operacional em saúde. O projeto combina processamento matemático determinístico em Python, mineração contextual (RAG Local), banco de dados NoSQL em tempo real (Firebase Firestore), dados vivos da região de Ourinhos (Web Scraping) e síntese executiva por IA generativa (Google Gemini API).

---

## 2. Objetivo
Construir uma solução robusta e demonstrável para o Hackathon Antigravity que atenda com excelência aos 9 pilares obrigatórios da metodologia:
1. **Engenharia & Diretivas:** Arquitetura 3 Layers e governança via `/directives`.
2. **UI/UX & Design System:** Interface moderna, responsiva, com Dark/Light Mode e acessibilidade.
3. **Base RAG & Mineração de Dados:** Recuperação sobre base de 1.200 atendimentos históricos.
4. **Web Scraping / Dados Vivos:** Monitoramento de serviços de saúde da região de Ourinhos.
5. **Multi-Agentes & Gemini AI:** Cooperação entre Data Agent, Operations Agent e Gemini Agent.
6. **Banco Realtime NoSQL:** Firestore com listeners `onSnapshot` sem recarregamento de página.
7. **Governança & Segurança:** Gestão de credenciais, menor privilégio e scanner de segredos.
8. **CI/CD & Deploy:** Dockerfile para Cloud Run e workflow para GitHub Pages.
9. **Analytics & Plotly.js:** Gráficos interativos sincronizados com filtros globais.

---

## 3. Arquitetura de Três Camadas (3 Layers)
* **Layer 1 — Diretivas & Estratégia (`/directives`):** Especificações normativas, regras de negócio e limites éticos. Não executa código.
* **Layer 2 — Orquestração & Inteligência:** Roteamento de intenções, estruturação de contexto para RAG e síntese por Gemini.
* **Layer 3 — Execução & Determinismo:** Código Python (FastAPI, Pandas, NumPy), JavaScript modular, Firestore, Scraper e Plotly.js.
* **Lema Central:** *Python calcula. Gemini interpreta. Firestore sincroniza. Frontend apresenta.*

---

## 4. Dataset e Sanity Check
* **Arquivo Operacional:** `data/data_saudesync_triagem.csv` (1.200 registros, 24 colunas, 0 nulos, 0 duplicados).
* **Período Coberto:** 01/08/2026 a 30/08/2026.
* **Distribuição Manchester:**
  - Verde (Pouco Urgente): 372 atendimentos (limite: 120 min)
  - Amarelo (Urgente): 350 atendimentos (limite: 60 min)
  - Laranja (Muito Urgente): 202 atendimentos (limite: 10 min)
  - Azul (Não Urgente): 179 atendimentos (limite: 240 min)
  - Vermelho (Emergência): 97 atendimentos (limite: 0 min)
* **Tratamento Específico de Limite Zero:** Para a classificação Vermelha, cálculos de percentual de atraso não devem realizar divisão por zero; deve-se usar métrica absoluta de tempo excedido (`tempo_real > 0`).

---

## 5. RAG Local (Mineração de Casos Semelhantes)
* **Localização:** `backend/app/services/rag_service.py`.
* **Abordagem:** O CSV é indexado em memória via Pandas. A busca de casos análogos utiliza filtros determinísticos combinados (sintomas correspondentes, proximidade de sinais vitais, escala de dor e faixa etária).
* **Contrato RAG:** Retorna agregações estatísticas e os Top K registros compactos como contexto estruturado, evitando sobrecarga de tokens ao Gemini.

---

## 6. Backend (FastAPI + Pydantic)
* **Estrutura:** Localizada em `backend/app/`.
* **Endpoints Principais:**
  - `GET /api/health`: Status operacional da API, dataset, Firebase, Gemini e Scraper.
  - `GET /api/dataset/schema`: Metadata, colunas e tipos de dados.
  - `GET /api/dashboard/summary`: KPIs gerais (total, aguardando, tempo médio, excedidos).
  - `GET /api/dashboard/charts`: Payloads estruturados para renderização com Plotly.js.
  - `GET /api/analytics`: Tabela paginada, ordenável e com exportação CSV.
  - `POST /api/triage/simulate`: Simulação de triagem por similaridade histórica explicável.
  - `GET /api/insights`: Histórico de insights operacionais gerados.
  - `POST /api/insights/generate`: Orquestração de novos insights com Gemini AI.
  - `GET /api/live-data`: Leitura de dados externos coletados com status de cache.
  - `POST /api/live-data/refresh`: Disparo de nova coleta resiliente do scraper.

---

## 7. Frontend (Vite + Vanilla JS Modular)
* **Localização:** `frontend/`.
* **Características:** Arquitetura desacoplada em componentes, serviços e páginas, com carregamento ultrarrápido, sem dependências infladas de runtime, totalmente compatível com GitHub Pages.
* **Componentes Chave:** `Sidebar`, `Header`, `KpiCard`, `DataTable`, `FilterBar`, `ManchesterBadge`, `PlotlyWrapper`, `RealtimeIndicator`.
* **Dual Theme:** CSS Custom Properties chaveadas via atributo `data-theme="dark|light"`.

---

## 8. Firebase Cloud Firestore
* **Coleções:**
  - `fila_atendimento`: Documentos de atendimentos ativos em espera com campos de senha, prioridade, leito e tempo.
  - `dados_externos`: Cache dos dados de saúde regional coletados pelo scraper.
  - `ai_insights`: Insights operacionais catalogados e versionados.
  - `system_metrics`: Telemetria de requisições e latência.
* **Sincronização:** `onSnapshot` no frontend ouvindo a coleção `fila_atendimento` para atualização instantânea sem F5.

---

## 9. Gemini AI & Multi-Agentes
* **Data Agent:** Responsável por consultas determinísticas, filtros e agregações sobre o dataset.
* **Operations Agent:** Analisa metas operacionais, cumprimento do protocolo Manchester e gargalos de leitos.
* **Gemini Agent:** Consome a síntese estruturada dos agentes determinísticos e formula relatórios executivos em linguagem natural clara.
* **Restrições Éticas do Prompt:** Proibição explícita de emissão de diagnósticos, receitas, dosagens ou condutas médicas.

---

## 10. Web Scraping & Dados Vivos
* **Localização:** `backend/app/services/scraper_service.py`.
* **Foco:** Informações públicas de postos de saúde, UPAs e farmácias de plantão de Ourinhos/SP.
* **Resiliência:** Timeout (5s), headers realistas com User-Agent, retries limitados, persistência em cache e fallback com mensagem amigável sem quebrar o sistema.

---

## 11. Segurança & Menor Privilégio
* Arquivos de ambiente (`.env`) jamais versionados.
* `firestore.rules` configurado com regras restritivas para leitura/escrita autenticada/controlada.
* Script de auditoria `scripts/check_secrets.py` para bloquear vazamentos antes de deploys.

---

## 12. Deploy & CI/CD
* **Frontend:** Build estático via `vite build`, gerando pasta `dist/` pronta para deploy no GitHub Pages.
* **Backend:** `Dockerfile` multi-stage pronto para implantação no Google Cloud Run na porta definida por `$PORT`.
* **Workflow:** GitHub Actions em `.github/workflows/deploy.yml` executando validação, testes e build.

---

## 13. Testes & Qualidade
* Suite completa em `tests/` validando:
  - Carregamento e integridade do CSV.
  - Métricas estatísticas (média, mediana, percentil 90).
  - Comportamento de simulação de triagem por similaridade.
  - Endpoints da API FastAPI via `TestClient`.
  - Resiliência e cache do scraper.

---

## 14. Loop de Self-Annealing
Caso ocorra qualquer erro em tempo de execução:
1. Isolar o log de erro no diretório temporário `.tmp/`.
2. Diagnosticar a causa raiz no código determinístico.
3. Aplicar a correção mínima necessária sem remover regras de negócio.
4. Reexecutar os testes unitários até a estabilização completa.
5. Atualizar o respectivo SOP para prevenção futura.

---

## 15. Critérios de Sucesso e Aceite
- [x] Dataset auditado e íntegro (1.200 linhas).
- [x] Diretivas e SOPs documentados em `/directives`.
- [x] Frontend responsivo, com suporte a mobile, Dark/Light Mode e Plotly.js.
- [x] Fila em tempo real via Firestore com listener reativo.
- [x] Agentes cooperativos com isolamento de contexto no Gemini.
- [x] Rodapé oficial com crédito institucional obrigatório: "Desenvolvido por siteprofissional".
