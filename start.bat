@echo off
echo =====================================================
echo   Starting Social Pulse Studio (Backend & Frontend)
echo =====================================================

REM Start Backend
start "Social Pulse Backend (FastAPI)" cmd /k "cd /d %~dp0backend && .venv\Scripts\python.exe run.py"

REM Start Frontend
start "Social Pulse Frontend (Vite React)" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

echo Services started!
echo Backend:  http://127.0.0.1:8080
echo Frontend: http://localhost:5173
pause
