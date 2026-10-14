/*
 * El Sueño del Quesero · Llamada simulada con Laura, la asistente de voz (ElevenLabs + Telnyx en la versión real).
 * Reproduce siete audios ya grabados (quesero/audio/llamada-01…07.mp3) con la transcripción sincronizada
 * y, al terminar, la reserva que Laura deja apuntada. No conecta con ningún agente en directo.
 * Uso: QS_LLAMADA.montar(elemento, { onReserva(reserva) {} })
 */
(function () {
  'use strict';
  const base = (document.currentScript && document.currentScript.src) ? new URL('.', document.currentScript.src).href : '';

  const GUION = [
    { quien: 'laura', texto: '¡Hola! El Sueño del Quesero, te atiende Laura, la asistente virtual. ¿Buscas algún queso, quieres reservar para recoger o preguntar por una cata?' },
    { quien: 'cliente', texto: 'Hola, buenas. Mañana tengo una cena para seis y quería preparar una tabla de quesos, pero que haya algo de Albacete.' },
    { quien: 'laura', texto: '¡Qué buen plan! Para seis te recomiendo el Dehesa de Los Llanos Gran Reserva, un manchego de aquí, de Albacete, con doce meses de curación; un Payoyo de cabra, muy cremoso; y un Gorgonzola dolce para el toque azul. ¿Te pongo un cuarto de kilo de cada uno?', quesos: ['dehesa-llanos', 'payoyo', 'gorgonzola'] },
    { quien: 'cliente', texto: 'Perfecto, eso mismo. Lo recojo mañana por la mañana.' },
    { quien: 'laura', texto: 'Genial. ¿Me dices tu nombre? Te escribimos al móvil desde el que llamas.' },
    { quien: 'cliente', texto: 'Carlos. Muchas gracias.' },
    { quien: 'laura', texto: 'A ti, Carlos. Te apunto un cuarto de Dehesa de Los Llanos, otro de Payoyo y otro de Gorgonzola para recoger mañana por la mañana. Te confirmamos la hora por WhatsApp. ¡Gracias por llamar a El Sueño del Quesero, que lo disfrutes!' }
  ];
  const RESERVA = { cliente: 'Carlos (llamada)', canal: 'Teléfono', recogida: 'Mañana por la mañana', pago: 'Paga en tienda', lineas: [{ id: 'dehesa-llanos', cantidad: 250 }, { id: 'payoyo', cantidad: 250 }, { id: 'gorgonzola', cantidad: 250 }] };

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const eur = n => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

  const CSS = `
  .qsl{--l-bg:#1b1714;--l-panel:#25201b;--l-line:rgba(233,201,138,.18);--l-oro:#e9c98a;--l-texto:#f5ede0;--l-suave:#b9ab97;font-family:inherit;color:var(--l-texto);background:radial-gradient(120% 90% at 0% 0%,#3a2a1c 0%,var(--l-bg) 55%);border:1px solid var(--l-line);border-radius:24px;overflow:hidden;display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr)}
  @media (max-width:760px){.qsl{grid-template-columns:minmax(0,1fr)}}
  .qsl *{box-sizing:border-box}
  .qsl-tel{padding:28px 24px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:14px;border-right:1px solid var(--l-line)}
  @media (max-width:760px){.qsl-tel{border-right:0;border-bottom:1px solid var(--l-line)}}
  .qsl-estado{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--l-oro);display:flex;align-items:center;gap:8px}
  .qsl-punto{width:8px;height:8px;border-radius:50%;background:#7b6f60}
  .qsl.en-curso .qsl-punto{background:#5fd38d;box-shadow:0 0 0 0 rgba(95,211,141,.6);animation:qslPulso 1.6s infinite}
  @keyframes qslPulso{70%{box-shadow:0 0 0 10px rgba(95,211,141,0)}100%{box-shadow:0 0 0 0 rgba(95,211,141,0)}}
  .qsl-avatar{position:relative;width:112px;height:112px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,#f3dfb4,#c99a52);color:#2a1d10;font:600 44px/1 Fraunces,Georgia,serif}
  .qsl-avatar::before,.qsl-avatar::after{content:"";position:absolute;inset:-10px;border-radius:50%;border:1px solid rgba(233,201,138,.35);opacity:0}
  .qsl.hablando-laura .qsl-avatar::before{animation:qslOnda 1.4s infinite}
  .qsl.hablando-laura .qsl-avatar::after{animation:qslOnda 1.4s .7s infinite}
  @keyframes qslOnda{0%{transform:scale(.92);opacity:.9}100%{transform:scale(1.3);opacity:0}}
  .qsl-nombre{font:600 22px/1.2 Fraunces,Georgia,serif;margin:0}
  .qsl-sub{font-size:13px;color:var(--l-suave);margin:0}
  .qsl-ondas{display:flex;gap:4px;align-items:center;height:34px}
  .qsl-ondas i{display:block;width:4px;height:6px;border-radius:2px;background:var(--l-oro);opacity:.35;transition:height .15s}
  .qsl.en-curso .qsl-ondas i{opacity:1;animation:qslBarra 1s ease-in-out infinite}
  .qsl.hablando-cliente .qsl-ondas i{background:#9fc7ff}
  .qsl-ondas i:nth-child(2){animation-delay:.1s!important}.qsl-ondas i:nth-child(3){animation-delay:.25s!important}.qsl-ondas i:nth-child(4){animation-delay:.05s!important}.qsl-ondas i:nth-child(5){animation-delay:.3s!important}.qsl-ondas i:nth-child(6){animation-delay:.15s!important}.qsl-ondas i:nth-child(7){animation-delay:.2s!important}
  @keyframes qslBarra{0%,100%{height:6px}50%{height:30px}}
  .qsl-tiempo{font-variant-numeric:tabular-nums;font-size:13px;color:var(--l-suave)}
  .qsl-btn{appearance:none;border:0;cursor:pointer;min-height:48px;padding:0 22px;border-radius:999px;font:600 15px/1 inherit;font-family:inherit;display:inline-flex;align-items:center;gap:10px;transition:transform .15s,background .15s}
  .qsl-btn:active{transform:scale(.97)}
  .qsl-btn:focus-visible{outline:2px solid var(--l-oro);outline-offset:3px}
  .qsl-llamar{background:#2fa866;color:#fff}.qsl-llamar:hover{background:#278f56}
  .qsl-colgar{background:#c8423b;color:#fff}.qsl-colgar:hover{background:#ad362f}
  .qsl-nota{font-size:11px;color:var(--l-suave);max-width:240px;margin:0}
  .qsl-chat{padding:22px 22px 18px;display:flex;flex-direction:column;gap:10px;min-height:360px;max-height:520px;overflow-y:auto}
  .qsl-vacio{margin:auto;text-align:center;color:var(--l-suave);font-size:14px;max-width:340px}
  .qsl-vacio strong{color:var(--l-texto)}
  .qsl-msg{max-width:88%;padding:10px 14px;border-radius:16px;font-size:14px;line-height:1.5;animation:qslEntra .35s ease-out both}
  @keyframes qslEntra{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .qsl-msg small{display:block;font-size:10px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:3px;opacity:.75}
  .qsl-laura{background:var(--l-panel);border:1px solid var(--l-line);border-top-left-radius:4px;align-self:flex-start}
  .qsl-laura small{color:var(--l-oro)}
  .qsl-cliente{background:#2b3a4f;border-top-right-radius:4px;align-self:flex-end}
  .qsl-cliente small{color:#9fc7ff}
  .qsl-quesos{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}
  .qsl-quesos figure{margin:0;width:88px;background:#fff;border-radius:10px;overflow:hidden;color:#2a1d10}
  .qsl-quesos img{display:block;width:88px;height:66px;object-fit:cover}
  .qsl-quesos figcaption{font-size:10px;line-height:1.25;padding:4px 6px;font-weight:600}
  .qsl-ticket{align-self:stretch;margin-top:6px;background:#fbf6ec;color:#2a1d10;border-radius:16px;padding:14px 16px;font-size:13px;animation:qslEntra .4s ease-out both}
  .qsl-ticket h4{margin:0 0 6px;font:600 16px/1.2 Fraunces,Georgia,serif;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}
  .qsl-ticket h4 span{font:600 11px/1.6 inherit;font-family:inherit;color:#2f7a4c;background:#e3f3e8;border-radius:999px;padding:0 8px}
  .qsl-ticket ul{list-style:none;margin:6px 0;padding:0}
  .qsl-ticket li{display:flex;justify-content:space-between;gap:10px;padding:3px 0;border-bottom:1px dashed #e6d9c2}
  .qsl-ticket p{margin:4px 0 0;color:#6b5a45}
  `;

  function estilos() {
    if (document.getElementById('qsl-css')) return;
    const s = document.createElement('style');
    s.id = 'qsl-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function montar(el, opciones) {
    if (!el) return;
    estilos();
    const op = opciones || {};
    const cat = (window.QS_CATALOGO && window.QS_CATALOGO.CATALOGO) || [];
    const byId = id => cat.find(p => p.id === id);
    el.innerHTML = `
      <div class="qsl" role="region" aria-label="Llamada de ejemplo con Laura, la asistente de voz">
        <div class="qsl-tel">
          <p class="qsl-estado"><span class="qsl-punto" aria-hidden="true"></span><span data-l="estado">Teléfono de la tienda</span></p>
          <div class="qsl-avatar" aria-hidden="true">L</div>
          <div><p class="qsl-nombre">Laura</p><p class="qsl-sub">Asistente de voz · 639 251 884</p></div>
          <div class="qsl-ondas" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
          <p class="qsl-tiempo" data-l="tiempo">00:00</p>
          <button type="button" class="qsl-btn qsl-llamar" data-l="boton"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg><span>Escuchar una llamada</span></button>
          <p class="qsl-nota">Llamada de ejemplo con la voz real de Laura. Sube el volumen.</p>
        </div>
        <div class="qsl-chat" data-l="chat" aria-live="polite">
          <p class="qsl-vacio">Son las <strong>22:40</strong> y la tienda está cerrada. Un cliente llama para preparar una cena. <strong>Laura</strong> le atiende, le recomienda quesos de verdad y deja la reserva apuntada.</p>
        </div>
      </div>`;
    const raiz = el.querySelector('.qsl');
    const chat = el.querySelector('[data-l="chat"]');
    const boton = el.querySelector('[data-l="boton"]');
    const estado = el.querySelector('[data-l="estado"]');
    const tiempo = el.querySelector('[data-l="tiempo"]');
    const audio = new Audio();
    audio.preload = 'auto';
    let i = 0, activa = false, inicio = 0, reloj = null;

    function pinta(seg) { tiempo.textContent = String(Math.floor(seg / 60)).padStart(2, '0') + ':' + String(Math.floor(seg % 60)).padStart(2, '0'); }
    function burbuja(l) {
      const d = document.createElement('div');
      d.className = 'qsl-msg ' + (l.quien === 'laura' ? 'qsl-laura' : 'qsl-cliente');
      const fotos = (l.quesos || []).map(byId).filter(Boolean);
      d.innerHTML = `<small>${l.quien === 'laura' ? 'Laura' : 'Cliente'}</small>${esc(l.texto)}` +
        (fotos.length ? `<div class="qsl-quesos">${fotos.map(p => `<figure><img src="${esc(p.img)}" alt="" width="88" height="66" loading="lazy"><figcaption>${esc(p.nombre)}</figcaption></figure>`).join('')}</div>` : '');
      chat.appendChild(d);
      chat.scrollTop = chat.scrollHeight;
    }
    function ticket() {
      const lineas = RESERVA.lineas.map(l => ({ p: byId(l.id), g: l.cantidad })).filter(x => x.p);
      const total = lineas.reduce((s, x) => s + x.p.precio * x.g / 1000, 0);
      const t = document.createElement('div');
      t.className = 'qsl-ticket';
      t.innerHTML = `<h4>Reserva apuntada por Laura <span>✓ Enviada a la tienda</span></h4>
        <ul>${lineas.map(x => `<li><span>${esc(x.p.nombre)} · ${x.g} g</span><strong>${eur(x.p.precio * x.g / 1000)}</strong></li>`).join('')}</ul>
        <p><strong>Carlos</strong> · recoge mañana por la mañana · total orientativo <strong>${eur(total)}</strong></p>
        <p>Le llega la confirmación por WhatsApp y el pedido aparece en el CRM.</p>`;
      chat.appendChild(t);
      chat.scrollTop = chat.scrollHeight;
      if (typeof op.onReserva === 'function') op.onReserva(Object.assign({}, RESERVA, { lineas: RESERVA.lineas.map(l => Object.assign({}, l)) }));
    }
    function siguiente() {
      if (!activa) return;
      if (i >= GUION.length) { terminar(true); return; }
      const l = GUION[i];
      raiz.classList.toggle('hablando-laura', l.quien === 'laura');
      raiz.classList.toggle('hablando-cliente', l.quien === 'cliente');
      estado.textContent = l.quien === 'laura' ? 'Laura habla' : 'El cliente habla';
      burbuja(l);
      audio.src = base + 'audio/llamada-0' + (i + 1) + '.mp3';
      i++;
      const p = audio.play();
      if (p && p.catch) p.catch(() => setTimeout(siguiente, 2200)); // sin audio (autoplay bloqueado), sigue con el texto
    }
    function terminar(completa) {
      activa = false;
      clearInterval(reloj);
      audio.pause();
      raiz.classList.remove('en-curso', 'hablando-laura', 'hablando-cliente');
      estado.textContent = completa ? 'Llamada terminada' : 'Llamada colgada';
      boton.className = 'qsl-btn qsl-llamar';
      boton.querySelector('span').textContent = 'Volver a escuchar';
      if (completa) ticket();
    }
    audio.addEventListener('ended', () => setTimeout(siguiente, 350));
    boton.addEventListener('click', () => {
      if (activa) { terminar(false); return; }
      chat.innerHTML = '';
      i = 0; activa = true; inicio = Date.now();
      pinta(0);
      reloj = setInterval(() => pinta((Date.now() - inicio) / 1000), 500);
      raiz.classList.add('en-curso');
      boton.className = 'qsl-btn qsl-colgar';
      boton.querySelector('span').textContent = 'Colgar';
      siguiente();
    });
  }

  window.QS_LLAMADA = { montar, guion: GUION, reserva: RESERVA };
})();
