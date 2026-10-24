# Modelo Padrão de Governança — Antigravity Standard Operating Procedure (SOP)

> **Documento Normativo Institucional — Padrão de Engenharia Antigravity**  
> Aplicação obrigatória para projetos de inteligência operacional e sistemas híbridos (IA + Determinismo).

---

## 1. Visão Geral
* **Objetivo:** Estabelecer o arcabouço metodológico de governança técnica para assegurar que aplicações desenvolvidas com IA generativa mantenham rigor determinístico, rastreabilidade e aderência às regras de negócio.
* **Escopo:** Padronização de arquitetura, contratos de dados, interfaces, resiliência e esteiras de entrega contínua.

---

## 2. Arquitetura Antigravity de 3 Camadas

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1 — DIRETIVAS & ESTRATÉGIA (/directives)             │
│  SOPs, Regras de Negócio, Contratos, Critérios de Aceite    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Governa
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2 — ORQUESTRAÇÃO & INTELIGÊNCIA                      │
│  Interpretação de contexto, Gemini AI, RAG, Decomposição   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Executa via chamadas
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3 — EXECUÇÃO & DETERMINISMO                          │
│  FastAPI, Python, Firestore, Scraping, Plotly, Testes       │
└─────────────────────────────────────────────────────────────┘
```

* **Camada 1 (Diretivas):** Fonte da verdade normativa. Define o "O Quê" e o "Por Quê". Nenhum código pode contrariar uma diretiva.
* **Camada 2 (Orquestração):** Inteligência contextual. IA generativa opera como orquestradora e sintetizadora, jamais como geradora de números estatísticos ou cálculos que exijam determinismo.
* **Camada 3 (Execução):** Algoritmos exatos, cálculos matemáticos, queries de banco de dados, scrapers com parser tipado e testes de integração.

---

## 3. Escopo Tecnológico
* **Backend:** Python 3.12+ com FastAPI e tipagem estrita via Pydantic.
* **Frontend:** Vite com ecossistema modular moderno (Vanilla JS ou React), CSS Custom Properties com design tokens semânticos e Plotly.js para gráficos.
* **Persistência & Realtime:** Firebase Cloud Firestore com listeners nativos (`onSnapshot`).
* **IA Generativa:** Google Gemini API com structured outputs e isolamento de contexto (RAG local estruturado).
* **Automação & Scraping:** Requests + BeautifulSoup com retries exponenciais, timeout e camadas de cache.

---

## 4. Diretivas UI/UX
* **Dual Theme:** Suporte nativo e persistente a Dark Mode e Light Mode com contraste WCAG 2.1 AA.
* **Responsividade Extrema:** Layout fluído e testado em Mobile (375px+), Tablet (768px+) e Desktop (1280px+).
* **Feedback de Estado:** Todas as operações assíncronas devem apresentar explicitamente os quatro estados: *Loading*, *Success*, *Error* e *Empty*.
* **Créditos Institucionais:** Todo rodapé deve exibir centralizado a identificação oficial obrigatória da organização.

---

## 5. Fluxo Operacional
1. Requisições do usuário chegam ao Frontend e são encaminhadas à API FastAPI.
2. Os dados determinísticos são recuperados e validados pelo backend através de services especializados.
3. Se houver necessidade de sumarização executiva, o contexto sumarizado e validado é encaminhado ao Gemini.
4. O resultado estruturado retorna ao frontend para renderização dinâmica e acessível.
5. Alterações de estado são sincronizadas em tempo real com o Firestore para todos os clientes conectados.

---

## 6. Critérios de Sucesso
* 100% dos testes unitários e de integração aprovados.
* Ausência de valores estatísticos hardcoded.
* Zero segredos de credenciais expostos no código-fonte.
* Tempo de resposta dos endpoints determinísticos inferior a 200ms em média.
* Sincronização em tempo real reativa sem polling ineficiente.

---

## 7. Segurança & Menor Privilégio
* Proteção estrita de arquivos `.env` através de `.gitignore`.
* Validação de payloads de entrada via schemas Pydantic.
* Regras granulares no Firestore Security Rules (`firestore.rules`).
* Auditoria contínua de credenciais com scanner de segredos (`check_secrets.py`).

---

## 8. Testes & Qualidade
* Cobertura de testes unitários para cálculo de métricas (média, mediana, percentis).
* Testes de resiliência e integridade de schema sobre bases de dados locais.
* Mock e fallback de serviços externos (Gemini e Scraping).

---

## 9. Resiliência & Degradação Graciosa
* O sistema deve permanecer operacional mesmo em indisponibilidade temporária de internet ou chaves de IA:
  - Gemini indisponível -> Dashboard e Analytics exibem métricas determinísticas e informam indisponibilidade da IA.
  - Firestore desconectado -> Fila opera em modo local com indicador visual claro.
  - Scraper bloqueado/offline -> Exibição da última coleta em cache com carimbo de data/hora explícito.

---

## 10. Loop de Autorrecuperação (Self-Annealing)
Ao identificar qualquer falha ou exceção durante o ciclo de desenvolvimento:
1. **Capturar:** Isolar traceback, status code e payload problemático.
2. **Analisar:** Encontrar causa raiz sem aplicar correções cosméticas ou mascarar o erro.
3. **Reparar:** Corrigir a menor unidade lógica de código na camada determinística.
4. **Validar:** Reexecutar suite de testes para verificar efeitos colaterais.
5. **Registrar:** Atualizar o SOP correspondente em `/directives` para refletir o aprendizado.

---

## 11. Deploy & Entrega Contínua
* Frontend otimizado para deploy em plataformas de borda (GitHub Pages / Vercel / Firebase Hosting).
* Backend containerizado via `Dockerfile` otimizado para Google Cloud Run.
* Workflows de CI/CD via GitHub Actions validando lint, testes e build a cada commit.

---

## 12. Documentação Viva
* O repositório deve conter documentação autoexplicativa: `README.md` bilíngue, `instruction.md` operacional, scripts de inicialização facilitada (`executar.bat` e `executar.ps1`) e histórico de prompts em `documentation/promptHistory.md`.
