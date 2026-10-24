# Visão do Produto — Saúde Sync

## 1. Visão Geral
* **Nome do Produto:** Saúde Sync
* **Subtítulo:** Triagem Inteligente e Gestão de Atendimento em Saúde
* **Definição:** Central web inteligente de inteligência operacional para gestão de triagem, filas em tempo real, analytics preditivo-descritivo de atendimento e suporte a decisões operacionais em saúde com dados simulados.
* **Contexto de Criação:** Hackathon Antigravity — Projeto Final do curso Desenvolvimento de Aplicações com IA Generativa do SENAI Ourinhos.

---

## 2. O Problema
Unidades de pronto atendimento (UPAs), prontos-socorros e centros de saúde enfrentam desafios críticos e contínuos:
* **Sobrecarga de Filas:** Dificuldade em equilibrar tempos de espera de acordo com a gravidade clínica (Protocolo de Manchester).
* **Múltiplos Níveis de Prioridade:** Casos urgentes (Vermelho/Laranja) demandam intervenção imediata, enquanto casos não urgentes (Verde/Azul) acumulam-se e inflam indicadores de espera.
* **Dados Fragmentados e Silos de Informação:** Equipes médicas e gestores de plantão operam sem painéis integrados e reativos em tempo real.
* **Gargalos Operacionais Ocultos:** Dificuldade em identificar horários de pico, especialidades saturadas e taxa de pacientes atendidos acima do tempo de referência.
* **Falta de Apoio Operacional Inteligente:** Ausência de síntese executiva por IA que explique tendências a partir de dados históricos sem ferir preceitos éticos ou gerar prescrições médicas indevidas.

---

## 3. A Solução Saúde Sync
O Saúde Sync é uma plataforma moderna e integrada que une determinismo matemático, sincronização reativa e inteligência generativa:
1. **Dashboard Operacional e KPIs Reais:** Indicadores calculados dinamicamente sobre a base histórica (1.200 atendimentos), exibindo tempos médios, percentis (P90), taxas de cumprimento de meta e distribuição Manchester.
2. **Fila em Tempo Real (Realtime NoSQL):** Sincronização viva via Firebase Cloud Firestore (`onSnapshot`), refletindo atualizações de status, chamadas de pacientes e ocupação de leitos sem necessidade de recarregar a página (F5).
3. **Simulador Acadêmico de Triagem & RAG Local:** Mecanismo determinístico de recuperação de casos análogos por similaridade clínica (sintomas e sinais vitais) sobre o CSV, oferecendo explicabilidade e estatística histórica.
4. **Sistema Multi-Agentes:**
   - *Data Agent:* Mineração, filtros e métricas determinísticas.
   - *Operations Agent:* Análise de filas, gargalos e metas operacionais.
   - *Gemini Agent:* Interpretação contextual em linguagem natural estruturada a partir dos cálculos dos agentes determinísticos.
5. **Dados Vivos de Saúde Regional (Web Scraping):** Monitoramento contínuo de serviços públicos de saúde e farmácias de plantão de Ourinhos e região, com sistema de cache, timestamp de coleta e fallback resiliente.
6. **Analytics Avançado com Plotly.js:** Visualizações gráficas interativas, responsivas e reativas a filtros globais multidimensionais.

---

## 4. Público-Alvo Demonstrativo
* **Gestores Hospitalares e de UPAs:** Para visualização estratégica de gargalos, capacidade instalada e cumprimento de tempos de referência.
* **Equipes Administrativas e Plantonistas:** Para controle ágil da fila e visualização de leitos ocupados.
* **Analistas de Operações em Saúde:** Para estudo exploratório de comorbidades, sintomas frequentes e correlações temporais.
* **Avaliadores do Hackathon SENAI Antigravity:** Demonstração prática do uso harmônico dos 9 pilares de engenharia de software e inteligência artificial.

---

## 5. Limitações e Caráter Acadêmico (Disclaimer Ético)
* **Finalidade Estritamente Acadêmica e Demonstrativa:** O sistema não realiza diagnósticos, não prescreve tratamentos, não indica dosagens e não substitui médicos ou enfermeiros.
* **Dados Fictícios e Sintéticos:** O dataset de 1.200 registros contém dados gerados para simulação acadêmica. Nomes de médicos, registros de conselho (CRM) e identificadores de pacientes são puramente demonstrativos.
* **Privacidade e LGPD:** O sistema não coleta e não armazena CPF, RG, telefones reais, endereços residenciais ou prontuários autênticos de pacientes.
* **Rótulo Normativo:** O campo `protocolo_sugerido_ia` contido no CSV é catalogado expressamente como *"Conduta registrada no conjunto de dados simulado"* e jamais como conduta do Saúde Sync.
