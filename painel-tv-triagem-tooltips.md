# Plano de Orquestração: Painel TV, Triagem com Nome e Tooltips Plotly

> **Projeto:** SAÚDE SYNC — Triagem Inteligente e Gestão em Saúde  
> **Comando Solicitado:** `/orchestrate /agente-orquestrador`  
> **Data:** 2026-10-24  
> **Status:** Aprovado para Execução

---

## 🎯 Objetivos Principais

1. **Triagem Simulada com Nome do Paciente:**
   - Adicionar campo `paciente_nome` no formulário de triagem (`TriagePage.js`).
   - Atualizar modelo Pydantic no backend (`backend/app/models/triage.py`) e serviço RAG (`rag_service.py`).
   - Atualizar os 5 botões de cenários pré-configurados com nomes fictícios completos.
   - Adicionar botão direto *"Encaminhar para Fila em Tempo Real Agora"* no resultado da triagem.

2. **Correção de Legibilidade dos Gráficos Plotly (Visão Geral):**
   - Configurar `hoverlabel` global no `PlotlyWrapper.js` com alto contraste, fundo escuro elegante e texto branco nítido no Dark Mode (e fundo branco com texto escuro no Light Mode).
   - Ajustar formatação de `hovertemplate` em todos os gráficos no `backend/app/services/csv_service.py`, especialmente no gráfico de **Sintomas Recorrentes** (exibir texto completo no hover e margens dinâmicas).

3. **Novo Painel de TV Fullscreen para Sala de Espera (`#tv` / `TvPage.js`):**
   - Criar página dedicada `frontend/src/pages/TvPage.js` acessível pela rota `#tv`.
   - Layout especial para TV/Monitor de parede (16:9, fontes gigantes, contraste hospitalar).
   - Telão de Senha Ativa em tamanho monumental, sala, médico e animação de pulso.
   - Lista lateral com as próximas senhas na fila e histórico recente de chamadas.
   - Barra de avisos institucionais (ticker/marquee) explicando o Protocolo de Manchester.
   - Sincronização reativa nativa via `subscribeQueue()` (Firestore / fallback).
   - Chime sonoro via `playHospitalChime()` quando uma nova senha for chamada.
   - Botão para alternar Modo Tela Cheia (`requestFullscreen`).
   - Link de acesso no Sidebar e no Header.

---

## 🤖 Agentes Especializados Envolvidos (Mínimo de 3)

| Agente | Domínio | Responsabilidade |
|--------|---------|------------------|
| `project-planner` | Arquitetura | Planejamento, especificação de interfaces e rastreabilidade |
| `backend-specialist` | API & Dados | Suporte ao campo `paciente_nome` em Pydantic e RAG |
| `frontend-specialist` | UI / UX / Plotly | `TriagePage.js`, `PlotlyWrapper.js`, `TvPage.js`, `router.js`, `Sidebar.js`, CSS |
| `test-engineer` | Validação & QA | Execução de `pytest`, `check_secrets.py`, build e testes no navegador |

---

## 📋 Checklist de Execução

- [x] Histórico de prompts atualizado em `/documentation/promptHistory.md`
- [ ] Atualizar modelo Pydantic `TriageRequest` e `RAGService` para aceitar `paciente_nome`
- [ ] Corrigir `PlotlyWrapper.js` e `csv_service.py` com `hoverlabel` de alto contraste e legibilidade
- [ ] Atualizar `TriagePage.js` com campo de Nome e botão de despacho para fila
- [ ] Criar `frontend/src/pages/TvPage.js` com layout dedicado para TV hospitalar
- [ ] Registrar rota `#tv` em `frontend/src/router.js` e atalhos na `Sidebar.js` e `QueuePage.js`
- [ ] Adicionar estilos para o Painel TV em `frontend/src/styles/pages.css` e `components.css`
- [ ] Compilar frontend com `npm run build`
- [ ] Validar suíte de testes com `pytest` (22+ testes)
- [ ] Auditar ausência de segredos com `check_secrets.py`
- [ ] Testar no navegador desktop e mobile 375x812
- [ ] Garantir rodapé obrigatório com link azul centralizado no centro
