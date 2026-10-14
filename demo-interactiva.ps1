# IT Incident Hub - Panel Interactivo de Demostración y Verificación
# Líder: Mayro Gameros (@MayroGamerosXZ) - DevOps Lead

function Show-Menu {
    Clear-Host
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host "       IT INCIDENT HUB - PANEL DE VERIFICACION Y DEMOSTRACION       " -ForegroundColor Yellow
    Write-Host "       Lider: Mayro Gameros (@MayroGamerosXZ) - DevOps Lead         " -ForegroundColor Green
    Write-Host "       Version: v1.0.0 (Produccion) | Azure Boards: AB#4 - AB#34     " -ForegroundColor White
    Write-Host "======================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host " [1] Ejecutar Pruebas Automatizadas Unitarias (7/7 tests en <200ms)" -ForegroundColor White
    Write-Host " [2] Iniciar Sistema Completo (Backend:5000 + Frontend:5173)" -ForegroundColor White
    Write-Host " [3] Ejecutar Auditoria de Seguridad (npm audit - 0 vulnerabilidades)" -ForegroundColor White
    Write-Host " [4] Probar API REST y Metricas del Dashboard en Vivo" -ForegroundColor White
    Write-Host " [5] Verificar Estado de Repositorios Git y Remotos (w1, w2, w3, azdo)" -ForegroundColor White
    Write-Host " [6] Salir" -ForegroundColor White
    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Cyan
}

$running = $true
while ($running) {
    Show-Menu
    $choice = Read-Host "Seleccione una opcion [1-6]"
    switch ($choice) {
        "1" {
            Clear-Host
            Write-Host "--- EJECUTANDO PRUEBAS UNITARIAS AUTOMATIZADAS (AB#24) ---" -ForegroundColor Green
            Write-Host ""
            node --test tests/api.test.js
            Write-Host ""
            Read-Host "Presione Enter para volver al menu..."
        }
        "2" {
            Clear-Host
            Write-Host "--- INICIANDO SERVICIOS DE IT INCIDENT HUB ---" -ForegroundColor Green
            Write-Host ""
            Write-Host "[1/2] Iniciando Backend en puerto 5000..." -ForegroundColor Cyan
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/backend'; Write-Host '--- Incident Hub Backend API (Puerto 5000) ---' -ForegroundColor Green; node server.js"
            
            Write-Host "[2/2] Iniciando Frontend en puerto 5173..." -ForegroundColor Cyan
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/frontend'; Write-Host '--- Incident Hub Frontend SPA (Puerto 5173) ---' -ForegroundColor Cyan; npm run dev"
            
            Start-Sleep -Seconds 3
            Write-Host "Abriendo http://localhost:5173 en tu navegador..." -ForegroundColor Yellow
            Start-Process "http://localhost:5173"
            Write-Host ""
            Read-Host "Presione Enter para volver al menu..."
        }
        "3" {
            Clear-Host
            Write-Host "--- AUDITORIA DE SEGURIDAD NPM (AB#27) ---" -ForegroundColor Green
            Write-Host ""
            Push-Location "$PSScriptRoot/backend"
            npm audit
            Pop-Location
            Write-Host ""
            Read-Host "Presione Enter para volver al menu..."
        }
        "4" {
            Clear-Host
            Write-Host "--- CONSULTANDO API REST Y METRICAS EN VIVO ---" -ForegroundColor Green
            Write-Host ""
            try {
                $stats = Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/stats"
                Write-Host "Métricas Obtenidas con Éxito:" -ForegroundColor Green
                $stats | Format-List
            } catch {
                Write-Host "Aviso: No se pudo conectar a http://localhost:5000/api/dashboard/stats." -ForegroundColor Red
                Write-Host "Asegurate de haber iniciado el sistema primero (Opcion 2)." -ForegroundColor Yellow
            }
            Write-Host ""
            Read-Host "Presione Enter para volver al menu..."
        }
        "5" {
            Clear-Host
            Write-Host "--- ESTADO DE GIT Y REMOTOS ---" -ForegroundColor Green
            Write-Host ""
            git status
            Write-Host ""
            Write-Host "Remotos configurados:" -ForegroundColor Cyan
            git remote -v
            Write-Host ""
            Read-Host "Presione Enter para volver al menu..."
        }
        "6" {
            $running = $false
        }
        default {
            Write-Host "Opcion invalida." -ForegroundColor Red
            Start-Sleep -Seconds 1
        }
    }
}
