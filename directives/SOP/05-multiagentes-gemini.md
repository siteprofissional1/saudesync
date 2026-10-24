# SOP 05 — Multi-Agentes & Gemini AI

## 1. Objetivo
Orquestrar um ecossistema cooperativo de agentes especializados onde dados e cálculos são processados deterministicamente por agentes Python e a inteligência generativa (Google Gemini API) é empregada exclusivamente para síntese executiva, identificação de padrões qualitativos e geração de insights operacionais em linguagem natural.

---

## 2. Estrutura dos Agentes
Localização: `backend/app/agents/`

1. **Data Agent (`data_agent.py`):**
   - Papel: Especialista em dados tabulares.
   - Responsabilidade: Filtros, agregações, recuperação RAG e métricas matemáticas.
   - Ferramentas: Pandas, NumPy. Não consome tokens de IA.

2. **Operations Agent (`operations_agent.py`):**
   - Papel: Especialista em gestão e metas de saúde.
   - Responsabilidade: Análise de capacidade de leitos, cumprimento dos tempos de Manchester, identificação de picos de fila e gargalos de plantão.
   - Ferramentas: Algoritmos determinísticos de análise operacional.

3. **Gemini Insights Agent (`gemini_agent.py`):**
   - Papel: Consultor executivo sênior em saúde.
   - Responsabilidade: Consumir os dados exatos consolidados pelo Data Agent e Operations Agent e formular relatórios, resumos e recomendações operacionais de processo.
   - Ferramentas: Google Gemini API (modelos `gemini-1.5-flash` ou `gemini-1.5-pro`).

4. **Orchestrator (`orchestrator.py`):**
   - Papel: Maestro do fluxo de trabalho.
   - Responsabilidade: Receber a requisição, despachar tarefas sequenciais para os agentes determinísticos, consolidar o payload enxuto e acionar o Gemini Agent com validação de saída.

---

## 3. Fluxo de Execução
```
Requisição do Usuário (/api/insights/generate)
                ↓
    Orchestrator Central
                ↓
    Data Agent (Cálculos e Agregações Exatas)
                ↓
    Operations Agent (Detecção de Gargalos e SLA)
                ↓
    Payload Estruturado e Compacto (< 800 tokens)
                ↓
    Gemini Agent (Síntese e Narrativa Executiva)
                ↓
    Validação Pydantic da Resposta
                ↓
    Persistência no Firestore / Cache Local
                ↓
    Exibição no Frontend (Cards de Insight)
```

---

## 4. Regras Rígidas do Prompt do Sistema (System Instructions)
1. **Veracidade Estrita:** Utilize exclusivamente as métricas fornecidas no contexto. Jamais invente números, percentuais ou contagens.
2. **Sem Alucinação Médica:** Proibido receitar medicamentos, sugerir doses, alterar condutas clínicas ou emitir diagnósticos de saúde.
3. **Tom Profissional:** Responda em Português do Brasil de forma clara, técnica, objetiva e orientada à melhoria de processos hospitalares.

---

## 5. Resiliência e Degradação Graciosa
* Se a variável `GEMINI_API_KEY` não estiver definida no ambiente ou ocorrer timeout de rede:
  - O sistema NÃO falha com erro 500.
  - O `orchestrator.py` utiliza o gerador determinístico interno de insights analíticos baseados em regras (*Rule-based Fallback*), informando ao usuário que os insights foram gerados pelo motor local.

---

## 6. Critérios de Aceite
- [x] Contexto enviado ao Gemini estritamente estruturado e compacto.
- [x] Zero alucinações de dados estatísticos.
- [x] Funcionamento garantido mesmo sem chave ativa do Gemini via fallback analítico.
