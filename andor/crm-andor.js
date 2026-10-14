/*
 * Andor Seguridad · CRM de servicios (demo de Altera).
 * Clientes, presupuestos, partes e importes de ejemplo. Nada se envía.
 */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const eur = (n) => n.toLocaleString('es-ES') + ' €';
  const toast = (m) => window.anToast && window.anToast(m);

  const CLIENTES = [
    { id: 'c1', nombre: 'Nave logística', sector: 'Logística', servicio: 'Vigilancia 24 h', horas: 720, mensual: 12900, vence: '31/12/2026', estado: 'renovar', contacto: 'Responsable de instalaciones' },
    { id: 'c2', nombre: 'Centro comercial', sector: 'Comercio', servicio: 'Control de accesos 10-22 h', horas: 624, mensual: 11200, vence: '30/06/2027', estado: 'ok', contacto: 'Gerencia del centro' },
    { id: 'c3', nombre: 'Clínica privada', sector: 'Sanidad', servicio: 'Recepción y rondas 24 h', horas: 720, mensual: 13100, vence: '15/11/2026', estado: 'renovar', contacto: 'Dirección de la clínica' },
    { id: 'c4', nombre: 'Club deportivo', sector: 'Eventos', servicio: 'Partidos en casa', horas: 120, mensual: 2900, vence: 'Fin de temporada', estado: 'ok', contacto: 'Jefe de seguridad del club' },
    { id: 'c5', nombre: 'Promotora residencial', sector: 'Construcción', servicio: 'Vigilancia nocturna de obra', horas: 240, mensual: 4300, vence: '28/02/2027', estado: 'ok', contacto: 'Jefa de obra' },
    { id: 'c6', nombre: 'Ayuntamiento', sector: 'Administración', servicio: 'Edificio municipal L-V', horas: 168, mensual: 3100, vence: '31/01/2027', estado: 'licitacion', contacto: 'Contratación municipal' }
  ];

  const LICITACIONES = [
    { org: 'Ayuntamiento de la provincia', objeto: 'Vigilancia de instalaciones deportivas', importe: 86000, plazo: '05/11/2026', estado: 'Preparando oferta' },
    { org: 'Diputación provincial', objeto: 'Control de accesos en edificio central', importe: 142000, plazo: '19/11/2026', estado: 'Nueva' },
    { org: 'Hospital público', objeto: 'Refuerzo de urgencias en fines de semana', importe: 64000, plazo: '28/10/2026', estado: 'Presentada' }
  ];

  const PRESUPUESTOS = [
    { id: 'p1', cliente: 'Feria de muestras', tipo: 'Seguridad en evento', detalle: '3 días · 8 vigilantes · 10:00-22:00', importe: 7400, fase: 'nuevo', origen: 'Web' },
    { id: 'p2', cliente: 'Concesionario', tipo: 'Vigilancia nocturna', detalle: 'L-D · 22:00-06:00 · 1 vigilante', importe: 4600, fase: 'visita', origen: 'Teléfono (Laura)' },
    { id: 'p3', cliente: 'Comunidad de propietarios', tipo: 'Control de accesos', detalle: 'L-V · 08:00-15:00 · conserjería', importe: 2300, fase: 'enviado', origen: 'WhatsApp' },
    { id: 'p4', cliente: 'Festival de verano', tipo: 'Seguridad en evento', detalle: '2 noches · 20 vigilantes', importe: 9800, fase: 'enviado', origen: 'Email' },
    { id: 'p5', cliente: 'Planta de reciclaje', tipo: 'Vigilancia 24 h', detalle: '24 h · 1 vigilante + rondas', importe: 12600, fase: 'aceptado', origen: 'Web' }
  ];
  const FASES = [['nuevo', 'Nuevo'], ['visita', 'Visita técnica'], ['enviado', 'Enviado'], ['aceptado', 'Aceptado']];

  const PARTES = [
    { id: 'i1', hora: 'Hoy 03:12', puesto: 'Obra residencial', tipo: 'Intento de intrusión', vigilante: 'Pablo Martínez', texto: 'Dos personas intentan saltar el vallado por la zona norte. Se activa el foco, huyen sin acceder. Aviso a la policía local.', estado: 'abierto', grave: true },
    { id: 'i2', hora: 'Hoy 07:40', puesto: 'Nave logística', tipo: 'Puerta mal cerrada', vigilante: 'Javier Molina', texto: 'Puerta del muelle 3 sin cerrar al inicio del turno. Se cierra y se revisa el interior: todo correcto.', estado: 'enviado', grave: false },
    { id: 'i3', hora: 'Ayer 19:25', puesto: 'Centro comercial', tipo: 'Hurto en tienda', vigilante: 'Alba García', texto: 'Se retiene a una persona con productos sin pagar hasta la llegada de la policía. Se adjunta acta.', estado: 'enviado', grave: true },
    { id: 'i4', hora: 'Ayer 11:05', puesto: 'Clínica privada', tipo: 'Asistencia sanitaria', vigilante: 'Sergio Lozano', texto: 'Paciente se marea en la recepción. Se le atiende hasta que llega el personal sanitario. No fue necesario el DESA.', estado: 'cerrado', grave: false }
  ];

  const CURSOS = [
    { v: 'Cristina Ruiz', curso: 'Reciclaje anual', caduca: '30/10/2026', aviso: true },
    { v: 'Andrés Gil', curso: 'Primeros auxilios y DESA', caduca: '12/11/2026', aviso: true },
    { v: 'Iván Moreno', curso: 'Reciclaje anual', caduca: 'Este miércoles', aviso: false },
    { v: 'Lucía Serrano', curso: 'Espectáculos deportivos', caduca: 'Sin curso', aviso: true }
  ];

  const tarjeta = (cont, extra = '') => `<div class="bg-white rounded-2xl border border-marino-100 card-shadow p-4 ${extra}">${cont}</div>`;

  function panel() {
    const cq = window.ANDOR_CQ;
    const huecos = cq ? cq.totalFaltan() : 0;
    const abiertos = PARTES.filter(p => p.estado === 'abierto').length;
    const enCurso = PRESUPUESTOS.filter(p => p.fase !== 'aceptado').reduce((s, p) => s + p.importe, 0);
    const facturacion = CLIENTES.reduce((s, c) => s + c.mensual, 0);
    const kpi = (n, t, sub, cls = 'text-marino-900', acc = '') => tarjeta(`<p class="text-xs font-semibold text-slate-500">${t}</p><p class="font-display font-black text-3xl ${cls} mt-1">${n}</p><p class="text-[11px] text-slate-500 mt-0.5">${sub}</p>${acc}`);
    $('crm-panel').innerHTML = `
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${kpi('<span id="crmPanelHuecos">' + huecos + '</span>', 'Huecos en el cuadrante', 'semana del 19 al 25', huecos ? 'text-red-600' : 'text-emerald-600', `<button type="button" class="mt-2 text-xs font-bold text-marino-700 hover:underline" onclick="switchTab('cuadrante')">Ir a cubrirlos →</button>`)}
        ${kpi(abiertos, 'Partes abiertos', 'pendientes de informar al cliente', abiertos ? 'text-amber-600' : 'text-emerald-600')}
        ${kpi(eur(enCurso), 'Presupuestos en curso', PRESUPUESTOS.filter(p => p.fase !== 'aceptado').length + ' oportunidades')}
        ${kpi(eur(facturacion), 'Servicios activos al mes', CLIENTES.length + ' clientes de ejemplo')}
      </div>
      <div class="grid lg:grid-cols-3 gap-4">
        ${tarjeta(`<h3 class="font-display font-extrabold text-lg text-marino-900 mb-2">Para hoy</h3><ul class="space-y-2 text-sm">
          <li class="flex gap-2"><span>🚨</span><span>Informar al cliente del <strong>intento de intrusión</strong> en la obra.</span></li>
          <li class="flex gap-2"><span>📝</span><span>Visita técnica al <strong>concesionario</strong> a las 11:00.</span></li>
          <li class="flex gap-2"><span>📄</span><span>Renovación de la <strong>clínica privada</strong>: vence el 15/11.</span></li>
          <li class="flex gap-2"><span>🏛️</span><span>Licitación del hospital: <strong>cierra el 28/10</strong>.</span></li></ul>`, 'lg:col-span-1')}
        ${tarjeta(`<h3 class="font-display font-extrabold text-lg text-marino-900 mb-2">Últimos partes</h3><div class="space-y-2">${PARTES.slice(0, 3).map(p => `<button type="button" data-crm-parte="${p.id}" class="w-full text-left p-2.5 rounded-xl hover:bg-marino-50 active:scale-[.99] transition"><p class="text-sm font-semibold">${p.grave ? '🔴' : '🟡'} ${esc(p.tipo)}</p><p class="text-xs text-slate-500">${esc(p.puesto)} · ${esc(p.hora)}</p></button>`).join('')}</div>`, 'lg:col-span-1')}
        ${tarjeta(`<h3 class="font-display font-extrabold text-lg text-marino-900 mb-2">Cursos que caducan</h3><ul class="space-y-2 text-sm">${CURSOS.map(c => `<li class="flex justify-between gap-2"><span><strong>${esc(c.v)}</strong><br><span class="text-xs text-slate-500">${esc(c.curso)}</span></span><span class="text-xs font-semibold ${c.aviso ? 'text-amber-700' : 'text-slate-500'} text-right">${esc(c.caduca)}</span></li>`).join('')}</ul>`, 'lg:col-span-1')}
      </div>`;
    enlazarPartes();
  }

  function incidencias() {
    $('crm-incidencias').innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3"><p class="text-sm text-slate-600 max-w-2xl">Cada parte llega desde el WhatsApp o la app del vigilante, con hora, puesto y foto. La oficina lo revisa y el cliente recibe su informe en un clic.</p>
      <button type="button" onclick="switchTab('whatsapp'); setTimeout(function(){ window.anWaModo && window.anWaModo('vigilante'); }, 50)" class="min-h-[44px] px-4 rounded-xl bg-marino-800 hover:bg-marino-900 active:scale-95 text-white text-sm font-bold transition">👮 Probar a dar un parte</button></div>
      <div class="grid md:grid-cols-2 gap-3" id="crmPartes">${PARTES.map(p => `
        <button type="button" data-crm-parte="${p.id}" class="text-left bg-white rounded-2xl border ${p.estado === 'abierto' ? 'border-amber-300' : 'border-marino-100'} card-shadow p-4 space-y-1.5 hover:border-marino-300 active:scale-[.99] transition">
          <div class="flex items-center justify-between gap-2"><p class="font-semibold text-marino-900">${p.grave ? '🔴' : '🟡'} ${esc(p.tipo)}</p><span class="text-[11px] font-bold px-2 py-0.5 rounded-full ${p.estado === 'abierto' ? 'bg-amber-100 text-amber-800' : p.estado === 'enviado' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}">${p.estado === 'abierto' ? 'Sin informar' : p.estado === 'enviado' ? 'Informado al cliente' : 'Cerrado'}</span></div>
          <p class="text-xs text-slate-500">${esc(p.puesto)} · ${esc(p.hora)} · ${esc(p.vigilante)}</p>
          <p class="text-sm text-slate-700 line-clamp-2">${esc(p.texto)}</p></button>`).join('')}</div>`;
    const b = $('crmBadgeInc'); if (b) b.textContent = PARTES.filter(p => p.estado === 'abierto').length || '';
    enlazarPartes();
  }

  function enlazarPartes() {
    document.querySelectorAll('[data-crm-parte]').forEach(b => b.onclick = () => abrirParte(b.dataset.crmParte));
  }
  function abrirParte(id) {
    const p = PARTES.find(x => x.id === id);
    $('crmDrawerBody').innerHTML = `
      <div class="p-5 space-y-4">
        <div class="flex items-start justify-between gap-3"><div><p class="text-xs font-bold uppercase tracking-widest text-oro-600">Parte de incidencia</p><h3 id="crmDrawerTitle" class="font-display font-black text-xl text-marino-900">${esc(p.tipo)}</h3><p class="text-sm text-slate-600">${esc(p.puesto)} · ${esc(p.hora)}</p></div>
        <button type="button" data-crm-close class="w-10 h-10 rounded-full hover:bg-slate-100 text-xl" aria-label="Cerrar">×</button></div>
        <div class="aspect-video rounded-2xl bg-[repeating-linear-gradient(45deg,#ece6e2,#ece6e2_12px,#f7f4f2_12px,#f7f4f2_24px)] border border-marino-100 flex items-center justify-center text-sm text-slate-500">📷 Foto enviada por el vigilante</div>
        <dl class="grid grid-cols-2 gap-3 text-sm"><div><dt class="text-xs text-slate-500">Vigilante</dt><dd class="font-semibold">${esc(p.vigilante)}</dd></div><div><dt class="text-xs text-slate-500">Gravedad</dt><dd class="font-semibold">${p.grave ? 'Alta' : 'Normal'}</dd></div></dl>
        <div class="rounded-2xl bg-marino-50 p-4 text-sm text-slate-700">${esc(p.texto)}</div>
        <div class="rounded-2xl border border-marino-100 p-4 space-y-2 text-sm"><p class="text-xs font-bold text-slate-500">Informe para el cliente (redactado por el asistente, lo revisa la oficina)</p>
        <p>Le informamos de que el ${esc(p.hora.toLowerCase())} se produjo una incidencia en sus instalaciones: ${esc(p.tipo.toLowerCase())}. ${esc(p.texto)} Quedamos a su disposición.</p></div>
        ${p.estado === 'abierto' ? '<button type="button" id="crmEnviarParte" class="w-full min-h-[48px] rounded-xl bg-marino-800 hover:bg-marino-900 active:scale-95 text-white font-bold transition">✉️ Enviar informe al cliente</button>' : '<p class="text-sm text-emerald-700 font-semibold">✓ Informe ya enviado al cliente.</p>'}
      </div>`;
    $('crmDrawer').classList.remove('hidden');
    $('crmDrawerBody').querySelectorAll('[data-crm-close]').forEach(b => b.onclick = cerrar);
    const env = $('crmEnviarParte');
    if (env) env.onclick = () => { p.estado = 'enviado'; cerrar(); incidencias(); panel(); toast('✉️ Informe enviado al cliente por email (simulado).'); };
  }
  function cerrar() { $('crmDrawer').classList.add('hidden'); }

  function presupuestos() {
    const col = ([k, t]) => {
      const items = PRESUPUESTOS.filter(p => p.fase === k);
      return `<div class="bg-marino-50/70 rounded-2xl border border-marino-100 p-3 space-y-2 min-w-[240px]">
        <div class="flex justify-between items-center"><p class="text-sm font-bold text-marino-900">${t}</p><span class="text-xs text-slate-500">${eur(items.reduce((s, p) => s + p.importe, 0))}</span></div>
        ${items.map(p => `<div class="bg-white rounded-xl border border-marino-100 p-3 space-y-1 ${p.nuevo ? 'ring-2 ring-oro-400' : ''}">
          <p class="text-sm font-semibold text-marino-900">${esc(p.cliente)}</p><p class="text-xs text-slate-600">${esc(p.tipo)} · ${esc(p.detalle)}</p>
          <div class="flex justify-between items-center pt-1"><span class="text-[11px] px-2 py-0.5 rounded-full bg-marino-50 text-marino-700">${esc(p.origen)}</span><span class="text-sm font-bold">${eur(p.importe)}</span></div>
          ${k !== 'aceptado' ? `<button type="button" data-crm-avanzar="${p.id}" class="w-full mt-1 min-h-[36px] rounded-lg bg-marino-50 hover:bg-marino-100 active:scale-95 text-xs font-bold text-marino-700 transition">Pasar a «${FASES[FASES.findIndex(f => f[0] === k) + 1][1]}» →</button>` : ''}
        </div>`).join('') || '<p class="text-xs text-slate-400 p-2">Sin presupuestos</p>'}</div>`;
    };
    $('crm-presupuestos').innerHTML = `
      <p class="text-sm text-slate-600 max-w-3xl">Los presupuestos entran solos desde la web, el teléfono y el WhatsApp con los datos del servicio ya rellenos. Importes orientativos de ejemplo.</p>
      <div class="flex gap-3 overflow-x-auto custom-scroll pb-2 lg:grid lg:grid-cols-4">${FASES.map(col).join('')}</div>`;
    document.querySelectorAll('[data-crm-avanzar]').forEach(b => b.onclick = () => {
      const p = PRESUPUESTOS.find(x => x.id === b.dataset.crmAvanzar);
      const i = FASES.findIndex(f => f[0] === p.fase); p.fase = FASES[i + 1][0]; p.nuevo = false;
      presupuestos(); panel();
      toast(p.fase === 'aceptado' ? '🎉 ' + p.cliente + ' aceptado: se crea el servicio y sus turnos en el cuadrante.' : '➡️ ' + p.cliente + ' pasa a «' + FASES[i + 1][1] + '».');
    });
  }

  function clientes() {
    $('crm-clientes').innerHTML = `
      ${tarjeta(`<h3 class="font-display font-extrabold text-lg text-marino-900 mb-2">Contratos de servicio</h3>
      <div class="overflow-x-auto custom-scroll"><table class="w-full text-sm min-w-[680px]"><thead><tr class="text-left text-xs text-slate-500 border-b border-marino-100"><th class="py-2 pr-3">Cliente</th><th class="pr-3">Servicio</th><th class="pr-3 text-right">Horas/mes</th><th class="pr-3 text-right">Importe/mes</th><th class="pr-3">Vence</th><th></th></tr></thead>
      <tbody>${CLIENTES.map(c => `<tr class="border-b border-marino-50"><td class="py-2 pr-3"><p class="font-semibold">${esc(c.nombre)}</p><p class="text-[11px] text-slate-500">${esc(c.sector)} · ${esc(c.contacto)}</p></td><td class="pr-3">${esc(c.servicio)}</td><td class="pr-3 text-right">${c.horas}</td><td class="pr-3 text-right font-semibold">${eur(c.mensual)}</td><td class="pr-3">${esc(c.vence)}</td>
      <td class="text-right">${c.estado === 'renovar' ? '<span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Renovar pronto</span>' : c.estado === 'licitacion' ? '<span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">Sale a licitación</span>' : '<span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Al día</span>'}</td></tr>`).join('')}</tbody></table></div>`)}
      ${tarjeta(`<div class="flex flex-wrap items-center justify-between gap-2 mb-2"><h3 class="font-display font-extrabold text-lg text-marino-900">Licitaciones públicas de seguridad</h3><span class="text-[11px] font-semibold px-2 py-1 rounded-full bg-marino-50 text-marino-700">Aviso diario de nuevas licitaciones</span></div>
      <div class="grid md:grid-cols-3 gap-3">${LICITACIONES.map(l => `<div class="rounded-xl border border-marino-100 p-3 space-y-1"><p class="text-xs text-slate-500">${esc(l.org)}</p><p class="text-sm font-semibold text-marino-900">${esc(l.objeto)}</p><p class="text-xs text-slate-600">${eur(l.importe)} · plazo ${esc(l.plazo)}</p><span class="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-marino-50 text-marino-700">${esc(l.estado)}</span></div>`).join('')}</div>
      <p class="text-[11px] text-slate-500 mt-2">Licitaciones de ejemplo. En la versión real se leen las de la Plataforma de Contratación del Sector Público filtradas por seguridad privada y provincia.</p>`)}`;
  }

  function equipo() {
    const cq = window.ANDOR_CQ; if (!cq) return;
    $('crm-equipo').innerHTML = `
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">${cq.VIGILANTES.map(v => {
        const h = cq.horasSemana(v);
        return `<div class="bg-white rounded-2xl border border-marino-100 card-shadow p-4 space-y-2">
          <div class="flex items-center gap-3"><div class="w-10 h-10 rounded-full bg-marino-800 text-oro-300 flex items-center justify-center font-display font-black text-sm">${esc(v.nombre.split(' ').map(x => x[0]).join(''))}</div>
          <div class="min-w-0"><p class="text-sm font-semibold text-marino-900 truncate">${esc(v.nombre)}</p><p class="text-[11px] text-slate-500">TIP ${v.tip} · ${h} h esta semana</p></div></div>
          <div class="flex flex-wrap gap-1">${['Vigilante'].concat(v.habil).map(x => `<span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-marino-50 text-marino-700">${esc(x)}</span>`).join('')}</div>
          ${v.nota ? `<p class="text-[11px] text-slate-500">${esc(v.nota)}</p>` : ''}</div>`;
      }).join('')}</div>
      <p class="text-[11px] text-slate-500">Vigilantes inventados para la demo. Los números TIP son de ejemplo.</p>`;
  }

  function crmTab(id) {
    document.querySelectorAll('[data-crm-tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.crmTab === id)));
    document.querySelectorAll('.crm-pane').forEach(p => p.classList.toggle('hidden', p.id !== 'crm-' + id));
    if (id === 'panel') panel();
    if (id === 'equipo') equipo();
  }

  document.addEventListener('DOMContentLoaded', () => {
    panel(); incidencias(); presupuestos(); clientes(); equipo();
    document.querySelectorAll('[data-crm-tab]').forEach(b => b.onclick = () => crmTab(b.dataset.crmTab));
    document.querySelectorAll('[data-crm-close]').forEach(b => b.onclick = cerrar);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrar(); });
    crmTab('panel');
  });

  // Entradas desde el WhatsApp, el teléfono y la web
  window.ANDOR_CRM = {
    nuevoPresupuesto(p) { PRESUPUESTOS.unshift(Object.assign({ id: 'p' + Date.now(), fase: 'nuevo', nuevo: true }, p)); presupuestos(); panel(); },
    nuevoParte(p) { PARTES.unshift(Object.assign({ id: 'i' + Date.now(), estado: 'abierto', hora: 'Ahora' }, p)); incidencias(); panel(); },
    crmTab
  };
})();
