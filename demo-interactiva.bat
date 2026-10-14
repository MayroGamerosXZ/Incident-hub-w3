@echo off
chcp 65001 >nul
:menu
cls
echo ======================================================================
echo          IT INCIDENT HUB - PANEL DE VERIFICACION Y DEMOSTRACION
echo          Lider: Mayro Gameros (@MayroGamerosXZ) - DevOps Lead
echo          Version: v1.0.0 (Produccion) ^| Azure Boards: AB#4 - AB#34
echo ======================================================================
echo.
echo  [1] Ejecutar Pruebas Automatizadas Unitarias (node --test tests/api.test.js)
echo  [2] Iniciar Sistema Completo (Backend + Frontend) y Abrir Navegador
echo  [3] Ejecutar Auditoria de Seguridad (npm audit)
echo  [4] Simular Creacion y Flujo de Incidente via API (REST Check)
echo  [5] Verificar Estado de Repositorios Git y Remotos (w1, w2, w3, azdo)
echo  [6] Salir
echo.
echo ======================================================================
set /p opt="Seleccione una opcion [1-6]: "

if "%opt%"=="1" goto test
if "%opt%"=="2" goto start_app
if "%opt%"=="3" goto audit
if "%opt%"=="4" goto api_check
if "%opt%"=="5" goto git_status
if "%opt%"=="6" goto fin
goto menu

:test
cls
echo --- EJECUTANDO SUITE DE PRUEBAS AUTOMATIZADAS (AB#24) ---
echo.
node --test tests/api.test.js
echo.
pause
goto menu

:start_app
cls
echo --- INICIANDO SERVICIOS DE IT INCIDENT HUB ---
call "%~dp0iniciar-sistema.bat"
goto menu

:audit
cls
echo --- AUDITORIA DE SEGURIDAD Y VULNERABILIDADES (AB#27) ---
echo.
cd /d "%~dp0backend"
call npm audit
cd /d "%~dp0"
echo.
pause
goto menu

:api_check
cls
echo --- PROBANDO API REST Y METRICAS EN TIEMPO REAL ---
echo.
powershell -Command "try { $res = Invoke-RestMethod -Uri 'http://localhost:5000/api/dashboard/stats'; Write-Host 'Conexion exitosa con Backend API:' -ForegroundColor Green; $res | Format-List } catch { Write-Host 'Aviso: El backend no esta encendido en el puerto 5000. Inicia primero la opcion 2.' -ForegroundColor Yellow }"
echo.
pause
goto menu

:git_status
cls
echo --- ESTADO DE RAMAS Y REMOTOS DE GIT ---
echo.
git status
echo.
echo Remotos configurados:
git remote -v
echo.
pause
goto menu

:fin
exit
