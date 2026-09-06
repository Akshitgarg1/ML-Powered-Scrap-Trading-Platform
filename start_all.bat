@echo off
cd /d "%~dp0"
echo ========================================================
echo Launching TradeSmart Backend and Frontend in parallel...
echo ========================================================
start "TradeSmart Backend [FastAPI :5050]" cmd /k "start_backend.bat"
start "TradeSmart Frontend [Vite :5173]" cmd /k "start_frontend.bat"
echo.
echo Both servers have been launched in separate windows!
echo - Backend:  http://localhost:5050 (Docs: http://localhost:5050/docs)
echo - Frontend: http://localhost:5173
echo.
