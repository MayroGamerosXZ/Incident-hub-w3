// Validadores de Entrada Tipados y Sanitización de Filtros (AB#8, AB#11, AB#15)
const VALID_STATUSES = ['NUEVO', 'ASIGNADO', 'EN_PROCESO', 'RESUELTO', 'CERRADO'];
const VALID_PRIORITIES = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];
const VALID_CATEGORIES = ['HARDWARE', 'SOFTWARE', 'NETWORK', 'SECURITY', 'ACCESS'];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isBoundedString(val, min, max) {
  if (typeof val !== 'string') return false;
  const len = val.trim().length;
  return len >= min && len <= max;
}

function validateCreateIncident(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { valid: false, errors: ['Payload invalido'] };
  }

  if (!isBoundedString(payload.title, 5, 200)) {
    errors.push('El titulo es obligatorio y debe contener entre 5 y 200 caracteres');
  }

  if (!isBoundedString(payload.description, 10, 5000)) {
    errors.push('La descripcion es obligatoria y debe detallar el incidente (10-5000 caracteres)');
  }

  if (typeof payload.category !== 'string' || !VALID_CATEGORIES.includes(payload.category.trim().toUpperCase())) {
    errors.push('Categoria invalida. Valores permitidos: ' + VALID_CATEGORIES.join(', '));
  }

  if (payload.priority !== undefined && payload.priority !== null && payload.priority !== '') {
    if (typeof payload.priority !== 'string' || !VALID_PRIORITIES.includes(payload.priority.trim().toUpperCase())) {
      errors.push('Prioridad invalida. Valores permitidos: ' + VALID_PRIORITIES.join(', '));
    }
  }

  if (
    typeof payload.reported_by !== 'string' ||
    payload.reported_by.trim().length > 100 ||
    !EMAIL_REGEX.test(payload.reported_by.trim())
  ) {
    errors.push('Debe indicar un correo valido en reported_by');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateStatusUpdate(payload, users = []) {
  const errors = [];
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { valid: false, errors: ['Payload invalido'] };
  }

  if (payload.status !== undefined && payload.status !== null && payload.status !== '') {
    if (typeof payload.status !== 'string') {
      errors.push('El campo status debe ser una cadena de texto');
    } else if (!VALID_STATUSES.includes(payload.status.trim().toUpperCase())) {
      errors.push(`Estado no válido. Opciones: ${VALID_STATUSES.join(', ')}`);
    }
  }

  if (payload.assigned_to_id !== undefined && payload.assigned_to_id !== null && payload.assigned_to_id !== '') {
    const parsedId = Number(payload.assigned_to_id);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      errors.push('assigned_to_id debe ser un identificador numérico válido');
    } else if (users.length > 0 && !users.some(u => u.id === parsedId)) {
      errors.push(`El técnico con id ${parsedId} no existe en el sistema`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function asSingleString(val) {
  if (Array.isArray(val)) return String(val[0] ?? '');
  if (typeof val === 'string') return val;
  if (val === undefined || val === null) return '';
  return String(val);
}

function filterIncidentsList(incidents, query = {}) {
  let result = [...incidents];
  const status = asSingleString(query.status).trim().toUpperCase();
  const priority = asSingleString(query.priority).trim().toUpperCase();
  const category = asSingleString(query.category).trim().toUpperCase();
  const assignedToId = asSingleString(query.assigned_to_id).trim();
  const search = asSingleString(query.search).trim().toLowerCase();

  if (status) {
    result = result.filter(i => String(i.status).toUpperCase() === status);
  }
  if (priority) {
    result = result.filter(i => String(i.priority).toUpperCase() === priority);
  }
  if (category) {
    result = result.filter(i => String(i.category).toUpperCase() === category);
  }
  if (assignedToId) {
    result = result.filter(i => String(i.assigned_to_id) === assignedToId);
  }
  if (search) {
    result = result.filter(i =>
      String(i.title || '').toLowerCase().includes(search) ||
      String(i.description || '').toLowerCase().includes(search) ||
      String(i.reported_by || '').toLowerCase().includes(search)
    );
  }
  return result;
}

module.exports = {
  VALID_STATUSES,
  VALID_PRIORITIES,
  VALID_CATEGORIES,
  validateCreateIncident,
  validateStatusUpdate,
  filterIncidentsList
};
