// Utilidades compartidas por los scripts de Altera Demos (Node 18+, sin dependencias).
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

// ---------- .env ----------
export function loadEnv() {
  const env = {};
  const file = join(ROOT, '.env');
  if (existsSync(file)) {
    for (const raw of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if (/^(['"]).*\1$/.test(val)) val = val.slice(1, -1);
      env[key] = val;
    }
  }
  // Las variables reales del sistema tienen prioridad sobre el archivo
  for (const k of Object.keys(env)) if (process.env[k]) env[k] = process.env[k];
  return env;
}

// ---------- Hash de texto (idéntico a shared/altera-voice.js) ----------
export function normalize(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

export function hash(text) {
  const bytes = new TextEncoder().encode(normalize(text));
  let h = 0x811c9dc5;
  for (const b of bytes) {
    h ^= b;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

// ---------- Demos ----------
const NOT_DEMOS = new Set(['shared', 'scripts', 'nichos', 'docs', 'node_modules']);

export function listDemos() {
  return readdirSync(ROOT)
    .filter(d => !d.startsWith('.') && !NOT_DEMOS.has(d))
    .filter(d => statSync(join(ROOT, d)).isDirectory() && existsSync(join(ROOT, d, 'index.html')));
}

export function resolveDemos(arg) {
  const all = listDemos();
  if (!arg || arg === 'all') return all;
  const wanted = arg.split(',').map(s => s.trim()).filter(Boolean);
  const unknown = wanted.filter(d => !all.includes(d));
  if (unknown.length) throw new Error(`Demo(s) desconocida(s): ${unknown.join(', ')}. Disponibles: ${all.join(', ')}`);
  return wanted;
}

// Prefijo de variable de entorno de una demo: "pizzeria-angela" -> "PIZZERIA_ANGELA"
export function envPrefix(demo) {
  return demo.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
}

// ---------- Extracción heurística de frases locutables ----------
// Busca literales de texto en los <script> asignados a claves típicas de diálogo
// (text:, ai:, texto1 =, demoText =, respuesta =, 'carne': ...). El resultado se
// guarda en <demo>/audio/textos.json para revisarlo antes de gastar créditos.
const LITERAL = /(?<key>\b(?:text|ai|texto\d*|demoText|respuesta\w*|frasePrueba)\b|['"][\w-]+['"])\s*[:=]\s*(?<q>["'`])(?<s>(?:\\.|(?!\k<q>).)*)\k<q>/gs;
const CLIENT_KEYS = /^(texto2|texto4)$/;
const CLIENT_SPEAKERS = /speaker:\s*["'](paciente|cliente|client|user|patient|usuario)["']/i;

export function extractTexts(html) {
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
    .filter(m => !/\bsrc=/.test(m[0].slice(0, m[0].indexOf('>'))))
    .map(m => m[1])
    .join('\n');
  const out = [];
  const seen = new Set();
  for (const m of scripts.matchAll(LITERAL)) {
    const text = m.groups.s.replace(/\\(["'`\\])/g, '$1');
    if (text.length < 20 || /[<>]|\$\{|\\n|rgba|px\b/.test(text)) continue;
    if (!/[a-záéíóúñ]{2,} [a-záéíóúñ]{2,}/i.test(text)) continue;
    const before = scripts.slice(Math.max(0, m.index - 160), m.index);
    const after = scripts.slice(m.index + m[0].length, m.index + m[0].length + 40);
    if (/sender:\s*["'][^"']*["']\s*,?\s*$/.test(before)) continue; // mensajes de chat escritos
    if (/^\s*,\s*next\s*:/.test(after)) continue;                    // opciones de botón no locutadas
    const lastSpeaker = before.match(/speaker:\s*["'][^"']+["'][^{}]*$/);
    const role = CLIENT_KEYS.test(m.groups.key) || (lastSpeaker && CLIENT_SPEAKERS.test(lastSpeaker[0]))
      ? 'client' : 'agent';
    const key = normalize(text);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ text: key, role });
  }
  return out;
}
