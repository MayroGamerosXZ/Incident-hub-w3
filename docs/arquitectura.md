# 🏛️ Documento de Arquitectura de Software
**Proyecto:** IT Incident Hub  
**Versión:** 1.0.0 (Release de Producción)  
**Autor Principal / DevOps Lead:** Mayro Geovanni Barrios Gameros (`@MayroGamerosXZ`)  
**Trazabilidad:** AB#4 a AB#34  

---

## 1. Visión General del Sistema y Topología

**IT Incident Hub** es una plataforma centralizada de ingeniería de confiabilidad y soporte diseñada para sustituir reportes dispersos de incidentes de TI por una solución web trazable, con observabilidad completa y preparada para Integración y Entrega Continua (CI/CD).

```
+-----------------------------------------------------------------------+
|                         CAPA DE PRESENTACIÓN                          |
|                 React 18 SPA + Vite (Puerto 5173 / 80)                |
|    - Vistas reactivas, matriz de incidentes y filtros multicriterio    |
|    - Panel de Telemetría KPI y Consola Enclave de Operador            |
|    - Selector de roles RBAC (Administrador / Operador de Enclave)     |
+-----------------------------------+-----------------------------------+
                                    |
                                    | Peticiones HTTP / JSON REST
                                    v
+-----------------------------------------------------------------------+
|                          CAPA DE APLICACIÓN                           |
|                Node.js + Express REST API (Puerto 5000)               |
|    - Controladores de incidentes, bitácora y auditoría                |
|    - Máquina de estados finita (Workflow Service AB#15)               |
|    - Middleware de sanitización XSS (DT-1) y errores seguros (DT-2)   |
|    - Servicios de notificación asíncrona: Gmail TLS + Azure DevOps    |
+-----------------------------------+-----------------------------------+
                                    |
                                    | Driver pg (Pool TCP)
                                    v
+-----------------------------------------------------------------------+
|                          CAPA DE PERSISTENCIA                         |
|                      PostgreSQL 16 (Puerto 5432)                      |
|                                    +                                  |
|         Resilient In-Memory Storage Engine (Fallback ADR-004)         |
|    - Tablas: users, incidents, incident_logs, incident_comments      |
+-----------------------------------------------------------------------+
```

---

## 2. Modelo Relacional de Datos (PostgreSQL DDL)

El esquema de base de datos relacional asegura la integridad referencial y auditoría histórica completa de las incidencias:

1. **`users`**: Catálogo de operadores técnicos y administradores con roles y correos.
2. **`incidents`**: Registro principal de la incidencia con los 7 campos obligatorios:
   - `title`: Título representativo del incidente.
   - `description`: Descripción detallada del impacto.
   - `category`: Categoría clasificada (`HARDWARE`, `SOFTWARE`, `NETWORK`, `SECURITY`, `ACCESS`).
   - `priority`: Nivel de criticidad (`BAJA`, `MEDIA`, `ALTA`, `CRITICA`).
   - `status`: Estado actual del ciclo de vida (`NUEVO`, `ASIGNADO`, `EN_PROCESO`, `RESUELTO`, `CERRADO`).
   - `reported_by`: Solicitante / correo de origen.
   - `created_at` / `updated_at`: Marcas de tiempo de auditoría.
   - `assigned_to_id`: Llave foránea hacia `users(id)`.
3. **`incident_logs`**: Bitácora inmutable de auditoría que registra cada cambio de estado, operador responsable, motivo de la transición y fecha exacta.
4. **`incident_comments`**: Historial de comentarios técnicos y notas de seguimiento por incidente.

---

## 3. Máquina de Estados Finita (Workflow de Incidentes AB#15)

El sistema garantiza que ninguna incidencia omita los controles de operación mediante una máquina de estados estricta implementada en `backend/src/services/workflowService.js`:

```
 [ NUEVO ] ───────────────> [ ASIGNADO ]
    │                            │
    │                            v
    └──────────────────────> [ EN_PROCESO ]
                                 │
                                 v
                             [ RESUELTO ]
                                 │
                                 v
                             [ CERRADO ]
```

* **Transiciones Válidas:**
  * `NUEVO` ➔ `ASIGNADO`, `EN_PROCESO`
  * `ASIGNADO` ➔ `EN_PROCESO`, `RESUELTO`
  * `EN_PROCESO` ➔ `RESUELTO`
  * `RESUELTO` ➔ `CERRADO`, `EN_PROCESO` (Reapertura controlada)
  * `CERRADO` ➔ Estado terminal; no permite transiciones salientes.

---

## 4. Registro de Decisiones de Arquitectura (ADR)

### ADR-001: Desacoplamiento Completo Frontend - Backend
* **Contexto:** Se requiere un sistema escalable que permita ciclos de integración continua independientes.
* **Decisión:** Separar la interfaz de usuario en una Single Page Application (React 18 con Vite) y el backend en una API RESTful stateless con Node.js y Express.
* **Consecuencias:** Permite compilar el frontend hacia un paquete estático optimizado (`dist/`) y desplegar la API en contenedores Docker o servidores de aplicación de forma desacoplada.

### ADR-002: Simulación de Identidad Operativa Local (RBAC Enclave)
* **Contexto:** Durante las evaluaciones y auditorías se necesita validar la experiencia tanto del Administrador como de Técnicos asignados a áreas especializadas sin depender de un proveedor de identidad de terceros inestable.
* **Decisión:** Implementar un selector de enclave operativo de sesión local que segmenta la interfaz y las capacidades de acción según el rol del usuario activo (`ADMIN` vs `TECHNICIAN`), precargando credenciales preconfiguradas y permitiendo el cambio transparente de operador.

### ADR-003: Alertas Multicanal Asíncronas (SMTP TLS Gmail + Webhook Azure DevOps)
* **Contexto:** Se debe sustituir la dispersión de reportes por un canal trazable inmediato que alerte al responsable ante incidentes críticos y cambios de estado.
* **Decisión:** Implementar envío de notificaciones automáticas vía Nodemailer con transporte seguro TLS hacia `mbarriosg8@miumg.edu.gt` de forma asíncrona para no bloquear las respuestas HTTP de la API REST.

### ADR-004: Motor de Persistencia Dual Resiliente (PostgreSQL 16 + Resilient In-Memory Fallback)
* **Contexto:** La rúbrica exige conexión con base de datos relacional PostgreSQL. No obstante, en entornos de CI (como agentes autohospedados efímeros, pipelines en nube o máquinas de demostración sin el servicio `postgresql` activo), la aplicación debe mantenerse 100% operativa sin colapsar ni interrumpir los tests unitarios.
* **Decisión:** Desarrollar en `backend/src/db.js` un adaptador dual. Al iniciar la aplicación:
  1. Intenta conectarse al puerto 5432 de PostgreSQL (`incident_hub_db`) y crear el esquema DDL automático si las tablas no existen.
  2. Si el servicio PostgreSQL no responde en el timeout establecido, el sistema conmuta automáticamente al motor resiliente en memoria documentado, reportando el modo activo en el endpoint `/api/health` (`engine: "PostgreSQL 16"` o `"In-Memory Resilient Store (ADR-004 Fallback)"`).
* **Consecuencias:** Máxima tolerancia a fallos, cero bloqueos en pruebas unitarias en pipelines de CI y total cumplimiento de la rúbrica de arquitectura y persistencia de datos.

---

## 5. Endpoints REST de la API

| Método | Endpoint | Descripción | Parámetros / Body |
|---|---|---|---|
| `GET` | `/api/health` | Estado del servicio y de la conexión a base de datos | Retorna `status: UP` y objeto `database` |
| `GET` | `/api/users` | Lista de operadores y técnicos disponibles | Ninguno |
| `GET` | `/api/incidents` | Consulta de incidentes con filtros multicriterio | `?status=&priority=&category=&assigned_to_id=` |
| `GET` | `/api/incidents/:id` | Detalle del incidente con bitácora y comentarios | `:id` del incidente |
| `POST` | `/api/incidents` | Registro de nuevo incidente con disparo de alerta | `title, description, category, priority, reported_by` |
| `PATCH` | `/api/incidents/:id/status` | Transición de estado auditada con validación | `status, changed_by, change_reason, assigned_to_id` |
| `POST` | `/api/incidents/:id/comments`| Adición de comentario o bitácora de seguimiento | `author_name, comment` |
| `GET` | `/api/analytics/kpis` | Métricas de dashboard (abiertos, cerrados, críticos, distribución) | Ninguno |
| `POST` | `/api/devops/simulate-failure` | Disparo controlado de fallo en Azure Pipelines | `targetBranch, failureType` |
| `POST` | `/api/devops/trigger-verification`| Disparo de pipeline de verificación y solución | Ninguno |
