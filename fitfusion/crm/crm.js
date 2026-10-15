// CRM de FitFusionPro (demo). Reproduce el panel y la app de altera-gym con datos de ejemplo:
// nada sale del navegador. Los ejercicios y plantillas son los reales (contenido.js).
(() => {
  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const EJ = window.FF_EJERCICIOS;
  const PL = window.FF_PLANTILLAS;
  const ej = (nombre) => EJ.find((e) => e.n === nombre) || { n: nombre, g: '', d: '', l: 'ambos', y: null };

  // ---------- Reglas del producto (las mismas que altera-gym) ----------
  const NIVEL = { 'Nunca entreno': 'basico', Principiante: 'basico', Intermedio: 'intermedio', Avanzado: 'avanzado' };
  const ETQ_NIVEL = { basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado' };
  const lugarDe = (entrenaEn) => (entrenaEn === 'Casa' ? 'casa' : 'gimnasio');
  const diasPlan = (d) => Math.min(4, Math.max(2, Number(d) || 3));
  const plantillaPara = (l) => PL.find((p) => p.nivel === NIVEL[l.nivel] && p.dias === diasPlan(l.dias) && p.lugar === lugarDe(l.entrenaEn));
  const planRecomendado = (l) => {
    const basico = NIVEL[l.nivel] === 'basico'; const casa = l.entrenaEn === 'Casa';
    return basico ? (casa ? 'Hábitos activos' : 'Progreso') : (casa ? 'Progreso' : 'Progreso+');
  };
  const copiaPlan = (p) => p.sesiones.map((s) => ({ n: s.n, e: s.e.map((x) => [...x]) }));
  const valeEn = (lugar) => (e) => e.l === 'ambos' || e.l === lugar;

  const ESTADOS = [['nuevo', 'Nuevo'], ['plan_preparado', 'Plan preparado'], ['plan_enviado', 'Plan enviado'], ['cliente_activo', 'Cliente activo']];
  const EQUIPO = ['Álex', 'Marta', 'Dani'];
  const TIPO_AVISO = { molestia: ['😣', 'Molestia o dolor', 'text-amber-300 bg-amber-500/10 border-amber-500/30'], duda: ['❓', 'Duda', 'text-cian-300 bg-cian-500/10 border-cian-500/30'], comentario: ['💬', 'Comentario', 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'] };
  const hace = (h) => (h < 1 ? 'Hace unos minutos' : h < 24 ? `Hace ${Math.round(h)} h` : h < 48 ? 'Ayer' : `Hace ${Math.round(h / 24)} días`);

  // ---------- Datos de ejemplo ----------
  const leads = [
    { id: 'l1', nombre: 'Pedro Gómez', objetivo: 'Ganar músculo', nivel: 'Intermedio', dias: 3, entrenaEn: 'Gimnasio', edad: 31, lesiones: 'Ninguna', estado: 'nuevo', horas: 0.2, resp: null },
    { id: 'l2', nombre: 'Carmen Ruiz', objetivo: 'Perder grasa, Mejorar salud', nivel: 'Principiante', dias: 3, entrenaEn: 'Casa', edad: 44, lesiones: 'Molestias lumbares de vez en cuando', estado: 'nuevo', horas: 2, resp: 'Marta' },
    { id: 'l3', nombre: 'Javier López', objetivo: 'Rendimiento deportivo', nivel: 'Avanzado', dias: 4, entrenaEn: 'Gimnasio', edad: 27, lesiones: 'Ninguna', estado: 'nuevo', horas: 70, resp: 'Dani' },
    { id: 'l4', nombre: 'Nuria Sánchez', objetivo: 'Tonificar', nivel: 'Intermedio', dias: 2, entrenaEn: 'Ambos', edad: 38, lesiones: 'Tendinitis en el hombro derecho (2024)', estado: 'plan_preparado', horas: 20, resp: 'Álex' },
    { id: 'l5', nombre: 'Rubén Torres', objetivo: 'Ganar músculo', nivel: 'Principiante', dias: 3, entrenaEn: 'Gimnasio', edad: 23, lesiones: 'Ninguna', estado: 'plan_preparado', horas: 5, resp: 'Dani' },
    { id: 'l6', nombre: 'Elena Castro', objetivo: 'Perder grasa', nivel: 'Intermedio', dias: 3, entrenaEn: 'Gimnasio', edad: 35, lesiones: 'Ninguna', estado: 'plan_enviado', horas: 100, resp: 'Marta' },
    { id: 'l7', nombre: 'Sergio Vidal', objetivo: 'Mejorar salud', nivel: 'Nunca entreno', dias: 2, entrenaEn: 'Casa', edad: 52, lesiones: 'Hipertensión controlada con medicación', estado: 'plan_enviado', horas: 26, resp: 'Álex' },
    { id: 'l8', nombre: 'Laura Martínez', objetivo: 'Ganar fuerza, Mejorar salud', nivel: 'Intermedio', dias: 3, entrenaEn: 'Gimnasio', edad: 33, lesiones: 'Molestia en la rodilla izquierda hace un año', estado: 'cliente_activo', horas: 1000, resp: 'Álex', cliente: 'c1' },
    { id: 'l9', nombre: 'Andrea Molina', objetivo: 'Tonificar', nivel: 'Principiante', dias: 3, entrenaEn: 'Casa', edad: 29, lesiones: 'Ninguna', estado: 'cliente_activo', horas: 900, resp: 'Marta', cliente: 'c2' }
  ];
  leads.forEach((l) => { if (l.estado !== 'nuevo') l.plan = copiaPlan(plantillaPara(l)); });

  const clientes = [
    { id: 'c1', nombre: 'Laura Martínez', memb: 'Progreso+', plan: 'Gimnasio · Intermedio · 3 días', ent: 'Álex', cumpl: 86, racha: 9, ultimo: 0, lead: 'l8' },
    { id: 'c2', nombre: 'Andrea Molina', memb: 'Progreso', plan: 'Casa · Básico · 3 días', ent: 'Marta', cumpl: 92, racha: 14, ultimo: 1, lead: 'l9' },
    { id: 'c3', nombre: 'Iván Herrera', memb: 'Progreso+', plan: 'Gimnasio · Avanzado · 4 días', ent: 'Dani', cumpl: 71, racha: 3, ultimo: 2 },
    { id: 'c4', nombre: 'Lucía Ortega', memb: 'Hábitos activos', plan: 'Casa · Básico · 2 días', ent: 'Marta', cumpl: 58, racha: 0, ultimo: 9 },
    { id: 'c5', nombre: 'Marcos Gil', memb: 'Prueba gratuita', plan: 'Gimnasio · Básico · 3 días', ent: 'Dani', cumpl: 100, racha: 4, ultimo: 1 },
    { id: 'c6', nombre: 'Paula Reyes', memb: 'Progreso', plan: 'Gimnasio · Intermedio · 2 días', ent: 'Álex', cumpl: 79, racha: 6, ultimo: 3 }
  ];
  const avisos = [
    { id: 'a1', cli: 'c1', tipo: 'molestia', ejer: 'Sentadilla con barra', dia: 'Día 3 · Pierna', texto: 'Me molesta la rodilla izquierda al bajar profundo.', horas: 26 },
    { id: 'a2', cli: 'c3', tipo: 'duda', ejer: 'Peso muerto rumano', dia: 'Día 2 · Pierna', texto: '¿Las rodillas van rectas del todo o un poco flexionadas?', horas: 3 },
    { id: 'a3', cli: 'c2', tipo: 'comentario', ejer: 'Plancha', dia: 'Día 1', texto: 'Hoy he aguantado los 30 segundos en todas las series 💪', horas: 5 },
    { id: 'a4', cli: 'c6', tipo: 'molestia', ejer: 'Press militar con barra', dia: 'Día 1 · Empuje', texto: 'Noto que el hombro me tira un poco en las últimas repeticiones.', horas: 50, resp: 'Baja a 25 kg esta semana y sube solo si no notas nada. Si sigue, lo cambiamos por press con mancuernas.', por: 'Álex' }
  ];
  const mensajesLaura = [
    { de: 'ent', t: 'Bienvenida, Laura. Tu plan ya está listo: 3 días, empuje, tirón y pierna. Cualquier cosa me escribes por aquí. — Álex', h: 'Hace 6 semanas' },
    { de: 'cli', t: '¡Gracias! ¿El calentamiento lo hago antes de cada día?', h: 'Hace 6 semanas' },
    { de: 'ent', t: 'Sí: 5 minutos de bici y dos series ligeras del primer ejercicio.', h: 'Hace 6 semanas' }
  ];

  // Leads del cuestionario de la web de esta demo (mismo navegador)
  try {
    JSON.parse(localStorage.getItem('ff-demo-leads') || '[]').forEach((r, i) => {
      leads.unshift({
        id: 'w' + i, nombre: r.nombre || 'Lead de la web', objetivo: r.objetivo || '—', nivel: r.nivel || 'Principiante', dias: Number(r.dias) || 3,
        entrenaEn: r.entrena_en || 'Gimnasio', edad: r.edad, lesiones: r.lesiones || 'Ninguna', estado: 'nuevo',
        horas: Math.max(0, (Date.now() - new Date(r.recibido).getTime()) / 36e5), resp: null, web: true
      });
    });
  } catch { /* sin almacenamiento: solo datos de ejemplo */ }

  // ---------- Utilidades de interfaz ----------
  let tAviso;
  function toast(t) { const a = $('aviso'); a.textContent = t; a.classList.remove('hidden'); clearTimeout(tAviso); tAviso = setTimeout(() => a.classList.add('hidden'), 3200); }
  const chip = (t, cls = 'bg-white/5 text-texto-2 border-borde') => `<span class="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs ${cls}">${t}</span>`;
  const btn = (t, attrs, prim) => `<button type="button" ${attrs} class="min-h-[40px] px-3 rounded-xl text-sm font-semibold ${prim ? 'bg-cian-500 text-fondo hover:bg-cian-400' : 'border border-borde text-texto-1 hover:border-cian-500'}">${t}</button>`;
  const miniatura = (e, cls = 'w-20 h-12') => e.y
    ? `<button type="button" data-video="${esc(e.n)}" class="relative ${cls} shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-elev to-panel border border-borde group" aria-label="Ver vídeo: ${esc(e.n)}"><img src="https://img.youtube.com/vi/${e.y}/mqdefault.jpg" alt="" loading="lazy" class="w-full h-full object-cover opacity-80 group-hover:opacity-100" onerror="this.remove()"><span class="absolute inset-0 flex items-center justify-center text-white text-lg drop-shadow">▶</span></button>`
    : `<span class="${cls} shrink-0 rounded-lg bg-elev"></span>`;
  const titulo = (sup, t, sub) => `<div><p class="text-xs font-bold uppercase tracking-widest text-cian-500">${sup}</p><h1 class="font-display font-bold text-2xl md:text-3xl text-texto-1 mt-1">${t}</h1>${sub ? `<p class="text-sm text-texto-3 mt-1 max-w-3xl">${sub}</p>` : ''}</div>`;
  const kpi = (v, t, extra = '') => `<div class="tarjeta p-4"><p class="font-display font-bold text-3xl text-texto-1">${v}</p><p class="text-xs text-texto-3 mt-0.5">${t}</p>${extra}</div>`;
  const donut = (pct, size = 120) => { const r = 46, c = 2 * Math.PI * r; return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="Cumplimiento ${pct} %"><circle cx="60" cy="60" r="${r}" fill="none" stroke="#1e293b" stroke-width="12"/><circle cx="60" cy="60" r="${r}" fill="none" stroke="#00e5ff" stroke-width="12" stroke-linecap="round" stroke-dasharray="${(c * pct) / 100} ${c}" transform="rotate(-90 60 60)"/><text x="60" y="66" text-anchor="middle" font-family="Outfit" font-weight="700" font-size="24" fill="#f7f8f8">${pct}%</text></svg>`; };

  // ---------- Cajón y vídeo ----------
  function abrirCajon(t, html) { $('cajonTitulo').textContent = t; $('cajonCuerpo').innerHTML = html; $('cajon').classList.remove('hidden'); document.body.style.overflow = 'hidden'; }
  function cerrarCajon() { $('cajon').classList.add('hidden'); document.body.style.overflow = ''; }
  function abrirVideo(nombre) {
    const e = ej(nombre); if (!e.y) return;
    $('videoTitulo').textContent = e.n;
    $('videoMarco').innerHTML = `<iframe class="w-full h-full" src="https://www.youtube-nocookie.com/embed/${e.y}?autoplay=1&rel=0" title="${esc(e.n)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    const m = $('modalVideo'); m.classList.remove('hidden'); m.classList.add('flex');
  }
  function cerrarVideo() { $('videoMarco').innerHTML = ''; const m = $('modalVideo'); m.classList.add('hidden'); m.classList.remove('flex'); }

  // ---------- Navegación del panel ----------
  const SECCIONES = [['leads', '📥', 'Leads'], ['clientes', '👥', 'Clientes'], ['avisos', '🔔', 'Avisos'], ['plantillas', '🗂️', 'Plantillas'], ['ejercicios', '🏋️', 'Ejercicios'], ['metricas', '📊', 'Métricas']];
  let seccion = 'leads';
  const pendientes = () => avisos.filter((a) => !a.resp);
  function pintarNav() {
    const n = pendientes().length;
    $('navPanel').innerHTML = SECCIONES.map(([k, i, t]) => `<button type="button" data-seccion="${k}" ${k === seccion ? 'aria-current="page"' : ''} class="nav-btn shrink-0 min-h-[44px] px-3 rounded-xl text-sm font-semibold text-texto-2 hover:text-texto-1 flex items-center gap-2 text-left"><span aria-hidden="true">${i}</span>${t}${k === 'avisos' && n ? `<span class="ml-auto rounded-full bg-amber-500 text-fondo text-[11px] font-bold px-1.5">${n}</span>` : ''}</button>`).join('');
  }
  function ir(k) { seccion = k; pintarNav(); VISTAS[k](); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  // ---------- Leads ----------
  function tarjetaLead(l) {
    const p = l.plan ? plantillaPara(l) : null;
    const acciones = {
      nuevo: btn('Preparar plan', `data-lead-preparar="${l.id}"`, true),
      plan_preparado: btn('Revisar', `data-lead-abrir="${l.id}"`) + btn('Enviar', `data-lead-enviar="${l.id}"`, true),
      plan_enviado: btn('Ver plan', `data-lead-abrir="${l.id}"`),
      cliente_activo: btn('Ver ficha', `data-cli-abrir="${l.cliente || ''}"`)
    }[l.estado];
    return `<article class="tarjeta p-3.5 space-y-2.5 ${l.web ? 'ring-1 ring-cian-500' : ''}">
      <div class="flex items-start justify-between gap-2"><button type="button" data-lead-abrir="${l.id}" class="font-semibold text-texto-1 text-left hover:text-cian-500">${esc(l.nombre)}</button>${l.web ? chip('🌐 Desde la web', 'bg-cian-500/10 text-cian-300 border-cian-500/40') : ''}</div>
      <div class="flex flex-wrap gap-1.5">${chip(`${ETQ_NIVEL[NIVEL[l.nivel]] || esc(l.nivel)} · ${diasPlan(l.dias)} días`)}${chip(l.entrenaEn === 'Casa' ? '🏠 Casa' : '🏋️ Gimnasio')}</div>
      <p class="text-xs text-texto-3">Objetivo: <span class="text-texto-2">${esc(l.objetivo)}</span></p>
      ${l.lesiones && l.lesiones !== 'Ninguna' ? `<p class="text-xs rounded-lg bg-amber-500/10 text-amber-300 px-2 py-1">⚠️ ${esc(l.lesiones)}</p>` : ''}
      ${p ? `<p class="text-xs text-texto-3">Plan: <span class="text-texto-2">${esc(p.nombre)}</span></p>` : ''}
      <p class="text-[11px] text-texto-3">🕒 ${hace(l.horas)}${l.resp ? ' · ' + l.resp : ' · <span class="text-amber-300">sin responsable</span>'}</p>
      <div class="flex gap-1.5 [&>button]:flex-1">${acciones}</div>
    </article>`;
  }
  function vistaLeads() {
    const activos = leads.filter((l) => l.estado !== 'descartado');
    const conv = Math.round((leads.filter((l) => l.estado === 'cliente_activo').length / leads.length) * 100);
    $('contenidoPanel').innerHTML = `
      ${titulo('Leads', 'Del cuestionario de la web al plan enviado', 'Cada persona que rellena el cuestionario llega aquí con su nivel, sus días y sus lesiones. El sistema le prepara el plan con la plantilla que toca; el entrenador lo revisa y lo envía con un clic.')}
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${kpi(leads.filter((l) => l.estado !== 'descartado').length, 'leads en el tablero')}${kpi(leads.filter((l) => l.estado === 'nuevo').length, 'nuevos por atender')}${kpi(leads.filter((l) => l.estado === 'plan_preparado').length, 'planes listos para enviar')}${kpi(conv + ' %', 'conversión a cliente')}
      </div>
      ${leads.some((l) => l.web) ? '' : `<div class="tarjeta p-4 text-sm flex flex-wrap items-center justify-between gap-3"><p>🌐 <strong class="text-texto-1">Pruébalo de verdad:</strong> rellena el cuestionario de la web y vuelve aquí. Aparecerás en «Nuevo».</p><a href="../#cuestionario" class="min-h-[40px] inline-flex items-center px-3 rounded-xl bg-cian-500 text-fondo font-semibold">Ir al cuestionario</a></div>`}
      <div class="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        ${ESTADOS.map(([k, t]) => { const col = activos.filter((l) => l.estado === k); return `<div class="rounded-2xl bg-panel/60 border border-borde p-3 space-y-3"><h2 class="flex items-center justify-between font-display font-semibold text-texto-1">${t}<span class="text-xs rounded-full bg-white/5 px-2 py-0.5">${col.length}</span></h2>${col.map(tarjetaLead).join('') || '<p class="text-xs text-texto-3 px-1 py-4 text-center">Nada por aquí</p>'}</div>`; }).join('')}
      </div>`;
  }
  function prepararPlan(id) {
    const l = leads.find((x) => x.id === id); const p = plantillaPara(l);
    l.plan = copiaPlan(p); l.estado = 'plan_preparado'; if (!l.resp) l.resp = 'Álex';
    toast(`Plan preparado: ${p.nombre}`); vistaLeads(); abrirLead(id);
  }
  function enviarPlan(id) {
    const l = leads.find((x) => x.id === id); l.estado = 'plan_enviado'; l.horas = 0;
    toast(`Plan enviado a ${l.nombre}: le llega un email con su enlace de acceso`); cerrarCajon(); vistaLeads();
  }
  function filaEjercicio(l, si, ei, x) {
    const e = ej(x[0]); const lugar = lugarDe(l.entrenaEn);
    const alternativas = EJ.filter((o) => o.g === e.g && valeEn(lugar)(o));
    const editable = l.estado === 'plan_preparado';
    return `<li class="flex items-center gap-3 p-2.5 rounded-xl bg-white/[.03] border border-borde">
      ${miniatura(e, 'w-16 h-10')}
      <div class="min-w-0 flex-1">${editable ? `<select data-cambiar="${l.id}:${si}:${ei}" aria-label="Cambiar ejercicio" class="w-full bg-transparent text-sm font-semibold text-texto-1 rounded-lg border border-transparent hover:border-borde px-1 py-0.5">${alternativas.map((o) => `<option class="bg-panel" ${o.n === x[0] ? 'selected' : ''}>${esc(o.n)}</option>`).join('')}</select>` : `<p class="text-sm font-semibold text-texto-1 truncate">${esc(x[0])}</p>`}
      <p class="text-xs text-texto-3 px-1">${x[1]} series × ${esc(x[2])} · ${x[3]} s descanso · ${esc(e.g)}</p></div>
      ${editable ? `<div class="flex items-center gap-1"><button type="button" data-series="${l.id}:${si}:${ei}:-1" class="w-8 h-8 rounded-lg border border-borde" aria-label="Quitar una serie">−</button><button type="button" data-series="${l.id}:${si}:${ei}:1" class="w-8 h-8 rounded-lg border border-borde" aria-label="Añadir una serie">+</button></div>` : ''}
    </li>`;
  }
  function abrirLead(id) {
    const l = leads.find((x) => x.id === id); const p = l.plan ? plantillaPara(l) : null;
    abrirCajon(l.nombre, `
      <div class="flex flex-wrap gap-1.5">${chip((ESTADOS.find((s) => s[0] === l.estado) || [0, 'Descartado'])[1], 'bg-cian-500/10 text-cian-300 border-cian-500/40')}${l.web ? chip('🌐 Desde la web') : ''}${chip('Plan recomendado: ' + planRecomendado(l))}</div>
      <section class="tarjeta p-4 space-y-3"><h3 class="font-display font-semibold text-texto-1">Cuestionario</h3>
        <div class="flex flex-wrap gap-1.5 text-sm">${chip('Objetivo: <strong class="text-texto-1">' + esc(l.objetivo) + '</strong>')}${chip('Nivel: <strong class="text-texto-1">' + esc(l.nivel) + '</strong>')}${chip('Días: <strong class="text-texto-1">' + esc(l.dias) + '</strong>')}${chip('Entrena en: <strong class="text-texto-1">' + esc(l.entrenaEn) + '</strong>')}${l.edad ? chip('Edad: <strong class="text-texto-1">' + esc(l.edad) + '</strong>') : ''}</div>
        <p class="text-sm ${l.lesiones !== 'Ninguna' ? 'text-amber-300' : 'text-texto-3'}">Lesiones: ${esc(l.lesiones)}</p>
        <label class="flex items-center gap-2 text-sm">Responsable <select data-responsable="${l.id}" class="bg-panel border border-borde rounded-lg px-2 py-1.5 text-texto-1"><option value="">Sin asignar</option>${EQUIPO.map((e) => `<option ${e === l.resp ? 'selected' : ''}>${e}</option>`).join('')}</select></label>
      </section>
      ${l.plan ? `<section class="space-y-3"><div class="flex flex-wrap items-center justify-between gap-2"><h3 class="font-display font-semibold text-texto-1">${esc(p.nombre)} <span class="text-xs text-texto-3 font-sans">· ${p.semanas} semanas</span></h3>${l.estado === 'plan_preparado' ? '<span class="text-xs text-texto-3">Cambia ejercicios o series: no toca la plantilla</span>' : ''}</div>
        ${l.plan.map((s, si) => `<div class="tarjeta p-3 space-y-2"><p class="font-semibold text-texto-1">${esc(s.n)}</p><ul class="space-y-2">${s.e.map((x, ei) => filaEjercicio(l, si, ei, x)).join('')}</ul></div>`).join('')}</section>`
        : `<div class="tarjeta p-5 text-center space-y-3"><p class="text-sm">Con sus respuestas le toca <strong class="text-texto-1">${esc(plantillaPara(l).nombre)}</strong>.</p>${btn('Preparar plan', `data-lead-preparar="${l.id}"`, true)}</div>`}
      <div class="flex flex-wrap gap-2 pt-2 border-t border-borde">
        ${l.estado === 'plan_preparado' ? btn('📧 Enviar plan al cliente', `data-lead-enviar="${l.id}"`, true) : ''}
        ${l.estado === 'plan_enviado' ? btn('Marcar como cliente activo', `data-lead-activar="${l.id}"`, true) : ''}
        ${l.estado !== 'cliente_activo' ? btn('Descartar', `data-lead-descartar="${l.id}"`) : ''}
      </div>`);
  }

  // ---------- Clientes ----------
  function vistaClientes(filtro = '') {
    const lista = clientes.filter((c) => !filtro || c.ent === filtro);
    $('contenidoPanel').innerHTML = `
      ${titulo('Clientes', 'Quién entrena y quién se está descolgando', 'Cumplimiento del plan, racha de entrenos y último día que entrenó cada cliente. Los que llevan una semana sin entrenar salen en rojo para llamarles antes de que se den de baja. Aquí ves una muestra de clientes de ejemplo.')}
      <div class="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por entrenador">${['', ...EQUIPO].map((e) => `<button type="button" role="tab" data-filtro-ent="${e}" aria-selected="${e === filtro}" class="sub-btn min-h-[40px] px-3 rounded-xl border border-borde text-sm font-semibold">${e || 'Todos'}</button>`).join('')}</div>
      <div class="tarjeta overflow-x-auto scroll-fino"><table class="w-full text-sm min-w-[720px]">
        <thead><tr class="text-left text-xs text-texto-3 border-b border-borde"><th class="p-3">Cliente</th><th>Membresía</th><th>Plan</th><th>Entrenador</th><th>Cumplimiento</th><th>Racha</th><th>Último entreno</th></tr></thead>
        <tbody>${lista.map((c) => `<tr class="border-b border-borde/60 hover:bg-white/[.03] cursor-pointer" data-cli-abrir="${c.id}">
          <td class="p-3 font-semibold text-texto-1"><button type="button" data-cli-abrir="${c.id}" class="hover:text-cian-500">${esc(c.nombre)}</button></td>
          <td>${chip(c.memb, c.memb === 'Prueba gratuita' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : undefined)}</td><td class="text-texto-3">${c.plan}</td><td>${c.ent}</td>
          <td><div class="flex items-center gap-2"><div class="w-20 h-1.5 rounded-full bg-borde"><div class="h-1.5 rounded-full ${c.cumpl >= 75 ? 'bg-cian-500' : 'bg-amber-400'}" style="width:${c.cumpl}%"></div></div><span>${c.cumpl} %</span></div></td>
          <td>${c.racha ? '🔥 ' + c.racha : '—'}</td><td class="${c.ultimo >= 7 ? 'text-red-400 font-semibold' : ''}">${c.ultimo === 0 ? 'Hoy' : c.ultimo === 1 ? 'Ayer' : `Hace ${c.ultimo} días`}</td></tr>`).join('')}</tbody></table></div>`;
  }
  function rachaGrid(c) {
    let html = ''; const dias = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    html += `<div class="grid grid-cols-7 gap-1.5 text-center text-[11px] text-texto-3">${dias.map((d) => `<span>${d}</span>`).join('')}`;
    for (let s = 0; s < 4; s++) for (let d = 0; d < 7; d++) {
      const toca = [0, 2, 4].includes(d); const fallo = toca && ((s * 7 + d) % (c.cumpl > 80 ? 11 : 4) === 0);
      html += `<span class="mx-auto w-4 h-4 rounded-full ${!toca ? 'bg-borde/60' : fallo ? 'bg-red-500' : 'bg-emerald-500'}" title="${!toca ? 'Descanso' : fallo ? 'No entrenó' : 'Entreno hecho'}"></span>`;
    }
    return html + '</div>';
  }
  function hiloAvisos(c) {
    const lista = avisos.filter((a) => a.cli === c.id);
    if (!lista.length) return '<p class="text-sm text-texto-3">Sin avisos de este cliente.</p>';
    return lista.map((a) => `<div class="space-y-2"><div class="rounded-2xl rounded-tl-sm border px-3 py-2 text-sm ${TIPO_AVISO[a.tipo][2]}">${TIPO_AVISO[a.tipo][0]} <strong>[${esc(a.dia)} · ${esc(a.ejer)}]</strong> ${esc(a.texto)}<p class="text-[11px] opacity-70 mt-1">${hace(a.horas)}</p></div>
      ${a.resp ? `<div class="ml-8 rounded-2xl rounded-tr-sm bg-elev px-3 py-2 text-sm text-texto-1">${esc(a.resp)}<p class="text-[11px] text-texto-3 mt-1">${esc(a.por || 'Entrenador')}</p></div>${a.cambio ? `<p class="ml-8 text-xs rounded-lg border border-cian-500/40 bg-cian-500/10 text-cian-300 px-2 py-1">✓ Rutina actualizada: ${esc(a.cambio)}</p>` : ''}` : `<p class="ml-8 text-xs text-amber-300">Pendiente de respuesta · ${btn('Responder', `data-ir-aviso="${a.id}"`)}</p>`}</div>`).join('');
  }
  function abrirCliente(id) {
    const c = clientes.find((x) => x.id === id); if (!c) return; const l = leads.find((x) => x.id === c.lead);
    abrirCajon(c.nombre, `
      <div class="flex flex-wrap gap-1.5">${chip('Membresía: ' + c.memb, 'bg-cian-500/10 text-cian-300 border-cian-500/40')}${chip(c.plan)}${chip('Entrenador: ' + c.ent)}</div>
      <div class="grid sm:grid-cols-[150px_1fr] gap-4 items-center tarjeta p-4"><div class="mx-auto">${donut(c.cumpl)}</div><div class="space-y-2"><p class="font-display font-semibold text-texto-1">${c.racha ? `🔥 ${c.racha} entrenos seguidos` : 'Racha a cero'} <span class="text-xs text-texto-3 font-sans">· últimas 4 semanas</span></p>${rachaGrid(c)}</div></div>
      ${l ? `<section class="tarjeta p-4 space-y-2"><h3 class="font-display font-semibold text-texto-1">Cuestionario</h3><div class="flex flex-wrap gap-1.5">${chip('Objetivo: ' + esc(l.objetivo))}${chip('Nivel: ' + esc(l.nivel))}${chip('Lesiones: ' + esc(l.lesiones), l.lesiones !== 'Ninguna' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : undefined)}</div></section>` : ''}
      <section class="tarjeta p-4 space-y-3"><h3 class="font-display font-semibold text-texto-1">Avisos y respuestas</h3>${hiloAvisos(c)}</section>
      <label class="flex items-center gap-2 text-sm">Cambiar membresía <select data-membresia="${c.id}" class="bg-panel border border-borde rounded-lg px-2 py-1.5 text-texto-1">${['Prueba gratuita', 'Hábitos activos', 'Progreso', 'Progreso+'].map((m) => `<option ${m === c.memb ? 'selected' : ''}>${m}</option>`).join('')}</select></label>`);
  }

  // ---------- Avisos ----------
  function vistaAvisos(foco) {
    const orden = { molestia: 0, duda: 1, comentario: 2 };
    const pend = pendientes().sort((a, b) => orden[a.tipo] - orden[b.tipo] || b.horas - a.horas);
    const hechos = avisos.filter((a) => a.resp);
    const nombre = (id) => clientes.find((c) => c.id === id)?.nombre || '';
    $('contenidoPanel').innerHTML = `
      ${titulo('Avisos', 'Molestias y dudas de los clientes, con respuesta en el día', 'Lo que el cliente avisa desde la app durante el entreno llega aquí, con el ejercicio y el día. Las molestias van primero. Al responder puedes cambiarle el ejercicio y el plan se actualiza solo.')}
      ${pend.length ? pend.map((a) => { const e = ej(a.ejer); const lugar = (clientes.find((c) => c.id === a.cli)?.plan || '').startsWith('Casa') ? 'casa' : 'gimnasio'; const alt = EJ.filter((o) => o.g === e.g && o.n !== e.n && valeEn(lugar)(o)); return `
        <article id="aviso-${a.id}" class="tarjeta p-4 space-y-3 ${foco === a.id ? 'ring-2 ring-cian-500' : ''}">
          <div class="flex flex-wrap items-center gap-2">${chip(TIPO_AVISO[a.tipo][0] + ' ' + TIPO_AVISO[a.tipo][1], TIPO_AVISO[a.tipo][2])}<button type="button" data-cli-abrir="${a.cli}" class="font-semibold text-texto-1 hover:text-cian-500">${esc(nombre(a.cli))}</button><span class="text-xs text-texto-3">${esc(a.dia)} · ${esc(a.ejer)} · ${hace(a.horas)}</span>${a.horas > 24 ? chip('Más de 24 h', 'bg-red-500/10 text-red-300 border-red-500/30') : ''}</div>
          <p class="text-texto-1">“${esc(a.texto)}”</p>
          <div class="grid md:grid-cols-[1fr_260px] gap-3">
            <textarea id="resp-${a.id}" rows="2" maxlength="1000" class="w-full rounded-xl bg-white/[.03] border border-borde p-3 text-sm text-texto-1" placeholder="Escribe la respuesta…">${a.tipo === 'molestia' ? 'Te lo cambio por un ejercicio que cargue menos la zona. Prueba esta semana y me cuentas.' : ''}</textarea>
            <label class="text-xs text-texto-3 space-y-1"><span>Sustituir el ejercicio (opcional)</span><select id="sust-${a.id}" class="w-full bg-panel border border-borde rounded-xl px-2 min-h-[44px] text-sm text-texto-1"><option value="">No cambiar</option>${alt.map((o) => `<option ${a.tipo === 'molestia' && o.n === 'Prensa de piernas' ? 'selected' : ''}>${esc(o.n)}</option>`).join('')}</select></label>
          </div>
          <div class="flex justify-end">${btn('Responder', `data-responder="${a.id}"`, true)}</div>
        </article>`; }).join('') : '<div class="tarjeta p-6 text-center">✅ No hay avisos pendientes.</div>'}
      <details class="tarjeta p-4"><summary class="cursor-pointer font-semibold text-texto-1">Respondidos (${hechos.length})</summary><div class="mt-3 space-y-3">${hechos.map((a) => `<div class="text-sm border-t border-borde pt-3"><p><strong class="text-texto-1">${esc(nombre(a.cli))}</strong> · ${esc(a.ejer)}: “${esc(a.texto)}”</p><p class="text-cian-300 mt-1">↳ ${esc(a.resp)}</p></div>`).join('')}</div></details>`;
    if (foco) $('aviso-' + foco)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function responder(id) {
    const a = avisos.find((x) => x.id === id); const t = $('resp-' + id).value.trim(); const s = $('sust-' + id).value;
    if (!t) { toast('Escribe una respuesta'); return; }
    a.resp = t; a.por = 'Álex'; a.horasResp = a.horas;
    if (s) {
      const x = a.cli === 'c1' ? PLAN_LAURA.flatMap((ses) => ses.e).find((y) => y[0] === a.ejer) : null;
      a.cambio = `${s} (${x ? x[1] : 3} × ${x ? x[2] : 10})`;
      if (x) x[0] = s;
    }
    toast(a.cli === 'c1' ? 'Respuesta enviada: Laura la ve en su app' : 'Respuesta enviada al cliente'); pintarNav(); vistaAvisos();
  }

  // ---------- Plantillas ----------
  let filtroLugar = 'gimnasio';
  function vistaPlantillas() {
    const lista = PL.filter((p) => p.lugar === filtroLugar);
    $('contenidoPanel').innerHTML = `
      ${titulo('Plantillas', '18 plantillas: 3 niveles × 2, 3 o 4 días, en gimnasio y en casa', 'Son las rutinas de FitFusionPro. Cuando entra un lead, el sistema copia la que le toca según su nivel, sus días y dónde entrena. Lo que el entrenador cambie en el plan de un cliente no toca la plantilla.')}
      <div class="flex gap-2" role="tablist" aria-label="Dónde entrena">${[['gimnasio', '🏋️ Gimnasio'], ['casa', '🏠 Casa']].map(([k, t]) => `<button type="button" role="tab" data-lugar="${k}" aria-selected="${k === filtroLugar}" class="sub-btn min-h-[40px] px-3 rounded-xl border border-borde text-sm font-semibold">${t}</button>`).join('')}</div>
      <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">${lista.map((p) => { const i = PL.indexOf(p); const n = p.sesiones.reduce((s, x) => s + x.e.length, 0); return `<button type="button" data-plantilla="${i}" class="tarjeta p-4 text-left space-y-2 hover:border-cian-500 transition"><div class="flex items-center justify-between">${chip(ETQ_NIVEL[p.nivel], p.nivel === 'avanzado' ? 'bg-red-500/10 text-red-300 border-red-500/30' : p.nivel === 'intermedio' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30')}<span class="text-xs text-texto-3">${p.semanas} semanas</span></div><p class="font-display font-semibold text-lg text-texto-1">${esc(p.nombre)}</p><p class="text-xs text-texto-3">${p.sesiones.map((s) => esc(s.n.replace(/^Día \d+ · /, ''))).join(' · ')}</p><p class="text-xs text-texto-2">${p.dias} días · ${n} ejercicios</p></button>`; }).join('')}</div>`;
  }
  function abrirPlantilla(i) {
    const p = PL[i];
    abrirCajon(p.nombre, `<p class="text-sm text-texto-3">${p.semanas} semanas · ${p.dias} días por semana. Pulsa ▶ para ver el vídeo de cada ejercicio.</p>
      ${p.sesiones.map((s, si) => `<div class="tarjeta p-3 space-y-2"><p class="font-semibold text-texto-1">${esc(s.n)}</p><ul class="space-y-2">${s.e.map((x) => { const e = ej(x[0]); return `<li class="flex items-center gap-3 p-2.5 rounded-xl bg-white/[.03] border border-borde">${miniatura(e, 'w-16 h-10')}<div class="min-w-0"><p class="text-sm font-semibold text-texto-1">${esc(x[0])}</p><p class="text-xs text-texto-3">${x[1]} × ${esc(x[2])} · ${x[3]} s descanso · ${esc(e.g)}</p></div></li>`; }).join('')}</ul>
        <label class="flex items-center gap-2 text-xs text-texto-3">Añadir ejercicio <select data-anadir="${i}:${si}" class="flex-1 bg-panel border border-borde rounded-lg px-2 py-1.5 text-texto-1 text-sm"><option value="">Elige de la biblioteca…</option>${EJ.filter(valeEn(p.lugar)).map((o) => `<option>${esc(o.n)}</option>`).join('')}</select></label></div>`).join('')}`);
  }

  // ---------- Ejercicios ----------
  let filtroGrupo = '';
  function vistaEjercicios(q = '') {
    const grupos = [...new Set(EJ.map((e) => e.g))];
    const lista = EJ.filter((e) => (!filtroGrupo || e.g === filtroGrupo) && e.n.toLowerCase().includes(q.toLowerCase()));
    $('contenidoPanel').innerHTML = `
      ${titulo('Ejercicios', `Biblioteca de ${EJ.length} ejercicios con vídeo`, 'Cada ejercicio tiene su explicación y su vídeo, que es lo que ve el cliente en la app. El centro puede subir sus propios vídeos o enlazar uno de YouTube.')}
      <div class="flex flex-col sm:flex-row gap-2"><input id="buscaEj" type="search" value="${esc(q)}" placeholder="Buscar ejercicio…" class="flex-1 min-h-[44px] rounded-xl bg-white/[.03] border border-borde px-3 text-sm text-texto-1"></div>
      <div class="flex gap-2 overflow-x-auto scroll-fino pb-1" role="tablist" aria-label="Grupo muscular">${['', ...grupos].map((g) => `<button type="button" role="tab" data-grupo="${g}" aria-selected="${g === filtroGrupo}" class="sub-btn shrink-0 min-h-[40px] px-3 rounded-xl border border-borde text-sm font-semibold">${g || 'Todos'}</button>`).join('')}</div>
      <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">${lista.map((e) => `<div class="tarjeta p-3 flex gap-3">${miniatura(e, 'w-24 h-16')}<div class="min-w-0"><p class="font-semibold text-texto-1 text-sm">${esc(e.n)}</p><p class="text-[11px] text-cian-300">${esc(e.g)} · ${e.l === 'ambos' ? 'Casa y gimnasio' : e.l === 'casa' ? 'Casa' : 'Gimnasio'}</p><p class="text-xs text-texto-3 mt-1 line-clamp-2">${esc(e.d)}</p></div></div>`).join('') || '<p class="text-sm text-texto-3">Ningún ejercicio coincide.</p>'}</div>`;
    const b = $('buscaEj'); b.oninput = () => { const pos = b.selectionStart; vistaEjercicios(b.value); const n = $('buscaEj'); n.focus(); n.setSelectionRange(pos, pos); };
  }

  // ---------- Métricas ----------
  function vistaMetricas() {
    const nombre = (id) => clientes.find((c) => c.id === id)?.nombre;
    const alertas = [
      ['Avisos sin respuesta desde hace más de 24 h', pendientes().filter((a) => a.horas > 24).map((a) => [nombre(a.cli), hace(a.horas), `data-ir-aviso="${a.id}"`])],
      ['Clientes sin entrenar en 7 días', clientes.filter((c) => c.ultimo >= 7).map((c) => [c.nombre, `Hace ${c.ultimo} días`, `data-cli-abrir="${c.id}"`])],
      ['Leads nuevos sin atender en más de 48 h', leads.filter((l) => l.estado === 'nuevo' && l.horas > 48).map((l) => [l.nombre, hace(l.horas), `data-lead-abrir="${l.id}"`])],
      ['Leads sin responsable', leads.filter((l) => !l.resp && l.estado !== 'descartado').map((l) => [l.nombre, hace(l.horas), `data-lead-abrir="${l.id}"`])],
      ['Planes enviados hace más de 3 días sin empezar', leads.filter((l) => l.estado === 'plan_enviado' && l.horas > 72).map((l) => [l.nombre, hace(l.horas), `data-lead-abrir="${l.id}"`])]
    ];
    const FILAS = [['Álex', 21, 9, 33, 84, 12, '3 h 10 min', 92], ['Marta', 18, 8, 38, 88, 9, '2 h 25 min', 100], ['Dani', 15, 7, 29, 76, 10, '6 h 40 min', 80]];
    const ANT = { Álex: [19, 8, 25, 81], Marta: [17, 9, 33, 86], Dani: [15, 6, 33, 79] };
    const dif = (a, b, u = '') => { const d = a - b; return d ? `<span class="${d > 0 ? 'text-emerald-400' : 'text-red-400'} text-[11px] ml-1">${d > 0 ? '▲' : '▼'}${Math.abs(d)}${u}</span>` : ''; };
    const tot = FILAS.reduce((s, f) => [s[0] + f[1], s[1] + f[2], s[2] + f[5]], [0, 0, 0]);
    $('contenidoPanel').innerHTML = `
      ${titulo('Métricas', 'Lo que hay que mirar hoy y cómo va el mes', 'Solo lo ve el dueño. Las alertas se calculan solas cada mañana; el resumen compara cada entrenador con el mes anterior.')}
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">${kpi(tot[0], 'clientes activos', '<p class="text-[11px] text-emerald-400 mt-1">▲ 3 respecto a septiembre</p>')}${kpi(tot[1], 'leads recibidos en octubre')}${kpi('33 %', 'conversión de lead a cliente', '<p class="text-[11px] text-emerald-400 mt-1">▲ 3 puntos</p>')}${kpi('83 %', 'cumplimiento medio de los planes')}</div>
      <section class="space-y-3"><h2 class="font-display font-semibold text-lg text-texto-1">Alertas de hoy</h2><div class="grid md:grid-cols-2 xl:grid-cols-3 gap-3">${alertas.map(([t, l]) => `<div class="tarjeta p-4 space-y-2 ${l.length ? 'border-amber-500/40' : ''}"><h3 class="flex items-start justify-between gap-2 text-sm font-semibold text-texto-1">${t}<span class="shrink-0 rounded-full px-2 text-xs ${l.length ? 'bg-amber-500 text-fondo' : 'bg-white/5'}">${l.length}</span></h3>${l.length ? `<ul class="space-y-1">${l.map(([n, h, at]) => `<li><button type="button" ${at} class="w-full flex justify-between gap-2 text-sm rounded-lg px-2 py-1.5 hover:bg-white/5"><span class="text-texto-1">${esc(n)}</span><span class="text-xs text-texto-3">${h}</span></button></li>`).join('')}</ul>` : '<p class="text-xs text-texto-3">Todo al día ✅</p>'}</div>`).join('')}</div></section>
      <section class="space-y-3"><h2 class="font-display font-semibold text-lg text-texto-1">Resumen de octubre por entrenador</h2>
        <div class="tarjeta overflow-x-auto scroll-fino"><table class="w-full text-sm min-w-[760px]"><thead><tr class="text-xs text-texto-3 border-b border-borde"><th class="p-3 text-left">Entrenador</th><th class="text-right">Clientes activos</th><th class="text-right">Leads recibidos</th><th class="text-right">Conversión</th><th class="text-right">Cumplimiento</th><th class="text-right">Avisos</th><th class="text-right">Respuesta media</th><th class="text-right pr-3">Respondidos en &lt; 24 h</th></tr></thead>
        <tbody>${FILAS.map((f) => `<tr class="border-b border-borde/60"><td class="p-3 font-semibold text-texto-1">${f[0]}</td><td class="text-right">${f[1]}${dif(f[1], ANT[f[0]][0])}</td><td class="text-right">${f[2]}${dif(f[2], ANT[f[0]][1])}</td><td class="text-right">${f[3]} %${dif(f[3], ANT[f[0]][2], ' pt')}</td><td class="text-right">${f[4]} %${dif(f[4], ANT[f[0]][3], ' pt')}</td><td class="text-right">${f[5]}</td><td class="text-right">${f[6]}</td><td class="text-right pr-3">${f[7]} %</td></tr>`).join('')}</tbody></table></div>
        <p class="text-xs text-texto-3">Cifras de ejemplo.</p></section>`;
  }

  const VISTAS = { leads: vistaLeads, clientes: () => vistaClientes(), avisos: () => vistaAvisos(), plantillas: vistaPlantillas, ejercicios: () => vistaEjercicios(), metricas: vistaMetricas };

  // ---------- App del cliente (Laura) ----------
  const PLAN_LAURA = leads.find((l) => l.id === 'l8').plan;
  const laura = clientes[0];
  const hoySesion = 2; // Día 3 · Pierna
  const hechas = {}; let esfuerzo = 0; let completado = false; let pestanaApp = 'hoy'; let avisando = null;
  function appHoy() {
    const s = PLAN_LAURA[hoySesion];
    return `<h2 class="font-display font-bold text-xl text-texto-1">Hoy · ${esc(s.n)}</h2>
      ${completado ? '<div class="rounded-2xl border border-cian-500/40 bg-cian-500/10 text-cian-300 p-3 text-sm">✅ Entreno completado. ¡Buen trabajo! Tu entrenador ya lo ve en el panel.</div>' : ''}
      ${s.e.map((x, i) => { const e = ej(x[0]); const n = x[1]; return `<article class="tarjeta p-3 space-y-2.5"><div class="flex gap-3">${miniatura(e, 'w-24 h-16')}<div class="min-w-0"><p class="font-semibold text-texto-1">${esc(x[0])}</p><p class="text-xs text-texto-3">${n} series × ${esc(x[2])} · ${x[3]} s descanso</p></div></div>
        <div class="flex flex-wrap gap-1.5">${Array.from({ length: n }, (_, k) => { const on = hechas[`${i}-${k}`]; return `<button type="button" data-serie="${i}-${k}" aria-pressed="${!!on}" class="min-h-[36px] px-2.5 rounded-lg text-xs font-semibold border ${on ? 'bg-cian-500 text-fondo border-cian-500' : 'border-borde text-texto-2'}">${on ? '✓' : '○'} Serie ${k + 1}</button>`; }).join('')}</div>
        ${avisando === i ? `<div class="space-y-2 rounded-xl bg-white/5 p-2.5"><div class="grid grid-cols-2 gap-1.5"><label class="flex items-center gap-1.5 text-xs"><input type="radio" name="tipoAviso" value="molestia" checked class="accent-cyan-400"> 😣 Molestia</label><label class="flex items-center gap-1.5 text-xs"><input type="radio" name="tipoAviso" value="duda" class="accent-cyan-400"> ❓ Duda</label></div><textarea id="textoAviso" rows="2" maxlength="500" class="w-full rounded-lg bg-fondo border border-borde p-2 text-sm text-texto-1" aria-label="Qué notas">Noto una molestia en la rodilla al bajar.</textarea><button type="button" data-enviar-aviso="${i}" class="w-full min-h-[40px] rounded-xl bg-cian-500 text-fondo text-sm font-bold">Enviar a mi entrenador</button></div>` : `<button type="button" data-avisar="${i}" class="w-full min-h-[40px] rounded-xl bg-white/5 text-sm">😣 Avisar molestia o duda</button>`}</article>`; }).join('')}
      <div class="tarjeta p-3 space-y-2"><p class="text-sm text-texto-2">¿Cuánto te ha costado hoy?</p><div class="grid grid-cols-5 gap-1.5">${[1, 2, 3, 4, 5].map((v) => `<button type="button" data-esfuerzo="${v}" aria-pressed="${v === esfuerzo}" class="min-h-[44px] rounded-xl font-bold ${v === esfuerzo ? 'bg-cian-500 text-fondo' : 'bg-white/5'}">${v}</button>`).join('')}</div></div>
      <button type="button" id="appCompletar" class="w-full min-h-[52px] rounded-2xl bg-cian-500 text-fondo font-bold brillo ${completado ? 'opacity-50' : ''}" ${completado ? 'disabled' : ''}>Completar entreno</button>`;
  }
  function appCalendario() {
    const hoy = new Date(2026, 9, 15); const ini = new Date(2026, 9, 1); const off = (ini.getDay() + 6) % 7; const dias = 31; const fallos = [8];
    let celdas = Array.from({ length: off }, () => '<span></span>').join('');
    for (let d = 1; d <= dias; d++) {
      const dow = (new Date(2026, 9, d).getDay() + 6) % 7; const toca = [0, 2, 4].includes(dow); const pasado = d < hoy.getDate(); const esHoy = d === hoy.getDate();
      const cls = esHoy ? 'ring-2 ring-cian-500 text-texto-1' : !toca ? 'text-texto-3' : pasado ? (fallos.includes(d) ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300') : 'bg-white/5 text-texto-1';
      celdas += `<span class="aspect-square rounded-lg flex items-center justify-center text-sm ${cls}">${d}</span>`;
    }
    return `<h2 class="font-display font-bold text-xl text-texto-1">Octubre 2026</h2><div class="grid grid-cols-7 gap-1 text-center text-[11px] text-texto-3">${['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => `<span>${d}</span>`).join('')}${celdas}</div>
      <div class="flex flex-wrap gap-3 text-xs text-texto-3"><span>🟩 hecho</span><span>🟥 no hecho</span><span>⬜ por hacer</span></div>
      <div class="tarjeta p-3 text-sm space-y-1">${PLAN_LAURA.map((s, i) => `<p><strong class="text-texto-1">${['Lunes', 'Miércoles', 'Viernes'][i]}:</strong> ${esc(s.n)}</p>`).join('')}</div>`;
  }
  function appProgreso() {
    const semanas = [3, 3, 2, 3, 3, 2 + (completado ? 1 : 0)]; const pesos = [40, 42.5, 45, 45, 47.5, 50];
    const w = 320, h = 140; const px = (i) => 20 + i * ((w - 40) / 5); const py = (v) => h - 20 - ((v - 35) / 20) * (h - 40);
    return `<h2 class="font-display font-bold text-xl text-texto-1">Tu progreso</h2>
      <div class="grid grid-cols-2 gap-2">${kpi(laura.cumpl + ' %', 'cumplimiento')}${kpi(semanas.reduce((a, b) => a + b, 0), 'entrenos en 6 semanas')}</div>
      <div class="tarjeta p-3 space-y-2"><p class="text-sm font-semibold text-texto-1">Entrenos por semana</p><div class="flex items-end gap-2 h-24">${semanas.map((v, i) => `<div class="flex-1 flex flex-col items-center gap-1"><div class="w-full rounded-t-md ${v >= 3 ? 'bg-cian-500' : 'bg-cian-500/40'}" style="height:${(v / 3) * 72}px"></div><span class="text-[10px] text-texto-3">S${i + 1}</span></div>`).join('')}</div></div>
      <div class="tarjeta p-3 space-y-2"><p class="text-sm font-semibold text-texto-1">Sentadilla con barra · peso de trabajo (kg)</p><svg viewBox="0 0 ${w} ${h}" class="w-full" role="img" aria-label="El peso de la sentadilla sube de 40 a 50 kg en 6 semanas"><polyline fill="none" stroke="#00e5ff" stroke-width="3" points="${pesos.map((v, i) => px(i) + ',' + py(v)).join(' ')}"/>${pesos.map((v, i) => `<circle cx="${px(i)}" cy="${py(v)}" r="4" fill="#00e5ff"/><text x="${px(i)}" y="${py(v) - 9}" text-anchor="middle" font-size="10" fill="#d0d6e0">${v}</text>`).join('')}</svg></div>`;
  }
  function appMensajes() {
    const propios = avisos.filter((a) => a.cli === 'c1');
    return `<h2 class="font-display font-bold text-xl text-texto-1">Mensajes con Álex</h2>
      ${mensajesLaura.map((m) => `<div class="${m.de === 'cli' ? 'ml-10 bg-cian-500/15 text-texto-1 rounded-tr-sm' : 'mr-10 bg-elev text-texto-1 rounded-tl-sm'} rounded-2xl px-3 py-2 text-sm">${esc(m.t)}<p class="text-[10px] text-texto-3 mt-1">${m.h}</p></div>`).join('')}
      ${propios.map((a) => `<div class="ml-10 rounded-2xl rounded-tr-sm border px-3 py-2 text-sm ${TIPO_AVISO[a.tipo][2]}">${TIPO_AVISO[a.tipo][0]} [${esc(a.ejer)}] ${esc(a.texto)}<p class="text-[10px] opacity-70 mt-1">${hace(a.horas)}</p></div>${a.resp ? `<div class="mr-10 bg-elev rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-texto-1">${esc(a.resp)}${a.cambio ? `<p class="mt-1 text-xs text-cian-300">✓ Rutina actualizada: ${esc(a.cambio)}</p>` : ''}</div>` : '<p class="text-[11px] text-texto-3 text-right">Tu entrenador te responderá en el día</p>'}`).join('')}`;
  }
  function pintarApp() {
    $('appContenido').innerHTML = { hoy: appHoy, calendario: appCalendario, progreso: appProgreso, mensajes: appMensajes }[pestanaApp]();
    document.querySelectorAll('.app-nav').forEach((b) => { const on = b.dataset.app === pestanaApp; b.classList.toggle('text-cian-500', on); b.classList.toggle('text-texto-3', !on); b.setAttribute('aria-current', on ? 'page' : 'false'); });
    $('appCumpl').textContent = laura.cumpl + ' %'; $('appRacha').textContent = `🔥 ${laura.racha} entrenos seguidos`;
  }
  function avisarDesdeApp(i) {
    const x = PLAN_LAURA[hoySesion].e[i]; const texto = ($('textoAviso')?.value || '').trim();
    if (!texto) { toast('Cuéntale a tu entrenador qué notas'); return; }
    const tipo = document.querySelector('input[name="tipoAviso"]:checked')?.value || 'molestia';
    avisos.push({ id: 'a' + (avisos.length + 1), cli: 'c1', tipo, ejer: x[0], dia: PLAN_LAURA[hoySesion].n, texto: texto.slice(0, 500), horas: 0 });
    avisando = null; pintarNav(); pintarApp(); toast('Aviso enviado. Cambia a «Panel del centro» → Avisos para responderlo');
  }

  // ---------- Modos ----------
  function modo(m) {
    document.querySelectorAll('.modo-btn').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.modo === m)));
    $('vistaPanel').classList.toggle('hidden', m !== 'panel'); $('vistaApp').classList.toggle('hidden', m !== 'app');
    if (m === 'app') pintarApp(); else VISTAS[seccion]();
    history.replaceState(null, '', m === 'app' ? '#app' : '#' + seccion);
  }

  // ---------- Eventos (delegados) ----------
  document.addEventListener('click', (ev) => {
    const t = ev.target.closest('button, [data-cli-abrir], [data-cerrar], [data-cerrar-video]'); if (!t) return;
    const d = t.dataset;
    if ('cerrar' in d) return cerrarCajon();
    if ('cerrarVideo' in d) return cerrarVideo();
    if (d.video) return abrirVideo(d.video);
    if (d.modo) return modo(d.modo);
    if (d.seccion) { history.replaceState(null, '', '#' + d.seccion); return ir(d.seccion); }
    if (d.leadPreparar) return prepararPlan(d.leadPreparar);
    if (d.leadEnviar) return enviarPlan(d.leadEnviar);
    if (d.leadAbrir) return abrirLead(d.leadAbrir);
    if (d.leadActivar) { const l = leads.find((x) => x.id === d.leadActivar); l.estado = 'cliente_activo'; const id = 'c' + (clientes.length + 1); clientes.push({ id, nombre: l.nombre, memb: 'Prueba gratuita', plan: plantillaPara(l).nombre, ent: l.resp || 'Álex', cumpl: 100, racha: 1, ultimo: 0, lead: l.id }); l.cliente = id; toast(`${l.nombre} ya es cliente activo (prueba gratuita)`); cerrarCajon(); return vistaLeads(); }
    if (d.leadDescartar) { leads.find((x) => x.id === d.leadDescartar).estado = 'descartado'; toast('Lead descartado'); cerrarCajon(); return vistaLeads(); }
    if (d.series) { const [id, si, ei, inc] = d.series.split(':'); const l = leads.find((x) => x.id === id); const x = l.plan[si].e[ei]; x[1] = Math.min(8, Math.max(1, x[1] + Number(inc))); return abrirLead(id); }
    if (d.cliAbrir !== undefined) { if (!d.cliAbrir) return; return abrirCliente(d.cliAbrir); }
    if (d.filtroEnt !== undefined) return vistaClientes(d.filtroEnt);
    if (d.irAviso) { cerrarCajon(); seccion = 'avisos'; pintarNav(); return vistaAvisos(d.irAviso); }
    if (d.responder) return responder(d.responder);
    if (d.lugar) { filtroLugar = d.lugar; return vistaPlantillas(); }
    if (d.plantilla) return abrirPlantilla(Number(d.plantilla));
    if (d.grupo !== undefined) { filtroGrupo = d.grupo; return vistaEjercicios($('buscaEj')?.value || ''); }
    if (d.app) { pestanaApp = d.app; return pintarApp(); }
    if (d.serie) { hechas[d.serie] = !hechas[d.serie]; return pintarApp(); }
    if (d.esfuerzo) { esfuerzo = Number(d.esfuerzo); return pintarApp(); }
    if (d.avisar !== undefined) { avisando = Number(d.avisar); return pintarApp(); }
    if (d.enviarAviso !== undefined) return avisarDesdeApp(Number(d.enviarAviso));
    if (t.id === 'appCompletar') {
      const total = PLAN_LAURA[hoySesion].e.reduce((s, x) => s + x[1], 0); const n = Object.values(hechas).filter(Boolean).length;
      if (!n) { toast('Marca al menos una serie'); return; }
      completado = true; laura.racha += 1; laura.cumpl = Math.min(100, laura.cumpl + 2); laura.ultimo = 0;
      toast(`Entreno guardado: ${n} de ${total} series${esfuerzo ? ', esfuerzo ' + esfuerzo + '/5' : ''}`); return pintarApp();
    }
  });
  document.addEventListener('change', (ev) => {
    const d = ev.target.dataset;
    if (d.cambiar) { const [id, si, ei] = d.cambiar.split(':'); leads.find((x) => x.id === id).plan[si].e[ei][0] = ev.target.value; toast('Ejercicio cambiado solo en el plan de este cliente'); return abrirLead(id); }
    if (d.responsable) { leads.find((x) => x.id === d.responsable).resp = ev.target.value || null; toast('Responsable actualizado'); return vistaLeads(); }
    if (d.membresia) { clientes.find((x) => x.id === d.membresia).memb = ev.target.value; toast('Membresía actualizada'); return seccion === 'clientes' && vistaClientes(); }
    if (d.anadir && ev.target.value) { const [i, si] = d.anadir.split(':').map(Number); PL[i].sesiones[si].e.push([ev.target.value, 3, '10-12', 60]); toast('Ejercicio añadido a la plantilla'); return abrirPlantilla(i); }
  });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') { cerrarVideo(); cerrarCajon(); } });

  // ---------- Inicio ----------
  const ini = location.hash.slice(1);
  if (VISTAS[ini]) seccion = ini;
  pintarNav();
  modo(ini === 'app' ? 'app' : 'panel');
})();
