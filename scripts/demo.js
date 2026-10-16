/**
 * Panel Interactivo de Verificación y Defensa - IT Incident Hub v1.0.0
 * Uso: npm run demo
 */
const readline = require('node:readline');
const { spawnSync, spawn } = require('node:child_process');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function showMenu() {
  console.clear();
  console.log(`${C.cyan}======================================================================${C.reset}`);
  console.log(`${C.bold}${C.red}       IT INCIDENT HUB v1.0.0 - PANEL DE DEFENSA (npm run demo)       ${C.reset}`);
  console.log(`${C.green}       Líder DevOps: Mayro Gameros (@MayroGamerosXZ)                  ${C.reset}`);
  console.log(`${C.cyan}       Alertas Correo: mbarriosg8@miumg.edu.gt | Azure: AB#4 - AB#34  ${C.reset}`);
  console.log(`${C.cyan}======================================================================${C.reset}\n`);
  console.log(`  [1] Ejecutar Pruebas Automatizadas Unitarias (npm test)`);
  console.log(`  [2] Iniciar Sistema Completo Unificado (npm run dev -> :5000 + :5173)`);
  console.log(`  [3] Ejecutar Auditoría de Seguridad (npm run audit)`);
  console.log(`  [4] Compilar Frontend a Producción (npm run build)`);
  console.log(`  [5] Verificar Estado de Git y Remotos (w1, w2, w3, azdo)`);
  console.log(`  [6] Salir\n`);
  console.log(`${C.cyan}======================================================================${C.reset}`);

  rl.question('\nSeleccione una opción [1-6]: ', (ans) => {
    handleChoice(ans.trim());
  });
}

function pause() {
  rl.question(`\n${C.yellow}Presione Enter para volver al menú...${C.reset}`, () => {
    showMenu();
  });
}

function handleChoice(choice) {
  switch (choice) {
    case '1':
      console.log(`\n${C.green}--- EJECUTANDO SUITE DE PRUEBAS UNITARIAS (AB#24) ---${C.reset}\n`);
      spawnSync(process.execPath, ['--test', 'tests/api.test.js'], { cwd: ROOT_DIR, stdio: 'inherit' });
      pause();
      break;
    case '2':
      console.log(`\n${C.green}--- INICIANDO ORQUESTADOR npm run dev (Presione Ctrl+C para detener) ---${C.reset}\n`);
      rl.close();
      spawn(process.execPath, [path.join(__dirname, 'dev.js')], { cwd: ROOT_DIR, stdio: 'inherit' });
      break;
    case '3':
      console.log(`\n${C.green}--- AUDITORÍA DE SEGURIDAD NPM (AB#27) ---${C.reset}\n`);
      spawnSync('npm', ['--prefix', 'backend', 'audit'], { cwd: ROOT_DIR, stdio: 'inherit', shell: true });
      pause();
      break;
    case '4':
      console.log(`\n${C.green}--- COMPILANDO FRONTEND DE PRODUCCIÓN ---${C.reset}\n`);
      spawnSync('npm', ['--prefix', 'frontend', 'run', 'build'], { cwd: ROOT_DIR, stdio: 'inherit', shell: true });
      pause();
      break;
    case '5':
      console.log(`\n${C.green}--- ESTADO DE GIT Y REMOTOS ---${C.reset}\n`);
      spawnSync('git', ['status', '-s'], { cwd: ROOT_DIR, stdio: 'inherit' });
      console.log('');
      spawnSync('git', ['remote', '-v'], { cwd: ROOT_DIR, stdio: 'inherit' });
      pause();
      break;
    case '6':
      rl.close();
      process.exit(0);
      break;
    default:
      showMenu();
      break;
  }
}

showMenu();
