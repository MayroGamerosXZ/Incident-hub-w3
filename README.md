# 🛡️ IT Incident Hub - Release Oficial v1.0.0 (Semana 3)

[![CI Pull Request Validation](https://github.com/MayroGamerosXZ/Incident-hub-w3/actions/workflows/ci.yml/badge.svg)](https://github.com/MayroGamerosXZ/Incident-hub-w3/actions)
[![Azure Pipelines](https://dev.azure.com/DevOps-UMG-Mayro/incident-hub/_apis/build/status/2?branchName=main)](https://dev.azure.com/DevOps-UMG-Mayro/incident-hub/_build/results?buildId=12)
[![SemVer](https://img.shields.io/badge/SemVer-v1.0.0--production-blue.svg)](https://github.com/MayroGamerosXZ/Incident-hub-w3/releases/tag/v1.0.0)
[![Azure Boards](https://img.shields.io/badge/Azure%20Boards-AB%234%20a%20AB%2334%20(100%25%20Closed)-brightgreen.svg)](https://dev.azure.com/DevOps-UMG-Mayro/incident-hub/_boards)

> **Proyecto Integrador DevOps** | Entrega Final Consolidada (Semana 3 - Production Ready)  
> **Universidad:** UMG - Análisis de Sistemas II  
> **Organización Azure DevOps:** `DevOps-UMG-Mayro` | **Proyecto:** `incident-hub`  
> **Repositorio Oficial de Producción:** [MayroGamerosXZ/Incident-hub-w3](https://github.com/MayroGamerosXZ/Incident-hub-w3)

---

## 📂 Repositorios Oficiales del Ciclo de Vida (Semanas 1, 2 y 3)

| Semana | Hito DevOps | Repositorio Oficial en GitHub | Tag SemVer | Estado |
|---|---|---|---|---|
| **Semana 1** | Planificación, Arquitectura, Modelo PostgreSQL, CRUD y 7 PRs | [MayroGamerosXZ/Incident-hub-w1](https://github.com/MayroGamerosXZ/Incident-hub-w1) | `v0.1.0` | 🟢 Congelado |
| **Semana 2** | CI/CD Dual, Self-Hosted Agent, 2 Deudas Técnicas Resueltas y Fallo Controlado | [MayroGamerosXZ/Incident-hub-w2](https://github.com/MayroGamerosXZ/Incident-hub-w2) | `v0.2.0` | 🟢 Completado |
| **Semana 3** | **Release de Producción:** Estabilización, SemVer v1.0.0, Artefactos y Estrategia CD | [MayroGamerosXZ/Incident-hub-w3](https://github.com/MayroGamerosXZ/Incident-hub-w3) | `v1.0.0` | 🟢 En Producción |

---

## 👥 Equipo de Ingeniería y Roles Asignados (Regla 9)

Para garantizar el cumplimiento de las normas DevOps de trazabilidad y gobernanza de código (Regla 9), las responsabilidades se distribuyen formalmente entre 6 áreas técnicas:

| Rol / Área | Responsable Oficial | Git Author / Usuario | Responsabilidad Principal |
|---|---|---|---|
| **DevOps & Cloud Lead** | **Mayro Geovanni Barrios Gameros** (`@MayroGamerosXZ`) | `devops.lead@incidents.local` | Liderazgo del proyecto, Azure Pipelines, GitHub Actions, Docker, Self-Hosted Agent y Release Management. |
| **Backend Engineer** | Carlos Mendoza | `backend.dev@incidents.local` | API REST Node.js/Express, controladores, lógica de negocio y filtros multicriterio. |
| **Frontend UI/UX Dev** | Sofia Gomez | `frontend.dev@incidents.local` | Interfaz React 18 (Vite), componentes reactivos, modales y panel KPI. |
| **Database Architect** | Diego Ramirez | `database.admin@incidents.local` | Esquema relacional PostgreSQL, scripts DDL, triggers de auditoría y persistencia. |
| **QA & Test Specialist** | Laura Torres | `qa.tester@incidents.local` | Suite de pruebas unitarias/integración automatizadas y diagnóstico de fallo controlado. |
| **SecOps & Quality Auditor** | Andres Morales | `secops.audit@incidents.local` | Auditoría de dependencias (`npm audit`), deuda técnica (DT-1, DT-2) y SemVer. |

---

## 🏗️ Arquitectura de la Solución

* **Frontend:** React 18 SPA con Vite (compilación estática optimizada en `frontend/dist/`).
* **Backend:** Node.js con Express, arquitectura desacoplada por capas (rutas, controladores, middleware, servicios).
* **Persistencia:** PostgreSQL 16 con esquemas relacionales, triggers de auditoría temporal, vistas analíticas y motor dual resiliente documentado en ADR-004 (conmuta a almacenamiento en memoria cuando el servicio de base de datos no está disponible en agentes efímeros).
* **Integración y Entrega Continua Dual:**
  * **Azure Pipelines (`azure-pipelines.yml`):** Compilación y build real con Vite, verificación en **Self-Hosted Agent**, pruebas unitarias, escaneo SCA de dependencias y publicación del artefacto `incident-hub-drop`.
  * **GitHub Actions (`.github/workflows/ci.yml`):** Validación estática (linting) y escaneo de vulnerabilidades en cada Pull Request.
* **Seguridad y Secretos (Regla 9):** Variables protegidas bajo candado en **Azure Pipelines Library (`incident-hub-secrets`)** para credenciales de base de datos y tokens, garantizando cero secretos en código.

---

## 📂 Estructura Oficial del Repositorio

```text
incident-hub/
├── .github/
│   └── workflows/
│       └── ci.yml               # Workflow de validación para Pull Requests (GitHub Actions)
├── backend/                     # API REST Node.js + Express
│   ├── src/
│   │   ├── controllers/         # Controladores de lógica de incidentes y métricas
│   │   ├── middleware/          # Sanitización XSS (DT-1) y Manejador de Errores (DT-2)
│   │   ├── routes/              # Endpoints REST
│   │   ├── services/            # Servicios de flujo de estados y KPIs
│   │   └── db.js                # Pool de conexión PostgreSQL + Fallback ADR-004
│   ├── package.json
│   └── server.js
├── frontend/                    # Cliente Web React 18 + Vite
│   ├── src/
│   │   ├── components/          # IncidentFilters, DistributionPanel, etc.
│   │   ├── App.jsx              # Vista principal con KPIs y gestión de estados
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── database/                    # Scripts DDL y datos de prueba
│   ├── schema.sql               # Esquema DDL con tablas, vistas e índices
│   └── seed.sql                 # Datos de prueba iniciales
├── tests/                       # Pruebas automatizadas (Node Test Runner)
│   ├── api.test.js              # 8 pruebas unitarias e integración en verde
│   └── package.json
├── devops/                      # Configuración de contenedores y utilidades
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   ├── docker-compose.yml
│   └── switch-git-user.ps1
├── docs/                        # Documentación técnica obligatoria
│   ├── arquitectura.md          # Arquitectura de componentes, datos y ADR-001 a ADR-004
│   ├── branching.md             # Estrategia de ramas (GitFlow adaptado)
│   ├── deuda_tecnica.md         # Catálogo de 5 deudas técnicas y resolución de 2
│   ├── fallo_controlado.md      # Evidencia y análisis de causa raíz del fallo de CI
│   ├── guia_capturas.md         # Lista oficial de capturas para la documentación final
│   ├── release_strategy.md      # Estrategia de ambientes (Dev -> Staging -> Prod) y SemVer
│   └── seguridad.md             # Matriz de dependencias y política de cero secretos
├── azure-pipelines.yml          # Pipeline principal de Azure DevOps
├── .gitignore
└── README.md
```

---

## 🚀 Requisitos de Instalación y Ejecución Local

### Prerrequisitos
* Node.js v18+ y npm v9+
* PostgreSQL 14+ (o Docker Desktop; opcional gracias al fallback resiliente ADR-004)

### 0. Ejecución Unificada de Todo el Stack (Recomendado)
```bash
npm install
npm run dev
# Inicia concurrentemente Backend (puerto 5000) y Frontend Vite (puerto 5173)
```

### 1. Base de Datos (Opcional si se usa servicio local PostgreSQL)
```bash
psql -U postgres -d postgres -f database/schema.sql
psql -U postgres -d incident_hub_db -f database/seed.sql
```

### 2. Backend Individual
```bash
cd backend
npm install
npm run dev
# Servidor escuchando en http://localhost:5000
```

### 3. Frontend Individual
```bash
cd frontend
npm install
npm run dev
# Aplicación web disponible en http://localhost:5173
```

### 4. Pruebas Unitarias Automatizadas
```bash
node --test tests/api.test.js
# 8 pruebas pasando en verde (100% de éxito)
```

---

## 📌 Trazabilidad con Azure Boards
Cada commit, Pull Request y pipeline en este proyecto está estrictamente vinculado a un Work Item en Azure Boards mediante la sintaxis `AB#ID`.
Para consultar el tablero completo de trabajo, visite:  
👉 [Azure Boards - IT Incident Hub](https://dev.azure.com/DevOps-UMG-Mayro/incident-hub/_boards)
