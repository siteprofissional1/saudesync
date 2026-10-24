# SOP 03 — Fila em Tempo Real (Realtime NoSQL)

## 1. Objetivo
Gerenciar a fila de espera ativa por meio do Firebase Cloud Firestore, permitindo sincronização bidirecional e instantânea entre o sistema e todos os clientes conectados sem necessidade de recarregar a página (F5).

---

## 2. Entradas
* Coleção do Firestore: `fila_atendimento`.
* Documento de Atendimento:
  - `atendimento_id`: string única (ex: "ATD-2026-0002")
  - `senha_painel`: string curta (ex: "V974")
  - `paciente_idade`: int
  - `paciente_sexo`: string ("M"/"F")
  - `classificacao`: string Manchester
  - `tempo_espera_real_min`: int
  - `tempo_espera_max_min`: int
  - `especialidade`: string
  - `leito`: string
  - `status`: string ("Aguardando na Fila", "Em Atendimento", etc.)
  - `data_hora_chegada`: string ISO
  - `updated_at`: timestamp do servidor

---

## 3. Saídas
* Stream reativo de dados no frontend via callback `onSnapshot`.
* Indicadores visuais de tempo excedido e novos atendimentos na fila.

---

## 4. Contratos de Dados
* Ordenação canônica na UI:
  1. Prioridade Manchester: Vermelho -> Laranja -> Amarelo -> Verde -> Azul.
  2. Em caso de mesma prioridade: Maior `tempo_espera_real_min` (tempo de espera decorrido).

---

## 5. Dependências
* Firebase Web SDK v10+ (Modular)
* Firebase Admin SDK (para script de seeding / backend)

---

## 6. Regras de Negócio
1. O frontend NUNCA deve expor credenciais de Service Account ou permissões de escrita irrestritas.
2. Alerta de Tempo: Se `tempo_espera_real_min > tempo_espera_max_min`, exibir badge estilizado: "Tempo de referência excedido (+X min)". Nunca utilizar termos como "Paciente em risco de morte".
3. Script de seeding (`scripts/seed_firestore.py`): Deve popular o Firestore com uma amostra representativa de registros do CSV (ex: 30 a 50 casos em espera ativa), sem duplicar toda a base histórica.

---

## 7. Tratamento de Erros
* Conexão perdida com Firebase: acionar indicador visual discreto no header ("Modo Offline / Demonstração") e manter a última lista válida em cache de memória do navegador.

---

## 8. Fallback
Se as credenciais do Firebase não estiverem presentes no ambiente, a interface deve ativar o "Modo Demonstrativo Simulado", exibindo registros locais e simulando atualizações periódicas a cada 15 segundos para fins de teste no Hackathon.

---

## 9. Critérios de Aceite
- [x] Listener `onSnapshot` configurado e funcional.
- [x] Atualização de linha na tabela em tempo real sem piscar ou recarregar a tela inteira.
- [x] Seletor e filtros de prioridade na fila em tempo real.
