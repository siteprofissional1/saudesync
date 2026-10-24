/**
 * SAÚDE SYNC — Página Sobre o Projeto & Os 9 Pilares do Hackathon Antigravity
 */

export function renderAbout(container) {
  const pillars = [
    {
      num: 'Pilar 01',
      title: 'Engenharia & Diretivas',
      tech: 'SOPs, Markdown & 3 Layers',
      desc: 'Arquitetura formal baseada na pasta directives/, contendo SOP Mestre e 10 SOPs granulares governando dados, regras de negócio e limites éticos.',
      status: '✅ Implementado & Operacional'
    },
    {
      num: 'Pilar 02',
      title: 'UI/UX & Design System',
      tech: 'Vanilla CSS Tokens, Dark/Light Mode',
      desc: 'Design System responsivo testado em mobile, tablet e desktop. Cores oficiais do Protocolo de Manchester e contraste acessível (WCAG 2.1 AA).',
      status: '✅ Implementado & Operacional'
    },
    {
      num: 'Pilar 03',
      title: 'Base RAG & Mineração',
      tech: 'Pandas, NumPy & Cosine/Euclidean',
      desc: 'Indexação em memória de 1.200 atendimentos históricos reais do CSV, permitindo mineração contextual e recuperação de casos clínicos similares.',
      status: '✅ Implementado & Operacional'
    },
    {
      num: 'Pilar 04',
      title: 'Web Scraping / Dados Vivos',
      tech: 'Requests, BeautifulSoup4 & Cache',
      desc: 'Monitoramento contínuo da rede pública de saúde e farmácias de plantão de Ourinhos/SP, com controle de timeout, timestamp e fallback resiliente.',
      status: '✅ Implementado & Operacional'
    },
    {
      num: 'Pilar 05',
      title: 'Multi-Agentes & Gemini AI',
      tech: 'Data Agent, Operations & Gemini',
      desc: 'Arquitetura cooperativa onde Python calcula métricas determinísticas e o Gemini sintetiza relatórios em linguagem natural, sem inventar números.',
      status: '✅ Implementado & Operacional'
    },
    {
      num: 'Pilar 06',
      title: 'Realtime NoSQL (Firestore)',
      tech: 'Firebase Cloud Firestore onSnapshot',
      desc: 'Sincronização reativa da fila de atendimento ativo sem F5, com ordenação por gravidade e contingência demonstrativa inteligente.',
      status: '✅ Implementado & Operacional'
    },
    {
      num: 'Pilar 07',
      title: 'Governança & Segurança',
      tech: '.env, check_secrets.py & Rules',
      desc: 'Proteção de credenciais via .gitignore, regras restritivas no firestore.rules e script automatizado de auditoria contra vazamento de chaves.',
      status: '✅ Implementado & Operacional'
    },
    {
      num: 'Pilar 08',
      title: 'CI/CD & Deploy em Nuvem',
      tech: 'GitHub Actions, Cloud Run & Pages',
      desc: 'Dockerfile multi-stage para Google Cloud Run, esteira de testes automatizados e build otimizado com caminhos relativos para o GitHub Pages.',
      status: '✅ Implementado & Operacional'
    },
    {
      num: 'Pilar 09',
      title: 'Analytics com Plotly.js',
      tech: 'Plotly.js, KPIs & Filtros Reativos',
      desc: '8 gráficos interativos de alta precisão (Donut, Barras Agrupadas, Linhas e Horários) sincronizados com filtros multidimensionais.',
      status: '✅ Implementado & Operacional'
    }
  ];

  container.innerHTML = `
    <!-- Seção de Apresentação e Pitch -->
    <div style="background-color: var(--bg-surface); border: 1px solid var(--border-default); border-radius: var(--radius-lg); padding: 2rem; margin-bottom: 2rem; box-shadow: var(--card-shadow);">
      <div style="display: inline-block; padding: 0.35rem 0.75rem; background: var(--brand-glow); border-radius: 4px; color: var(--brand-accent); font-weight: 700; font-size: 0.8rem; margin-bottom: 0.75rem;">
        HACKATHON ANTIGRAVITY — SENAI OURINHOS
      </div>
      <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 0.75rem;">
        Saúde Sync: Triagem Inteligente e Gestão de Atendimento em Saúde
      </h2>
      <p style="font-size: 1rem; color: var(--text-secondary); line-height: 1.6; max-width: 980px; margin-bottom: 1.5rem;">
        Unidades de atendimento lidam diariamente com filas, diferentes níveis de prioridade e grandes volumes de informações operacionais. 
        O Saúde Sync transforma uma base histórica de 1.200 atendimentos em uma central inteligente de visualização, análise e acompanhamento em tempo real. 
        A plataforma combina processamento determinístico em Python, RAG sobre dados locais, sincronização viva com Firestore, dados externos da região de Ourinhos 
        e inteligência artificial generativa com Gemini para transformar números em decisões operacionais compreensíveis.
      </p>

      <div style="background-color: var(--bg-surface-elevated); border-left: 4px solid var(--brand-primary); padding: 1rem 1.25rem; border-radius: 0 var(--radius-md) var(--radius-md) 0; font-size: 0.9rem;">
        <strong>Lema Operacional de Engenharia:</strong>
        <span style="color: var(--brand-accent); font-weight: 700; margin-left: 0.35rem;">
          Python calcula. Gemini interpreta. Firestore sincroniza. Frontend apresenta.
        </span>
      </div>
    </div>

    <!-- Tabela / Grid dos 9 Pilares Obrigatórios -->
    <h3 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 1.25rem;">
      Matriz de Conformidade com os 9 Pilares Antigravity
    </h3>

    <div class="pillars-grid">
      ${pillars.map(p => `
        <div class="pillar-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="pillar-number">${p.num}</span>
            <span style="font-size: 0.75rem; color: var(--manchester-verde); font-weight: 700;">${p.status}</span>
          </div>
          <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">${p.title}</h4>
          <span style="font-size: 0.78rem; font-family: monospace; color: var(--brand-accent); background: var(--bg-surface-elevated); padding: 0.25rem 0.5rem; border-radius: 4px; width: fit-content;">
            ${p.tech}
          </span>
          <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
            ${p.desc}
          </p>
        </div>
      `).join('')}
    </div>

    <!-- Aviso Ético e Acadêmico -->
    <div style="margin-top: 2rem; background: var(--banner-bg); border: 1px solid var(--banner-border); border-radius: var(--radius-md); padding: 1.25rem; font-size: 0.85rem; color: var(--text-secondary);">
      <strong>Termo de Responsabilidade e Ética em IA:</strong>
      Este sistema foi desenvolvido exclusivamente para fins educacionais, demonstrativos e acadêmicos dentro do curso de Desenvolvimento de Aplicações com IA Generativa do SENAI Ourinhos.
      Todos os registros do dataset são simulados e não representam pacientes reais. O sistema não prescreve tratamentos nem substitui profissionais de saúde credenciados.
    </div>
  `;
}
