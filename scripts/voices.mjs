#!/usr/bin/env node
// Genera los audios MP3 de ElevenLabs que usan las demos públicas.
//
//   node scripts/voices.mjs extract  <demo|all>          → crea/actualiza <demo>/audio/textos.json
//   node scripts/voices.mjs generate <demo|all> [--force] → llama a ElevenLabs y guarda <demo>/audio/*.mp3
//   node scripts/voices.mjs status   [demo|all]           → frases, caracteres y audios pendientes
//
// La API key se lee de .env (ELEVENLABS_API_KEY) y nunca se publica: en la web
// solo se suben los MP3 y audio/manifest.json.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, loadEnv, hash, normalize, resolveDemos, envPrefix, extractTexts } from './lib/common.mjs';

const [, , command = 'status', target = 'all', ...flags] = process.argv;
const force = flags.includes('--force');
const env = loadEnv();

const audioDir = demo => join(ROOT, demo, 'audio');
const textosPath = demo => join(audioDir(demo), 'textos.json');

function readTextos(demo) {
  return existsSync(textosPath(demo)) ? JSON.parse(readFileSync(textosPath(demo), 'utf8')) : [];
}

function voiceFor(demo, role) {
  const r = role === 'client' ? 'CLIENT' : 'AGENT';
  return env[`ELEVENLABS_VOICE_${envPrefix(demo)}_${r}`] || env[`ELEVENLABS_VOICE_DEFAULT_${r}`]
    || (r === 'CLIENT' ? 'ErXwobaYiN019PkySvjV' : 'uQw4jpKzMLrZuo0RLPS9');
}

function extract(demo) {
  const html = readFileSync(join(ROOT, demo, 'index.html'), 'utf8');
  const found = extractTexts(html);
  const previous = readTextos(demo);
  // Conserva lo que ya estaba (incluidas ediciones manuales de rol) y añade lo nuevo
  const byText = new Map(previous.map(t => [normalize(t.text), t]));
  for (const t of found) if (!byText.has(t.text)) byText.set(t.text, t);
  const merged = [...byText.values()];
  mkdirSync(audioDir(demo), { recursive: true });
  writeFileSync(textosPath(demo), JSON.stringify(merged, null, 2) + '\n');
  const nuevos = merged.length - previous.length;
  console.log(`✓ ${demo}: ${merged.length} frases (${nuevos} nuevas) → ${demo}/audio/textos.json`);
}

async function tts(text, voiceId) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': env.ELEVENLABS_API_KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({
      text,
      model_id: env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.8 }
    })
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return Buffer.from(await res.arrayBuffer());
}

async function generate(demo) {
  if (!env.ELEVENLABS_API_KEY) {
    throw new Error('Falta ELEVENLABS_API_KEY en .env (cp .env.example .env y rellénala).');
  }
  const textos = readTextos(demo);
  if (!textos.length) {
    console.log(`· ${demo}: sin textos. Ejecuta antes: node scripts/voices.mjs extract ${demo}`);
    return;
  }
  const manifest = {};
  let creados = 0;
  for (const t of textos) {
    if (t.skip) continue;
    const h = hash(t.text);
    const file = join(audioDir(demo), `${h}.mp3`);
    if (force || !existsSync(file)) {
      process.stdout.write(`  ↳ ${demo} [${t.role || 'agent'}] ${t.text.slice(0, 60)}… `);
      writeFileSync(file, await tts(t.text, t.voice || voiceFor(demo, t.role)));
      creados++;
      console.log('ok');
    }
    manifest[h] = { role: t.role || 'agent', text: t.text };
  }
  // Borra MP3 huérfanos (frases que ya no están en textos.json)
  for (const f of readdirSync(audioDir(demo))) {
    if (f.endsWith('.mp3') && !manifest[f.replace('.mp3', '')]) unlinkSync(join(audioDir(demo), f));
  }
  writeFileSync(join(audioDir(demo), 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`✓ ${demo}: ${Object.keys(manifest).length} audios (${creados} generados ahora)`);
}

function status(demo) {
  const textos = readTextos(demo).filter(t => !t.skip);
  const pendientes = textos.filter(t => !existsSync(join(audioDir(demo), `${hash(t.text)}.mp3`)));
  const chars = pendientes.reduce((n, t) => n + t.text.length, 0);
  console.log(`${demo.padEnd(18)} frases: ${String(textos.length).padStart(3)}  pendientes: ${String(pendientes.length).padStart(3)}  caracteres pendientes: ${chars}`);
}

try {
  const demos = resolveDemos(target);
  if (command === 'extract') demos.forEach(extract);
  else if (command === 'generate') for (const d of demos) await generate(d);
  else if (command === 'status') demos.forEach(status);
  else throw new Error(`Comando desconocido "${command}". Usa extract | generate | status.`);
} catch (e) {
  console.error('✗', e.message);
  process.exit(1);
}
