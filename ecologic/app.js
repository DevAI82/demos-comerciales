/* =========================================================================
   ECOLOGIC CAR WASH — Lógica del prototipo (Altera)
   Store (agenda + reservas) · UI · Web (wizard) · WA (agente) · VOZ · CRM
   ========================================================================= */
(() => {
'use strict';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const R = ECO.REGLAS;

/* ---------------- Fechas ---------------- */
const pad = n => String(n).padStart(2, '0');
const dKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const TODAY = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
const fromKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DIAS_C = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const fmtDia = k => { const d = fromKey(k); const diff = Math.round((d - TODAY) / 864e5);
  const base = `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}`;
  return diff === 0 ? `hoy, ${base}` : diff === 1 ? `mañana, ${base}` : base; };
const toMin = h => { const [a, b] = h.split(':').map(Number); return a * 60 + b; };
const toHora = m => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
const OPEN = toMin(R.apertura), CLOSE = toMin(R.cierre);
const isOpen = d => d.getDay() !== 0; // domingo cerrado en la demo

/* ---------------- PRNG determinista ---------------- */
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const pickW = (rnd, items, weights) => { const s = weights.reduce((a, b) => a + b, 0); let r = rnd() * s; for (let i = 0; i < items.length; i++) { r -= weights[i]; if (r <= 0) return items[i]; } return items[items.length - 1]; };

/* =========================================================================
   STORE — reservas sembradas (simuladas) + reservas creadas en la demo
   ========================================================================= */
const NOMBRES = ['Lucía', 'Javier', 'María', 'Carlos', 'Ana', 'David', 'Laura', 'Pablo', 'Marta', 'Sergio', 'Elena', 'Álvaro', 'Carmen', 'Raúl', 'Paula', 'Jorge', 'Irene', 'Miguel', 'Sara', 'Daniel', 'Cristina', 'Andrés', 'Nuria', 'Iván', 'Beatriz', 'Óscar', 'Rocío', 'Adrián', 'Silvia', 'Hugo'];
const APELL = ['García', 'Martínez', 'López', 'Sánchez', 'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Álvarez', 'Romero', 'Navarro', 'Torres', 'Domínguez', 'Gil', 'Vázquez', 'Serrano', 'Ramos', 'Blanco', 'Molina', 'Castro', 'Ortega', 'Delgado', 'Rubio', 'Marín', 'Sanz', 'Iglesias'];
const CANALES = [
  { id: 'web', nombre: 'Web', color: 'var(--s1)' },
  { id: 'wa', nombre: 'WhatsApp IA', color: 'var(--s3)' },
  { id: 'voz', nombre: 'Voz IA', color: 'var(--s2)' },
  { id: 'pres', nombre: 'Presencial', color: 'var(--s4)' },
];
const canal = id => CANALES.find(c => c.id === id);
const LS_KEY = 'ecologic_demo_bookings_v1';

const Store = {
  all: [], demo: [], idx: new Map(), clientes: [],
  init() {
    const rnd = mulberry(20261020);
    // Cartera de clientes simulada
    for (let i = 0; i < 9000; i++) {
      const n = NOMBRES[Math.floor(rnd() * NOMBRES.length)], a = APELL[Math.floor(rnd() * APELL.length)], b = APELL[Math.floor(rnd() * APELL.length)];
      this.clientes.push({ nombre: `${n} ${a} ${b}`, tel: `6${Math.floor(10 + rnd() * 89)} ${Math.floor(100 + rnd() * 899)} ${Math.floor(100 + rnd() * 899)}`, home: Math.floor(rnd() * ECO.CENTROS.length) });
    }
    const big = new Set(['goya', 'princesa', 'sanchinarro', 'xanadu', 'bcn-diagonal', 'sevilla-ne', 'bilbao', 'zaragoza-pv', 'valladolid', 'murcia']);
    const servW = { 'bas-int': 6, 'bas-ext': 9, 'bas-tot': 10, 'com-int': 9, 'com-ext': 8, 'com-tot': 22, 'plus-int': 7, 'plus-tot': 13, 'int-prem': 6, 'prem-tot': 2.5, 'ceramico': 1.2 };
    const servIds = Object.keys(servW), servWs = Object.values(servW);
    const hours = [], hourW = [];
    for (let m = OPEN; m <= CLOSE - 45; m += R.slotMin) { hours.push(m); const h = m / 60; hourW.push(h < 11 ? 4 : h < 14 ? 9 : h < 16.5 ? 5 : h < 19.5 ? 9 : 3); }
    let seq = 1000;
    for (let off = -95; off <= 12; off++) {
      const day = addDays(TODAY, off); if (!isOpen(day)) continue;
      const key = dKey(day), dow = day.getDay();
      const dowF = dow === 6 ? 1.45 : dow === 5 ? 1.2 : dow === 1 ? .8 : 1;
      const fill = off <= 0 ? 1 : Math.max(.12, .82 - off * .07);
      ECO.CENTROS.forEach((c, ci) => {
        const base = big.has(c.id) ? 8 : 5;
        const n = Math.round(base * dowF * (.7 + rnd() * .6) * fill);
        for (let k = 0; k < n; k++) {
          const servId = pickW(rnd, servIds, servWs), s = ECO.SERVICIOS.find(x => x.id === servId);
          const tam = pickW(rnd, [0, 1, 2, 3], [24, 36, 30, 10]);
          const start = pickW(rnd, hours, hourW);
          if (start + s.min > CLOSE || !this.fits(c.id, key, start, s.min)) continue;
          const extras = rnd() < .14 ? [pickW(rnd, ECO.EXTRAS.map(e => e.id), [5, 4, 2, 4])] : [];
          const total = s.precios[tam] + extras.reduce((a, e) => a + ECO.EXTRAS.find(x => x.id === e).precio, 0);
          const ch = pickW(rnd, ['web', 'wa', 'voz', 'pres'], [37, 31, 17, 15]);
          const garantia = total > R.umbralGarantia && ch !== 'pres';
          let estado = off < 0 ? 'completada' : (garantia ? 'garantia' : 'confirmada');
          let penal = 0;
          if (off < 0) {
            const r = rnd();
            if (garantia && r < .02) { estado = 'noshow-cobrado'; penal = Math.max(R.penalizacionMin, total * R.penalizacionPct); }
            else if (!garantia && r < .045) estado = 'noshow';
            else if (r > .975) estado = 'cancelada';
          }
          const cli = rnd() < .7 ? this.clientes[Math.floor(rnd() * this.clientes.length)] : this.clientes[(ci * 250 + Math.floor(rnd() * 250)) % this.clientes.length];
          this.push({ id: `ECO-${seq++}`, centro: c.id, fecha: key, hora: toHora(start), min: s.min, serv: servId, tam, extras, total, canal: ch, garantia, estado, penal,
            cliente: cli.nombre, tel: cli.tel, fuera: (ch === 'wa' || ch === 'voz') && rnd() < .41 });
        }
      });
    }
    try { this.demo = JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch (e) { this.demo = []; }
    this.demo.forEach(b => this.push(b));
  },
  push(b) { this.all.push(b); const k = `${b.centro}|${b.fecha}`; if (!this.idx.has(k)) this.idx.set(k, []); this.idx.get(k).push(b); },
  dayList(centro, fecha) { return (this.idx.get(`${centro}|${fecha}`) || []).filter(b => b.estado !== 'cancelada'); },
  fits(centro, fecha, start, min) {
    const list = this.dayList(centro, fecha);
    for (let t = start; t < start + min; t += R.slotMin) {
      const busy = list.filter(b => { const s = toMin(b.hora); return s <= t && t < s + b.min; }).length;
      if (busy >= R.boxes) return false;
    }
    return true;
  },
  slots(centro, fecha, min) {
    const out = []; const d = fromKey(fecha); const now = new Date();
    for (let m = OPEN; m + min <= CLOSE; m += R.slotMin) {
      let ok = this.fits(centro, fecha, m, min);
      if (dKey(d) === dKey(now) && m < now.getHours() * 60 + now.getMinutes() + 30) ok = false;
      out.push({ hora: toHora(m), ok });
    }
    return out;
  },
  openDays(n = 7) { const out = []; let i = 0; while (out.length < n && i < 20) { const d = addDays(TODAY, i++); if (isOpen(d)) out.push(dKey(d)); } return out; },
  add(b) {
    do { b.id = `ECO-${Math.floor(90000 + Math.random() * 9999)}`; } while (this.all.some(x => x.id === b.id)); // las simuladas van de ECO-1000 a ~ECO-30000
    b.demo = true; b.created = Date.now(); b.penal = 0;
    b.estado = b.garantia ? 'garantia' : 'confirmada';
    this.push(b); this.demo.push(b);
    try { localStorage.setItem(LS_KEY, JSON.stringify(this.demo)); } catch (e) {}
    UI.notifyNew(b);
    return b;
  },
  save() { try { localStorage.setItem(LS_KEY, JSON.stringify(this.demo)); } catch (e) {} },
  visits(tel) { return this.all.filter(b => b.tel === tel && b.estado === 'completada').length; },
};

const servOf = id => ECO.SERVICIOS.find(s => s.id === id);
const calcTotal = (serv, tam, extras = []) => (serv ? servOf(serv).precios[tam] : 0) + extras.reduce((a, e) => a + ECO.EXTRAS.find(x => x.id === e).precio, 0);
const penalOf = total => Math.max(R.penalizacionMin, Math.round(total * R.penalizacionPct * 100) / 100);
const policy = total => `No se cobra nada ahora. Cancelación gratis hasta ${R.cancelacionGratisHoras} h antes. Solo si no te presentas sin avisar se cargarán ${ECO.eur(penalOf(total))} (${Math.round(R.penalizacionPct * 100)} % del servicio, mín. ${R.penalizacionMin} €).`;

/* =========================================================================
   UI — navegación, toast, ElevenLabs
   ========================================================================= */
const UI = {
  newCount: 0,
  go(view) {
    $$('.tab-btn').forEach(b => b.setAttribute('aria-selected', b.dataset.view === view));
    $$('.view').forEach(v => v.classList.toggle('active', v.id === `view-${view}`));
    if (view === 'crm') { CRM.render(); this.newCount = 0; $('#navNew').classList.add('hidden'); }
    if (view === 'wa' && !WA.started) WA.reset();
    const nav = $('#viewNav'); if (window.scrollY > nav.offsetTop) window.scrollTo({ top: nav.offsetTop, behavior: 'smooth' });
  },
  notifyNew(b) {
    this.newCount++; const n = $('#navNew'); n.textContent = `+${this.newCount}`; n.classList.remove('hidden');
    $('#toastMsg').textContent = `✓ Reserva ${b.id} · ${ECO.centro(b.centro).nombre} · ${fmtDia(b.fecha)} ${b.hora} (${canal(b.canal).nombre})`;
    const t = $('#toast'); t.classList.add('show'); clearTimeout(this._tt); this._tt = setTimeout(() => t.classList.remove('show'), 5200);
    if ($('#view-crm').classList.contains('active')) CRM.render();
  },
  /* --- ElevenLabs: misma clave localStorage que el resto de demos del catálogo --- */
  key() { return localStorage.getItem('elevenlabs_api_key') || ''; },
  voice() { return localStorage.getItem('elevenlabs_voice_id_ecologic') || 'uQw4jpKzMLrZuo0RLPS9'; },
  refreshEleven() {
    const k = this.key(); const st = $('#elevenState');
    st.textContent = k ? 'conectada ✓' : 'sin conectar'; st.className = k ? 'font-bold text-eco-400' : 'font-bold text-stone-400';
  },
  openEleven() { $('#eleven-api-key').value = this.key(); $('#eleven-voice-select').value = this.voice(); $('#elevenModal').classList.remove('hidden'); },
  closeEleven() { $('#elevenModal').classList.add('hidden'); },
  toggleKey() { const i = $('#eleven-api-key'); i.type = i.type === 'password' ? 'text' : 'password'; },
  async saveEleven() {
    let val = $('#eleven-api-key').value.trim().replace(/^xi-api-key[:\s=]+/i, '').replace(/^bearer\s+/i, '').replace(/^api[_-]?key[:\s=]+/i, '').replace(/^["'`]|["'`]$/g, '').trim();
    const msg = $('#eleven-status-msg'); msg.classList.remove('hidden');
    const sel = $('#eleven-voice-select');
    localStorage.setItem('elevenlabs_voice_id_ecologic', sel.value);
    if (!val) { localStorage.removeItem('elevenlabs_api_key'); msg.innerHTML = '⚠️ Sin clave: se usará la voz del navegador.'; msg.className = 'text-[12px] mt-3 text-amber-300'; this.refreshEleven(); return; }
    localStorage.setItem('elevenlabs_api_key', val);
    msg.innerHTML = '⏳ Comprobando con ElevenLabs…'; msg.className = 'text-[12px] mt-3 text-stone-300';
    try {
      const res = await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': val } });
      if (res.ok) {
        const data = await res.json(); const cur = sel.value;
        const extra = (data.voices || []).slice(0, 40).map(v => `<option value="${v.voice_id}">${v.name}${v.labels && v.labels.accent ? ' · ' + v.labels.accent : ''}</option>`).join('');
        sel.insertAdjacentHTML('beforeend', `<optgroup label="Voces de tu cuenta">${extra}</optgroup>`); sel.value = cur;
        msg.innerHTML = '✅ Clave válida. Elige voz y pulsa «Probar».'; msg.className = 'text-[12px] mt-3 text-eco-400';
      } else {
        const err = await res.json().catch(() => null); const m = (err && err.detail && err.detail.message) || '';
        if (m.includes('voices_read')) { msg.innerHTML = '✅ Clave válida (sin permiso para listar voces, pero puede hablar). Usamos Laura.'; msg.className = 'text-[12px] mt-3 text-eco-400'; }
        else { msg.innerHTML = `❌ ElevenLabs rechaza la clave (${res.status}). Revisa que empiece por <code>sk_</code>.`; msg.className = 'text-[12px] mt-3 text-red-300'; }
      }
    } catch (e) { msg.innerHTML = '⚠️ No se pudo comprobar (sin conexión). La clave queda guardada.'; msg.className = 'text-[12px] mt-3 text-amber-300'; }
    this.refreshEleven();
  },
  testVoice() { localStorage.setItem('elevenlabs_voice_id_ecologic', $('#eleven-voice-select').value); Speech.say(ECO.VOZ.test); },
};

/* ---------------- Voz (ElevenLabs con respaldo Web Speech) ---------------- */
const Speech = {
  audio: null,
  stop() { if (window.AlteraVoice) AlteraVoice.stop(); if (this.audio) { try { this.audio.pause(); } catch (e) {} this.audio = null; } if (window.speechSynthesis) speechSynthesis.cancel(); },
  play(url, done) {
    const a = window.AlteraVoice ? AlteraVoice.getPlayer(url) : new Audio(url); this.audio = a;
    a.onended = done; a.onerror = done;
    const p = a.play(); if (p && p.catch) p.catch(done);
  },
  async say(text, onEnd) {
    this.stop();
    const done = () => { onEnd && onEnd(); };
    // 1) Audio ElevenLabs pregenerado (ecologic/audio/*.mp3): lo que oye el cliente
    const cached = window.AlteraVoice ? await AlteraVoice.cachedUrl(text) : null;
    if (cached) return this.play(cached, done);
    // 2) API en vivo: solo en desarrollo (clave del .env vía scripts/dev-server.mjs)
    const key = (!window.AlteraVoice || AlteraVoice.devMode) ? UI.key() : '';
    if (key) {
      try {
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${UI.voice()}`, {
          method: 'POST', headers: { 'Accept': 'audio/mpeg', 'Content-Type': 'application/json', 'xi-api-key': key },
          body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: .5, similarity_boost: .8 } }),
        });
        if (res.ok) return this.play(URL.createObjectURL(await res.blob()), done);
        console.warn('ElevenLabs', res.status);
      } catch (e) { console.warn('ElevenLabs fallback', e); }
    }
    if (window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(text); u.lang = 'es-ES'; u.rate = 1.04;
      const v = speechSynthesis.getVoices().find(v => /es[-_]ES/i.test(v.lang)); if (v) u.voice = v;
      u.onend = done; u.onerror = done; speechSynthesis.speak(u);
    } else setTimeout(done, Math.min(6000, text.length * 55));
  },
};

/* =========================================================================
   WEB — asistente de reserva en 4 pasos
   ========================================================================= */
const Web = {
  st: { step: 1, centro: null, tam: 1, serv: null, extras: [], fecha: null, hora: null, com: 'Todas', q: '' },
  init() {
    const coms = ['Todas', ...new Set(ECO.CENTROS.map(c => c.comunidad))];
    $('#comChips').innerHTML = coms.map(c => `<button class="chip px-3 py-1.5 rounded-full text-[12px] font-bold ${c === 'Todas' ? 'on' : ''}" data-c="${c}">${c}</button>`).join('');
    $('#comChips').onclick = e => { const b = e.target.closest('[data-c]'); if (!b) return; this.st.com = b.dataset.c; $$('#comChips .chip').forEach(x => x.classList.toggle('on', x === b)); this.renderCentros(); };
    $('#centroSearch').oninput = e => { this.st.q = e.target.value; this.renderCentros(); };
    $('#heroCentros').textContent = ECO.CENTROS.length >= 35 ? '35' : ECO.CENTROS.length;
    this.render();
  },
  renderCentros() {
    const q = ECO.norm(this.st.q);
    const list = ECO.CENTROS.filter(c => (this.st.com === 'Todas' || c.comunidad === this.st.com) && (!q || ECO.norm(c.nombre + ' ' + c.dir + ' ' + c.comunidad).includes(q)));
    $('#centroList').innerHTML = list.map(c => `
      <button class="opt text-left rounded-xl p-3 ${this.st.centro === c.id ? 'on' : ''}" data-id="${c.id}">
        <div class="flex items-start justify-between gap-2"><span class="font-bold text-[14px]">${c.nombre}</span>${c.sw ? '<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#eef6d9] text-[#4d6b0a] whitespace-nowrap">STOP&WASH</span>' : ''}</div>
        <div class="text-[11.5px] text-[#6b7a90] mt-0.5 leading-snug">${c.dir}</div>
        ${c._km != null ? `<div class="text-[11px] font-bold text-[#2c5a99] mt-1">📍 a ${c._km} km</div>` : ''}
      </button>`).join('') || '<p class="text-sm text-[#6b7a90] p-3">Sin resultados.</p>';
    $('#centroList').onclick = e => { const b = e.target.closest('[data-id]'); if (!b) return; this.st.centro = b.dataset.id; this.st.hora = null; this.render(); };
  },
  nearest() {
    const apply = (lat, lng, label) => {
      ECO.CENTROS.forEach(c => { const dx = (c.lng - lng) * 111 * Math.cos(lat * Math.PI / 180), dy = (c.lat - lat) * 111; c._km = Math.round(Math.hypot(dx, dy)); });
      const best = [...ECO.CENTROS].sort((a, b) => a._km - b._km)[0];
      this.st.centro = best.id; this.st.com = 'Todas'; this.st.q = ''; $('#centroSearch').value = '';
      $$('#comChips .chip').forEach(x => x.classList.toggle('on', x.dataset.c === 'Todas'));
      ECO.CENTROS.sort((a, b) => a._km - b._km);
      this.render(); if (label) $('#centroSearch').placeholder = label;
    };
    if (!navigator.geolocation) return apply(38.994, -1.858, 'Ubicación de ejemplo: Albacete');
    navigator.geolocation.getCurrentPosition(p => apply(p.coords.latitude, p.coords.longitude), () => apply(38.994, -1.858, 'Sin permiso de ubicación: ejemplo desde Albacete'), { timeout: 6000 });
  },
  renderServ() {
    const st = this.st;
    $('#sizeOpts').innerHTML = ECO.TAMANOS.map((t, i) => `<button class="opt rounded-xl p-3 text-left ${st.tam === i ? 'on' : ''}" data-t="${i}"><div class="text-2xl">${t.icon}</div><div class="font-bold text-[14px] mt-1">${t.nombre}</div><div class="text-[11px] text-[#6b7a90] leading-snug">${t.ej}</div></button>`).join('');
    $('#sizeOpts').onclick = e => { const b = e.target.closest('[data-t]'); if (!b) return; st.tam = +b.dataset.t; st.hora = null; this.render(); };
    const groups = [...new Set(ECO.SERVICIOS.map(s => s.grupo))];
    $('#servOpts').innerHTML = groups.map(g => `
      <div><div class="text-[11px] font-bold uppercase tracking-[.14em] text-[#6b7a90] mb-1.5">${g}</div>
      <div class="grid sm:grid-cols-2 gap-2">${ECO.SERVICIOS.filter(s => s.grupo === g).map(s => {
        const p = s.precios[st.tam];
        return `<button class="opt rounded-xl p-3 text-left flex items-center justify-between gap-3 ${st.serv === s.id ? 'on' : ''}" data-s="${s.id}">
          <span><span class="font-bold text-[13.5px]">${s.nombre}</span>${s.top ? ' <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#1f4277] text-white">MÁS PEDIDO</span>' : ''}<span class="block text-[11px] text-[#6b7a90]">⏱ ${s.min >= 120 ? (s.min / 60).toString().replace('.', ',') + ' h' : s.min + ' min'}${s.orientativo ? ' · precio orientativo*' : ''}</span></span>
          <span class="text-right shrink-0"><span class="block font-display font-extrabold text-[17px] text-[#1f4277]">${s.desde ? '<span class="text-[10px] font-bold text-[#6b7a90]">desde </span>' : ''}${ECO.eur(p)}</span>${p > R.umbralGarantia ? '<span class="text-[10px] font-bold text-[#635bff]">🔒 garantía</span>' : ''}</span>
        </button>`; }).join('')}</div></div>`).join('') + '<p class="text-[11px] text-[#6b7a90]">* Precio no publicado en la web actual: pendiente de confirmar con Ecologic.</p>';
    $('#servOpts').onclick = e => { const b = e.target.closest('[data-s]'); if (!b) return; st.serv = b.dataset.s; st.hora = null; this.render(); };
    $('#extraOpts').innerHTML = ECO.EXTRAS.map(x => `<label class="opt rounded-xl p-3 flex items-center justify-between gap-2 cursor-pointer ${st.extras.includes(x.id) ? 'on' : ''}"><span class="flex items-center gap-2 text-[13px]"><input type="checkbox" data-x="${x.id}" ${st.extras.includes(x.id) ? 'checked' : ''}> ${x.nombre}${x.orientativo ? '*' : ''}</span><span class="font-bold text-[13px] text-[#1f4277]">+${x.precio} €</span></label>`).join('');
    $('#extraOpts').onchange = e => { const id = e.target.dataset.x; if (!id) return; st.extras = e.target.checked ? [...st.extras, id] : st.extras.filter(x => x !== id); this.render(); };
  },
  renderTime() {
    const st = this.st; const s = servOf(st.serv); if (!s) return;
    const days = Store.openDays(8); if (!st.fecha || !days.includes(st.fecha)) st.fecha = days[0];
    $('#dayOpts').innerHTML = days.map(k => { const d = fromKey(k); const free = Store.slots(st.centro, k, s.min).filter(x => x.ok).length;
      return `<button class="chip shrink-0 rounded-xl px-3 py-2 text-center min-w-[74px] ${st.fecha === k ? 'on' : ''}" data-d="${k}"><div class="text-[11px] font-bold uppercase">${k === dKey(TODAY) ? 'Hoy' : DIAS_C[d.getDay()]}</div><div class="font-display font-extrabold text-xl leading-none">${d.getDate()}</div><div class="text-[10px] ${free ? '' : 'text-red-500'}">${free ? free + ' huecos' : 'completo'}</div></button>`; }).join('');
    $('#dayOpts').onclick = e => { const b = e.target.closest('[data-d]'); if (!b) return; st.fecha = b.dataset.d; st.hora = null; this.render(); };
    const sl = Store.slots(st.centro, st.fecha, s.min);
    $('#slotOpts').innerHTML = sl.length ? sl.map(x => `<button class="slot rounded-lg py-2 text-[13px] font-bold ${st.hora === x.hora ? 'on' : ''}" data-h="${x.hora}" ${x.ok ? '' : 'disabled'}>${x.hora}</button>`).join('') : '<p class="col-span-full text-sm text-[#6b7a90]">Este servicio no cabe hoy en horario.</p>';
    $('#slotOpts').onclick = e => { const b = e.target.closest('[data-h]'); if (!b || b.disabled) return; st.hora = b.dataset.h; this.render(); };
  },
  renderSummary() {
    const st = this.st, c = ECO.centro(st.centro), s = servOf(st.serv), t = ECO.TAMANOS[st.tam];
    const total = calcTotal(st.serv, st.tam, st.extras);
    const row = (k, v) => `<div class="flex justify-between gap-3"><span class="text-[#6b7a90]">${k}</span><span class="font-semibold text-right">${v}</span></div>`;
    $('#sumBox').innerHTML = [
      row('Centro', c ? `${c.nombre}<span class="block text-[11px] font-normal text-[#6b7a90]">Tel. ${c.tel}</span>` : '—'),
      row('Coche', `${t.icon} ${t.nombre}`),
      row('Servicio', s ? `${s.nombre}<span class="block text-[11px] font-normal text-[#6b7a90]">${ECO.eur(s.precios[st.tam])} · ${s.min} min</span>` : '—'),
      st.extras.length ? row('Extras', st.extras.map(e => ECO.EXTRAS.find(x => x.id === e).nombre).join(', ')) : '',
      row('Cuándo', st.fecha && st.hora ? `${fmtDia(st.fecha)}<span class="block">${st.hora} h</span>` : '—'),
    ].join('');
    $('#sumTotal').textContent = s ? ECO.eur(total) : '—';
    $('#sumGuarantee').classList.toggle('hidden', !(s && total > R.umbralGarantia));
  },
  canNext() { const st = this.st; return st.step === 1 ? !!st.centro : st.step === 2 ? !!st.serv : st.step === 3 ? !!st.hora : st.step === 4; },
  render() {
    const st = this.st;
    $$('[data-step]').forEach(el => el.classList.toggle('hidden', +el.dataset.step !== st.step));
    $$('#stepper .step-dot').forEach(d => { const n = +d.dataset.s; d.classList.toggle('on', n === st.step); d.classList.toggle('done', n < st.step); d.textContent = n < st.step ? '✓' : n; });
    if (st.step === 1) this.renderCentros();
    if (st.step === 2) this.renderServ();
    if (st.step === 3) this.renderTime();
    if (st.step === 4) {
      const total = calcTotal(st.serv, st.tam, st.extras);
      $('#guaranteeBox').classList.toggle('hidden', total <= R.umbralGarantia);
      $('#policyText').textContent = policy(total);
      this.loyalty();
      $('#fTel').oninput = () => this.loyalty();
    }
    $('#wizNav').classList.toggle('hidden', st.step === 5);
    $('#btnBack').classList.toggle('invisible', st.step === 1);
    const total = calcTotal(st.serv, st.tam, st.extras);
    $('#btnNext').textContent = st.step === 4 ? (total > R.umbralGarantia ? '🔒 Guardar tarjeta y reservar' : 'Confirmar reserva') : 'Continuar →';
    $('#btnNext').disabled = !this.canNext();
    this.renderSummary();
  },
  loyalty() {
    const tel = $('#fTel').value.trim(); const n = Store.visits(tel) % R.fidelidad.lavados;
    const el = $('#loyaltyNote');
    const known = Store.all.some(b => b.tel === tel);
    el.classList.toggle('hidden', !tel);
    el.innerHTML = known ? `🎁 Te reconocemos: llevas <strong>${n} de ${R.fidelidad.lavados}</strong> lavados. ${n === R.fidelidad.lavados - 1 ? '¡El próximo tiene 30 € de regalo!' : `Te faltan ${R.fidelidad.lavados - n} para tus 30 €.`}` : `🎁 Cliente nuevo: con este lavado empiezas tu tarjeta (cada 4, 30 € de regalo).`;
  },
  next() {
    if (!this.canNext()) return;
    if (this.st.step < 4) { this.st.step++; this.render(); $('#view-web').scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    const st = this.st, total = calcTotal(st.serv, st.tam, st.extras), gar = total > R.umbralGarantia;
    const btn = $('#btnNext'); btn.disabled = true; btn.textContent = gar ? 'Stripe · creando SetupIntent…' : 'Reservando…';
    setTimeout(() => {
      if (!Store.fits(st.centro, st.fecha, toMin(st.hora), servOf(st.serv).min)) { alert('Ese hueco se acaba de ocupar. Elige otra hora.'); st.step = 3; st.hora = null; this.render(); return; }
      const b = Store.add({ centro: st.centro, fecha: st.fecha, hora: st.hora, min: servOf(st.serv).min, serv: st.serv, tam: st.tam, extras: [...st.extras], total, canal: 'web', garantia: gar,
        cliente: $('#fNombre').value.trim() || 'Cliente web', tel: $('#fTel').value.trim(), email: $('#fEmail').value.trim(), coche: $('#fCoche').value.trim(), fuera: false });
      this.success(b);
    }, gar ? 1300 : 700);
  },
  success(b) {
    const c = ECO.centro(b.centro), s = servOf(b.serv);
    this.st.step = 5; this.render();
    $('#okSub').textContent = `Código ${b.id} · te esperamos en el parking de El Corte Inglés`;
    $('#okTicket').innerHTML = `<div class="flex justify-between mb-2"><span class="font-display font-extrabold text-lg text-[#1f4277]">${b.id}</span>${b.garantia ? '<span class="text-[11px] font-bold text-[#635bff]">🔒 tarjeta en garantía</span>' : ''}</div>
      <div class="space-y-1 text-[13px]"><div><strong>${c.nombre}</strong> · ${c.dir}</div><div>${fmtDia(b.fecha)} · <strong>${b.hora} h</strong> (${s.min} min)</div><div>${s.nombre} · ${ECO.TAMANOS[b.tam].nombre}</div><div class="font-bold">Total en el centro: ${ECO.eur(b.total)}</div></div>`;
    $('#okWa').innerHTML = `¡Hola ${b.cliente.split(' ')[0]}! 🚗✨ Tu reserva en <strong>Ecologic ${c.nombre}</strong> está confirmada: ${fmtDia(b.fecha)} a las ${b.hora}. ${s.nombre} (${ECO.eur(b.total)}).<br><br>📍 Parking de El Corte Inglés. Te recordamos el día antes.<br>¿Necesitas cambiarla? Responde a este mensaje.<div class="text-right text-[10px] text-[#8696a0] mt-1">${toHora(new Date().getHours() * 60 + new Date().getMinutes())} ✓✓</div>`;
  },
  back() { if (this.st.step > 1) { this.st.step--; this.render(); } },
  reset() { Object.assign(this.st, { step: 1, serv: null, extras: [], fecha: null, hora: null }); this.render(); },
};

/* =========================================================================
   WA — agente de WhatsApp (extracción de intención + agenda real)
   ========================================================================= */
const WA = {
  started: false, s: {}, busy: false,
  reset() {
    this.started = true; this.s = { centro: null, ciudad: null, tam: null, serv: null, fecha: null, hora: null, nombre: null, garantia: false, stage: null, pref: null };
    $('#waChat').innerHTML = ''; $('#waLog').innerHTML = '';
    this.renderSlots();
    this.bot(`¡Hola! 👋 Soy <strong>Eco</strong>, el asistente de Ecologic Car Wash. Te reservo lavado en cualquiera de nuestros ${ECO.CENTROS.length >= 35 ? 35 : ECO.CENTROS.length} centros en un minuto.<br><br>Cuéntame qué necesitas, por ejemplo: <em>«completo para un SUV el sábado por la mañana en Goya»</em>.`, 300,
      ['Quiero lavar mi coche en Albacete', 'Completo para un SUV el sábado en Madrid', '¿Cuánto cuesta un premium?', '¿De verdad lo lavais sin agua?']);
    if (!this._bound) {
      this._bound = true;
      $('#waForm').onsubmit = e => { e.preventDefault(); const v = $('#waInput').value.trim(); if (!v || this.busy) return; $('#waInput').value = ''; this.user(v); };
      $('#waQuick').onclick = e => { const b = e.target.closest('[data-q]'); if (!b || this.busy) return; const q = b.dataset.q; if (q === '__stripe') return this.openStripe(); this.user(q); };
    }
  },
  time() { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; },
  add(html, side) {
    const w = document.createElement('div'); w.className = `flex ${side === 'out' ? 'justify-end' : 'justify-start'}`;
    w.innerHTML = `<div class="${side === 'out' ? 'bubble-out' : 'bubble-in'} max-w-[85%] px-3 py-2 leading-relaxed">${html}<div class="text-right text-[10px] text-[#8696a0] mt-0.5">${this.time()}${side === 'out' ? ' <span class="text-[#53bdeb]">✓✓</span>' : ''}</div></div>`;
    $('#waChat').appendChild(w); $('#waChat').scrollTop = 1e6;
  },
  quick(list) { $('#waQuick').innerHTML = (list || []).map(q => typeof q === 'string' ? `<button data-q="${q.replace(/"/g, '&quot;')}" class="text-[12px] px-3 py-1.5 rounded-full border border-[#00a884]/60 text-[#00a884] bg-[#0b141a]">${q}</button>` : `<button data-q="${q.q}" class="text-[12px] px-3 py-1.5 rounded-full border border-[#00a884]/60 text-[#00a884] bg-[#0b141a]">${q.l}</button>`).join(''); },
  bot(html, delay = 900, quick) {
    this.busy = true; this.quick([]);
    const t = document.createElement('div'); t.className = 'flex'; t.innerHTML = '<div class="bubble-in px-3 py-2.5 typing"><span></span> <span></span> <span></span></div>';
    $('#waChat').appendChild(t); $('#waChat').scrollTop = 1e6; $('#waStatus').textContent = 'escribiendo…';
    return new Promise(res => setTimeout(() => { t.remove(); this.add(html, 'in'); this.quick(quick); this.busy = false; $('#waStatus').textContent = 'en línea'; res(); }, delay));
  },
  log(call, result) {
    $$('#waLog li').forEach(l => l.classList.remove('hot'));
    const li = document.createElement('li'); li.className = 'hot pl-3 py-1';
    li.innerHTML = `<span class="text-eco-400">${call}</span><br><span class="text-stone-500">→ ${result}</span>`;
    $('#waLog').appendChild(li); $('#waLog').scrollTop = 1e6;
  },
  renderSlots() {
    const s = this.s, c = s.centro && ECO.centro(s.centro), sv = s.serv && servOf(s.serv);
    const cell = (k, v) => `<div class="rounded-xl bg-night-900 border border-night-700 p-2.5"><div class="text-[10px] uppercase tracking-wider text-stone-500">${k}</div><div class="font-bold ${v ? 'text-white' : 'text-stone-600'} truncate">${v || '—'}</div></div>`;
    $('#waSlots').innerHTML = [
      cell('Centro', c ? c.nombre : (s.ciudad ? `${s.ciudad} (¿cuál?)` : '')), cell('Coche', s.tam != null ? ECO.TAMANOS[s.tam].nombre : ''), cell('Servicio', sv ? sv.nombre : ''),
      cell('Día', s.fecha ? fmtDia(s.fecha) : ''), cell('Hora', s.hora), cell('Importe', sv && s.tam != null ? ECO.eur(sv.precios[s.tam]) + (sv.precios[s.tam] > R.umbralGarantia ? (s.garantia ? ' 🔒✓' : ' 🔒') : '') : ''),
    ].join('');
  },
  /* --- Extracción de entidades del texto libre --- */
  parse(raw) {
    const t = ` ${ECO.norm(raw).replace(/[^a-z0-9:. ]/g, ' ').replace(/\s+/g, ' ')} `, s = this.s, found = [];
    // Centro / ciudad
    if (!s.centro || /\b(en|centro|mejor)\b/.test(t)) {
      for (const [id, al] of Object.entries(ECO.ALIAS)) if (al.some(a => t.includes(` ${a}`) && !(a === 'leon' && /\bseat leon\b/.test(t)))) { s.centro = id; s.ciudad = null; found.push('centro'); break; }
      if (!found.includes('centro')) for (const [city, ids] of Object.entries(ECO.CIUDADES)) if (t.includes(city)) { s.ciudad = city[0].toUpperCase() + city.slice(1); s.centro = null; found.push('ciudad'); break; }
    }
    // Tamaño
    if (/7 plazas|siete plazas|monovolumen|furgoneta|\b7p\b/.test(t)) s.tam = 3;
    else if (/\bsuv\b|todoterreno|4x4|qashqai|tiguan|grande|berlina|\ba6\b|model y|x5|ateca|tucson|\bq5\b/.test(t)) s.tam = 2;
    else if (/mediano|compacto|golf|focus|astra|serie 1|\bseat leon\b|megane|corolla/.test(t)) s.tam = 1;
    else if (/pequeno|utilitario|ibiza|clio|\bmini\b|\b208\b|\bpolo\b|\bc3\b|smart|fiesta/.test(t)) s.tam = 0;
    // Servicio
    let sv = null;
    if (/ceramic/.test(t)) sv = 'ceramico';
    else if (/premium total|abrillant|pulid/.test(t)) sv = 'prem-tot';
    else if (/detailing|integral premium/.test(t)) sv = 'int-prem';
    else if (/interior premium/.test(t)) sv = 'plus-int';
    else if (/total premium|\bplus\b|premium/.test(t)) sv = 'plus-tot';
    else if (/basic/.test(t)) sv = /interior|dentro/.test(t) && !/exterior|fuera/.test(t) ? 'bas-int' : /exterior|fuera/.test(t) && !/interior|dentro/.test(t) ? 'bas-ext' : 'bas-tot';
    else if (/completo|entero|dentro y (por )?fuera|interior y exterior|a fondo/.test(t)) sv = /completo interior/.test(t) ? 'com-int' : /completo exterior/.test(t) ? 'com-ext' : 'com-tot';
    else if (/interior|por dentro|tapiceria/.test(t)) sv = 'com-int';
    else if (/exterior|por fuera|carroceria/.test(t)) sv = 'com-ext';
    if (sv) s.serv = sv;
    // Día
    const days = Store.openDays(10);
    const wd = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    let f = null;
    if (/\bhoy\b/.test(t)) f = dKey(TODAY);
    else if (/pasado manana/.test(t)) f = dKey(addDays(TODAY, 2));
    else if (/\bmanana\b/.test(t.replace(/por la manana/g, ''))) f = dKey(addDays(TODAY, 1));
    else if (/fin de semana|finde/.test(t)) f = days.find(k => fromKey(k).getDay() === 6);
    else { const i = wd.findIndex(w => t.includes(w)); if (i >= 0) f = days.find(k => fromKey(k).getDay() === i); }
    if (f) { if (!isOpen(fromKey(f))) { s._closed = true; } else s.fecha = f; }
    if (/por la manana|temprano|mediodia/.test(t)) s.pref = 'am'; if (/por la tarde|tarde/.test(t)) s.pref = 'pm';
    // Hora explícita
    const m = t.match(/a las (\d{1,2})(?:[:.h](\d{2}))?|(\d{1,2})[:.](\d{2})/);
    if (m) { let h = +(m[1] || m[3]), mi = +(m[2] || m[4] || 0); if (h < 9) h += 12; mi = mi >= 30 ? 30 : 0; s._want = toHora(h * 60 + mi); }
    return found;
  },
  intent(t) {
    t = ECO.norm(t);
    if (/persona|humano|encargad|hablar con|queja|reclama/.test(t)) return 'humano';
    if (/cancel|anular/.test(t)) return 'cancelar';
    if (/sin agua|ecologic|productos|biodegrad|como lo lav/.test(t)) return 'agua';
    if (/cuanto tarda|duracion|cuanto tiempo|tiempo tarda/.test(t)) return 'tiempo';
    if (/horario|a que hora abr|cierra/.test(t)) return 'horario';
    if (/cuanto (cuesta|vale|sale)|precio|tarifa/.test(t)) return 'precio';
    if (/^(gracias|ok gracias|perfecto gracias|genial)/.test(t)) return 'gracias';
    return null;
  },
  async user(text) {
    this.add(text.replace(/</g, '&lt;'), 'out');
    const s = this.s;
    if (s.stage === 'nombre' && !this.intent(text)) { s.nombre = text.replace(/^(soy|me llamo|a nombre de)\s+/i, '').trim(); s.stage = null; this.log(`crm.upsert_cliente({ nombre: "${s.nombre}", tel: "+34 6XX…" })`, 'cliente vinculado al número de WhatsApp'); return this.step(); }
    if (s.stage === 'done') { const i = this.intent(text); if (i === 'gracias' || /^(no|nada|eso es todo)/i.test(ECO.norm(text))) return this.bot('¡A ti! 🚗💧 Nos vemos en el parking. Si necesitas algo, escribe por aquí.', 700, ['Empezar otra reserva']); if (/otra reserva/i.test(text)) return this.reset(); }
    const found = this.parse(text);
    if (found.length || s.tam != null || s.serv) this.log(`ia.extraer_entidades("${text.slice(0, 38)}${text.length > 38 ? '…' : ''}")`, JSON.stringify({ centro: s.centro || s.ciudad, tam: s.tam != null ? ECO.TAMANOS[s.tam].id : null, serv: s.serv, fecha: s.fecha, pref: s.pref }).replace(/"/g, ''));
    this.renderSlots();
    const it = this.intent(text);
    if (it === 'agua') await this.bot('Sí 💧 Lavamos <strong>a mano y sin agua</strong>, con productos 100 % biodegradables (espumas, líquidos y aerosoles) y toallas de microfibra que recogen la suciedad.', 1000);
    else if (it === 'tiempo') await this.bot('Depende del tamaño y del estado del coche: los lavados básicos, <strong>desde 45 minutos</strong>; los completos y premium, algo más. Te digo el tiempo al elegir servicio. Como estamos en el parking de El Corte Inglés, puedes aprovechar para hacer compras 🛍️', 1000);
    else if (it === 'horario') await this.bot('Cada centro sigue el <strong>horario de su El Corte Inglés</strong>. Por aquí te atiendo 24/7 y te reservo en cualquier momento 😉', 900);
    else if (it === 'humano') { const c = s.centro && ECO.centro(s.centro); this.log('handoff.notificar_encargado({ centro, motivo, chat })', 'aviso enviado al encargado del centro'); return this.bot(`Claro, te paso con una persona del equipo${c ? ` de <strong>${c.nombre}</strong>` : ''}. Le he enviado esta conversación para que no tengas que repetir nada. ${c ? `Si es urgente: 📞 ${c.tel}.` : ''}`, 1000); }
    else if (it === 'cancelar') { this.log('supabase.reservas.cancelar({ tel })', 'reserva localizada · hueco liberado'); return this.bot('Hecho ✅ He cancelado tu reserva y el hueco vuelve a estar libre. Como avisaste con más de 24 h, <strong>no hay ningún cargo</strong>. ¿Quieres buscar otro día?', 1000, ['Sí, otro día', 'No, gracias']); }
    else if (it === 'precio' && (s.tam == null || !s.serv)) {
      const tam = s.tam ?? 1;
      if (s.serv) await this.bot(`<strong>${servOf(s.serv).nombre}</strong>: ${ECO.TAMANOS.map((x, i) => `${x.nombre} ${ECO.eur(servOf(s.serv).precios[i])}`).join(' · ')}. IVA incluido.`, 1000);
      else await this.bot(`Precios para coche ${ECO.TAMANOS[tam].nombre.toLowerCase()} (IVA incl.):<br>• Básica completa: ${ECO.eur(ECO.precio('bas-tot', tam))}<br>• Completo total: ${ECO.eur(ECO.precio('com-tot', tam))}<br>• Total premium: ${ECO.eur(ECO.precio('plus-tot', tam))}<br>• Integral Premium (detailing): desde 149 €`, 1100);
    }
    if (s._closed) { s._closed = false; await this.bot('Los domingos los centros están cerrados 😕 Te propongo otro día:', 700); }
    return this.step();
  },
  /* --- Decide la siguiente pregunta: solo lo que falta --- */
  async step() {
    const s = this.s; this.renderSlots();
    if (!s.centro) {
      if (s.ciudad) {
        const ids = ECO.CIUDADES[ECO.norm(s.ciudad)];
        this.log(`supabase.centros.buscar({ ciudad: "${s.ciudad}" })`, `${ids.length} centros`);
        return this.bot(`En ${s.ciudad} tenemos ${ids.length} centros. ¿Cuál te pilla mejor?`, 800, ids.map(id => ECO.centro(id).nombre));
      }
      return this.bot('¿En qué centro te viene mejor? Dime la ciudad o a qué El Corte Inglés sueles ir 📍', 800, ['Albacete', 'Madrid', 'Barcelona', 'Sevilla', 'Valladolid']);
    }
    if (s.tam == null) {
      const c = ECO.centro(s.centro);
      return this.bot(`Perfecto, <strong>${c.nombre}</strong> (parking de El Corte Inglés). ¿Qué coche traes?`, 800, ECO.TAMANOS.map(t => `${t.icon} ${t.nombre}: ${t.ej.split(',')[0]}`).map((l, i) => ({ l, q: ['Es pequeño', 'Es mediano', 'Es un SUV grande', 'Es de 7 plazas'][i] })));
    }
    if (!s.serv) {
      const tam = s.tam;
      return this.bot(`Para un coche <strong>${ECO.TAMANOS[tam].nombre.toLowerCase()}</strong>:<br>• Básica completa · ${ECO.eur(ECO.precio('bas-tot', tam))}<br>• Completo total · ${ECO.eur(ECO.precio('com-tot', tam))} ⭐<br>• Total premium · ${ECO.eur(ECO.precio('plus-tot', tam))}<br>• Integral Premium · 149 €<br>¿Cuál te hago?`, 1000,
        [{ l: 'Básica completa', q: 'La básica completa' }, { l: 'Completo total ⭐', q: 'El completo total' }, { l: 'Total premium', q: 'El total premium' }, { l: 'Integral Premium', q: 'Integral premium detailing' }]);
    }
    if (!s.fecha) {
      const days = Store.openDays(6);
      return this.bot('¿Qué día te viene bien?', 700, days.map(k => { const d = fromKey(k); return { l: k === dKey(TODAY) ? 'Hoy' : `${DIAS_C[d.getDay()]} ${d.getDate()}`, q: k === dKey(TODAY) ? 'hoy' : DIAS[d.getDay()].normalize('NFD').replace(/[̀-ͯ]/g, '') }; }));
    }
    if (!s.hora) {
      const sv = servOf(s.serv);
      const sl = Store.slots(s.centro, s.fecha, sv.min).filter(x => x.ok);
      this.log(`supabase.rpc("huecos_libres", { centro: "${s.centro}", fecha: "${s.fecha}", duracion: ${sv.min} })`, `${sl.length} huecos libres en ${R.boxes} boxes`);
      if (!sl.length) { s.fecha = null; return this.bot(`Ese día está completo en ${ECO.centro(s.centro).nombre} 😕 ¿Probamos otro?`, 900, Store.openDays(6).slice(1).map(k => DIAS[fromKey(k).getDay()].normalize('NFD').replace(/[̀-ͯ]/g, ''))); }
      if (s._want) {
        const w = s._want; s._want = null;
        if (sl.some(x => x.hora === w)) { s.hora = w; return this.step(); }
        const near = [...sl].sort((a, b) => Math.abs(toMin(a.hora) - toMin(w)) - Math.abs(toMin(b.hora) - toMin(w))).slice(0, 3).sort((a, b) => toMin(a.hora) - toMin(b.hora));
        return this.bot(`A las ${w} ya está ocupado 😕 Lo más cercano: ${near.map(x => `<strong>${x.hora}</strong>`).join(', ')}.`, 900, near.map(x => `A las ${x.hora}`));
      }
      let pool = sl; if (s.pref === 'am') pool = sl.filter(x => toMin(x.hora) < 14 * 60); if (s.pref === 'pm') pool = sl.filter(x => toMin(x.hora) >= 16 * 60); if (!pool.length) pool = sl;
      const pick = pool.length <= 5 ? pool : [0, .2, .45, .7, .95].map(f => pool[Math.floor(f * (pool.length - 1))]);
      const uniq = [...new Map(pick.map(x => [x.hora, x])).values()];
      return this.bot(`${fmtDia(s.fecha)[0].toUpperCase() + fmtDia(s.fecha).slice(1)} tengo hueco a las ${uniq.map(x => `<strong>${x.hora}</strong>`).join(', ')}. ¿Cuál te reservo?`, 1000, uniq.map(x => `A las ${x.hora}`));
    }
    if (!s.nombre) { s.stage = 'nombre'; return this.bot('¡Genial! ¿A nombre de quién pongo la reserva?', 700, ['Javier Ruiz', 'Marta Gil']); }
    const total = calcTotal(s.serv, s.tam);
    if (total > R.umbralGarantia && !s.garantia) {
      this.log('stripe.setupIntents.create({ customer, usage: "off_session" })', `seti_${Math.random().toString(36).slice(2, 10)} · enlace de pago seguro`);
      this._stripeTotal = total;
      return this.bot(`Como el servicio es de <strong>${ECO.eur(total)}</strong>, te pido dejar la tarjeta en garantía 🔒 <strong>No se cobra nada ahora.</strong> Cancelación gratis hasta 24 h antes.<br><br><span class="block rounded-lg bg-[#0b141a] border border-[#2a3942] p-2 mt-1">💳 <u class="text-[#53bdeb]">checkout.stripe.com/ecologic/…</u><br><span class="text-[11px] text-[#8696a0]">Guardar tarjeta · Ecologic Car Wash</span></span>`, 1100, [{ l: '🔒 Abrir enlace seguro', q: '__stripe' }]);
    }
    return this.confirm();
  },
  openStripe() {
    const s = this.s, total = this._stripeTotal;
    $('#stripeSum').textContent = `${servOf(s.serv).nombre} · ${ECO.centro(s.centro).nombre} · ${fmtDia(s.fecha)} ${s.hora} · ${ECO.eur(total)}`;
    $('#stripePolicy').textContent = policy(total);
    $('#stripeModal').classList.remove('hidden');
    $('#stripeBtn').onclick = () => {
      $('#stripeBtn').textContent = 'Verificando con tu banco…';
      setTimeout(() => { $('#stripeModal').classList.add('hidden'); $('#stripeBtn').textContent = 'Guardar tarjeta · 0,00 € ahora'; s.garantia = true;
        this.add('✅ Tarjeta guardada', 'out'); this.log('webhook stripe: setup_intent.succeeded', 'pm_card_visa ···· 4242 vinculada a la reserva'); this.confirm(); }, 1200);
    };
  },
  async confirm() {
    const s = this.s, sv = servOf(s.serv), c = ECO.centro(s.centro), total = calcTotal(s.serv, s.tam);
    if (!Store.fits(s.centro, s.fecha, toMin(s.hora), sv.min)) { s.hora = null; await this.bot('Uy, ese hueco se acaba de ocupar desde la web 😅 Te busco otro:', 800); return this.step(); }
    const b = Store.add({ centro: s.centro, fecha: s.fecha, hora: s.hora, min: sv.min, serv: s.serv, tam: s.tam, extras: [], total, canal: 'wa', garantia: total > R.umbralGarantia, cliente: s.nombre, tel: '600 123 456', fuera: new Date().getHours() >= 21 || new Date().getHours() < 10 });
    this.log(`supabase.reservas.insert({ centro: "${s.centro}", box: 1, ${s.fecha} ${s.hora} })`, `${b.id} creada · aparece en el CRM`);
    const remind = addDays(fromKey(s.fecha), -1); remind.setHours(10);
    this.log(`whatsapp.plantilla("${remind > new Date() ? 'recordatorio_24h' : 'recordatorio_2h'}").programar()`, remind > new Date() ? `envío ${fmtDia(dKey(remind))} 10:00` : `envío ${fmtDia(s.fecha)} a las ${toHora(toMin(s.hora) - 120)}`);
    s.stage = 'done'; this.renderSlots();
    return this.bot(`¡Reserva confirmada! ✅<br><br>🧾 <strong>${b.id}</strong><br>📍 ${c.nombre} · parking El Corte Inglés<br>🗓️ ${fmtDia(s.fecha)} a las <strong>${s.hora}</strong><br>🚗 ${sv.nombre} · ${ECO.TAMANOS[s.tam].nombre}<br>💶 ${ECO.eur(total)} (se paga en el centro)${b.garantia ? '<br>🔒 Tarjeta en garantía' : ''}<br><br>Te escribo el día antes para recordártelo. ¿Algo más?`, 1300, ['No, gracias', 'Empezar otra reserva']);
  },
};

/* =========================================================================
   VOZ — recepcionista telefónica 24/7
   ========================================================================= */
const VOZ = {
  on: false, t0: 0, timer: null, b: {}, sess: 0,
  start() {
    if (this.on) return; this.on = true; this.sess++; this.b = { centro: 'goya', tam: 2, serv: 'plus-tot' };
    $('#btnCall').classList.add('hidden'); $('#btnHang').classList.remove('hidden');
    $('#transcript').innerHTML = ''; $('#callState').textContent = 'Conectando…';
    const now = new Date(); this.t0 = Date.now();
    this.timer = setInterval(() => { const s = Math.floor((Date.now() - this.t0) / 1000); $('#callTimer').textContent = `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; }, 500);
    this.sys(`📞 Llamada entrante · +34 6•• ••• 312 · 23:47 · todos los centros cerrados`);
    setTimeout(() => { $('#callState').textContent = 'En llamada con Eco (IA)'; this.go(0); }, 900);
  },
  hang(silent) {
    this.on = false; this.sess++; Speech.stop(); clearInterval(this.timer);
    $('#btnCall').classList.remove('hidden'); $('#btnHang').classList.add('hidden'); $('#callChoices').innerHTML = '';
    $('#wave').classList.remove('live'); $('#callState').textContent = 'Llamada finalizada'; $('#callTimer').textContent = '';
    if (!silent) this.sys('Llamada colgada por el cliente.');
  },
  sys(t) { $('#transcript').insertAdjacentHTML('beforeend', `<p class="text-[11.5px] font-mono text-stone-500">${t}</p>`); $('#transcript').scrollTop = 1e6; },
  line(who, t) {
    const eco = who === 'eco';
    $('#transcript').insertAdjacentHTML('beforeend', `<div class="flex ${eco ? '' : 'justify-end'}"><div class="max-w-[85%] rounded-2xl px-3 py-2 ${eco ? 'bg-night-700 text-white rounded-tl-none' : 'bg-eco-400 text-night-900 rounded-tr-none'}"><span class="block text-[10px] font-bold opacity-70 mb-0.5">${eco ? 'Eco · IA' : 'Cliente'}</span>${t}</div></div>`);
    $('#transcript').scrollTop = 1e6;
  },
  speak(text, cb) {
    this.line('eco', text); $('#wave').classList.add('live');
    // El texto se locuta tal cual: así coincide con el MP3 pregenerado (hash del texto)
    const s = this.sess, next = () => { if (s !== this.sess) return; $('#wave').classList.remove('live'); cb(); };
    if (!$('#toggleSpeech').checked) { setTimeout(next, Math.min(2600, 500 + text.length * 18)); return; }
    Speech.say(text, next);
  },
  choices(list) {
    $('#callChoices').innerHTML = list.map((c, i) => `<button data-i="${i}" class="w-full text-left text-[13px] px-3 py-2 rounded-xl bg-night-700/80 border border-night-600 hover:border-eco-400 text-white">🗣️ ${c.l}</button>`).join('');
    $('#callChoices').onclick = e => { const b = e.target.closest('[data-i]'); if (!b) return; const c = list[+b.dataset.i]; $('#callChoices').innerHTML = ''; this.line('cli', c.l); c.fx && c.fx(); setTimeout(() => this.go(c.next), 500); };
  },
  go(n) {
    if (!this.on) return; const b = this.b;
    const c = () => ECO.centro(b.centro);
    const steps = {
      0: () => this.speak(ECO.VOZ.saludo, () => this.choices([
        { l: 'En el de Goya, en Madrid', fx: () => b.centro = 'goya', next: 1 },
        { l: 'En Albacete', fx: () => b.centro = 'albacete', next: 1 },
        { l: 'En el de Diagonal, en Barcelona', fx: () => b.centro = 'bcn-diagonal', next: 1 }])),
      1: () => { this.sys(`tool → supabase.centros.get("${b.centro}")`); this.speak(ECO.VOZ.centro(b.centro), () => this.choices([
        { l: 'Un SUV, un Tiguan', fx: () => b.tam = 2, next: 2 }, { l: 'Un Golf', fx: () => b.tam = 1, next: 2 }])); },
      2: () => this.speak(ECO.VOZ.coche(b.tam), () => this.choices([
        { l: 'El total premium', fx: () => b.serv = 'plus-tot', next: 3 }, { l: 'El completo total', fx: () => b.serv = 'com-tot', next: 3 }, { l: '¿Qué diferencia hay?', next: 21 }])),
      21: () => this.speak(ECO.VOZ.diferencia, () => this.choices([
        { l: 'Pues el premium', fx: () => b.serv = 'plus-tot', next: 3 }, { l: 'El completo, gracias', fx: () => b.serv = 'com-tot', next: 3 }])),
      3: () => {
        // Primer día (desde mañana) con las 11:30 y las 17:00 libres: el guion de voz es fijo
        const sv = servOf(b.serv), days = Store.openDays(8).filter(k => k !== dKey(TODAY));
        const day = days.find(k => Store.fits(b.centro, k, toMin('11:30'), sv.min) && Store.fits(b.centro, k, toMin('17:00'), sv.min)) || days[0];
        b.fecha = day;
        this.sys(`tool → supabase.rpc("huecos_libres", { ${b.centro}, ${day}, ${sv.min} min }) · 11:30 y 17:00 libres`);
        this.speak(ECO.VOZ.huecos(DIAS[fromKey(day).getDay()]), () => this.choices([
          { l: 'A las once y media', fx: () => b.hora = '11:30', next: 4 }, { l: 'Mejor a las cinco', fx: () => b.hora = '17:00', next: 4 }]));
      },
      4: () => this.speak(ECO.VOZ.nombre, () => this.choices([{ l: 'Javier Ruiz', fx: () => b.nombre = 'Javier Ruiz', next: calcTotal(b.serv, b.tam) > R.umbralGarantia ? 5 : 6 }])),
      5: () => { this.sys('tool → stripe.setupIntents.create() · enlace enviado por WhatsApp al número que llama');
        this.speak(ECO.VOZ.garantia, () => this.choices([{ l: 'Vale, perfecto', next: 6 }])); },
      6: () => { const sv = servOf(b.serv);
        this.sys(`WhatsApp → confirmación: ${sv.nombre} · ${fmtDia(b.fecha)} ${b.hora} · ${c().nombre}`);
        this.speak(ECO.VOZ.confirmada, () => this.choices([{ l: 'No, eso es todo. ¡Gracias!', next: 7 }])); },
      7: () => this.speak(ECO.VOZ.despedida, () => {
        const sv = servOf(b.serv), total = calcTotal(b.serv, b.tam);
        const bk = Store.add({ centro: b.centro, fecha: b.fecha, hora: b.hora, min: sv.min, serv: b.serv, tam: b.tam, extras: [], total, canal: 'voz', garantia: total > R.umbralGarantia, cliente: b.nombre, tel: '612 448 312', fuera: true });
        this.sys(`tool → supabase.reservas.insert() · ${bk.id} · resumen y grabación guardados en el CRM`);
        this.hang(true); $('#callState').textContent = `Reserva ${bk.id} creada ✓`;
      }),
    };
    steps[n] && steps[n]();
  },
};

/* =========================================================================
   CRM — KPIs, gráficos (SVG con tooltip y vista tabla), reservas, ficha
   ========================================================================= */
const tip = $('#chartTip');
const showTip = (e, html) => { tip.innerHTML = html; tip.style.display = 'block'; const x = Math.min(e.clientX + 14, innerWidth - 250); tip.style.left = x + 'px'; tip.style.top = (e.clientY + 14) + 'px'; };
const hideTip = () => { tip.style.display = 'none'; };
const BADGE = {
  confirmada: ['Confirmada', 'bg-[#16324f] text-[#8fc3ff]'], garantia: ['🔒 Garantía', 'bg-[#2a2560] text-[#c4bfff]'], completada: ['✓ Completada', 'bg-[#13352b] text-[#7fe0b7]'],
  'noshow-cobrado': ['⚠ No-show · cobrado', 'bg-[#3d2a0c] text-[#ffcf7a]'], noshow: ['✕ No-show', 'bg-[#3d1717] text-[#ff9b9b]'], cancelada: ['Cancelada', 'bg-night-700 text-stone-400'],
};

const CRM = {
  centro: 'all', days: 30, filter: 'all', inited: false,
  init() {
    const sel = $('#crmCentro');
    sel.innerHTML = '<option value="all">🏢 Dirección · todos los centros</option>' + [...new Set(ECO.CENTROS.map(c => c.comunidad))].map(com => `<optgroup label="${com}">${ECO.CENTROS.filter(c => c.comunidad === com).map(c => `<option value="${c.id}">${c.nombre}</option>`).join('')}</optgroup>`).join('');
    sel.onchange = () => { this.centro = sel.value; this.render(); };
    $('#crmRange').onclick = e => { const b = e.target.closest('[data-d]'); if (!b) return; this.days = +b.dataset.d; $$('#crmRange button').forEach(x => { const on = x === b; x.className = `px-3 py-2 ${on ? 'bg-night-700 text-white font-bold' : 'text-stone-300'}`; }); this.render(); };
    $('#tblFilter').onclick = e => { const b = e.target.closest('[data-f]'); if (!b) return; this.filter = b.dataset.f; $$('#tblFilter button').forEach(x => x.className = `px-2.5 py-1 rounded-lg ${x === b ? 'bg-night-700 text-white font-bold' : 'text-stone-300'}`); this.table(); };
    this.inited = true;
  },
  scope() { return this.centro === 'all' ? Store.all : Store.all.filter(b => b.centro === this.centro); },
  range(offDays) { const end = addDays(TODAY, 1 - offDays), start = addDays(end, -this.days); return [dKey(start), dKey(end)]; },
  past(list, off = 0) { const [a, z] = this.range(off); return list.filter(b => b.fecha >= a && b.fecha < z); },
  render() {
    if (!this.inited) this.init();
    const all = this.scope(), cur = this.past(all), prev = this.past(all, this.days);
    this.kpis(cur, prev); this.channels(cur); this.rank(cur); this.heat(cur); this.table(); this.autos(all);
  },
  kpis(cur, prev) {
    const m = l => { const ok = l.filter(b => b.estado === 'completada' || b.estado === 'confirmada' || b.estado === 'garantia');
      const ing = ok.reduce((a, b) => a + b.total, 0) + l.reduce((a, b) => a + (b.penal || 0), 0);
      return { n: l.filter(b => b.estado !== 'cancelada').length, ing, ticket: ok.length ? ing / ok.length : 0,
        fuera: l.filter(b => b.fuera).length, penal: l.reduce((a, b) => a + (b.penal || 0), 0), np: l.filter(b => b.estado === 'noshow-cobrado').length,
        agua: l.filter(b => b.estado === 'completada').length * R.litrosAhorradosPorLavado, ns: l.filter(b => b.estado === 'noshow').length }; };
    const a = m(cur), p = m(prev);
    const d = (x, y) => { if (!y) return ''; const v = (x - y) / y * 100; return `<span class="${v >= 0 ? 'text-[#7fe0b7]' : 'text-[#ff9b9b]'}">${v >= 0 ? '▲' : '▼'} ${Math.abs(v).toFixed(1).replace('.', ',')} %</span> <span class="text-stone-500">vs periodo anterior</span>`; };
    const tile = (lab, val, sub) => `<div class="kpi rounded-2xl p-4"><div class="text-[10.5px] uppercase tracking-wider text-stone-400 font-bold">${lab}</div><div class="font-display font-extrabold text-[1.65rem] text-white leading-tight mt-1">${val}</div><div class="text-[11px] mt-1">${sub}</div></div>`;
    $('#kpis').innerHTML = [
      tile('Reservas', a.n.toLocaleString('es-ES'), d(a.n, p.n)),
      tile('Ingresos reservados', ECO.eur0(a.ing), d(a.ing, p.ing)),
      tile('Ticket medio', ECO.eur(a.ticket), d(a.ticket, p.ticket)),
      tile('Fuera de horario', a.fuera.toLocaleString('es-ES'), `<span class="text-stone-400">reservas que hoy se perderían (${a.n ? Math.round(a.fuera / a.n * 100) : 0} %)</span>`),
      tile('No-shows cubiertos', ECO.eur0(a.penal), `<span class="text-stone-400">${a.np} cobrados por Stripe · ${a.ns} sin garantía</span>`),
      tile('Agua ahorrada', `${(a.agua / 1000).toLocaleString('es-ES', { maximumFractionDigits: 0 })} m³`, `<span class="text-stone-400">≈${R.litrosAhorradosPorLavado} L por lavado · dato para RSC</span>`),
    ].join('');
  },
  channels(list) {
    // Agrupa por semana (o por día si 7 d)
    const byDay = this.days <= 7;
    const buckets = new Map();
    list.filter(b => b.estado !== 'cancelada').forEach(b => {
      const d = fromKey(b.fecha); let k;
      if (byDay) k = b.fecha; else { const m = addDays(d, -((d.getDay() + 6) % 7)); k = dKey(m); }
      if (!buckets.has(k)) buckets.set(k, { web: 0, wa: 0, voz: 0, pres: 0 });
      buckets.get(k)[b.canal]++;
    });
    const keys = [...buckets.keys()].sort(); const [ra, rz] = this.range(0);
    const rows = keys.map(k => {
      let open = 0; if (!byDay) for (let i = 0; i < 7; i++) { const d = addDays(fromKey(k), i), dk = dKey(d); if (isOpen(d) && dk >= ra && dk < rz) open++; }
      return { k, partial: !byDay && open < 6, ...buckets.get(k) };
    });
    const W = 640, H = 250, L = 44, B = 26, T = 10, Rr = 8;
    const max = Math.max(1, ...rows.map(r => r.web + r.wa + r.voz + r.pres)); const nice = Math.ceil(max / 4 / 50) * 50 * 4 || 4;
    const bw = (W - L - Rr) / Math.max(1, rows.length), barW = Math.min(46, bw * .62);
    const y = v => H - B - (v / nice) * (H - B - T);
    let svg = `<svg viewBox="0 0 ${W} ${H}" class="w-full h-auto" role="img" aria-label="Reservas por canal">`;
    for (let i = 0; i <= 4; i++) { const v = nice / 4 * i, yy = y(v); svg += `<line x1="${L}" x2="${W - Rr}" y1="${yy}" y2="${yy}" stroke="#22334f" stroke-width="1"/><text x="${L - 8}" y="${yy + 4}" text-anchor="end" font-size="10.5" fill="#9aa8bd" font-family="JetBrains Mono">${v.toLocaleString('es-ES')}</text>`; }
    rows.forEach((r, i) => {
      const x = L + i * bw + (bw - barW) / 2; let acc = 0;
      svg += `<g opacity="${r.partial ? .45 : 1}">`;
      CANALES.forEach((ch, ci) => {
        const v = r[ch.id]; if (!v) return; const y0 = y(acc), y1 = y(acc + v); acc += v;
        const top = ci === CANALES.length - 1 || CANALES.slice(ci + 1).every(c2 => !r[c2.id]);
        const h = Math.max(0, y0 - y1 - 2);
        svg += top ? `<path d="M${x},${y0 - 2} v${-(h - 4)} q0,-4 4,-4 h${barW - 8} q4,0 4,4 v${h - 4} z" fill="${ch.color}"/>` : `<rect x="${x}" y="${y1}" width="${barW}" height="${h}" fill="${ch.color}"/>`;
      });
      svg += '</g>';
      const d = fromKey(r.k), lab = byDay ? `${DIAS_C[d.getDay()]} ${d.getDate()}` : `${d.getDate()} ${MESES[d.getMonth()]}${r.partial ? '*' : ''}`;
      if (rows.length <= 14 || i % 2 === 0) svg += `<text x="${x + barW / 2}" y="${H - 8}" text-anchor="middle" font-size="10.5" fill="#9aa8bd">${lab}</text>`;
      svg += `<rect x="${L + i * bw}" y="${T}" width="${bw}" height="${H - B - T}" fill="transparent" data-i="${i}" class="hit"/>`;
    });
    svg += '</svg>';
    const el = $('#chanChart'); el.innerHTML = svg;
    $$('.hit', el).forEach(h => { h.onmousemove = e => { const r = rows[+h.dataset.i], tot = r.web + r.wa + r.voz + r.pres, d = fromKey(r.k);
      showTip(e, `<div class="font-bold mb-1">${byDay ? fmtDia(r.k) : 'Semana del ' + d.getDate() + ' ' + MESES[d.getMonth()]}${r.partial ? ' <span class="font-normal text-stone-400">(incompleta)</span>' : ''}</div>${[...CANALES].reverse().map(c => `<div class="flex justify-between gap-4"><span><i style="background:${c.color}" class="inline-block w-2.5 h-2.5 rounded-sm mr-1.5"></i>${c.nombre}</span><b>${r[c.id]}</b></div>`).join('')}<div class="flex justify-between gap-4 border-t border-night-600 mt-1 pt-1"><span>Total</span><b>${tot}</b></div>`); }; h.onmouseleave = hideTip; });
    const tot = CANALES.map(c => rows.reduce((a, r) => a + r[c.id], 0)), sum = tot.reduce((a, b) => a + b, 0) || 1;
    $('#chanLegend').innerHTML = CANALES.map((c, i) => `<span class="flex items-center gap-1.5"><i style="background:${c.color}" class="w-3 h-3 rounded-sm inline-block"></i>${c.nombre} <b class="text-white">${Math.round(tot[i] / sum * 100)} %</b></span>`).join('') + (rows.some(r => r.partial) ? '<span class="text-stone-500">* semana incompleta</span>' : '');
    $('#chanTable').innerHTML = `<table class="w-full"><thead><tr class="text-stone-400 text-left"><th class="py-1">${byDay ? 'Día' : 'Semana'}</th>${CANALES.map(c => `<th class="text-right">${c.nombre}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr class="border-t border-night-700"><td class="py-1">${r.k}</td>${CANALES.map(c => `<td class="text-right font-mono">${r[c.id]}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  },
  rank(list) {
    const ok = list.filter(b => b.estado !== 'cancelada' && b.estado !== 'noshow');
    let rows;
    if (this.centro === 'all') {
      $('#rankTitle').textContent = 'Ingresos reservados · top 10 centros';
      const m = new Map(); ok.forEach(b => m.set(b.centro, (m.get(b.centro) || 0) + b.total + (b.penal || 0)));
      rows = [...m].map(([id, v]) => ({ l: ECO.centro(id).nombre, v })).sort((a, b) => b.v - a.v).slice(0, 10);
    } else {
      $('#rankTitle').textContent = `Ingresos por servicio · ${ECO.centro(this.centro).nombre}`;
      const m = new Map(); ok.forEach(b => m.set(b.serv, (m.get(b.serv) || 0) + b.total));
      rows = [...m].map(([id, v]) => ({ l: servOf(id).nombre, v })).sort((a, b) => b.v - a.v).slice(0, 10);
    }
    const max = Math.max(1, ...rows.map(r => r.v));
    $('#rankChart').innerHTML = rows.map((r, i) => `<div class="grid grid-cols-[130px_1fr_70px] sm:grid-cols-[170px_1fr_80px] items-center gap-2 py-[5px] group" data-i="${i}">
      <span class="text-[12px] text-stone-300 truncate">${r.l}</span>
      <span class="h-3.5 relative"><span class="absolute left-0 top-0 h-full rounded-r" style="width:${(r.v / max * 100).toFixed(1)}%;background:var(--s1)"></span></span>
      <span class="text-[12px] font-mono text-white text-right">${ECO.eur0(r.v)}</span></div>`).join('');
    $$('#rankChart [data-i]').forEach(el => { el.onmousemove = e => { const r = rows[+el.dataset.i]; showTip(e, `<b>${r.l}</b><br>${ECO.eur(r.v)} en ${this.days} días`); }; el.onmouseleave = hideTip; });
    $('#rankTable').innerHTML = `<table class="w-full">${rows.map(r => `<tr class="border-t border-night-700"><td class="py-1">${r.l}</td><td class="text-right font-mono">${ECO.eur(r.v)}</td></tr>`).join('')}</table>`;
  },
  heat(list) {
    const dows = [1, 2, 3, 4, 5, 6], hrs = []; for (let h = 10; h <= 21; h++) hrs.push(h);
    const occ = {}, days = {};
    list.filter(b => b.estado !== 'cancelada').forEach(b => {
      const dw = fromKey(b.fecha).getDay(); days[`${dw}|${b.fecha}`] = 1; const s = toMin(b.hora);
      for (let t = s; t < s + b.min; t += 30) { const h = Math.floor(t / 60); const k = `${dw}|${h}`; occ[k] = (occ[k] || 0) + 30; }
    });
    const nDays = d => Object.keys(days).filter(k => k.startsWith(d + '|')).length || 1;
    const nCentros = this.centro === 'all' ? ECO.CENTROS.length : 1;
    const val = (d, h) => Math.min(1, (occ[`${d}|${h}`] || 0) / (60 * R.boxes * nDays(d) * nCentros));
    const step = v => v < .2 ? .12 : v < .4 ? .3 : v < .6 ? .5 : v < .8 ? .72 : .95;
    let html = `<div class="grid gap-[3px]" style="grid-template-columns:34px repeat(${hrs.length},1fr)"><span></span>${hrs.map(h => `<span class="text-[10px] text-stone-400 text-center font-mono">${h}</span>`).join('')}`;
    dows.forEach(d => { html += `<span class="text-[11px] text-stone-400 self-center">${DIAS_C[d]}</span>` + hrs.map(h => { const v = val(d, h); return `<span class="aspect-square rounded-[4px] cursor-default" style="background:rgba(57,135,229,${step(v)})" data-v="${v}" data-l="${DIAS[d]} ${h}:00–${h + 1}:00"></span>`; }).join(''); });
    html += `</div><div class="flex items-center gap-2 mt-3 text-[11px] text-stone-400"><span>Libre</span>${[.12, .3, .5, .72, .95].map(o => `<i class="w-5 h-3 rounded-sm inline-block" style="background:rgba(57,135,229,${o})"></i>`).join('')}<span>Lleno</span></div>`;
    $('#heatmap').innerHTML = html;
    $$('#heatmap [data-v]').forEach(c => { c.onmousemove = e => showTip(e, `<b>${c.dataset.l}</b><br>Ocupación de boxes: ${Math.round(c.dataset.v * 100)} %`); c.onmouseleave = hideTip; });
  },
  table() {
    const today = dKey(TODAY);
    let l = this.scope().filter(b => b.fecha >= today && b.estado !== 'cancelada');
    if (this.filter === 'gar') l = l.filter(b => b.garantia); if (this.filter === 'new') l = l.filter(b => b.demo);
    l.sort((a, b) => (b.demo ? 1 : 0) - (a.demo ? 1 : 0) || (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
    l = l.slice(0, 80);
    $('#bookTbl').innerHTML = l.map(b => { const c = ECO.centro(b.centro), s = servOf(b.serv), bd = BADGE[b.estado], ch = canal(b.canal), d = fromKey(b.fecha);
      return `<tr class="cursor-pointer hover:bg-night-800 ${b.demo && Date.now() - b.created < 60000 ? 'row-new' : ''}" data-id="${b.id}">
        <td class="py-2 pr-2 whitespace-nowrap"><b class="text-white">${b.fecha === today ? 'Hoy' : DIAS_C[d.getDay()] + ' ' + d.getDate()}</b> <span class="font-mono text-stone-400">${b.hora}</span></td>
        <td class="py-2 pr-2"><span class="text-white">${b.cliente}</span>${b.demo ? ' <span class="badge bg-eco-400 text-night-900">DEMO</span>' : ''}</td>
        <td class="py-2 pr-2 text-stone-300">${c.nombre}<span class="block text-[11px] text-stone-500">${s.nombre} · ${ECO.TAMANOS[b.tam].nombre}</span></td>
        <td class="py-2 pr-2"><span class="inline-flex items-center gap-1.5 text-stone-300"><i class="w-2 h-2 rounded-full inline-block" style="background:${ch.color}"></i>${ch.nombre}</span></td>
        <td class="py-2 pr-2 text-right font-mono text-white">${ECO.eur(b.total)}</td>
        <td class="py-2"><span class="badge ${bd[1]}">${bd[0]}</span></td></tr>`; }).join('') || '<tr><td colspan="6" class="py-6 text-center text-stone-500">Sin reservas con este filtro. Haz una desde la web, WhatsApp o la llamada.</td></tr>';
    $('#bookTbl').onclick = e => { const r = e.target.closest('[data-id]'); if (r) this.ficha(r.dataset.id); };
  },
  ficha(id) {
    const b = Store.all.find(x => x.id === id); if (!b) return;
    const hist = Store.all.filter(x => x.tel === b.tel).sort((a, z) => (z.fecha + z.hora).localeCompare(a.fecha + a.hora));
    const done = hist.filter(x => x.estado === 'completada').length, stamps = done % R.fidelidad.lavados;
    const c = ECO.centro(b.centro), s = servOf(b.serv), canPenal = b.garantia && (b.estado === 'garantia');
    $('#drawer').innerHTML = `<div class="p-5 space-y-5">
      <div class="flex justify-between items-start"><div><div class="text-[11px] uppercase tracking-wider text-stone-400 font-bold">Ficha de cliente</div><h3 class="font-display font-extrabold text-2xl text-white">${b.cliente}</h3><div class="text-sm text-stone-400 font-mono">+34 ${b.tel}${b.coche ? ' · ' + b.coche : ''}</div></div><button onclick="CRM.close()" class="text-stone-400 text-2xl">✕</button></div>
      <div class="kpi rounded-2xl p-4"><div class="text-[11px] uppercase tracking-wider text-stone-400 font-bold mb-2">Tarjeta de fidelidad · ${done} lavados</div>
        <div class="flex gap-2">${Array.from({ length: R.fidelidad.lavados }, (_, i) => `<span class="w-10 h-10 rounded-full grid place-items-center text-lg ${i < stamps ? 'bg-eco-400 text-night-900' : 'border-2 border-dashed border-night-600 text-stone-600'}">💧</span>`).join('')}<span class="w-10 h-10 rounded-full grid place-items-center text-[11px] font-bold bg-night-700 text-eco-400">30€</span></div>
        <div class="text-[12px] text-stone-400 mt-2">${R.fidelidad.lavados - stamps} lavado(s) para el regalo · se avisa solo por WhatsApp.</div></div>
      <div class="kpi rounded-2xl p-4 text-sm space-y-1">
        <div class="flex justify-between"><span class="text-stone-400">Reserva</span><b class="text-white">${b.id}</b></div>
        <div class="flex justify-between"><span class="text-stone-400">Centro</span><span class="text-white">${c.nombre}</span></div>
        <div class="flex justify-between"><span class="text-stone-400">Cuándo</span><span class="text-white">${fmtDia(b.fecha)} · ${b.hora}</span></div>
        <div class="flex justify-between"><span class="text-stone-400">Servicio</span><span class="text-white">${s.nombre}</span></div>
        <div class="flex justify-between"><span class="text-stone-400">Importe</span><span class="text-white font-mono">${ECO.eur(b.total)}</span></div>
        <div class="flex justify-between"><span class="text-stone-400">Canal</span><span class="text-white">${canal(b.canal).nombre}</span></div>
        <div class="flex justify-between"><span class="text-stone-400">Estado</span><span class="badge ${BADGE[b.estado][1]}">${BADGE[b.estado][0]}</span></div>
        ${b.garantia ? `<div class="mt-2 rounded-xl bg-[#2a2560] text-[#d9d6ff] p-2.5 text-[12px]">🔒 Tarjeta Visa ···· 4242 en garantía (Stripe). Penalización si no se presenta: <b>${ECO.eur(penalOf(b.total))}</b>.</div>` : ''}
      </div>
      <div class="grid grid-cols-2 gap-2">
        <button ${canPenal ? '' : 'disabled'} onclick="CRM.noShow('${b.id}')" class="py-2.5 rounded-xl text-sm font-bold ${canPenal ? 'bg-[#e5484d] text-white' : 'bg-night-700 text-stone-500 cursor-not-allowed'}">No se presentó · cobrar</button>
        <button onclick="CRM.done('${b.id}')" class="py-2.5 rounded-xl text-sm font-bold bg-eco-400 text-night-900">Marcar completada</button>
      </div>
      <div><div class="text-[11px] uppercase tracking-wider text-stone-400 font-bold mb-2">Historial (${hist.length})</div>
        <div class="space-y-1.5 text-[12.5px]">${hist.slice(0, 12).map(x => `<div class="flex justify-between gap-2 border-b border-night-700 pb-1.5"><span class="text-stone-300">${x.fecha} · ${servOf(x.serv).nombre}<span class="block text-[11px] text-stone-500">${ECO.centro(x.centro).nombre} · ${canal(x.canal).nombre}</span></span><span class="text-right"><span class="font-mono text-white">${ECO.eur(x.total)}</span><span class="block badge ${BADGE[x.estado][1]}">${BADGE[x.estado][0]}</span></span></div>`).join('')}</div></div>
    </div>`;
    $('#drawer').classList.add('open');
  },
  close() { $('#drawer').classList.remove('open'); },
  noShow(id) {
    const b = Store.all.find(x => x.id === id); if (!b) return;
    b.estado = 'noshow-cobrado'; b.penal = penalOf(b.total); Store.save();
    $('#toastMsg').textContent = `💳 Stripe: cobrados ${ECO.eur(b.penal)} a ···· 4242 (PaymentIntent off_session) · ${b.id}`;
    $('#toast').classList.add('show'); setTimeout(() => $('#toast').classList.remove('show'), 4500);
    this.ficha(id); this.render();
  },
  done(id) { const b = Store.all.find(x => x.id === id); if (!b) return; b.estado = 'completada'; Store.save(); this.ficha(id); this.render(); },
  toggleTable(id) { $('#' + id).classList.toggle('hidden'); },
  autos(all) {
    const today = dKey(TODAY), tomorrow = dKey(addDays(TODAY, 1));
    const scopeN = this.centro === 'all' ? ECO.CENTROS.length : 1;
    const recs = all.filter(b => b.fecha === tomorrow && b.estado !== 'cancelada').length;
    const free = (this.centro === 'all' ? ECO.CENTROS : [ECO.centro(this.centro)]).reduce((a, c) => a + Store.slots(c.id, tomorrow, 60).filter(x => x.ok).length, 0);
    const last = new Map(); all.forEach(b => { if (b.estado === 'completada' && (!last.has(b.tel) || last.get(b.tel) < b.fecha)) last.set(b.tel, b.fecha); });
    const lim = dKey(addDays(TODAY, -90)), lim2 = dKey(addDays(TODAY, -60)); const inact = [...last.values()].filter(f => f < lim2 && f >= lim).length + Math.round(scopeN * 11);
    const reviews = all.filter(b => b.estado === 'completada' && b.fecha >= dKey(addDays(TODAY, -7))).length;
    const card = (ico, t, big, sub, btn) => `<div class="panel rounded-2xl p-4 flex flex-col justify-between gap-3"><div><div class="text-[11px] uppercase tracking-wider text-stone-400 font-bold">${ico} ${t}</div><div class="font-display font-extrabold text-2xl text-white mt-1">${big}</div><div class="text-[12px] text-stone-400 mt-1">${sub}</div></div><button onclick="this.textContent='✓ Programado';this.disabled=true" class="text-[12px] font-bold py-2 rounded-xl border border-night-600 hover:border-eco-400 text-eco-400">${btn}</button></div>`;
    $('#automations').innerHTML = [
      card('⏰', 'Recordatorio 24 h', `${recs} mañana`, 'WhatsApp con botón confirmar / cancelar. Lo que se cancela, vuelve a la agenda.', 'Ver plantilla'),
      card('⚡', 'Huecos libres mañana', `${free} huecos`, 'Oferta flash «10 € dto.» a clientes cercanos que no vienen hace 60+ días.', 'Lanzar campaña'),
      card('🔁', 'Reactivación', `${inact} clientes`, 'Sin venir entre 60 y 90 días. Ellos recomiendan lavar cada 2-3 meses.', 'Programar envío'),
      card('⭐', 'Reseñas Google', `${reviews} solicitudes`, 'Tras cada servicio completado (últimos 7 días). Solo a clientes satisfechos.', 'Ver resultados'),
    ].join('');
  },
};

/* ---------------- Arranque ---------------- */
window.UI = UI; window.Web = Web; window.WA = WA; window.VOZ = VOZ; window.CRM = CRM;
document.addEventListener('DOMContentLoaded', () => {
  Store.init(); Web.init(); UI.refreshEleven();
  $$('.tab-btn').forEach(b => b.onclick = () => UI.go(b.dataset.view));
  $('#elevenModal').onclick = e => { if (e.target.id === 'elevenModal') UI.closeEleven(); };
  $('#stripeModal').onclick = e => { if (e.target.id === 'stripeModal') $('#stripeModal').classList.add('hidden'); };
  if (window.speechSynthesis) speechSynthesis.getVoices();
  const h = location.hash.replace('#', ''); if (['web', 'wa', 'voz', 'crm', 'arq'].includes(h)) UI.go(h);
});
})();
