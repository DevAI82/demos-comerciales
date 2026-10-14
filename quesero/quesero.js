/*
 * El Sueño del Quesero · Demo de Altera (web nueva, teléfono con Laura, WhatsApp 24/7 e Instagram con Zernio).
 * Todo funciona en el navegador: catálogo real de su web (catalogo.js) con precios orientativos y clientes genéricos.
 * Las reservas que se hacen en la web o por WhatsApp aparecen en el CRM (crm-quesero.js) a través de window.QUESERO.
 */
(function () {
  'use strict';

  // ------------------------------------------------------------------ Utilidades
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const eur = n => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const hora = () => new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  // ------------------------------------------------------------------ Catálogo real (catalogo.js, compartido con la web nueva)
  const { CATALOGO, CATEGORIAS, enCategoria } = window.QS_CATALOGO;
  const byId = id => CATALOGO.find(p => p.id === id);

  // Precio de una línea: al corte se reserva por gramos (250 g por defecto).
  const precioLinea = (p, cantidad) => p.precioUd ? p.precioUd * cantidad : p.precio * cantidad / 1000;
  const etiquetaCantidad = (p, cantidad) => p.precioUd ? `${cantidad} ${p.ud}${cantidad > 1 ? (p.ud === 'persona' ? 's' : 's') : ''}` : (cantidad >= 1000 ? (cantidad / 1000).toLocaleString('es-ES') + ' kg' : cantidad + ' g');
  const precioTexto = p => p.precioUd ? `${eur(p.precioUd)} / ${p.ud}` : `${eur(p.precio)} / kg`;

  // ------------------------------------------------------------------ Franjas de recogida (las horas exactas salen del horario real de la tienda)
  function huecosRecogida() {
    const ahora = new Date();
    const dias = [];
    for (let i = 0; dias.length < 2 && i < 5; i++) {
      const d = new Date(ahora); d.setDate(ahora.getDate() + i);
      if (d.getDay() === 0) continue;
      const franjas = (d.getDay() === 6 ? ['por la mañana'] : ['por la mañana', 'por la tarde']).filter(f => i > 0 || (f === 'por la tarde' && ahora.getHours() < 17));
      if (!franjas.length) continue;
      const nombre = i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : d.toLocaleDateString('es-ES', { weekday: 'long' });
      dias.push({ nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1), fecha: d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }), franjas });
    }
    return dias;
  }

  // ------------------------------------------------------------------ Estado compartido con el CRM
  let numPedido = 1043;
  const Q = window.QUESERO = window.QUESERO || {};
  Q.catalogo = CATALOGO;
  Q.byId = byId;
  Q.eur = eur;
  Q.esc = esc;
  Q.precioLinea = precioLinea;
  Q.etiquetaCantidad = etiquetaCantidad;
  Q.reservas = Q.reservas || [];
  Q.nuevaReserva = function (datos) {
    const r = Object.assign({ codigo: 'QS-' + (numPedido++), estado: 'nuevo', creado: hora() }, datos);
    r.total = r.lineas.reduce((s, l) => s + precioLinea(byId(l.id), l.cantidad), 0);
    Q.reservas.unshift(r);
    document.dispatchEvent(new CustomEvent('quesero:reserva', { detail: r }));
    return r;
  };

  // ------------------------------------------------------------------ Pestañas principales
  window.switchTab = function (tabId) {
    $$('.tab-view').forEach(el => el.classList.add('hidden'));
    const vista = document.getElementById('view-' + tabId);
    if (vista) vista.classList.remove('hidden');
    $$('.tab-btn').forEach(btn => {
      const activo = btn.id === 'tab-btn-' + tabId;
      btn.classList.toggle('tab-activa', activo);
      btn.setAttribute('aria-selected', activo ? 'true' : 'false');
    });
    if (history.replaceState) history.replaceState(null, '', '#' + tabId);
    if (tabId === 'whatsapp') iniciarWhatsApp();
    if (tabId === 'instagram') iniciarInstagram();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  let toastTimer;
  function toast(msg) {
    const t = $('#qsToast');
    if (!t) return;
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add('hidden'), 3200);
  }
  Q.toast = toast;

  // ================================================================== 1. WEB NUEVA (web/index.html dentro de un marco; sus reservas llegan por Q.nuevaReserva)
  function iniciarWeb() {
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-dispositivo]');
      if (!b) return;
      const movil = b.dataset.dispositivo === 'movil';
      const marco = $('#webMarco');
      if (marco) marco.classList.toggle('marco-movil', movil);
      $$('[data-dispositivo]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    });
  }

  // ================================================================== 1b. TELÉFONO CON LAURA (llamada de ejemplo)
  function iniciarLlamada() {
    if (!window.QS_LLAMADA) return;
    window.QS_LLAMADA.montar($('#llamadaDemo'), {
      onReserva(r) {
        const res = Q.nuevaReserva(r);
        toast(`Reserva ${res.codigo} de Carlos en el CRM`);
        const aviso = $('#llamadaCRM');
        if (aviso) aviso.classList.remove('hidden');
      }
    });
  }

  // ================================================================== 2. WHATSAPP 24/7 (bot con fotos, carrito y reserva)
  const wa = { iniciado: false, carrito: [], paso: null, ocupado: false };

  function waScroll() { const c = $('#waChat'); if (c) c.scrollTop = c.scrollHeight; }

  function waBurbuja(html, de = 'bot') {
    const chat = $('#waChat');
    const fila = document.createElement('div');
    fila.className = 'flex ' + (de === 'user' ? 'justify-end' : 'justify-start');
    fila.innerHTML = `<div class="max-w-[86%] rounded-xl px-3 py-2 text-[13.5px] leading-snug shadow-sm ${de === 'user' ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'}">${html}<div class="text-[10px] text-stone-400 text-right mt-1">${hora()}${de === 'user' ? ' ✓✓' : ''}</div></div>`;
    chat.appendChild(fila);
    waScroll();
    return fila;
  }

  function waUsuario(texto) { waBurbuja(esc(texto), 'user'); }

  function waEscribiendo() {
    const chat = $('#waChat');
    const el = document.createElement('div');
    el.className = 'flex justify-start';
    el.innerHTML = '<div class="bg-white rounded-xl rounded-tl-none px-3 py-2 shadow-sm text-stone-400 text-sm" aria-label="Escribiendo">● ● ●</div>';
    chat.appendChild(el);
    waScroll();
    return el;
  }

  // Encola respuestas del bot con un pequeño retardo para que se lea natural.
  function waBot(partes) {
    wa.ocupado = true;
    let i = 0;
    const siguiente = () => {
      if (i >= partes.length) { wa.ocupado = false; return; }
      const typing = waEscribiendo();
      setTimeout(() => {
        typing.remove();
        const parte = partes[i++];
        if (typeof parte === 'function') parte(); else waBurbuja(parte);
        siguiente();
      }, i === 0 ? 650 : 900);
    };
    siguiente();
  }

  function botones(lista) {
    return `<div class="mt-2 grid gap-1.5">${lista.map(b => `<button type="button" data-wa="${esc(b.accion)}" class="w-full min-h-[38px] rounded-lg border border-[#00a884]/40 text-[#008069] font-semibold text-[13px] hover:bg-[#e7f8f3]">${esc(b.texto)}</button>`).join('')}</div>`;
  }

  // Tarjeta de producto en el chat (como un mensaje de catálogo de WhatsApp Business).
  function tarjetaWA(p) {
    return `<div class="w-[190px] shrink-0 rounded-lg overflow-hidden border border-stone-200 bg-white">
      <img src="${p.img}" alt="${esc(p.nombre)}" width="190" height="142" class="w-full aspect-[4/3] object-cover">
      <div class="p-2 space-y-1"><p class="text-[13px] font-semibold leading-tight">${esc(p.nombre)}</p>
      <p class="text-[11px] text-stone-500">${esc(p.origen)}</p>
      <p class="text-[12px] font-bold text-[#008069]">${precioTexto(p)}</p>
      <button type="button" data-wa="add:${p.id}" class="w-full min-h-[34px] rounded-md bg-[#00a884] text-white text-[12px] font-bold">${p.precioUd ? 'Añadir' : 'Añadir 250 g'}</button></div></div>`;
  }

  function waCarrusel(ids, texto) {
    waBurbuja(`${texto ? `<p class="mb-2">${texto}</p>` : ''}<div class="flex gap-2 overflow-x-auto pb-1 custom-scroll">${ids.map(id => tarjetaWA(byId(id))).join('')}</div>`);
  }

  function waResumenCarrito() {
    if (!wa.carrito.length) return '<p>Tu cesta está vacía.</p>';
    const total = wa.carrito.reduce((s, l) => s + precioLinea(byId(l.id), l.cantidad), 0);
    return `<p class="font-semibold mb-1">🧺 Tu cesta</p><ul class="space-y-0.5">${wa.carrito.map(l => { const p = byId(l.id); return `<li>• ${esc(p.nombre)} · ${etiquetaCantidad(p, l.cantidad)} · <strong>${eur(precioLinea(p, l.cantidad))}</strong></li>`; }).join('')}</ul><p class="mt-1">Total orientativo: <strong>${eur(total)}</strong></p>`;
  }

  function actualizarCestaWA() {
    const b = $('#waCesta');
    if (!b) return;
    b.textContent = wa.carrito.length ? `🧺 ${wa.carrito.length}` : '';
    b.classList.toggle('hidden', !wa.carrito.length);
  }

  // Horario: hueco hasta que la tienda confirme el real.
  const HORARIO = '📍 <strong>Calle Rosario, 58 · Albacete</strong><br>🕒 <span class="px-1 rounded border border-dashed border-amber-400 bg-amber-50 text-amber-800">[horario real de la tienda]</span>';

  const MENU = [
    { texto: '🧀 Ver quesos con fotos', accion: 'ver' },
    { texto: '🍽️ Prepárame una tabla', accion: 'tabla' },
    { texto: '🎁 Cajas regalo', accion: 'regalo' },
    { texto: '🕒 Horario y dirección', accion: 'horario' }
  ];

  function iniciarWhatsApp() {
    if (wa.iniciado) return;
    wa.iniciado = true;
    waBot([
      '¡Hola! 👋 Soy el asistente de <strong>El Sueño del Quesero</strong>. Te atiendo a cualquier hora: puedes ver nuestros quesos con fotos, reservarlos y recogerlos en la tienda (Calle Rosario, 58).',
      '¿Qué te apetece hoy?' + botones(MENU)
    ]);
  }

  function waAccion(accion) {
    if (wa.ocupado) return;
    const corte = accion.indexOf(':');
    const tipo = corte < 0 ? accion : accion.slice(0, corte);
    const valor = corte < 0 ? '' : accion.slice(corte + 1);
    switch (tipo) {
      case 'ver':
        waUsuario('Quiero ver quesos');
        waBot(['En tienda tenemos hasta 100 quesos. Te enseño una selección con fotos. ¿De qué tipo?' + botones([
          { texto: '📍 De Albacete', accion: 'cat:albacete' }, { texto: '🐑 Oveja', accion: 'cat:oveja' }, { texto: '🐐 Cabra', accion: 'cat:cabra' },
          { texto: '🐄 Vaca', accion: 'cat:vaca' }, { texto: '🔵 Azules', accion: 'cat:azul' }
        ])]);
        break;
      case 'cat': {
        const nombres = { albacete: 'De Albacete', oveja: 'Oveja', cabra: 'Cabra', vaca: 'Vaca', azul: 'Azules' };
        waUsuario(nombres[valor] || valor);
        const ids = CATALOGO.filter(p => p.cat !== 'regalos' && enCategoria(p, valor)).map(p => p.id);
        waBot([() => waCarrusel(ids, valor === 'albacete' ? 'Quesos de Albacete (desliza 👉). Precios orientativos al corte:' : `Quesos de ${(nombres[valor] || '').toLowerCase()} (desliza 👉). Precios orientativos al corte:`), 'Cuando lo tengas, pulsa «Ver mi cesta».' + botones([{ texto: '🧺 Ver mi cesta', accion: 'cesta' }, { texto: '↩️ Otro tipo', accion: 'ver' }])]);
        break;
      }
      case 'add': {
        const p = byId(valor);
        const ya = wa.carrito.find(l => l.id === p.id);
        if (ya) ya.cantidad = p.precioUd ? ya.cantidad + 1 : ya.cantidad + 250;
        else wa.carrito.push({ id: p.id, cantidad: p.precioUd ? 1 : 250 });
        actualizarCestaWA();
        waUsuario(`Añadir ${p.nombre}`);
        waBot([`Hecho ✅ ${esc(p.nombre)} en tu cesta.` + botones([{ texto: '🧺 Ver mi cesta y reservar', accion: 'cesta' }, { texto: '➕ Seguir mirando', accion: 'ver' }])]);
        break;
      }
      case 'tabla':
        waUsuario('Prepárame una tabla');
        waBot(['¡Con gusto! ¿Para cuántas personas?' + botones([{ texto: '2 personas', accion: 'personas:2' }, { texto: '4 personas', accion: 'personas:4' }, { texto: '6-8 personas', accion: 'personas:6' }])]);
        break;
      case 'personas':
        wa.personas = +valor;
        waUsuario(valor === '6' ? '6-8 personas' : `${valor} personas`);
        waBot(['¿Cómo os gustan los quesos?' + botones([{ texto: '😌 Suaves', accion: 'estilo:suave' }, { texto: '🔥 Intensos', accion: 'estilo:intenso' }, { texto: '⚖️ Un poco de todo', accion: 'estilo:mixto' }])]);
        break;
      case 'estilo': {
        waUsuario({ suave: 'Suaves', intenso: 'Intensos', mixto: 'Un poco de todo' }[valor]);
        const selec = { suave: ['plaza-curado', 'cerron-servilleta', 'payoyo', 'brie'], intenso: ['tejarejo', 'cerron-romero-miel', 'campoveja', 'gamoneu'], mixto: ['dehesa-llanos', 'payoyo', 'gorgonzola', 'comte', 'cerron-romero-miel'] }[valor];
        const gramos = wa.personas >= 6 ? 250 : wa.personas >= 4 ? 150 : 100;
        wa.propuesta = selec.map(id => ({ id, cantidad: gramos }));
        const total = wa.propuesta.reduce((s, l) => s + precioLinea(byId(l.id), l.cantidad), 0);
        waBot([
          () => waCarrusel(selec, `Para ${wa.personas >= 6 ? '6-8' : wa.personas} personas te propongo esta tabla (unos ${gramos} g de cada uno):`),
          `Total orientativo: <strong>${eur(total)}</strong>. Te la dejamos cortada y envasada para recoger. 😉` + botones([{ texto: '✅ Reservar esta tabla', accion: 'aceptarTabla' }, { texto: '🔄 Cambiar estilo', accion: 'personas:' + wa.personas }])
        ]);
        break;
      }
      case 'aceptarTabla':
        wa.propuesta.forEach(l => wa.carrito.push(l));
        actualizarCestaWA();
        waUsuario('Reservar esta tabla');
        waEnseñarHuecos();
        break;
      case 'regalo':
        waUsuario('Cajas regalo');
        waBot([() => waCarrusel(['caja-regalo', 'dehesa-llanos', 'plaza-aceite', 'cerron-romero-miel'], 'Montamos cajas regalo con los quesos que elijas y las enviamos con transporte refrigerado a toda España 🎁:'), 'Si es para empresa, dime cuántas cajas necesitas y te paso presupuesto.' + botones([{ texto: '🧺 Ver mi cesta', accion: 'cesta' }, { texto: '🏢 Cajas para empresa', accion: 'empresa' }])]);
        break;
      case 'empresa':
        waUsuario('Cajas para empresa');
        waBot(['Perfecto. Le paso tu mensaje al equipo y te escriben hoy mismo con presupuesto. 📋 Ya queda apuntado en el CRM como <em>oportunidad de cajas regalo de empresa</em>.' + botones(MENU)]);
        break;
      case 'horario':
        waUsuario('Horario y dirección');
        waBot([HORARIO, 'Aunque estemos cerrados, puedes reservar por aquí y lo recoges cuando abramos. 🙂' + botones(MENU)]);
        break;
      case 'cesta':
        waUsuario('Ver mi cesta');
        if (!wa.carrito.length) { waBot(['Tu cesta está vacía todavía.' + botones(MENU)]); break; }
        waBot([waResumenCarrito() + botones([{ texto: '📅 Elegir hora de recogida', accion: 'huecos' }, { texto: '➕ Añadir más', accion: 'ver' }, { texto: '🗑️ Vaciar cesta', accion: 'vaciar' }])]);
        break;
      case 'vaciar':
        wa.carrito = []; actualizarCestaWA();
        waUsuario('Vaciar cesta');
        waBot(['Cesta vacía. ¿Empezamos de nuevo?' + botones(MENU)]);
        break;
      case 'huecos':
        waUsuario('Elegir hora de recogida');
        waEnseñarHuecos();
        break;
      case 'hueco':
        wa.recogida = valor.replace(/_/g, ' ');
        waUsuario(wa.recogida);
        waBot(['¿Cómo prefieres pagar?' + botones([{ texto: '💳 Pagar ahora (Bizum o tarjeta)', accion: 'pago:online' }, { texto: '🏪 Pagar al recoger', accion: 'pago:tienda' }])]);
        break;
      case 'pago': {
        waUsuario(valor === 'online' ? 'Pagar ahora' : 'Pagar al recoger');
        const r = Q.nuevaReserva({ cliente: 'Cliente de ejemplo (WhatsApp)', canal: 'WhatsApp', recogida: wa.recogida, pago: valor === 'online' ? 'Pagado online' : 'Paga en tienda', lineas: wa.carrito.map(l => ({ ...l })) });
        wa.carrito = []; actualizarCestaWA();
        waBot([
          valor === 'online' ? '🔒 Te envío el enlace de pago seguro… <span class="text-[11px] text-stone-500">(en la demo se simula)</span>' : 'Perfecto, pagas al recoger. 👍',
          `✅ <strong>Reserva ${esc(r.codigo)} confirmada</strong><br>Recogida: <strong>${esc(r.recogida)}</strong><br>Total orientativo: <strong>${eur(r.total)}</strong><br>Te lo dejamos cortado y envasado al vacío. Te escribo 2 horas antes para recordártelo. ¡Gracias! 🧀`,
          '<span class="text-[11px] text-stone-500">👉 Esta reserva ya está en la pestaña <strong>CRM → Pedidos y recogidas</strong>.</span>' + botones([{ texto: '📊 Verla en el CRM', accion: 'irCRM' }, { texto: '🧀 Seguir comprando', accion: 'ver' }])
        ]);
        break;
      }
      case 'irCRM':
        window.switchTab('crm');
        if (Q.crmMostrar) Q.crmMostrar('pedidos');
        break;
      case 'humano':
        waUsuario('Hablar con una persona');
        waBot(['Claro. Aviso ahora al equipo de la tienda y te responde una persona en cuanto pueda. 🙋 (El chat pasa al móvil de la tienda con todo el historial.)']);
        break;
    }
  }

  function waEnseñarHuecos() {
    const dias = huecosRecogida();
    waBot([`¿Cuándo pasas a recogerlo?${dias.map(d => `<p class="mt-2 text-[12px] font-semibold text-stone-500">${d.nombre} ${d.fecha}</p>` + botones(d.franjas.map(f => ({ texto: `${d.nombre} ${f}`, accion: `hueco:${d.nombre}_${d.fecha}_·_${f}` })))).join('')}`]);
  }

  // Texto libre: detecta la intención por palabras clave.
  function waTextoLibre(texto) {
    const t = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    waUsuario(texto);
    if (/alerg|intoleran|lactosa|celiac|gluten|embaraz/.test(t)) {
      waBot(['Para alergias, intolerancias o embarazo prefiero que te conteste una persona del equipo con la ficha de cada queso delante. 🙏 Te paso con ellos ahora mismo.' + botones([{ texto: '🙋 Hablar con una persona', accion: 'humano' }])]);
    } else if (/horari|abr|cerr|direcc|donde|ubicac|calle/.test(t)) {
      wa.ocupado = false; waAccionSinEco('horario');
    } else if (/tabla|picoteo|cena|aperitivo/.test(t)) {
      waBot(['¡Las tablas son lo nuestro! ¿Para cuántas personas?' + botones([{ texto: '2 personas', accion: 'personas:2' }, { texto: '4 personas', accion: 'personas:4' }, { texto: '6-8 personas', accion: 'personas:6' }])]);
    } else if (/regalo|lote|navidad|caja|empresa/.test(t)) {
      waBot([() => waCarrusel(['caja-regalo', 'dehesa-llanos', 'plaza-aceite'], 'Montamos cajas regalo con los quesos que elijas y las enviamos refrigeradas a toda España 🎁:')]);
    } else if (/cata|curso|degustac/.test(t)) {
      waBot(['Hacemos catas comentadas en nuestra sala, junto a la tienda, y se puede reservar para una cata-cumpleaños o una degustación privada. 🍷 Te paso con el equipo para ver fechas.' + botones([{ texto: '🙋 Hablar con una persona', accion: 'humano' }])]);
    } else if (/albacete|manchego|oveja|curado/.test(t)) {
      waBot([() => waCarrusel(['dehesa-llanos', 'ojos-guadiana', 'plaza-curado', 'plaza-aceite', 'tejarejo'], 'Nuestros manchegos, la mayoría de Albacete:')]);
    } else if (/azul|stilton|gorgonzola|gamoneu|fuerte|pica/.test(t)) {
      waBot([() => waCarrusel(['gorgonzola', 'stilton', 'gamoneu'], 'Para los amantes del azul 🔵:')]);
    } else if (/cabra|payoy|cerron/.test(t)) {
      waBot([() => waCarrusel(['payoyo', 'cerron-romero-miel', 'cerron-servilleta', 'black-betty'], 'Quesos de cabra:')]);
    } else if (/envi|domicilio|mensajer|correo/.test(t)) {
      waBot(['Enviamos <strong>cajas regalo</strong> con transporte refrigerado a toda España, con los quesos que elijas. 📦 Para tu compra habitual, lo reservas aquí y lo recoges en Calle Rosario.' + botones([{ texto: '🎁 Cajas regalo', accion: 'regalo' }, { texto: '🧀 Ver quesos', accion: 'ver' }])]);
    } else if (/precio|cuanto|vale|cuesta/.test(t)) {
      waBot(['Los precios dependen del queso y del peso. Te enseño el catálogo con precios orientativos:' + botones([{ texto: '🧀 Ver quesos con fotos', accion: 'ver' }, { texto: '🍽️ Prepárame una tabla', accion: 'tabla' }])]);
    } else if (/hola|buenas|hey/.test(t)) {
      waBot(['¡Hola! 😊 ¿Qué te apetece?' + botones(MENU)]);
    } else {
      waBot(['Te entiendo 🙂. Puedo enseñarte quesos con fotos, prepararte una tabla o pasarte con una persona del equipo.' + botones([...MENU.slice(0, 2), { texto: '🙋 Hablar con una persona', accion: 'humano' }])]);
    }
  }
  function waAccionSinEco(accion) {
    if (accion === 'horario') waBot([HORARIO + botones(MENU)]);
  }

  function iniciarEventosWA() {
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-wa]');
      if (b) { waAccion(b.dataset.wa); return; }
      const s = e.target.closest('[data-wa-sugerencia]');
      if (s && !wa.ocupado) { wa.iniciado = true; waTextoLibre(s.dataset.waSugerencia); }
    });
    const form = $('#waForm');
    if (form) form.addEventListener('submit', e => {
      e.preventDefault();
      const input = $('#waInput');
      const texto = input.value.trim().slice(0, 300);
      if (!texto || wa.ocupado) return;
      input.value = '';
      waTextoLibre(texto);
    });
    const reset = $('#waReset');
    if (reset) reset.addEventListener('click', () => {
      if (wa.ocupado) return;
      $('#waChat').innerHTML = '';
      wa.carrito = []; wa.iniciado = false; actualizarCestaWA();
      iniciarWhatsApp();
    });
  }

  // ================================================================== 3. INSTAGRAM + ZERNIO
  const ig = { iniciado: false, n: 0 };
  const COMENTARIOS = [
    { usuario: 'maria_ab.cocina', texto: '¿Precio del Dehesa de los Llanos? 😍', respuestaPublica: '¡Hola María! Te lo mandamos por privado 📩', dm: 'Hola María 👋 El Dehesa de Los Llanos Gran Reserva está a 43,90 €/kg (orientativo). Puedes reservarlo aquí y recogerlo en Calle Rosario, 58:', producto: 'dehesa-llanos' },
    { usuario: 'javi.gastro', texto: '¿Tenéis Payoyo esta semana?', respuestaPublica: '¡Sí! Te escribimos por privado con los detalles 🧀', dm: 'Hola Javi, sí tenemos Payoyo, muy cremoso. ¿Te guardo un trozo?', producto: 'payoyo' },
    { usuario: 'lucia_albacete', texto: 'Quiero regalar algo para Navidad 🎁', respuestaPublica: '¡Qué buena idea! Te mandamos opciones por DM ✨', dm: 'Hola Lucía 🎄 Montamos una caja regalo con los quesos que elijas y la enviamos refrigerada a toda España. Si es para empresa, te hacemos presupuesto:', producto: 'caja-regalo' }
  ];

  function igComentario(c) {
    const lista = $('#igComentarios');
    const el = document.createElement('div');
    el.className = 'space-y-1';
    el.innerHTML = `<p class="text-[13px]"><strong>${esc(c.usuario)}</strong> ${esc(c.texto)}</p>`;
    lista.appendChild(el);
    lista.scrollTop = lista.scrollHeight;
    setTimeout(() => {
      const r = document.createElement('p');
      r.className = 'text-[13px] pl-4 border-l-2 border-pink-200';
      r.innerHTML = `<strong>elsuenodelquesero</strong> ${esc(c.respuestaPublica)} <span class="ml-1 text-[10px] font-bold text-pink-600">Zernio · 4 s</span>`;
      el.appendChild(r);
      lista.scrollTop = lista.scrollHeight;
      igBandeja(c);
    }, 1100);
  }

  function igBandeja(c) {
    const p = byId(c.producto);
    const box = $('#igBandeja');
    const vacio = $('#igBandejaVacia');
    if (vacio) vacio.remove();
    const el = document.createElement('div');
    el.className = 'p-3 rounded-xl border border-stone-200 bg-white space-y-2';
    el.innerHTML = `<div class="flex items-center justify-between gap-2"><span class="text-xs font-bold text-pink-600">📸 Instagram · DM a @${esc(c.usuario)}</span><span class="text-[10px] text-stone-400">${hora()}</span></div>
      <p class="text-sm text-stone-700">${esc(c.dm)}</p>
      <div class="flex items-center gap-2 p-2 rounded-lg bg-stone-50 border border-stone-100"><img src="${p.img}" alt="" width="56" height="42" class="w-14 h-10 rounded object-cover"><div class="text-xs"><p class="font-semibold">${esc(p.nombre)}</p><p class="text-stone-500">${precioTexto(p)} · Reservar y recoger</p></div></div>
      <p class="text-[11px] text-oliva-700 font-semibold">➕ Contacto creado en el CRM con origen «Instagram»</p>`;
    box.prepend(el);
    document.dispatchEvent(new CustomEvent('quesero:lead', { detail: { nombre: '@' + c.usuario, canal: 'Instagram', interes: p.nombre } }));
  }

  function iniciarInstagram() {
    if (ig.iniciado) return;
    ig.iniciado = true;
    const img = $('#igPostImg');
    if (img) img.src = 'img/cata-plato.webp';
  }

  function iniciarEventosIG() {
    const btn = $('#igSimular');
    if (btn) btn.addEventListener('click', () => {
      if (ig.n >= COMENTARIOS.length) { toast('Ya has visto los 3 ejemplos. Recarga para repetir.'); return; }
      igComentario(COMENTARIOS[ig.n++]);
      if (ig.n >= COMENTARIOS.length) btn.textContent = '✔ Ejemplos completados';
    });
  }

  // ------------------------------------------------------------------ Arranque
  function init() {
    iniciarWeb();
    iniciarLlamada();
    iniciarEventosWA();
    iniciarEventosIG();
    const inicial = (location.hash || '').replace('#', '');
    if (['web', 'llamadas', 'whatsapp', 'instagram', 'crm', 'seo', 'inversion'].includes(inicial)) window.switchTab(inicial);
    else window.switchTab('web');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
