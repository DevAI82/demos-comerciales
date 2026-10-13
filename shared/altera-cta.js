/*
 * Altera · Botón flotante "Lo quiero en mi negocio" (WhatsApp con mensaje prellenado).
 * Se configura en shared/altera-config.js. No se muestra si no hay número.
 */
(function () {
  'use strict';
  const cfg = window.ALTERA_CONFIG || {};
  if (!cfg.whatsapp) return;
  const oferta = cfg.oferta || {};
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
        <span style="font-size:11px;opacity:.9">${oferta.costeCliente || ''} con la ayuda JCCM · ${oferta.cuotaMensual || ''}</span>
      </span>`;
    a.style.cssText = [
      'position:fixed', 'z-index:2147483000', 'right:16px', 'bottom:calc(16px + env(safe-area-inset-bottom))',
      'display:flex', 'align-items:center', 'gap:10px', 'min-height:52px', 'padding:10px 18px',
      'border-radius:999px', 'background:#16a34a', 'color:#fff', 'text-decoration:none',
      'font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif', 'box-shadow:0 10px 30px -8px rgba(0,0,0,.55)'
    ].join(';');
    if (window.matchMedia('(max-width: 640px)').matches) {
      a.style.left = '16px';
      a.style.justifyContent = 'center';
      document.body.style.paddingBottom = '84px';
    }
    document.body.appendChild(a);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
