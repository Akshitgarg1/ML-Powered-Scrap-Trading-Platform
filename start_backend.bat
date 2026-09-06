@echo off
cd /d "%~dp0"
echo ===================================================
echo Starting TradeSmart Backend (FastAPI on Port 5050)...
echo ===================================================
if exist ".\venv\Scripts\python.exe" (
    .\venv\Scripts\python.exe server\app.py
) else (
    echo Using system Python to start server...
    python server\app.py
)
