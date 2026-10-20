const { Pool } = require('pg');
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

// Configuración del Pool PostgreSQL usando variables de entorno seguras (Regla 9: Cero secretos en repo)
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'incident_hub_db',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

let postgresActive = false;
let lastDbError = null;

async function checkDatabaseHealth() {
  try {
    const res = await pool.query('SELECT NOW() AS current_time');
    postgresActive = true;
    lastDbError = null;
    return {
      connected: true,
      engine: 'PostgreSQL 16',
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

async function initDatabase() {
  const health = await checkDatabaseHealth();
  if (!health.connected) {
    console.log(`ℹ️ [DATABASE]: PostgreSQL no disponible en ${health.host}. Activando motor de persistencia resiliente en memoria (ADR-004).`);
    return health;
  }

  try {
    // 1. Tabla de Usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(120) UNIQUE NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'TECHNICIAN',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Tabla de Incidentes
    await pool.query(`
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
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Bitácora de Auditoría
    await pool.query(`
      CREATE TABLE IF NOT EXISTS incident_logs (
        id SERIAL PRIMARY KEY,
        incident_id INT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
        previous_status VARCHAR(30),
        new_status VARCHAR(30) NOT NULL,
        changed_by VARCHAR(100) NOT NULL,
        change_reason VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Comentarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS incident_comments (
        id SERIAL PRIMARY KEY,
        incident_id INT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
        author_name VARCHAR(100) NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log(`✅ [DATABASE]: Conexión exitosa a PostgreSQL en ${health.host}/${health.database}. Esquema DDL inicializado.`);
    return health;
  } catch (err) {
    console.error(`⚠️ [DATABASE]: Error inicializando esquema en PostgreSQL: ${err.message}. Pasando a fallback.`);
    postgresActive = false;
    return { connected: false, engine: 'In-Memory Resilient Store', reason: err.message };
  }
}

function isPostgresActive() {
  return postgresActive;
}

module.exports = {
  pool,
  checkDatabaseHealth,
  initDatabase,
  isPostgresActive
};
