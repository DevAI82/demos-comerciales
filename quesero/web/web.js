/*
 * Web nueva de El Sueño del Quesero (maqueta de Altera): catálogo real, ficha de cada queso, reserva para recoger
 * y llamada de ejemplo con Laura. Sin servidor: la reserva se confirma por WhatsApp.
 * Si la página va dentro de la demo (iframe en ../index.html), las reservas llegan también al CRM de la demo.
 */
(function () {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const eur = n => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const { CATALOGO, CATEGORIAS, enCategoria } = window.QS_CATALOGO;
  const byId = id => CATALOGO.find(p => p.id === id);
  const precioLinea = (p, c) => p.precioUd ? p.precioUd * c : p.precio * c / 1000;
  const cantidadTxt = (p, c) => p.precioUd ? `${c} ${p.ud}${c > 1 ? 's' : ''}` : (c >= 1000 ? (c / 1000).toLocaleString('es-ES') + ' kg' : c + ' g');
  const precioTxt = p => p.precioUd ? `<b>${eur(p.precioUd)}</b> <span>/ ${esc(p.ud)}</span>` : `<b>${eur(p.precio)}</b> <span>/ kg</span>`;

  // Dentro de la demo: el CRM vive en la página padre (misma web).
  let demo = null;
  try { if (window.parent !== window && window.parent.QUESERO) demo = window.parent.QUESERO; } catch (e) { demo = null; }
  if (demo) document.documentElement.classList.add('en-demo');

  const estado = { cat: 'todos', cesta: [] };

  let tt;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('si'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('si'), 2600); }

  // ------------------------------------------------------------ Catálogo
  function pintaFiltros() {
    $('#filtros').innerHTML = CATEGORIAS.map(c => {
      const n = CATALOGO.filter(p => enCategoria(p, c.id)).length;
      return `<button type="button" class="filtro" data-cat="${c.id}" aria-pressed="${estado.cat === c.id}">${esc(c.nombre)}<small>${n}</small></button>`;
    }).join('');
  }
  function tarjeta(p, i) {
    return `<article class="queso" style="animation-delay:${Math.min(i, 12) * 35}ms">
      <button type="button" class="queso-foto" data-ficha="${p.id}" aria-label="Ver la ficha de ${esc(p.nombre)}">
        <img src="${esc(p.img)}" alt="${esc(p.nombre)}" width="640" height="640" loading="lazy" decoding="async">
        ${p.top ? '<span class="chip">Favorito</span>' : ''}${p.albacete ? '<span class="chip ab">De Albacete</span>' : ''}
      </button>
      <div class="queso-txt">
        <p class="lema">${esc(p.lema)}</p>
        <h3>${esc(p.nombre)}${p.apellido ? `<small>${esc(p.apellido)}</small>` : ''}</h3>
        <p class="meta"><span>${esc(p.lugar)}</span>${p.curacion ? `<span>${esc(p.curacion)}</span>` : ''}</p>
        <div class="queso-pie"><p class="precio">${precioTxt(p)}</p><button type="button" class="anadir" data-anadir="${p.id}">${p.precioUd ? 'Añadir' : 'Añadir 250 g'}</button></div>
      </div>
    </article>`;
  }
  function pintaRejilla() {
    $('#rejilla').innerHTML = CATALOGO.filter(p => enCategoria(p, estado.cat)).map(tarjeta).join('');
  }

  // ------------------------------------------------------------ Ficha
  const ficha = $('#ficha');
  function abreFicha(id) {
    const p = byId(id);
    if (!p) return;
    const opciones = p.precioUd ? [1, 2, 3] : [150, 250, 500, 1000];
    const def = p.precioUd ? 1 : 250;
    ficha.innerHTML = `<button type="button" class="cerrar" data-cerrar-ficha aria-label="Cerrar">✕</button>
      <div class="ficha">
        <div class="ficha-foto"><img src="${esc(p.img)}" alt="${esc(p.nombre)}" width="640" height="640"></div>
        <div class="ficha-txt">
          <p class="lema" style="font:italic 400 1rem 'Fraunces',serif;color:var(--oro-osc)">${esc(p.lema)}</p>
          <h3 id="ficha-tit">${esc(p.nombre)}</h3>
          ${p.apellido ? `<p style="color:var(--tinta-2);font-size:.9rem">${esc(p.apellido)}</p>` : ''}
          <p style="color:var(--tinta-2)">${esc(p.nota)}</p>
          <dl>
            ${p.leche ? `<dt>Leche</dt><dd>${esc(p.leche)}</dd>` : ''}
            ${p.curacion ? `<dt>Maduración</dt><dd>${esc(p.curacion)}</dd>` : ''}
            <dt>${p.cat === 'regalos' ? 'Envío' : 'Productor'}</dt><dd>${esc(p.cat === 'regalos' ? p.lugar : p.productor + ' · ' + p.lugar)}</dd>
            <dt>Precio</dt><dd>${p.precioUd ? eur(p.precioUd) + ' / ' + esc(p.ud) : eur(p.precio) + ' / kg'} <span style="color:var(--tinta-2);font-weight:400">(orientativo)</span></dd>
          </dl>
          <div class="gramos" role="group" aria-label="Cantidad">${opciones.map(o => `<button type="button" data-gramos="${o}" aria-pressed="${o === def}">${cantidadTxt(p, o)}</button>`).join('')}</div>
          <button type="button" class="btn btn-oro" data-anadir-ficha="${p.id}" data-cant="${def}">Añadir a la reserva · ${eur(precioLinea(p, def))}</button>
        </div>
      </div>`;
    if (typeof ficha.showModal === 'function') ficha.showModal(); else ficha.setAttribute('open', '');
  }
  function cierraFicha() { if (ficha.open) { if (typeof ficha.close === 'function') ficha.close(); else ficha.removeAttribute('open'); } }

  // ------------------------------------------------------------ Cesta
  function anade(id, cant) {
    const p = byId(id);
    const ya = estado.cesta.find(l => l.id === id);
    if (ya) ya.cantidad = p.precioUd ? ya.cantidad + cant : Math.min(ya.cantidad + cant, 2000);
    else estado.cesta.push({ id, cantidad: cant });
    pintaCesta();
    toast(`Añadido: ${p.nombre} (${cantidadTxt(p, cant)})`);
  }
  function huecos() {
    // Franjas genéricas: las horas exactas salen del horario real de la tienda.
    const d = new Date();
    const dia = n => { const x = new Date(d); x.setDate(d.getDate() + n); return x; };
    const nombre = x => x.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' });
    const lista = [];
    if (d.getHours() < 17 && d.getDay() !== 0) lista.push('Hoy por la tarde');
    for (let n = 1; lista.length < 5 && n < 5; n++) {
      const x = dia(n);
      if (x.getDay() === 0) continue;
      const t = n === 1 ? 'Mañana' : nombre(x).replace(/^./, c => c.toUpperCase());
      lista.push(t + ' por la mañana');
      if (x.getDay() !== 6) lista.push(t + ' por la tarde');
    }
    return lista.slice(0, 5);
  }
  function pintaCesta() {
    const n = estado.cesta.length;
    document.querySelectorAll('[data-cesta-n]').forEach(b => { b.textContent = n; b.classList.toggle('si', n > 0); });
    const cuerpo = $('#cesta-cuerpo');
    const total = estado.cesta.reduce((s, l) => s + precioLinea(byId(l.id), l.cantidad), 0);
    $('#cesta-total').textContent = eur(total);
    $('#r-enviar').disabled = !n;
    if (n) $('#cesta-form').hidden = false;
    if (!n) {
      cuerpo.innerHTML = `<div class="cesta-vacia"><img src="../img/marca.png" alt="" width="160" height="102"><p>Aún no has elegido ningún queso.</p><p style="font-size:.9rem;margin-top:.4rem">Pulsa «Añadir» en cualquier queso y te lo dejamos cortado para recoger.</p></div>`;
      return;
    }
    cuerpo.innerHTML = estado.cesta.map((l, i) => {
      const p = byId(l.id);
      const ops = p.precioUd ? [1, 2, 3, 4] : [150, 250, 500, 750, 1000, 1500, 2000];
      if (!ops.includes(l.cantidad)) ops.push(l.cantidad);
      return `<div class="linea"><img src="${esc(p.img)}" alt="" width="64" height="54">
        <div><p>${esc(p.nombre)}</p><label class="sr" for="c-${i}" style="position:absolute;left:-999px">Cantidad</label>
        <select id="c-${i}" data-cant-linea="${i}">${ops.sort((a, b) => a - b).map(o => `<option value="${o}" ${o === l.cantidad ? 'selected' : ''}>${cantidadTxt(p, o)}</option>`).join('')}</select></div>
        <div class="der"><strong>${eur(precioLinea(p, l.cantidad))}</strong><br><button type="button" data-quitar="${i}">Quitar</button></div></div>`;
    }).join('');
  }
  function abreCesta() { $('#cesta').classList.add('si'); $('#cesta').setAttribute('aria-hidden', 'false'); $('#velo').classList.add('si'); }
  function cierraCesta() { $('#cesta').classList.remove('si'); $('#cesta').setAttribute('aria-hidden', 'true'); $('#velo').classList.remove('si'); }

  function reservar(e) {
    e.preventDefault();
    if (!estado.cesta.length) return;
    const nombre = ($('#r-nombre').value || '').trim().slice(0, 40);
    if (!nombre) { $('#r-nombre').focus(); toast('Dinos tu nombre para apuntar la reserva'); return; }
    const recogida = $('#r-hora').value;
    const lineas = estado.cesta.map(l => Object.assign({}, l));
    const total = lineas.reduce((s, l) => s + precioLinea(byId(l.id), l.cantidad), 0);
    let codigo = '';
    if (demo && demo.nuevaReserva) { codigo = demo.nuevaReserva({ cliente: nombre, canal: 'Web', recogida, pago: 'Paga en tienda', lineas }).codigo; }
    const texto = `Hola, soy ${nombre}. Quiero reservar para recoger (${recogida}):\n` + lineas.map(l => `- ${byId(l.id).nombre}: ${cantidadTxt(byId(l.id), l.cantidad)}`).join('\n') + `\nTotal orientativo: ${eur(total)}`;
    const wa = 'https://wa.me/34639251884?text=' + encodeURIComponent(texto);
    estado.cesta = [];
    pintaCesta();
    $('#cesta-cuerpo').innerHTML = `<div class="ok-reserva"><h4>¡Reserva preparada, ${esc(nombre)}!</h4>
      <p>Recogida: <strong>${esc(recogida)}</strong> en Calle Rosario, 58. Total orientativo: <strong>${eur(total)}</strong>.</p>
      ${codigo ? `<p>Código <strong>${esc(codigo)}</strong>. Ya aparece en el CRM de la tienda (pestaña CRM de la demo).</p>` : '<p>Confírmala por WhatsApp y te avisamos cuando esté lista.</p>'}
      <a class="btn btn-wa" href="${esc(wa)}" target="_blank" rel="noopener">Confirmar por WhatsApp</a></div>`;
    $('#cesta-form').hidden = true;
    toast('Reserva preparada');
  }

  // ------------------------------------------------------------ Eventos
  document.addEventListener('click', e => {
    const t = e.target;
    const f = t.closest('[data-cat]');
    if (f) { estado.cat = f.dataset.cat; pintaFiltros(); pintaRejilla(); return; }
    const fl = t.closest('[data-filtro]');
    if (fl) { estado.cat = fl.dataset.filtro; pintaFiltros(); pintaRejilla(); }
    const a = t.closest('[data-anadir]');
    if (a) {
      const p = byId(a.dataset.anadir);
      anade(p.id, p.precioUd ? 1 : 250);
      a.classList.add('ok'); a.textContent = '✓ Añadido';
      setTimeout(() => { a.classList.remove('ok'); a.textContent = p.precioUd ? 'Añadir' : 'Añadir 250 g'; }, 1400);
      return;
    }
    const fi = t.closest('[data-ficha]');
    if (fi) { abreFicha(fi.dataset.ficha); return; }
    const g = t.closest('[data-gramos]');
    if (g) {
      const btn = $('[data-anadir-ficha]', ficha);
      const p = byId(btn.dataset.anadirFicha);
      ficha.querySelectorAll('[data-gramos]').forEach(x => x.setAttribute('aria-pressed', String(x === g)));
      btn.dataset.cant = g.dataset.gramos;
      btn.textContent = `Añadir a la reserva · ${eur(precioLinea(p, +g.dataset.gramos))}`;
      return;
    }
    const af = t.closest('[data-anadir-ficha]');
    if (af) { anade(af.dataset.anadirFicha, +af.dataset.cant); cierraFicha(); abreCesta(); return; }
    if (t.closest('[data-cerrar-ficha]') || t === ficha) { cierraFicha(); return; }
    if (t.closest('[data-abrir-cesta]')) { abreCesta(); return; }
    if (t.closest('[data-cerrar-cesta]')) { cierraCesta(); return; }
    const q = t.closest('[data-quitar]');
    if (q) { estado.cesta.splice(+q.dataset.quitar, 1); pintaCesta(); }
  });
  document.addEventListener('change', e => {
    const s = e.target.closest('[data-cant-linea]');
    if (s) { estado.cesta[+s.dataset.cantLinea].cantidad = +s.value; pintaCesta(); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') cierraCesta(); });
  $('#cesta-form').addEventListener('submit', reservar);

  // ------------------------------------------------------------ Arranque
  $('#r-hora').innerHTML = huecos().map(h => `<option>${esc(h)}</option>`).join('');
  $('#anio').textContent = new Date().getFullYear();
  pintaFiltros();
  pintaRejilla();
  pintaCesta();
  if (window.QS_LLAMADA) window.QS_LLAMADA.montar($('#llamada'), {
    onReserva(r) { if (demo && demo.nuevaReserva) demo.nuevaReserva(r); }
  });

  const cab = $('#cab');
  const alScroll = () => cab.classList.toggle('con-borde', window.scrollY > 8);
  window.addEventListener('scroll', alScroll, { passive: true });
  alScroll();
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('visto'); io.unobserve(x.target); } }), { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.revela').forEach(el => io.observe(el));
  } else document.querySelectorAll('.revela').forEach(el => el.classList.add('visto'));
})();
