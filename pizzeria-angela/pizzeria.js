/*
 * Pizzería Ángela · Pedido para recoger por WhatsApp (demo).
 * Carta con fotos dentro del chat, tamaño mediana o familiar, cesta, hora de recogida
 * según la carga del horno y pago ahora (enlace seguro) o al recoger.
 * Cada pedido confirmado entra en la columna «1. Recepción» de la comandera (pestaña 1).
 * Las fotos son ilustraciones provisionales: en la instalación se usan fotos reales de sus pizzas.
 */
(function () {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const eur = n => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const hora = () => new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  // Para textos que acaban dentro de un onclick de la comandera: sin comillas ni símbolos raros.
  const plano = s => String(s).replace(/[^\p{L}\p{N} .,+()€:-]/gu, '').slice(0, 80);

  // ---------------------------------------------------------------- Carta (fotos reales de la pizzería, precios orientativos de ejemplo)
  const CARTA = [
    { id: 'cuatro-estaciones', cat: 'clasicas', nombre: 'Cuatro Estaciones', desc: 'Jamón serrano, champiñón, jamón york y pimiento', med: 11, fam: 16.5 },
    { id: 'diavola', cat: 'clasicas', nombre: 'Diavola', desc: 'Tomate, mozzarella, pepperoni y pimiento verde', med: 11.5, fam: 17 },
    { id: 'tonno', cat: 'clasicas', nombre: 'Tonno', desc: 'Tomate, mozzarella, atún y aceitunas negras', med: 11, fam: 16.5 },
    { id: 'barbacoa', cat: 'especiales', nombre: 'Barbacoa', desc: 'Pollo, bacon y salsa barbacoa', med: 12, fam: 17.5 },
    { id: 'pollo-cherry', cat: 'especiales', nombre: 'Pollo y Cherry', desc: 'Pollo, champiñón y tomate cherry', med: 12, fam: 17.5 },
    { id: 'mitad-y-mitad', cat: 'especiales', nombre: 'Mitad y mitad', desc: 'Media de carne picada y media de verduras a la plancha', med: 12.5, fam: 18 },
    { id: 'tostas', cat: 'otros', nombre: 'Tostas de la casa', desc: 'Salmón ahumado y bruschetta de tomate', precio: 6.5 },
    { id: 'caprese', cat: 'otros', nombre: 'Ensalada Caprese', desc: 'Tomate, mozzarella fresca y orégano', precio: 7.5 },
    { id: 'lasana', cat: 'otros', nombre: 'Lasaña al horno', desc: 'Gratinada en el horno de piedra', precio: 9.5 },
    { id: 'tiramisu', cat: 'otros', nombre: 'Tiramisú casero', desc: 'Hecho en la pizzería', precio: 5 },
    { id: 'refresco', cat: 'bebidas', nombre: 'Refresco', desc: 'Lata de 33 cl', precio: 2 },
    { id: 'cerveza', cat: 'bebidas', nombre: 'Cerveza', desc: 'Botellín de 33 cl', precio: 2.5 }
  ];
  CARTA.forEach(p => { if (p.cat !== 'bebidas') p.img = `carta/${p.id}.jpg`; });
  const byId = id => CARTA.find(p => p.id === id);

  const CATEGORIAS = { clasicas: '🍕 Clásicas', especiales: '⭐ Especiales de la casa', otros: '🥗 Entrantes, pasta y postres' };
  const TAM = { med: 'mediana', fam: 'familiar' };
  const BEBIDAS = CARTA.filter(p => p.cat === 'bebidas').map(p => ({ texto: `🥤 ${p.nombre} · ${eur(p.precio)}`, accion: `add:${p.id}:` }));

  const precioDe = l => { const p = byId(l.id); return p.precio != null ? p.precio : p[l.tam]; };
  const nombreLinea = l => { const p = byId(l.id); return `${p.nombre}${l.tam ? ' ' + TAM[l.tam] : ''}${l.nota ? ' (' + l.nota + ')' : ''}`; };
  const total = () => wa.cesta.reduce((s, l) => s + precioDe(l) * l.uds, 0);

  // ---------------------------------------------------------------- Estado y utilidades del chat
  const wa = { iniciado: false, cesta: [], ocupado: false, recogida: null, ultimo: null };

  function chat() { return $('#paChat'); }
  function scroll() { const c = chat(); if (c) c.scrollTop = c.scrollHeight; }

  function burbuja(html, de = 'bot') {
    const fila = document.createElement('div');
    fila.className = 'flex ' + (de === 'user' ? 'justify-end' : 'justify-start');
    fila.innerHTML = `<div class="max-w-[88%] rounded-xl px-3 py-2 text-[13px] leading-snug shadow-sm ${de === 'user' ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'}">${html}<div class="text-[10px] text-stone-400 text-right mt-1">${hora()}${de === 'user' ? ' ✓✓' : ''}</div></div>`;
    chat().appendChild(fila);
    scroll();
    return fila;
  }
  const usuario = t => burbuja(esc(t), 'user');

  function escribiendo() {
    const el = document.createElement('div');
    el.className = 'flex justify-start';
    el.innerHTML = '<div class="bg-white rounded-xl rounded-tl-none px-3 py-2 shadow-sm text-stone-400 text-sm" aria-label="Escribiendo">● ● ●</div>';
    chat().appendChild(el);
    scroll();
    return el;
  }

  function bot(partes) {
    wa.ocupado = true;
    let i = 0;
    const siguiente = () => {
      if (i >= partes.length) { wa.ocupado = false; return; }
      const t = escribiendo();
      setTimeout(() => {
        t.remove();
        const parte = partes[i++];
        if (typeof parte === 'function') parte(); else burbuja(parte);
        siguiente();
      }, i === 0 ? 600 : 850);
    };
    siguiente();
  }

  function botones(lista) {
    return `<div class="mt-2 grid gap-1.5">${lista.map(b => `<button type="button" data-pa="${esc(b.accion)}" ${b.off ? 'disabled' : ''} class="w-full min-h-[36px] rounded-lg border text-[13px] font-semibold ${b.off ? 'border-stone-200 text-stone-400 line-through cursor-not-allowed' : 'border-[#00a884]/40 text-[#008069] hover:bg-[#e7f8f3]'}">${esc(b.texto)}</button>`).join('')}</div>`;
  }

  function tarjeta(p) {
    const pie = p.precio != null
      ? `<button type="button" data-pa="add:${p.id}:" class="w-full min-h-[32px] rounded-md bg-[#00a884] text-white text-[12px] font-bold">Añadir · ${eur(p.precio)}</button>`
      : `<div class="grid grid-cols-2 gap-1"><button type="button" data-pa="add:${p.id}:med" class="min-h-[32px] rounded-md bg-[#00a884] text-white text-[11px] font-bold leading-tight">Mediana<br>${eur(p.med)}</button><button type="button" data-pa="add:${p.id}:fam" class="min-h-[32px] rounded-md bg-[#008069] text-white text-[11px] font-bold leading-tight">Familiar<br>${eur(p.fam)}</button></div>`;
    return `<div class="w-[176px] shrink-0 rounded-lg overflow-hidden border border-stone-200 bg-white">
      <img src="${p.img}" alt="${esc(p.nombre)}" loading="lazy" width="176" height="132" class="w-full aspect-[4/3] object-cover">
      <div class="p-2 space-y-1"><p class="text-[13px] font-semibold leading-tight">${esc(p.nombre)}</p>
      <p class="text-[11px] text-stone-500 leading-snug min-h-[28px]">${esc(p.desc)}</p>${pie}</div></div>`;
  }

  function carrusel(ids, texto) {
    burbuja(`${texto ? `<p class="mb-2">${texto}</p>` : ''}<div class="flex gap-2 overflow-x-auto pb-1 custom-scroll">${ids.map(id => tarjeta(byId(id))).join('')}</div>`);
  }

  function resumen() {
    return `<p class="font-semibold mb-1">🧾 Tu pedido</p><ul class="space-y-0.5">${wa.cesta.map(l => `<li>• ${l.uds}x ${esc(nombreLinea(l))} · <strong>${eur(precioDe(l) * l.uds)}</strong></li>`).join('')}</ul><p class="mt-1">Total: <strong>${eur(total())}</strong></p>`;
  }

  function contadorCesta() {
    const b = $('#paCesta');
    if (!b) return;
    const n = wa.cesta.reduce((s, l) => s + l.uds, 0);
    b.textContent = n ? `🛒 ${n}` : '';
    b.classList.toggle('hidden', !n);
  }

  // Franjas de recogida de 15 min desde ahora (o desde las 20:00 si aún no ha abierto el horno).
  // Una franja aparece completa para enseñar que el bot respeta la capacidad del horno.
  function franjas() {
    const d = new Date();
    let min = d.getHours() * 60 + d.getMinutes() + 25;
    if (min < 20 * 60) min = 20 * 60;
    min = Math.ceil(min / 15) * 15;
    const manana = min > 23 * 60 + 15;
    if (manana) min = 20 * 60 + 30;
    return Array.from({ length: 5 }, (_, i) => {
      const m = min + i * 15;
      const t = `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
      return { t, dia: manana ? 'Mañana' : 'Hoy', llena: i === 1 };
    });
  }

  const MENU = [
    { texto: '📸 Pedir para recoger (carta con fotos)', accion: 'carta' },
    { texto: '🍽️ Reservar mesa', accion: 'reservar' },
    { texto: '🔁 Repetir mi último pedido', accion: 'repetir' },
    { texto: '🕒 Horario y dirección', accion: 'horario' },
    { texto: '🙋 Hablar con una persona', accion: 'humano' }
  ];

  function iniciar() {
    if (wa.iniciado) return;
    wa.iniciado = true;
    bot([
      '¡Hola! 🍕 Soy el asistente de <strong>Pizzería Ángela</strong>. Puedes pedir para recoger viendo la carta con fotos, o reservar mesa en el restaurante (C. Simone de Beauvoir, 3).',
      '¿Qué te apetece?' + botones(MENU)
    ]);
  }

  function verCategorias(eco = true) {
    if (eco) usuario('Ver la carta con fotos');
    bot(['¿Qué parte de la carta te enseño?' + botones(Object.entries(CATEGORIAS).map(([k, v]) => ({ texto: v, accion: 'cat:' + k })))]);
  }

  function enseñarFranjas() {
    const lista = franjas();
    bot([`¿A qué hora pasas a recogerlo? (${lista[0].dia.toLowerCase()})` + botones(lista.map(f => ({ texto: f.llena ? `${f.t} · horno completo` : `${f.dia} a las ${f.t}`, accion: 'hora:' + f.dia + ' ' + f.t, off: f.llena })))]);
  }

  // ---------------------------------------------------------------- Acciones de los botones
  function accion(a) {
    if (wa.ocupado) return;
    const [tipo, v1 = '', v2 = ''] = a.split(':');
    switch (tipo) {
      case 'carta': verCategorias(); break;
      case 'cat': {
        usuario(CATEGORIAS[v1].replace(/^\S+\s/, ''));
        const ids = CARTA.filter(p => p.cat === v1).map(p => p.id);
        const pie = v1 === 'otros'
          ? 'Y para beber:' + botones([...BEBIDAS, { texto: '🛒 Ver mi pedido', accion: 'cesta' }])
          : 'Pulsa el tamaño para añadirla. Si quieres quitar algo, escríbemelo (por ejemplo, «sin cebolla»).' + botones([{ texto: '🛒 Ver mi pedido', accion: 'cesta' }, { texto: '↩️ Otra parte de la carta', accion: 'carta' }]);
        bot([() => carrusel(ids, 'Fotos de nuestra carta, desliza 👉'), pie]);
        break;
      }
      case 'add': {
        const p = byId(v1);
        const tam = v2 || null;
        const ya = wa.cesta.find(l => l.id === p.id && l.tam === tam && !l.nota);
        if (ya) ya.uds++; else wa.cesta.push({ id: p.id, tam, uds: 1 });
        contadorCesta();
        usuario(`${p.nombre}${tam ? ' ' + TAM[tam] : ''}`);
        const sinBebida = !wa.cesta.some(l => byId(l.id).cat === 'bebidas');
        const sugerencia = p.cat !== 'bebidas' && sinBebida ? ' ¿Algo de beber?' : '';
        bot([`Hecho ✅ ${esc(p.nombre)}${tam ? ' ' + TAM[tam] : ''} en tu pedido.${sugerencia}` + botones([...(sugerencia ? BEBIDAS : []), { texto: '🛒 Ver mi pedido y elegir hora', accion: 'cesta' }, { texto: '➕ Seguir mirando la carta', accion: 'carta' }])]);
        break;
      }
      case 'cesta':
        usuario('Ver mi pedido');
        if (!wa.cesta.length) { bot(['Todavía no has añadido nada.' + botones(MENU.slice(0, 1))]); break; }
        bot([resumen() + botones([{ texto: '🕒 Elegir hora de recogida', accion: 'franjas' }, { texto: '➕ Añadir algo más', accion: 'carta' }, { texto: '🗑️ Empezar de nuevo', accion: 'vaciar' }])]);
        break;
      case 'vaciar':
        wa.cesta = []; contadorCesta();
        usuario('Empezar de nuevo');
        bot(['Pedido vacío. ¿Empezamos?' + botones(MENU)]);
        break;
      case 'franjas':
        usuario('Elegir hora de recogida');
        enseñarFranjas();
        break;
      case 'hora':
        wa.recogida = v1 + (v2 ? ':' + v2 : '');
        usuario(wa.recogida);
        bot([`Perfecto, <strong>${esc(wa.recogida)}</strong>. ¿Cómo prefieres pagar?` + botones([{ texto: '💳 Pagar ahora (tarjeta, Apple Pay, Google Pay)', accion: 'pago:ahora' }, { texto: '🏪 Pagar al recoger', accion: 'pago:local' }])]);
        break;
      case 'pago':
        if (v1 === 'ahora') {
          usuario('Pagar ahora');
          bot([`<div class="rounded-lg border border-[#635bff]/40 p-2.5 space-y-2"><p class="text-[11px] font-bold text-[#635bff]">🔒 Pago seguro · Pizzería Ángela</p><p class="text-[12px]">Pedido para recoger ${esc(wa.recogida.toLowerCase())}</p><button type="button" data-pa="pagar" class="w-full min-h-[38px] rounded-lg bg-[#635bff] hover:bg-[#5349e0] text-white font-bold text-[13px]">Pagar ${eur(total())}</button><p class="text-[10px] text-stone-400 text-center">Enlace de pago (en la demo se simula)</p></div>`]);
        } else {
          usuario('Pagar al recoger');
          confirmar(false);
        }
        break;
      case 'pagar': {
        const b = $('[data-pa="pagar"]');
        if (b) { b.disabled = true; b.textContent = '✅ Pagado'; b.removeAttribute('data-pa'); }
        confirmar(true);
        break;
      }
      case 'repetir':
        usuario('Repetir mi último pedido');
        if (wa.ultimo) {
          wa.cesta = wa.ultimo.map(l => ({ ...l })); contadorCesta();
          bot(['¡Claro! Te he puesto lo mismo que la última vez:', resumen() + botones([{ texto: '🕒 Elegir hora de recogida', accion: 'franjas' }, { texto: '✏️ Cambiar algo', accion: 'carta' }])]);
        } else {
          wa.cesta = [{ id: 'barbacoa', tam: 'fam', uds: 1 }, { id: 'diavola', tam: 'med', uds: 1 }, { id: 'refresco', tam: null, uds: 2 }]; contadorCesta();
          bot(['Te reconozco por tu número 😊. La última vez pediste esto:', resumen() + botones([{ texto: '🕒 Elegir hora de recogida', accion: 'franjas' }, { texto: '✏️ Cambiar algo', accion: 'carta' }])]);
        }
        break;
      case 'horario':
        usuario('Horario y dirección');
        horario();
        break;
      case 'humano':
        usuario('Hablar con una persona');
        bot(['Ahora mismo aviso al equipo y te contesta una persona en cuanto pueda, con toda la conversación delante. 🙋']);
        break;
      case 'cocina':
        if (typeof window.switchView === 'function') window.switchView('kds');
        break;
      // ---- Reserva de mesa
      case 'reservar':
        usuario('Reservar mesa');
        wa.reserva = {};
        bot(['¡Genial! ¿Para cuántas personas?' + botones([{ texto: '2 personas', accion: 'pax:2' }, { texto: '3-4 personas', accion: 'pax:4' }, { texto: '5-6 personas', accion: 'pax:6' }, { texto: 'Grupo de más de 8', accion: 'pax:grupo' }])]);
        break;
      case 'pax':
        if (v1 === 'grupo') {
          usuario('Grupo de más de 8');
          bot(['¡Qué bien! Para grupos grandes preparamos la mesa y, si queréis, un menú cerrado. Le paso tus datos al equipo y te escriben hoy mismo para cerrarlo. 🙋']);
          break;
        }
        wa.reserva = { pax: v1 === '2' ? '2 personas' : v1 === '4' ? '3-4 personas' : '5-6 personas' };
        usuario(wa.reserva.pax);
        bot(['¿Qué día?' + botones(['Hoy', 'Mañana', 'El sábado'].map(d => ({ texto: d, accion: 'dia:' + d })))]);
        break;
      case 'dia':
        wa.reserva.dia = v1;
        usuario(v1);
        bot([`¿A qué hora? (${esc(v1.toLowerCase())})` + botones(['2030', '2100', '2130', '2200'].map((h, i) => ({ texto: i === 1 ? `${h.slice(0, 2)}:${h.slice(2)} · completo` : `${h.slice(0, 2)}:${h.slice(2)}`, accion: 'hres:' + h, off: i === 1 })))]);
        break;
      case 'hres':
        wa.reserva.hora = `${v1.slice(0, 2)}:${v1.slice(2)}`;
        usuario(wa.reserva.hora);
        bot(['¿Dónde os sentamos?' + botones([{ texto: '🏠 Salón', accion: 'zona:Salón' }, { texto: '🌙 Terraza', accion: 'zona:Terraza' }, { texto: 'Me da igual', accion: 'zona:Donde haya sitio' }])]);
        break;
      case 'zona': {
        const r = Object.assign(wa.reserva, { zona: v1 });
        usuario(v1);
        apuntarReserva(r);
        bot([
          `✅ <strong>Mesa reservada</strong><br>${esc(r.dia)} a las ${esc(r.hora)} · ${esc(r.pax)} · ${esc(r.zona)}<br>A nombre del titular de este WhatsApp.`,
          'Te escribo 2 horas antes para confirmar. Si al final no podéis venir, responde «anular» y la mesa queda libre para otros. 🙏',
          '¿Queréis dejar las pizzas encargadas para que estén saliendo del horno al llegar?' + botones([{ texto: '🍕 Sí, ver la carta', accion: 'carta' }, { texto: 'No, gracias', accion: 'nada' }])
        ]);
        break;
      }
      case 'nada':
        usuario('No, gracias');
        bot(['¡Perfecto! Os esperamos. 🍕']);
        break;
    }
  }

  function horario() {
    bot([`<img src="fachada-angela.jpg" alt="Fachada de Pizzería Ángela" width="320" height="145" class="rounded-lg mb-2 w-full object-cover">` + '📍 <strong>C. Simone de Beauvoir, 3 · Albacete</strong> (frente a Imaginalia, aparcamiento en la puerta)<br>🕒 Horario de ejemplo: de martes a domingo, 20:00-23:30<br><span class="text-[11px] text-stone-500">(Lo ajustamos al horario real de la pizzería)</span>', 'Aunque estemos cerrados, puedes dejar tu pedido o tu reserva para otro día. 🙂' + botones(MENU.slice(0, 2))]);
  }

  // Añade la reserva a la lista «Próximas reservas» del panel lateral.
  function apuntarReserva(r) {
    const lista = document.getElementById('paReservas');
    if (!lista) return;
    const li = document.createElement('li');
    li.className = 'flex items-center justify-between gap-2 bg-emerald-950/60 border border-emerald-600/60 rounded-lg px-3 py-2 animate-pulse';
    li.innerHTML = `<span><strong class="text-white">Cliente WhatsApp</strong> · ${esc(r.pax)} · ${esc(r.zona)}</span><span class="font-mono text-amber-300">${esc(r.dia)} ${esc(r.hora)}</span>`;
    lista.prepend(li);
    setTimeout(() => li.classList.remove('animate-pulse'), 1500);
  }

  let siguienteComanda = 120;

  function confirmar(pagado) {
    const num = siguienteComanda++;
    const lineas = wa.cesta.map(l => ({ ...l }));
    const importe = total();
    wa.ultimo = lineas;
    crearComandaKDS({ num, cliente: 'Cliente WhatsApp', hora: wa.recogida.replace(/^\S+\s/, ''), lineas, importe, pagado });
    wa.cesta = []; contadorCesta();
    bot([
      pagado ? '💳 Pago recibido. ¡Gracias!' : 'Perfecto, lo pagas en el mostrador al recoger (efectivo o tarjeta). 👍',
      `✅ <strong>Pedido #${num} confirmado</strong><br>Recogida: <strong>${esc(wa.recogida)}</strong><br>Total: <strong>${eur(importe)}</strong> · ${pagado ? 'pagado' : 'pago al recoger'}<br>Te escribo por aquí en cuanto salga del horno. 🔥`,
      '<span class="text-[11px] text-stone-500">👉 El pedido ya ha entrado en la <strong>comandera de cocina</strong> (pestaña 1), columna «Recepción».</span>' + botones([{ texto: '🍳 Verlo en la cocina', accion: 'cocina' }, { texto: '🍕 Hacer otro pedido', accion: 'carta' }])
    ]);
  }

  // Añade el pedido a la columna «1. Recepción» de la comandera (mismo formato que los tickets de ejemplo).
  function crearComandaKDS({ num, cliente, hora: h, lineas, importe, pagado }) {
    const col = document.getElementById('kds-col-reception');
    if (!col) return;
    const items = lineas.map(l => plano(`${l.uds}x ${nombreLinea(l)}`));
    const totalTxt = plano(importe.toFixed(2) + '€');
    const estado = pagado ? 'PAGADO ONLINE' : 'PAGA AL RECOGER';
    const div = document.createElement('div');
    div.id = 'ticket-' + num;
    div.draggable = true;
    div.ondragstart = window.drag;
    div.className = 'bg-stone-900 border border-sky-500/80 rounded-xl p-3.5 shadow-lg animate-pulse cursor-grab active:cursor-grabbing transition';
    div.innerHTML = `
      <div class="flex items-start justify-between">
        <div>
          <div class="flex items-center gap-2">
            <span class="font-mono font-bold text-sm text-white">#${num}</span>
            <span class="text-[10px] ${pagado ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'} px-1.5 py-0.5 rounded font-bold">${pagado ? 'PAGADO' : 'PAGA AL RECOGER'}</span>
          </div>
          <span class="text-xs text-stone-400 block mt-0.5">Cliente: <strong>${esc(plano(cliente))}</strong></span>
        </div>
        <span class="text-[11px] font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/40">Recogida: ${esc(plano(h))}h</span>
      </div>
      <div class="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium"><span>🟢</span> <span>Pedido por WhatsApp</span></div>
      <div class="mt-2.5 pt-2 border-t border-stone-800 space-y-1 text-xs">
        ${lineas.map((l, i) => `<div class="flex justify-between font-semibold text-white"><span>${esc(items[i])}</span><span class="text-stone-400">${eur(precioDe(l) * l.uds)}</span></div>`).join('')}
      </div>
      <div class="mt-3 pt-2.5 border-t border-stone-800 flex items-center justify-between gap-1.5">
        <button onclick="verTicketTermico(${num}, '${plano(cliente)}', '${plano(h)}', [${items.map(t => `'${t}'`).join(', ')}], '${totalTxt}', 'WhatsApp', '${estado}')" class="text-[11px] text-stone-400 hover:text-white bg-stone-800 px-2.5 py-1.5 rounded-lg transition">🖨️ 80mm</button>
        <button onclick="avanzarTicket(${num}, 'prep')" class="text-[11px] font-bold text-white bg-sky-600 hover:bg-sky-500 px-3 py-1.5 rounded-lg transition flex items-center gap-1 shadow"><span>👉 Aceptar a Preparación &rarr;</span></button>
      </div>`;
    col.prepend(div);
    setTimeout(() => div.classList.remove('animate-pulse'), 1500);
    if (typeof window.actualizarContadoresKDS === 'function') window.actualizarContadoresKDS();
  }

  // ---------------------------------------------------------------- Texto libre (en producción lo entiende el LLM)
  function textoLibre(texto) {
    const t = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    usuario(texto);
    const sin = t.match(/\bsin ([a-z ]{3,30})/);
    if (sin && wa.cesta.length && !/gluten|lactosa/.test(sin[1])) {
      const l = wa.cesta[wa.cesta.length - 1];
      l.nota = 'sin ' + sin[1].trim();
      bot([`Anotado: <strong>${esc(nombreLinea(l))}</strong>. Lo verá el pizzero en la comanda. 👨‍🍳` + botones([{ texto: '🛒 Ver mi pedido', accion: 'cesta' }])]);
    } else if (/gluten|celiac|alerg|intoleran|lactosa|frutos secos/.test(t)) {
      bot(['Tenemos masa sin gluten bajo pedido, pero con alergias e intolerancias prefiero que te confirme una persona del equipo cómo se prepara para tu caso. 🙏 Te paso con ellos ahora.' + botones([{ texto: '🙋 Hablar con una persona', accion: 'humano' }])]);
    } else if (/horari|abr|cerr|direcc|donde|ubicac|aparca/.test(t)) {
      horario();
    } else if (/domicilio|reparto|envi|llevar a casa|uber|glovo/.test(t)) {
      bot(['El reparto a domicilio lo hacemos a través de Uber Eats y Glovo. Por aquí puedes <strong>pedir para recoger</strong> (sale recién hecho, sin esperas) o <strong>reservar mesa</strong>. 🍕' + botones(MENU.slice(0, 2))]);
    } else if (/reserv|mesa|cenar|comer ahi|sitio para/.test(t)) {
      wa.ocupado = false; accion('reservar');
    } else if (/barbacoa|diavola|pepperoni|picante|atun|tonno|pollo|cherry|estaciones|serrano|jamon|mitad|verdura|vegetal|carne/.test(t)) {
      const ids = CARTA.filter(p => (p.cat === 'clasicas' || p.cat === 'especiales') && t.split(/\s+/).some(w => w.length > 3 && (p.nombre + ' ' + p.desc).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(w))).map(p => p.id);
      bot([() => carrusel(ids.length ? ids : CARTA.filter(p => p.cat === 'especiales').map(p => p.id), ids.length ? 'Mira, esta es la que buscas:' : 'Mira nuestras especiales:')]);
    } else if (/postre|tiramisu|bebida|cerveza|refresco|bruschetta|entrante|ensalada|lasana|pasta|tosta|salmon/.test(t)) {
      bot([() => carrusel(CARTA.filter(p => p.cat === 'otros').map(p => p.id), 'Para acompañar:'), 'Y para beber:' + botones(BEBIDAS)]);
    } else if (/pizza|carta|menu|pedir|encargar|recoger/.test(t)) {
      verCategorias(false);
    } else if (/repet|lo mismo|lo de siempre/.test(t)) {
      wa.ocupado = false; accion('repetir');
    } else if (/hola|buenas|hey/.test(t)) {
      bot(['¡Hola! 😊 ¿Qué te apetece?' + botones(MENU)]);
    } else {
      bot(['Te entiendo 🙂. Puedo prepararte un pedido para recoger, reservarte mesa o pasarte con una persona del equipo.' + botones(MENU)]);
    }
  }

  function init() {
    if (!chat()) return;
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-pa]');
      if (b && !b.disabled) { accion(b.dataset.pa); return; }
      const s = e.target.closest('[data-pa-sugerencia]');
      if (s && !wa.ocupado) { wa.iniciado = true; textoLibre(s.dataset.paSugerencia); }
    });
    const form = $('#paForm');
    if (form) form.addEventListener('submit', e => {
      e.preventDefault();
      const input = $('#paInput');
      const texto = input.value.trim().slice(0, 300);
      if (!texto || wa.ocupado) return;
      input.value = '';
      wa.iniciado = true;
      textoLibre(texto);
    });
    const reset = $('#paReset');
    if (reset) reset.addEventListener('click', () => {
      if (wa.ocupado) return;
      chat().innerHTML = '';
      wa.cesta = []; wa.iniciado = false; contadorCesta();
      iniciar();
    });
    // El chat arranca la primera vez que se abre la pestaña de WhatsApp.
    const btn = document.getElementById('btn-whatsapp');
    if (btn) btn.addEventListener('click', iniciar);
    if (location.hash === '#whatsapp' && typeof window.switchView === 'function') { window.switchView('whatsapp'); iniciar(); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
