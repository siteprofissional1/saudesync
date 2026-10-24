# Ideia e Conceito de Design — Saúde Sync

## 1. Identidade de Marca
* **Nome:** Saúde Sync
* **Conceito:** Inteligência Operacional, Triagem em Saúde e Gestão de Fluxos em Tempo Real.
* **Personalidade da Interface:**
  - *HealthTech Moderna:* Limpa, precisa, médica e tecnológica.
  - *SaaS Enterprise:* Densidade de informação balanceada, tabelas legíveis, cartões de métricas intuitivos.
  - *Data Intelligence:* Visualizações gráficas sofisticadas com Plotly.js, destacando desvios e padrões sem poluição visual.
  - *Confiabilidade e Sobriedade:* Foco em legibilidade imediata para cenários de pronto atendimento e gestão de saúde.

---

## 2. O que Evitar
* ❌ Cores saturadas infantis ou gradientes chamativos sem propósito funcional.
* ❌ Excesso de ícones ilustrativos ou ornamentações desnecessárias.
* ❌ Tipografia com serifa ou fontes decorativas ilegíveis em telas compactas.
* ❌ Apresentação de prioridade baseada unicamente em cores (sempre associar texto, ícone e badge semântico).
* ❌ Interfaces lentas com dependência de bibliotecas pesadas de animação.

---

## 3. Pilares da Experiência do Usuário (UX)
1. **Clareza Imediata:** Um médico ou gestor deve bater o olho no dashboard e identificar em menos de 3 segundos quantos pacientes estão na fila e se há pacientes críticos (Vermelho/Laranja) com tempo excedido.
2. **Dual Theme Nativo:** Dark Mode ergonômico para ambientes hospitalares com baixa iluminação e Light Mode nítido para relatórios diurnos e salas bem iluminadas.
3. **Feedbacks Visuais Ativos:** Indicadores pulsantes discretos para conexão em tempo real com o Firestore (`onSnapshot`), esqueletos de carregamento (skeletons) e badges explicativos.
4. **Mobile First & Touch Ready:** Painéis operáveis perfeitamente em telas de smartphones de plantonistas (botões com alvos táteis mínimos de 44x44px).
