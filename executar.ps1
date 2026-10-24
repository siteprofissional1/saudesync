<#
.SYNOPSIS
    SAÚDE SYNC — Script de Inicialização Automatizada (PowerShell)
    Hackathon Antigravity — SENAI Ourinhos Edition

.DESCRIPTION
    Verifica os pré-requisitos, valida as dependências e inicia o Backend FastAPI e o Frontend Vite
    em janelas de terminal dedicadas.
#>

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Clear-Host

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       SAÚDE SYNC — INICIALIZAÇÃO LOCAL (POWERSHELL)    " -ForegroundColor White
Write-Host "    Hackathon Antigravity — SENAI Ourinhos Edition      " -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Checagem do Python
Write-Host "[1/3] Verificando ambiente Python..." -ForegroundColor White
try {
    $pythonVersion = python --version 2>&1
    Write-Host "      $pythonVersion detectado." -ForegroundColor Green
} catch {
    Write-Host "      [ERRO] Python não encontrado no PATH!" -ForegroundColor Red
    exit 1
}

# 2. Checagem do Node.js
Write-Host "[2/3] Verificando ambiente Node.js / npm..." -ForegroundColor White
try {
    $nodeVersion = node --version 2>&1
    $npmVersion = npm --version 2>&1
    Write-Host "      Node.js $nodeVersion (npm $npmVersion) detectado." -ForegroundColor Green
} catch {
    Write-Host "      [ERRO] Node.js ou npm não encontrado no PATH!" -ForegroundColor Red
    exit 1
}

# 3. Inicialização dos Serviços
Write-Host ""
Write-Host "[3/3] Iniciando serviços..." -ForegroundColor White
Write-Host "      • Backend FastAPI : http://localhost:8000" -ForegroundColor Cyan
Write-Host "      • Docs Swagger    : http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "      • Frontend Vite   : http://localhost:5173" -ForegroundColor Green
Write-Host ""

$baseDir = $PSScriptRoot

# Iniciar Backend FastAPI em novo processo
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir'; python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload"

# Iniciar Frontend Vite em novo processo
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir\frontend'; npm run dev"

Write-Host "✅ Ambos os serviços foram iniciados em janelas separadas!" -ForegroundColor Green
Write-Host "   Para encerrar, basta fechar as janelas correspondentes." -ForegroundColor Gray
