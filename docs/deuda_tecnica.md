# 💳 Registro, Auditoría de Vulnerabilidades y Resolución de Deuda Técnica (Technical Debt & Hardening Log)

En cumplimiento de la condición obligatoria de DevOps (*"identificar al menos 5 deudas reales y resolver al menos 2 mediante trabajo trazable"*) y de la **Auditoría Técnica de Producción Empresarial (OWASP Top 10)**, se documenta el inventario completo de deudas técnicas y vulnerabilidades mitigadas en el código fuente:

| # | Deuda Técnica / Vulnerabilidad Identificada | Severidad | Categoría | Estado Actual | Evidencia Trazable en Código y Pruebas |
|---|---|---|---|---|---|
| **DT-1** | Sanitización contra Stored/Reflected XSS (`escapeHtml` en plantillas SMTP y sandbox en vista previa UI) y cabeceras HTTP (`CSP`, `X-Frame-Options`) | `[CRÍTICO]` | Seguridad (OWASP A03) | ✅ **RESUELTA Y CONECTADA** | `backend/src/middleware/securityMiddleware.js`, `emailService.js`, `DevOpsMonitor.jsx` (`AB#27`) |
| **DT-2** | Manejador centralizado de errores HTTP (`AppError`, `asyncHandler`, `errorHandlerMiddleware`) conectado al pipeline Express | `[ALTO]` | Arquitectura / Resiliencia | ✅ **RESUELTA Y CONECTADA** | `backend/src/middleware/errorHandler.js`, `backend/server.js` (`AB#15`, `AB#21`) |
| **DT-3** | Índices compuestos multicolumna (`idx_incidents_multicriteria`) y persistencia híbrida SQL parametrizada + fallback en memoria | `[ALTO]` | Rendimiento / Base de Datos | ✅ **RESUELTA Y CONECTADA** | `database/schema.sql`, `backend/src/db.js` (`AB#11`, `AB#18`, `ADR-004`) |
| **DT-4** | Rate Limiting por IP (`createRateLimiter`), autenticación firmada HMAC-SHA256 y RBAC real en backend (`requireAdminRole`) | `[CRÍTICO]` | Seguridad (OWASP A01/A07) | ✅ **RESUELTA Y CONECTADA** | `backend/src/middleware/securityMiddleware.js`, `backend/server.js` (`AB#27`) |
| **DT-5** | Pruebas de integración HTTP real sobre Express (`invokeApp`) verificando RBAC, no exposición de `accessCode` y máquina de estados estricta | `[ALTO]` | Calidad / Testing | ✅ **RESUELTA Y CONECTADA** | `tests/api.test.js` (Subtest 8) (`AB#24`) |

---

## 🛠️ Detalle Técnico de las Deudas y Vulnerabilidades Resueltas

### 1. Resolución de DT-1 y Vulnerabilidad `[CRÍTICO]` C2 (Stored XSS en Plantillas HTML y Previsualización)
* **Por qué era un riesgo:** Aunque existía `securityMiddleware.js`, no estaba conectado a `backend/server.js` y el servicio `emailService.js` interpolaba `incident.title` y `incident.description` directamente en HTML (`${incident.title}`), mientras `DevOpsMonitor.jsx` renderizaba `html_preview` con `dangerouslySetInnerHTML`.
* **Cómo se solucionó:**
  1. Se conectó `securityHeadersMiddleware` y `sanitizePayload` globalmente en `backend/server.js`.
  2. Se implementó `escapeHtml()` en `securityMiddleware.js` y se aplicó a todos los campos dinámicos en `buildEmailHtml` y `buildPipelineEmailHtml` (`emailService.js`), además de neutralizar saltos CRLF en cabeceras SMTP.
  3. En `frontend/src/components/DevOpsMonitor.jsx`, se reemplazó `dangerouslySetInnerHTML` por un contenedor aislado `<iframe sandbox="" srcDoc={selectedEmail.html_preview} />`.

### 2. Resolución de DT-2 y Vulnerabilidad `[ALTO]` A3 (Middleware de Errores y Validadores Desconectados)
* **Por qué era un riesgo:** Los módulos `errorHandler.js`, `incidentValidator.js` y `workflowService.js` eran testeados de forma aislada pero `server.js` reescribía validaciones inline incompletas que lanzaban `TypeError` no capturados si `category` o `title` no eran strings.
* **Cómo se solucionó:**
  1. Se conectaron `validateCreateIncident`, `validateStatusUpdate`, `filterIncidentsList`, `computeDashboardMetrics`, `asyncHandler` y `errorHandlerMiddleware` directamente en `backend/server.js`.
  2. Se blindó `incidentValidator.js` verificando `typeof === 'string'`, rangos de longitud, catálogos permitidos y formato de correo electrónico.

### 3. Resolución de DT-3 y Vulnerabilidad `[ALTO]` A1/A4 (Máquina de Estados Finita Estricta y Persistencia Dual SQL)
* **Por qué era un riesgo:** `canTransitionStatus` sólo bloqueaba `CERRADO -> NUEVO`, permitiendo saltos ilegales como `NUEVO -> CERRADO` o `CERRADO -> EN_PROCESO`. Además, `db.js` sólo ejecutaba `SELECT NOW()` sin persistir cambios en PostgreSQL.
* **Cómo se solucionó:**
  1. Se definió el grafo explícito `ALLOWED_TRANSITIONS` en `workflowService.js`, haciendo que `CERRADO` sea un estado terminal inmutable (`CERRADO: []`) y prohibiendo saltos directos de `NUEVO` a `CERRADO`.
  2. Se implementaron consultas SQL parametrizadas (`$1, $2...`) con transacciones `BEGIN / COMMIT / ROLLBACK` en `backend/src/db.js` y fallback automático en memoria (`ADR-004`).

### 4. Resolución de DT-4 y Vulnerabilidad `[CRÍTICO]` C1/C3 (RBAC Real, Tokens HMAC-SHA256 y Cero Secretos)
* **Por qué era un riesgo:** `GET /api/users` exponía `accessCode` en texto plano, `/api/auth/login` permitía acceso sin contraseña enviando `{ userId: 1 }` o un código comodín, y los endpoints administrativos carecían de validación de rol en el servidor.
* **Cómo se solucionó:**
  1. Se creó `toPublicUser()` para filtrar `accessCode` en todas las respuestas HTTP.
  2. Se implementó firma y verificación de tokens `HMAC-SHA256` con `crypto.timingSafeEqual` en `securityMiddleware.js`, junto al middleware `requireAdminRole` (403 Forbidden para no administradores) y `createRateLimiter`.
  3. Se eliminaron contraseñas por defecto en `db.js` y `docker-compose.yml`, y se redactó cualquier token de ejemplo en guías HTML.
