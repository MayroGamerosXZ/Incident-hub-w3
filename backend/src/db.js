const { Pool } = require('pg');
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

// Configuración del Pool PostgreSQL usando variables de entorno seguras (Regla 9: Cero secretos en repo)
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'incident_hub_db',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

let postgresActive = false;
let lastDbError = null;

async function checkDatabaseHealth() {
  if (process.env.NODE_ENV === 'test' && !process.env.TEST_USE_POSTGRES) {
    postgresActive = false;
    return {
      connected: false,
      engine: 'In-Memory Resilient Store (ADR-004 Test Mode)',
      host: `${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}`,
      database: process.env.DB_NAME || 'incident_hub_db',
      reason: 'Ejecución aislada de pruebas automatizadas'
    };
  }

  try {
    const res = await pool.query('SELECT NOW() AS current_time');
    postgresActive = true;
    lastDbError = null;
    return {
      connected: true,
      engine: 'PostgreSQL 16 (Active Persistence)',
      host: `${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}`,
      database: process.env.DB_NAME || 'incident_hub_db',
      timestamp: res.rows[0].current_time
    };
  } catch (err) {
    postgresActive = false;
    lastDbError = err.message;
    return {
      connected: false,
      engine: 'In-Memory Resilient Store (ADR-004 Fallback)',
      host: `${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}`,
      database: process.env.DB_NAME || 'incident_hub_db',
      reason: err.message
    };
  }
}

async function initDatabase(seedUsers = [], seedIncidents = []) {
  const health = await checkDatabaseHealth();
  if (!health.connected) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`ℹ️ [DATABASE]: PostgreSQL no disponible en ${health.host}. Activando motor de persistencia resiliente en memoria (ADR-004).`);
    }
    return health;
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(120) UNIQUE NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'TECHNICIAN',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS incidents (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        priority VARCHAR(20) NOT NULL DEFAULT 'MEDIA',
        status VARCHAR(30) NOT NULL DEFAULT 'NUEVO',
        reported_by VARCHAR(100) NOT NULL,
        assigned_to_id INT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP WITH TIME ZONE,
        closed_at TIMESTAMP WITH TIME ZONE
      );

      CREATE TABLE IF NOT EXISTS incident_logs (
        id SERIAL PRIMARY KEY,
        incident_id INT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
        previous_status VARCHAR(30),
        new_status VARCHAR(30) NOT NULL,
        changed_by VARCHAR(100) NOT NULL,
        change_reason VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS incident_comments (
        id SERIAL PRIMARY KEY,
        incident_id INT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
        author_name VARCHAR(100) NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
      CREATE INDEX IF NOT EXISTS idx_incidents_priority ON incidents(priority);
      CREATE INDEX IF NOT EXISTS idx_incidents_category ON incidents(category);
      CREATE INDEX IF NOT EXISTS idx_incidents_assigned_to ON incidents(assigned_to_id);
    `);

    for (const u of seedUsers) {
      await pool.query(
        `INSERT INTO users (id, name, email, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO NOTHING`,
        [u.id, u.name, u.email, u.role]
      );
    }

    const { rows: countRows } = await pool.query('SELECT COUNT(*)::int AS total FROM incidents');
    if (countRows[0].total === 0 && seedIncidents.length > 0) {
      for (const inc of seedIncidents) {
        await pool.query(
          `INSERT INTO incidents (title, description, category, priority, status, reported_by, assigned_to_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            inc.title,
            inc.description,
            inc.category,
            inc.priority,
            inc.status,
            inc.reported_by,
            inc.assigned_to_id,
            inc.created_at,
            inc.updated_at
          ]
        );
      }
    }

    console.log(`✅ [DATABASE]: Conexión exitosa a PostgreSQL en ${health.host}/${health.database}. Esquema DDL y persistencia SQL activos.`);
    return health;
  } catch (err) {
    console.error(`⚠️ [DATABASE]: Error inicializando esquema en PostgreSQL: ${err.message}. Pasando a fallback.`);
    postgresActive = false;
    return { connected: false, engine: 'In-Memory Resilient Store', reason: err.message };
  }
}

/**
 * Operaciones CRUD parametrizadas en PostgreSQL (prevención de SQL Injection con $1, $2...)
 */
async function dbListIncidents() {
  const { rows } = await pool.query('SELECT * FROM incidents ORDER BY created_at DESC, id DESC');
  return rows;
}

async function dbGetIncidentById(id) {
  const { rows } = await pool.query('SELECT * FROM incidents WHERE id = $1', [id]);
  if (rows.length === 0) return null;
  const incident = rows[0];
  const [commentsRes, logsRes] = await Promise.all([
    pool.query('SELECT * FROM incident_comments WHERE incident_id = $1 ORDER BY created_at ASC', [id]),
    pool.query('SELECT * FROM incident_logs WHERE incident_id = $1 ORDER BY created_at ASC', [id])
  ]);
  return {
    ...incident,
    comments: commentsRes.rows,
    logs: logsRes.rows
  };
}

async function dbCreateIncident({ title, description, category, priority, reported_by }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [created] } = await client.query(
      `INSERT INTO incidents (title, description, category, priority, status, reported_by)
       VALUES ($1, $2, $3, $4, 'NUEVO', $5)
       RETURNING *`,
      [title, description, category, priority, reported_by]
    );
    await client.query(
      `INSERT INTO incident_logs (incident_id, previous_status, new_status, changed_by, change_reason)
       VALUES ($1, NULL, 'NUEVO', $2, 'Creación de incidente inicial')`,
      [created.id, reported_by]
    );
    await client.query('COMMIT');
    return created;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function dbUpdateIncidentStatus(id, { previous_status, new_status, assigned_to_id, changed_by, change_reason, resolved_at, closed_at }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [updated] } = await client.query(
      `UPDATE incidents
          SET status = $1,
              assigned_to_id = $2,
              updated_at = CURRENT_TIMESTAMP,
              resolved_at = COALESCE($3, resolved_at),
              closed_at = COALESCE($4, closed_at)
        WHERE id = $5
        RETURNING *`,
      [new_status, assigned_to_id, resolved_at, closed_at, id]
    );
    await client.query(
      `INSERT INTO incident_logs (incident_id, previous_status, new_status, changed_by, change_reason)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, previous_status, new_status, changed_by, change_reason]
    );
    await client.query('COMMIT');
    return updated;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function dbAddComment(incidentId, { author_name, comment }) {
  const { rows: [created] } = await pool.query(
    `INSERT INTO incident_comments (incident_id, author_name, comment)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [incidentId, author_name, comment]
  );
  return created;
}

function isPostgresActive() {
  return postgresActive;
}

module.exports = {
  pool,
  checkDatabaseHealth,
  initDatabase,
  isPostgresActive,
  dbListIncidents,
  dbGetIncidentById,
  dbCreateIncident,
  dbUpdateIncidentStatus,
  dbAddComment
};
