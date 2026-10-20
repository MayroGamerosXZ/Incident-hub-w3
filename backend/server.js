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
  pool
} = require('./src/db.js');
const {
  canTransitionStatus
} = require('./src/services/workflowService.js');

const app = express();
const PORT = process.env.PORT || 5000;

// Inicialización de persistencia PostgreSQL / Fallback Resiliente (ADR-004)
initDatabase().catch(err => console.error('Error inicializando BD:', err));

app.use(cors());
app.use(express.json());

// Estados válidos según especificación técnica
const VALID_STATUSES = ['NUEVO', 'ASIGNADO', 'EN_PROCESO', 'RESUELTO', 'CERRADO'];
const VALID_PRIORITIES = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];
const VALID_CATEGORIES = ['HARDWARE', 'SOFTWARE', 'NETWORK', 'SECURITY', 'ACCESS'];

// Almacenamiento en memoria resiliente (Mock Data para ejecución autónoma o fallback de BD)
let users = [
  { id: 1, name: 'Mayro Gameros (DevOps Lead)', email: 'mbarriosg8@miumg.edu.gt', role: 'ADMIN', specialty: 'GLOBAL / DEVOPS CI-CD', defaultCategory: '', initials: 'MG', accessCode: 'ADMIN-2026' },
  { id: 2, name: 'Carlos Mendoza (Especialista Redes)', email: 'cmendoza@miumg.edu.gt', role: 'TECHNICIAN', specialty: 'INFRAESTRUCTURA DE RED', defaultCategory: 'NETWORK', initials: 'CM', accessCode: 'TECH-2026' },
  { id: 3, name: 'Sofia Gomez (Analista Seguridad)', email: 'sgomez@miumg.edu.gt', role: 'TECHNICIAN', specialty: 'CIBERSEGURIDAD & VPN', defaultCategory: 'SECURITY', initials: 'SG', accessCode: 'TECH-2026' },
  { id: 4, name: 'Diego Ramirez (Arquitecto BD/SW)', email: 'dramirez@miumg.edu.gt', role: 'TECHNICIAN', specialty: 'SOFTWARE & BASE DE DATOS', defaultCategory: 'SOFTWARE', initials: 'DR', accessCode: 'TECH-2026' },
  { id: 5, name: 'Laura Torres (Soporte Hardware)', email: 'ltorres@miumg.edu.gt', role: 'TECHNICIAN', specialty: 'HARDWARE & EQUIPOS', defaultCategory: 'HARDWARE', initials: 'LT', accessCode: 'TECH-2026' },
  { id: 6, name: 'Andres Morales (Gestión Accesos)', email: 'amorales@miumg.edu.gt', role: 'TECHNICIAN', specialty: 'DIRECTORIO ACTIVO & IAM', defaultCategory: 'ACCESS', initials: 'AM', accessCode: 'TECH-2026' }
];

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
    updated_at: new Date('2026-10-10T09:30:00Z')
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
    updated_at: new Date('2026-10-11T11:00:00Z')
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
    updated_at: new Date('2026-10-11T14:20:00Z')
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
    updated_at: new Date('2026-10-09T16:45:00Z')
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
    updated_at: new Date('2026-10-08T09:30:00Z')
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

// --- ENDPOINTS DE LA API ---

// 1. Healthcheck con Estado de Base de Datos PostgreSQL (ADR-004)
app.get('/api/health', async (req, res) => {
  const dbHealth = await checkDatabaseHealth();
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'IT Incident Hub API',
    alert_recipient: process.env.ALERT_RECIPIENT || 'mbarriosg8@miumg.edu.gt',
    database: dbHealth
  });
});

// 2. Usuarios / Técnicos y Autenticación por Rol
app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/auth/login', (req, res) => {
  const { email, accessCode, userId } = req.body || {};
  let user = null;

  if (userId) {
    user = users.find(u => u.id === Number(userId));
  } else if (email) {
    user = users.find(u => u.email.toLowerCase() === String(email).trim().toLowerCase());
  }

  if (!user) {
    return res.status(401).json({ error: 'Usuario o correo institucional no registrado en IT Incident Hub' });
  }

  // Si se proporciona código de acceso, validamos (o permitimos el código maestro UMG-2026)
  if (accessCode && String(accessCode).trim() !== '' && accessCode !== user.accessCode && accessCode !== 'UMG-2026') {
    return res.status(401).json({ error: `Código de acceso inválido para ${user.email}. Usa ${user.accessCode} o acceso rápido.` });
  }

  res.json({
    authenticated: true,
    user,
    permissions: {
      isAdmin: user.role === 'ADMIN',
      canManagePipeline: user.role === 'ADMIN',
      canConfigureSmtp: user.role === 'ADMIN',
      canAssignAnyTechnician: user.role === 'ADMIN',
      defaultCategoryFilter: user.defaultCategory || ''
    }
  });
});

// 3. Listar Incidentes con Filtros (AB#11)
app.get('/api/incidents', (req, res) => {
  const { status, priority, category, assigned_to_id, search } = req.query;
  let filtered = [...incidents];

  if (status) filtered = filtered.filter(i => i.status.toUpperCase() === status.toUpperCase());
  if (priority) filtered = filtered.filter(i => i.priority.toUpperCase() === priority.toUpperCase());
  if (category) filtered = filtered.filter(i => i.category.toUpperCase() === category.toUpperCase());
  if (assigned_to_id) filtered = filtered.filter(i => String(i.assigned_to_id) === String(assigned_to_id));
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(i => i.title.toLowerCase().includes(s) || i.description.toLowerCase().includes(s));
  }

  const enriched = filtered.map(inc => ({
    ...inc,
    assigned_technician: users.find(u => u.id === inc.assigned_to_id) || null
  }));

  res.json(enriched);
});

// 4. Detalle de Incidente
app.get('/api/incidents/:id', (req, res) => {
  const inc = incidents.find(i => i.id === parseInt(req.params.id));
  if (!inc) return res.status(404).json({ error: 'Incidente no encontrado' });

  const comments = incidentComments.filter(c => c.incident_id === inc.id);
  const logs = incidentLogs.filter(l => l.incident_id === inc.id);
  const assigned_technician = users.find(u => u.id === inc.assigned_to_id) || null;

  res.json({ ...inc, assigned_technician, comments, logs });
});

// 5. Crear Incidente + Disparo Automático de Alerta a mbarriosg8@miumg.edu.gt (AB#8)
app.post('/api/incidents', async (req, res) => {
  const { title, description, category, priority, reported_by } = req.body;

  if (!title || !description || !category || !reported_by) {
    return res.status(400).json({ error: 'Campos obligatorios faltantes (title, description, category, reported_by)' });
  }

  const newIncident = {
    id: incidents.length > 0 ? Math.max(...incidents.map(i => i.id)) + 1 : 1,
    title: String(title).trim(),
    description: String(description).trim(),
    category: VALID_CATEGORIES.includes(category.toUpperCase()) ? category.toUpperCase() : 'SOFTWARE',
    priority: VALID_PRIORITIES.includes(priority ? priority.toUpperCase() : '') ? priority.toUpperCase() : 'MEDIA',
    status: 'NUEVO',
    reported_by: String(reported_by).trim(),
    assigned_to_id: null,
    created_at: new Date(),
    updated_at: new Date()
  };

  incidents.unshift(newIncident);

  incidentLogs.push({
    id: incidentLogs.length + 1,
    incident_id: newIncident.id,
    previous_status: null,
    new_status: 'NUEVO',
    changed_by: newIncident.reported_by,
    change_reason: 'Creación de incidente inicial',
    created_at: new Date()
  });

  const notification = await sendIncidentNotification(newIncident, 'INCIDENT_CREATED');

  res.status(201).json({
    ...newIncident,
    notification_sent: notification
  });
});

// 6. Transicionar Estado o Asignar Técnico + Alerta a mbarriosg8@miumg.edu.gt (AB#15)
app.patch('/api/incidents/:id/status', async (req, res) => {
  const inc = incidents.find(i => i.id === parseInt(req.params.id));
  if (!inc) return res.status(404).json({ error: 'Incidente no encontrado' });

  const { status, assigned_to_id, changed_by, change_reason } = req.body;
  const previous_status = inc.status;

  if (status) {
    const nextStatus = status.toUpperCase();
    if (!VALID_STATUSES.includes(nextStatus)) {
      return res.status(400).json({ error: `Estado no válido. Opciones: ${VALID_STATUSES.join(', ')}` });
    }
    // Validación de reglas de transición de estados (AB#15)
    if (!canTransitionStatus(previous_status, nextStatus)) {
      return res.status(400).json({
        error: `Transición de estado no permitida: no es posible pasar de ${previous_status} a ${nextStatus}`
      });
    }
    inc.status = nextStatus;
  }

  if (assigned_to_id !== undefined) {
    inc.assigned_to_id = assigned_to_id ? parseInt(assigned_to_id) : null;
    if (inc.status === 'NUEVO' && inc.assigned_to_id !== null) {
      inc.status = 'ASIGNADO';
    }
  }

  inc.updated_at = new Date();

  incidentLogs.push({
    id: incidentLogs.length + 1,
    incident_id: inc.id,
    previous_status,
    new_status: inc.status,
    changed_by: changed_by || 'Operador',
    change_reason: change_reason || (assigned_to_id ? `Asignado a técnico #${assigned_to_id}` : 'Actualización de estado'),
    created_at: new Date()
  });

  const notification = await sendIncidentNotification(inc, 'INCIDENT_STATUS_CHANGED');

  res.json({
    ...inc,
    notification_sent: notification
  });
});

// 7. Agregar Comentario
app.post('/api/incidents/:id/comments', (req, res) => {
  const inc = incidents.find(i => i.id === parseInt(req.params.id));
  if (!inc) return res.status(404).json({ error: 'Incidente no encontrado' });

  const { author_name, comment } = req.body;
  if (!author_name || !comment) {
    return res.status(400).json({ error: 'author_name y comment son obligatorios' });
  }

  const newComment = {
    id: incidentComments.length + 1,
    incident_id: inc.id,
    author_name: String(author_name).trim(),
    comment: String(comment).trim(),
    created_at: new Date()
  };

  incidentComments.push(newComment);
  res.status(201).json(newComment);
});

// 8. Métricas del Dashboard y Paneles Gráficos (AB#33, AB#34)
app.get('/api/dashboard/stats', (req, res) => {
  const total = incidents.length;
  const abiertos = incidents.filter(i => ['NUEVO', 'ASIGNADO', 'EN_PROCESO'].includes(i.status)).length;
  const cerrados = incidents.filter(i => ['RESUELTO', 'CERRADO'].includes(i.status)).length;
  const criticos = incidents.filter(i => i.priority === 'CRITICA' && i.status !== 'CERRADO').length;

  const porEstado = VALID_STATUSES.map(st => ({
    estado: st,
    total: incidents.filter(i => i.status === st).length
  }));

  const porPrioridad = VALID_PRIORITIES.map(pr => ({
    prioridad: pr,
    total: incidents.filter(i => i.priority === pr).length,
    activos: incidents.filter(i => i.priority === pr && i.status !== 'CERRADO').length
  }));

  const porCategoria = VALID_CATEGORIES.map(cat => ({
    categoria: cat,
    total: incidents.filter(i => i.category === cat).length
  }));

  const porTecnico = users.map(user => {
    const asignadosActivos = incidents.filter(i => i.assigned_to_id === user.id && !['RESUELTO', 'CERRADO'].includes(i.status)).length;
    const resueltos = incidents.filter(i => i.assigned_to_id === user.id && ['RESUELTO', 'CERRADO'].includes(i.status)).length;
    return {
      id: user.id,
      nombre: user.name,
      initials: user.initials || 'IT',
      specialty: user.specialty || user.role,
      role: user.role,
      asignados: incidents.filter(i => i.assigned_to_id === user.id && i.status !== 'CERRADO').length,
      activos: asignadosActivos,
      resueltos,
      total: asignadosActivos + resueltos
    };
  });

  res.json({ total, abiertos, cerrados, criticos, porEstado, porPrioridad, porCategoria, porTecnico });
});

// 9. Bandeja y Estado de Notificaciones por Correo (mbarriosg8@miumg.edu.gt)
app.get('/api/notifications', (req, res) => {
  res.json(getNotifications());
});

// 10. Disparar Alerta de Prueba a mbarriosg8@miumg.edu.gt
app.post('/api/notifications/test', async (req, res) => {
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
});

// 11. Actualizar Configuración SMTP en Caliente (Opcional)
app.post('/api/notifications/config', (req, res) => {
  const updated = updateSmtpConfig(req.body || {});
  res.json(updated);
});

// 12. Estado de Azure DevOps Pipelines, Agente Self-Hosted y Git
app.get('/api/azure/status', async (req, res) => {
  const status = await getAzureStatus();
  res.json(status);
});

// 13. Simular Fallo Controlado en Pipeline (ROJO ❌) + Alerta a Gmail UMG (AB#22, AB#24)
app.post('/api/azure/simulate-failure', async (req, res) => {
  const build = simulatePipelineFailure(req.body?.reason || 'Simulación de Fallo Controlado en Pipeline CI (ERR_ASSERTION: 1 !== -1)');
  const emailRecord = await sendPipelineNotification(build);
  res.status(201).json({
    build,
    notification_sent: emailRecord
  });
});

// 14. Disparar Solución / Verificación de Pipeline en Azure (VERDE ✅) + Notificación por Correo
app.post('/api/azure/sync', async (req, res) => {
  const build = triggerPipelineVerification(req.body?.reason || 'Solución Aplicada y Restauración de Pipeline CI/CD a Verde');
  const emailRecord = await sendPipelineNotification(build);
  res.status(201).json({
    build,
    notification_sent: emailRecord
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 IT Incident Hub API escuchando en el puerto ${PORT} | Alertas: ${process.env.ALERT_RECIPIENT || 'mbarriosg8@miumg.edu.gt'}`);
  });
}

module.exports = app;
