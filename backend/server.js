const express = require('express');
const cors = require('cors');
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const {
  sendIncidentNotification,
  sendPipelineNotification,
  getNotifications,
  updateSmtpConfig
} = require('./src/services/emailService.js');
const {
  getAzureStatus,
  simulatePipelineFailure,
  triggerPipelineVerification
} = require('./src/services/azureService.js');
const {
  initDatabase,
  checkDatabaseHealth,
  isPostgresActive,
  dbListIncidents,
  dbGetIncidentById,
  dbCreateIncident,
  dbUpdateIncidentStatus,
  dbAddComment
} = require('./src/db.js');
const {
  ALLOWED_TRANSITIONS,
  canTransitionStatus,
  computeDashboardMetrics
} = require('./src/services/workflowService.js');
const {
  VALID_STATUSES,
  validateCreateIncident,
  validateStatusUpdate,
  filterIncidentsList
} = require('./src/validators/incidentValidator.js');
const {
  securityHeadersMiddleware,
  sanitizeInputString,
  sanitizePayload,
  toPublicUser,
  generateAuthToken,
  attachOperatorContext,
  requireAdminRole,
  createRateLimiter
} = require('./src/middleware/securityMiddleware.js');
const {
  AppError,
  asyncHandler,
  errorHandlerMiddleware
} = require('./src/middleware/errorHandler.js');

const app = express();
const PORT = process.env.PORT || 5000;

// Seguridad de cabeceras HTTP (DT-1 / OWASP A05), CORS restringible y límite de payload
app.use(securityHeadersMiddleware);
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : null;
app.use(cors(allowedOrigins ? { origin: allowedOrigins, credentials: true } : undefined));
app.use(express.json({ limit: '50kb' }));
app.use(attachOperatorContext);
app.use('/api/auth/login', createRateLimiter({ windowMs: 15 * 60_000, max: 30 }));
app.use('/api', createRateLimiter({ windowMs: 60_000, max: 300 }));

// Almacenamiento en memoria resiliente (Mock Data para ejecución autónoma o fallback de BD ADR-004)
let users = [
  { id: 1, name: 'Mayro Gameros (DevOps Lead)', email: 'mbarriosg8@miumg.edu.gt', role: 'ADMIN', specialty: 'GLOBAL / DEVOPS CI-CD', defaultCategory: '', initials: 'MG', accessCode: process.env.ADMIN_ACCESS_CODE || 'ADMIN-2026' },
  { id: 2, name: 'Carlos Mendoza (Especialista Redes)', email: 'cmendoza@miumg.edu.gt', role: 'TECHNICIAN', specialty: 'INFRAESTRUCTURA DE RED', defaultCategory: 'NETWORK', initials: 'CM', accessCode: process.env.TECH_ACCESS_CODE || 'TECH-2026' },
  { id: 3, name: 'Sofia Gomez (Analista Seguridad)', email: 'sgomez@miumg.edu.gt', role: 'TECHNICIAN', specialty: 'CIBERSEGURIDAD & VPN', defaultCategory: 'SECURITY', initials: 'SG', accessCode: process.env.TECH_ACCESS_CODE || 'TECH-2026' },
  { id: 4, name: 'Diego Ramirez (Arquitecto BD/SW)', email: 'dramirez@miumg.edu.gt', role: 'TECHNICIAN', specialty: 'SOFTWARE & BASE DE DATOS', defaultCategory: 'SOFTWARE', initials: 'DR', accessCode: process.env.TECH_ACCESS_CODE || 'TECH-2026' },
  { id: 5, name: 'Laura Torres (Soporte Hardware)', email: 'ltorres@miumg.edu.gt', role: 'TECHNICIAN', specialty: 'HARDWARE & EQUIPOS', defaultCategory: 'HARDWARE', initials: 'LT', accessCode: process.env.TECH_ACCESS_CODE || 'TECH-2026' },
  { id: 6, name: 'Andres Morales (Gestión Accesos)', email: 'amorales@miumg.edu.gt', role: 'TECHNICIAN', specialty: 'DIRECTORIO ACTIVO & IAM', defaultCategory: 'ACCESS', initials: 'AM', accessCode: process.env.TECH_ACCESS_CODE || 'TECH-2026' }
];

const usersMap = new Map(users.map(u => [u.id, toPublicUser(u)]));

let nextIncidentId = 6;
let nextLogId = 4;
let nextCommentId = 3;

let incidents = [
  {
    id: 1,
    title: 'Fallo en switch principal piso 3',
    description: 'Pérdida de conectividad de red cableada en el área de operaciones.',
    category: 'NETWORK',
    priority: 'ALTA',
    status: 'ASIGNADO',
    reported_by: 'mgarcia@empresa.com',
    assigned_to_id: 2,
    created_at: new Date('2026-10-10T08:00:00Z'),
    updated_at: new Date('2026-10-10T09:30:00Z'),
    resolved_at: null,
    closed_at: null
  },
  {
    id: 2,
    title: 'Servidor de base de datos con alto uso de CPU',
    description: 'PostgreSQL reporta 98% de consumo sostenido de CPU en queries.',
    category: 'SOFTWARE',
    priority: 'CRITICA',
    status: 'EN_PROCESO',
    reported_by: 'monitoring@empresa.com',
    assigned_to_id: 4,
    created_at: new Date('2026-10-11T10:15:00Z'),
    updated_at: new Date('2026-10-11T11:00:00Z'),
    resolved_at: null,
    closed_at: null
  },
  {
    id: 3,
    title: 'Falla de arranque en laptop corporativa #104',
    description: 'Pantalla azul recurrente al iniciar Windows 11.',
    category: 'HARDWARE',
    priority: 'BAJA',
    status: 'NUEVO',
    reported_by: 'jlopez@empresa.com',
    assigned_to_id: null,
    created_at: new Date('2026-10-11T14:20:00Z'),
    updated_at: new Date('2026-10-11T14:20:00Z'),
    resolved_at: null,
    closed_at: null
  },
  {
    id: 4,
    title: 'Problema de acceso VPN para usuarios remotos',
    description: 'Error 809 de timeout al autenticarse en Gateway corporativo.',
    category: 'SECURITY',
    priority: 'MEDIA',
    status: 'RESUELTO',
    reported_by: 'claudia.m@empresa.com',
    assigned_to_id: 1,
    created_at: new Date('2026-10-09T12:00:00Z'),
    updated_at: new Date('2026-10-09T16:45:00Z'),
    resolved_at: new Date('2026-10-09T16:45:00Z'),
    closed_at: null
  },
  {
    id: 5,
    title: 'Bloqueo de cuenta en Directorio Activo',
    description: 'Usuario bloqueado por múltiples intentos erróneos de contraseña.',
    category: 'ACCESS',
    priority: 'BAJA',
    status: 'CERRADO',
    reported_by: 'rvaldez@empresa.com',
    assigned_to_id: 6,
    created_at: new Date('2026-10-08T09:00:00Z'),
    updated_at: new Date('2026-10-08T09:30:00Z'),
    resolved_at: new Date('2026-10-08T09:25:00Z'),
    closed_at: new Date('2026-10-08T09:30:00Z')
  }
];

let incidentLogs = [
  { id: 1, incident_id: 1, previous_status: 'NUEVO', new_status: 'ASIGNADO', changed_by: 'Carlos Mendoza', change_reason: 'Asignado para revisión', created_at: new Date('2026-10-10T09:30:00Z') },
  { id: 2, incident_id: 2, previous_status: 'NUEVO', new_status: 'ASIGNADO', changed_by: 'Diego Ramirez', change_reason: 'Revisión de queries', created_at: new Date('2026-10-11T10:30:00Z') },
  { id: 3, incident_id: 2, previous_status: 'ASIGNADO', new_status: 'EN_PROCESO', changed_by: 'Diego Ramirez', change_reason: 'Aislando réplica de lectura', created_at: new Date('2026-10-11T11:00:00Z') }
];

let incidentComments = [
  { id: 1, incident_id: 1, author_name: 'Carlos Mendoza', comment: 'Reinicio del switch Cisco Catalyst en curso.', created_at: new Date('2026-10-10T09:45:00Z') },
  { id: 2, incident_id: 2, author_name: 'Diego Ramirez', comment: 'Identificada consulta lenta en nómina sin índices.', created_at: new Date('2026-10-11T11:15:00Z') }
];

// Inicialización de persistencia PostgreSQL / Fallback Resiliente (ADR-004)
initDatabase(users, incidents).catch(err => console.error('Error inicializando BD:', err));

// --- ENDPOINTS DE LA API ---

// 1. Healthcheck con Estado de Base de Datos PostgreSQL (ADR-004)
app.get('/api/health', asyncHandler(async (_req, res) => {
  const dbHealth = await checkDatabaseHealth();
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'IT Incident Hub API',
    alert_recipient: process.env.ALERT_RECIPIENT || 'mbarriosg8@miumg.edu.gt',
    database: dbHealth,
    allowed_transitions: ALLOWED_TRANSITIONS
  });
}));

// 2. Usuarios / Técnicos (sin exponer accessCode - OWASP A01/A02)
app.get('/api/users', (_req, res) => {
  res.json(users.map(toPublicUser));
});

app.post('/api/auth/login', (req, res) => {
  const { email, accessCode, userId } = req.body || {};
  let user = null;

  if (typeof email === 'string' && email.trim() !== '') {
    user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  } else if (userId !== undefined && userId !== null) {
    user = users.find(u => u.id === Number(userId));
  }

  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas o usuario no registrado en IT Incident Hub' });
  }

  if (typeof accessCode !== 'string' || accessCode.trim() === '' || accessCode.trim() !== user.accessCode) {
    return res.status(401).json({ error: 'Código de acceso inválido para el operador seleccionado' });
  }

  const publicUser = toPublicUser(user);
  const token = generateAuthToken(user);

  res.json({
    authenticated: true,
    token,
    user: publicUser,
    permissions: {
      isAdmin: user.role === 'ADMIN',
      canManagePipeline: user.role === 'ADMIN',
      canConfigureSmtp: user.role === 'ADMIN',
      canAssignAnyTechnician: user.role === 'ADMIN',
      defaultCategoryFilter: user.defaultCategory || ''
    }
  });
});

// 3. Listar Incidentes con Filtros y Enriquecimiento O(1) con Map (AB#11)
app.get('/api/incidents', asyncHandler(async (req, res) => {
  const baseList = isPostgresActive() ? await dbListIncidents() : incidents;
  const filtered = filterIncidentsList(baseList, req.query);

  const enriched = filtered.map(inc => ({
    ...inc,
    assigned_technician: usersMap.get(inc.assigned_to_id) || null
  }));

  res.json(enriched);
}));

// 4. Detalle de Incidente
app.get('/api/incidents/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('Identificador de incidente inválido', 400);
  }

  if (isPostgresActive()) {
    const dbInc = await dbGetIncidentById(id);
    if (!dbInc) throw new AppError('Incidente no encontrado', 404);
    return res.json({
      ...dbInc,
      assigned_technician: usersMap.get(dbInc.assigned_to_id) || null
    });
  }

  const inc = incidents.find(i => i.id === id);
  if (!inc) throw new AppError('Incidente no encontrado', 404);

  const comments = incidentComments.filter(c => c.incident_id === inc.id);
  const logs = incidentLogs.filter(l => l.incident_id === inc.id);
  const assigned_technician = usersMap.get(inc.assigned_to_id) || null;

  res.json({ ...inc, assigned_technician, comments, logs });
}));

// 5. Crear Incidente + Sanitización XSS (DT-1) + Validación Estricta + Alerta (AB#8)
app.post('/api/incidents', asyncHandler(async (req, res) => {
  const cleanBody = sanitizePayload(req.body || {});
  const validation = validateCreateIncident(cleanBody);
  if (!validation.valid) {
    throw new AppError(validation.errors[0], 400, validation.errors);
  }

  const normalizedCategory = cleanBody.category.trim().toUpperCase();
  const normalizedPriority = cleanBody.priority
    ? cleanBody.priority.trim().toUpperCase()
    : 'MEDIA';

  let newIncident;
  if (isPostgresActive()) {
    newIncident = await dbCreateIncident({
      title: cleanBody.title.trim(),
      description: cleanBody.description.trim(),
      category: normalizedCategory,
      priority: normalizedPriority,
      reported_by: cleanBody.reported_by.trim()
    });
  } else {
    newIncident = {
      id: nextIncidentId++,
      title: cleanBody.title.trim(),
      description: cleanBody.description.trim(),
      category: normalizedCategory,
      priority: normalizedPriority,
      status: 'NUEVO',
      reported_by: cleanBody.reported_by.trim(),
      assigned_to_id: null,
      created_at: new Date(),
      updated_at: new Date(),
      resolved_at: null,
      closed_at: null
    };

    incidents.unshift(newIncident);

    incidentLogs.push({
      id: nextLogId++,
      incident_id: newIncident.id,
      previous_status: null,
      new_status: 'NUEVO',
      changed_by: req.user?.name || newIncident.reported_by,
      change_reason: 'Creación de incidente inicial',
      created_at: new Date()
    });
  }

  const notification = await sendIncidentNotification(newIncident, 'INCIDENT_CREATED');

  res.status(201).json({
    ...newIncident,
    notification_sent: notification
  });
}));

// 6. Transicionar Estado o Asignar Técnico + Máquina de Estados Estricta (AB#15)
app.patch('/api/incidents/:id/status', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('Identificador de incidente inválido', 400);
  }

  const cleanBody = sanitizePayload(req.body || {});
  const statusValidation = validateStatusUpdate(cleanBody, users);
  if (!statusValidation.valid) {
    throw new AppError(statusValidation.errors[0], 400, statusValidation.errors);
  }

  const currentInc = isPostgresActive()
    ? await dbGetIncidentById(id)
    : incidents.find(i => i.id === id);

  if (!currentInc) throw new AppError('Incidente no encontrado', 404);

  const { status, assigned_to_id, changed_by, change_reason } = cleanBody;
  const previous_status = currentInc.status;
  let nextStatus = previous_status;

  if (typeof status === 'string' && status.trim() !== '') {
    const requestedStatus = status.trim().toUpperCase();
    if (!VALID_STATUSES.includes(requestedStatus)) {
      throw new AppError(`Estado no válido. Opciones: ${VALID_STATUSES.join(', ')}`, 400);
    }
    if (requestedStatus !== previous_status && !canTransitionStatus(previous_status, requestedStatus)) {
      throw new AppError(
        `Transición de estado no permitida: no es posible pasar de ${previous_status} a ${requestedStatus}`,
        400
      );
    }
    nextStatus = requestedStatus;
  }

  let nextAssignedTo = currentInc.assigned_to_id;
  if (assigned_to_id !== undefined) {
    nextAssignedTo = assigned_to_id !== null && assigned_to_id !== '' ? Number(assigned_to_id) : null;
    if (nextStatus === 'NUEVO' && nextAssignedTo !== null) {
      nextStatus = 'ASIGNADO';
    }
  }

  const now = new Date();
  const resolved_at = nextStatus === 'RESUELTO' ? now : currentInc.resolved_at || null;
  const closed_at = nextStatus === 'CERRADO' ? now : currentInc.closed_at || null;
  const operatorName = req.user?.name || (typeof changed_by === 'string' && changed_by.trim() ? sanitizeInputString(changed_by) : 'Operador');
  const reasonText = typeof change_reason === 'string' && change_reason.trim()
    ? sanitizeInputString(change_reason)
    : (nextAssignedTo ? `Asignado a técnico #${nextAssignedTo}` : `Transición ${previous_status} -> ${nextStatus}`);

  let updatedIncident;
  if (isPostgresActive()) {
    updatedIncident = await dbUpdateIncidentStatus(id, {
      previous_status,
      new_status: nextStatus,
      assigned_to_id: nextAssignedTo,
      changed_by: operatorName,
      change_reason: reasonText,
      resolved_at,
      closed_at
    });
  } else {
    currentInc.status = nextStatus;
    currentInc.assigned_to_id = nextAssignedTo;
    currentInc.updated_at = now;
    currentInc.resolved_at = resolved_at;
    currentInc.closed_at = closed_at;

    incidentLogs.push({
      id: nextLogId++,
      incident_id: currentInc.id,
      previous_status,
      new_status: nextStatus,
      changed_by: operatorName,
      change_reason: reasonText,
      created_at: now
    });
    updatedIncident = currentInc;
  }

  const notification = await sendIncidentNotification(updatedIncident, 'INCIDENT_STATUS_CHANGED');

  res.json({
    ...updatedIncident,
    notification_sent: notification
  });
}));

// 7. Agregar Comentario Sanitizado (DT-1)
app.post('/api/incidents/:id/comments', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('Identificador de incidente inválido', 400);
  }

  const cleanBody = sanitizePayload(req.body || {});
  const author_name = req.user?.name || cleanBody.author_name;
  const comment = cleanBody.comment;

  if (typeof author_name !== 'string' || !author_name.trim() || typeof comment !== 'string' || !comment.trim()) {
    throw new AppError('author_name y comment son obligatorios', 400);
  }

  if (isPostgresActive()) {
    const exists = await dbGetIncidentById(id);
    if (!exists) throw new AppError('Incidente no encontrado', 404);
    const createdComment = await dbAddComment(id, {
      author_name: author_name.trim(),
      comment: comment.trim()
    });
    return res.status(201).json(createdComment);
  }

  const inc = incidents.find(i => i.id === id);
  if (!inc) throw new AppError('Incidente no encontrado', 404);

  const newComment = {
    id: nextCommentId++,
    incident_id: inc.id,
    author_name: author_name.trim(),
    comment: comment.trim(),
    created_at: new Date()
  };

  incidentComments.push(newComment);
  res.status(201).json(newComment);
}));

// 8. Métricas del Dashboard en O(n) usando workflowService (AB#33, AB#34)
app.get('/api/dashboard/stats', asyncHandler(async (_req, res) => {
  const list = isPostgresActive() ? await dbListIncidents() : incidents;
  const metrics = computeDashboardMetrics(list, users);
  res.json(metrics);
}));

// 9. Bandeja y Estado de Notificaciones por Correo (mbarriosg8@miumg.edu.gt)
app.get('/api/notifications', (_req, res) => {
  res.json(getNotifications());
});

// 10. Disparar Alerta de Prueba a mbarriosg8@miumg.edu.gt
app.post('/api/notifications/test', asyncHandler(async (_req, res) => {
  const sampleIncident = incidents[0] || {
    id: 99,
    title: 'Verificación de Alerta Operativa en Vivo',
    description: 'Prueba de conectividad de alertas hacia correo institucional UMG.',
    category: 'SECURITY',
    priority: 'CRITICA',
    status: 'EN_PROCESO',
    reported_by: 'mbarriosg8@miumg.edu.gt'
  };
  const record = await sendIncidentNotification(
    sampleIncident,
    'MANUAL_TEST_ALERT',
    'PRUEBA DE NOTIFICACIÓN A CORREO INSTITUCIONAL UMG'
  );
  res.status(201).json(record);
}));

// 11. Actualizar Configuración SMTP en Caliente (Restringido a ADMIN - OWASP A01)
app.post('/api/notifications/config', requireAdminRole, asyncHandler(async (req, res) => {
  const updated = updateSmtpConfig(req.body || {});
  res.json(updated);
}));

// 12. Estado de Azure DevOps Pipelines, Agente Self-Hosted y Git
app.get('/api/azure/status', asyncHandler(async (_req, res) => {
  const status = await getAzureStatus();
  res.json(status);
}));

// 13. Simular Fallo Controlado en Pipeline (ROJO ❌) + Alerta a Gmail UMG (Restringido a ADMIN)
app.post('/api/azure/simulate-failure', requireAdminRole, asyncHandler(async (req, res) => {
  const reason = typeof req.body?.reason === 'string' && req.body.reason.trim()
    ? sanitizeInputString(req.body.reason)
    : 'Simulación de Fallo Controlado en Pipeline CI (ERR_ASSERTION: 1 !== -1)';
  const build = simulatePipelineFailure(reason);
  const emailRecord = await sendPipelineNotification(build);
  res.status(201).json({
    build,
    notification_sent: emailRecord
  });
}));

// 14. Disparar Solución / Verificación Asíncrona de Pipeline (VERDE ✅) (Restringido a ADMIN)
app.post('/api/azure/sync', requireAdminRole, asyncHandler(async (req, res) => {
  const reason = typeof req.body?.reason === 'string' && req.body.reason.trim()
    ? sanitizeInputString(req.body.reason)
    : 'Solución Aplicada y Restauración de Pipeline CI/CD a Verde';
  const build = await triggerPipelineVerification(reason);
  const emailRecord = await sendPipelineNotification(build);
  res.status(201).json({
    build,
    notification_sent: emailRecord
  });
}));

// Middleware Centralizado de Manejo de Errores (DT-2 - AB#27)
app.use(errorHandlerMiddleware);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 IT Incident Hub API escuchando en el puerto ${PORT} | Alertas: ${process.env.ALERT_RECIPIENT || 'mbarriosg8@miumg.edu.gt'}`);
  });
}

module.exports = app;
