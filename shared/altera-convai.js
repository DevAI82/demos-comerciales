/*
 * Altera · Agente de voz EN DIRECTO (ElevenLabs Conversational AI).
 *
 * Si la demo tiene un agent_id en shared/altera-config.js (elevenlabsAgents[<carpeta>]),
 * se carga el widget oficial de ElevenLabs y el visitante puede hablar con el
 * asistente desde el navegador (micrófono). El agent_id es público: no es una API key.
 * Protege el agente en ElevenLabs con lista de dominios permitidos y límites de uso.
 * Los elementos con data-convai-only solo se muestran cuando el agente está activo;
 * los data-convai-fallback, solo cuando no lo está.
 */
(function () {
  'use strict';
  const WIDGET_SRC = 'https://unpkg.com/@elevenlabs/convai-widget-embed@0.18.3/dist/index.js';

  const style = document.createElement('style');
  style.textContent = 'html:not(.altera-convai) [data-convai-only],html.altera-convai [data-convai-fallback]{display:none!important}';
  document.head.appendChild(style);

  const cfg = window.ALTERA_CONFIG || {};
  const parts = location.pathname.split('/').filter(Boolean);
  if (parts.length && /\.html?$/i.test(parts[parts.length - 1])) parts.pop();
  const slug = parts[parts.length - 1] || '';
  const agentId = (cfg.elevenlabsAgents || {})[slug];

  window.AlteraConvai = { available: !!agentId, slug };
  if (!agentId) return;
  document.documentElement.classList.add('altera-convai');

  function render() {
    const widget = document.createElement('elevenlabs-convai');
    widget.setAttribute('agent-id', agentId);
    widget.setAttribute('language', 'es');
    widget.setAttribute('placement', 'bottom-left');
    document.body.appendChild(widget);
    const s = document.createElement('script');
    s.src = WIDGET_SRC;
    s.async = true;
    document.body.appendChild(s);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
