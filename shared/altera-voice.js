/*
 * Altera · Motor de voz compartido para todas las demos.
 *
 * 1. Audios pregenerados: si existe <demo>/audio/manifest.json, cualquier texto
 *    que la demo quiera locutar se reproduce desde <demo>/audio/<hash>.mp3
 *    (generados en local con `node scripts/voices.mjs generate <demo>`).
 *    El cliente oye la voz ElevenLabs real sin que la API key salga nunca de tu equipo.
 * 2. Desbloqueo de audio en iPhone/Android: se reutiliza un único <audio> que se
 *    "desbloquea" en el primer toque, para que las frases encadenadas suenen.
 * 3. Modo desarrollo (localhost con `node scripts/dev-server.mjs`): carga las
 *    claves del .env en localStorage para probar la API en vivo.
 * 4. Elementos marcados con data-altera-dev (paneles de API key, notas internas)
 *    solo se ven en localhost o con ?dev en la URL.
 */
(function () {
  'use strict';

  const isLocal = ['localhost', '127.0.0.1', '0.0.0.0'].includes(location.hostname);
  const devMode = isLocal || new URLSearchParams(location.search).has('dev');

  // ---------- Hash estable del texto (FNV-1a 32 bits, igual que scripts/voices.mjs) ----------
  function normalize(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
  }

  function hash(text) {
    const bytes = new TextEncoder().encode(normalize(text));
    let h = 0x811c9dc5;
    for (let i = 0; i < bytes.length; i++) {
      h ^= bytes[i];
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8, '0');
  }

  // ---------- Manifest de audios pregenerados ----------
  const audioBase = new URL('audio/', location.href);
  const manifestPromise = fetch(new URL('manifest.json', audioBase), { cache: 'no-cache' })
    .then(r => (r.ok ? r.json() : {}))
    .catch(() => ({}));

  async function cachedUrl(text) {
    const manifest = await manifestPromise;
    const h = hash(text);
    return manifest[h] ? new URL(h + '.mp3', audioBase).href : null;
  }

  // ---------- Reproductor único desbloqueado en el primer gesto ----------
  function silentWav() {
    const samples = 800, rate = 8000;
    const buf = new ArrayBuffer(44 + samples);
    const v = new DataView(buf);
    const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); v.setUint32(4, 36 + samples, true); w(8, 'WAVE'); w(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, rate, true); v.setUint32(28, rate, true); v.setUint16(32, 1, true);
    v.setUint16(34, 8, true); w(36, 'data'); v.setUint32(40, samples, true);
    for (let i = 0; i < samples; i++) v.setUint8(44 + i, 128);
    let bin = '';
    new Uint8Array(buf).forEach(b => { bin += String.fromCharCode(b); });
    return 'data:audio/wav;base64,' + btoa(bin);
  }

  const player = new Audio();
  player.preload = 'auto';
  let unlocked = false;
  const unlockEvents = ['pointerdown', 'touchend', 'click', 'keydown'];

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    unlockEvents.forEach(ev => document.removeEventListener(ev, unlock, true));
    try {
      player.src = silentWav();
      const p = player.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) { /* sin audio: las demos caen a la voz del navegador */ }
  }
  unlockEvents.forEach(ev => document.addEventListener(ev, unlock, true));

  // Devuelve el <audio> compartido apuntando a `url`, sin handlers previos.
  function getPlayer(url) {
    player.onended = null;
    player.onerror = null;
    try { player.pause(); } catch (e) {}
    player.src = url;
    return player;
  }

  function stop() {
    player.onended = null;
    player.onerror = null;
    try { player.pause(); } catch (e) {}
  }

  // ---------- Modo desarrollo: claves del .env vía scripts/dev-server.mjs ----------
  if (isLocal) {
    fetch('/__dev/config.json', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then(cfg => {
        if (!cfg) return;
        Object.entries(cfg.localStorage || {}).forEach(([k, v]) => {
          if (v) localStorage.setItem(k, v);
        });
        document.dispatchEvent(new CustomEvent('altera:dev-config', { detail: cfg }));
      })
      .catch(() => {});
  }

  // ---------- Ocultar UI interna fuera de desarrollo ----------
  if (!devMode) {
    const style = document.createElement('style');
    style.textContent = '[data-altera-dev]{display:none!important}';
    document.head.appendChild(style);
  }

  window.AlteraVoice = { normalize, hash, cachedUrl, getPlayer, stop, devMode, isLocal };
})();
