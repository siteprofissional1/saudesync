# SOP 06 — Web Scraping & Coleta de Dados Vivos

## 1. Objetivo
Monitorar e extrair dados dinâmicos de serviços públicos de saúde, farmácias de plantão e disponibilidade de atendimento na região de Ourinhos/SP, alimentando a aba de Dados Vivos e oferecendo visão operacional em tempo real da rede assistencial externa.

---

## 2. Fonte de Dados e Configuração
* Variável de Ambiente: `LIVE_HEALTH_SOURCE_URL`
* Fonte Primária: Portais públicos regionais e serviços de escala farmacêutica/saúde de Ourinhos.
* Estrutura de Extração:
  - Nome do Estabelecimento (ex: Farmácia Municipal de Ourinhos, UPA 24h, Drogaria Plantonista)
  - Tipo de Serviço (Pronto Atendimento, Farmácia 24h, UBS de Apoio)
  - Endereço / Região de Ourinhos
  - Telefone de Contato Público
  - Status de Plantão / Horário de Funcionamento
  - Timestamp da Coleta

---

## 3. Arquitetura do Scraper
Localização: `backend/app/services/scraper_service.py`
* Biblioteca: `requests` + `beautifulsoup4`
* Headers HTTP: `User-Agent` realista imitando navegador moderno para evitar bloqueios de requisição padrão.
* Timeout: 5 segundos.
* Camada de Cache: Os dados coletados são salvos em memória e em `.tmp/live_health_cache.json` com TTL (Time To Live) de 30 minutos, evitando chamadas repetidas ou sobrecarga do servidor de origem.

---

## 4. Regras e Boas Práticas Éticas
1. Não realizar requisições agressivas ou loops contínuos (limite de 1 requisição por ciclo de atualização).
2. Não tentar contornar CAPTCHAs ou sistemas de autenticação fechados.
3. Se a URL externa estiver indisponível ou retornar erro HTTP 4xx/5xx:
   - Exibir mensagem clara: *"Fonte externa temporariamente indisponível. Exibindo última coleta disponível em cache."*
   - Jamais inventar registros ou mascarar falhas.

---

## 5. Endpoints Relacionados
* `GET /api/live-data`: Retorna a lista atual de estabelecimentos, fonte, status do scraper e data/hora da última coleta.
* `POST /api/live-data/refresh`: Força uma nova tentativa de raspagem contra a fonte configurada.

---

## 6. Critérios de Aceite
- [x] Parser resiliente que não quebra diante de mudanças sutis no HTML.
- [x] Cache ativo com carimbo de data/hora (timestamp).
- [x] Fallback demonstrativo elegante com dados da rede de saúde de Ourinhos em caso de ausência de conexão.
