# 📸 Guía Oficial de Capturas de Pantalla para la Documentación Final

Este documento detalla todas las capturas de pantalla requeridas para el informe final y la presentación del proyecto **IT Incident Hub**. Cada captura incluye su ubicación exacta, lo que debe apreciarse en pantalla y el criterio de la rúbrica que respalda.

---

## 📋 Módulo 1: Gestión Ágil y Planificación en Azure Boards

- [x] **Captura 1.1: Jerarquía Completa de Backlog en Azure Boards**  
  * **Ubicación:** `Boards` ➔ `Backlogs` o `https://dev.azure.com/DevOps-UMG-Mayro/incident-hub/_workitems`
  * **Qué muestra:** Lista de Work Items jerárquica con los 30 elementos (`AB#4` al `AB#34`), estructurada en **Epics**, **Features**, **User Stories** y **Tasks** bajo el proceso Agile oficial.
  * **Criterio de Rúbrica:** Cumplimiento de la estructura ágil obligatoria (mínimo 2 Epics, 4 Features, 8 User Stories y 16 Tasks con estimaciones y prioridades).

- [x] **Captura 1.2: Asignación de Roles y Trazabilidad (Regla 9)**  
  * **Ubicación:** Work Item `AB#23` o `AB#30` en Azure Boards.
  * **Qué muestra:** El usuario institucional de **Mayro Geovanni Barrios Gameros** (`2311428 / mbarriosg8@miumg.edu.gt`) asignado oficialmente como **DevOps & Cloud Lead**, demostrando que no todo el desarrollo se concentra en una sola persona ficticia y cumpliendo la regla de autoría verificable.
  * **Criterio de Rúbrica:** Cumplimiento de la **Regla 9** (contribuciones verificables del estudiante y división formal de responsabilidades técnicas).

---

## 🌿 Módulo 2: Repositorios Git y Pull Requests (Semana 1 y Semana 2)

- [x] **Captura 2.1: Pull Requests de Semana 1 (`Incident-hub-w1`)**  
  * **Ubicación:** `https://github.com/MayroGamerosXZ/Incident-hub-w1/pulls?q=is%3Apr+is%3Aclosed`
  * **Qué muestra:** Los **7 Pull Requests cerrados y fusionados** (`PR #1` a `PR #7`), cada uno con su rama técnica (`feature/*`) y el código `AB#ID` vinculado.
  * **Criterio de Rúbrica:** Mínimo de 6 PRs reales con descripciones, revisiones y fusiones trazables hacia Azure Boards.

- [x] **Captura 2.2: Detalle de Code Review Cruzado**  
  * **Ubicación:** `PR #6` en `w1` o `PR #3` en `w2`.
  * **Qué muestra:** La descripción detallada del cambio, la vinculación a Azure Boards y el comentario formal de revisión de código (*Code Review*) emitido por un par técnico previo a la aprobación y fusión a `main`.
  * **Criterio de Rúbrica:** Evidencia de validaciones y revisiones cruzadas de código (*Code Reviews*) antes de autorizar la integración a la rama principal.

- [x] **Captura 2.3: Pull Requests de Semana 2 y Resolución de Deuda Técnica**  
  * **Ubicación:** `https://github.com/MayroGamerosXZ/Incident-hub-w2/pulls?q=is%3Apr+is%3Aclosed`
  * **Qué muestra:** Los **6 Pull Requests de Semana 2**, destacando `PR #1` (Deuda Técnica DT-1: Sanitización XSS), `PR #2` (Deuda Técnica DT-2: Manejo uniforme de errores) y `PR #6` (Pipeline Self-Hosted por Mayro).
  * **Criterio de Rúbrica:** Identificación documentada de al menos 5 deudas técnicas y resolución verificable de al menos 2 mediante ramas `refactor/*` y PRs.

---

## 💥 Módulo 3: Integración Continua y Fallo Controlado (Dual CI)

- [x] **Captura 3.1: Secuencia de Fallo y Recuperación en GitHub Actions**  
  * **Ubicación:** `https://github.com/MayroGamerosXZ/Incident-hub-w2/actions`
  * **Qué muestra:** Los **Runs rojos ❌ (Failure)** del commit `8cd3c8d` (simulación de fallo de pruebas) seguidos inmediatamente de los **Runs verdes ✅ (Success)** del `PR #5` (`fix/controlled-pipeline-failure`).
  * **Criterio de Rúbrica:** Requisito obligatorio de **Fallo Controlado**: evidencia gráfica del pipeline bloqueando el paso ante un fallo real y su posterior corrección mediante el flujo del equipo.

- [x] **Captura 3.2: Correos Institucionales de Notificación de Alertas**  
  * **Ubicación:** Bandeja de Gmail institucional (`@miumg.edu.gt`).
  * **Qué muestra:** Correos automáticos de alerta recibidos ante fallos: `[MayroGamerosXZ/Incident-hub-w2] Run failed: CI Pull Request Validation` y `BUILD #20261013.1 FAILED` de Azure DevOps.
  * **Criterio de Rúbrica:** Observabilidad, monitoreo y notificaciones de eventos críticos de CI/CD hacia el líder del proyecto.

---

## ⚙️ Módulo 4: Azure Pipelines, Self-Hosted Agent y Secretos Protegidos

- [x] **Captura 4.1: Ejecución Exitosa de Azure Pipeline (Build #12)**  
  * **Ubicación:** `https://dev.azure.com/DevOps-UMG-Mayro/incident-hub/_build/results?buildId=12`
  * **Qué muestra:** Pipeline `IT-Incident-Hub-CI-CD` con resultado **`Succeeded` ✅**, ejecutado en 53 segundos a nombre de `Mayro...` completando los 8 pasos de construcción, auditoría y pruebas.
  * **Criterio de Rúbrica:** Pipeline automatizado de CI/CD dual en Azure Pipelines complementario a GitHub Actions.

- [x] **Captura 4.2: Publicación de Artefactos de Release (`incident-hub-drop`)**  
  * **Ubicación:** Dentro del Build #12 en Azure DevOps, clic en el enlace superior **`1 published`**.
  * **Qué muestra:** Directorio `drop` / `incident-hub-drop` empaquetado y disponible para despliegue con los módulos de frontend, backend, scripts SQL y documentación.
  * **Criterio de Rúbrica:** Generación y publicación de artefactos compilados como entregable de la canalización de CI (`AB#30`).

- [x] **Captura 4.3: Registro del Self-Hosted Agent Local (`mayro-local-agent`)**  
  * **Ubicación:** `https://dev.azure.com/DevOps-UMG-Mayro/incident-hub/_settings/agentpools?poolId=1&view=agents`
  * **Qué muestra:** En el pool `Default`, el agente **`mayro-local-agent`** con versión oficial de producción (`4.274.1`) en estado habilitado y activo.
  * **Criterio de Rúbrica:** Configuración y operación obligatoria de al menos un agente autoalojado local (*Self-Hosted Agent*) para procesamiento de pipelines.

- [x] **Captura 4.4: Variable Group con Secretos Protegidos (Regla 9)**  
  * **Ubicación:** `https://dev.azure.com/DevOps-UMG-Mayro/incident-hub/_library?itemType=VariableGroups` ➔ `incident-hub-secrets`.
  * **Qué muestra:** Grupo de variables centralizado con `DB_PASSWORD` y `API_AUTH_TOKEN` protegidas bajo candado cerrado 🔒 (`isSecret = true`).
  * **Criterio de Rúbrica:** Cumplimiento de la **Regla 9** (cero secretos reales en código o commits; inyección segura y enmascaramiento en logs).

---

## 🧪 Módulo 5: Pruebas Unitarias Automatizadas en Consola

- [x] **Captura 5.1: Ejecución de la Suite de Pruebas Unitarias**  
  * **Comando:** `node --test tests/api.test.js` (desde la raíz del proyecto).
  * **Qué muestra:** Las **7 pruebas pasando en verde (`pass 7, fail 0`)** en menos de 200 ms:
    * 1. Validación de estados obligatorios (`NUEVO` a `CERRADO`).
    * 2. Validación de campos obligatorios en creación de incidentes (`AB#8`).
    * 3. Motor de filtros dinámicos (`AB#11`).
    * 4. Reglas de transición de estados (`AB#15`).
    * 5. Cálculo matemático de KPIs corregido (`AB#22`).
    * 6. Sanitización contra XSS (`AB#27`).
  * **Criterio de Rúbrica:** Pruebas unitarias/integración automatizadas que garanticen la estabilidad de la lógica de negocio antes de cada release.

---

## 🏷️ Módulo 6: Versionado Semántico y Release (Semana 3)

- [x] **Captura 6.1: Etiquetas de Versionado Semántico en Git (SemVer)**  
  * **Ubicación:** `https://github.com/MayroGamerosXZ/Incident-hub-w3/tags`
  * **Qué muestra:** Las 3 etiquetas SemVer anotadas: `v0.1.0` (Semana 1), `v0.2.0` (Semana 2) y `v1.0.0` (Semana 3).
  * **Criterio de Rúbrica:** Aplicación estricta de Versionado Semántico (SemVer) que refleje la evolución incremental del proyecto.

- [x] **Captura 6.2: Release Oficial de Producción en GitHub**  
  * **Ubicación:** `https://github.com/MayroGamerosXZ/Incident-hub-w3/releases`
  * **Qué muestra:** La publicación de la versión **`v1.0.0 - Production Ready`** con sus Release Notes detalladas, resumen de características y artefactos asociados.
  * **Criterio de Rúbrica:** Estrategia formal de empaquetado y liberación de software.

- [x] **Captura 6.3: Cierre al 100% en Azure Boards**  
  * **Ubicación:** `https://dev.azure.com/DevOps-UMG-Mayro/incident-hub/_workitems`
  * **Qué muestra:** Todos los Epics (`AB#4`, `AB#20`), Features y User Stories en estado **`Closed`**, con trazabilidad completa de fechas y commits.
  * **Criterio de Rúbrica:** Gestión del ciclo de vida del software culminada exitosamente con el 100% de requerimientos entregados.

