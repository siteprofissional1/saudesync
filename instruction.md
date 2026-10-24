# Guia de Operação e Comandos do Desenvolvedor — Saúde Sync

Este guia fornece os comandos padronizados para instalação, execução, testes, povoamento de banco e deploy do sistema **Saúde Sync**.

---

## 1. Instalar Frontend
Navegue até a pasta do frontend e instale as dependências:
```bash
cd frontend
npm install
```

## 2. Executar Frontend (Modo Desenvolvimento)
Inicia o servidor de desenvolvimento Vite com hot-reload na porta 5173:
```bash
cd frontend
npm run dev
```
Acesse: [http://localhost:5173](http://localhost:5173)

---

## 3. Instalar Backend
Instale as dependências Python a partir da raiz do projeto:
```bash
pip install -r backend/requirements.txt
```

## 4. Executar Backend (FastAPI)
Inicie a API com recarregamento automático na porta 8000:
```bash
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Base: [http://localhost:8000](http://localhost:8000)
- Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 5. Analisar o Dataset
Executa a auditoria completa de sanitização e cálculo dinâmico sobre os 1.200 atendimentos do CSV:
```bash
python scripts/analyze_dataset.py
```

## 6. Executar Testes Automatizados
Roda a suíte completa com os 22 testes unitários e de integração:
```bash
python -m pytest tests/ -v
```

## 7. Popular o Firebase Firestore (Seed)
Extrai uma amostra balanceada com as 5 cores do Protocolo de Manchester para a coleção `fila_atendimento`:
```bash
python scripts/seed_firestore.py
```

## 8. Build do Frontend para Produção
Gera o bundle estático otimizado na pasta `frontend/dist/` (pronto para GitHub Pages):
```bash
cd frontend
npm run build
```

## 9. Docker Backend (Google Cloud Run)
Para construir e testar o container localmente:
```bash
docker build -t saudesync-api -f backend/Dockerfile .
docker run -p 8000:8000 -e PORT=8000 saudesync-api
```

## 10. Verificar Segredos (Scanner de Auditoria)
Varre todo o repositório em busca de chaves privadas ou tokens não autorizados:
```bash
python scripts/check_secrets.py
```

## 11. Validar Conformidade do Projeto
Verifica a presença de todos os arquivos normativos, SOPs e diretivas:
```bash
python scripts/validate_project.py
```

## 12. Execução Facilitada no Windows
Dê um duplo clique ou execute via terminal:
- Via Batch: `executar.bat`
- Via PowerShell: `.\executar.ps1`
