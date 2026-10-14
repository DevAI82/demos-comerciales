#!/usr/bin/env node
// Servidor local para trabajar con las demos usando las claves del .env.
//
//   node scripts/dev-server.mjs        → http://localhost:5173/
//
// shared/altera-voice.js pide /__dev/config.json (solo en localhost) y copia las
// claves a localStorage, así la voz ElevenLabs y el radar de Idealista funcionan
// en vivo sin escribir ninguna clave en el HTML.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, normalize as normPath, extname } from 'node:path';
import { ROOT, loadEnv, listDemos, envPrefix } from './lib/common.mjs';

const env = loadEnv();
const port = Number(env.DEV_PORT || 5173);

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.pdf': 'application/pdf', '.ico': 'image/x-icon', '.md': 'text/plain; charset=utf-8'
};

// Claves de localStorage que ya leen las demos
const LOCAL_VOICE_KEYS = {
  sonrisastar: 'elevenlabs_voice_id_dental', motos: 'elevenlabs_voice_id_motorgas', ruautos: 'elevenlabs_voice_id_ruautos',
  salon224: 'elevenlabs_voice_id_salon', realestate: 'elevenlabs_voice_id_realestate', 'adela-fisio': 'elevenlabs_voice_id_fisio'
};

function devConfig() {
  const ls = {
    elevenlabs_api_key: env.ELEVENLABS_API_KEY || '',
    rapidapi_key: env.RAPIDAPI_KEY || '',
    rapidapi_host: env.RAPIDAPI_IDEALISTA_HOST || ''
  };
  for (const demo of listDemos()) {
    const key = LOCAL_VOICE_KEYS[demo];
    const voice = env[`ELEVENLABS_VOICE_${envPrefix(demo)}_AGENT`];
    if (key && voice) ls[key] = voice;
  }
  return { localStorage: ls };
}

createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  if (url.pathname === '/__dev/config.json') {
    res.writeHead(200, { 'Content-Type': TYPES['.json'], 'Cache-Control': 'no-store' });
    return res.end(JSON.stringify(devConfig()));
  }
  // Mismo layout que GitHub Pages: /demos-comerciales/... también funciona
  let path = decodeURIComponent(url.pathname).replace(/^\/demos-comerciales(?=\/|$)/, '') || '/';
  let file = normPath(join(ROOT, path));
  if (!file.startsWith(ROOT) || /[\\/]\.env/.test(file)) {
    res.writeHead(403); return res.end('Prohibido');
  }
  if (existsSync(file) && statSync(file).isDirectory()) {
    if (!path.endsWith('/')) { res.writeHead(301, { Location: url.pathname + '/' + url.search }); return res.end(); }
    file = join(file, 'index.html');
  }
  if (!existsSync(file)) { res.writeHead(404); return res.end('No encontrado'); }
  res.writeHead(200, { 'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
  res.end(readFileSync(file));
}).listen(port, () => {
  const ok = k => (env[k] ? '✓' : '✗ (vacía)');
  console.log(`\n  Altera Demos en http://localhost:${port}/\n`);
  console.log(`  ELEVENLABS_API_KEY ${ok('ELEVENLABS_API_KEY')}   RAPIDAPI_KEY ${ok('RAPIDAPI_KEY')}`);
  console.log(`  Demos: ${listDemos().map(d => `/${d}/`).join('  ')}\n`);
});
