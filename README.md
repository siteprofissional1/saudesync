# 🏥 Saúde Sync — Triagem Inteligente e Gestão de Atendimento em Saúde
### *Intelligent Triage & Real-time Healthcare Flow Management*

[![Google Antigravity](https://img.shields.io/badge/Developed%20With-Google%20Antigravity-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://antigravity.google)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Firebase Firestore](https://img.shields.io/badge/Firebase-Firestore%20NoSQL-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-1.5%20Flash-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev)
[![Plotly.js](https://img.shields.io/badge/Plotly.js-Interactive%20Charts-3F4F75?style=for-the-badge&logo=plotly&logoColor=white)](https://plotly.com)
[![SENAI Ourinhos](https://img.shields.io/badge/SENAI-Ourinhos%20Edition-E30613?style=for-the-badge)](https://sp.senai.br)

---

## 🇧🇷 Português (Brasil)

### 1. Visão Geral do Produto
O **Saúde Sync** é uma central de inteligência operacional voltada à gestão de triagem, filas de pronto atendimento e analytics preditivo-descritivo em saúde. Desenvolvido para o **Hackathon Antigravity — Projeto Final do curso Desenvolvimento de Aplicações com IA Generativa do SENAI Ourinhos**, o sistema unifica determinismo matemático, banco de dados NoSQL em tempo real, mineração contextual de dados e síntese executiva por inteligência artificial.

> **Lema Central de Engenharia:**  
> **PYTHON CALCULA. GEMINI INTERPRETA. FIRESTORE SINCRONIZA. FRONTEND APRESENTA.**

---

### 2. O Pitch Técnico
> *Unidades de pronto atendimento lidam diariamente com filas, diferentes níveis de prioridade e sobrecarga informacional. O Saúde Sync transforma uma base histórica de 1.200 atendimentos em uma central inteligente de visualização, análise e acompanhamento em tempo real. A plataforma combina processamento determinístico em Python, RAG sobre dados locais, sincronização viva com Firestore, dados externos da rede de saúde de Ourinhos e IA generativa com Google Gemini para transformar números em decisões operacionais compreensíveis. O projeto possui caráter estritamente acadêmico e demonstrativo baseado em dados simulados.*

---

### 3. Matriz dos 9 Pilares do Hackathon Antigravity

| # | Pilar Obrigatório | Implementação Técnica no Saúde Sync | Status |
|---|---|---|:---:|
| 1 | **Engenharia & Diretivas** | Arquitetura 3 Layers e governança via `/directives/` com SOP Mestre e 10 SOPs granulares. | ✅ Concluído |
| 2 | **UI/UX & Design System** | Interface responsiva com Dark/Light Mode, cores Manchester e conformidade WCAG 2.1 AA. | ✅ Concluído |
| 3 | **Base RAG & Mineração** | Mineração sobre o dataset local de 1.200 linhas com cálculo de similaridade clínica. | ✅ Concluído |
| 4 | **Web Scraping / Dados Vivos** | Scraper resiliente da rede de saúde e farmácias de Ourinhos/SP com cache de 30 min. | ✅ Concluído |
| 5 | **Multi-Agentes & Gemini AI** | Arquitetura cooperativa: `Data Agent` + `Operations Agent` + `Gemini Agent` + `Orchestrator`. | ✅ Concluído |
| 6 | **Banco Realtime NoSQL** | Firebase Cloud Firestore com listeners nativos `onSnapshot` sem F5. | ✅ Concluído |
| 7 | **Governança & Segurança** | Menor privilégio em `firestore.rules`, `.env` protegido e script `check_secrets.py`. | ✅ Concluído |
| 8 | **CI/CD & Deploy em Nuvem** | GitHub Actions (`deploy.yml`), GitHub Pages e Dockerfile para Google Cloud Run. | ✅ Concluído |
| 9 | **Analytics & Plotly.js** | 8 gráficos interativos reativos e KPIs consolidados com filtros multidimensionais. | ✅ Concluído |

---

### 4. Arquitetura em 3 Camadas (Antigravity Framework)

```
                            ┌─────────────────────────────────┐
                            │    Google Antigravity IDE       │
                            └────────────────┬────────────────┘
                                             │
      ┌──────────────────────────────────────┼──────────────────────────────────────┐
      ▼                                      ▼                                      ▼
┌───────────────────────────┐  ┌───────────────────────────┐  ┌───────────────────────────┐
│   LAYER 1 — DIRETIVAS     │  │   LAYER 2 — INTELIGÊNCIA  │  │   LAYER 3 — DETERMINISMO  │
│   /directives             │  │   Multi-Agent System      │  │   FastAPI, Python & JS    │
│   • SOP Mestre (projeto)  │  │   • Data Agent            │  │   • Cálculos exatos       │
│   • 10 SOPs Granulares    │  │   • Operations Agent      │  │   • Firestore onSnapshot  │
│   • Limites Éticos/Regras │  │   • Gemini 1.5 Flash      │  │   • Plotly.js & Scraper   │
└───────────────────────────┘  └───────────────────────────┘  └───────────────────────────┘
```

---

### 5. Dataset de Triagem (Sanity Check Real)
* **Arquivo:** `data/data_saudesync_triagem.csv`
* **Registros:** 1.200 | **Colunas:** 24 | **Valores Nulos:** 0 | **Duplicidades:** 0
* **Período Histórico:** 01/08/2026 07:38 a 30/08/2026 11:04
* **Distribuição do Protocolo de Manchester:**
  - 🟢 **Verde (Pouco Urgente):** 372 atendimentos (limite: 120 min)
  - 🟡 **Amarelo (Urgente):** 350 atendimentos (limite: 60 min)
  - 🟠 **Laranja (Muito Urgente):** 202 atendimentos (limite: 10 min)
  - 🔵 **Azul (Não Urgente):** 179 atendimentos (limite: 240 min)
  - 🔴 **Vermelho (Emergência):** 97 atendimentos (limite: 0 min — tratado sem divisão por zero)
* **Tempo Médio Geral de Espera:** 61.19 min | **Mediana:** 50.50 min | **P90:** 126.10 min
* **Pacientes Acima do Limite de Referência:** 250 (20.83%) | **Dentro da Meta:** 950 (79.17%)

---

### 6. Como Executar o Projeto

#### Inicialização Rápida no Windows:
* Dê duplo clique em `executar.bat` ou execute no PowerShell: `.\executar.ps1`.

#### Inicialização Manual:
```bash
# 1. Backend FastAPI
pip install -r backend/requirements.txt
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

# 2. Frontend Vite
cd frontend
npm install
npm run dev
```

Acesse:
* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend & Documentação Swagger: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 7. Testes e Resiliência (Self-Annealing)
A suíte automatizada cobre 22 testes unitários e de integração com 100% de aprovação:
```bash
python -m pytest tests/ -v
```

---

### 8. Painel TV / Telão de Sala de Espera (`#tv`)
A plataforma conta com uma visualização exclusiva de alta legibilidade para TVs e telões de recepção hospitalar:
* Exibição em tempo real da última senha chamada e histórico de chamadas recentes;
* Indicadores sonoros suaves (chime hospitalar via Web Audio API, sem depender de arquivos externos);
* Painel de contingência operacional com dados meteorológicos e índice de lotação;
* Sincronização instantânea com a fila de atendimento via Firebase Firestore e `BroadcastChannel`.

---

## 🇺🇸 English (Summary)

### Overview
**Saúde Sync** is an intelligent operational intelligence center for healthcare triage, real-time queues, TV waiting room display, and clinical analytics. Developed for the **Antigravity Hackathon — Final Capstone Project at SENAI Ourinhos**, it bridges mathematical determinism, NoSQL realtime streaming, contextual retrieval, and executive generative AI.

### Architectural Core
* **Directives Layer (`/directives`):** Standard Operating Procedures (SOPs) governing rules, data contracts, and ethical constraints.
* **Orchestration Layer:** Multi-agent pipeline coordinating deterministic processing and Gemini AI natural language synthesis.
* **Execution Layer:** Python (FastAPI/Pandas/NumPy), Vanilla Modular JavaScript, Firebase Firestore, Web Scraping, and Plotly.js.
* **Repository:** [https://github.com/siteprofissional1/saudesync](https://github.com/siteprofissional1/saudesync)

---

### ⚠️ Disclaimer Acadêmico e Ético
*Este projeto possui finalidade exclusivamente acadêmica e demonstrativa. Os dados utilizados são simulados e fictícios. O sistema não prescreve tratamentos, não realiza diagnósticos médicos e não substitui profissionais de saúde habilitados.*

---

<p align="center">
  desenvolvido por <a href="https://siteprofissional.pro" style="color: blue;">siteprofissional</a>
</p>
