# 📦 Análisis y Gestión de Dependencias de Software (SCA)

> **Proyecto:** IT Incident Hub — Release v1.0.0  
> **Responsable:** Andres Morales (SecOps Lead) / Mayro Geovanni Barrios Gameros (DevOps Lead)  
> **Trazabilidad Azure Boards:** `AB#25`, `AB#26`, `AB#27`  
> **Entregable Oficial:** `docs/dependencias.md` (Rúbrica Sección 8)  

---

## 1. Inventario General del Ecosistema de Paquetes

El proyecto sigue una política de **minimización de superficie de ataque** (*Zero-Bloat Security*). Solo se incluyen paquetes de grado industrial con mantenimiento activo y compatibilidad con Node.js 20 LTS:

### 1.1 Backend (`backend/package.json`)
| Paquete | Versión | Tipo | Licencia | Propósito | Vulnerabilidades | Decisión Tomada |
|---|---|---|---|---|---|---|
| `express` | `^4.19.2` | Runtime | MIT | Framework de enrutamiento y API REST | 0 (Limipio) | **Mantener:** Base HTTP estable con mitigaciones CVE-2024-29041 aplicadas. |
| `body-parser` | `>=1.20.9` | Transitiva / Core | MIT | Middleware de parsing de payloads JSON | 0 (Parcheado) | **Actualizado:** Mitigado contra GHSA-27r3-jxmh-p828 (DoS por trailing bytes). |
| `cors` | `^2.8.5` | Runtime | MIT | Gestión de Cross-Origin Resource Sharing | 0 (Limpio) | **Mantener:** Sin dependencias transitivas riesgosas. |
| `pg` | `^8.11.5` | Runtime | MIT | Driver oficial cliente de PostgreSQL | 0 (Limpio) | **Mantener:** Pool de conexiones TCP y consultas parametrizadas `$1, $2`. |
| `dotenv` | `^16.4.5` | Runtime | BSD-2-Clause | Inyección de variables de entorno locales | 0 (Limpio) | **Mantener:** Cero dependencias externas. |

### 1.2 Frontend (`frontend/package.json`)
| Paquete | Versión | Tipo | Licencia | Propósito | Vulnerabilidades | Decisión Tomada |
|---|---|---|---|---|---|---|
| `react` | `^18.3.1` | Runtime | MIT | Biblioteca UI declarativa | 0 (Limpio) | **Mantener:** Versión LTS oficial. |
| `react-dom` | `^18.3.1` | Runtime | MIT | Renderizado en DOM | 0 (Limpio) | **Mantener:** Versión LTS oficial. |
| `vite` | `^5.2.11` | Dev / Build | MIT | Bundler y servidor de desarrollo | 0 (En bundle) | **Aislar:** Solo se ejecuta en fase de compilación (`npm run build`). No se expone al cliente. |
| `@vitejs/plugin-react` | `^4.2.1` | Dev | MIT | Soporte Babel/SWC para React Fast Refresh | 0 (Limpio) | **Mantener en devDependencies**. |

### 1.3 Pruebas Automatizadas (`tests/package.json`)
| Paquete | Versión | Tipo | Licencia | Propósito | Decisión Tomada |
|---|---|---|---|---|---|
| `node:test` / `node:assert` | Nativo Node 20 | Built-in | Node.js | Suite de 8 pruebas unitarias e integración | **Adoptar Nativo:** Elimina frameworks pesados (Jest/Mocha), acelera la suite (<900ms) y evita dependencias vulnerables. |
| `supertest` | `^6.3.4` | QA Dev | MIT | Pruebas de integración HTTP opcionales | **Aislar:** Uso exclusivo en entorno de testing, no empaquetado en release. |

---

## 2. Decisión de Arquitectura: Cero Librerías para Gráficos (SVG Puro)

Para cumplir con la exigencia de **0 vulnerabilidades en auditoría SCA (`npm audit`)**:
* **Problema:** Librerías gráficas como `chart.js` o `recharts` introducen entre 40 y 120 paquetes transitivos, aumentando el riesgo de CVEs de prototipo (`prototype pollution`) y Denegación de Servicio (DoS).
* **Decisión:** Los 3 gráficos del Dashboard (Dona de 5 Estados, Barras de Categorías y Carga por Técnico) se desarrollaron en **SVG nativo puro con CSS Grid** dentro de `frontend/src/App.jsx`.
* **Resultado:** Reducción del tamaño del bundle a solo 214 kB y **0 dependencias vulnerables**.

---

## 3. Bitácora de Auditoría SCA y Vulnerabilidades Detectadas (`npm audit`)

### 3.1 Calificación del Quality Gate en Pipelines (Etapa 4)
Tanto en **Azure Pipelines** (`azure-pipelines.yml`) como en **GitHub Actions** (`.github/workflows/ci.yml`), el pipeline ejecuta obligatoriamente:
```bash
npm audit --audit-level=high
```
Si se detecta cualquier paquete con severidad `HIGH` o `CRITICAL`, el runner finaliza con **Exit Code 1**, bloqueando el build y la publicación de artefactos.

### 3.2 Registro de Detección y Remediación (Caso de Estudio Real - AB#26)
* **Vulnerabilidad detectada:** `body-parser < 1.20.9` (Advisory `GHSA-27r3-jxmh-p828`).
* **Severidad:** **HIGH** (CVE: Denial of Service via trailing bytes after a compressed request body).
* **Detección en CI:** GitHub Actions detuvo la ejecución #40080128393 en el paso de auditoría SCA.
* **Acción Correctiva:**
  ```bash
  cd backend
  npm audit fix
  npm audit --audit-level=high
  ```
* **Estado Final:**
  ```text
  found 0 vulnerabilities
  ```
* **Commit de Remediación:** `1117462` (`fix(security-audit): Actualizacion en body-parser para solucionar alerta SCA en GitHub Actions AB#26`).

---

## 4. Política de Gestión del Ciclo de Vida de Dependencias
1. **Fijación de Versiones:** Se utiliza `package-lock.json` para garantizar compilaciones deterministas e idénticas en el agente local y en la nube.
2. **Restauración Rápida:** En pipelines se utiliza `npm ci` para evitar alteraciones accidentales del árbol de paquetes.
3. **Monitoreo Continuo:** Se ejecutan escaneos periódicos mediante el workflow de GitHub Actions en cada Pull Request y push a `main`.
