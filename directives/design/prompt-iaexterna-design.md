# Prompt para IA Externa — Auditoria e Expansão de Design UI/UX

> **Finalidade:** Fornecer diretrizes a modelos de linguagem especializados em design de interfaces (como Claude 3.5 Sonnet ou GPT-4o) para auditar e sugerir melhorias na consistência do design system do Saúde Sync.

---

```markdown
Atue como Especialista Sênior em UI/UX e Design System para Aplicações HealthTech / SaaS Enterprise.

Você deve analisar as especificações visuais do projeto **Saúde Sync** em `directives/design/design.md` e validar se todos os requisitos abaixo foram atendidos:

1. **Tokens Semânticos & Temas:**
   - As variáveis CSS Custom Properties cobrem integralmente Canvas, Surfaces (Cards, Modais, Tooltips), Bordas e Hierarquia Tipográfica?
   - O contraste das cores em Dark Mode (`#07111F`) e Light Mode (`#F4F8FB`) atinge o padrão WCAG 2.1 AA?

2. **Protocolo de Manchester na Saúde:**
   - As 5 cores clássicas (Vermelho, Laranja, Amarelo, Verde, Azul) estão associadas a badges com texto legível, ícones e tempo de referência explícito?
   - O caso extremo de Vermelho (0 min) possui tratamento visual claro que não provoque divisão por zero ou gráficos distorcidos?

3. **Plotly.js Integrado:**
   - As paletas dos gráficos do Plotly.js refletem o tema atual do sistema dinamicamente (fundo transparente, grid em tons sutis, eixos com textos legíveis)?

4. **Componentes e Estados:**
   - Os quatro estados essenciais (*Loading Skeleton*, *Success*, *Empty State*, *Error Banner*) estão previstos em cada visualização de dados?
   - A tabela da Fila em Tempo Real oferece legibilidade rápida com destaque de status?

5. **Responsividade Estrita:**
   - A sidebar recolhe para drawer ou modo compacto em telas menores que 768px?
   - Alvos de toque em mobile possuem dimensões mínimas de 44x44px?

6. **Rodapé Obrigatório:**
   - Há a inclusão obrigatória na última linha de: "Desenvolvido por siteprofissional" com link em azul direcionando para siteprofissional.pro?

Emita um parecer estruturado destacando pontos fortes e ajustes de polimento visual.
```
