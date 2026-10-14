/*
 * El Sueño del Quesero · CRM de clientes y pedidos (demo).
 * Datos de ejemplo: nombres genéricos, teléfonos ocultos e importes orientativos.
 * Secciones: Recuperar clientes, Resumen, Clientes (ficha + historial), Pedidos y recogidas, Campañas.
 */
(function () {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const Q = window.QUESERO = window.QUESERO || {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const eur = n => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const eur0 = n => Math.round(n).toLocaleString('es-ES') + ' €';
  const hace = dias => { const d = new Date(); d.setDate(d.getDate() - dias); return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }); };
  const nombreQueso = id => (Q.byId && Q.byId(id) ? Q.byId(id).nombre : id);
  const imgQueso = id => (Q.byId && Q.byId(id) ? Q.byId(id).img : '');

  // ------------------------------------------------------------------ Clientes de ejemplo
  // dias: días desde la última compra. consentimiento: lo que el cliente aceptó (RGPD) para recibir avisos.
  const cli = (id, nombre, tel, email, desde, canal, dias, pedidos, gasto, favoritos, etiquetas, consentimiento, historial, nota) =>
    ({ id, nombre, tel, email, desde, canal, dias, pedidos, gasto, favoritos, etiquetas, consentimiento, historial, nota });

  const clientes = [
    cli('c1', 'Carmen L.', '6XX XX 31 08', 'carmen.l@ejemplo.com', '2018', 'Mostrador', 142, 23, 1180, ['payoyo', 'manchego-curado'], ['Cliente fiel', 'Cabra'], { wa: true, email: true },
      [{ dias: 142, texto: 'Payoyo 500 g + manchego curado 250 g', importe: 21.5 }, { dias: 170, texto: 'Tabla para 4 personas', importe: 32 }, { dias: 205, texto: 'Payoyo 250 g + rulo de cabra', importe: 13 }], 'Siempre pregunta por quesos de cabra nuevos.'),
    cli('c2', 'Antonio G.', '6XX XX 77 41', 'antonio.g@ejemplo.com', '2019', 'Mostrador', 96, 31, 1640, ['azul-asturiano', 'gorgonzola'], ['Amante del azul'], { wa: true, email: false },
      [{ dias: 96, texto: 'Azul asturiano 500 g', importe: 18 }, { dias: 120, texto: 'Gorgonzola 250 g + azul 250 g', importe: 16.25 }], 'Le avisamos cuando llega azul de cueva.'),
    cli('c3', 'Lucía M.', '6XX XX 12 90', 'lucia.m@ejemplo.com', '2021', 'Instagram', 318, 4, 236, ['lote-regalo'], ['Regalos', 'Navidad'], { wa: true, email: true },
      [{ dias: 318, texto: '3 lotes regalo «La Mancha» (Navidad)', importe: 135 }, { dias: 680, texto: '2 lotes regalo', importe: 90 }], 'Compra lotes cada Navidad para su familia.'),
    cli('c4', 'Empresa de ejemplo S.L.', '9XX XX XX 20', 'compras@empresa-ejemplo.com', '2022', 'Email', 330, 3, 1350, ['lote-regalo'], ['Empresa', 'Navidad'], { wa: false, email: true },
      [{ dias: 330, texto: '25 lotes regalo para clientes', importe: 1125 }, { dias: 700, texto: '5 lotes regalo', importe: 225 }], 'Pedido grande de lotes en diciembre.'),
    cli('c5', 'Pedro S.', '6XX XX 58 13', 'pedro.s@ejemplo.com', '2020', 'WhatsApp', 74, 18, 760, ['manchego-curado', 'oveja-aceite'], ['Manchego'], { wa: true, email: false },
      [{ dias: 74, texto: 'Manchego curado 1 kg', importe: 26 }, { dias: 101, texto: 'Oveja en aceite 500 g', importe: 16 }], ''),
    cli('c6', 'Isabel R.', '6XX XX 63 27', 'isabel.r@ejemplo.com', '2023', 'Web', 205, 6, 214, ['torta', 'brie'], ['Cremosos'], { wa: true, email: true },
      [{ dias: 205, texto: 'Torta de oveja + brie 250 g', importe: 21 }, { dias: 260, texto: 'Cata guiada (2 personas)', importe: 36 }], 'Vino a una cata con su pareja.'),
    cli('c7', 'Miguel Á. T.', '6XX XX 49 02', 'miguel.t@ejemplo.com', '2017', 'Mostrador', 12, 64, 3120, ['manchego-curado', 'comte', 'idiazabal'], ['Cliente fiel', 'Semanal'], { wa: true, email: true },
      [{ dias: 12, texto: 'Comté 250 g + Idiazabal 250 g', importe: 17.75 }, { dias: 19, texto: 'Manchego curado 500 g', importe: 13 }], 'Viene casi todas las semanas.'),
    cli('c8', 'Rosa P.', '6XX XX 85 66', '', '2024', 'WhatsApp', 33, 5, 118, ['rulo-cabra', 'manchego-semi'], ['Familia'], { wa: true, email: false },
      [{ dias: 33, texto: 'Semicurado 1 kg + rulo de cabra', importe: 24.5 }], ''),
    cli('c9', 'Javier N.', '6XX XX 20 74', 'javier.n@ejemplo.com', '2022', 'Instagram', 188, 7, 265, ['azul-asturiano', 'torta'], ['Tablas'], { wa: false, email: false },
      [{ dias: 188, texto: 'Tabla para 4 + azul 250 g', importe: 41 }], 'No dio permiso para avisos: no se le escribe.'),
    cli('c10', 'Elena F.', '6XX XX 39 51', 'elena.f@ejemplo.com', '2019', 'Mostrador', 120, 15, 540, ['romero', 'payoyo'], ['Aromáticos'], { wa: true, email: true },
      [{ dias: 120, texto: 'Oveja al romero 500 g', importe: 13.5 }, { dias: 150, texto: 'Payoyo 250 g', importe: 7.5 }], '')
  ];

  // Mensaje personalizado según lo que compraba cada cliente.
  function mensajePara(c, canal) {
    const fav = c.favoritos[0];
    const n = /S\.L\./.test(c.nombre) ? 'equipo de ' + c.nombre : c.nombre.split(' ')[0];
    const base = {
      'payoyo': `Hola ${n} 👋 Te escribimos desde El Sueño del Quesero. Nos ha llegado un queso de cabra nuevo que creo que te va a encantar, en la línea del payoyo que te llevabas. ¿Te guardo un trozo para que lo pruebes?`,
      'azul-asturiano': `Hola ${n} 👋 Esta semana ha llegado azul de cueva recién salido. Como sé que te gusta, te aviso antes de que vuele. ¿Te reservo medio kilo?`,
      'lote-regalo': `Hola ${n} 🎄 Ya estamos preparando los lotes de Navidad. El año pasado te llevaste los lotes «La Mancha»: si nos dices cuántos necesitas, te los dejamos listos sin esperas.`,
      'manchego-curado': `Hola ${n} 👋 Hace tiempo que no te vemos por la tienda. Tenemos manchego curado de la nueva partida en su punto. ¿Te aparto un trozo?`,
      'torta': `Hola ${n} 👋 Vuelve la temporada de tortas cremosas. ¿Te guardo una para este fin de semana?`,
      'romero': `Hola ${n} 👋 Te echamos de menos por la tienda. Tenemos el queso al romero que te gustaba y un par de novedades aromáticas. ¿Te apetece probarlas?`
    }[fav] || `Hola ${n} 👋 Hace tiempo que no te vemos por El Sueño del Quesero. Tenemos novedades que te pueden gustar. ¿Te enseño algunas?`;
    const enlace = canal === 'email' ? '\n\nReserva aquí y recoge en Calle Rosario, 58: elsuenodelquesero.es/reservar' : '\n\n👉 Responde «Sí» y te lo dejamos preparado.';
    return base + enlace;
  }

  // ------------------------------------------------------------------ Pedidos (las reservas nuevas llegan desde la web y WhatsApp)
  const ESTADOS = [
    { id: 'nuevo', nombre: 'Nuevo', color: 'bg-sky-100 text-sky-800' },
    { id: 'preparando', nombre: 'Preparando', color: 'bg-amber-100 text-amber-800' },
    { id: 'listo', nombre: 'Listo para recoger', color: 'bg-emerald-100 text-emerald-800' },
    { id: 'recogido', nombre: 'Recogido', color: 'bg-stone-200 text-stone-700' }
  ];
  const pedidosBase = [
    { codigo: 'QS-1040', cliente: 'Miguel Á. T.', canal: 'WhatsApp', recogida: 'Hoy · 13:00', pago: 'Paga en tienda', estado: 'listo', lineas: [{ id: 'manchego-curado', cantidad: 500 }, { id: 'comte', cantidad: 250 }] },
    { codigo: 'QS-1041', cliente: 'Rosa P.', canal: 'WhatsApp', recogida: 'Hoy · 18:00', pago: 'Pagado online', estado: 'preparando', lineas: [{ id: 'tabla-4', cantidad: 1 }] },
    { codigo: 'QS-1042', cliente: 'Cliente de ejemplo (web)', canal: 'Web', recogida: 'Mañana · 11:00', pago: 'Paga en tienda', estado: 'nuevo', lineas: [{ id: 'cata', cantidad: 2 }] }
  ];

  const estado = {
    tab: 'recuperar',
    umbral: 90,
    enviados: {},        // id cliente → canal
    respuestas: {},      // id cliente → true si ya reservó
    leads: [],
    campanaEnviada: {}
  };

  function todosLosPedidos() {
    const extra = (Q.reservas || []);
    if (!estado._pedidos) estado._pedidos = pedidosBase.map(p => Object.assign({}, p, { total: p.lineas.reduce((s, l) => s + Q.precioLinea(Q.byId(l.id), l.cantidad), 0) }));
    return extra.concat(estado._pedidos);
  }

  // ------------------------------------------------------------------ Render común
  let toastTimer;
  function toast(msg) {
    const t = $('#crmToast');
    if (!t) return;
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add('hidden'), 3200);
  }

  function mostrar(tab) {
    estado.tab = tab;
    $$('.crm-tab').forEach(b => {
      const activo = b.dataset.crmTab === tab;
      b.classList.toggle('bg-vino-800', activo);
      b.classList.toggle('text-white', activo);
      b.classList.toggle('text-stone-600', !activo);
      b.classList.toggle('hover:bg-queso-50', !activo);
      b.setAttribute('aria-selected', activo ? 'true' : 'false');
    });
    $$('.crm-pane').forEach(p => p.classList.toggle('hidden', p.id !== 'crm-' + tab));
    render();
  }
  Q.crmMostrar = mostrar;

  function render() {
    ({ recuperar: renderRecuperar, resumen: renderResumen, clientes: renderClientes, pedidos: renderPedidos, campanas: renderCampanas })[estado.tab]();
    const pend = todosLosPedidos().filter(p => p.estado !== 'recogido').length;
    const b = $('#crmBadgePedidos'); if (b) b.textContent = pend;
  }

  const chip = (txt, cls = 'bg-queso-100 text-queso-800') => `<span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ${cls}">${esc(txt)}</span>`;
  const tarjeta = (titulo, valor, sub, cls = 'text-vino-800') => `<div class="bg-white rounded-2xl border border-queso-200 p-4 card-shadow"><p class="text-xs text-stone-500">${titulo}</p><p class="font-display text-2xl font-bold mt-1 ${cls}">${valor}</p><p class="text-[11px] text-stone-500 mt-1">${sub}</p></div>`;

  // ------------------------------------------------------------------ 1. RECUPERAR CLIENTES
  function dormidos() {
    return clientes.filter(c => c.dias >= estado.umbral).sort((a, b) => b.gasto - a.gasto);
  }

  function renderRecuperar() {
    const lista = dormidos();
    const contactables = lista.filter(c => c.consentimiento.wa || c.consentimiento.email);
    const valor = lista.reduce((s, c) => s + c.gasto / Math.max(1, (new Date().getFullYear() - +c.desde + 1)), 0);
    const recuperados = Object.keys(estado.respuestas).length;
    $('#crm-recuperar').innerHTML = `
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${tarjeta('Clientes sin comprar', lista.length, `Llevan más de ${estado.umbral} días sin pasar`, 'text-vino-700')}
        ${tarjeta('Con permiso para avisarles', contactables.length, 'Aceptaron WhatsApp o email (RGPD)', 'text-oliva-700')}
        ${tarjeta('Gasto medio anual de este grupo', eur0(valor), 'Lo que se pierde si no vuelven (orientativo)', 'text-queso-700')}
        ${tarjeta('Recuperados en la demo', recuperados, recuperados ? 'Han reservado tras el aviso' : 'Envía un aviso y simula la respuesta', 'text-emerald-700')}
      </div>
      <div class="bg-white rounded-2xl border border-queso-200 card-shadow p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div class="space-y-1">
          <p class="font-semibold text-stone-800">¿Cuánto tiempo sin comprar?</p>
          <div class="flex flex-wrap gap-2" role="group" aria-label="Días sin comprar">
            ${[60, 90, 180, 300].map(d => `<button type="button" data-umbral="${d}" class="min-h-[40px] px-4 rounded-full text-sm font-semibold border ${estado.umbral === d ? 'bg-vino-800 text-white border-vino-800' : 'bg-white text-stone-700 border-queso-200 hover:border-vino-600'}">+${d} días</button>`).join('')}
          </div>
        </div>
        <button type="button" data-enviar-todos class="min-h-[44px] px-5 rounded-xl bg-[#00a884] hover:bg-[#008f72] text-white font-bold text-sm">📲 Avisar a todos los que dieron permiso</button>
      </div>
      <div class="grid gap-3">
        ${lista.map(filaRecuperar).join('') || '<p class="text-sm text-stone-500 p-4">Nadie lleva tanto tiempo sin comprar. 🎉</p>'}
      </div>`;
  }

  function filaRecuperar(c) {
    const enviado = estado.enviados[c.id];
    const respondio = estado.respuestas[c.id];
    const puedeWA = c.consentimiento.wa, puedeEmail = c.consentimiento.email && c.email;
    const canalDefecto = puedeWA ? 'whatsapp' : 'email';
    let acciones;
    if (!puedeWA && !puedeEmail) acciones = `<p class="text-xs text-stone-500 bg-stone-50 rounded-lg p-2">🔒 No aceptó recibir avisos. El CRM no le escribe (protección de datos).</p>`;
    else if (respondio) acciones = `<p class="text-sm font-semibold text-emerald-700">✅ Ha reservado: ${esc(respondio)}</p>`;
    else if (enviado) acciones = `<div class="flex flex-wrap items-center gap-2"><span class="text-xs font-semibold text-oliva-700">✔ Aviso enviado por ${enviado === 'ambos' ? 'WhatsApp y email' : enviado === 'whatsapp' ? 'WhatsApp' : 'email'}</span><button type="button" data-responde="${c.id}" class="min-h-[40px] px-3 rounded-lg border border-vino-600 text-vino-700 text-xs font-bold hover:bg-vino-50">Simular respuesta «Sí, guárdamelo»</button></div>`;
    else acciones = `<div class="flex flex-wrap gap-2">
        ${puedeWA ? `<button type="button" data-enviar="${c.id}" data-canal="whatsapp" class="min-h-[40px] px-3 rounded-lg bg-[#00a884] text-white text-xs font-bold">WhatsApp</button>` : ''}
        ${puedeEmail ? `<button type="button" data-enviar="${c.id}" data-canal="email" class="min-h-[40px] px-3 rounded-lg bg-stone-800 text-white text-xs font-bold">Email</button>` : ''}
        ${puedeWA && puedeEmail ? `<button type="button" data-enviar="${c.id}" data-canal="ambos" class="min-h-[40px] px-3 rounded-lg border border-stone-300 text-stone-700 text-xs font-bold">Los dos</button>` : ''}
        <button type="button" data-ficha="${c.id}" class="min-h-[40px] px-3 rounded-lg text-vino-700 text-xs font-bold hover:bg-queso-50">Ver ficha</button>
      </div>`;
    return `<article class="bg-white rounded-2xl border ${respondio ? 'border-emerald-300' : 'border-queso-200'} card-shadow p-4 grid md:grid-cols-[1fr_1.3fr] gap-4">
      <div class="space-y-2">
        <div class="flex items-center gap-3">
          <img src="${imgQueso(c.favoritos[0])}" alt="" width="56" height="42" class="w-14 h-11 rounded-lg object-cover border border-queso-100">
          <div><p class="font-bold text-stone-800">${esc(c.nombre)}</p><p class="text-xs text-stone-500">Cliente desde ${esc(c.desde)} · ${c.pedidos} compras · ${eur0(c.gasto)} en total</p></div>
        </div>
        <p class="text-sm"><span class="font-semibold text-vino-700">${c.dias} días</span> sin comprar · última compra el ${hace(c.dias)}</p>
        <p class="text-xs text-stone-600">Le gusta: ${c.favoritos.map(nombreQueso).map(esc).join(', ')}</p>
        <div class="flex flex-wrap gap-1">${c.etiquetas.map(t => chip(t)).join('')}</div>
      </div>
      <div class="space-y-2">
        <p class="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Mensaje que propone el CRM</p>
        <p class="text-sm text-stone-700 bg-[#f0fdf4] border border-emerald-100 rounded-xl p-3 whitespace-pre-line">${esc(mensajePara(c, canalDefecto))}</p>
        ${acciones}
      </div>
    </article>`;
  }

  function enviarAviso(id, canal) {
    estado.enviados[id] = canal;
    const c = clientes.find(x => x.id === id);
    c.historial.unshift({ dias: 0, texto: `Aviso de recuperación enviado por ${canal === 'ambos' ? 'WhatsApp y email' : canal}`, importe: null });
  }

  function simularRespuesta(id) {
    const c = clientes.find(x => x.id === id);
    const fav = c.favoritos[0];
    const p = Q.byId(fav);
    const lineas = [{ id: fav, cantidad: p.precioUd ? (fav === 'lote-regalo' ? 3 : 1) : 500 }];
    const r = Q.nuevaReserva({ cliente: c.nombre, canal: 'Recuperado', recogida: 'Mañana · 18:00', pago: 'Paga en tienda', lineas });
    estado.respuestas[id] = `${nombreQueso(fav)} · ${r.codigo} para mañana a las 18:00`;
    c.pedidos++; c.gasto += r.total;
    c.historial.unshift({ dias: 0, texto: `Reserva ${r.codigo} tras el aviso: ${Q.etiquetaCantidad(p, lineas[0].cantidad)} de ${p.nombre}`, importe: r.total });
    toast(`${c.nombre} ha reservado. Ya está en Pedidos y recogidas.`);
  }

  // ------------------------------------------------------------------ 2. RESUMEN
  function renderResumen() {
    const pedidos = todosLosPedidos();
    const porCanal = {};
    pedidos.forEach(p => { porCanal[p.canal] = (porCanal[p.canal] || 0) + 1; });
    const top = [['manchego-curado', 38], ['torta', 24], ['payoyo', 19], ['azul-asturiano', 15], ['tabla-4', 12]];
    const max = top[0][1];
    const fueraHorario = 41;
    $('#crm-resumen').innerHTML = `
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${tarjeta('Reservas esta semana', 26 + (Q.reservas || []).length, 'Web + WhatsApp + Instagram', 'text-vino-800')}
        ${tarjeta('Hechas con la tienda cerrada', fueraHorario + ' %', 'Noches y domingos (ejemplo)', 'text-queso-700')}
        ${tarjeta('Ticket medio', '24,80 €', 'Orientativo', 'text-oliva-700')}
        ${tarjeta('Clientes en la base de datos', '1.214', 'Con historial de compras (ejemplo)', 'text-stone-800')}
      </div>
      <div class="grid lg:grid-cols-2 gap-4">
        <div class="bg-white rounded-2xl border border-queso-200 card-shadow p-5 space-y-3">
          <h3 class="font-display text-lg text-vino-900">Lo que más se reserva</h3>
          ${top.map(([id, n]) => `<div class="space-y-1"><div class="flex justify-between text-sm"><span>${esc(nombreQueso(id))}</span><span class="font-semibold">${n}</span></div><div class="h-2.5 rounded-full bg-queso-100"><div class="h-2.5 rounded-full bg-queso-500" style="width:${Math.round(n / max * 100)}%"></div></div></div>`).join('')}
          <p class="text-[11px] text-stone-500">Datos de ejemplo del último mes.</p>
        </div>
        <div class="bg-white rounded-2xl border border-queso-200 card-shadow p-5 space-y-3">
          <h3 class="font-display text-lg text-vino-900">Recogidas pendientes</h3>
          ${pedidos.filter(p => p.estado !== 'recogido').slice(0, 5).map(p => `<div class="flex items-center justify-between gap-2 text-sm border-b border-queso-100 pb-2"><div><p class="font-semibold">${esc(p.codigo)} · ${esc(p.cliente)}</p><p class="text-xs text-stone-500">${esc(p.recogida)} · ${esc(p.canal)}</p></div>${chip(ESTADOS.find(e => e.id === p.estado).nombre, ESTADOS.find(e => e.id === p.estado).color)}</div>`).join('')}
          <button type="button" data-ir="pedidos" class="min-h-[40px] px-4 rounded-xl bg-vino-800 text-white text-sm font-bold">Ver todos los pedidos</button>
        </div>
      </div>
      <button type="button" data-ir="recuperar" class="w-full text-left p-4 rounded-2xl bg-gradient-to-r from-vino-800 to-queso-600 text-white card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span><strong>${dormidos().length} clientes llevan más de ${estado.umbral} días sin comprar.</strong> Avísales con un mensaje personalizado.</span><span class="font-bold">Recuperar clientes →</span>
      </button>`;
  }

  // ------------------------------------------------------------------ 3. CLIENTES
  function renderClientes() {
    const filtro = (estado.busqueda || '').toLowerCase();
    const lista = clientes.filter(c => !filtro || c.nombre.toLowerCase().includes(filtro) || c.etiquetas.join(' ').toLowerCase().includes(filtro) || c.favoritos.map(nombreQueso).join(' ').toLowerCase().includes(filtro));
    const leads = estado.leads.map(l => `<tr class="border-b border-queso-100 bg-pink-50/60"><td class="py-2 pr-2 font-semibold">${esc(l.nombre)} ${chip('Nuevo', 'bg-pink-100 text-pink-700')}</td><td class="pr-2">${esc(l.canal)}</td><td class="pr-2">—</td><td class="pr-2">Interesado en ${esc(l.interes)}</td><td></td></tr>`).join('');
    $('#crm-clientes').innerHTML = `
      <div class="bg-white rounded-2xl border border-queso-200 card-shadow p-4 space-y-3">
        <div class="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
          <label class="sr-only" for="crmBuscar">Buscar cliente</label>
          <input id="crmBuscar" type="search" value="${esc(estado.busqueda || '')}" placeholder="Buscar por nombre, queso o etiqueta (p. ej. «azul»)" class="w-full sm:max-w-sm min-h-[44px] px-3 rounded-xl border border-queso-200 text-sm">
          <span class="text-xs text-stone-500">${lista.length} clientes de ejemplo · nombres genéricos</span>
        </div>
        <div class="overflow-x-auto custom-scroll">
          <table class="w-full text-sm min-w-[640px]">
            <thead><tr class="text-left text-xs text-stone-500 border-b border-queso-200"><th class="py-2 pr-2">Cliente</th><th class="pr-2">Origen</th><th class="pr-2">Última compra</th><th class="pr-2">Le gusta</th><th class="pr-2 text-right">Gasto total</th></tr></thead>
            <tbody>${leads}${lista.map(c => `<tr class="border-b border-queso-100 hover:bg-queso-50 cursor-pointer" data-ficha="${c.id}" tabindex="0"><td class="py-2 pr-2 font-semibold text-vino-800">${esc(c.nombre)}</td><td class="pr-2">${esc(c.canal)}</td><td class="pr-2 ${c.dias >= 90 ? 'text-vino-700 font-semibold' : ''}">hace ${c.dias} días</td><td class="pr-2">${c.favoritos.map(nombreQueso).map(esc).join(', ')}</td><td class="pr-2 text-right font-semibold">${eur0(c.gasto)}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>`;
    const input = $('#crmBuscar');
    input.addEventListener('input', () => { estado.busqueda = input.value.slice(0, 40); const pos = input.selectionStart; renderClientes(); const i2 = $('#crmBuscar'); i2.focus(); i2.setSelectionRange(pos, pos); });
  }

  function abrirFicha(id) {
    const c = clientes.find(x => x.id === id);
    if (!c) return;
    const body = $('#crmDrawerBody');
    body.innerHTML = `
      <div class="p-5 border-b border-queso-200 flex items-start justify-between gap-3 sticky top-0 bg-white">
        <div><h3 id="crmDrawerTitle" class="font-display text-2xl text-vino-900">${esc(c.nombre)}</h3><p class="text-xs text-stone-500">Cliente desde ${esc(c.desde)} · origen ${esc(c.canal)}</p></div>
        <button type="button" data-crm-close class="w-11 h-11 rounded-xl hover:bg-stone-100 text-xl" aria-label="Cerrar ficha">✕</button>
      </div>
      <div class="p-5 space-y-5">
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="p-3 rounded-xl bg-queso-50"><p class="text-[11px] text-stone-500">Compras</p><p class="font-bold text-lg">${c.pedidos}</p></div>
          <div class="p-3 rounded-xl bg-queso-50"><p class="text-[11px] text-stone-500">Gasto total</p><p class="font-bold text-lg">${eur0(c.gasto)}</p></div>
          <div class="p-3 rounded-xl bg-queso-50"><p class="text-[11px] text-stone-500">Sin comprar</p><p class="font-bold text-lg">${c.dias} d</p></div>
        </div>
        <div class="space-y-1 text-sm"><p>📱 ${esc(c.tel)}</p>${c.email ? `<p>✉️ ${esc(c.email)}</p>` : ''}
          <p class="text-xs">Permisos: ${c.consentimiento.wa ? chip('WhatsApp ✔', 'bg-emerald-100 text-emerald-800') : chip('WhatsApp ✕', 'bg-stone-100 text-stone-500')} ${c.consentimiento.email ? chip('Email ✔', 'bg-emerald-100 text-emerald-800') : chip('Email ✕', 'bg-stone-100 text-stone-500')}</p></div>
        <div><p class="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">Quesos favoritos</p><div class="flex flex-wrap gap-2">${c.favoritos.map(f => `<span class="inline-flex items-center gap-2 pr-3 rounded-full bg-queso-50 border border-queso-200 text-sm"><img src="${imgQueso(f)}" alt="" width="32" height="24" class="w-8 h-8 rounded-full object-cover">${esc(nombreQueso(f))}</span>`).join('')}</div></div>
        ${c.nota ? `<p class="text-sm bg-amber-50 border border-amber-100 rounded-xl p-3">📝 ${esc(c.nota)}</p>` : ''}
        <div><p class="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">Historial de pedidos</p>
          <ol class="space-y-2">${c.historial.map(h => `<li class="flex justify-between gap-3 text-sm border-l-2 border-queso-300 pl-3"><span><span class="text-xs text-stone-500 block">${hace(h.dias)}</span>${esc(h.texto)}</span>${h.importe != null ? `<strong class="whitespace-nowrap">${eur(h.importe)}</strong>` : ''}</li>`).join('')}</ol></div>
        ${c.dias >= 60 && (c.consentimiento.wa || c.consentimiento.email) ? `<button type="button" data-ir-recuperar="${c.id}" class="w-full min-h-[44px] rounded-xl bg-[#00a884] text-white font-bold text-sm">📲 Escribirle con un mensaje personalizado</button>` : (c.consentimiento.wa || c.consentimiento.email ? '<p class="text-xs text-stone-500">Compra con frecuencia: no hace falta recuperarlo.</p>' : '<p class="text-xs text-stone-500">🔒 Sin permiso para avisos comerciales.</p>')}
      </div>`;
    $('#crmDrawer').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    $('[data-crm-close]', body).focus();
  }
  function cerrarFicha() { $('#crmDrawer').classList.add('hidden'); document.body.style.overflow = ''; }

  // ------------------------------------------------------------------ 4. PEDIDOS Y RECOGIDAS
  function renderPedidos() {
    const pedidos = todosLosPedidos();
    $('#crm-pedidos').innerHTML = `
      <p class="text-sm text-stone-600">Las reservas de la web y de WhatsApp entran aquí solas. Al marcar «Listo para recoger», el cliente recibe un WhatsApp automático.</p>
      <div class="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
        ${ESTADOS.map(e => `<div class="bg-white rounded-2xl border border-queso-200 card-shadow p-3 space-y-2 min-h-[160px]">
          <p class="text-xs font-bold uppercase tracking-wide text-stone-500 flex justify-between"><span>${e.nombre}</span><span>${pedidos.filter(p => p.estado === e.id).length}</span></p>
          ${pedidos.filter(p => p.estado === e.id).map(p => tarjetaPedido(p)).join('') || '<p class="text-xs text-stone-400">—</p>'}
        </div>`).join('')}
      </div>`;
  }

  function tarjetaPedido(p) {
    const i = ESTADOS.findIndex(e => e.id === p.estado);
    const sig = ESTADOS[i + 1];
    const nuevo = (Q.reservas || []).includes(p);
    return `<div class="rounded-xl border ${nuevo ? 'border-vino-400 ring-2 ring-vino-100' : 'border-queso-100'} p-3 space-y-1.5 text-sm bg-queso-50/40">
      <div class="flex justify-between gap-2"><strong>${esc(p.codigo)}</strong>${chip(p.canal, p.canal === 'WhatsApp' ? 'bg-emerald-100 text-emerald-800' : p.canal === 'Recuperado' ? 'bg-vino-100 text-vino-800' : 'bg-sky-100 text-sky-800')}</div>
      <p class="font-semibold">${esc(p.cliente)}</p>
      <ul class="text-xs text-stone-600">${p.lineas.map(l => `<li>• ${esc(Q.etiquetaCantidad(Q.byId(l.id), l.cantidad))} ${esc(nombreQueso(l.id))}</li>`).join('')}</ul>
      <p class="text-xs">🕒 ${esc(p.recogida)}</p>
      <p class="text-xs flex justify-between"><span>${esc(p.pago)}</span><strong>${eur(p.total)}</strong></p>
      ${sig ? `<button type="button" data-avanzar="${esc(p.codigo)}" class="w-full min-h-[38px] rounded-lg bg-vino-800 hover:bg-vino-900 text-white text-xs font-bold">→ ${sig.nombre}</button>` : ''}
    </div>`;
  }

  function avanzarPedido(codigo) {
    const p = todosLosPedidos().find(x => x.codigo === codigo);
    if (!p) return;
    const i = ESTADOS.findIndex(e => e.id === p.estado);
    if (i < ESTADOS.length - 1) p.estado = ESTADOS[i + 1].id;
    if (p.estado === 'listo') toast(`WhatsApp enviado a ${p.cliente}: «Tu pedido ${p.codigo} ya está listo para recoger 🧀»`);
    else if (p.estado === 'recogido') toast(`${p.codigo} recogido. Queda en el historial del cliente.`);
  }

  // ------------------------------------------------------------------ 5. CAMPAÑAS
  const CAMPANAS = [
    { id: 'azul', titulo: '🔵 Llegó el azul de cueva', segmento: 'Clientes que han comprado quesos azules', n: 87, texto: 'Hola {nombre} 👋 Ha llegado azul de cueva recién salido. ¿Te guardamos un trozo?' },
    { id: 'navidad', titulo: '🎄 Lotes de Navidad', segmento: 'Compraron lotes o regalos el año pasado', n: 142, texto: 'Hola {nombre} 🎄 Ya preparamos los lotes de Navidad. Resérvalos antes del 10 de diciembre y te los dejamos listos.' },
    { id: 'cata', titulo: '🍷 Nueva cata guiada', segmento: 'Han venido a una cata o compran tablas', n: 64, texto: 'Hola {nombre} 🧀 Abrimos plazas para la próxima cata de 8 quesos. Grupos reducidos. ¿Te apuntamos?' },
    { id: 'semana', titulo: '⭐ Queso de la semana', segmento: 'Todos los que aceptaron recibir novedades', n: 512, texto: 'Hola {nombre} 👋 El queso de la semana es el payoyo curado. Pásate a probarlo o resérvalo por WhatsApp.' }
  ];

  function renderCampanas() {
    $('#crm-campanas').innerHTML = `
      <p class="text-sm text-stone-600">Mensajes a grupos de clientes según lo que compran. Solo se envían a quien aceptó recibirlos, y cada mensaje incluye cómo darse de baja.</p>
      <div class="grid md:grid-cols-2 gap-3">
        ${CAMPANAS.map(c => `<div class="bg-white rounded-2xl border border-queso-200 card-shadow p-4 space-y-2">
          <h3 class="font-display text-lg text-vino-900">${c.titulo}</h3>
          <p class="text-xs text-stone-500">${esc(c.segmento)} · <strong>${c.n} clientes</strong> (ejemplo)</p>
          <p class="text-sm bg-[#f0fdf4] border border-emerald-100 rounded-xl p-3">${esc(c.texto.replace('{nombre}', 'Carmen'))}<span class="block text-[11px] text-stone-500 mt-1">Responde BAJA para no recibir más avisos.</span></p>
          ${estado.campanaEnviada[c.id] ? '<p class="text-sm font-semibold text-emerald-700">✔ Programada para mañana a las 10:00</p>' : `<button type="button" data-campana="${c.id}" class="min-h-[40px] px-4 rounded-xl bg-[#00a884] text-white text-sm font-bold">Programar envío</button>`}
        </div>`).join('')}
      </div>`;
  }

  // ------------------------------------------------------------------ Eventos
  function init() {
    if (!$('#crm-recuperar')) return;
    document.addEventListener('click', e => {
      const t = e.target;
      const tab = t.closest('.crm-tab, [data-ir]');
      if (tab) { mostrar(tab.dataset.crmTab || tab.dataset.ir); return; }
      const u = t.closest('[data-umbral]');
      if (u) { estado.umbral = +u.dataset.umbral; render(); return; }
      const env = t.closest('[data-enviar]');
      if (env) { enviarAviso(env.dataset.enviar, env.dataset.canal); toast('Aviso enviado (simulado). En la versión real sale del WhatsApp de la tienda.'); render(); return; }
      if (t.closest('[data-enviar-todos]')) {
        let n = 0;
        dormidos().forEach(c => { if (!estado.enviados[c.id] && (c.consentimiento.wa || (c.consentimiento.email && c.email))) { enviarAviso(c.id, c.consentimiento.wa ? 'whatsapp' : 'email'); n++; } });
        toast(n ? `${n} avisos personalizados enviados (simulado)` : 'Ya se ha avisado a todos los que dieron permiso');
        render(); return;
      }
      const resp = t.closest('[data-responde]');
      if (resp) { simularRespuesta(resp.dataset.responde); render(); return; }
      const ficha = t.closest('[data-ficha]');
      if (ficha) { abrirFicha(ficha.dataset.ficha); return; }
      if (t.closest('[data-crm-close]')) { cerrarFicha(); return; }
      const irRec = t.closest('[data-ir-recuperar]');
      if (irRec) { const c = clientes.find(x => x.id === irRec.dataset.irRecuperar); cerrarFicha(); if (c.dias < estado.umbral) estado.umbral = 60; mostrar('recuperar'); return; }
      const av = t.closest('[data-avanzar]');
      if (av) { avanzarPedido(av.dataset.avanzar); render(); return; }
      const camp = t.closest('[data-campana]');
      if (camp) { estado.campanaEnviada[camp.dataset.campana] = true; toast('Campaña programada (simulado)'); render(); }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !$('#crmDrawer').classList.contains('hidden')) cerrarFicha();
      if (e.key === 'Enter' && e.target.matches('tr[data-ficha]')) abrirFicha(e.target.dataset.ficha);
    });
    document.addEventListener('quesero:reserva', () => { if (!$('#view-crm').classList.contains('hidden')) render(); else { const b = $('#crmBadgePedidos'); if (b) b.textContent = todosLosPedidos().filter(p => p.estado !== 'recogido').length; } });
    document.addEventListener('quesero:lead', e => { estado.leads.unshift(e.detail); });
    mostrar('recuperar');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
