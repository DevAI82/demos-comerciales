/*
 * Andor Seguridad · Cuadrantes de vigilantes (demo de Altera).
 * Datos de ejemplo: vigilantes, servicios y turnos inventados. Nada se envía.
 *
 * Modelo: cada servicio pide unos turnos por día (requisitos). Cada vigilante tiene un turno o
 * una ausencia por día. Hueco = turno pedido que nadie cubre. Al cubrirlo se comprueban las reglas:
 * libre ese día, 12 h de descanso entre jornadas, máximo 12 h por jornada y habilitación del puesto.
 */
(function () {
  'use strict';

  const DIAS = ['Lun 19', 'Mar 20', 'Mié 21', 'Jue 22', 'Vie 23', 'Sáb 24', 'Dom 25'];
  const DIAS_LARGO = ['lunes 19', 'martes 20', 'miércoles 21', 'jueves 22', 'viernes 23', 'sábado 24', 'domingo 25'];

  // Catálogo de turnos (horas de inicio y fin; si fin <= inicio, acaba al día siguiente)
  const TURNOS = {
    M: { nombre: 'Mañana', ini: 6, fin: 14 },
    T: { nombre: 'Tarde', ini: 14, fin: 22 },
    N: { nombre: 'Noche', ini: 22, fin: 6 },
    A: { nombre: 'Mañana oficina', ini: 7, fin: 15 },
    C: { nombre: 'Comercio mañana', ini: 10, fin: 16 },
    K: { nombre: 'Comercio tarde', ini: 16, fin: 22 },
    E: { nombre: 'Evento', ini: 15, fin: 21 }
  };
  const AUSENCIAS = {
    L: { nombre: 'Libre', clase: 'bg-white text-slate-300' },
    V: { nombre: 'Vacaciones', clase: 'bg-sky-50 text-sky-700' },
    B: { nombre: 'Baja', clase: 'bg-red-50 text-red-700' },
    F: { nombre: 'Formación', clase: 'bg-violet-50 text-violet-700' }
  };
  const horasTurno = (t) => { const x = TURNOS[t]; return ((x.fin - x.ini + 24) % 24) || 24; };
  const hhmm = (h) => String(h).padStart(2, '0') + ':00';
  const franja = (t) => hhmm(TURNOS[t].ini) + '-' + hhmm(TURNOS[t].fin);

  // Servicios (clientes de ejemplo) y turnos que pide cada uno
  const PUESTOS = {
    1: { nombre: 'Nave logística', lugar: 'Polígono industrial', color: '#284a7e', claro: '#dfe8f5', habil: null, req: [0, 1, 2, 3, 4, 5, 6].map(d => ({ d, t: ['M', 'T', 'N'], n: 1 })) },
    2: { nombre: 'Centro comercial', lugar: 'Control de accesos', color: '#0f766e', claro: '#ccfbf1', habil: null, req: [0, 1, 2, 3, 4, 5].map(d => ({ d, t: ['C', 'K'], n: 2 })) },
    3: { nombre: 'Clínica privada', lugar: 'Recepción y rondas', color: '#7c3aed', claro: '#ede9fe', habil: 'DESA', req: [0, 1, 2, 3, 4, 5, 6].map(d => ({ d, t: ['M', 'T', 'N'], n: 1 })) },
    4: { nombre: 'Estadio', lugar: 'Partido del domingo', color: '#c2410c', claro: '#ffedd5', habil: 'Espectáculos deportivos', req: [{ d: 6, t: ['E'], n: 10 }] },
    5: { nombre: 'Obra residencial', lugar: 'Vigilancia nocturna', color: '#a16207', claro: '#fef3c7', habil: null, req: [0, 1, 2, 3, 4, 5, 6].map(d => ({ d, t: ['N'], n: 1 })) },
    6: { nombre: 'Edificio municipal', lugar: 'Contrato público', color: '#475569', claro: '#e2e8f0', habil: null, req: [0, 1, 2, 3, 4].map(d => ({ d, t: ['A'], n: 1 })) }
  };

  // Vigilantes de ejemplo. Celda: 'M1' = turno M en el servicio 1; 'L', 'V', 'B', 'F' = ausencias.
  const VIGILANTES = [
    { id: 'v1', nombre: 'Javier Molina', tip: '118 402', habil: ['DESA', 'Espectáculos deportivos'], c: 'M1 M1 M1 M1 M1 L L' },
    { id: 'v2', nombre: 'Rocío Navarro', tip: '121 077', habil: ['Espectáculos deportivos'], c: 'T1 T1 T1 T1 T1 L L' },
    { id: 'v3', nombre: 'Andrés Gil', tip: '109 553', habil: [], c: 'N1 N1 N1 N1 L L N1' },
    { id: 'v4', nombre: 'Marta Cebrián', tip: '124 610', habil: ['DESA'], c: 'L L L L N1 N1 L' },
    { id: 'v5', nombre: 'Sergio Lozano', tip: '115 238', habil: ['DESA', 'Espectáculos deportivos'], c: 'M3 M3 M3 M3 M3 L L' },
    { id: 'v6', nombre: 'Elena Picazo', tip: '119 904', habil: ['DESA', 'Espectáculos deportivos'], c: 'T3 T3 T3 T3 T3 L L' },
    { id: 'v7', nombre: 'Raúl Ortega', tip: '112 381', habil: ['DESA'], c: 'N3 N3 N3 N3 L L N3' },
    { id: 'v8', nombre: 'Cristina Ruiz', tip: '126 145', habil: ['DESA'], c: 'B B B B B B B', nota: 'Baja médica desde el viernes pasado' },
    { id: 'v9', nombre: 'Pablo Martínez', tip: '110 729', habil: ['Espectáculos deportivos'], c: 'N5 N5 N5 N5 N5 L L' },
    { id: 'v10', nombre: 'Lucía Serrano', tip: '127 318', habil: [], c: 'L L L L L N5 N5', nota: 'Contrato de fin de semana' },
    { id: 'v11', nombre: 'Daniel Jiménez', tip: '120 466', habil: ['Espectáculos deportivos'], c: 'C2 C2 C2 C2 C2 C2 E4' },
    { id: 'v12', nombre: 'Patricia Tébar', tip: '122 853', habil: ['Espectáculos deportivos'], c: 'C2 C2 C2 C2 C2 C2 E4' },
    { id: 'v13', nombre: 'Iván Moreno', tip: '125 092', habil: [], c: 'L L F L L M1 M1', nota: 'Reciclaje anual el miércoles' },
    { id: 'v14', nombre: 'Nuria Blanco', tip: '113 670', habil: ['DESA'], c: 'L L L L L M3 M3' },
    { id: 'v15', nombre: 'Óscar Sáez', tip: '117 214', habil: ['DESA'], c: 'L L L L L T3 T3' },
    { id: 'v16', nombre: 'Alba García', tip: '128 501', habil: ['Espectáculos deportivos'], c: 'K2 K2 K2 K2 K2 K2 E4' },
    { id: 'v17', nombre: 'Hugo Fernández', tip: '116 988', habil: ['Espectáculos deportivos'], c: 'K2 K2 K2 L K2 K2 E4' },
    { id: 'v18', nombre: 'Teresa López', tip: '111 345', habil: ['Espectáculos deportivos'], c: 'A6 A6 A6 A6 A6 L E4' },
    { id: 'v19', nombre: 'Manuel Requena', tip: '129 230', habil: ['DESA'], c: 'L L L L L L L', nota: 'Correturnos · disponible' },
    { id: 'v20', nombre: 'Sara Collado', tip: '130 017', habil: ['Espectáculos deportivos', 'DESA'], c: 'V V V L L L L', nota: 'Vuelve de vacaciones el jueves' }
  ];
  VIGILANTES.forEach(v => { v.dias = v.c.split(' '); v.original = v.dias.slice(); });

  const parse = (cel) => /^[A-Z]\d$/.test(cel) ? { t: cel[0], p: +cel[1] } : null;
  const intervalo = (d, t) => { const x = TURNOS[t]; const ini = d * 24 + x.ini; return [ini, ini + horasTurno(t)]; };
  const horasSemana = (v) => v.dias.reduce((s, c) => { const x = parse(c); return s + (x ? horasTurno(x.t) : 0); }, 0);
  const nocturnas = (v) => v.dias.reduce((s, c) => { const x = parse(c); if (!x) return s; const [a, b] = intervalo(0, x.t); let n = 0; for (let h = a; h < b; h++) { const hh = h % 24; if (hh >= 22 || hh < 6) n++; } return s + n; }, 0);

  // Huecos: turnos pedidos que nadie cubre
  function cubiertos(p, d, t) { return VIGILANTES.filter(v => v.dias[d] === t + p); }
  function huecos() {
    const out = [];
    Object.entries(PUESTOS).forEach(([p, P]) => P.req.forEach(r => r.t.forEach(t => {
      const n = cubiertos(p, r.d, t).length;
      if (n < r.n) out.push({ p: +p, d: r.d, t, faltan: r.n - n, pide: r.n, hay: n });
    })));
    return out.sort((a, b) => a.d - b.d || a.p - b.p);
  }
  const totalPedidos = () => Object.values(PUESTOS).reduce((s, P) => s + P.req.reduce((a, r) => a + r.t.length * r.n, 0), 0);
  const totalFaltan = () => huecos().reduce((s, h) => s + h.faltan, 0);

  // Reglas para cubrir un hueco
  function evaluar(v, h) {
    const motivos = []; const avisos = [];
    const cel = v.dias[h.d];
    if (cel !== 'L') motivos.push(parse(cel) ? 'Ya trabaja ese día (' + franja(parse(cel).t) + ')' : AUSENCIAS[cel].nombre + ' ese día');
    const P = PUESTOS[h.p];
    if (P.habil && !v.habil.includes(P.habil)) motivos.push('Sin habilitación «' + P.habil + '»');
    const [a, b] = intervalo(h.d, h.t);
    v.dias.forEach((c, d) => {
      const x = parse(c); if (!x || d === h.d) return;
      const [a2, b2] = intervalo(d, x.t);
      const descanso = a2 >= b ? a2 - b : a - b2;
      if (descanso < 12) motivos.push('Solo ' + Math.max(descanso, 0) + ' h de descanso con su turno del ' + DIAS_LARGO[d]);
    });
    const tras = horasSemana(v) + horasTurno(h.t);
    if (tras > 40) avisos.push('Haría ' + tras + ' h esta semana (' + (tras - 40) + ' h extra)');
    return { v, ok: motivos.length === 0, motivos, avisos, horas: tras };
  }
  const candidatos = (h) => VIGILANTES.map(v => evaluar(v, h)).sort((x, y) => (y.ok - x.ok) || (x.avisos.length - y.avisos.length) || (x.horas - y.horas));

  // ---------- Pintado ----------
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const toast = (m) => window.anToast ? window.anToast(m) : null;

  function chipCelda(cel) {
    const x = parse(cel);
    if (!x) { const A = AUSENCIAS[cel]; return `<span class="block rounded-lg px-1.5 py-1 text-[11px] font-semibold ${A.clase}">${cel === 'L' ? '·' : A.nombre}</span>`; }
    const P = PUESTOS[x.p];
    return `<span class="block rounded-lg px-1.5 py-1 text-[11px] font-bold leading-tight" style="background:${P.claro};color:${P.color}" title="${esc(P.nombre)} · ${TURNOS[x.t].nombre} ${franja(x.t)}">${x.t} · ${esc(P.nombre.split(' ')[0])}<span class="block font-medium opacity-80">${franja(x.t)}</span></span>`;
  }

  function kpis() {
    const pedidos = totalPedidos(); const faltan = totalFaltan();
    const pct = Math.round((pedidos - faltan) / pedidos * 100);
    $('cqKpis').innerHTML = [
      [pct + ' %', 'turnos cubiertos'], [faltan, faltan === 1 ? 'hueco abierto' : 'huecos abiertos'], [VIGILANTES.filter(v => horasSemana(v) > 40).length, 'con horas extra']
    ].map(([n, t]) => `<div class="rounded-2xl bg-white/10 border border-white/10 px-3 py-2.5 min-w-[92px]"><p class="font-display font-black text-2xl text-oro-300">${n}</p><p class="text-[11px] text-marino-100 leading-tight">${t}</p></div>`).join('');
    const b = $('cqBadge'); if (b) b.textContent = faltan || '';
    const b2 = $('crmPanelHuecos'); if (b2) b2.textContent = faltan;
  }

  function vistaSemanal() {
    const hs = huecos();
    const leyenda = Object.entries(PUESTOS).map(([, P]) => `<span class="inline-flex items-center gap-1.5 text-xs"><span class="w-3 h-3 rounded" style="background:${P.color}"></span>${esc(P.nombre)}</span>`).join('');
    const filaHuecos = DIAS.map((_, d) => {
      const n = hs.filter(h => h.d === d).reduce((s, h) => s + h.faltan, 0);
      return `<td class="p-1 text-center">${n ? `<button type="button" data-cq-dia="${d}" class="w-full min-h-[36px] rounded-lg bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold transition">${n} sin cubrir</button>` : '<span class="text-xs font-semibold text-emerald-700">✓ cubierto</span>'}</td>`;
    }).join('');
    const filas = VIGILANTES.map(v => {
      const h = horasSemana(v);
      return `<tr class="border-t border-marino-50 hover:bg-marino-50/50">
        <th scope="row" class="sticky left-0 bg-white text-left p-2 min-w-[150px]"><span class="block text-sm font-semibold text-marino-900">${esc(v.nombre)}</span><span class="block text-[11px] text-slate-500">TIP ${v.tip}${v.nota ? ' · ' + esc(v.nota) : ''}</span></th>
        ${v.dias.map((c, d) => `<td class="p-1 min-w-[92px] ${v.original[d] !== c ? 'ring-2 ring-inset ring-oro-400 rounded-lg' : ''}">${chipCelda(c)}</td>`).join('')}
        <td class="p-2 text-right text-sm font-bold ${h > 40 ? 'text-amber-700' : 'text-marino-900'}">${h} h</td></tr>`;
    }).join('');
    $('cq-semanal').innerHTML = `
      <div class="bg-white rounded-2xl border border-marino-100 card-shadow p-4 space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap gap-x-4 gap-y-1.5">${leyenda}</div>
          <button type="button" id="cqAuto" class="min-h-[44px] px-4 rounded-xl bg-oro-400 hover:bg-oro-300 active:scale-95 text-marino-950 text-sm font-bold transition">⚡ Proponer cómo cubrir los huecos</button>
        </div>
        <div class="overflow-x-auto custom-scroll -mx-4 px-4">
          <table class="w-full text-sm border-separate border-spacing-0 min-w-[860px]">
            <thead><tr><th class="sticky left-0 bg-white text-left p-2 text-xs text-slate-500">Vigilante</th>${DIAS.map(d => `<th class="p-2 text-xs text-slate-500 text-center">${d}</th>`).join('')}<th class="p-2 text-xs text-slate-500 text-right">Semana</th></tr>
            <tr class="bg-red-50/60"><th class="sticky left-0 bg-red-50 text-left p-2 text-xs font-bold text-red-700">Huecos del día</th>${filaHuecos}<td></td></tr></thead>
            <tbody>${filas}</tbody>
          </table>
        </div>
        <p class="text-xs text-slate-500">Las celdas con borde dorado son cambios hechos hoy. Pulsa un día en rojo para ver sus huecos y cubrirlos.</p>
      </div>`;
    $('cqAuto').onclick = proponerTodo;
    document.querySelectorAll('[data-cq-dia]').forEach(b => b.onclick = () => { estado.dia = +b.dataset.cqDia; cqTab('dia'); });
  }

  const estado = { dia: 6 };
  function vistaDia() {
    const d = estado.dia;
    const hs = huecos().filter(h => h.d === d);
    const barras = Object.entries(PUESTOS).filter(([, P]) => P.req.some(r => r.d === d)).map(([p, P]) => {
      const reqs = P.req.filter(r => r.d === d).flatMap(r => r.t.map(t => ({ t, n: r.n })));
      const segs = reqs.map(r => {
        const quien = cubiertos(p, d, r.t);
        const x = TURNOS[r.t]; const fin = x.fin <= x.ini ? 24 : x.fin;
        const left = x.ini / 24 * 100, width = (fin - x.ini) / 24 * 100;
        const falta = r.n - quien.length;
        const color = falta <= 0 ? P.color : (quien.length ? '#d97706' : '#dc2626');
        return `<button type="button" ${falta > 0 ? `data-cq-hueco="${p}-${d}-${r.t}"` : ''} class="absolute top-1 bottom-1 rounded-md text-[10px] font-bold text-white px-1 overflow-hidden whitespace-nowrap text-left ${falta > 0 ? 'hover:brightness-110 active:scale-[.98] cursor-pointer' : 'cursor-default'} transition" style="left:${left}%;width:${width}%;background:${color}" title="${TURNOS[r.t].nombre} ${franja(r.t)}">${quien.length}/${r.n}${falta > 0 ? ' · faltan ' + falta : ''}</button>`;
      }).join('');
      return `<div class="grid grid-cols-[130px_1fr] md:grid-cols-[180px_1fr] items-center gap-3">
        <div><p class="text-sm font-semibold text-marino-900 leading-tight">${esc(P.nombre)}</p><p class="text-[11px] text-slate-500">${esc(P.lugar)}</p></div>
        <div class="relative h-10 rounded-lg bg-marino-50 border border-marino-100">${segs}</div></div>`;
    }).join('');
    const horas = [0, 6, 12, 18, 24].map(h => `<span class="absolute -translate-x-1/2 text-[10px] text-slate-400" style="left:${h / 24 * 100}%">${hhmm(h % 24)}</span>`).join('');
    $('cq-dia').innerHTML = `
      <div class="bg-white rounded-2xl border border-marino-100 card-shadow p-4 space-y-4">
        <div class="flex gap-1.5 overflow-x-auto custom-scroll pb-1" role="group" aria-label="Día">${DIAS.map((n, i) => {
          const f = huecos().filter(h => h.d === i).length;
          return `<button type="button" data-cq-setdia="${i}" class="shrink-0 min-h-[40px] px-3 rounded-xl text-sm font-bold transition ${i === d ? 'bg-marino-800 text-white' : 'bg-marino-50 text-marino-700 hover:bg-marino-100'}">${n}${f ? ' <span class="text-red-500">●</span>' : ''}</button>`;
        }).join('')}</div>
        <div class="grid grid-cols-[130px_1fr] md:grid-cols-[180px_1fr] gap-3"><span></span><div class="relative h-4">${horas}</div></div>
        <div class="space-y-2.5">${barras}</div>
        <div class="flex flex-wrap gap-4 text-xs text-slate-600 pt-1">
          <span class="inline-flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-marino-700"></span>Cubierto</span>
          <span class="inline-flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-amber-600"></span>Por debajo del mínimo</span>
          <span class="inline-flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-red-600"></span>Sin cobertura</span>
        </div>
      </div>
      <div class="bg-white rounded-2xl border border-marino-100 card-shadow p-4 space-y-2">
        <h3 class="font-display font-extrabold text-lg text-marino-900">Huecos del ${DIAS_LARGO[d]}</h3>
        ${hs.length ? hs.map(h => filaHueco(h)).join('') : '<p class="text-sm text-emerald-700 font-semibold">✓ Todo el día está cubierto.</p>'}
      </div>`;
    document.querySelectorAll('[data-cq-setdia]').forEach(b => b.onclick = () => { estado.dia = +b.dataset.cqSetdia; vistaDia(); });
    enlazarHuecos();
  }

  function filaHueco(h) {
    const P = PUESTOS[h.p];
    return `<div class="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border ${h.hay ? 'border-amber-200 bg-amber-50/60' : 'border-red-200 bg-red-50/60'}">
      <div class="min-w-0"><p class="text-sm font-semibold text-marino-900">${esc(P.nombre)} · ${TURNOS[h.t].nombre} ${franja(h.t)}</p>
      <p class="text-xs text-slate-600">${DIAS_LARGO[h.d]} · hay ${h.hay} de ${h.pide}${P.habil ? ' · exige ' + esc(P.habil) : ''}</p></div>
      <button type="button" data-cq-hueco="${h.p}-${h.d}-${h.t}" class="min-h-[40px] px-3.5 rounded-xl bg-marino-800 hover:bg-marino-900 active:scale-95 text-white text-sm font-bold transition">Cubrir ${h.faltan > 1 ? '(' + h.faltan + ')' : ''}</button></div>`;
  }

  function enlazarHuecos() {
    document.querySelectorAll('[data-cq-hueco]').forEach(b => b.onclick = () => {
      const [p, d, t] = b.dataset.cqHueco.split('-');
      abrirHueco(huecos().find(h => h.p === +p && h.d === +d && h.t === t));
    });
  }

  function abrirHueco(h) {
    if (!h) return;
    const P = PUESTOS[h.p];
    const lista = candidatos(h);
    const ok = lista.filter(c => c.ok), no = lista.filter(c => !c.ok).slice(0, 5);
    const fila = (c) => `<li class="flex items-start justify-between gap-3 p-3 rounded-xl border ${c.ok ? (c.avisos.length ? 'border-amber-200 bg-amber-50/50' : 'border-emerald-200 bg-emerald-50/50') : 'border-slate-200 bg-slate-50 opacity-75'}">
      <div class="min-w-0"><p class="text-sm font-semibold text-marino-900">${esc(c.v.nombre)} <span class="text-[11px] font-normal text-slate-500">TIP ${c.v.tip} · ${horasSemana(c.v)} h esta semana</span></p>
      ${c.ok ? (c.avisos.length ? `<p class="text-xs text-amber-800">⚠ ${esc(c.avisos.join(' · '))}</p>` : '<p class="text-xs text-emerald-700">✓ Cumple descanso, horas y habilitación</p>') : `<p class="text-xs text-slate-600">✕ ${esc(c.motivos[0])}</p>`}</div>
      ${c.ok ? `<button type="button" data-cq-asignar="${c.v.id}" class="shrink-0 min-h-[40px] px-3 rounded-xl bg-marino-800 hover:bg-marino-900 active:scale-95 text-white text-xs font-bold transition">Asignar y avisar</button>` : ''}</li>`;
    $('cqModalBody').innerHTML = `
      <div class="p-5 md:p-6 space-y-4">
        <div class="flex items-start justify-between gap-3">
          <div><p class="text-xs font-bold uppercase tracking-widest text-oro-600">Cubrir hueco</p>
          <h3 id="cqModalTitle" class="font-display font-black text-xl text-marino-900">${esc(P.nombre)} · ${DIAS_LARGO[h.d]}</h3>
          <p class="text-sm text-slate-600">${TURNOS[h.t].nombre} ${franja(h.t)} · faltan ${h.faltan}${P.habil ? ' · exige ' + esc(P.habil) : ''}</p></div>
          <button type="button" data-cq-close class="w-10 h-10 rounded-full hover:bg-slate-100 active:scale-95 text-xl transition" aria-label="Cerrar">×</button>
        </div>
        <p class="text-xs font-bold text-emerald-700">Pueden cubrirlo (${ok.length})</p>
        <ul class="space-y-2">${ok.length ? ok.map(fila).join('') : '<li class="text-sm text-slate-600 p-3 rounded-xl bg-slate-50">Nadie de la plantilla puede sin saltarse una regla. Se pide refuerzo a la bolsa de correturnos.</li>'}</ul>
        <details class="rounded-xl border border-slate-200 p-3"><summary class="text-xs font-bold text-slate-600">Por qué no aparecen otros (${lista.length - ok.length})</summary><ul class="space-y-2 mt-2">${no.map(fila).join('')}</ul></details>
        <p class="text-[11px] text-slate-500">Al asignar, el vigilante recibe el turno por WhatsApp y lo confirma con un botón. En la demo no se envía nada.</p>
      </div>`;
    $('cqModal').classList.remove('hidden');
    $('cqModalBody').querySelectorAll('[data-cq-close]').forEach(b => b.onclick = cerrarModal);
    $('cqModalBody').querySelectorAll('[data-cq-asignar]').forEach(b => b.onclick = () => {
      const v = VIGILANTES.find(x => x.id === b.dataset.cqAsignar);
      v.dias[h.d] = h.t + h.p;
      cerrarModal(); repintar();
      toast('✅ ' + v.nombre + ' cubre ' + P.nombre + ' el ' + DIAS_LARGO[h.d] + '. Aviso enviado por WhatsApp (simulado).');
      const sigue = huecos().find(x => x.p === h.p && x.d === h.d && x.t === h.t);
      if (sigue) setTimeout(() => abrirHueco(sigue), 350);
    });
  }
  function cerrarModal() { $('cqModal').classList.add('hidden'); }

  function proponerTodo() {
    const hechos = [];
    let h; let guard = 0;
    while ((h = huecos()[0]) && guard++ < 40) {
      const c = candidatos(h).find(x => x.ok && !x.avisos.length) || candidatos(h).find(x => x.ok);
      if (!c) break;
      c.v.dias[h.d] = h.t + h.p;
      hechos.push(c.v.nombre.split(' ')[0] + ' → ' + PUESTOS[h.p].nombre + ' ' + DIAS[h.d]);
    }
    repintar();
    const quedan = totalFaltan();
    toast(hechos.length ? `⚡ ${hechos.length} turnos propuestos${quedan ? ' · quedan ' + quedan + ' sin candidato' : ''}. Revísalos (borde dorado) antes de avisar.` : 'No hay propuestas posibles sin saltarse una regla.');
  }

  function vistaInforme() {
    const hs = huecos();
    const porPuesto = Object.entries(PUESTOS).map(([p, P]) => {
      const mios = hs.filter(h => h.p === +p);
      const dias = new Set(mios.map(h => h.d)).size;
      return `<div class="bg-white rounded-2xl border border-marino-100 card-shadow overflow-hidden">
        <div class="px-4 py-2.5 text-white font-bold text-sm flex items-center justify-between" style="background:${P.color}"><span>${esc(P.nombre)}</span><span class="text-[11px] font-semibold opacity-90">${esc(P.lugar)}</span></div>
        <div class="p-4 space-y-3">
          <div class="flex items-center justify-between gap-3">
            <p class="text-xs text-slate-600"><strong>Criterio de alerta:</strong> ${P.req.map(r => r.n + ' por turno').filter((x, i, a) => a.indexOf(x) === i).join(', ')}${P.habil ? ' · con ' + esc(P.habil) : ''}</p>
            <div class="text-center rounded-xl px-3 py-1.5 ${dias ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}"><p class="font-display font-black text-2xl leading-none">${dias}</p><p class="text-[10px] font-semibold">días con alerta</p></div>
          </div>
          ${mios.length ? `<div class="overflow-x-auto custom-scroll"><table class="w-full text-xs min-w-[380px]"><thead><tr class="text-left text-slate-500 border-b border-marino-100"><th class="py-1.5 pr-2">Fecha</th><th class="pr-2">Turno</th><th class="pr-2">Franja KO</th><th class="pr-2">Hay / pide</th><th></th></tr></thead><tbody>
            ${mios.map(h => `<tr class="border-b border-marino-50"><td class="py-1.5 pr-2 font-semibold">${DIAS[h.d]}</td><td class="pr-2">${TURNOS[h.t].nombre}</td><td class="pr-2 text-red-700 font-semibold">${franja(h.t)}</td><td class="pr-2">${h.hay} / ${h.pide}</td><td class="text-right"><button type="button" data-cq-hueco="${h.p}-${h.d}-${h.t}" class="min-h-[32px] px-2.5 rounded-lg bg-marino-800 hover:bg-marino-900 active:scale-95 text-white font-bold transition">Cubrir</button></td></tr>`).join('')}
          </tbody></table></div>` : '<div class="rounded-xl bg-emerald-50 text-emerald-800 text-sm font-semibold p-4 text-center">✓ Sin incidencias de cobertura esta semana</div>'}
        </div></div>`;
    }).join('');
    $('cq-informe').innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-slate-600 max-w-2xl">El mismo informe llega cada viernes por email al jefe de servicio y a gerencia, con la semana siguiente ya revisada.</p>
        <button type="button" id="cqEmail" class="min-h-[44px] px-4 rounded-xl bg-marino-800 hover:bg-marino-900 active:scale-95 text-white text-sm font-bold transition">✉️ Ver el email del viernes</button>
      </div>
      <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">${porPuesto}</div>`;
    enlazarHuecos();
    $('cqEmail').onclick = () => {
      const f = totalFaltan();
      $('cqModalBody').innerHTML = `<div class="p-5 md:p-6 space-y-3">
        <div class="flex items-start justify-between gap-3"><h3 id="cqModalTitle" class="font-display font-black text-xl text-marino-900">Informe de cobertura · semana del 19 al 25 de octubre</h3><button type="button" data-cq-close class="w-10 h-10 rounded-full hover:bg-slate-100 text-xl" aria-label="Cerrar">×</button></div>
        <p class="text-xs text-slate-500">Para: jefe de servicio, gerencia · Enviado con Resend cada viernes a las 13:00</p>
        <div class="rounded-2xl border border-marino-100 p-4 space-y-2 text-sm">
          <p>Buenos días,</p>
          <p>La semana que viene tiene <strong>${totalPedidos()} turnos</strong> pedidos por los clientes. ${f ? `Quedan <strong class="text-red-700">${f} sin cubrir</strong>:` : 'Están <strong class="text-emerald-700">todos cubiertos</strong>.'}</p>
          ${f ? `<ul class="list-disc pl-5 text-slate-700">${huecos().map(h => `<li>${DIAS[h.d]} · ${esc(PUESTOS[h.p].nombre)} · ${franja(h.t)} · faltan ${h.faltan}</li>`).join('')}</ul>` : ''}
          <p>Vigilantes con horas extra: <strong>${VIGILANTES.filter(v => horasSemana(v) > 40).map(v => esc(v.nombre)).join(', ') || 'ninguno'}</strong>.</p>
          <p class="text-slate-500">Desde el enlace del email se abre el cuadrante y se cubre cada hueco.</p>
        </div></div>`;
      $('cqModal').classList.remove('hidden');
      $('cqModalBody').querySelectorAll('[data-cq-close]').forEach(b => b.onclick = cerrarModal);
    };
  }

  function vistaHoras() {
    const filas = VIGILANTES.map(v => {
      const h = horasSemana(v), n = nocturnas(v);
      const pct = Math.min(h / 48 * 100, 100);
      return `<tr class="border-t border-marino-50">
        <td class="py-2 pr-3"><p class="text-sm font-semibold text-marino-900">${esc(v.nombre)}</p><p class="text-[11px] text-slate-500">${v.habil.length ? esc(v.habil.join(' · ')) : 'Vigilante'}</p></td>
        <td class="pr-3 min-w-[180px]"><div class="relative h-3 rounded-full bg-marino-50 overflow-hidden"><div class="absolute inset-y-0 left-0 rounded-full ${h > 40 ? 'bg-amber-500' : 'bg-marino-700'}" style="width:${pct}%"></div><div class="absolute inset-y-0 border-l-2 border-dashed border-red-400" style="left:${40 / 48 * 100}%"></div></div></td>
        <td class="pr-3 text-sm font-bold text-right ${h > 40 ? 'text-amber-700' : ''}">${h} h</td>
        <td class="pr-3 text-sm text-right">${n} h</td>
        <td class="text-sm text-right">${h > 40 ? `<span class="text-amber-700 font-semibold">${h - 40} h</span>` : '—'}</td></tr>`;
    }).join('');
    $('cq-horas').innerHTML = `
      <div class="grid lg:grid-cols-[1fr_300px] gap-4 items-start">
        <div class="bg-white rounded-2xl border border-marino-100 card-shadow p-4 overflow-x-auto custom-scroll">
          <table class="w-full min-w-[560px]"><thead><tr class="text-left text-xs text-slate-500"><th class="pb-2">Vigilante</th><th class="pb-2">Semana (línea roja: 40 h)</th><th class="pb-2 text-right">Horas</th><th class="pb-2 text-right">Nocturnas</th><th class="pb-2 text-right">Extra</th></tr></thead><tbody>${filas}</tbody></table>
        </div>
        <div class="bg-white rounded-2xl border border-marino-100 card-shadow p-5 space-y-3 text-sm">
          <h3 class="font-display font-extrabold text-lg text-marino-900">Reglas que vigila el sistema</h3>
          <ul class="space-y-2 text-slate-700">
            <li>⏸️ <strong>12 h de descanso</strong> entre el final de una jornada y el inicio de la siguiente.</li>
            <li>⏱️ <strong>Jornada máxima</strong> y horas semanales; avisa antes de generar horas extra.</li>
            <li>🌙 <strong>Horas nocturnas</strong> (22:00-06:00) y festivos, listas para nómina.</li>
            <li>🎓 <strong>Habilitaciones y cursos</strong>: no deja poner en un estadio a quien no tiene el curso.</li>
            <li>📅 Vacaciones, bajas y formación bloquean el día automáticamente.</li>
          </ul>
          <p class="text-[11px] text-slate-500">Los límites se configuran con el convenio y los acuerdos de Andor; aquí se muestran valores de ejemplo.</p>
        </div>
      </div>`;
  }

  function vistaFichaje() {
    const hoy = [
      { v: 'Javier Molina', p: 1, t: 'M', e: '05:56', s: 'ok', r: '4 de 4 rondas' },
      { v: 'Sergio Lozano', p: 3, t: 'M', e: '05:58', s: 'ok', r: '3 de 3 rondas' },
      { v: 'Teresa López', p: 6, t: 'A', e: '06:54', s: 'ok', r: '2 de 2 rondas' },
      { v: 'Daniel Jiménez', p: 2, t: 'C', e: '10:07', s: 'tarde', r: '1 de 2 rondas' },
      { v: 'Patricia Tébar', p: 2, t: 'C', e: '09:55', s: 'ok', r: '2 de 2 rondas' },
      { v: 'Rocío Navarro', p: 1, t: 'T', e: '—', s: 'pendiente', r: 'Empieza a las 14:00' }
    ];
    $('cq-fichaje').innerHTML = `
      <div class="grid lg:grid-cols-[340px_1fr] gap-5 items-start">
        <div class="mx-auto w-full max-w-[340px] rounded-[2rem] bg-marino-950 p-2.5 card-shadow">
          <div class="rounded-[1.6rem] overflow-hidden bg-white">
            <div class="bg-marino-900 text-white p-4"><p class="text-[11px] text-marino-300">App del vigilante</p><p class="font-display font-black text-lg">Hola, Rocío</p><p class="text-xs text-marino-200">Hoy: Nave logística · Tarde 14:00-22:00</p></div>
            <div class="p-4 space-y-3" id="fxApp">
              <div class="rounded-2xl bg-marino-50 p-3 text-xs text-slate-600 space-y-1"><p>📍 Ubicación: <strong>dentro del puesto</strong></p><p>🔳 Lee el código QR de la garita para fichar</p></div>
              <button type="button" id="fxFichar" class="w-full min-h-[52px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold transition">Fichar entrada</button>
              <div class="grid grid-cols-2 gap-2">
                <button type="button" id="fxRonda" class="min-h-[44px] rounded-xl bg-white border border-marino-100 hover:border-marino-300 active:scale-95 text-sm font-semibold transition">📡 Punto de ronda</button>
                <button type="button" id="fxParte" class="min-h-[44px] rounded-xl bg-white border border-marino-100 hover:border-marino-300 active:scale-95 text-sm font-semibold transition">🚨 Dar un parte</button>
              </div>
              <div id="fxLog" class="space-y-1.5 text-xs" aria-live="polite"></div>
            </div>
          </div>
        </div>
        <div class="space-y-4">
          <div class="bg-white rounded-2xl border border-marino-100 card-shadow p-4 space-y-3">
            <div class="flex items-center justify-between gap-3"><h3 class="font-display font-extrabold text-lg text-marino-900">Fichajes de hoy en los puestos</h3><span class="text-[11px] font-semibold px-2 py-1 rounded-full bg-marino-50 text-marino-700">Actualizado al momento</span></div>
            <div class="overflow-x-auto custom-scroll"><table class="w-full text-sm min-w-[520px]"><thead><tr class="text-left text-xs text-slate-500 border-b border-marino-100"><th class="py-2 pr-2">Vigilante</th><th class="pr-2">Puesto</th><th class="pr-2">Turno</th><th class="pr-2">Entrada</th><th>Rondas</th></tr></thead>
            <tbody id="fxTabla">${hoy.map(f => `<tr class="border-b border-marino-50" data-fx="${esc(f.v)}"><td class="py-2 pr-2 font-semibold">${esc(f.v)}</td><td class="pr-2">${esc(PUESTOS[f.p].nombre)}</td><td class="pr-2">${franja(f.t)}</td>
              <td class="pr-2">${f.s === 'tarde' ? `<span class="text-amber-700 font-semibold">${f.e} · 7 min tarde</span>` : f.s === 'pendiente' ? '<span class="text-slate-400">pendiente</span>' : `<span class="text-emerald-700 font-semibold">${f.e}</span>`}</td><td class="text-xs text-slate-600">${f.r}</td></tr>`).join('')}</tbody></table></div>
          </div>
          <div class="grid sm:grid-cols-3 gap-3 text-sm">
            <div class="bg-white rounded-2xl border border-marino-100 card-shadow p-4"><p class="text-2xl">⏰</p><p class="font-semibold text-marino-900">Aviso si no ficha</p><p class="text-xs text-slate-600">A los 10 minutos sin fichar, el jefe de servicio recibe un WhatsApp con el puesto y un sustituto propuesto.</p></div>
            <div class="bg-white rounded-2xl border border-marino-100 card-shadow p-4"><p class="text-2xl">📡</p><p class="font-semibold text-marino-900">Rondas con QR o NFC</p><p class="text-xs text-slate-600">Cada punto de control queda registrado con hora; el cliente lo ve en su informe mensual.</p></div>
            <div class="bg-white rounded-2xl border border-marino-100 card-shadow p-4"><p class="text-2xl">📄</p><p class="font-semibold text-marino-900">Registro de jornada</p><p class="text-xs text-slate-600">Entradas y salidas guardadas como exige la ley, exportables en PDF o Excel.</p></div>
          </div>
        </div>
      </div>`;
    const log = (t) => { $('fxLog').insertAdjacentHTML('afterbegin', `<p class="rounded-lg bg-emerald-50 text-emerald-800 px-2.5 py-1.5">${t}</p>`); };
    $('fxFichar').onclick = (e) => {
      const b = e.currentTarget;
      if (b.dataset.dentro) { b.dataset.dentro = ''; b.textContent = 'Fichar entrada'; b.classList.replace('bg-red-600', 'bg-emerald-600'); log('🔴 Salida fichada a las 22:01'); return; }
      b.dataset.dentro = '1'; b.textContent = 'Fichar salida'; b.classList.replace('bg-emerald-600', 'bg-red-600');
      log('🟢 Entrada fichada a las 13:57 · QR de la garita y ubicación correctos');
      const fila = document.querySelector('[data-fx="Rocío Navarro"] td:nth-child(4)');
      if (fila) fila.innerHTML = '<span class="text-emerald-700 font-semibold">13:57</span>';
    };
    let ronda = 0;
    $('fxRonda').onclick = () => { ronda = ronda % 4 + 1; log('📡 Punto ' + ronda + ' de 4 (' + ['muelle de carga', 'puerta norte', 'almacén', 'aparcamiento'][ronda - 1] + ') registrado'); };
    $('fxParte').onclick = () => { if (window.switchTab) { window.switchTab('whatsapp'); setTimeout(() => window.anWaModo && window.anWaModo('vigilante'), 50); } };
  }

  function repintar() { kpis(); vistaSemanal(); vistaDia(); vistaInforme(); }
  function cqTab(id) {
    document.querySelectorAll('[data-cq-tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.cqTab === id)));
    document.querySelectorAll('.cq-pane').forEach(p => p.classList.toggle('hidden', p.id !== 'cq-' + id));
    if (id === 'dia') vistaDia();
    if (id === 'horas') vistaHoras();
  }

  document.addEventListener('DOMContentLoaded', () => {
    repintar(); vistaHoras(); vistaFichaje();
    document.querySelectorAll('[data-cq-tab]').forEach(b => b.onclick = () => cqTab(b.dataset.cqTab));
    document.querySelectorAll('[data-cq-close]').forEach(b => b.onclick = cerrarModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarModal(); });
    cqTab('semanal');
  });

  window.ANDOR_CQ = { huecos, totalFaltan, totalPedidos, VIGILANTES, PUESTOS, horasSemana, cqTab };
})();
