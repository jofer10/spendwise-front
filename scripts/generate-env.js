// Simple script to read .env and generate src/assets/env.js with window.__env
// Only exposes non-sensitive, explicitly whitelisted variables.

const fs = require('fs');
const path = require('path');

const projectRoot = __dirname ? path.resolve(__dirname, '..') : process.cwd();
const envPath = path.join(projectRoot, '.env');
const assetsDir = path.join(projectRoot, 'src', 'assets');
const outputPath = path.join(assetsDir, 'env.js');

const ALLOWED_KEYS = ['API_BASE_URL', 'APP_NAME', 'APP_ENV'];

function parseEnvFile(content) {
  const result = {};

  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }

    if (ALLOWED_KEYS.includes(key)) {
      result[key] = value;
    }
  });

  return result;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function main() {
  if (!fs.existsSync(envPath)) {
    console.warn('.env no encontrado, se generará env.js vacío.');
  }

  const raw = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  const parsed = parseEnvFile(raw);

  ensureDir(assetsDir);

  const defaults = {
    API_BASE_URL: '',
    APP_NAME: 'SpendWise',
    APP_ENV: 'development',
  };

  const windowEnv = {};
  ALLOWED_KEYS.forEach((key) => {
    windowEnv[key] = parsed[key] !== undefined ? parsed[key] : (defaults[key] ?? '');
  });

  const fileContent = `// Archivo generado automáticamente por npm run env:generate
// No editar a mano.
window.__env = ${JSON.stringify(windowEnv, null, 2)};
`;

  fs.writeFileSync(outputPath, fileContent, 'utf8');
  console.log(`Generado ${path.relative(projectRoot, outputPath)}`);
}

main();

