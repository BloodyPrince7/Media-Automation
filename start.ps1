# Social Media Automation Studio - Start Script (PowerShell)

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  Starting Social Pulse Studio (Backend & Frontend)  " -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Cyan

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start Backend in background process
Write-Host "[1/2] Launching FastAPI Backend on http://127.0.0.1:8080..." -ForegroundColor Yellow
$BackendProcess = Start-Process -FilePath "$Root\backend\.venv\Scripts\python.exe" -ArgumentList "$Root\backend\run.py" -WorkingDirectory "$Root\backend" -PassThru

# Wait briefly for backend to spin up
Start-Sleep -Seconds 2

# 2. Launch Frontend dev server
Write-Host "[2/2] Launching React Vite Frontend on http://localhost:5173..." -ForegroundColor Yellow
Set-Location "$Root\frontend"
& npm.cmd run dev
