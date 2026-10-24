# Especificação Completa de Design System — Saúde Sync

---

## 1. Tokens de Cores e Temas (CSS Custom Properties)

A interface adota variáveis CSS globais chaveadas pelo atributo `data-theme="dark"` e `data-theme="light"` no elemento `<html>` ou `<body>`.

### Dark Mode (Padrão Primário de Operação)
```css
:root[data-theme="dark"] {
  --bg-canvas: #07111F;           /* Fundo da aplicação */
  --bg-surface: #0D1B2A;          /* Fundo dos cartões e painéis */
  --bg-surface-elevated: #13263A; /* Menus flutuantes, tooltips, modais */
  --border-subtle: #1E3349;       /* Divisores secundários */
  --border-default: #223A50;      /* Bordas dos cartões e tabelas */
  --border-focused: #2F80ED;      /* Foco de teclado e inputs ativos */
  
  --text-primary: #F5F9FC;        /* Títulos e textos de destaque */
  --text-secondary: #9FB2C4;      /* Subtítulos e rótulos */
  --text-muted: #647B91;          /* Metadados e números secundários */
  
  --brand-primary: #2F80ED;       /* Azul HealthTech institucional */
  --brand-hover: #1E6DD8;
  --brand-accent: #21C7D9;        /* Ciano de inovação e telemetria */
  --brand-glow: rgba(47, 128, 237, 0.15);
}
```

### Light Mode (Ambientes Iluminados / Exportação)
```css
:root[data-theme="light"] {
  --bg-canvas: #F4F8FB;           /* Fundo clean */
  --bg-surface: #FFFFFF;          /* Fundo de cartões */
  --bg-surface-elevated: #F8FAFC;
  --border-subtle: #E2E8F0;
  --border-default: #DCE7EF;
  --border-focused: #2F80ED;
  
  --text-primary: #102A43;        /* Azul marinho profundo */
  --text-secondary: #486581;      /* Cinza ardósia */
  --text-muted: #829AB1;
  
  --brand-primary: #1E6DD8;
  --brand-hover: #1355B5;
  --brand-accent: #0EA5E9;
  --brand-glow: rgba(30, 109, 216, 0.12);
}
```

---

## 2. Cores Semânticas do Protocolo Manchester
Não comunicar prioridade unicamente pela cor. Cada nível deve possuir badge com cor de fundo, cor de borda, rótulo textual e ícone.

| Classificação | Cor Hex | Uso & Significado | Limite Referência |
|---|---|---|---|
| **Vermelho** | `#EF4444` | Emergência — Risco imediato à vida | 0 min (imediato) |
| **Laranja** | `#F97316` | Muito Urgente — Risco potencial alto | 10 min |
| **Amarelo** | `#EAB308` | Urgente — Gravidade moderada | 60 min |
| **Verde** | `#22C55E` | Pouco Urgente — Condição estável | 120 min |
| **Azul** | `#3B82F6` | Não Urgente — Quadros simples/eletivos | 240 min |

---

## 3. Tipografia e Escala Hierárquica
* **Fonte Primária da Interface:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
* **Fonte dos Números e KPIs:** Utilizar `font-variant-numeric: tabular-nums` para evitar oscilação visual durante contagens e atualizações em tempo real.
* **Escala Tipográfica:**
  - `H1 (Page Title):` 28px - 32px / 700 / line-height: 1.2
  - `H2 (Section Title):` 20px - 24px / 600 / line-height: 1.3
  - `H3 (Card Title):` 16px - 18px / 600 / line-height: 1.4
  - `Body Regular:` 14px - 15px / 400 / line-height: 1.5
  - `Label / Small:` 12px - 13px / 500 / uppercase para tags técnicas
  - `Microtext / Footnote:` 11px - 12px / 400

---

## 4. Layout e Grid Responsivo
* **Desktop (1280px+):**
  - Sidebar fixa à esquerda (largura: 260px).
  - Header fixo no topo com indicadores de conectividade, busca e theme toggle.
  - Área principal fluida com grid de 12 colunas ou flexbox auto-fit.
* **Tablet (768px a 1279px):**
  - Sidebar retrátil (ícone colapsável) ou largura compacta (72px com ícones).
  - Gráficos distribuídos em grid de 1 a 2 colunas.
* **Mobile (< 768px):**
  - Header compacto com botão de menu hamburguer / drawer deslizante.
  - Cards de KPIs empilhados em 1 ou 2 colunas.
  - Tabelas com rolagem horizontal contida ou transição para cartões empilhados.
  - Gráficos Plotly com altura adaptativa mínima de 280px e rolagem suave.

---

## 5. Componentes Principais

### 5.1. Sidebar de Navegação
* **Logo:** Ícone estilizado de pulso vital + "Saúde Sync" + Badge "Hackathon SENAI".
* **Navegação (7 Seções):**
  1. Visão Geral (Dashboard)
  2. Fila em Tempo Real (Firestore onSnapshot)
  3. Triagem Simulada (RAG Local)
  4. Analytics (Exploração do Dataset)
  5. Dados Vivos (Scraper Ourinhos)
  6. Insights IA (Multi-Agentes Gemini)
  7. Sobre o Projeto (Os 9 Pilares)
* **Rodapé da Sidebar:** Indicadores compactos de API (Online/Offline), Firestore (Conectado/Demo) e Versão (1.0.0).

### 5.2. Header da Aplicação
* Breadcrumb e título dinâmico da página atual.
* Badge de status do backend (verde/vermelho).
* Badge de conexão com o banco de dados em tempo real.
* Alternador de Tema (Botão com ícones Sol/Lua).
* Botão de atualização rápida de dados.

### 5.3. KPI Card (Indicador de Desempenho)
* Título da métrica (ex: "Aguardando na Fila").
* Valor numérico com fonte tabular em tamanho 28px+.
* Subtítulo explicativo com contexto operacional (ex: "82% dentro do limite").
* Ícone lateral com fundo tonal sutil.
* Efeito hover com elevação suave (`transform: translateY(-2px)`).

### 5.4. Tabela de Fila e Analytics
* Cabeçalho fixo (*sticky header*).
* Destaque sutil na linha ao passar o cursor (*row hover*).
* Badges de status semânticos:
  - "Aguardando": Amarelo/Laranja sutil
  - "Em Atendimento": Azul sutil
  - "Alta Médica": Verde sutil
  - "Tempo Excedido": Badge vermelho com aviso "+X min".

### 5.5. Rodapé Institucional Obrigatório
* Exibição na última linha de todas as visualizações, centralizado no centro:
  ```html
  <footer class="app-footer">
    Desenvolvido por <a href="https://siteprofissional.pro" target="_blank" rel="noopener noreferrer" style="color: #2F80ED; font-weight: 600;">siteprofissional</a>
  </footer>
  ```

---

## 6. Acessibilidade (WCAG 2.1 AA)
* Contraste mínimo de 4.5:1 para textos regulares e 3:1 para textos grandes.
* Foco de teclado visível (`outline: 2px solid var(--brand-primary); outline-offset: 2px`).
* Atributos `aria-label` e `role` em todos os botões e áreas interativas.
* Respeito às preferências do usuário: `@media (prefers-reduced-motion: reduce)` desativa animações não essenciais.
