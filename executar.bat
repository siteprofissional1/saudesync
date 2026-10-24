@echo off
chcp 65001 > nul
cls
echo ========================================================
echo        SAÚDE SYNC — INICIALIZAÇÃO LOCAL (WINDOWS)
echo     Hackathon Antigravity — SENAI Ourinhos Edition
echo ========================================================
echo.

echo [1/3] Verificando ambiente Python...
python --version > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Python não encontrado no PATH! Por favor, instale Python 3.12+.
    pause
    exit /b 1
)
echo      Python detectado com sucesso.

echo.
echo [2/3] Verificando ambiente Node.js / npm...
npm --version > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js / npm não encontrado no PATH! Por favor, instale o Node.js.
    pause
    exit /b 1
)
echo      Node.js detectado com sucesso.

echo.
echo [3/3] Iniciando serviços do Saúde Sync...
echo.
echo --------------------------------------------------------
echo 1. O Backend FastAPI será iniciado em: http://localhost:8000
echo    (Documentação interativa disponível em http://localhost:8000/docs)
echo 2. O Frontend Vite será iniciado em: http://localhost:5173
echo --------------------------------------------------------
echo.

start "Saúde Sync - Backend FastAPI" cmd /k "cd /d %~dp0 && python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload"
start "Saúde Sync - Frontend Vite" cmd /k "cd /d %~dp0\frontend && npm run dev"

echo.
echo ✅ Ambos os serviços foram iniciados em janelas dedicadas!
echo    Pressione qualquer tecla para fechar este inicializador.
pause > nul
