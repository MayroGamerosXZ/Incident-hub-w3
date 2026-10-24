const test = require('node:test');
const assert = require('node:assert');
const {
  VALID_STATUSES,
  validateCreateIncident,
  filterIncidentsList
} = require('../backend/src/validators/incidentValidator.js');
const {
  canTransitionStatus,
  computeDashboardMetrics
} = require('../backend/src/services/workflowService.js');
const {
  sanitizeInputString
} = require('../backend/src/middleware/securityMiddleware.js');
const {
  DEFAULT_RECIPIENT,
  sendIncidentNotification
} = require('../backend/src/services/emailService.js');
const {
  getAzureStatus
} = require('../backend/src/services/azureService.js');

test('Suite de Pruebas Unitarias e Integracion - IT Incident Hub (AB#24)', async (t) => {

  await t.test('1. Validar estructura de los 5 estados obligatorios del ciclo de vida', () => {
    const expected = ['NUEVO', 'ASIGNADO', 'EN_PROCESO', 'RESUELTO', 'CERRADO'];
    assert.deepStrictEqual(VALID_STATUSES, expected);
  });

  await t.test('2. Validar creacion de incidente valido e invalido (AB#8)', () => {
    const validRes = validateCreateIncident({
      title: 'Caida de enlace primario',
      description: 'Sin salida a internet en sucursal norte',
      category: 'NETWORK',
      reported_by: 'admin@empresa.com'
    });
    assert.strictEqual(validRes.valid, true);
    assert.strictEqual(validRes.errors.length, 0);

    const invalidRes = validateCreateIncident({
      title: 'Corto',
      description: 'Corto',
      category: 'INVALID_CAT',
      reported_by: 'correo_invalido'
    });
    assert.strictEqual(invalidRes.valid, false);
    assert.ok(invalidRes.errors.length >= 3);
  });

  await t.test('3. Validar motor de filtros por estado, prioridad, categoria y tecnico (AB#11)', () => {
    const sample = [
      { id: 1, title: 'Switch caido', description: 'Red', status: 'ASIGNADO', priority: 'ALTA', category: 'NETWORK', assigned_to_id: 2, reported_by: 'a@b.com' },
      { id: 2, title: 'DB lenta', description: 'SQL', status: 'EN_PROCESO', priority: 'CRITICA', category: 'SOFTWARE', assigned_to_id: 4, reported_by: 'c@d.com' }
    ];
    const byTech = filterIncidentsList(sample, { assigned_to_id: 4 });
    assert.strictEqual(byTech.length, 1);
    assert.strictEqual(byTech[0].id, 2);
  });

  await t.test('4. Validar reglas de transicion de estados (AB#15)', () => {
    assert.strictEqual(canTransitionStatus('NUEVO', 'ASIGNADO'), true);
    assert.strictEqual(canTransitionStatus('EN_PROCESO', 'RESUELTO'), true);
    assert.strictEqual(canTransitionStatus('CERRADO', 'NUEVO'), false);
  });

  await t.test('5. Validar calculo corregido de metricas del Dashboard (Fix Fallo Controlado AB#22)', () => {
    const mockIncidents = [
      { id: 1, status: 'NUEVO', priority: 'ALTA', category: 'NETWORK', assigned_to_id: 1 },
      { id: 2, status: 'EN_PROCESO', priority: 'CRITICA', category: 'SOFTWARE', assigned_to_id: 1 },
      { id: 3, status: 'CERRADO', priority: 'BAJA', category: 'HARDWARE', assigned_to_id: 2 }
    ];
    const mockUsers = [
      { id: 1, name: 'Tech 1' },
      { id: 2, name: 'Tech 2' }
    ];
    const stats = computeDashboardMetrics(mockIncidents, mockUsers);
    assert.strictEqual(stats.total, 3);
    assert.strictEqual(stats.abiertos, 2);
    assert.strictEqual(stats.cerrados, 1);
    assert.strictEqual(stats.criticos, 1);
  });

  await t.test('6. Validar sanitizacion de seguridad y escapado contra XSS (Deuda Tecnica DT-1 AB#27)', () => {
    const { escapeHtml } = require('../backend/src/middleware/securityMiddleware.js');
    const { buildEmailHtml } = require('../backend/src/services/emailService.js');
    const dirty = '<script>alert("xss")</script>Fallo en servidor';
    const clean = sanitizeInputString(dirty);
    assert.strictEqual(clean, 'Fallo en servidor');

    const xssPayload = '<img src=x onerror=alert(1)>';
    const emailHtml = buildEmailHtml({
      id: 99,
      title: xssPayload,
      description: 'Desc <svg onload=alert(2)>',
      category: 'SECURITY',
      priority: 'CRITICA',
      status: 'NUEVO',
      reported_by: 'sec@empresa.com'
    });
    assert.strictEqual(emailHtml.includes(xssPayload), false);
    assert.ok(emailHtml.includes(escapeHtml(xssPayload)));
  });

  await t.test('7. Validar servicio de notificaciones Gmail UMG (mbarriosg8@miumg.edu.gt) y Azure DevOps (AB#23, AB#30)', async () => {
    process.env.NODE_ENV = 'test';
    assert.strictEqual(DEFAULT_RECIPIENT, 'mbarriosg8@miumg.edu.gt');
    const notif = await sendIncidentNotification({
      id: 10,
      title: 'Prueba unitaria de alerta',
      description: 'Validando disparo de correo',
      category: 'SECURITY',
      priority: 'CRITICA',
      status: 'NUEVO',
      reported_by: 'mbarriosg8@miumg.edu.gt'
    });
    assert.strictEqual(notif.to, 'mbarriosg8@miumg.edu.gt');
    assert.ok(notif.html_preview.includes('mbarriosg8@miumg.edu.gt'));

    const azure = await getAzureStatus();
    assert.strictEqual(azure.organization, 'DevOps-UMG-Mayro');
    assert.strictEqual(azure.project, 'incident-hub');
    assert.strictEqual(azure.selfHostedAgent.name, 'mayro-local-agent');
  });

  await t.test('8. Validar integracion HTTP real (Express API), RBAC, no exposicion de accessCode y bloqueo de transiciones ilegales (AB#15, AB#27)', async () => {
    process.env.NODE_ENV = 'test';
    const http = require('node:http');
    const { Duplex } = require('node:stream');
    const app = require('../backend/server.js');

    function invokeApp({ method = 'GET', path = '/', headers = {}, body = null }) {
      return new Promise((resolve, reject) => {
        const socket = new Duplex({
          read() {},
          write(_chunk, _enc, cb) { cb(); }
        });
        socket.remoteAddress = '127.0.0.1';

        const req = new http.IncomingMessage(socket);
        req.method = method;
        req.url = path;
        const rawBody = body !== null ? JSON.stringify(body) : '';
        req.headers = {
          host: 'localhost',
          ...(rawBody ? { 'content-type': 'application/json', 'content-length': String(Buffer.byteLength(rawBody)) } : {}),
          ...Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]))
        };

        const res = new http.ServerResponse(req);
        res.assignSocket(socket);

        const chunks = [];
        const origWrite = res.write.bind(res);
        const origEnd = res.end.bind(res);
        res.write = (chunk, encoding, cb) => {
          if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk), encoding));
          return origWrite(chunk, encoding, cb);
        };
        res.end = (chunk, encoding, cb) => {
          if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk), encoding));
          origEnd(chunk, encoding, cb);
          const text = Buffer.concat(chunks).toString('utf8');
          const headerIdx = text.indexOf('\r\n\r\n');
          const payloadText = headerIdx !== -1 ? text.slice(headerIdx + 4) : text;
          resolve({
            status: res.statusCode,
            json: async () => JSON.parse(payloadText)
          });
        };

        app.handle(req, res, reject);
        if (rawBody) req.push(rawBody);
        req.push(null);
      });
    }

    // 8.1 /api/users no debe exponer accessCode (OWASP A01/A02)
    const usersRes = await invokeApp({ method: 'GET', path: '/api/users' });
    assert.strictEqual(usersRes.status, 200);
    const usersData = await usersRes.json();
    assert.ok(Array.isArray(usersData) && usersData.length >= 6);
    assert.strictEqual(usersData.every(u => !('accessCode' in u)), true);

    // 8.2 Login sin accessCode debe ser rechazado con 401
    const badLogin = await invokeApp({
      method: 'POST',
      path: '/api/auth/login',
      body: { userId: 1 }
    });
    assert.strictEqual(badLogin.status, 401);

    // 8.3 Login valido de tecnico emite token HMAC y bloquea endpoints exclusivos de ADMIN con 403
    const techLogin = await invokeApp({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'cmendoza@miumg.edu.gt', accessCode: 'TECH-2026' }
    });
    assert.strictEqual(techLogin.status, 200);
    const techAuth = await techLogin.json();
    assert.ok(techAuth.token);
    assert.strictEqual('accessCode' in techAuth.user, false);

    const forbiddenRes = await invokeApp({
      method: 'POST',
      path: '/api/notifications/config',
      headers: { Authorization: `Bearer ${techAuth.token}` },
      body: { recipient: 'otro@miumg.edu.gt' }
    });
    assert.strictEqual(forbiddenRes.status, 403);

    // 8.4 Payload con tipos invalidos (category numerica) responde 400 sin colgar Express
    const invalidTypeRes = await invokeApp({
      method: 'POST',
      path: '/api/incidents',
      body: {
        title: 'Incidente de prueba HTTP',
        description: 'Descripcion suficientemente larga para prueba',
        category: 12345,
        reported_by: 'mbarriosg8@miumg.edu.gt'
      }
    });
    assert.strictEqual(invalidTypeRes.status, 400);

    // 8.5 Maquina de estados estricta bloquea salto directo NUEVO -> CERRADO y reapertura CERRADO -> EN_PROCESO
    assert.strictEqual(canTransitionStatus('NUEVO', 'CERRADO'), false);
    assert.strictEqual(canTransitionStatus('CERRADO', 'EN_PROCESO'), false);
    assert.strictEqual(canTransitionStatus('RESUELTO', 'NUEVO'), false);

    const illegalPatchRes = await invokeApp({
      method: 'PATCH',
      path: '/api/incidents/5/status',
      body: { status: 'NUEVO' }
    });
    assert.strictEqual(illegalPatchRes.status, 400);
  });
});