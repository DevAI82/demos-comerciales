/*
 * Motor Gas Bike · CRM de taller y ventas (demo).
 * Todo funciona en el navegador con datos de ejemplo: nombres genéricos e importes orientativos.
 * Secciones: Resumen, Taller (órdenes de reparación), Clientes, Venta de motos, Agenda y Recordatorios.
 */
(function () {
  'use strict';

  // ------------------------------------------------------------------ Datos de ejemplo
  const MECANICOS = ['Dani', 'Sergio', 'Marta'];

  const ESTADOS = [
    { id: 'recepcion', nombre: 'Recepción', color: 'bg-sky-500', desc: 'Moto recibida y revisada en mostrador' },
    { id: 'diagnostico', nombre: 'Diagnóstico', color: 'bg-indigo-500', desc: 'El mecánico revisa y valora el trabajo' },
    { id: 'aprobacion', nombre: 'Esperando OK', color: 'bg-amber-500', desc: 'Presupuesto enviado al cliente por WhatsApp' },
    { id: 'recambios', nombre: 'Recambios', color: 'bg-orange-500', desc: 'Pendiente de que lleguen piezas' },
    { id: 'elevador', nombre: 'En elevador', color: 'bg-moto-600', desc: 'Reparación en curso' },
    { id: 'calidad', nombre: 'Prueba y lavado', color: 'bg-purple-500', desc: 'Prueba dinámica y limpieza' },
    { id: 'lista', nombre: 'Lista para entregar', color: 'bg-emerald-500', desc: 'Cliente avisado para recogerla' }
  ];
  const estadoIdx = id => ESTADOS.findIndex(e => e.id === id);

  const clientes = [
    { id: 'c1', nombre: 'Javier R.', tel: '6XX XX 45 12', canal: 'Laura (teléfono)', desde: '2021', etiquetas: ['Cliente fiel', 'Trail'], gasto: 2140, visitas: 11,
      motos: [{ modelo: 'KTM 790 Adventure', anio: 2021, matricula: '1234 LKM', km: 15200, proxima: 'Revisión 20.000 km', proximaFecha: 'mar 2027' }],
      historial: [
        { fecha: '14/10/2026', tipo: 'Cita', texto: 'Pide cita por teléfono (Laura): revisión 15.000 km y pastillas traseras.' },
        { fecha: '02/04/2026', tipo: 'Taller', texto: 'Neumáticos delantero y trasero + equilibrado.', importe: 310 },
        { fecha: '18/10/2025', tipo: 'Taller', texto: 'Revisión 10.000 km (aceite, filtros, ajuste cadena).', importe: 215 },
        { fecha: '05/06/2025', tipo: 'Tienda', texto: 'Casco trail y guantes de verano.', importe: 389 }
      ] },
    { id: 'c2', nombre: 'Laura M.', tel: '6XX XX 81 07', canal: 'Instagram', desde: '2024', etiquetas: ['Carnet A2', 'Moto comprada aquí'], gasto: 6640, visitas: 4,
      motos: [{ modelo: 'CFMOTO 450MT', anio: 2024, matricula: '5678 MNB', km: 6100, proxima: 'Revisión anual', proximaFecha: 'nov 2026' }],
      historial: [
        { fecha: '20/09/2026', tipo: 'Taller', texto: 'Revisión de rodaje 1.000 km.', importe: 0 },
        { fecha: '12/08/2026', tipo: 'Venta', texto: 'Compra de CFMOTO 450MT con financiación.', importe: 6200 },
        { fecha: '12/08/2026', tipo: 'Tienda', texto: 'Chaqueta y botas.', importe: 440 }
      ] },
    { id: 'c3', nombre: 'Andrés P.', tel: '6XX XX 23 90', canal: 'WhatsApp', desde: '2019', etiquetas: ['Cliente fiel', 'Naked'], gasto: 3480, visitas: 17,
      motos: [
        { modelo: 'Yamaha MT-07', anio: 2019, matricula: '9012 KHT', km: 38400, proxima: 'Kit de arrastre', proximaFecha: 'ahora' },
        { modelo: 'Honda PCX 125', anio: 2022, matricula: '3456 LZP', km: 9800, proxima: 'Cambio de aceite', proximaFecha: 'dic 2026' }
      ],
      historial: [
        { fecha: '13/10/2026', tipo: 'Taller', texto: 'Entra la MT-07: ruido de cadena, posible kit de arrastre.' },
        { fecha: '11/03/2026', tipo: 'Taller', texto: 'PCX: revisión y correa.', importe: 145 },
        { fecha: '22/11/2025', tipo: 'Taller', texto: 'MT-07: revisión 35.000 km.', importe: 240 }
      ] },
    { id: 'c4', nombre: 'Marina G.', tel: '6XX XX 67 33', canal: 'Mostrador', desde: '2023', etiquetas: ['Scooter'], gasto: 760, visitas: 5,
      motos: [{ modelo: 'Kymco Agility 125', anio: 2020, matricula: '7890 KSD', km: 21300, proxima: 'ITV', proximaFecha: 'nov 2026' }],
      historial: [
        { fecha: '14/10/2026', tipo: 'Taller', texto: 'Frenos: pastillas delanteras y líquido.' },
        { fecha: '30/04/2026', tipo: 'Taller', texto: 'Revisión general.', importe: 120 }
      ] },
    { id: 'c5', nombre: 'Rubén T.', tel: '6XX XX 12 58', canal: 'Laura (teléfono)', desde: '2026', etiquetas: ['Cliente nuevo', 'Enduro'], gasto: 0, visitas: 1,
      motos: [{ modelo: 'Husqvarna TE 300', anio: 2023, matricula: 'Sin matrícula (campo)', km: 0, proxima: 'Horas de pistón', proximaFecha: '—' }],
      historial: [{ fecha: '12/10/2026', tipo: 'Cita', texto: 'Llama un domingo; Laura toma los datos: pérdida de potencia.' }] },
    { id: 'c6', nombre: 'Elena S.', tel: '6XX XX 90 44', canal: 'Web', desde: '2022', etiquetas: ['Custom'], gasto: 1890, visitas: 6,
      motos: [{ modelo: 'Royal Enfield Hunter 350', anio: 2022, matricula: '2468 LDR', km: 11800, proxima: 'Revisión anual', proximaFecha: 'oct 2026' }],
      historial: [
        { fecha: '10/10/2026', tipo: 'Taller', texto: 'Revisión anual + neumático trasero.' },
        { fecha: '09/10/2025', tipo: 'Taller', texto: 'Revisión anual.', importe: 165 }
      ] },
    { id: 'c7', nombre: 'Carlos V.', tel: '6XX XX 37 21', canal: 'WhatsApp', desde: '2020', etiquetas: ['Trail', 'Viajero'], gasto: 4120, visitas: 9,
      motos: [{ modelo: 'BMW R 1250 GS', anio: 2020, matricula: '1357 LBC', km: 52300, proxima: 'Revisión 60.000 km', proximaFecha: 'may 2027' }],
      historial: [
        { fecha: '09/10/2026', tipo: 'Taller', texto: 'Mantenimiento suspensión y reglaje de válvulas.' },
        { fecha: '14/05/2026', tipo: 'Taller', texto: 'Revisión 50.000 km.', importe: 420 }
      ] },
    { id: 'c8', nombre: 'Sofía L.', tel: '6XX XX 55 16', canal: 'Instagram', desde: '2025', etiquetas: ['Carnet A2'], gasto: 520, visitas: 3,
      motos: [{ modelo: 'KTM 390 Duke', anio: 2022, matricula: '8642 LPM', km: 14500, proxima: 'Kit de arrastre', proximaFecha: 'jun 2027' }],
      historial: [
        { fecha: '11/10/2026', tipo: 'Taller', texto: 'Revisión 15.000 km.' },
        { fecha: '20/02/2026', tipo: 'Taller', texto: 'Neumáticos.', importe: 230 }
      ] }
  ];
  const cliente = id => clientes.find(c => c.id === id);

  let ordenes = [
    { id: 'OR-1041', cliente: 'c1', moto: 'KTM 790 Adventure', matricula: '1234 LKM', km: 15200, origen: 'Laura (teléfono)', estado: 'recepcion',
      trabajos: ['Revisión 15.000 km (aceite, filtros, bujías)', 'Pastillas de freno traseras'], presupuesto: 195, aprobado: false,
      recambios: [{ pieza: 'Kit de aceite y filtro', estado: 'En stock' }, { pieza: 'Pastillas traseras', estado: 'En stock' }],
      elevador: '—', mecanico: '—', entrada: 'Hoy 09:30', prometida: 'Hoy 13:30',
      recepcion: { fotos: 4, combustible: '½ depósito', danos: 'Sin daños previos' },
      timeline: [{ hora: '14/10 09:32', texto: 'Moto recibida en mostrador y fotografiada.' }, { hora: '13/10 22:14', texto: 'Cita pedida por teléfono a Laura (fuera de horario).' }] },
    { id: 'OR-1040', cliente: 'c3', moto: 'Yamaha MT-07', matricula: '9012 KHT', km: 38400, origen: 'WhatsApp', estado: 'aprobacion',
      trabajos: ['Kit de arrastre completo', 'Revisión de rodamientos de rueda trasera'], presupuesto: 285, aprobado: false,
      recambios: [{ pieza: 'Kit de arrastre', estado: 'En stock' }],
      elevador: 'Elevador 2', mecanico: 'Sergio', entrada: 'Ayer 17:00', prometida: 'Mañana 12:00',
      recepcion: { fotos: 6, combustible: '¼ depósito', danos: 'Rozadura en el escape (anotada)' },
      timeline: [{ hora: '14/10 10:05', texto: 'Presupuesto enviado por WhatsApp. Esperando respuesta.' }, { hora: '13/10 17:20', texto: 'Diagnóstico: cadena estirada y piñón desgastado.' }, { hora: '13/10 17:02', texto: 'Moto recibida.' }] },
    { id: 'OR-1039', cliente: 'c4', moto: 'Kymco Agility 125', matricula: '7890 KSD', km: 21300, origen: 'Mostrador', estado: 'recambios',
      trabajos: ['Pastillas delanteras', 'Cambio de líquido de frenos'], presupuesto: 95, aprobado: true,
      recambios: [{ pieza: 'Pastillas delanteras', estado: 'Llega mañana' }, { pieza: 'Líquido DOT 4', estado: 'En stock' }],
      elevador: '—', mecanico: 'Marta', entrada: 'Hoy 10:15', prometida: 'Jueves 13:00',
      recepcion: { fotos: 4, combustible: 'Lleno', danos: 'Sin daños previos' },
      timeline: [{ hora: '14/10 11:00', texto: 'Pastillas pedidas al proveedor. Cliente avisado del plazo.' }, { hora: '14/10 10:40', texto: 'Presupuesto aprobado por WhatsApp.' }] },
    { id: 'OR-1038', cliente: 'c7', moto: 'BMW R 1250 GS', matricula: '1357 LBC', km: 52300, origen: 'WhatsApp', estado: 'elevador',
      trabajos: ['Mantenimiento de suspensión', 'Reglaje de válvulas'], presupuesto: 460, aprobado: true,
      recambios: [{ pieza: 'Juntas de tapa de balancines', estado: 'En stock' }, { pieza: 'Aceite de horquilla', estado: 'En stock' }],
      elevador: 'Elevador 1', mecanico: 'Dani', entrada: 'Ayer 09:00', prometida: 'Hoy 19:00',
      recepcion: { fotos: 8, combustible: '½ depósito', danos: 'Maletas desmontadas y guardadas' },
      timeline: [{ hora: '14/10 09:10', texto: 'En elevador 1 con Dani.' }, { hora: '13/10 12:30', texto: 'Presupuesto aprobado.' }] },
    { id: 'OR-1037', cliente: 'c8', moto: 'KTM 390 Duke', matricula: '8642 LPM', km: 14500, origen: 'Instagram', estado: 'elevador',
      trabajos: ['Revisión 15.000 km'], presupuesto: 175, aprobado: true,
      recambios: [{ pieza: 'Kit de aceite y filtro', estado: 'En stock' }],
      elevador: 'Elevador 3', mecanico: 'Marta', entrada: 'Hoy 08:45', prometida: 'Hoy 14:00',
      recepcion: { fotos: 4, combustible: '¾ depósito', danos: 'Sin daños previos' },
      timeline: [{ hora: '14/10 09:00', texto: 'En elevador 3 con Marta.' }] },
    { id: 'OR-1036', cliente: 'c5', moto: 'Husqvarna TE 300', matricula: 'Campo', km: 0, origen: 'Laura (teléfono)', estado: 'diagnostico',
      trabajos: ['Diagnóstico de pérdida de potencia'], presupuesto: 0, aprobado: false,
      recambios: [],
      elevador: 'Elevador 2', mecanico: 'Dani', entrada: 'Hoy 11:30', prometida: 'Por confirmar',
      recepcion: { fotos: 4, combustible: '¼ depósito', danos: 'Plásticos rayados (uso en campo)' },
      timeline: [{ hora: '14/10 11:35', texto: 'Moto recibida. Diagnóstico en curso.' }, { hora: '12/10 20:40', texto: 'Laura toma los datos un domingo.' }] },
    { id: 'OR-1035', cliente: 'c6', moto: 'Royal Enfield Hunter 350', matricula: '2468 LDR', km: 11800, origen: 'Web', estado: 'calidad',
      trabajos: ['Revisión anual', 'Neumático trasero'], presupuesto: 255, aprobado: true,
      recambios: [{ pieza: 'Neumático trasero', estado: 'Montado' }],
      elevador: '—', mecanico: 'Sergio', entrada: 'Ayer 16:30', prometida: 'Hoy 17:00',
      recepcion: { fotos: 4, combustible: '½ depósito', danos: 'Sin daños previos' },
      timeline: [{ hora: '14/10 11:50', texto: 'Prueba dinámica superada. Pasa a lavado.' }] },
    { id: 'OR-1034', cliente: 'c2', moto: 'CFMOTO 450MT', matricula: '5678 MNB', km: 6100, origen: 'Instagram', estado: 'lista',
      trabajos: ['Montaje de defensas y maletas laterales'], presupuesto: 120, aprobado: true,
      recambios: [{ pieza: 'Defensas y soportes', estado: 'Montado' }],
      elevador: '—', mecanico: 'Marta', entrada: 'Ayer 10:00', prometida: 'Hoy 12:00',
      recepcion: { fotos: 4, combustible: '¾ depósito', danos: 'Sin daños previos' },
      timeline: [{ hora: '14/10 10:30', texto: 'Lista. Aviso de recogida enviado por WhatsApp.' }] }
  ];

  const ETAPAS_VENTA = [
    { id: 'nuevo', nombre: 'Nuevo interesado' },
    { id: 'contactado', nombre: 'Contactado' },
    { id: 'prueba', nombre: 'Prueba / visita' },
    { id: 'oferta', nombre: 'Oferta enviada' },
    { id: 'vendida', nombre: 'Vendida' }
  ];
  let leads = [
    { id: 'v1', nombre: 'Pablo N.', modelo: 'Trail para carnet A2', carnet: 'A2', presupuesto: '6.000 – 7.000 €', origen: 'Laura (teléfono)', etapa: 'nuevo', nota: 'Se acaba de sacar el carnet. Quiere probar dos trail.' },
    { id: 'v2', nombre: 'Irene C.', modelo: 'Scooter 125', carnet: 'B (3 años)', presupuesto: '3.000 – 4.000 €', origen: 'Instagram', etapa: 'nuevo', nota: 'Para ir a trabajar. Pregunta por financiación.' },
    { id: 'v3', nombre: 'Tomás H.', modelo: 'Naked media cilindrada', carnet: 'A', presupuesto: '8.000 – 9.500 €', origen: 'Web', etapa: 'contactado', nota: 'Entregaría su moto actual como parte del pago.' },
    { id: 'v4', nombre: 'Nuria B.', modelo: 'Trail 450 (ocasión o nueva)', carnet: 'A2', presupuesto: '5.500 – 6.500 €', origen: 'WhatsApp', etapa: 'prueba', nota: 'Viene el sábado a las 11:00 a subirse para comprobar la altura.' },
    { id: 'v5', nombre: 'Óscar F.', modelo: 'Trail grande', carnet: 'A', presupuesto: '15.000 €+', origen: 'Mostrador', etapa: 'oferta', nota: 'Oferta enviada con equipamiento incluido. Seguimiento el jueves.' },
    { id: 'v6', nombre: 'Laura M.', modelo: 'CFMOTO 450MT', carnet: 'A2', presupuesto: '≈ 6.200 €', origen: 'Instagram', etapa: 'vendida', nota: 'Entregada en agosto. Ya es cliente del taller.' }
  ];

  let recordatorios = [
    { id: 'r1', cliente: 'c6', moto: 'Royal Enfield Hunter 350', tipo: 'Revisión anual', cuando: 'Esta semana', estado: 'Cita reservada' },
    { id: 'r2', cliente: 'c4', moto: 'Kymco Agility 125', tipo: 'ITV', cuando: 'En 3 semanas', estado: 'Programado' },
    { id: 'r3', cliente: 'c2', moto: 'CFMOTO 450MT', tipo: 'Revisión anual', cuando: 'En 4 semanas', estado: 'Programado' },
    { id: 'r4', cliente: 'c3', moto: 'Honda PCX 125', tipo: 'Cambio de aceite', cuando: 'En 7 semanas', estado: 'Programado' },
    { id: 'r5', cliente: 'c1', moto: 'KTM 790 Adventure', tipo: 'Neumáticos (desgaste)', cuando: 'Hace 2 días', estado: 'Enviado' },
    { id: 'r6', cliente: 'c7', moto: 'BMW R 1250 GS', tipo: 'Valoración tras el servicio', cuando: 'Al entregar', estado: 'Programado' }
  ];
  const reglas = [
    { id: 'rg1', nombre: 'Revisión anual', detalle: '15 días antes de que se cumpla el año desde la última revisión', activa: true },
    { id: 'rg2', nombre: 'ITV', detalle: '30 días antes del vencimiento, con hueco para pasarla desde el taller', activa: true },
    { id: 'rg3', nombre: 'Cambio de aceite por km', detalle: 'Estimado con los km de la última visita y el uso medio', activa: true },
    { id: 'rg4', nombre: 'Reseña en Google', detalle: '2 días después de entregar la moto, si la valoración es buena', activa: true },
    { id: 'rg5', nombre: 'Cliente dormido', detalle: 'Si no viene en 12 meses, mensaje con una oferta de revisión', activa: false }
  ];

  const AGENDA = {
    dias: ['Lun 13', 'Mar 14', 'Mié 15', 'Jue 16', 'Vie 17', 'Sáb 18'],
    hoy: 1,
    elevadores: ['Elevador 1', 'Elevador 2', 'Elevador 3'],
    citas: [
      { dia: 0, el: 0, turno: 'Mañana', texto: 'BMW R 1250 GS · Suspensión', tipo: 'taller' },
      { dia: 0, el: 1, turno: 'Tarde', texto: 'Yamaha MT-07 · Diagnóstico', tipo: 'taller' },
      { dia: 0, el: 2, turno: 'Tarde', texto: 'Royal Enfield · Revisión', tipo: 'taller' },
      { dia: 1, el: 0, turno: 'Mañana', texto: 'BMW R 1250 GS · Válvulas', tipo: 'taller' },
      { dia: 1, el: 1, turno: 'Mañana', texto: 'Husqvarna TE 300 · Diagnóstico', tipo: 'laura' },
      { dia: 1, el: 2, turno: 'Mañana', texto: 'KTM 390 Duke · Revisión', tipo: 'taller' },
      { dia: 1, el: 0, turno: 'Tarde', texto: 'KTM 790 Adventure · Revisión', tipo: 'laura' },
      { dia: 2, el: 1, turno: 'Mañana', texto: 'Yamaha MT-07 · Kit de arrastre', tipo: 'taller' },
      { dia: 2, el: 0, turno: 'Tarde', texto: 'Neumáticos · cliente nuevo', tipo: 'laura' },
      { dia: 3, el: 2, turno: 'Mañana', texto: 'Kymco Agility · Frenos', tipo: 'taller' },
      { dia: 3, el: 0, turno: 'Tarde', texto: 'Pre-ITV · scooter', tipo: 'recordatorio' },
      { dia: 4, el: 1, turno: 'Mañana', texto: 'Revisión anual · Hunter 350', tipo: 'recordatorio' },
      { dia: 5, el: 0, turno: 'Mañana', texto: 'Prueba trail A2 · Nuria B.', tipo: 'venta' }
    ]
  };

  const stats = { entregadasMes: 61, facturacionMes: 14260, ventasMes: 7 };

  // ------------------------------------------------------------------ Utilidades
  const $ = sel => document.querySelector(sel);
  const miles = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const eur = n => miles(n) + ' €';
  const iniciales = n => n.split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase();

  function toast(msg) {
    const t = $('#crmToast');
    if (!t) return;
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.add('hidden'), 2800);
  }

  const card = 'bg-white rounded-2xl border border-slate-200 card-shadow';
  const chip = (txt, cls) => `<span class="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${cls}">${txt}</span>`;
  const origenChip = o => {
    const map = { 'Laura (teléfono)': 'bg-moto-100 text-moto-800', WhatsApp: 'bg-emerald-100 text-emerald-800', Instagram: 'bg-pink-100 text-pink-800', Web: 'bg-sky-100 text-sky-800', Mostrador: 'bg-slate-100 text-slate-700' };
    return chip((o === 'Laura (teléfono)' ? '📞 ' : '') + o, map[o] || 'bg-slate-100 text-slate-700');
  };

  // ------------------------------------------------------------------ Navegación
  let tabActual = 'resumen';
  function mostrar(tab) {
    tabActual = tab;
    document.querySelectorAll('.crm-pane').forEach(p => p.classList.toggle('hidden', p.id !== 'crm-' + tab));
    document.querySelectorAll('.crm-tab').forEach(b => {
      const on = b.dataset.crmTab === tab;
      b.className = 'crm-tab shrink-0 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ' +
        (on ? 'bg-carbon-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100');
    });
    render();
  }

  function render() {
    const enTaller = ordenes.length;
    const badge = $('#crmBadgeTaller');
    if (badge) badge.textContent = enTaller;
    ({ resumen: renderResumen, taller: renderTaller, clientes: renderClientes, ventas: renderVentas, agenda: renderAgenda, recordatorios: renderRecordatorios })[tabActual]();
  }

  // ------------------------------------------------------------------ Resumen
  function kpi(titulo, valor, nota, extra) {
    return `<div class="${card} p-4 space-y-1">
      <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">${titulo}</p>
      <p class="font-display text-2xl font-bold text-carbon-900">${valor}</p>
      <p class="text-[11px] text-slate-500">${nota}${extra ? ' ' + extra : ''}</p>
    </div>`;
  }
  function barras(items, color) {
    const max = Math.max(...items.map(i => i.v));
    return items.map(i => `<div class="space-y-1">
      <div class="flex justify-between text-xs"><span class="text-slate-700 font-medium">${i.k}</span><span class="font-bold text-slate-900">${i.label || i.v}</span></div>
      <div class="h-2.5 rounded-full bg-slate-100 overflow-hidden"><div class="h-full rounded-full ${color}" style="width:${Math.max(4, Math.round(i.v / max * 100))}%"></div></div>
    </div>`).join('');
  }

  function renderResumen() {
    const enTaller = ordenes.length;
    const esperandoOk = ordenes.filter(o => o.estado === 'aprobacion').length;
    const recambios = ordenes.filter(o => o.estado === 'recambios').length;
    const listas = ordenes.filter(o => o.estado === 'lista').length;
    const enElevador = ordenes.filter(o => ['elevador', 'diagnostico'].includes(o.estado)).length;
    const ocupacion = Math.min(100, Math.round(enElevador / 3 * 100));

    const semanas = [{ k: 'Sem. 1', v: 13 }, { k: 'Sem. 2', v: 16 }, { k: 'Sem. 3', v: 15 }, { k: 'Sem. 4', v: 17 + (stats.entregadasMes - 61) }];
    const maxS = Math.max(...semanas.map(s => s.v));

    $('#crm-resumen').innerHTML = `
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${kpi('Motos en el taller', enTaller, `${enElevador} en elevador · ${listas} listas`)}
        ${kpi('Ocupación elevadores', ocupacion + ' %', '3 elevadores · media semanal 78 %')}
        ${kpi('Facturación taller (mes)', '≈ ' + eur(stats.facturacionMes), 'Orientativa · +9 % vs. septiembre')}
        ${kpi('Ticket medio taller', '≈ ' + eur(Math.round(stats.facturacionMes / stats.entregadasMes)), `${stats.entregadasMes} órdenes entregadas`)}
        ${kpi('Motos vendidas (mes)', stats.ventasMes, 'Conversión de interesados 12 %')}
        ${kpi('Clientes que repiten', '68 %', 'Vuelven en menos de 12 meses')}
        ${kpi('Tiempo medio en taller', '2,1 días', 'Desde la entrada hasta el aviso')}
        ${kpi('Llamadas de Laura', '132', '41 fuera de horario · 38 citas')}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="${card} p-5 space-y-3 lg:col-span-1">
          <div class="flex items-center justify-between"><h3 class="font-display font-bold text-sm text-slate-900">Hoy en el taller</h3><span class="text-[10px] text-slate-400">Martes 14</span></div>
          <button data-crm-go="taller" data-filtro="aprobacion" class="w-full text-left p-3 rounded-xl bg-amber-50 border border-amber-200 hover:border-amber-400 transition">
            <p class="text-xs font-bold text-amber-900">⏳ ${esperandoOk} presupuesto${esperandoOk === 1 ? '' : 's'} esperando OK del cliente</p>
            <p class="text-[11px] text-amber-800">Recordatorio automático por WhatsApp a las 4 h.</p>
          </button>
          <button data-crm-go="taller" data-filtro="recambios" class="w-full text-left p-3 rounded-xl bg-orange-50 border border-orange-200 hover:border-orange-400 transition">
            <p class="text-xs font-bold text-orange-900">📦 ${recambios} moto${recambios === 1 ? '' : 's'} esperando recambios</p>
            <p class="text-[11px] text-orange-800">El cliente ya sabe cuándo llega la pieza.</p>
          </button>
          <button data-crm-go="taller" data-filtro="lista" class="w-full text-left p-3 rounded-xl bg-emerald-50 border border-emerald-200 hover:border-emerald-400 transition">
            <p class="text-xs font-bold text-emerald-900">🏁 ${listas} lista${listas === 1 ? '' : 's'} para entregar</p>
            <p class="text-[11px] text-emerald-800">Aviso de recogida enviado con la factura.</p>
          </button>
          <button data-crm-go="recordatorios" class="w-full text-left p-3 rounded-xl bg-sky-50 border border-sky-200 hover:border-sky-400 transition">
            <p class="text-xs font-bold text-sky-900">🔔 ${recordatorios.filter(r => r.estado === 'Programado').length} recordatorios programados</p>
            <p class="text-[11px] text-sky-800">Revisiones, ITV y cambios de aceite.</p>
          </button>
        </div>

        <div class="${card} p-5 space-y-4 lg:col-span-2">
          <div class="flex items-center justify-between"><h3 class="font-display font-bold text-sm text-slate-900">Órdenes entregadas por semana</h3><span class="text-[10px] text-slate-400">Octubre 2026</span></div>
          <div class="flex items-end gap-3 h-40 pt-2">
            ${semanas.map(s => `<div class="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <span class="text-xs font-bold text-slate-800">${s.v}</span>
              <div class="w-full max-w-[64px] rounded-t-xl bg-gradient-to-t from-moto-700 to-moto-400" style="height:${Math.round(s.v / maxS * 100)}%"></div>
              <span class="text-[11px] text-slate-500">${s.k}</span></div>`).join('')}
          </div>
          <div class="grid grid-cols-3 gap-2 text-center">
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100"><p class="text-[10px] text-slate-500 uppercase font-bold">Valoración media</p><p class="font-bold text-slate-900">4,8 ★</p></div>
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100"><p class="text-[10px] text-slate-500 uppercase font-bold">Presupuestos aceptados</p><p class="font-bold text-slate-900">86 %</p></div>
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-100"><p class="text-[10px] text-slate-500 uppercase font-bold">Entregas a tiempo</p><p class="font-bold text-slate-900">93 %</p></div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="${card} p-5 space-y-3">
          <h3 class="font-display font-bold text-sm text-slate-900">Ingresos del taller por tipo de trabajo</h3>
          <p class="text-[11px] text-slate-500 -mt-2">Importes orientativos del mes</p>
          ${barras([{ k: 'Revisiones y mantenimiento', v: 5980, label: '≈ 5.980 €' }, { k: 'Neumáticos', v: 3120, label: '≈ 3.120 €' }, { k: 'Reparaciones y averías', v: 2740, label: '≈ 2.740 €' }, { k: 'Frenos y transmisión', v: 1610, label: '≈ 1.610 €' }, { k: 'Accesorios montados', v: 810, label: '≈ 810 €' }], 'bg-moto-500')}
        </div>
        <div class="${card} p-5 space-y-3">
          <h3 class="font-display font-bold text-sm text-slate-900">De dónde llegan los clientes</h3>
          <p class="text-[11px] text-slate-500 -mt-2">Citas y consultas del mes</p>
          ${barras([{ k: '📞 Laura (teléfono)', v: 38 }, { k: 'WhatsApp', v: 31 }, { k: 'Instagram', v: 17 }, { k: 'Mostrador', v: 14 }, { k: 'Web', v: 9 }], 'bg-carbon-800')}
        </div>
        <div class="${card} p-5 space-y-3">
          <h3 class="font-display font-bold text-sm text-slate-900">Embudo de venta de motos</h3>
          <p class="text-[11px] text-slate-500 -mt-2">Interesados del mes</p>
          ${barras([{ k: 'Interesados', v: 58 }, { k: 'Contactados', v: 49 }, { k: 'Prueba o visita', v: 21 }, { k: 'Oferta enviada', v: 12 }, { k: 'Vendidas', v: 7 }], 'bg-emerald-500')}
        </div>
      </div>`;
  }

  // ------------------------------------------------------------------ Taller
  let filtroTaller = null;
  function renderTaller() {
    const cols = ESTADOS.map(e => {
      const items = ordenes.filter(o => o.estado === e.id);
      const dim = filtroTaller && filtroTaller !== e.id ? ' opacity-40' : '';
      return `<div class="w-60 shrink-0 bg-slate-100/80 rounded-2xl p-2.5 border border-slate-200 space-y-2${dim}">
        <div class="flex items-center justify-between px-1 pt-0.5">
          <span class="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"><span class="w-2 h-2 rounded-full ${e.color}"></span>${e.nombre}</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">${items.length}</span>
        </div>
        <p class="text-[10px] text-slate-500 px-1 -mt-1">${e.desc}</p>
        ${items.map(o => tarjetaOrden(o)).join('') || '<p class="text-[11px] text-slate-400 text-center py-6">Sin motos</p>'}
      </div>`;
    }).join('');

    $('#crm-taller').innerHTML = `
      <div class="${card} p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 class="font-display font-bold text-slate-900 text-sm">Órdenes de reparación</h3>
          <p class="text-[11px] text-slate-500">Pulsa una moto para ver su ficha. Cada cambio de estado avisa al cliente por WhatsApp.</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          ${filtroTaller ? `<button data-crm-filtro="" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs">Quitar filtro ✕</button>` : ''}
          <button data-crm-nueva-orden class="px-3 py-1.5 rounded-xl bg-moto-600 hover:bg-moto-700 text-white font-bold text-xs shadow">+ Nueva orden</button>
        </div>
      </div>
      <div class="overflow-x-auto custom-scroll pb-2 -mx-1 px-1"><div class="flex gap-3 min-w-max">${cols}</div></div>`;
  }

  function tarjetaOrden(o) {
    const c = cliente(o.cliente);
    const retraso = o.estado === 'aprobacion' ? '<span class="text-[10px] font-bold text-amber-700">Sin respuesta 4 h</span>' : `<span class="text-[10px] text-slate-400">${o.prometida}</span>`;
    return `<button data-crm-orden="${o.id}" class="w-full text-left bg-white p-3 rounded-xl border border-slate-200 card-shadow space-y-1.5 hover:border-moto-400 transition">
      <div class="flex items-center justify-between gap-2">${origenChip(o.origen)}<span class="text-[10px] font-mono text-slate-400">${o.id}</span></div>
      <p class="text-xs font-bold text-slate-900">${o.moto}</p>
      <p class="text-[11px] text-slate-500 leading-snug">${o.trabajos[0]}${o.trabajos.length > 1 ? ' +' + (o.trabajos.length - 1) : ''}</p>
      <div class="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10px] text-slate-500">
        <span>👤 ${c.nombre}${o.mecanico !== '—' ? ' · 🔧 ' + o.mecanico : ''}</span>${retraso}
      </div>
    </button>`;
  }

  function abrirOrden(id) {
    const o = ordenes.find(x => x.id === id);
    if (!o) return;
    const c = cliente(o.cliente);
    const idx = estadoIdx(o.estado);
    const siguiente = ESTADOS[idx + 1];
    const pasos = ESTADOS.map((e, i) => `<div class="flex-1 min-w-0">
        <div class="h-1.5 rounded-full ${i <= idx ? e.color : 'bg-slate-200'}"></div>
        <p class="text-[9px] mt-1 leading-tight ${i === idx ? 'font-bold text-slate-900' : 'text-slate-400'}">${e.nombre}</p></div>`).join('');

    let accion;
    if (o.estado === 'aprobacion') accion = `<button data-crm-aprobar="${o.id}" class="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm">✅ Simular "OK" del cliente por WhatsApp</button>`;
    else if (o.estado === 'lista') accion = `<button data-crm-entregar="${o.id}" class="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm">🏁 Entregar y cobrar</button>`;
    else accion = `<button data-crm-avanzar="${o.id}" class="flex-1 py-3 rounded-xl bg-carbon-900 hover:bg-carbon-800 text-white font-bold text-sm">Pasar a «${siguiente.nombre}» →</button>`;

    $('#crmDrawerBody').innerHTML = `
      <div class="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 px-5 py-4 flex items-start justify-between gap-3 z-10">
        <div>
          <p class="text-[10px] font-mono text-slate-400">${o.id} · entrada ${o.entrada}</p>
          <h3 id="crmDrawerTitle" class="font-display font-bold text-lg text-slate-900 leading-tight">${o.moto}</h3>
          <p class="text-xs text-slate-500">${o.matricula} · ${o.km ? miles(o.km) + ' km' : 'uso en campo'} · ${origenChip(o.origen)}</p>
        </div>
        <button data-crm-close class="w-9 h-9 shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold" aria-label="Cerrar">✕</button>
      </div>
      <div class="p-5 space-y-5">
        <div class="flex gap-1">${pasos}</div>

        <div class="grid grid-cols-2 gap-2 text-xs">
          <button data-crm-cliente="${c.id}" class="text-left p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-moto-400"><p class="text-[10px] uppercase font-bold text-slate-500">Cliente</p><p class="font-bold text-slate-900">${c.nombre} →</p><p class="text-slate-500">${c.tel}</p></button>
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200"><p class="text-[10px] uppercase font-bold text-slate-500">Mecánico y puesto</p><p class="font-bold text-slate-900">${o.mecanico}</p><p class="text-slate-500">${o.elevador}</p></div>
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200"><p class="text-[10px] uppercase font-bold text-slate-500">Prometida para</p><p class="font-bold text-slate-900">${o.prometida}</p></div>
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200"><p class="text-[10px] uppercase font-bold text-slate-500">Recepción</p><p class="text-slate-700">📸 ${o.recepcion.fotos} fotos · ⛽ ${o.recepcion.combustible}</p><p class="text-slate-500">${o.recepcion.danos}</p></div>
        </div>

        <div class="space-y-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">Trabajos</h4>
          ${o.trabajos.map(t => `<div class="flex items-start gap-2 text-sm text-slate-800"><span class="text-moto-600">●</span>${t}</div>`).join('')}
        </div>

        <div class="p-4 rounded-2xl border ${o.aprobado ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'} space-y-1">
          <div class="flex items-center justify-between gap-2">
            <h4 class="text-xs font-bold uppercase tracking-wider ${o.aprobado ? 'text-emerald-800' : 'text-amber-800'}">Presupuesto</h4>
            ${o.aprobado ? chip('Aprobado por WhatsApp', 'bg-emerald-200 text-emerald-900') : chip(o.presupuesto ? 'Pendiente de aprobación' : 'Pendiente de diagnóstico', 'bg-amber-200 text-amber-900')}
          </div>
          <p class="font-display text-2xl font-bold text-slate-900">${o.presupuesto ? '≈ ' + eur(o.presupuesto) : '—'}</p>
          <p class="text-[11px] text-slate-600">Importe orientativo con IVA. El precio final se confirma con las piezas montadas.</p>
        </div>

        ${o.recambios.length ? `<div class="space-y-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">Recambios</h4>
          ${o.recambios.map(r => `<div class="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-200 text-sm"><span class="text-slate-800">${r.pieza}</span>${chip(r.estado, r.estado === 'Llega mañana' ? 'bg-orange-100 text-orange-800' : r.estado === 'Montado' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700')}</div>`).join('')}
        </div>` : ''}

        <div class="space-y-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">Seguimiento</h4>
          <ol class="relative border-l-2 border-slate-200 ml-1.5 space-y-3">
            ${o.timeline.map(t => `<li class="pl-4 relative"><span class="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-moto-500 border-2 border-white"></span><p class="text-[10px] font-mono text-slate-400">${t.hora}</p><p class="text-sm text-slate-800">${t.texto}</p></li>`).join('')}
          </ol>
        </div>

        <div class="flex flex-col sm:flex-row gap-2 pt-1">
          ${accion}
          <button data-crm-wa="${c.nombre}" class="sm:w-auto py-3 px-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 text-slate-800 font-bold text-sm">💬 WhatsApp</button>
        </div>
      </div>`;
    $('#crmDrawer').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
  function cerrarOrden() {
    $('#crmDrawer').classList.add('hidden');
    document.body.style.overflow = '';
  }
  const ahora = () => {
    const d = new Date();
    return `14/10 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  function avanzar(id) {
    const o = ordenes.find(x => x.id === id);
    const sig = ESTADOS[estadoIdx(o.estado) + 1];
    if (!sig) return;
    if (o.estado === 'recepcion' && o.mecanico === '—') { o.mecanico = MECANICOS[0]; o.elevador = 'Elevador 2'; }
    if (o.estado === 'diagnostico' && !o.presupuesto) { o.presupuesto = 140; o.trabajos.push('Limpieza de carburación y cambio de bujía'); }
    o.estado = sig.id;
    if (sig.id === 'lista') o.elevador = '—';
    const aviso = { aprobacion: 'Presupuesto enviado por WhatsApp.', lista: 'Aviso de recogida enviado por WhatsApp.' }[sig.id];
    o.timeline.unshift({ hora: ahora(), texto: `Pasa a «${sig.nombre}».${aviso ? ' ' + aviso : ' Cliente avisado por WhatsApp.'}` });
    toast(`${o.moto}: ${sig.nombre}. Cliente avisado por WhatsApp.`);
    render();
    abrirOrden(id);
  }
  function aprobar(id) {
    const o = ordenes.find(x => x.id === id);
    o.aprobado = true;
    const faltan = o.recambios.some(r => r.estado !== 'En stock' && r.estado !== 'Montado');
    o.estado = faltan ? 'recambios' : 'elevador';
    if (o.elevador === '—') o.elevador = 'Elevador 2';
    o.timeline.unshift({ hora: ahora(), texto: 'El cliente responde "OK" por WhatsApp. Presupuesto aprobado.' });
    toast('Presupuesto aprobado: la moto entra en el elevador.');
    render();
    abrirOrden(id);
  }
  function entregar(id) {
    const o = ordenes.find(x => x.id === id);
    const c = cliente(o.cliente);
    ordenes = ordenes.filter(x => x.id !== id);
    stats.entregadasMes += 1;
    stats.facturacionMes += o.presupuesto;
    c.gasto += o.presupuesto;
    c.visitas += 1;
    c.historial.unshift({ fecha: '14/10/2026', tipo: 'Taller', texto: o.trabajos.join(' + ') + '.', importe: o.presupuesto });
    cerrarOrden();
    toast(`Entregada a ${c.nombre}. Factura enviada y valoración programada para dentro de 2 días.`);
    render();
  }
  function nuevaOrden() {
    const n = ordenes.length ? Math.max(...ordenes.map(o => +o.id.split('-')[1])) + 1 : 1042;
    ordenes.unshift({ id: 'OR-' + n, cliente: 'c6', moto: 'Royal Enfield Hunter 350', matricula: '2468 LDR', km: 11850, origen: 'Mostrador', estado: 'recepcion',
      trabajos: ['Revisión de luces y batería'], presupuesto: 60, aprobado: false, recambios: [], elevador: '—', mecanico: '—',
      entrada: 'Ahora', prometida: 'Hoy 19:00', recepcion: { fotos: 4, combustible: '½ depósito', danos: 'Sin daños previos' },
      timeline: [{ hora: ahora(), texto: 'Orden creada en mostrador. Fotos de recepción guardadas.' }] });
    filtroTaller = null;
    toast('Nueva orden creada. El cliente recibe el resguardo por WhatsApp.');
    render();
  }

  // ------------------------------------------------------------------ Clientes
  let clienteSel = 'c1';
  let busqueda = '';
  function renderClientes() {
    const q = busqueda.trim().toLowerCase();
    const lista = clientes.filter(c => !q || (c.nombre + ' ' + c.motos.map(m => m.modelo + ' ' + m.matricula).join(' ')).toLowerCase().includes(q));
    const c = cliente(clienteSel);
    const enTaller = ordenes.filter(o => o.cliente === c.id);

    $('#crm-clientes').innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div class="lg:col-span-4 ${card} p-3 space-y-2 lg:max-h-[760px] lg:overflow-y-auto custom-scroll">
          <input id="crmBuscar" type="search" value="${busqueda.replace(/"/g, '&quot;')}" placeholder="Buscar por nombre, moto o matrícula…" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-moto-500">
          <p class="text-[11px] text-slate-500 px-1">${lista.length} cliente${lista.length === 1 ? '' : 's'}</p>
          <div class="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible custom-scroll pb-1">
          ${lista.map(x => `<button data-crm-cliente="${x.id}" class="shrink-0 w-56 lg:w-full text-left p-3 rounded-xl border transition ${x.id === clienteSel ? 'border-moto-500 bg-orange-50/60' : 'border-slate-200 hover:border-moto-300'}">
            <div class="flex items-center gap-2.5">
              <span class="w-9 h-9 rounded-full bg-carbon-900 text-moto-400 font-bold text-xs flex items-center justify-center shrink-0">${iniciales(x.nombre)}</span>
              <div class="min-w-0"><p class="text-sm font-bold text-slate-900 truncate">${x.nombre}</p><p class="text-[11px] text-slate-500 truncate">${x.motos.map(m => m.modelo).join(' · ')}</p></div>
            </div>
            ${ordenes.some(o => o.cliente === x.id) ? '<p class="mt-2">' + chip('🔧 Moto en el taller', 'bg-moto-100 text-moto-800') + '</p>' : ''}
          </button>`).join('') || '<p class="text-sm text-slate-400 p-4">Sin resultados</p>'}
          </div>
        </div>

        <div class="lg:col-span-8 space-y-4">
          <div class="${card} p-5 space-y-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <span class="w-12 h-12 rounded-full bg-carbon-900 text-moto-400 font-bold flex items-center justify-center">${iniciales(c.nombre)}</span>
                <div><h3 class="font-display font-bold text-lg text-slate-900">${c.nombre}</h3><p class="text-xs text-slate-500">📱 ${c.tel} · cliente desde ${c.desde} · llegó por ${c.canal}</p></div>
              </div>
              <div class="flex flex-wrap gap-1.5">${c.etiquetas.map(e => chip(e, 'bg-slate-100 text-slate-700')).join('')}</div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button data-crm-wa="${c.nombre}" class="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">💬 WhatsApp</button>
              <button data-crm-cita="${c.nombre}" class="px-3 py-2 rounded-xl bg-carbon-900 hover:bg-carbon-800 text-white font-bold text-xs">📅 Nueva cita</button>
              <button data-crm-recordar="${c.id}" class="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-moto-400 text-slate-800 font-bold text-xs">🔔 Programar recordatorio</button>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-100"><p class="text-[10px] uppercase font-bold text-slate-500">Gasto total</p><p class="font-bold text-slate-900">≈ ${eur(c.gasto)}</p></div>
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-100"><p class="text-[10px] uppercase font-bold text-slate-500">Visitas</p><p class="font-bold text-slate-900">${c.visitas}</p></div>
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-100"><p class="text-[10px] uppercase font-bold text-slate-500">Última visita</p><p class="font-bold text-slate-900">${c.historial[0] ? c.historial[0].fecha : '—'}</p></div>
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-100"><p class="text-[10px] uppercase font-bold text-slate-500">En el taller</p><p class="font-bold text-slate-900">${enTaller.length ? enTaller.map(o => ESTADOS[estadoIdx(o.estado)].nombre).join(', ') : 'No'}</p></div>
            </div>
          </div>

          <div class="${card} p-5 space-y-3">
            <h4 class="font-display font-bold text-sm text-slate-900">🏍️ Su garaje</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${c.motos.map(m => `<div class="p-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-orange-50/40 space-y-2">
                <div class="flex items-center justify-between gap-2"><p class="font-bold text-slate-900 text-sm">${m.modelo}</p><span class="text-[10px] text-slate-500">${m.anio}</span></div>
                <p class="text-xs text-slate-500">${m.matricula} · ${m.km ? miles(m.km) + ' km' : 'por horas'}</p>
                <div class="p-2 rounded-lg ${m.proximaFecha === 'ahora' ? 'bg-amber-100 text-amber-900' : 'bg-white text-slate-700'} border border-slate-100 text-[11px]">🔔 Próximo: <strong>${m.proxima}</strong> · ${m.proximaFecha}</div>
              </div>`).join('')}
            </div>
          </div>

          <div class="${card} p-5 space-y-3">
            <h4 class="font-display font-bold text-sm text-slate-900">Historial</h4>
            <ol class="relative border-l-2 border-slate-200 ml-1.5 space-y-3">
              ${c.historial.map(h => `<li class="pl-4 relative">
                <span class="absolute -left-[7px] top-1 w-3 h-3 rounded-full ${h.tipo === 'Venta' ? 'bg-emerald-500' : h.tipo === 'Cita' ? 'bg-sky-500' : h.tipo === 'Tienda' ? 'bg-purple-500' : 'bg-moto-500'} border-2 border-white"></span>
                <div class="flex flex-wrap items-center gap-2"><span class="text-[10px] font-mono text-slate-400">${h.fecha}</span>${chip(h.tipo, 'bg-slate-100 text-slate-600')}${h.importe ? '<span class="text-[11px] font-bold text-slate-700">≈ ' + eur(h.importe) + '</span>' : ''}</div>
                <p class="text-sm text-slate-800">${h.texto}</p></li>`).join('')}
            </ol>
          </div>
        </div>
      </div>`;

    const input = $('#crmBuscar');
    input.addEventListener('input', e => {
      busqueda = e.target.value;
      const pos = e.target.selectionStart;
      renderClientes();
      const again = $('#crmBuscar');
      again.focus();
      again.setSelectionRange(pos, pos);
    });
  }

  // ------------------------------------------------------------------ Ventas
  function renderVentas() {
    const cols = ETAPAS_VENTA.map((e, i) => {
      const items = leads.filter(l => l.etapa === e.id);
      return `<div class="w-64 shrink-0 bg-slate-100/80 rounded-2xl p-2.5 border border-slate-200 space-y-2">
        <div class="flex items-center justify-between px-1"><span class="text-[11px] font-bold text-slate-700 uppercase tracking-wider">${e.nombre}</span><span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">${items.length}</span></div>
        ${items.map(l => `<div class="bg-white p-3 rounded-xl border ${e.id === 'vendida' ? 'border-emerald-200' : 'border-slate-200'} card-shadow space-y-1.5">
          <div class="flex items-center justify-between gap-2">${origenChip(l.origen)}<span class="text-[10px] text-slate-400">Carnet ${l.carnet}</span></div>
          <p class="text-xs font-bold text-slate-900">${l.nombre}</p>
          <p class="text-[11px] text-slate-700">${l.modelo}</p>
          <p class="text-[11px] text-slate-500">Presupuesto: ${l.presupuesto} (orientativo)</p>
          <p class="text-[11px] text-slate-500 italic">${l.nota}</p>
          ${i < ETAPAS_VENTA.length - 1 ? `<button data-crm-lead="${l.id}" class="w-full mt-1 py-1.5 rounded-lg bg-slate-900 hover:bg-carbon-800 text-white text-[11px] font-bold">Mover a «${ETAPAS_VENTA[i + 1].nombre}» →</button>` : '<p class="text-[11px] font-bold text-emerald-700">✓ Ahora es cliente del taller</p>'}
        </div>`).join('') || '<p class="text-[11px] text-slate-400 text-center py-6">—</p>'}
      </div>`;
    }).join('');
    $('#crm-ventas').innerHTML = `
      <div class="${card} p-4 flex flex-wrap items-center justify-between gap-3">
        <div><h3 class="font-display font-bold text-slate-900 text-sm">Interesados en comprar moto</h3>
        <p class="text-[11px] text-slate-500">Laura, WhatsApp e Instagram cualifican: tipo de moto, carnet y presupuesto. Tú solo haces el seguimiento.</p></div>
        <div class="flex gap-2 text-center">
          <div class="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200"><p class="text-[10px] uppercase font-bold text-slate-500">Abiertos</p><p class="font-bold text-slate-900 text-sm">${leads.filter(l => l.etapa !== 'vendida').length}</p></div>
          <div class="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200"><p class="text-[10px] uppercase font-bold text-emerald-700">Vendidas (mes)</p><p class="font-bold text-emerald-900 text-sm">${stats.ventasMes}</p></div>
        </div>
      </div>
      <div class="overflow-x-auto custom-scroll pb-2 -mx-1 px-1"><div class="flex gap-3 min-w-max">${cols}</div></div>`;
  }
  function moverLead(id) {
    const l = leads.find(x => x.id === id);
    const i = ETAPAS_VENTA.findIndex(e => e.id === l.etapa);
    const sig = ETAPAS_VENTA[i + 1];
    l.etapa = sig.id;
    if (sig.id === 'vendida') { stats.ventasMes += 1; l.nota = 'Venta cerrada. Se crea su ficha de cliente y la revisión de rodaje.'; }
    toast(`${l.nombre}: ${sig.nombre}.`);
    render();
  }

  // ------------------------------------------------------------------ Agenda
  function renderAgenda() {
    const tipos = { taller: 'bg-orange-50 border-orange-200 text-orange-950', laura: 'bg-moto-100 border-moto-300 text-moto-950', recordatorio: 'bg-sky-50 border-sky-200 text-sky-950', venta: 'bg-emerald-50 border-emerald-200 text-emerald-950' };
    const celdas = (dia, el) => ['Mañana', 'Tarde'].map(turno => {
      const c = AGENDA.citas.find(x => x.dia === dia && x.el === el && x.turno === turno);
      return c
        ? `<div class="p-1.5 rounded-lg border text-[10px] leading-tight ${tipos[c.tipo]}">${c.tipo === 'laura' ? '📞 ' : c.tipo === 'recordatorio' ? '🔔 ' : c.tipo === 'venta' ? '🏍️ ' : ''}${c.texto}</div>`
        : `<button data-crm-hueco="${AGENDA.dias[dia]} · ${AGENDA.elevadores[el]} · ${turno}" class="w-full p-1.5 rounded-lg border border-dashed border-slate-200 text-[10px] text-slate-400 hover:border-moto-400 hover:text-moto-700">Libre · ${turno.toLowerCase()}</button>`;
    }).join('');
    const libres = AGENDA.dias.length * AGENDA.elevadores.length * 2 - AGENDA.citas.length;

    $('#crm-agenda').innerHTML = `
      <div class="${card} p-4 flex flex-wrap items-center justify-between gap-3">
        <div><h3 class="font-display font-bold text-slate-900 text-sm">Agenda del taller · semana 42</h3>
        <p class="text-[11px] text-slate-500">Las citas que coge Laura por teléfono aparecen aquí solas. Pulsa un hueco libre para ofrecerlo por WhatsApp.</p></div>
        <div class="flex flex-wrap gap-1.5 text-[10px] font-bold">
          <span class="px-2 py-1 rounded-full bg-moto-100 text-moto-900">📞 Cita de Laura</span>
          <span class="px-2 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-900">Taller</span>
          <span class="px-2 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-900">🔔 De un recordatorio</span>
          <span class="px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900">🏍️ Prueba de moto</span>
          <span class="px-2 py-1 rounded-full bg-slate-100 text-slate-700">${libres} huecos libres</span>
        </div>
      </div>
      <div class="${card} p-3 overflow-x-auto custom-scroll">
        <table class="w-full min-w-[760px] border-separate border-spacing-1.5">
          <thead><tr><th class="w-24"></th>${AGENDA.dias.map((d, i) => `<th class="text-xs font-bold ${i === AGENDA.hoy ? 'text-moto-700' : 'text-slate-600'}">${d}${i === AGENDA.hoy ? ' · hoy' : ''}</th>`).join('')}</tr></thead>
          <tbody>${AGENDA.elevadores.map((el, ei) => `<tr><th class="text-left text-[11px] font-bold text-slate-700 align-top pt-2">${el}</th>${AGENDA.dias.map((_, di) => `<td class="align-top space-y-1 ${di === AGENDA.hoy ? 'bg-orange-50/50 rounded-lg' : ''}">${celdas(di, ei)}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>`;
  }

  // ------------------------------------------------------------------ Recordatorios
  function renderRecordatorios() {
    const estadoCls = { 'Cita reservada': 'bg-emerald-100 text-emerald-800', Enviado: 'bg-sky-100 text-sky-800', Programado: 'bg-slate-100 text-slate-700' };
    $('#crm-recordatorios').innerHTML = `
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${kpi('Enviados este mes', '46', 'Por WhatsApp, sin tocar nada')}
        ${kpi('Convertidos en cita', '19', '41 % de los enviados')}
        ${kpi('Facturado gracias a ellos', '≈ 3.900 €', 'Orientativo')}
        ${kpi('Reseñas nuevas en Google', '12', 'Valoración media 4,8 ★')}
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div class="lg:col-span-3 ${card} p-5 space-y-3">
          <h3 class="font-display font-bold text-sm text-slate-900">Próximos recordatorios</h3>
          ${recordatorios.map(r => {
            const c = cliente(r.cliente);
            return `<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-slate-200">
              <div class="min-w-0"><p class="text-sm font-bold text-slate-900">${r.tipo} · ${r.moto}</p><p class="text-[11px] text-slate-500">${c.nombre} · ${r.cuando}</p></div>
              <div class="flex items-center gap-2 shrink-0">${chip(r.estado, estadoCls[r.estado])}
                ${r.estado === 'Programado' ? `<button data-crm-enviar="${r.id}" class="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold">Enviar ahora</button>` : ''}</div>
            </div>`;
          }).join('')}
        </div>
        <div class="lg:col-span-2 space-y-4">
          <div class="${card} p-5 space-y-3">
            <h3 class="font-display font-bold text-sm text-slate-900">Automatizaciones</h3>
            ${reglas.map(rg => `<label class="flex items-start justify-between gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer">
              <span><span class="block text-sm font-bold text-slate-900">${rg.nombre}</span><span class="block text-[11px] text-slate-500">${rg.detalle}</span></span>
              <input type="checkbox" data-crm-regla="${rg.id}" ${rg.activa ? 'checked' : ''} class="mt-1 w-5 h-5 shrink-0" style="accent-color:#ea580c">
            </label>`).join('')}
          </div>
          <div class="rounded-2xl p-4 bg-[#efeae2] border border-slate-200 space-y-2">
            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Así le llega al cliente</p>
            <div class="bg-white rounded-2xl rounded-tl-none p-3 text-xs text-slate-800 shadow-sm max-w-[90%]">
              ¡Hola, Elena! 🏍️ A tu Royal Enfield Hunter le toca la <strong>revisión anual</strong>. Tenemos hueco el viernes por la mañana o el lunes por la tarde. ¿Te reservo uno?<br><span class="text-[10px] text-slate-400">Motor Gas Bike · 10:02</span>
            </div>
            <div class="bg-[#d9fdd3] rounded-2xl rounded-tr-none p-3 text-xs text-slate-800 shadow-sm max-w-[70%] ml-auto">El viernes perfecto 👍</div>
          </div>
        </div>
      </div>`;
  }

  // ------------------------------------------------------------------ Eventos
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-crm-tab],[data-crm-go],[data-crm-orden],[data-crm-close],[data-crm-avanzar],[data-crm-aprobar],[data-crm-entregar],[data-crm-cliente],[data-crm-filtro],[data-crm-nueva-orden],[data-crm-lead],[data-crm-wa],[data-crm-cita],[data-crm-recordar],[data-crm-hueco],[data-crm-enviar]');
    if (!t || !t.closest('#view-crm, #crmDrawer')) return;
    const d = t.dataset;
    if (d.crmTab) return mostrar(d.crmTab);
    if (d.crmGo) { filtroTaller = d.filtro || null; return mostrar(d.crmGo); }
    if ('crmClose' in d) return cerrarOrden();
    if (d.crmOrden) return abrirOrden(d.crmOrden);
    if (d.crmAvanzar) return avanzar(d.crmAvanzar);
    if (d.crmAprobar) return aprobar(d.crmAprobar);
    if (d.crmEntregar) return entregar(d.crmEntregar);
    if (d.crmCliente) { clienteSel = d.crmCliente; busqueda = ''; cerrarOrden(); return mostrar('clientes'); }
    if ('crmFiltro' in d) { filtroTaller = d.crmFiltro || null; return render(); }
    if ('crmNuevaOrden' in d) return nuevaOrden();
    if (d.crmLead) return moverLead(d.crmLead);
    if (d.crmWa) return toast(`Se abre el chat de WhatsApp con ${d.crmWa} (en la demo no se envía nada).`);
    if (d.crmCita) return toast(`Elige hueco en la agenda para ${d.crmCita}.`);
    if (d.crmRecordar) {
      const c = cliente(d.crmRecordar);
      recordatorios.unshift({ id: 'r' + Date.now(), cliente: c.id, moto: c.motos[0].modelo, tipo: c.motos[0].proxima, cuando: 'Programado ahora', estado: 'Programado' });
      return toast(`Recordatorio de «${c.motos[0].proxima}» programado para ${c.nombre}.`);
    }
    if (d.crmHueco) return toast(`Hueco ${d.crmHueco} ofrecido por WhatsApp a los clientes con revisión pendiente.`);
    if (d.crmEnviar) {
      const r = recordatorios.find(x => x.id === d.crmEnviar);
      r.estado = 'Enviado'; r.cuando = 'Ahora mismo';
      toast(`Recordatorio enviado a ${cliente(r.cliente).nombre} por WhatsApp.`);
      return render();
    }
  });
  document.addEventListener('change', e => {
    const id = e.target.dataset && e.target.dataset.crmRegla;
    if (!id) return;
    const rg = reglas.find(r => r.id === id);
    rg.activa = e.target.checked;
    toast(`Automatización «${rg.nombre}» ${rg.activa ? 'activada' : 'desactivada'}.`);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#crmDrawer').classList.contains('hidden')) cerrarOrden();
  });

  function init() {
    if (!$('#crm-resumen')) return;
    // El panel lateral y el aviso cuelgan del body para quedar siempre por encima de la cabecera fija.
    document.body.appendChild($('#crmDrawer'));
    document.body.appendChild($('#crmToast'));
    mostrar('resumen');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
