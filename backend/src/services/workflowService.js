// Servicio de Máquina de Estados Finita y Cálculo O(n) de Indicadores (AB#15, AB#33, AB#34)
const {
  VALID_STATUSES,
  VALID_PRIORITIES,
  VALID_CATEGORIES
} = require('../validators/incidentValidator');

/**
 * Matriz explícita de transiciones permitidas en el ciclo de vida ITIL (5 estados)
 * - NUEVO no puede saltar directo a CERRADO ni RESUELTO sin pasar por atención.
 * - CERRADO es un estado terminal inmutable (no permite reapertura a ningún estado).
 */
const ALLOWED_TRANSITIONS = Object.freeze({
  NUEVO: ['ASIGNADO', 'EN_PROCESO'],
  ASIGNADO: ['EN_PROCESO', 'RESUELTO', 'NUEVO'],
  EN_PROCESO: ['RESUELTO', 'ASIGNADO'],
  RESUELTO: ['CERRADO', 'EN_PROCESO'],
  CERRADO: []
});

function canTransitionStatus(currentStatus, nextStatus) {
  if (typeof currentStatus !== 'string' || typeof nextStatus !== 'string') return false;
  const from = currentStatus.trim().toUpperCase();
  const to = nextStatus.trim().toUpperCase();
  if (!VALID_STATUSES.includes(from) || !VALID_STATUSES.includes(to)) return false;
  const allowed = ALLOWED_TRANSITIONS[from] || [];
  return allowed.includes(to);
}

/**
 * Calcula todas las métricas del Dashboard en una sola pasada O(n) sobre la colección de incidentes
 */
function computeDashboardMetrics(incidents = [], users = []) {
  const OPEN_SET = new Set(['NUEVO', 'ASIGNADO', 'EN_PROCESO']);
  const CLOSED_SET = new Set(['RESUELTO', 'CERRADO']);

  const statusCounts = Object.fromEntries(VALID_STATUSES.map(st => [st, 0]));
  const priorityTotals = Object.fromEntries(VALID_PRIORITIES.map(pr => [pr, 0]));
  const priorityActives = Object.fromEntries(VALID_PRIORITIES.map(pr => [pr, 0]));
  const categoryCounts = Object.fromEntries(VALID_CATEGORIES.map(cat => [cat, 0]));
  const techMap = new Map(
    users.map(u => [
      u.id,
      { asignados: 0, activos: 0, resueltos: 0 }
    ])
  );

  let abiertos = 0;
  let cerrados = 0;
  let criticos = 0;
  let totalResolutionMs = 0;
  let resolvedCount = 0;

  for (const inc of incidents) {
    const st = inc.status;
    const pr = inc.priority;
    const cat = inc.category;

    if (st in statusCounts) statusCounts[st] += 1;
    if (pr in priorityTotals) {
      priorityTotals[pr] += 1;
      if (st !== 'CERRADO') priorityActives[pr] += 1;
    }
    if (cat in categoryCounts) categoryCounts[cat] += 1;

    if (OPEN_SET.has(st)) abiertos += 1;
    if (CLOSED_SET.has(st)) cerrados += 1;
    if (pr === 'CRITICA' && st !== 'CERRADO') criticos += 1;

    if (CLOSED_SET.has(st) && inc.created_at) {
      const endTs = new Date(inc.resolved_at || inc.closed_at || inc.updated_at || inc.created_at).getTime();
      const startTs = new Date(inc.created_at).getTime();
      if (endTs >= startTs) {
        totalResolutionMs += endTs - startTs;
        resolvedCount += 1;
      }
    }

    if (inc.assigned_to_id && techMap.has(inc.assigned_to_id)) {
      const t = techMap.get(inc.assigned_to_id);
      if (st !== 'CERRADO') t.asignados += 1;
      if (CLOSED_SET.has(st)) {
        t.resueltos += 1;
      } else {
        t.activos += 1;
      }
    }
  }

  const porEstado = VALID_STATUSES.map(estado => ({
    estado,
    total: statusCounts[estado] || 0
  }));

  const porPrioridad = VALID_PRIORITIES.map(prioridad => ({
    prioridad,
    total: priorityTotals[prioridad] || 0,
    activos: priorityActives[prioridad] || 0
  }));

  const porCategoria = VALID_CATEGORIES.map(categoria => ({
    categoria,
    total: categoryCounts[categoria] || 0
  }));

  const porTecnico = users.map(user => {
    const stats = techMap.get(user.id) || { asignados: 0, activos: 0, resueltos: 0 };
    return {
      id: user.id,
      nombre: user.name,
      initials: user.initials || 'IT',
      specialty: user.specialty || user.role,
      role: user.role,
      asignados: stats.asignados,
      activos: stats.activos,
      resueltos: stats.resueltos,
      total: stats.activos + stats.resueltos
    };
  });

  const mttrHours = resolvedCount > 0
    ? Number((totalResolutionMs / resolvedCount / (1000 * 60 * 60)).toFixed(2))
    : 0;

  return {
    total: incidents.length,
    abiertos,
    cerrados,
    criticos,
    mttrHours,
    porEstado,
    porPrioridad,
    porCategoria,
    porTecnico
  };
}

module.exports = {
  ALLOWED_TRANSITIONS,
  canTransitionStatus,
  computeDashboardMetrics
};
