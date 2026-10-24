# SOP 01 — Dataset & Base RAG Local

## 1. Objetivo
Carregar, sanitizar, validar e indexar em memória o conjunto de dados histórico (`data/data_saudesync_triagem.csv`), fornecendo serviço determinístico de consulta, estatísticas agregadas e recuperação contextual por similaridade (RAG Local) para suporte aos agentes e simuladores.

---

## 2. Entradas
* Caminho do arquivo: `data/data_saudesync_triagem.csv` (1.200 linhas, 24 colunas, codificação UTF-8).
* Parâmetros de consulta RAG:
  - `sintoma_principal` (string)
  - `idade` (int, opcional)
  - `classificacao_manchester` (string, opcional)
  - `sinais_vitais` (dict com PA, FC, Temp, SpO2, Glicemia, Dor)
  - `top_k` (int, padrão: 5)

---

## 3. Saídas
* Resumo estruturado do dataset com métricas de tempo, agrupamentos e totais.
* Contexto RAG para IA:
  ```json
  {
    "total_similares": 48,
    "classificacao_predominante": "Amarelo - Urgente",
    "tempo_medio_historico": 41.7,
    "especialidade_mais_comum": "Clínica Geral",
    "distribuicao_classes": {
      "Amarelo - Urgente": 35,
      "Laranja - Muito Urgente": 13
    },
    "casos_amostra": [
      {
        "atendimento_id": "ATD-2026-0001",
        "sintoma": "Gastroenterite aguda...",
        "classificacao": "Amarelo - Urgente",
        "tempo_real_min": 49,
        "conduta_historica": "Antiemético endovenoso..."
      }
    ]
  }
  ```

---

## 4. Contratos de Dados
* Todas as datas devem ser convertidas estritamente no formato `YYYY-MM-DD HH:mm`.
* Classificações Manchester válidas:
  - `Vermelho - Emergência`
  - `Laranja - Muito Urgente`
  - `Amarelo - Urgente`
  - `Verde - Pouco Urgente`
  - `Azul - Não Urgente`

---

## 5. Dependências
* Python 3.12+
* Pandas 2.2+
* NumPy 1.26+

---

## 6. Regras de Negócio
1. O dataset original na raiz nunca deve ser modificado em tempo de execução.
2. Nenhuma métrica estatística (média, mediana, percentil 90) deve ser estimada por probabilidade; deve ser calculada deterministicamente.
3. Tratamento para casos Vermelhos: como `tempo_espera_max_min == 0`, qualquer paciente vermelho com tempo > 0 é classificado como "Acima do tempo de referência", evitando divisão por zero.
4. Rótulo de condutas: qualquer exibição de conduta deve usar o aviso *"Conduta registrada no conjunto de dados simulado"*.

---

## 7. Tratamento de Erros e Exceções
* **Arquivo ausente:** Lançar `FileNotFoundError` com log claro e acionar tentativa de cópia a partir do backup na raiz.
* **Corrupção de linha:** Descartar linha inválida e registrar log de aviso sem interromper a API.

---

## 8. Fallback
Se o arquivo estiver inacessível, utilizar cache pré-calculado em `.tmp/dataset_analysis.json` para manter o painel e os KPIs operacionais no frontend.

---

## 9. Critérios de Aceite
- [x] Leitura de 1.200 linhas sem erros de encoding ou parse.
- [x] Zero valores nulos nas colunas críticas de triagem.
- [x] Recuperação de casos similares executada em menos de 50ms.
