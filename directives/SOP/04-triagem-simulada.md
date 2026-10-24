# SOP 04 — Simulador Acadêmico de Triagem & Classificação Explicável

## 1. Objetivo
Permitir a inserção de cenários clínicos fictícios para recuperação de casos semelhantes no dataset histórico e sugestão de classificação de risco acadêmica explicável, baseada em ponderação estatística e vizinhos mais próximos (KNN / Similaridade Categórica).

---

## 2. Entradas
Payload via `POST /api/triage/simulate`:
* `idade`: int (0 a 120)
* `sexo`: string ("M", "F")
* `municipio`: string
* `sintoma_principal`: string (selecionado dinamicamente a partir dos 21 sintomas do CSV)
* `comorbidades`: string
* `pressao_sistolica_mmhg`: int (50 a 260)
* `pressao_diastolica_mmhg`: int (30 a 150)
* `frequencia_cardiaca_bpm`: int (30 a 220)
* `temperatura_axilar_c`: float (33.0 a 43.0)
* `saturacao_o2_percent`: int (50 a 100)
* `glicemia_capilar_mg_dl`: int (30 a 600)
* `escala_dor_0_10`: int (0 a 10)

---

## 3. Saídas
* Resposta estruturada do simulador:
  ```json
  {
    "classificacao_sugerida": "Amarelo - Urgente",
    "tempo_referencia_max_min": 60,
    "confianca_estatistica_pct": 87.5,
    "distribuicao_casos_similares": {
      "Amarelo - Urgente": 28,
      "Laranja - Muito Urgente": 4
    },
    "tempo_medio_espera_historico_min": 41.2,
    "especialidade_historica_predominante": "Clínica Geral",
    "explicabilidade": "Baseado em 32 casos históricos com queixa idêntica ou similar e sinais vitais correlacionados...",
    "disclaimer": "Classificação acadêmica demonstrativa baseada no dataset. Não substitui avaliação médica profissional."
  }
  ```

---

## 4. Metodologia de Cálculo (Determinística)
1. **Filtro Primário por Sintoma:** Filtragem dos registros com sintomas idênticos ou que compartilham palavras-chave clínicas essenciais.
2. **Cálculo de Distância Euclidiana Normalizada (Sinais Vitais):**
   - Normalização z-score ou min-max para PA Sistólica, FC, Temperatura, SpO2 e Dor.
3. **Ponderação dos Top K Vizinhos:**
   - Seleção dos 15 casos mais próximos no espaço vetorial.
   - Votação ponderada pelo inverso da distância.
4. **Determinação da Classe Predominante:**
   - Atribuição da classificação com maior somatório de pesos.
   - Cálculo da confiança percentual (`votos_classe / total_votos`).

---

## 5. Regras Éticas e Clínicas
* **Proibição Absoluta de Diagnóstico:** O sistema nunca deve emitir afirmações diagnósticas ("Você está com dengue" ou "Paciente infartado").
* **Proibição de Prescrição:** Nenhuma medicação ou posologia deve ser recomendada pela ferramenta.
* **Banner de Alerta:** Exibição obrigatória e destacada do aviso: *"Utilize somente dados fictícios. Esta ferramenta demonstra técnicas de análise de dados e IA e não executa diagnóstico médico."*

---

## 6. Tratamento de Erros
* Validação via Pydantic: caso algum sinal vital esteja fora das faixas fisiológicas possíveis (ex: SpO2 > 100 ou idade < 0), retornar status 422 com mensagem amigável e explicativa.

---

## 7. Critérios de Aceite
- [x] Endpoint responde em menos de 150ms.
- [x] Formulário no frontend populado dinamicamente com listas de sintomas reais do CSV.
- [x] Exibição de cards explicativos e distribuição de casos similares.
