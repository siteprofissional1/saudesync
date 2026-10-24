# Imagem oficial Python 3.12 Slim
FROM python:3.12-slim

# Evitar escrita de bytecode .pyc e ativar flush de logs imediato
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

WORKDIR /app

# Instalar dependências do sistema necessárias
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements e instalar pacotes Python
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copiar código do backend e dataset operacional
COPY backend/ /app/backend/
COPY data/ /app/data/
COPY directives/ /app/directives/

# Expor a porta configurável (Google Cloud Run injeta a variável $PORT)
EXPOSE 8000

# Executar a aplicação FastAPI via uvicorn
CMD exec uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT}
