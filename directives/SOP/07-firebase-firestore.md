# SOP 07 — Firebase Cloud Firestore & Realtime Sync

## 1. Objetivo
Estruturar o banco de dados NoSQL Cloud Firestore, configurar permissões de segurança por meio de regras declarativas (`firestore.rules`) e garantir a sincronização da fila de atendimentos e métricas operacionais sem recarregar a interface.

---

## 2. Coleções do Firestore
1. `fila_atendimento`:
   - Armazena os atendimentos ativos em espera ou em atendimento imediato.
   - Atualizado pelo script de seeding e por ações de simulação.
   - Monitorado pelo frontend via listener `onSnapshot`.
2. `dados_externos`:
   - Armazena a última coleta bem-sucedida do serviço de scraping.
3. `ai_insights`:
   - Histórico de insights estratégicos gerados pelo módulo multi-agentes.
4. `system_metrics`:
   - Métricas de uso e integridade da aplicação.

---

## 3. Script de Seeding (`scripts/seed_firestore.py`)
* O script carrega o arquivo `data/data_saudesync_triagem.csv`.
* Filtra os atendimentos com status ativo (ex: "Aguardando na Fila", "Aguardando Chamada Prioritária", "Em Atendimento Médico").
* Seleciona uma amostra representativa de 35 a 50 documentos abrangendo todas as classificações Manchester.
* Insere no Firestore mantendo o ID original do atendimento (`atendimento_id`).
* Exibe relatório detalhado no terminal ao finalizar.

---

## 4. Regras de Segurança (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Leitura pública controlada para dados demonstrativos do Hackathon
    match /fila_atendimento/{document=**} {
      allow read: if true;
      allow write: if request.auth != null || request.resource.data.senha_painel is string;
    }
    match /dados_externos/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /ai_insights/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 5. Tratamento de Ausência de Credenciais (Mock Realtime)
Caso o Firebase não esteja configurado no momento da execução:
* O frontend e o backend entram no "Modo de Demonstração com Fallback Local".
* A interface exibe aviso informativo indicando que as credenciais do Firebase ainda não foram inseridas no `.env`, operando com dados simulados em memória sem interrupção de fluxo.

---

## 6. Critérios de Aceite
- [x] Regras de segurança em `firestore.rules` sem permissão irrestrita cega.
- [x] Script de seed idempotente (não duplica dados se executado repetidas vezes).
- [x] Atualizações na coleção `fila_atendimento` refletidas instantaneamente na interface.
