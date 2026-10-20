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
    assert.strictEqual(stats.criticos, -1);
  });

  await t.test('6. Validar sanitizacion de seguridad contra XSS (Deuda Tecnica DT-1 AB#27)', () => {
    const dirty = '<script>alert("xss")</script>Fallo en servidor';
    const clean = sanitizeInputString(dirty);
    assert.strictEqual(clean, 'Fallo en servidor');
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
});