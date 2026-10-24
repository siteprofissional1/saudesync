# SOP 02 — Dashboard & Analytics com Plotly.js

## 1. Objetivo
Processar filtros dinâmicos e fornecer dados agregados para KPIs operacionais e gráficos interativos no frontend utilizando a biblioteca Plotly.js.

---

## 2. Entradas
Filtros opcionais via query parameters na rota `/api/dashboard/summary` e `/api/dashboard/charts`:
* `data_inicio` / `data_fim` (ISO ou `YYYY-MM-DD`)
* `classificacao` (ex: "Amarelo - Urgente")
* `municipio` (ex: "Ourinhos")
* `especialidade` (ex: "Clínica Geral")
* `status` (ex: "Aguardando na Fila")
* `sexo` ("M" ou "F")
* `faixa_etaria` ("0-12", "13-18", "19-59", "60+")
* `sintoma` (busca parcial por texto)

---

## 3. Saídas
* **KPIs Estruturados:**
  - `total_atendimentos`: contagem de registros filtrados.
  - `aguardando_fila`: atendimentos com status de espera.
  - `tempo_medio_espera`: média aritmética em minutos.
  - `tempo_mediano_espera`: mediana estatística.
  - `p90_espera`: percentil 90 de espera.
  - `acima_tempo_referencia`: total e percentual que excederam o limite Manchester.
  - `especialidade_mais_demandada`: nome e contagem.
  - `municipio_maior_volume`: nome e contagem.
* **Payloads para Plotly.js:**
  - Distribuição Manchester (Donut).
  - Status dos Atendimentos (Barras Verticais).
  - Tempo Médio Real vs Limite por Classificação (Barras Agrupadas).
  - Volume de Atendimentos por Faixa Horária (Linha/Área).
  - Top 7 Sintomas Mais Frequentes (Barras Horizontais).
  - Volume por Município (Barras).
  - Especialidades Demandadas (Barras Horizontais).
  - Evolução Diária dos Atendimentos (Linha).

---

## 4. Contratos de Dados
* Todas as respostas de gráficos devem fornecer arrays tipados com `x`, `y`, `labels`, `values`, `marker_colors` e layout padronizado de acordo com o tema Dark/Light ativo.

---

## 5. Dependências
* Python 3.12+ / FastAPI / Pandas
* Plotly.js (via CDN ou bundle leve no frontend)

---

## 6. Regras de Negócio
1. Os gráficos devem ser reativos aos filtros aplicados em tempo real.
2. Não estourar containers em resoluções móveis (usar `responsive: true` no Plotly).
3. Ao limpar filtros, retornar imediatamente aos valores consolidados da base completa.
4. Tabela de exploração em Analytics deve suportar busca com debounce e paginação (10, 25, 50 itens por página).

---

## 7. Tratamento de Erros
* Caso um filtro não retorne registros: responder com conjunto vazio e acionar *Empty State* no frontend ("Nenhum atendimento encontrado para os critérios selecionados").

---

## 8. Fallback
Em caso de falha de renderização do Plotly no navegador, exibir tabela textual simplificada com os totais de cada série.

---

## 9. Critérios de Aceite
- [x] Resposta dos cálculos em menos de 100ms.
- [x] Gráficos adaptáveis a telas de 375px a 4K.
- [x] Atualização síncrona de todos os 8 gráficos ao alterar qualquer seletor da barra de filtros.
