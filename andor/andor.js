/*
 * Andor Seguridad · Pestañas, recepción telefónica, WhatsApp y web (demo de Altera).
 * Conversaciones simuladas en el navegador: no se llama a nadie ni se envía nada.
 */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const espera = (ms) => new Promise(r => setTimeout(r, ms));
  const crm = () => window.ANDOR_CRM || { nuevoPresupuesto() {}, nuevoParte() {} };

  // ---------- Pestañas y aviso ----------
  const TABS = ['web', 'cuadrante', 'crm', 'llamada', 'whatsapp', 'inversion'];
  window.switchTab = function (id) {
    TABS.forEach(t => {
      const v = $('view-' + t), b = $('tab-btn-' + t);
      if (v) v.classList.toggle('hidden', t !== id);
      if (b) b.setAttribute('aria-selected', String(t === id));
    });
    try { history.replaceState(null, '', '#' + id); } catch (e) { /* sin historial */ }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  let tToast;
  window.anToast = function (m) {
    const t = $('anToast'); t.textContent = m; t.classList.remove('hidden');
    clearTimeout(tToast); tToast = setTimeout(() => t.classList.add('hidden'), 4200);
  };

  // ---------- Recepción telefónica 24/7 ----------
  const LLAMADAS = [
    {
      id: 'evento', icono: '🎤', titulo: 'Presupuesto para un evento', hora: 'Sábado · 21:40', quien: 'Organizadora de un concierto',
      guion: [
        ['laura', 'Andor Seguridad, buenas noches, le atiende Laura. ¿En qué puedo ayudarle?'],
        ['cliente', 'Hola, organizamos un concierto en un pabellón y necesitamos vigilantes. ¿Me podéis dar precio?'],
        ['laura', 'Claro. Para prepararle el presupuesto, ¿qué día es el concierto y cuántas personas esperan?'],
        ['cliente', 'Es el 14 de noviembre, de ocho de la tarde a una de la mañana. Unas mil quinientas personas.'],
        ['laura', 'Perfecto. ¿Necesitan también control de accesos en la entrada o solo vigilancia en el recinto?'],
        ['cliente', 'Las dos cosas, y alguien en la zona del escenario.'],
        ['laura', 'Anotado. Con ese aforo, nuestro jefe de servicio le propondrá el número de vigilantes. ¿A qué email y teléfono le enviamos el presupuesto?'],
        ['cliente', 'Al correo de la productora, y al mismo móvil desde el que llamo.'],
        ['laura', 'Hecho. Mañana antes de las doce le llega el presupuesto. Gracias por confiar en Andor Seguridad.']
      ],
      resumen: { tipo: '🧾 Presupuesto nuevo', texto: 'Concierto 14/11 · 20:00-01:00 · aforo 1.500 · accesos + recinto + escenario', siguiente: 'Jefe de servicio prepara el presupuesto antes de las 12:00' },
      crm: { cliente: 'Productora de conciertos', tipo: 'Seguridad en evento', detalle: '14/11 · 20:00-01:00 · aforo 1.500', importe: 3200, origen: 'Teléfono (Laura)' }
    },
    {
      id: 'alarma', icono: '🚨', titulo: 'Urgencia de madrugada', hora: 'Martes · 03:08', quien: 'Cliente con alarma activada',
      guion: [
        ['laura', 'Andor Seguridad, le atiende Laura. ¿En qué puedo ayudarle?'],
        ['cliente', 'Me ha saltado la alarma de la nave y en la cámara veo a alguien en el patio.'],
        ['laura', 'Entendido, esto es urgente. ¿Me confirma el nombre de la empresa y la dirección de la nave?'],
        ['cliente', 'La nave del polígono, la de la calle de los muelles.'],
        ['laura', 'Le paso ahora mismo con el jefe de servicio de guardia y aviso al vigilante del puesto. No entre usted en la nave. Le pongo en espera un segundo.'],
        ['sistema', '📲 Transferida al móvil del jefe de servicio de guardia · aviso por WhatsApp al vigilante del puesto']
      ],
      resumen: { tipo: '🚨 Urgencia transferida', texto: 'Alarma y persona en el patio de la nave · 03:08', siguiente: 'Jefe de servicio al teléfono; parte abierto en el CRM' },
      parte: { puesto: 'Nave logística', tipo: 'Alarma con presencia', vigilante: 'Jefe de servicio', texto: 'El cliente avisa a las 03:08 de alarma y una persona en el patio. Llamada transferida al jefe de servicio de guardia.', grave: true }
    },
    {
      id: 'baja', icono: '🤒', titulo: 'Un vigilante no puede ir', hora: 'Domingo · 06:15', quien: 'Vigilante de la plantilla',
      guion: [
        ['laura', 'Andor Seguridad, le atiende Laura.'],
        ['cliente', 'Hola Laura, soy Rocío Navarro. Tengo fiebre y hoy no puedo hacer mi turno de tarde.'],
        ['laura', 'Vaya, que te mejores. Te quito el turno de hoy en la nave logística, de dos a diez.'],
        ['laura', 'Ya tengo sustituto: Manuel Requena está libre, ha descansado sus doce horas y no se pasa de horas. Le aviso ahora por WhatsApp.'],
        ['cliente', 'Gracias. Mañana os mando el parte de baja.'],
        ['laura', 'Perfecto. Cuando lo tengas, mándalo por WhatsApp a este mismo número. Mejórate.']
      ],
      resumen: { tipo: '🗓️ Cambio de turno', texto: 'Rocío Navarro de baja hoy · Nave logística 14:00-22:00', siguiente: 'Sustituto avisado: Manuel Requena (pendiente de confirmar)' }
    }
  ];

  let llamadaActiva = 0;
  function hablar(texto) {
    if (!$('llamadaVoz').checked || !('speechSynthesis' in window)) return Promise.resolve();
    return new Promise(res => {
      try {
        const u = new SpeechSynthesisUtterance(texto); u.lang = 'es-ES'; u.rate = 1.05;
        const v = speechSynthesis.getVoices().find(x => /^es(-|_)ES/i.test(x.lang) && /female|mujer|helena|laura|elvira|monica|lucia/i.test(x.name)) || speechSynthesis.getVoices().find(x => /^es/i.test(x.lang));
        if (v) u.voice = v;
        u.onend = res; u.onerror = res; speechSynthesis.speak(u);
        setTimeout(res, 9000);
      } catch (e) { res(); }
    });
  }
  async function reproducir(i) {
    const L = LLAMADAS[i]; const id = ++llamadaActiva;
    try { speechSynthesis.cancel(); } catch (e) { /* sin voz */ }
    document.querySelectorAll('[data-llamada]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.llamada === i)));
    $('llamadaTranscripcion').innerHTML = ''; $('llamadaResumen').classList.add('hidden');
    $('llamadaQuien').textContent = L.quien; $('llamadaEstado').textContent = L.hora + ' · llamada entrante';
    $('llamadaOnda').classList.remove('parado');
    await espera(600);
    for (const [quien, texto] of L.guion) {
      if (id !== llamadaActiva) return;
      const cls = quien === 'laura' ? 'bg-oro-400 text-marino-950 mr-8' : quien === 'cliente' ? 'bg-white/10 text-white ml-8' : 'bg-emerald-500/20 text-emerald-100 text-center text-xs';
      $('llamadaTranscripcion').insertAdjacentHTML('beforeend', `<div class="rounded-2xl px-3 py-2 ${cls}">${quien === 'laura' ? '<p class="text-[10px] font-bold opacity-70">LAURA</p>' : quien === 'cliente' ? '<p class="text-[10px] font-bold opacity-60">LLAMANTE</p>' : ''}${esc(texto)}</div>`);
      $('llamadaTranscripcion').scrollTop = 1e6;
      if (quien === 'laura') await hablar(texto); else await espera(quien === 'sistema' ? 900 : Math.min(2600, 700 + texto.length * 28));
      await espera(250);
    }
    if (id !== llamadaActiva) return;
    $('llamadaOnda').classList.add('parado'); $('llamadaEstado').textContent = 'Llamada finalizada · guardada en el CRM';
    const r = L.resumen;
    $('llamadaResumen').innerHTML = `<p class="font-bold text-marino-900">${r.tipo}</p><p>${esc(r.texto)}</p><p class="text-slate-500">Siguiente paso: ${esc(r.siguiente)}</p>`;
    $('llamadaResumen').classList.remove('hidden');
    if (L.crm) crm().nuevoPresupuesto(L.crm);
    if (L.parte) crm().nuevoParte(L.parte);
  }
  function pintarEscenarios() {
    $('llamadaEscenarios').innerHTML = LLAMADAS.map((L, i) => `
      <button type="button" data-llamada="${i}" aria-pressed="false" class="text-left bg-white rounded-2xl border border-marino-100 card-shadow p-4 space-y-1 hover:border-marino-300 active:scale-[.98] aria-pressed:border-oro-400 aria-pressed:ring-2 aria-pressed:ring-oro-300 transition">
        <p class="text-2xl">${L.icono}</p><p class="font-semibold text-marino-900">${L.titulo}</p><p class="text-xs text-slate-500">${L.hora}</p><p class="text-xs font-bold text-marino-700 pt-1">▶ Escuchar</p></button>`).join('');
    document.querySelectorAll('[data-llamada]').forEach(b => b.onclick = () => reproducir(+b.dataset.llamada));
    $('llamadaColgar').onclick = () => { llamadaActiva++; try { speechSynthesis.cancel(); } catch (e) { /* sin voz */ } $('llamadaOnda').classList.add('parado'); $('llamadaEstado').textContent = 'Llamada colgada'; };
  }

  // ---------- WhatsApp ----------
  let modo = 'cliente', paso = 0, datos = {};
  const SUGERENCIAS = {
    cliente: ['Necesito vigilantes para un evento', 'Quiero vigilancia para una obra', 'Busco control de accesos para mi empresa', '¿Estáis habilitados para trabajar en toda España?'],
    vigilante: ['Quiero dar un parte', '¿Qué turno tengo mañana?', 'No puedo ir a mi turno']
  };
  function burbuja(texto, mio, botones) {
    const chat = $('waChat');
    const b = botones ? `<div class="flex flex-wrap gap-1.5 mt-2">${botones.map(x => `<button type="button" data-wa-btn="${esc(x)}" class="min-h-[34px] px-3 rounded-full border border-[#00a884] text-[#008069] bg-white hover:bg-emerald-50 active:scale-95 text-xs font-semibold transition">${esc(x)}</button>`).join('')}</div>` : '';
    chat.insertAdjacentHTML('beforeend', `<div class="flex ${mio ? 'justify-end' : 'justify-start'}"><div class="max-w-[85%] rounded-xl px-3 py-2 text-[13px] shadow-sm ${mio ? 'bg-[#d9fdd3]' : 'bg-white'}">${texto}${b}<p class="text-[10px] text-slate-400 text-right mt-0.5">${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}${mio ? ' ✓✓' : ''}</p></div></div>`);
    chat.scrollTop = 1e6;
    chat.querySelectorAll('[data-wa-btn]').forEach(x => x.onclick = () => enviar(x.dataset.waBtn));
  }
  async function responder(texto, botones) {
    $('waSub').textContent = 'escribiendo…'; await espera(700 + Math.min(texto.length * 8, 900));
    $('waSub').textContent = 'Cuenta de empresa · responde al momento'; burbuja(texto, false, botones);
  }
  function oficina(html) { $('waOficina').innerHTML = html; }

  async function enviar(t) {
    t = String(t || '').trim(); if (!t) return;
    burbuja(esc(t), true); $('waInput').value = '';
    const m = t.toLowerCase();
    if (modo === 'cliente') return flujoCliente(m, t);
    return flujoVigilante(m, t);
  }

  async function flujoCliente(m, t) {
    if (/habilitad|españa|nacional/.test(m) && paso === 0) {
      return responder('Sí. Andor Seguridad es una empresa de seguridad privada <strong>habilitada a nivel nacional</strong>. Trabajamos desde Albacete y damos servicio donde nos necesites. ¿Qué servicio buscas?', ['Evento', 'Vigilancia de instalaciones', 'Obra', 'Control de accesos']);
    }
    if (paso === 0) {
      datos = {};
      const tipo = /evento|concierto|feria|partido|fiesta/.test(m) ? 'Seguridad en evento' : /obra/.test(m) ? 'Vigilancia de obra' : /acceso/.test(m) ? 'Control de accesos' : /vigilan|nave|instala/.test(m) ? 'Vigilancia de instalaciones' : null;
      if (!tipo) return responder('Hola, soy el asistente de Andor Seguridad 👋 ¿Qué servicio necesitas?', ['Evento', 'Vigilancia de instalaciones', 'Obra', 'Control de accesos']);
      datos.tipo = tipo; paso = 1;
      return responder(`Perfecto, <strong>${tipo.toLowerCase()}</strong>. ¿Qué días y en qué horario lo necesitas?`, tipo === 'Seguridad en evento' ? ['Un día, por la tarde-noche', 'Fin de semana completo'] : ['Todas las noches', '24 horas', 'De lunes a viernes']);
    }
    if (paso === 1) {
      if (/^evento$/.test(m) || /^obra$/.test(m) || /^control de accesos$/.test(m) || /^vigilancia de instalaciones$/.test(m)) { paso = 0; return flujoCliente(m, t); }
      datos.horario = t; paso = 2;
      return responder(datos.tipo === 'Seguridad en evento' ? '¿Cuántas personas esperáis? Con el aforo calculamos los vigilantes.' : '¿Cuántos vigilantes crees que hacen falta? Si no lo sabes, te lo decimos tras una visita sin compromiso.', datos.tipo === 'Seguridad en evento' ? ['Menos de 500', 'Entre 500 y 2.000', 'Más de 2.000'] : ['1 vigilante', '2 vigilantes', 'No lo sé']);
    }
    if (paso === 2) {
      datos.dimension = t; paso = 3;
      return responder('¿En qué población es el servicio?', ['Albacete', 'Otra provincia']);
    }
    if (paso === 3) {
      datos.lugar = t; paso = 4;
      return responder('Por último, ¿a nombre de qué empresa o persona preparamos el presupuesto?');
    }
    if (paso === 4) {
      datos.cliente = t.slice(0, 40); paso = 0;
      await responder(`Gracias. Resumen de tu petición:<br>• ${esc(datos.tipo)}<br>• ${esc(datos.horario)}<br>• ${esc(datos.dimension)}<br>• ${esc(datos.lugar)}<br><br>Nuestro jefe de servicio te envía el <strong>presupuesto en 24 horas</strong>. Si hace falta, os visitamos antes sin compromiso.`);
      crm().nuevoPresupuesto({ cliente: datos.cliente, tipo: datos.tipo, detalle: datos.horario + ' · ' + datos.dimension + ' · ' + datos.lugar, importe: datos.tipo === 'Seguridad en evento' ? 2800 : 4500, origen: 'WhatsApp' });
      oficina(`<div class="rounded-xl border-2 border-oro-300 bg-oro-50 p-3 space-y-1"><p class="font-bold text-marino-900">🧾 Presupuesto nuevo en el CRM</p><p>${esc(datos.cliente)} · ${esc(datos.tipo)}</p><p class="text-xs text-slate-600">${esc(datos.horario)} · ${esc(datos.dimension)} · ${esc(datos.lugar)}</p><button type="button" onclick="switchTab('crm'); window.ANDOR_CRM && ANDOR_CRM.crmTab('presupuestos')" class="text-xs font-bold text-marino-700 hover:underline">Verlo en el CRM →</button></div>`);
    }
  }

  async function flujoVigilante(m, t) {
    if (paso === 0) {
      if (/turno|mañana|cuadrante/.test(m) && !/no puedo/.test(m)) {
        return responder('Hola Rocío. Mañana, <strong>martes 20</strong>, tienes <strong>tarde en la Nave logística</strong>, de 14:00 a 22:00. Ficha con el QR de la garita al llegar.');
      }
      if (/no puedo|enferm|fiebre|baja/.test(m)) {
        await responder('Siento que no estés bien, Rocío. He avisado al jefe de servicio y el cuadrante ya propone a <strong>Manuel Requena</strong> para cubrir tu turno (está libre y ha descansado sus 12 horas). Cuando tengas el parte médico, mándalo por aquí.');
        return oficina('<div class="rounded-xl border-2 border-oro-300 bg-oro-50 p-3"><p class="font-bold text-marino-900">🗓️ Cambio en el cuadrante</p><p class="text-xs text-slate-600">Rocío Navarro no puede ir · sustituto propuesto: Manuel Requena · pendiente de que confirme</p></div>');
      }
      if (/parte|incidencia|aviso|robo|daño|alarma/.test(m)) {
        datos = {}; paso = 11;
        return responder('Vamos con el parte. ¿Qué ha pasado?', ['Intrusión o intento', 'Daños en la instalación', 'Alarma', 'Otra incidencia']);
      }
      return responder('Hola Rocío 👮 Puedo ayudarte a dar un parte, consultar tu turno o avisar si no puedes ir.', ['Quiero dar un parte', '¿Qué turno tengo mañana?', 'No puedo ir a mi turno']);
    }
    if (paso === 11) { datos.tipo = t; paso = 12; return responder('Cuéntame en pocas palabras qué has visto y qué has hecho.'); }
    if (paso === 12) { datos.texto = t; paso = 13; return responder('Gracias. Si puedes, manda una foto.', ['📷 Enviar foto', 'No tengo foto']); }
    if (paso === 13) {
      paso = 0;
      if (/foto/.test(m) && !/no tengo/.test(m)) { await espera(300); burbuja('<div class="w-48 h-28 rounded-lg bg-[repeating-linear-gradient(45deg,#cbd5e1,#cbd5e1_10px,#e2e8f0_10px,#e2e8f0_20px)] flex items-center justify-center text-xs text-slate-600">📷 foto_puesto.jpg</div>', true); }
      await responder('✅ Parte registrado con la hora y tu puesto: <strong>Nave logística</strong>. La oficina lo revisa y se lo envía al cliente.');
      crm().nuevoParte({ puesto: 'Nave logística', tipo: datos.tipo, vigilante: 'Rocío Navarro', texto: datos.texto, grave: /intrus|alarma/i.test(datos.tipo) });
      oficina(`<div class="rounded-xl border-2 border-oro-300 bg-oro-50 p-3 space-y-1"><p class="font-bold text-marino-900">🚨 Parte nuevo en el CRM</p><p>${esc(datos.tipo)} · Nave logística</p><p class="text-xs text-slate-600">${esc(datos.texto)}</p><button type="button" onclick="switchTab('crm'); window.ANDOR_CRM && ANDOR_CRM.crmTab('incidencias')" class="text-xs font-bold text-marino-700 hover:underline">Verlo en el CRM →</button></div>`);
    }
  }

  function setModo(m) {
    modo = m; paso = 0; datos = {};
    document.querySelectorAll('.wa-modo').forEach(b => {
      const on = b.dataset.waModo === m; b.setAttribute('aria-selected', String(on));
      b.classList.toggle('bg-marino-800', on); b.classList.toggle('text-white', on); b.classList.toggle('text-marino-700', !on);
    });
    $('waSugerencias').innerHTML = SUGERENCIAS[m].map(s => `<button type="button" data-wa-sug="${esc(s)}" class="min-h-[40px] px-3 rounded-full bg-white border border-marino-100 text-sm hover:border-marino-400 active:scale-95 transition">${esc(s)}</button>`).join('');
    document.querySelectorAll('[data-wa-sug]').forEach(b => b.onclick = () => enviar(b.dataset.waSug));
    $('waChat').innerHTML = '';
    burbuja(m === 'cliente' ? 'Hola 👋 Has escrito a <strong>Andor Seguridad</strong>. ¿En qué podemos ayudarte?' : 'Hola Rocío 👮 Soy el asistente de Andor. ¿Qué necesitas?', false, m === 'cliente' ? ['Evento', 'Vigilancia de instalaciones', 'Obra', 'Control de accesos'] : ['Quiero dar un parte', '¿Qué turno tengo mañana?', 'No puedo ir a mi turno']);
    oficina('<p class="text-slate-500">Cuando el asistente termine, aquí verás la ficha que se crea en el CRM.</p>');
  }
  window.anWaModo = setModo;

  // ---------- Web nueva: servicios y formulario ----------
  const SERVICIOS = [
    { i: '🛡️', t: 'Vigilancia y protección', d: 'Instalaciones públicas y privadas, vigilancia perimetral y rondas, con presencia preventiva y respuesta rápida.' },
    { i: '🪪', t: 'Control de accesos', d: 'Verificación de personas y gestión ordenada de entradas y salidas en edificios, recintos y eventos.' },
    { i: '🎪', t: 'Seguridad en eventos', d: 'Ferias, festivales y partidos: flujo de público, prevención de riesgos y gestión de incidencias.' },
    { i: '⚡', t: 'Infraestructuras críticas', d: 'Plantas fotovoltaicas, parques eólicos y subestaciones con vigilancia técnica y control perimetral.' },
    { i: '🤝', t: 'Personal auxiliar y azafatas', d: 'Atención al público, información y apoyo operativo en ferias, congresos y espacios comerciales.' },
    { i: '📦', t: 'Carga, descarga y logística', d: 'Apoyo en montajes, recepción de mercancía y control de instalaciones, coordinado con la vigilancia.' }
  ];
  const SECTORES = [
    { f: 'renovables', ic: 'panel-solar', t: 'Energías renovables', p: 'ISFV Covatillas (150 MW) · ISFV Campanario (80 MW) · parques eólicos y subestaciones' },
    { f: 'eventos', ic: 'festival', t: 'Ferias, eventos y espectáculos', p: 'Feria de Albacete · FENAVIN · Viña Rock · Abycine · Festival de les Arts' },
    { f: 'deportivos', ic: 'trofeo', t: 'Eventos deportivos', p: 'Albacete Balompié · F.C. Cartagena · ElPozo Murcia · Albacete Fútbol Sala' },
    { f: 'industria', ic: 'fabrica', t: 'Industria e infraestructuras', p: 'ADIF · vías del AVE · polígonos industriales · obras de construcción' }
  ];
  const VALORES = [
    ['Seriedad y compromiso', 'Cumplimos lo acordado con el cliente y con nuestros profesionales.'],
    ['Rigor profesional', 'Procedimientos claros, controles internos y supervisión constante.'],
    ['Legalidad', 'Cada servicio conforme a la normativa de seguridad privada y laboral.'],
    ['Eficacia operativa', 'Prevención de incidentes, respuesta rápida y continuidad del servicio.'],
    ['Discreción y confidencialidad', 'Máxima reserva con la información del cliente en cada intervención.']
  ];
  let webPaso = 1; const web = {};
  const CAMPOS = {
    1: `<label class="block"><span class="text-xs font-semibold text-slate-600">¿Qué servicio necesitas?</span><select id="wf1" class="mt-1 w-full min-h-[44px] px-3 rounded-xl border border-marino-100 bg-white text-sm">${SERVICIOS.map(s => `<option>${s.t}</option>`).join('')}</select></label>
        <label class="block"><span class="text-xs font-semibold text-slate-600">¿Para cuándo?</span><input id="wf2" type="text" maxlength="60" placeholder="Ej.: del 1 al 15 de diciembre" class="mt-1 w-full min-h-[44px] px-3 rounded-xl border border-marino-100 text-sm"></label>`,
    2: `<label class="block"><span class="text-xs font-semibold text-slate-600">Horario</span><select id="wf3" class="mt-1 w-full min-h-[44px] px-3 rounded-xl border border-marino-100 bg-white text-sm"><option>Noches (22:00-06:00)</option><option>24 horas</option><option>Horario comercial</option><option>Solo el día del evento</option></select></label>
        <label class="block"><span class="text-xs font-semibold text-slate-600">Población</span><input id="wf4" type="text" maxlength="40" placeholder="Albacete" class="mt-1 w-full min-h-[44px] px-3 rounded-xl border border-marino-100 text-sm"></label>`,
    3: `<label class="block"><span class="text-xs font-semibold text-slate-600">Empresa o nombre</span><input id="wf5" type="text" maxlength="40" placeholder="Empresa de ejemplo" class="mt-1 w-full min-h-[44px] px-3 rounded-xl border border-marino-100 text-sm"></label>
        <label class="block"><span class="text-xs font-semibold text-slate-600">Teléfono o email</span><input id="wf6" type="text" maxlength="60" placeholder="600 000 000" class="mt-1 w-full min-h-[44px] px-3 rounded-xl border border-marino-100 text-sm"></label>
        <label class="flex items-start gap-2 text-[11px] text-slate-600"><input type="checkbox" checked class="mt-0.5 w-4 h-4 accent-marino-800"> Acepto que Andor me contacte para este presupuesto.</label>`
  };
  function pintarPaso() {
    $('webCampos').innerHTML = CAMPOS[webPaso];
    $('webPaso').textContent = 'Paso ' + webPaso + ' de 3';
    $('webSiguiente').textContent = webPaso === 3 ? 'Pedir presupuesto' : 'Siguiente';
  }
  function webEnviar(e) {
    e.preventDefault();
    const val = (id) => ($(id) || {}).value || '';
    if (webPaso === 1) { web.tipo = val('wf1'); web.cuando = val('wf2') || 'Fechas por concretar'; }
    if (webPaso === 2) { web.horario = val('wf3'); web.lugar = val('wf4') || 'Albacete'; }
    if (webPaso === 3) {
      web.cliente = val('wf5') || 'Empresa de ejemplo';
      crm().nuevoPresupuesto({ cliente: web.cliente, tipo: web.tipo, detalle: web.cuando + ' · ' + web.horario + ' · ' + web.lugar, importe: 3900, origen: 'Web' });
      $('webConfirmacion').innerHTML = '<div class="rounded-xl bg-emerald-50 text-emerald-800 text-sm p-3">✅ Recibido. Te enviamos el presupuesto en 24 horas. <button type="button" onclick="switchTab(\'crm\'); window.ANDOR_CRM && ANDOR_CRM.crmTab(\'presupuestos\')" class="font-bold underline">Ver cómo llega al CRM</button></div>';
      webPaso = 1; pintarPaso(); return;
    }
    webPaso++; pintarPaso();
  }

  document.addEventListener('DOMContentLoaded', () => {
    pintarEscenarios();
    document.querySelectorAll('.wa-modo').forEach(b => b.onclick = () => setModo(b.dataset.waModo));
    $('waForm').onsubmit = (e) => { e.preventDefault(); enviar($('waInput').value); };
    $('waReset').onclick = () => setModo(modo);
    setModo('cliente');
    $('webServicios').innerHTML = SERVICIOS.map(s => `<div class="rounded-2xl border border-marino-100 p-5 space-y-2 bg-white hover:-translate-y-0.5 hover:shadow-lg transition"><p class="w-11 h-11 rounded-xl bg-oro-50 text-2xl flex items-center justify-center" aria-hidden="true">${s.i}</p><h5 class="font-display font-bold text-lg text-marino-900">${s.t}</h5><p class="text-sm text-slate-600 leading-relaxed">${s.d}</p></div>`).join('');
    $('webSectores').innerHTML = SECTORES.map(s => `<article class="rounded-2xl overflow-hidden bg-marino-900 border border-white/10"><img src="img/${s.f}.webp" alt="Servicio de Andor Seguridad: ${s.t.toLowerCase()}" loading="lazy" class="w-full h-40 object-cover"><div class="p-4 space-y-2"><div class="flex items-center gap-2"><img src="img/icono-${s.ic}.png" alt="" class="w-7 h-7"><h5 class="font-display font-bold text-lg leading-tight">${s.t}</h5></div><p class="text-xs text-marino-200 leading-relaxed">${s.p}</p></div></article>`).join('');
    $('webValores').innerHTML = VALORES.map((v, i) => `<div class="rounded-xl border border-marino-100 p-4 flex gap-3 ${i === 4 ? 'sm:col-span-2' : ''}"><span class="w-8 h-8 shrink-0 rounded-full bg-oro-300 text-marino-950 font-display font-bold flex items-center justify-center">${i + 1}</span><div><p class="font-bold text-marino-900">${v[0]}</p><p class="text-sm text-slate-600">${v[1]}</p></div></div>`).join('');
    pintarPaso(); $('webForm').onsubmit = webEnviar;
    const ini = (location.hash || '').slice(1);
    window.switchTab(TABS.includes(ini) ? ini : 'web');
  });
})();
