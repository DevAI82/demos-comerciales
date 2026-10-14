/*
 * El Sueño del Quesero · Demo de Altera (catálogo, reserva para recoger, WhatsApp 24/7 e Instagram con Zernio).
 * Todo funciona en el navegador con datos de ejemplo: catálogo orientativo, precios orientativos y clientes genéricos.
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

  // ------------------------------------------------------------------ Ilustraciones de queso (SVG, sin fotos externas)
  // forma: cuña | rueda | azul | rulo | torta | tabla | lote | cata
  function quesoSVG(p) {
    const c = p.color || {};
    const corteza = c.corteza || '#7a5230', pasta = c.pasta || '#f3d98f', fondo = c.fondo || '#fbf3e2';
    const ojos = p.ojos ? '<circle cx="118" cy="104" r="5" fill="' + corteza + '" opacity=".25"/><circle cx="96" cy="122" r="4" fill="' + corteza + '" opacity=".22"/><circle cx="142" cy="122" r="3.5" fill="' + corteza + '" opacity=".22"/>' : '';
    let dibujo = '';
    switch (p.forma) {
      case 'rueda':
        dibujo = `<ellipse cx="120" cy="128" rx="74" ry="22" fill="${corteza}"/><rect x="46" y="88" width="148" height="40" fill="${corteza}"/><ellipse cx="120" cy="88" rx="74" ry="22" fill="${pasta}"/><path d="M120 88 L194 88 A74 22 0 0 1 160 106 Z" fill="${pasta}" opacity=".7"/><path d="M60 98h120" stroke="${corteza}" stroke-opacity=".35" stroke-dasharray="4 5"/>`;
        break;
      case 'azul':
        dibujo = `<path d="M46 132 L120 62 L194 132 Z" fill="${pasta}"/><path d="M46 132 L194 132 L194 148 L46 148 Z" fill="${corteza}"/><path d="M84 112c10-6 14 4 22-2M110 92c8 6 4 14 14 12M128 118c6-8 16-2 22-8M98 126c6 2 10-4 16 0M140 100c4 4 8 0 10 6" stroke="#3f6b6b" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="120" cy="80" r="3" fill="#3f6b6b"/><circle cx="104" cy="104" r="2.5" fill="#3f6b6b"/>`;
        break;
      case 'rulo':
        dibujo = `<rect x="52" y="92" width="120" height="48" rx="24" fill="${corteza}"/><ellipse cx="172" cy="116" rx="20" ry="24" fill="${pasta}"/><ellipse cx="172" cy="116" rx="13" ry="16" fill="#fff" opacity=".55"/><path d="M70 100v32M92 98v36M114 98v36M136 98v36" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>`;
        break;
      case 'torta':
        dibujo = `<ellipse cx="120" cy="124" rx="72" ry="26" fill="${corteza}"/><ellipse cx="120" cy="112" rx="72" ry="26" fill="${corteza}" opacity=".85"/><path d="M78 108 Q120 70 162 108 Q140 120 120 116 Q100 120 78 108Z" fill="${pasta}"/><ellipse cx="120" cy="104" rx="26" ry="8" fill="#fff" opacity=".5"/><path d="M150 70 q8 10 0 22" stroke="#9a7b4f" stroke-width="3" fill="none"/><rect x="146" y="58" width="8" height="16" rx="3" fill="#9a7b4f"/>`;
        break;
      case 'tabla':
        dibujo = `<rect x="30" y="118" width="180" height="20" rx="8" fill="#a8743f"/><rect x="196" y="122" width="24" height="10" rx="5" fill="#a8743f"/><path d="M44 118 L80 84 L116 118Z" fill="#f3d98f"/><path d="M44 118h72v8H44z" fill="#7a5230"/><path d="M120 118 L148 92 L176 118Z" fill="#fff4d6"/><path d="M120 118h56v8h-56z" fill="#c9b48a"/><circle cx="188" cy="108" r="9" fill="#7c2d2d"/><circle cx="200" cy="112" r="7" fill="#7c2d2d"/><circle cx="178" cy="114" r="6" fill="#8a3a3a"/><path d="M88 100h20" stroke="#3f6b6b" stroke-width="3"/><rect x="58" y="104" width="12" height="10" rx="2" fill="#c0392b" opacity=".8"/>`;
        break;
      case 'lote':
        dibujo = `<rect x="56" y="80" width="128" height="64" rx="6" fill="#a8743f"/><rect x="56" y="80" width="128" height="14" fill="#8f5617"/><path d="M120 80v64" stroke="#7c2d2d" stroke-width="8"/><path d="M56 112h128" stroke="#7c2d2d" stroke-width="8" opacity=".9"/><path d="M120 80c-18-26-40-8-22 0M120 80c18-26 40-8 22 0" stroke="#7c2d2d" stroke-width="7" fill="none"/><path d="M70 74 L94 50 L118 74Z" fill="#f3d98f"/><rect x="146" y="40" width="14" height="40" rx="4" fill="#45161a"/><rect x="149" y="30" width="8" height="12" fill="#45161a"/>`;
        break;
      case 'cata':
        dibujo = `<ellipse cx="120" cy="124" rx="86" ry="18" fill="#e9dcc2"/><path d="M60 118 L76 100 L92 118Z" fill="#f3d98f"/><path d="M98 118 L112 102 L126 118Z" fill="#fff4d6"/><path d="M132 118 L146 100 L160 118Z" fill="#e0c06a"/><path d="M166 118 L178 104 L190 118Z" fill="#e8e2c8"/><path d="M84 52h22l-4 28a7 7 0 0 1-14 0z" fill="#7c2d2d" opacity=".85"/><rect x="93" y="80" width="4" height="22" fill="#cdbfa6"/><rect x="84" y="100" width="22" height="4" rx="2" fill="#cdbfa6"/><path d="M140 56h22l-4 28a7 7 0 0 1-14 0z" fill="#f2e6b8" opacity=".9"/><rect x="149" y="84" width="4" height="18" fill="#cdbfa6"/><rect x="140" y="100" width="22" height="4" rx="2" fill="#cdbfa6"/>`;
        break;
      default: // cuña
        dibujo = `<path d="M40 136 L120 60 L200 136 Z" fill="${pasta}"/><path d="M120 60 L200 136 L200 150 L120 82Z" fill="${pasta}" opacity=".75"/><path d="M40 136 L200 136 L200 150 L40 150 Z" fill="${corteza}"/>${p.dibujoCorteza ? '<path d="M40 143h160" stroke="#000" stroke-opacity=".18" stroke-dasharray="6 4" stroke-width="3"/>' : ''}${ojos}`;
    }
    const hojas = p.romero ? '<path d="M150 70 q14 -20 30 -24" stroke="#556130" stroke-width="3" fill="none"/><path d="M158 60l-6-6M166 54l-4-8M172 50l2-8M162 58l8 2M170 52l8 0" stroke="#556130" stroke-width="2.5"/>' : '';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180"><rect width="240" height="180" fill="${fondo}"/><ellipse cx="120" cy="156" rx="90" ry="10" fill="#000" opacity=".07"/>${dibujo}${hojas}</svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  // ------------------------------------------------------------------ Catálogo de ejemplo (precios orientativos)
  // precio: €/kg para quesos al corte; precioUd para tablas, lotes y catas.
  const CATALOGO = [
    { id: 'manchego-curado', nombre: 'Manchego curado DOP', cat: 'oveja', origen: 'Castilla-La Mancha', leche: 'Oveja manchega', curacion: '9-12 meses', precio: 26, sabor: 'intenso', nota: 'El clásico de la tierra: firme, con punto de picor y final a frutos secos.', marida: 'Tinto de La Mancha o membrillo', forma: 'cuna', dibujoCorteza: true, color: { corteza: '#6b4a2a', pasta: '#f0d48a' }, top: true },
    { id: 'manchego-semi', nombre: 'Queso de oveja semicurado', cat: 'oveja', origen: 'Castilla-La Mancha', leche: 'Oveja', curacion: '3-4 meses', precio: 19, sabor: 'suave', nota: 'Tierno y mantecoso. Gusta a toda la familia.', marida: 'Pan de pueblo y uvas', forma: 'cuna', dibujoCorteza: true, color: { corteza: '#9a7346', pasta: '#f6e3a8' } },
    { id: 'oveja-aceite', nombre: 'Oveja viejo en aceite de oliva', cat: 'oveja', origen: 'Castilla-La Mancha', leche: 'Oveja', curacion: '+12 meses', precio: 32, sabor: 'intenso', nota: 'Madurado y conservado en aceite: potente y aromático.', marida: 'Vino dulce o miel', forma: 'cuna', color: { corteza: '#5a3a1e', pasta: '#e7c46a', fondo: '#f7efd8' } },
    { id: 'romero', nombre: 'Queso de oveja al romero', cat: 'oveja', origen: 'Castilla-La Mancha', leche: 'Oveja', curacion: '6 meses', precio: 27, sabor: 'medio', nota: 'Corteza cubierta de romero: aroma de monte y sabor redondo.', marida: 'Blanco con cuerpo', forma: 'rueda', romero: true, color: { corteza: '#6f7a43', pasta: '#f2dc9c' } },
    { id: 'torta', nombre: 'Torta de oveja cremosa', cat: 'oveja', origen: 'Extremadura', leche: 'Oveja', curacion: '60 días', precio: 38, sabor: 'intenso', nota: 'Se abre por arriba y se come a cucharadas. Estrella de las tablas.', marida: 'Picos de pan o tostas', forma: 'torta', color: { corteza: '#c79b5b', pasta: '#fbefc9' }, top: true },
    { id: 'payoyo', nombre: 'Cabra payoya curado', cat: 'cabra', origen: 'Sierra de Grazalema', leche: 'Cabra payoya', curacion: '6 meses', precio: 30, sabor: 'medio', nota: 'Pasta blanca, limpia y con un final ligeramente ácido.', marida: 'Fino o manzanilla', forma: 'rueda', color: { corteza: '#b99a6a', pasta: '#fbf6e9' } },
    { id: 'rulo-cabra', nombre: 'Rulo de cabra', cat: 'cabra', origen: 'España', leche: 'Cabra', curacion: '15 días', precio: 22, sabor: 'suave', nota: 'Para gratinar o para ensaladas con nueces y miel.', marida: 'Blanco joven', forma: 'rulo', color: { corteza: '#efe9dc', pasta: '#fffdf6' } },
    { id: 'azul-asturiano', nombre: 'Azul asturiano de cueva', cat: 'azul', origen: 'Asturias', leche: 'Mezcla', curacion: '3-4 meses', precio: 36, sabor: 'intenso', nota: 'Para valientes: picante, húmedo y largo en boca.', marida: 'Sidra o vino dulce', forma: 'azul', color: { corteza: '#8d7a5c', pasta: '#f4ecd2' }, top: true },
    { id: 'gorgonzola', nombre: 'Gorgonzola dolce', cat: 'azul', origen: 'Italia', leche: 'Vaca', curacion: '2 meses', precio: 29, sabor: 'medio', nota: 'Azul cremoso y amable. Perfecto para salsas.', marida: 'Pera y nueces', forma: 'azul', color: { corteza: '#d7c49a', pasta: '#fbf3d8' } },
    { id: 'idiazabal', nombre: 'Idiazabal ahumado', cat: 'oveja', origen: 'País Vasco', leche: 'Oveja latxa', curacion: '4 meses', precio: 29, sabor: 'medio', nota: 'Ahumado suave con madera de haya.', marida: 'Txakoli o sidra', forma: 'cuna', dibujoCorteza: true, color: { corteza: '#8a5a2b', pasta: '#f1d999' } },
    { id: 'comte', nombre: 'Comté 18 meses', cat: 'internacional', origen: 'Francia', leche: 'Vaca', curacion: '18 meses', precio: 42, sabor: 'medio', nota: 'Cristalitos de sal, notas de avellana tostada.', marida: 'Blanco del Jura o tinto ligero', forma: 'cuna', ojos: true, color: { corteza: '#9c7a45', pasta: '#f0d27c' } },
    { id: 'brie', nombre: 'Brie de Meaux', cat: 'internacional', origen: 'Francia', leche: 'Vaca', curacion: '6 semanas', precio: 28, sabor: 'suave', nota: 'Corteza florida, interior fundente.', marida: 'Cava o champán', forma: 'cuna', color: { corteza: '#f3efe6', pasta: '#f8e6a8' } },
    { id: 'tabla-4', nombre: 'Tabla para 4 personas', cat: 'lotes', origen: '5 quesos + membrillo y picos', precioUd: 32, sabor: 'mixto', nota: 'La preparamos cortada y lista para servir. Dinos si la queréis suave, intensa o mixta.', forma: 'tabla', ud: 'tabla', top: true },
    { id: 'lote-regalo', nombre: 'Lote regalo «La Mancha»', cat: 'lotes', origen: '3 quesos + vino + mermelada', precioUd: 45, sabor: 'mixto', nota: 'En caja con lazo y tarjeta escrita a mano. Ideal para empresas y Navidad.', forma: 'lote', ud: 'lote' },
    { id: 'cata', nombre: 'Cata guiada de 8 quesos', cat: 'lotes', origen: 'En tienda, grupos reducidos', precioUd: 18, sabor: 'mixto', nota: 'Una tarde aprendiendo a catar 8 quesos con maridaje. Precio por persona.', forma: 'cata', ud: 'persona' }
  ];
  CATALOGO.forEach(p => { p.img = quesoSVG(p); });
  const byId = id => CATALOGO.find(p => p.id === id);

  const CATEGORIAS = [
    { id: 'todos', nombre: 'Todos' },
    { id: 'oveja', nombre: 'Oveja' },
    { id: 'cabra', nombre: 'Cabra' },
    { id: 'azul', nombre: 'Azules' },
    { id: 'internacional', nombre: 'Internacionales' },
    { id: 'lotes', nombre: 'Tablas, lotes y catas' }
  ];

  // Precio de una línea: al corte se reserva por gramos (250 g por defecto).
  const precioLinea = (p, cantidad) => p.precioUd ? p.precioUd * cantidad : p.precio * cantidad / 1000;
  const etiquetaCantidad = (p, cantidad) => p.precioUd ? `${cantidad} ${p.ud}${cantidad > 1 ? (p.ud === 'persona' ? 's' : 's') : ''}` : (cantidad >= 1000 ? (cantidad / 1000).toLocaleString('es-ES') + ' kg' : cantidad + ' g');
  const precioTexto = p => p.precioUd ? `${eur(p.precioUd)} / ${p.ud}` : `${eur(p.precio)} / kg`;

  // ------------------------------------------------------------------ Horas de recogida (horario a confirmar con la tienda)
  function huecosRecogida() {
    const ahora = new Date();
    const dias = [];
    for (let i = 0; dias.length < 2 && i < 5; i++) {
      const d = new Date(ahora); d.setDate(ahora.getDate() + i);
      if (d.getDay() === 0) continue; // domingo cerrado
      const sab = d.getDay() === 6;
      const franjas = sab ? ['11:00', '12:30', '13:30'] : ['11:00', '13:00', '18:00', '19:30'];
      const libres = franjas.filter(f => i > 0 || parseInt(f, 10) > ahora.getHours() + 1);
      if (!libres.length) continue;
      const nombre = i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : d.toLocaleDateString('es-ES', { weekday: 'long' });
      dias.push({ nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1), fecha: d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }), franjas: libres });
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

  // ================================================================== 1. WEB NUEVA: catálogo + reserva para recoger
  const web = { cat: 'todos', carrito: [] };

  function tarjetaProducto(p) {
    return `
      <article class="bg-white rounded-2xl border border-queso-200 overflow-hidden card-shadow flex flex-col">
        <img src="${p.img}" alt="${esc(p.nombre)}" width="240" height="180" loading="lazy" class="w-full aspect-[4/3] object-cover">
        <div class="p-4 flex flex-col gap-2 flex-1">
          <div class="flex items-start justify-between gap-2">
            <h4 class="font-display text-lg leading-tight text-vino-900">${esc(p.nombre)}</h4>
            ${p.top ? '<span class="shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-queso-100 text-queso-800">Favorito</span>' : ''}
          </div>
          <p class="text-xs text-stone-500">${esc(p.origen)}${p.curacion ? ' · ' + esc(p.curacion) : ''}</p>
          <p class="text-sm text-stone-700 leading-snug">${esc(p.nota)}</p>
          <div class="mt-auto pt-2 flex items-center justify-between gap-2">
            <span class="font-bold text-vino-800">${precioTexto(p)}</span>
            <button type="button" data-add="${p.id}" class="min-h-[44px] px-4 rounded-xl bg-vino-700 hover:bg-vino-800 text-white text-sm font-bold transition">Reservar</button>
          </div>
        </div>
      </article>`;
  }

  function renderCatalogoWeb() {
    const filtros = $('#webFiltros');
    if (!filtros) return;
    filtros.innerHTML = CATEGORIAS.map(c => `<button type="button" data-cat="${c.id}" class="shrink-0 min-h-[40px] px-4 rounded-full text-sm font-semibold border transition ${web.cat === c.id ? 'bg-vino-800 text-white border-vino-800' : 'bg-white text-stone-700 border-queso-200 hover:border-vino-600'}">${c.nombre}</button>`).join('');
    const lista = CATALOGO.filter(p => web.cat === 'todos' || p.cat === web.cat);
    $('#webCatalogo').innerHTML = lista.map(tarjetaProducto).join('');
  }

  function renderCarritoWeb() {
    const box = $('#webCarrito');
    if (!box) return;
    const n = web.carrito.length;
    $('#webCarritoCount').textContent = n;
    if (!n) {
      box.innerHTML = '<p class="text-sm text-stone-500">Aún no has elegido nada. Pulsa «Reservar» en cualquier queso.</p>';
      $('#webReservarBtn').disabled = true;
      return;
    }
    $('#webReservarBtn').disabled = false;
    const total = web.carrito.reduce((s, l) => s + precioLinea(byId(l.id), l.cantidad), 0);
    box.innerHTML = web.carrito.map((l, i) => {
      const p = byId(l.id);
      const opciones = p.precioUd ? [1, 2, 3, 4, 6, 8].map(v => `<option value="${v}" ${v === l.cantidad ? 'selected' : ''}>${etiquetaCantidad(p, v)}</option>`).join('')
        : [150, 250, 500, 1000].map(v => `<option value="${v}" ${v === l.cantidad ? 'selected' : ''}>${etiquetaCantidad(p, v)}</option>`).join('');
      return `<div class="flex items-center gap-3 py-2 border-b border-queso-100">
        <img src="${p.img}" alt="" width="48" height="36" class="w-12 h-9 rounded-lg object-cover">
        <div class="flex-1 min-w-0"><p class="text-sm font-semibold text-stone-800 truncate">${esc(p.nombre)}</p>
          <label class="sr-only" for="cant-${i}">Cantidad de ${esc(p.nombre)}</label>
          <select id="cant-${i}" data-cant="${i}" class="mt-1 text-xs border border-queso-200 rounded-lg px-2 py-1 bg-white">${opciones}</select></div>
        <span class="text-sm font-bold text-vino-800 whitespace-nowrap">${eur(precioLinea(p, l.cantidad))}</span>
        <button type="button" data-del="${i}" aria-label="Quitar ${esc(p.nombre)}" class="w-9 h-9 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50">✕</button>
      </div>`;
    }).join('') + `<div class="flex justify-between pt-3 text-sm"><span class="text-stone-600">Total orientativo</span><strong class="text-vino-900">${eur(total)}</strong></div>`;
  }

  function renderHuecosWeb() {
    const sel = $('#webHueco');
    if (!sel) return;
    sel.innerHTML = huecosRecogida().map(d => `<optgroup label="${d.nombre} ${d.fecha}">${d.franjas.map(f => `<option value="${d.nombre} ${d.fecha} · ${f}">${d.nombre} a las ${f}</option>`).join('')}</optgroup>`).join('');
  }

  function iniciarWeb() {
    renderCatalogoWeb();
    renderCarritoWeb();
    renderHuecosWeb();
    document.addEventListener('click', e => {
      const f = e.target.closest('[data-cat]');
      if (f) { web.cat = f.dataset.cat; renderCatalogoWeb(); return; }
      const add = e.target.closest('[data-add]');
      if (add) {
        const p = byId(add.dataset.add);
        const ya = web.carrito.find(l => l.id === p.id);
        if (ya) ya.cantidad = p.precioUd ? ya.cantidad + 1 : Math.min(ya.cantidad + 250, 1000);
        else web.carrito.push({ id: p.id, cantidad: p.precioUd ? (p.id === 'cata' ? 2 : 1) : 250 });
        renderCarritoWeb();
        toast(`Añadido: ${p.nombre}`);
        return;
      }
      const del = e.target.closest('[data-del]');
      if (del) { web.carrito.splice(+del.dataset.del, 1); renderCarritoWeb(); }
    });
    document.addEventListener('change', e => {
      const c = e.target.closest('[data-cant]');
      if (c) { web.carrito[+c.dataset.cant].cantidad = +c.value; renderCarritoWeb(); }
    });
    const form = $('#webReservaForm');
    if (form) form.addEventListener('submit', e => {
      e.preventDefault();
      if (!web.carrito.length) return;
      const nombre = ($('#webNombre').value || '').trim().slice(0, 40) || 'Cliente de ejemplo';
      const r = Q.nuevaReserva({ cliente: nombre, canal: 'Web', recogida: $('#webHueco').value, pago: $('#webPago').value, lineas: web.carrito.map(l => ({ ...l })) });
      web.carrito = [];
      renderCarritoWeb();
      $('#webConfirmacion').innerHTML = `<div class="p-4 rounded-2xl bg-oliva-50 border border-oliva-500/30 text-sm text-stone-800 space-y-1">
        <p class="font-bold text-oliva-700">✅ Reserva ${esc(r.codigo)} confirmada</p>
        <p>${esc(r.cliente)}, te lo dejamos cortado y envasado para recoger <strong>${esc(r.recogida)}</strong> en Calle Rosario, 58.</p>
        <p class="text-xs text-stone-500">Te llega la confirmación por WhatsApp y un recordatorio 2 horas antes. Ya aparece en el CRM de la tienda.</p>
      </div>`;
      toast('Reserva enviada al CRM de la tienda');
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

  const MENU = [
    { texto: '🧀 Ver quesos con fotos', accion: 'ver' },
    { texto: '🍽️ Prepárame una tabla', accion: 'tabla' },
    { texto: '🎁 Lotes de regalo', accion: 'regalo' },
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
        waBot(['Tenemos más de 30 variedades en tienda. ¿De qué tipo?' + botones([
          { texto: '🐑 Oveja', accion: 'cat:oveja' }, { texto: '🐐 Cabra', accion: 'cat:cabra' },
          { texto: '🔵 Azules', accion: 'cat:azul' }, { texto: '🌍 Internacionales', accion: 'cat:internacional' }
        ])]);
        break;
      case 'cat': {
        const nombres = { oveja: 'Oveja', cabra: 'Cabra', azul: 'Azules', internacional: 'Internacionales' };
        waUsuario(nombres[valor] || valor);
        const ids = CATALOGO.filter(p => p.cat === valor).map(p => p.id);
        waBot([() => waCarrusel(ids, `Aquí tienes nuestros ${(nombres[valor] || '').toLowerCase()} (desliza 👉). Precios orientativos al corte:`), 'Cuando lo tengas, pulsa «Ver mi cesta».' + botones([{ texto: '🧺 Ver mi cesta', accion: 'cesta' }, { texto: '↩️ Otro tipo', accion: 'ver' }])]);
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
        const selec = { suave: ['manchego-semi', 'brie', 'rulo-cabra', 'payoyo'], intenso: ['manchego-curado', 'oveja-aceite', 'torta', 'azul-asturiano'], mixto: ['manchego-curado', 'torta', 'payoyo', 'azul-asturiano', 'comte'] }[valor];
        const gramos = wa.personas >= 6 ? 250 : wa.personas >= 4 ? 150 : 100;
        wa.propuesta = selec.map(id => ({ id, cantidad: gramos }));
        const total = wa.propuesta.reduce((s, l) => s + precioLinea(byId(l.id), l.cantidad), 0);
        waBot([
          () => waCarrusel(selec, `Para ${wa.personas >= 6 ? '6-8' : wa.personas} personas te propongo esta tabla (unos ${gramos} g de cada uno):`),
          `Total orientativo: <strong>${eur(total)}</strong>. Te la dejamos cortada, con membrillo y picos de regalo. 😉` + botones([{ texto: '✅ Reservar esta tabla', accion: 'aceptarTabla' }, { texto: '🔄 Cambiar estilo', accion: 'personas:' + wa.personas }])
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
        waUsuario('Lotes de regalo');
        waBot([() => waCarrusel(['lote-regalo', 'tabla-4', 'cata'], 'Nuestros regalos más pedidos 🎁 (también hacemos lotes a medida para empresas):'), 'Si es para empresa, dime cuántos lotes necesitas y te paso presupuesto.' + botones([{ texto: '🧺 Ver mi cesta', accion: 'cesta' }, { texto: '🏢 Lotes para empresa', accion: 'empresa' }])]);
        break;
      case 'empresa':
        waUsuario('Lotes para empresa');
        waBot(['Perfecto. Le paso tu mensaje al equipo y te escriben hoy mismo con presupuesto. 📋 Ya queda apuntado en el CRM como <em>oportunidad de lotes de empresa</em>.' + botones(MENU)]);
        break;
      case 'horario':
        waUsuario('Horario y dirección');
        waBot(['📍 <strong>Calle Rosario, 58 · Albacete</strong><br>🕒 L-V 10:30-14:00 y 17:30-20:30 · Sábado por la mañana<br><span class="text-[11px] text-stone-500">(Horario de ejemplo: lo ajustamos al real de la tienda)</span>', 'Aunque estemos cerrados, puedes reservar por aquí y lo recoges cuando abramos. 🙂' + botones(MENU)]);
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
    waBot([`¿Cuándo pasas a recogerlo?${dias.map(d => `<p class="mt-2 text-[12px] font-semibold text-stone-500">${d.nombre} ${d.fecha}</p>` + botones(d.franjas.map(f => ({ texto: `${d.nombre} a las ${f}`, accion: `hueco:${d.nombre}_${d.fecha}_·_${f}` })))).join('')}`]);
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
    } else if (/regalo|lote|navidad|cesta|empresa/.test(t)) {
      waBot([() => waCarrusel(['lote-regalo', 'tabla-4', 'cata'], 'Mira nuestros regalos 🎁:')]);
    } else if (/cata|curso|degustac/.test(t)) {
      waBot([() => waCarrusel(['cata'], 'Hacemos catas guiadas en la tienda para grupos reducidos:'), '¿Te reservo plaza? Elige la cantidad en la tarjeta y luego la fecha.']);
    } else if (/manchego|oveja|curado/.test(t)) {
      waBot([() => waCarrusel(['manchego-curado', 'manchego-semi', 'oveja-aceite', 'romero'], 'Nuestros quesos de oveja manchega:')]);
    } else if (/azul|cabrales|gorgonzola|fuerte|pica/.test(t)) {
      waBot([() => waCarrusel(['azul-asturiano', 'gorgonzola'], 'Para los amantes del azul 🔵:')]);
    } else if (/cabra|payoy|rulo/.test(t)) {
      waBot([() => waCarrusel(['payoyo', 'rulo-cabra'], 'Quesos de cabra:')]);
    } else if (/envi|domicilio|mensajer|correo/.test(t)) {
      waBot(['Ahora mismo trabajamos con <strong>reserva y recogida en tienda</strong>. Si necesitas envío, el equipo te dice si es posible para tu caso. 📦' + botones([{ texto: '🙋 Hablar con una persona', accion: 'humano' }, { texto: '🧀 Ver quesos', accion: 'ver' }])]);
    } else if (/precio|cuanto|vale|cuesta/.test(t)) {
      waBot(['Los precios dependen del queso y del peso. Te enseño el catálogo con precios orientativos:' + botones([{ texto: '🧀 Ver quesos con fotos', accion: 'ver' }, { texto: '🍽️ Prepárame una tabla', accion: 'tabla' }])]);
    } else if (/hola|buenas|hey/.test(t)) {
      waBot(['¡Hola! 😊 ¿Qué te apetece?' + botones(MENU)]);
    } else {
      waBot(['Te entiendo 🙂. Puedo enseñarte quesos con fotos, prepararte una tabla o pasarte con una persona del equipo.' + botones([...MENU.slice(0, 2), { texto: '🙋 Hablar con una persona', accion: 'humano' }])]);
    }
  }
  function waAccionSinEco(accion) {
    if (accion === 'horario') waBot(['📍 <strong>Calle Rosario, 58 · Albacete</strong><br>🕒 L-V 10:30-14:00 y 17:30-20:30 · Sábado por la mañana<br><span class="text-[11px] text-stone-500">(Horario de ejemplo: lo ajustamos al real de la tienda)</span>' + botones(MENU)]);
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
    { usuario: 'maria_ab.cocina', texto: '¿Precio de la tabla? 😍', respuestaPublica: '¡Hola María! Te lo mandamos por privado 📩', dm: 'Hola María 👋 La tabla para 4 sale por 32 € (orientativo). Puedes reservarla aquí y recogerla en Calle Rosario, 58:', producto: 'tabla-4' },
    { usuario: 'javi.gastro', texto: '¿Tenéis torta cremosa esta semana?', respuestaPublica: '¡Sí! Te escribimos por privado con los detalles 🧀', dm: 'Hola Javi, sí tenemos torta de oveja cremosa esta semana. ¿Te guardo una?', producto: 'torta' },
    { usuario: 'lucia_albacete', texto: 'Quiero regalar algo para Navidad 🎁', respuestaPublica: '¡Qué buena idea! Te mandamos opciones por DM ✨', dm: 'Hola Lucía 🎄 Te paso nuestro lote regalo «La Mancha». Si es para empresa, te hacemos presupuesto:', producto: 'lote-regalo' }
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
    if (img) img.src = byId('tabla-4').img;
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
    iniciarEventosWA();
    iniciarEventosIG();
    const inicial = (location.hash || '').replace('#', '');
    if (['web', 'whatsapp', 'instagram', 'crm', 'seo', 'inversion'].includes(inicial)) window.switchTab(inicial);
    else window.switchTab('web');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
