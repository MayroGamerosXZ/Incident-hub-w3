# 📸 Guía Oficial y Catálogo Exhaustivo de Capturas de Pantalla
**Proyecto:** IT Incident Hub (DevOps Integrador)  
**Versión de Producción:** v1.0.0  
**Líder / DevOps Lead:** Mayro Geovanni Barrios Gameros (`@MayroGamerosXZ`)  
**Trazabilidad:** AB#4 a AB#34  

Esta guía contiene el inventario completo y categorizado de las **30 capturas de pantalla** requeridas para la documentación final, el informe técnico de 20+ páginas y la defensa oral ante el comité evaluador. Cada elemento especifica: ubicación exacta, qué debe apreciarse en pantalla y el criterio de la rúbrica que respalda.

---

## 📋 MÓDULO 1: Planificación Ágil y Gestión en Azure Boards

### 📸 Captura 1.1: Tablero de Epics con Features Hijas (Vista Boards)
* **Ubicación:** `Boards` ➔ `Boards` ➔ Desplegable superior derecho en **`Epics`**.
* **Qué debe verse:**
  * Columna **Closed** con los 2 Epics obligatorios:
    * `👑 4 Gestion Integral del Ciclo de Vida de Incidentes (Core)`
    * `👑 20 Plataforma DevOps, Calidad y Entrega Continua`
  * Ambos asignados a `2311428 - MAYRO GEOVANNI BARRIOS...` y con el distintivo de features hijas completadas: **`🏆 2/2`** en cada tarjeta.
* **Criterio de Rúbrica:** 2 Epics completados y vinculados a 4 Features obligatorias.

### 📸 Captura 1.2: Vista de Backlog Jerárquico en Árbol
* **Ubicación:** `Boards` ➔ `Backlogs` ➔ Nivel `Epics` (con filtro *Completed Items* activado).
* **Qué debe verse:** El árbol jerárquico desplegado mostrando cómo el Epic 4 y el Epic 20 se ramifican hacia sus Features, User Stories (libro azul) y Tasks (bloc amarillo).
* **Criterio de Rúbrica:** Estructura jerárquica ágil completa de 2 Epics, 4 Features, 8 US y 16 Tasks.

### 📸 Captura 1.3: Inventario Completo de 30 Work Items (0 Unassigned)
* **Ubicación:** `Boards` ➔ `Work items` (filtro *All Work Items* o *My activity*).
* **Qué debe verse:** Lista con los 30 elementos (`AB#4` a `AB#34`). Todos en estado **Closed**, con **Story Points** y **100% asignados** a Mayro Gameros (0 elementos en `Unassigned`).
* **Criterio de Rúbrica:** Mínimos de Azure Boards alcanzados con responsable, prioridad, estimación y estado asignados.

### 📸 Captura 1.4: Detalle de una User Story Representativa
* **Ubicación:** Clic sobre la User Story `AB#6` o `AB#14`.
* **Qué debe verse:** Título formal, descripción con criterios de aceptación, Story Points (`5`), prioridad (`1`), estado `Closed` y sus Tasks técnicas hijas vinculadas (`3/3`).
* **Criterio de Rúbrica:** Estimación y trazabilidad en historias de usuario.

### 📸 Captura 1.5: Detalle de una Task Técnica con Estimación de Esfuerzo
* **Ubicación:** Clic sobre la Task `AB#23`, `AB#27` o `AB#31`.
* **Qué debe verse:** Asignación a Mayro Gameros, campos *Original Estimate* / *Remaining Work* llenos y el tag técnico correspondiente (`DevOps Lead`, `SecOps Lead`).
* **Criterio de Rúbrica:** Cumplimiento de estimaciones y gobernanza de tareas.

---

## 🌿 MÓDULO 2: Repositorios Git, Estrategia de Ramas y Trazabilidad

### 📸 Captura 2.1: Estructura de Ramas en GitHub (`feature/*`, `fix/*`, `refactor/*`)
* **Ubicación:** `https://github.com/MayroGamerosXZ/Incident-hub-w3/branches/all` o en `Incident-hub-w2`.
* **Qué debe verse:** Las 14 ramas ordenadas respetando la nomenclatura formal: `feature/incident-crud`, `feature/incident-filters`, `refactor/xss-sanitization`, `fix/controlled-pipeline-failure`, etc.
* **Criterio de Rúbrica:** Nomenclatura ordenada de GitFlow y estabilidad de `main`.

### 📸 Captura 2.2: Grafo de Commits con Trazabilidad `AB#ID`
* **Ubicación:** Terminal local ejecutando:  
  `git log --oneline --graph --decorate -n 12`
* **Qué debe verse:** El historial de commits mostrando los mensajes vinculados a los Work Items: `... AB#8`, `... AB#15`, `... AB#23`, `... AB#34`.
* **Criterio de Rúbrica:** Trazabilidad estricta de código vinculada a Azure Boards.

### 📸 Captura 2.3: Configuración Limpia de Remotos Git (Cero Secretos)
* **Ubicación:** Terminal local ejecutando:  
  `git remote -v`
* **Qué debe verse:** Las URLs de `origin`, `w2`, `w3` y `azdo` limpias en HTTPS, **sin ningún token PAT visible** en texto plano.
* **Criterio de Rúbrica:** Cero secretos en repositorios o comandos locales (Regla 9).

---

## 🔀 MÓDULO 3: Pull Requests, Code Review y Deuda Técnica

### 📸 Captura 3.1: Lista de Pull Requests de Semana 1 (`Incident-hub-w1`)
* **Ubicación:** `https://github.com/MayroGamerosXZ/Incident-hub-w1/pulls?q=is%3Apr+is%3Aclosed`
* **Qué debe verse:** Los **7 Pull Requests cerrados y fusionados** (`PR #1` a `PR #7`), cada uno asociado a su rama `feature/*` y tag `AB#ID`.
* **Criterio de Rúbrica:** Mínimo de 6 PRs reales con descripciones y validación antes de integrar a `main`.

### 📸 Captura 3.2: Lista de Pull Requests de Semana 2 (`Incident-hub-w2`)
* **Ubicación:** `https://github.com/MayroGamerosXZ/Incident-hub-w2/pulls?q=is%3Apr+is%3Aclosed`
* **Qué debe verse:** Los **6 Pull Requests de Semana 2** cerrados y fusionados (`PR #1` a `PR #6`).
* **Criterio de Rúbrica:** Superación del mínimo de PRs con historial acumulado de 13 PRs reales.

### 📸 Captura 3.3: Detalle de Code Review en Pull Request
* **Ubicación:** Detalle de `PR #6` en W1 o `PR #1` en W2.
* **Qué debe verse:** La descripción formal del cambio, checklist de verificación y el comentario de revisión de código (*Code Review*) validado antes de autorizar el merge.
* **Criterio de Rúbrica:** Evidencia de revisión y validación previa a la integración.

### 📸 Captura 3.4: Resolución de Deuda Técnica DT-1 (Sanitización XSS)
* **Ubicación:** `PR #1` en `Incident-hub-w2` (rama `refactor/xss-sanitization-dt1`).
* **Qué debe verse:** Título *DT-1 Sanitización XSS AB#27*, archivo modificado `backend/src/middleware/sanitize.js` y test unitario asociado.
* **Criterio de Rúbrica:** Mínimo 5 deudas técnicas identificadas y resolución de al menos 2.

### 📸 Captura 3.5: Resolución de Deuda Técnica DT-2 (Manejo Global de Errores)
* **Ubicación:** `PR #2` en `Incident-hub-w2` (rama `refactor/error-handling-dt2`).
* **Qué debe verse:** Título *DT-2 Manejo de Errores Centralizado AB#27* y el middleware en `backend/src/middleware/errorHandler.js`.
* **Criterio de Rúbrica:** Segunda deuda técnica resuelta con trazabilidad completa.

---

## ⚙️ MÓDULO 4: Azure Pipelines (CI), Agente Self-Hosted y Fallo Controlado

### 📸 Captura 4.1: Pipeline Principal Exitoso en Azure Pipelines
* **Ubicación:** `https://dev.azure.com/DevOps-UMG-Mayro/incident-hub/_build/results?buildId=12` (o build reciente).
* **Qué debe verse:** Ejecución en estado **`Succeeded` ✅**, a nombre de Mayro Gameros, completando las 8 fases del pipeline en `azure-pipelines.yml`.
* **Criterio de Rúbrica:** Pipeline completo en Azure Pipelines con todas las fases requeridas.

### 📸 Captura 4.2: Compilación Real de Frontend React con Vite en el Pipeline
* **Ubicación:** Log expandido del paso *6. Compilación y Build de Frontend React (Vite)* en Azure Pipelines.
* **Qué debe verse:** Salida de `npm run build` ejecutando Vite, transformando los módulos y generando `dist/index.html` y bundles CSS/JS.
* **Criterio de Rúbrica:** Compilación real de frontend sin pasos simulados.

### 📸 Captura 4.3: Registro y Estado Activo del Self-Hosted Agent
* **Ubicación:** `Project Settings` ➔ `Agent pools` ➔ `Default` ➔ Pestaña `Agents`.
* **Qué debe verse:** El agente **`mayro-local-agent`** con versión `4.274.1` en estado **Online** y habilitado en la máquina de Mayro.
* **Criterio de Rúbrica:** Configuración y uso obligatorio de al menos un agente autohospedado local.

### 📸 Captura 4.4: Variable Group de Secretos Protegidos (Regla 9)
* **Ubicación:** `Pipelines` ➔ `Library` ➔ `Variable groups` ➔ `incident-hub-secrets`.
* **Qué debe verse:** Variables `DB_PASSWORD`, `DB_HOST`, `DB_NAME` y tokens bajo el candado cerrado 🔒 (`Keep this value secret`).
* **Criterio de Rúbrica:** Protección de secretos y claves sin exposición en repositorio.

### 📸 Captura 4.5: Publicación de Artefactos de Release (`incident-hub-drop`)
* **Ubicación:** Enlace `1 published` del Build exitoso en Azure Pipelines.
* **Qué debe verse:** Artefacto **`incident-hub-drop`** empaquetado conteniendo backend, `frontend/dist`, base de datos y documentación.
* **Criterio de Rúbrica:** Empaquetado y publicación obligatoria de artefacto listo para entrega continua.

### 📸 Captura 4.6: Fallo Controlado de CI en ROJO ❌
* **Ubicación:** Run de build fallido en Azure Pipelines (o en GitHub Actions del PR #4).
* **Qué debe verse:** El pipeline en estado **`Failed` ❌** detenido en el paso de ejecución de pruebas unitarias.
* **Criterio de Rúbrica:** Demostración de al menos 1 pipeline fallido controlado.

### 📸 Captura 4.7: Diagnóstico de Causa Raíz del Fallo Controlado
* **Ubicación:** Log detallado del paso fallido en Azure Pipelines.
* **Qué debe verse:** El error exacto: `ERR_ASSERTION: stats.criticos 1 !== -1` en `tests/api.test.js:80`.
* **Criterio de Rúbrica:** Diagnóstico técnico documentado de la causa de falla.

### 📸 Captura 4.8: Resolución del Fallo y Pipeline Restaurado a VERDE ✅
* **Ubicación:** Run posterior (PR #5 o Build siguiente) en Azure Pipelines.
* **Qué debe verse:** Ejecución en **`Succeeded` ✅** certificando la solución del fallo y la restauración de la calidad.
* **Criterio de Rúbrica:** Corrección verificable y ejecución exitosa posterior al fallo.

---

## 🤖 MÓDULO 5: GitHub Actions Workflow Complementario

### 📸 Captura 5.1: Workflow de Validación en GitHub Actions
* **Ubicación:** `https://github.com/MayroGamerosXZ/Incident-hub-w3/actions` (o en `w2`).
* **Qué debe verse:** Workflow `ci.yml` ejecutando validación en Pull Requests en estado verde (`CI Pull Request Validation`).
* **Criterio de Rúbrica:** 1 workflow complementario implementado en `.github/workflows/`.

---

## 🧪 MÓDULO 6: Pruebas Unitarias Automatizadas y Seguridad (SCA)

### 📸 Captura 6.1: Suite Completa de 8 Pruebas Unitarias en Consola
* **Ubicación:** Terminal local ejecutando:  
  `node --test tests/api.test.js`
* **Qué debe verse:** Las **8 pruebas pasando en verde (`pass 8, fail 0`)**:
  1. Estructura de 5 estados obligatorios.
  2. Creación de incidente con validación.
  3. Motor de 4 filtros dinámicos.
  4. Reglas de transición de estados.
  5. Cálculo de métricas de Dashboard (Fix AB#22).
  6. Sanitización XSS (DT-1).
  7. Servicio de notificaciones Gmail UMG y Azure DevOps.
* **Criterio de Rúbrica:** Pruebas automatizadas estables cubriendo la lógica de negocio.

### 📸 Captura 6.2: Auditoría de Seguridad de Dependencias (0 Vulnerabilidades)
* **Ubicación:** Terminal local ejecutando:  
  `npm --prefix backend audit`
* **Qué debe verse:** Mensaje exacto de npm: **`found 0 vulnerabilities`**.
* **Criterio de Rúbrica:** Revisión de dependencias y seguridad (SCA) con cero vulnerabilidades críticas o altas.

---

## 🗄️ MÓDULO 7: Base de Datos Relacional y Persistencia Dual (ADR-004)

### 📸 Captura 7.1: Script DDL y Tablas Relacionales en PostgreSQL
* **Ubicación:** Archivo `database/schema.sql` abierto o consulta en consola psql.
* **Qué debe verse:** Tablas `users`, `incidents`, `incident_logs` e `incident_comments` con llaves foráneas y tipos de datos.
* **Criterio de Rúbrica:** Persistencia de datos relacional PostgreSQL con esquema completo.

### 📸 Captura 7.2: Endpoint de Healthcheck con Estado de Base de Datos
* **Ubicación:** Navegador en `http://localhost:5000/api/health` o terminal curl.
* **Qué debe verse:** JSON con `status: "UP"`, `alert_recipient: "mbarriosg8@miumg.edu.gt"`, y objeto `database` indicando el motor activo.
* **Criterio de Rúbrica:** Persistencia verificada y documentada en ADR-004.

---

## 🖥️ MÓDULO 8: Interfaz Web React y Experiencia de Usuario (UI/UX)

### 📸 Captura 8.1: Panel de Inicio de Sesión RBAC
* **Ubicación:** `http://localhost:5173` al cargar.
* **Qué debe verse:** Tarjetas de acceso por rol (Mayro Gameros como Admin y técnicos especialistas), campos autocompletados y botón *Ingresar al Enclave*.
* **Criterio de Rúbrica:** Acceso estructurado y gobernanza de roles.

### 📸 Captura 8.2: Vista de Enclave Administrador con Acceso Global
* **Ubicación:** Interfaz principal con sesión de Mayro Gameros activa.
* **Qué debe verse:** Barra superior con badge dorado `[ADMIN ENCLAVE // SOVEREIGN OPERATOR]`, acceso a controles de simulación de fallo CI y gestión total.
* **Criterio de Rúbrica:** Alcance funcional completo de administración.

### 📸 Captura 8.3: Vista de Enclave Técnico Especialista con Segmentación
* **Ubicación:** Interfaz tras cambiar rol a Carlos Mendoza.
* **Qué debe verse:** Badge cian `[LOCALIZED OPERATOR CAPSULE // Redes]`, botones rápidos *Mis Asignados* y bloqueo seguro de controles de CI.
* **Criterio de Rúbrica:** Segmentación operativa según rol de usuario.

### 📸 Captura 8.4: Formulario de Registro de Nuevo Incidente
* **Ubicación:** Modal `➕ New Incident` abierto en la interfaz.
* **Qué debe verse:** Formulario con los campos obligatorios: título, descripción, selector de categoría, prioridad y correo solicitante.
* **Criterio de Rúbrica:** Creación de incidentes con validación de entradas.

### 📸 Captura 8.5: Matriz de Incidentes con los 7 Campos Observables
* **Ubicación:** Tabla `#incidents-table` en la interfaz.
* **Qué debe verse:** Columnas claramente observables:
  1. `ID`
  2. `Título del Incidente`
  3. `Categoría`
  4. `Prioridad`
  5. `Estado`
  6. **`Solicitante`** (`reported_by`)
  7. **`Fecha`** (`created_at`)
  8. `Operador Asignado`
  9. `Acción`
* **Criterio de Rúbrica:** **7 campos observables obligatorios en pantalla.**

### 📸 Captura 8.6: Modal de Inspección y Transición de Estados
* **Ubicación:** Modal abierto tras pulsar `Inspect Node →`.
* **Qué debe verse:** Fichas de Solicitante, Fecha de Registro y Estado actual; panel de transición con selector de los 5 estados y bitácora de auditoría inmutable.
* **Criterio de Rúbrica:** Flujo de los 5 estados obligatorios y seguimiento por bitácora.

### 📸 Captura 8.7: Bloqueo de Transición Ilegal (400 Bad Request)
* **Ubicación:** Intento de pasar de `CERRADO` a `NUEVO` en la interfaz / consola F12.
* **Qué debe verse:** Mensaje de error: *"Transición de estado no permitida: no es posible pasar de CERRADO a NUEVO"*.
* **Criterio de Rúbrica:** Cumplimiento de reglas de transición de la máquina de estados.

### 📸 Captura 8.8: Filtros Multicriterio Dinámicos
* **Ubicación:** Barra de filtros con criterios seleccionados (ej. `EN_PROCESO`, `CRITICA`, `NETWORK`).
* **Qué debe verse:** Tabla filtrada reactivamente en tiempo real y contador de registros actualizado.
* **Criterio de Rúbrica:** Filtros funcionales por los 4 criterios obligatorios.

### 📸 Captura 8.9: Dashboard y Telemetría con 3 Gráficos SVG
* **Ubicación:** Sección de analítica y telemetría en la interfaz.
* **Qué debe verse:** Tarjetas de incidentes abiertos, cerrados, críticos y SLA; Dona SVG de ciclo de vida, barras de categoría y carga por técnico.
* **Criterio de Rúbrica:** Dashboard con abiertos, cerrados, críticos y distribución por categoría/técnico.

### 📸 Captura 8.10: Monitor de Azure DevOps y CI/CD en Vivo
* **Ubicación:** Panel de integración continua en la interfaz web.
* **Qué debe verse:** Estado de build, rama activa, commit actual, estado de agente local y artefacto de release.
* **Criterio de Rúbrica:** Observabilidad integral de DevOps en la aplicación.

---

## 📧 MÓDULO 9: Notificaciones Automáticas y Alertas Gmail UMG

### 📸 Captura 9.1: Correo de Alerta de Incidente Crítico
* **Ubicación:** Bandeja de entrada de `mbarriosg8@miumg.edu.gt`.
* **Qué debe verse:** Correo con asunto `🚨 [ALERTA DE INCIDENTE CRÍTICO]`, tarjeta HTML con detalles del ticket y prioridad roja.
* **Criterio de Rúbrica:** Observabilidad y notificaciones por correo electrónico institucional.

### 📸 Captura 9.2: Correo de Cambio de Estado Auditado
* **Ubicación:** Bandeja de entrada de `mbarriosg8@miumg.edu.gt`.
* **Qué debe verse:** Correo con asunto `📋 [CAMBIO DE ESTADO: ASIGNADO]` notificando al responsable.
* **Criterio de Rúbrica:** Trazabilidad de notificaciones en el ciclo de vida del incidente.

### 📸 Captura 9.3: Correo de Alerta de Fallo en Pipeline CI (ROJO ❌)
* **Ubicación:** Bandeja de entrada de `mbarriosg8@miumg.edu.gt`.
* **Qué debe verse:** Correo de alerta roja `🚨 [FALLO EN PIPELINE ❌] Build #13 FAILED`.
* **Criterio de Rúbrica:** Evidencia de alerta inmediata ante fallos de CI.

### 📸 Captura 9.4: Correo de Pipeline Restaurado (VERDE ✅)
* **Ubicación:** Bandeja de entrada de `mbarriosg8@miumg.edu.gt`.
* **Qué debe verse:** Correo de confirmación verde `✅ [SOLUCIÓN APLICADA] Build #14 SUCCEEDED`.
* **Criterio de Rúbrica:** Notificación de cierre de ciclo de recuperación.

---

## 🏷️ MÓDULO 10: Versionado Semántico y Release de Producción (Semana 3)

### 📸 Captura 10.1: Etiquetas SemVer en GitHub (`v0.1.0` ➔ `v0.2.0` ➔ `v1.0.0`)
* **Ubicación:** `https://github.com/MayroGamerosXZ/Incident-hub-w3/tags`
* **Qué debe verse:** Las 3 etiquetas anotadas demostrando la progresión incremental del software en las 3 semanas.
* **Criterio de Rúbrica:** Versionado semántico coherente hasta `v1.0.0`.

### 📸 Captura 10.2: Release Oficial de Producción en GitHub
* **Ubicación:** `https://github.com/MayroGamerosXZ/Incident-hub-w3/releases/tag/v1.0.0`
* **Qué debe verse:** Release `v1.0.0 - Production Ready` con Release Notes completas, artefacto `incident-hub-drop.zip` y código fuente.
* **Criterio de Rúbrica:** Versión lista para liberar con artefactos y documentación de entrega.

### 📸 Captura 10.3: Repositorio Azure Repos Sincronizado
* **Ubicación:** `https://dev.azure.com/DevOps-UMG-Mayro/incident-hub/_git/incident-hub`
* **Qué debe verse:** Rama `main` al día con el commit `AB#34`, historial sincronizado con GitHub y cero secretos.
* **Criterio de Rúbrica:** Sincronización entre Azure Repos y GitHub.
