/*
 * Altera · Botón flotante "Lo quiero en mi negocio" (WhatsApp con mensaje prellenado).
 * Se configura en shared/altera-config.js. No se muestra si no hay número.
 * Si la página tiene un hueco [data-altera-cta-slot] (p. ej. en la cabecera), el botón va ahí
 * en versión compacta en vez de flotar abajo (así no tapa el widget de voz en directo).
 */
(function () {
  'use strict';
  const cfg = window.ALTERA_CONFIG || {};
  if (!cfg.whatsapp) return;
  const oferta = cfg.oferta || {};
  // Texto bajo «Lo quiero»: por defecto el precio con ayuda; una demo puede fijar oferta.lema (sin precio)
  const lema = oferta.lema || `Desde ${oferta.costeCliente || ''} con la ayuda JCCM`;
  const lemaCorto = oferta.lema || `Desde ${oferta.costeCliente || ''} con ayuda JCCM`;
  const negocio = (document.querySelector('meta[property="og:site_name"]') || {}).content || document.title.split(/[—|·-]/)[0].trim();

  function render() {
    const msg = `Hola Altera 👋 He visto la demo de ${negocio} y me interesa. ¿Cuándo podemos hablar?\n${location.href.split('?')[0]}`;
    const a = document.createElement('a');
    a.href = `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(msg)}`;
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', 'Hablar con Altera por WhatsApp');
    a.innerHTML = `<span style="font-size:20px;line-height:1">💬</span>
      <span style="display:flex;flex-direction:column;line-height:1.15;text-align:left">
        <strong style="font-size:14px">Lo quiero en mi negocio</strong>
        <span style="font-size:11px;opacity:.9">${lema}</span>
      </span>`;
    const slot = document.querySelector('[data-altera-cta-slot]');
    if (slot) {
      a.innerHTML = `<span style="font-size:16px;line-height:1">💬</span>
        <span style="display:flex;flex-direction:column;line-height:1.1;text-align:left">
          <strong style="font-size:13px">Lo quiero</strong>
          <span style="font-size:10px;opacity:.9">${lemaCorto}</span>
        </span>`;
      a.style.cssText = [
        'display:inline-flex', 'align-items:center', 'gap:7px', 'min-height:40px', 'padding:5px 14px 5px 11px',
        'border-radius:999px', 'background:#16a34a', 'color:#fff', 'text-decoration:none', 'white-space:nowrap',
        'font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif', 'box-shadow:0 4px 14px -4px rgba(22,163,74,.6)'
      ].join(';');
      slot.appendChild(a);
      return;
    }
    a.style.cssText = [
      'position:fixed', 'z-index:2147483000', 'right:16px', 'bottom:calc(16px + env(safe-area-inset-bottom))',
      'display:flex', 'align-items:center', 'gap:10px', 'min-height:52px', 'padding:10px 18px',
      'border-radius:999px', 'background:#16a34a', 'color:#fff', 'text-decoration:none',
      'font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif', 'box-shadow:0 10px 30px -8px rgba(0,0,0,.55)'
    ].join(';');
    // Con el agente de voz en directo (abajo a la izquierda) el botón no ocupa todo el ancho
    const conConvai = document.documentElement.classList.contains('altera-convai');
    if (window.matchMedia('(max-width: 640px)').matches && !conConvai) {
      a.style.left = '16px';
      a.style.justifyContent = 'center';
      document.body.style.paddingBottom = '84px';
    }
    document.body.appendChild(a);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
