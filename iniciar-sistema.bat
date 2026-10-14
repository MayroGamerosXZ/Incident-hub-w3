@echo off
chcp 65001 >nul
title IT Incident Hub - Iniciador de Sistema
echo ========================================================
echo   IT Incident Hub v1.0.0 - Iniciando Entorno Local
echo ========================================================
echo.
echo [1/2] Iniciando Backend API (Puerto 5000)...
start "Incident Hub - Backend API" cmd /k "cd /d "%~dp0backend" && node server.js"

echo [2/2] Iniciando Frontend SPA (Puerto 5173)...
start "Incident Hub - Frontend SPA" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Esperando 3 segundos para que los servicios inicien...
timeout /t 3 /nobreak >nul

echo Abriendo navegador en http://localhost:5173...
start http://localhost:5173

echo.
echo ========================================================
echo   Sistema levantado con exito!
echo   - Backend API: http://localhost:5000/api
echo   - Frontend UI:  http://localhost:5173
echo ========================================================
echo.
pause
