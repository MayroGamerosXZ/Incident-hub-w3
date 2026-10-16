/**
 * Orquestador Nativo de Desarrollo - IT Incident Hub v1.0.0
 * Ejecuta concurrentemente el Backend API (Express :5000) y el Frontend SPA (Vite :5173)
 * Uso: npm run dev
 */
const { spawn } = require('node:child_process');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${COLORS.cyan}======================================================================${COLORS.reset}`);
console.log(`${COLORS.bold}${COLORS.red}  IT INCIDENT HUB v1.0.0${COLORS.reset} - ${COLORS.bold}ORQUESTADOR UNIFICADO (npm run dev)${COLORS.reset}`);
console.log(`${COLORS.cyan}  Líder DevOps:${COLORS.reset} Mayro Gameros (@MayroGamerosXZ)`);
console.log(`${COLORS.cyan}  Correo Alertas:${COLORS.reset} ${COLORS.green}mbarriosg8@miumg.edu.gt${COLORS.reset}`);
console.log(`${COLORS.cyan}  Azure DevOps:${COLORS.reset}   DevOps-UMG-Mayro / incident-hub (AB#4 - AB#34)`);
console.log(`${COLORS.cyan}======================================================================${COLORS.reset}\n`);

function prefixStream(stream, prefix, color, target) {
  let buffer = '';
  stream.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop();
    for (const line of lines) {
      if (line.trim().length > 0) {
        target.write(`${color}${prefix}${COLORS.reset} ${line}\n`);
      }
    }
  });
  stream.on('end', () => {
    if (buffer.trim().length > 0) {
      target.write(`${color}${prefix}${COLORS.reset} ${buffer}\n`);
    }
  });
}

// 1. Iniciar Backend API (Puerto 5000)
const backendProc = spawn(process.execPath, ['server.js'], {
  cwd: BACKEND_DIR,
  env: { ...process.env, FORCE_COLOR: '1' },
  stdio: ['ignore', 'pipe', 'pipe']
});

prefixStream(backendProc.stdout, '[BACKEND :5000]', COLORS.red, process.stdout);
prefixStream(backendProc.stderr, '[BACKEND ERR]', COLORS.yellow, process.stderr);

// 2. Iniciar Frontend SPA con Vite (Puerto 5173)
const viteBin = path.join(FRONTEND_DIR, 'node_modules', 'vite', 'bin', 'vite.js');
const frontendProc = spawn(process.execPath, [viteBin, '--port', '5173'], {
  cwd: FRONTEND_DIR,
  env: { ...process.env, FORCE_COLOR: '1' },
  stdio: ['ignore', 'pipe', 'pipe']
});

prefixStream(frontendProc.stdout, '[FRONTEND :5173]', COLORS.cyan, process.stdout);
prefixStream(frontendProc.stderr, '[FRONTEND ERR]', COLORS.yellow, process.stderr);

// Manejo limpio de cierre con Ctrl+C
function shutdown() {
  console.log(`\n${COLORS.yellow}[ORQUESTADOR] Deteniendo servicios de IT Incident Hub...${COLORS.reset}`);
  if (!backendProc.killed) backendProc.kill('SIGTERM');
  if (!frontendProc.killed) frontendProc.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

backendProc.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`${COLORS.red}[BACKEND] Finalizó con código ${code}${COLORS.reset}`);
  }
});

frontendProc.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`${COLORS.cyan}[FRONTEND] Finalizó con código ${code}${COLORS.reset}`);
  }
});
