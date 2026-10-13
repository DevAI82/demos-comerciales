#!/usr/bin/env node
// Crea una demo nueva para un cliente clonando la demo de referencia de su nicho.
//
//   1) node scripts/nueva-demo.mjs nichos                    → lista nichos y su demo de referencia
//   2) node scripts/nueva-demo.mjs init  <nicho> <slug>      → crea nichos/clientes/<slug>.json para rellenar
//   3) node scripts/nueva-demo.mjs build <slug> [--force]    → genera la carpeta <slug>/ con los datos del cliente
//
// Después: revisa la demo (carta, servicios, nombres de equipo, cifras), ejecuta
// `node scripts/voices.mjs generate <slug>` y añade su tarjeta al portal (index.html).
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, copyFileSync, rmSync } from 'node:fs';
import { join, extname } from 'node:path';
import { ROOT, extractTexts } from './lib/common.mjs';

const NICHOS = JSON.parse(readFileSync(join(ROOT, 'nichos', 'nichos.json'), 'utf8'));
const CLIENTES = join(ROOT, 'nichos', 'clientes');
const TEXT_EXT = new Set(['.html', '.md', '.json', '.js', '.css', '.txt', '.svg']);
const [, , cmd, a1, a2, ...rest] = process.argv;
const flags = new Set([a2, ...rest].filter(x => x && x.startsWith('--')));

const nichos = () => Object.entries(NICHOS).filter(([k]) => !k.startsWith('_'));
const fail = msg => { console.error('✗', msg); process.exit(1); };
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function listar() {
  for (const [id, n] of nichos()) {
    console.log(`${n.emoji}  ${id.padEnd(13)} referencia: ${n.referencia.padEnd(16)} ${n.nombre}${n.otras_demos.length ? `  (también: ${n.otras_demos.join(', ')})` : ''}`);
  }
}

function init(nichoId, slug) {
  const nicho = NICHOS[nichoId];
  if (!nicho || nichoId.startsWith('_')) fail(`Nicho "${nichoId}" no existe. Usa: ${nichos().map(([k]) => k).join(', ')}`);
  if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fail('El slug debe ir en minúsculas y con guiones, ej: pizzeria-luigi');
  mkdirSync(CLIENTES, { recursive: true });
  const file = join(CLIENTES, `${slug}.json`);
  if (existsSync(file) && !flags.has('--force')) fail(`Ya existe ${file} (usa --force para sobrescribir)`);
  const reemplazar = {};
  for (const k of nicho.reemplazar) reemplazar[k] = k === nicho.referencia ? slug : '';
  const data = {
    _ayuda: 'Rellena cada valor con el dato del nuevo cliente. Deja el mismo texto si no cambia. Puedes añadir más pares (p. ej. platos de la carta, nombres del equipo).',
    nicho: nichoId,
    slug,
    cliente: { nombre: '', sector: nicho.nombre, ciudad: 'Albacete', whatsapp_contacto: '' },
    reemplazar
  };
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  console.log(`✓ Creado nichos/clientes/${slug}.json → rellénalo y ejecuta: node scripts/nueva-demo.mjs build ${slug}`);
}

function copiarDir(src, dst, transform) {
  mkdirSync(dst, { recursive: true });
  for (const name of readdirSync(src)) {
    const from = join(src, name);
    if (statSync(from).isDirectory()) {
      if (name === 'audio') continue; // los audios se regeneran para el nuevo cliente
      copiarDir(from, join(dst, name), transform);
    } else if (TEXT_EXT.has(extname(name).toLowerCase())) {
      writeFileSync(join(dst, name), transform(readFileSync(from, 'utf8')));
    } else {
      copyFileSync(from, join(dst, name));
    }
  }
}

function build(slug) {
  const file = join(CLIENTES, `${slug}.json`);
  if (!existsSync(file)) fail(`No existe nichos/clientes/${slug}.json. Créalo con: node scripts/nueva-demo.mjs init <nicho> ${slug}`);
  const data = JSON.parse(readFileSync(file, 'utf8'));
  const nicho = NICHOS[data.nicho];
  if (!nicho) fail(`Nicho "${data.nicho}" desconocido en ${slug}.json`);
  const vacios = Object.entries(data.reemplazar).filter(([, v]) => !String(v).trim()).map(([k]) => k);
  if (vacios.length && !flags.has('--permitir-vacios')) {
    fail(`Faltan ${vacios.length} valores en ${slug}.json:\n   - ${vacios.join('\n   - ')}\n  (o ejecuta con --permitir-vacios para dejarlos como en la referencia)`);
  }
  const dst = join(ROOT, slug);
  if (existsSync(dst)) {
    if (!flags.has('--force')) fail(`La carpeta ${slug}/ ya existe (usa --force para regenerarla)`);
    rmSync(dst, { recursive: true });
  }

  const pares = Object.entries(data.reemplazar).filter(([k, v]) => String(v).trim() && k !== v);
  pares.sort((x, y) => y[0].length - x[0].length);
  const mapa = new Map(pares);
  const re = pares.length ? new RegExp(pares.map(([k]) => escapeRe(k)).join('|'), 'g') : null;
  const transform = txt => (re ? txt.replace(re, m => mapa.get(m)) : txt);

  copiarDir(join(ROOT, nicho.referencia), dst, transform);

  // Frases para la voz del nuevo cliente
  mkdirSync(join(dst, 'audio'), { recursive: true });
  const textos = extractTexts(readFileSync(join(dst, 'index.html'), 'utf8'));
  writeFileSync(join(dst, 'audio', 'textos.json'), JSON.stringify(textos, null, 2) + '\n');

  // Comprobaciones
  const html = readFileSync(join(dst, 'index.html'), 'utf8');
  const restos = nicho.reemplazar.filter(k => !mapa.has(k) && html.includes(k) && k !== nicho.referencia);
  const archivos = [...html.matchAll(/(?:src|href)="([^"#:?]+\.(?:png|jpe?g|webp|svg|gif))"/g)].map(m => m[1])
    .filter(p => !p.startsWith('http') && !existsSync(join(dst, p)));

  console.log(`\n✓ Demo creada en ${slug}/ (a partir de ${nicho.referencia}/, nicho ${data.nicho})`);
  console.log(`  ${pares.length} reemplazos aplicados · ${textos.length} frases de voz en ${slug}/audio/textos.json`);
  if (restos.length) console.log(`  ⚠️  Siguen apareciendo datos de la referencia: ${restos.join(', ')}`);
  if (archivos.length) console.log(`  ⚠️  Faltan imágenes (cópialas en ${slug}/): ${[...new Set(archivos)].join(', ')}`);
  console.log(`\n  Siguientes pasos:
   1. Revisa a mano ${slug}/index.html: carta/servicios, precios, nombres del equipo y cualquier dato
      inventado de ${nicho.referencia} (el script solo cambia los textos listados en el JSON).
   2. node scripts/voices.mjs extract ${slug} && node scripts/voices.mjs generate ${slug}
   3. Añade la tarjeta al portal (index.html) y prueba en el móvil: node scripts/dev-server.mjs\n`);
}

if (cmd === 'nichos' || !cmd) listar();
else if (cmd === 'init') init(a1, a2 && !a2.startsWith('--') ? a2 : undefined);
else if (cmd === 'build') build(a1);
else fail(`Comando desconocido "${cmd}". Usa: nichos | init <nicho> <slug> | build <slug>`);
