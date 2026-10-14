/*
 * Izon Consulting · CRM inmobiliario para la dirección y el equipo comercial (demo).
 * Todo funciona en el navegador con datos de ejemplo: nombres genéricos e importes orientativos.
 * Tres vistas: Dueño (panel, agenda del equipo, compradores, conversaciones, equipo comercial, propietarios e inmuebles),
 * Comercial («Mi día») y Propietario que vende (portal con visitas, opiniones, informe semanal y ofertas).
 * Flujo principal: alerta «compradores en duda» → ficha → WhatsApp con huecos → el cliente elige → visita en la agenda.
 */
(function () {
  'use strict';

  // ------------------------------------------------------------------ Datos de ejemplo
  const COMERCIALES = [
    { id: 'lucia', nombre: 'Lucía', color: 'bg-sky-500', text: 'text-sky-300', soft: 'bg-sky-500/15 border-sky-500/40' },
    { id: 'antonio', nombre: 'Antonio', color: 'bg-amber-500', text: 'text-amber-300', soft: 'bg-amber-500/15 border-amber-500/40' },
    { id: 'marta', nombre: 'Marta', color: 'bg-emerald-500', text: 'text-emerald-300', soft: 'bg-emerald-500/15 border-emerald-500/40' },
    { id: 'pablo', nombre: 'Pablo', color: 'bg-violet-500', text: 'text-violet-300', soft: 'bg-violet-500/15 border-violet-500/40' }
  ];
  const com = id => COMERCIALES.find(c => c.id === id);

  const ETAPAS = [
    { id: 'nuevo', nombre: 'Nuevo', color: 'bg-slate-400', desc: 'Acaba de entrar, sin cualificar' },
    { id: 'cualificado', nombre: 'Cualificado', color: 'bg-sky-500', desc: 'Presupuesto y financiación conocidos' },
    { id: 'visita', nombre: 'Visita agendada', color: 'bg-indigo-500', desc: 'Tiene día y hora' },
    { id: 'visitado', nombre: 'Visitado', color: 'bg-cyan-500', desc: 'Ha visto el inmueble' },
    { id: 'duda', nombre: 'En duda', color: 'bg-amber-500', desc: 'Le gusta, pero algo le frena' },
    { id: 'oferta', nombre: 'Oferta', color: 'bg-orange-500', desc: 'Negociando precio' },
    { id: 'arras', nombre: 'Arras', color: 'bg-emerald-500', desc: 'Contrato de arras firmado' },
    { id: 'vendido', nombre: 'Escriturado', color: 'bg-brand-gold', desc: 'Operación cerrada' }
  ];
  const etapa = id => ETAPAS.find(e => e.id === id);

  const INMUEBLES = [
    { id: 'i1', enMensaje: 'el piso de Villacerrada', ref: 'IZ-218', titulo: 'Piso 4 hab · Villacerrada', zona: 'Villacerrada / Centro', precio: 218000, m2: 165, comercial: 'lucia', exclusiva: true, dias: 23, visitas: 9, interesados: 5, mercado: -14, propietario: 'p1' },
    { id: 'i2', enMensaje: 'el piso junto al Rosario', ref: 'IZ-190', titulo: 'Piso 3 hab · junto al Rosario', zona: 'Ensanche', precio: 190000, m2: 111, comercial: 'antonio', exclusiva: true, dias: 12, visitas: 7, interesados: 4, mercado: -3, propietario: 'p2' },
    { id: 'i3', enMensaje: 'la vivienda de Industria', ref: 'IZ-211', titulo: 'Vivienda 4 hab · Industria', zona: 'Industria - Catedral', precio: 211000, m2: 140, comercial: 'marta', exclusiva: false, dias: 41, visitas: 6, interesados: 2, mercado: -7, propietario: 'p3' },
    { id: 'i4', enMensaje: 'el chalet de la carretera de Jaén', ref: 'IZ-300', titulo: 'Chalet con parcela · Ctra. de Jaén', zona: 'Carretera de Jaén', precio: 300000, m2: 280, comercial: 'pablo', exclusiva: true, dias: 34, visitas: 5, interesados: 3, mercado: -9, propietario: 'p4' },
    { id: 'i5', enMensaje: 'el ático del Ensanche', ref: 'IZ-380', titulo: 'Ático con terraza · Ensanche', zona: 'Ensanche', precio: 380000, m2: 190, comercial: 'lucia', exclusiva: true, dias: 18, visitas: 4, interesados: 2, mercado: -4, propietario: 'p5' },
    { id: 'i6', enMensaje: 'el adosado de Medicina', ref: 'IZ-595', titulo: 'Adosado con piscina · Medicina', zona: 'Campus - Medicina', precio: 595000, m2: 320, comercial: 'antonio', exclusiva: false, dias: 77, visitas: 2, interesados: 0, mercado: 11, propietario: 'p6' },
    { id: 'i7', enMensaje: 'el piso de Feria', ref: 'IZ-145', titulo: 'Piso 2 hab · Feria', zona: 'Feria', precio: 145000, m2: 82, comercial: 'marta', exclusiva: true, dias: 6, visitas: 5, interesados: 3, mercado: -5, propietario: 'p7' },
    { id: 'i8', enMensaje: 'el piso de alquiler en Fátima', ref: 'IZ-ALQ', titulo: 'Piso 3 hab en alquiler · Fátima', zona: 'Fátima', precio: 850, m2: 95, comercial: 'pablo', exclusiva: false, dias: 9, visitas: 6, interesados: 4, mercado: 0, propietario: 'p8', alquiler: true }
  ];
  const inm = id => INMUEBLES.find(i => i.id === id);

  // dias = días desde el último contacto. horas solo para los nuevos sin atender.
  const compradores = [
    { id: 'b1', nombre: 'Elena R.', tel: '6XX XX 12 48', origen: 'Laura (teléfono)', comercial: 'lucia', etapa: 'duda', inmueble: 'i1', busca: '4 hab · Centro · hasta 230.000 €', pago: 'Hipoteca preaprobada', temp: 'Templado', dias: 5,
      duda: 'Le preocupa el coste de reformar la cocina y el baño.',
      gancho: 'le he pedido a un reformista un presupuesto orientativo de la cocina y el baño: unos 14.000 €',
      historial: [
        { fecha: '09/10', canal: 'Visita', texto: 'Visita con Lucía. Le encanta la luz y la zona; pide pensarlo por la reforma.' },
        { fecha: '06/10', canal: 'Laura', texto: 'Llama a las 21:40. Laura cualifica: hipoteca preaprobada, quiere 4 hab en el centro. Agenda visita con Lucía.' }
      ],
      resumenLaura: 'Pareja con dos hijos. Busca 4 dormitorios en el centro, hasta 230.000 €. Hipoteca preaprobada con su banco. Quiere mudarse antes del verano.' },
    { id: 'b2', nombre: 'Jorge y Ana M.', tel: '6XX XX 77 03', origen: 'Idealista', comercial: 'antonio', etapa: 'duda', inmueble: 'i2', busca: '3 hab · Ensanche · hasta 200.000 €', pago: 'Necesita hipoteca', temp: 'Caliente', dias: 4,
      duda: 'No saben si el banco les financiará el 90 %.',
      gancho: 'nuestro asesor hipotecario puede estudiar su caso sin compromiso y darles respuesta en 48 h',
      historial: [
        { fecha: '10/10', canal: 'Visita', texto: 'Segunda visita con Antonio. Les encaja todo; dudan con la financiación.' },
        { fecha: '03/10', canal: 'WhatsApp', texto: 'Escriben desde el anuncio de Idealista. El asistente les manda planos y agenda la primera visita.' }
      ] },
    { id: 'b3', nombre: 'Raúl P.', tel: '6XX XX 30 91', origen: 'WhatsApp', comercial: 'pablo', etapa: 'duda', inmueble: 'i4', busca: 'Chalet · zona sur · hasta 320.000 €', pago: 'Contado (venta de su piso)', temp: 'Templado', dias: 8,
      duda: 'Necesita vender antes su piso actual.',
      gancho: 'podemos valorar su piso esta semana y ponerlo a la venta con nosotros, así coordinamos las dos operaciones',
      historial: [
        { fecha: '06/10', canal: 'Visita', texto: 'Visita al chalet con Pablo. Le gusta mucho; depende de vender su piso.' },
        { fecha: '01/10', canal: 'WhatsApp', texto: 'Pregunta por chalets con parcela. El asistente le propone dos y agenda visita.' }
      ] },
    { id: 'b4', nombre: 'Cliente Idealista (sin nombre)', tel: '6XX XX 55 20', origen: 'Idealista', comercial: null, etapa: 'nuevo', inmueble: 'i5', busca: 'Pregunta por el ático del Ensanche', pago: '—', temp: 'Sin cualificar', dias: 1, horas: 31,
      historial: [{ fecha: '13/10', canal: 'Idealista', texto: 'Consulta desde el portal a las 00:12: «¿Sigue disponible el ático? ¿Admite mascotas?». Sin respuesta todavía.' }] },
    { id: 'b5', nombre: 'Silvia T.', tel: '6XX XX 18 64', origen: 'Fotocasa', comercial: null, etapa: 'nuevo', inmueble: 'i7', busca: 'Piso 2 hab · Feria', pago: '—', temp: 'Sin cualificar', dias: 1, horas: 27,
      historial: [{ fecha: '13/10', canal: 'Fotocasa', texto: 'Formulario de Fotocasa: pide visita para el piso de Feria. Sin respuesta todavía.' }] },
    { id: 'b6', nombre: 'Héctor L.', tel: '6XX XX 41 77', origen: 'Laura (teléfono)', comercial: 'marta', etapa: 'cualificado', inmueble: 'i3', busca: '4 hab · Industria o Feria · hasta 215.000 €', pago: 'Hipoteca preaprobada', temp: 'Caliente', dias: 1,
      historial: [{ fecha: '13/10', canal: 'Laura', texto: 'Llama el domingo. Laura cualifica y le envía la ficha por WhatsApp. Pendiente de proponer visita.' }],
      resumenLaura: 'Trabaja en el hospital, busca cerca. 4 dormitorios, hasta 215.000 €. Hipoteca preaprobada. Puede visitar por las tardes.' },
    { id: 'b7', nombre: 'Nuria G.', tel: '6XX XX 92 15', origen: 'Instagram', comercial: 'lucia', etapa: 'cualificado', inmueble: 'i5', busca: 'Ático · Centro o Ensanche · hasta 400.000 €', pago: 'Contado', temp: 'Caliente', dias: 2,
      historial: [{ fecha: '12/10', canal: 'Instagram', texto: 'Escribe tras ver el reel del ático. El asistente le pasa a WhatsApp y toma sus datos.' }] },
    { id: 'b8', nombre: 'Sonia y Marcos O.', tel: '6XX XX 63 38', origen: 'Web', comercial: 'pablo', etapa: 'cualificado', inmueble: 'i8', busca: 'Alquiler 3 hab · hasta 900 €/mes', pago: 'Nómina + aval', temp: 'Templado', dias: 3,
      historial: [{ fecha: '11/10', canal: 'Web', texto: 'Formulario web. Pablo les llama y les pide documentación.' }] },
    { id: 'b9', nombre: 'Marcos D.', tel: '6XX XX 27 50', origen: 'WhatsApp', comercial: 'antonio', etapa: 'visita', inmueble: 'i2', busca: '3 hab · Ensanche', pago: 'Hipoteca preaprobada', temp: 'Caliente', dias: 0,
      historial: [{ fecha: '14/10', canal: 'WhatsApp', texto: 'El asistente agenda visita el jueves a las 17:30 con Antonio.' }] },
    { id: 'b10', nombre: 'Irene C.', tel: '6XX XX 84 06', origen: 'Laura (teléfono)', comercial: 'lucia', etapa: 'visita', inmueble: 'i1', busca: '4 hab · Centro', pago: 'Contado', temp: 'Caliente', dias: 1,
      historial: [{ fecha: '13/10', canal: 'Laura', texto: 'Laura agenda visita el viernes a las 10:00 con Lucía.' }],
      resumenLaura: 'Viene de Madrid por trabajo. Compra al contado. Quiere ver pisos grandes en el centro.' },
    { id: 'b11', nombre: 'Tomás V.', tel: '6XX XX 39 12', origen: 'Idealista', comercial: 'marta', etapa: 'visitado', inmueble: 'i7', busca: '2 hab · Feria', pago: 'Necesita hipoteca', temp: 'Templado', dias: 2, sinOpinion: true,
      historial: [{ fecha: '12/10', canal: 'Visita', texto: 'Visita con Marta. Falta apuntar qué le pareció.' }] },
    { id: 'b12', nombre: 'Patricia S.', tel: '6XX XX 70 43', origen: 'WhatsApp', comercial: 'pablo', etapa: 'visitado', inmueble: 'i4', busca: 'Chalet', pago: 'Hipoteca', temp: 'Templado', dias: 3, sinOpinion: true,
      historial: [{ fecha: '11/10', canal: 'Visita', texto: 'Visita con Pablo. Falta apuntar qué le pareció.' }] },
    { id: 'b13', nombre: 'Daniel y Rocío F.', tel: '6XX XX 16 89', origen: 'Laura (teléfono)', comercial: 'antonio', etapa: 'oferta', inmueble: 'i2', busca: '3 hab · Ensanche', pago: 'Hipoteca preaprobada', temp: 'Caliente', dias: 1, oferta: 182000,
      historial: [{ fecha: '13/10', canal: 'Oferta', texto: 'Ofrecen 182.000 €. Antonio lo traslada al propietario.' }] },
    { id: 'b14', nombre: 'Alberto N.', tel: '6XX XX 58 21', origen: 'Fotocasa', comercial: 'marta', etapa: 'arras', inmueble: 'i3', busca: '4 hab · Industria', pago: 'Hipoteca', temp: 'Cerrado', dias: 2,
      historial: [{ fecha: '12/10', canal: 'Arras', texto: 'Firma de arras por 205.000 €. Notaría prevista en noviembre.' }] },
    { id: 'b15', nombre: 'Carmen B.', tel: '6XX XX 25 67', origen: 'Laura (teléfono)', comercial: 'lucia', etapa: 'vendido', inmueble: 'i1', busca: 'Piso Centro', pago: 'Contado', temp: 'Cerrado', dias: 9,
      historial: [{ fecha: '05/10', canal: 'Notaría', texto: 'Escritura firmada.' }] },
    { id: 'b16', nombre: 'Óscar H.', tel: '6XX XX 49 30', origen: 'Instagram', comercial: 'marta', etapa: 'cualificado', inmueble: 'i7', busca: '2 hab · Feria o Centro · hasta 150.000 €', pago: 'Necesita hipoteca', temp: 'Templado', dias: 4,
      historial: [{ fecha: '10/10', canal: 'WhatsApp', texto: 'Marta le envía fichas. Pendiente de proponer visita.' }] }
  ];
  const comp = id => compradores.find(b => b.id === id);

  const propietarios = [
    { id: 'p1', nombre: 'Propietario A. (ejemplo)', inmueble: 'i1', estado: 'Exclusiva', vence: 64, ultimoInforme: 6 },
    { id: 'p2', nombre: 'Propietaria B. (ejemplo)', inmueble: 'i2', estado: 'Exclusiva', vence: 120, ultimoInforme: 7 },
    { id: 'p3', nombre: 'Propietario C. (ejemplo)', inmueble: 'i3', estado: 'Encargo sin exclusiva', vence: 21, ultimoInforme: 13 },
    { id: 'p4', nombre: 'Propietaria D. (ejemplo)', inmueble: 'i4', estado: 'Exclusiva', vence: 11, ultimoInforme: 9 },
    { id: 'p6', nombre: 'Propietario E. (ejemplo)', inmueble: 'i6', estado: 'Encargo sin exclusiva', vence: 30, ultimoInforme: 21 }
  ];
  const captaciones = [
    { nombre: 'Propietaria F. (ejemplo)', zona: 'Altozano · 120 m²', origen: 'Laura (teléfono)', comercial: 'antonio', paso: 'Valoración enviada', valor: '≈ 175.000 – 192.000 €', siguiente: 'Visita de captación jueves 12:00' },
    { nombre: 'Propietario G. (ejemplo)', zona: 'Ensanche · 95 m²', origen: 'WhatsApp', comercial: 'lucia', paso: 'Visita de captación hecha', valor: '≈ 160.000 €', siguiente: 'Presentar propuesta de exclusiva' },
    { nombre: 'Propietaria H. (ejemplo)', zona: 'San Pablo · 80 m²', origen: 'Laura (teléfono)', comercial: 'marta', paso: 'Pide valoración', valor: 'Pendiente', siguiente: 'Llamar hoy (Laura ya tomó los datos)' },
    { nombre: 'Raúl P. (comprador)', zona: 'Hospital · 90 m²', origen: 'Comercial', comercial: 'pablo', paso: 'Quiere vender para comprar', valor: 'Pendiente', siguiente: 'Valorar su piso esta semana' }
  ];

  // Agenda de la semana del 12 al 17 de octubre de 2026 (hoy es miércoles 14).
  const DIAS = [
    { k: 'Lun', largo: 'lunes', n: 12 }, { k: 'Mar', largo: 'martes', n: 13 }, { k: 'Mié', largo: 'miércoles', n: 14 },
    { k: 'Jue', largo: 'jueves', n: 15 }, { k: 'Vie', largo: 'viernes', n: 16 }, { k: 'Sáb', largo: 'sábado', n: 17 }
  ];
  const HOY = 2;
  const TIPOS = {
    visita: { nombre: 'Visita', cls: 'bg-indigo-500/20 border-indigo-400/50 text-indigo-100' },
    segunda: { nombre: '2ª visita', cls: 'bg-sky-500/20 border-sky-400/50 text-sky-100' },
    captacion: { nombre: 'Captación', cls: 'bg-amber-500/20 border-amber-400/50 text-amber-100' },
    firma: { nombre: 'Firma', cls: 'bg-emerald-500/20 border-emerald-400/50 text-emerald-100' }
  };
  const agenda = [
    { dia: 0, hora: '10:00', comercial: 'lucia', tipo: 'visita', texto: 'Ático Ensanche · Comprador (ejemplo)', origen: 'WhatsApp', hecha: true },
    { dia: 0, hora: '17:30', comercial: 'antonio', tipo: 'visita', texto: 'Rosario · Jorge y Ana M.', origen: 'Comercial', hecha: true },
    { dia: 0, hora: '12:00', comercial: 'marta', tipo: 'captacion', texto: 'Valoración en Feria', origen: 'Laura', hecha: true },
    { dia: 1, hora: '11:00', comercial: 'pablo', tipo: 'visita', texto: 'Alquiler Fátima · Familia (ejemplo)', origen: 'Laura', hecha: true },
    { dia: 1, hora: '18:00', comercial: 'marta', tipo: 'visita', texto: 'Feria · Tomás V.', origen: 'WhatsApp', hecha: true },
    { dia: 1, hora: '19:00', comercial: 'lucia', tipo: 'visita', texto: 'Villacerrada · Comprador (ejemplo)', origen: 'Laura', hecha: true },
    { dia: 2, hora: '10:30', comercial: 'antonio', tipo: 'firma', texto: 'Hoja de encargo · Propietaria B.', origen: 'Comercial' },
    { dia: 2, hora: '13:00', comercial: 'pablo', tipo: 'visita', texto: 'Chalet Ctra. Jaén · Comprador (ejemplo)', origen: 'WhatsApp' },
    { dia: 2, hora: '17:00', comercial: 'lucia', tipo: 'segunda', texto: 'Ático Ensanche · Nuria G.', origen: 'Laura' },
    { dia: 3, hora: '12:00', comercial: 'antonio', tipo: 'captacion', texto: 'Valoración Altozano · Propietaria F.', origen: 'Laura' },
    { dia: 3, hora: '17:30', comercial: 'antonio', tipo: 'visita', texto: 'Rosario · Marcos D.', origen: 'WhatsApp', comprador: 'b9' },
    { dia: 3, hora: '18:30', comercial: 'marta', tipo: 'visita', texto: 'Industria · Comprador (ejemplo)', origen: 'Laura' },
    { dia: 4, hora: '10:00', comercial: 'lucia', tipo: 'visita', texto: 'Villacerrada · Irene C.', origen: 'Laura', comprador: 'b10' },
    { dia: 4, hora: '13:00', comercial: 'marta', tipo: 'firma', texto: 'Arras · Alberto N.', origen: 'Comercial' },
    { dia: 4, hora: '18:00', comercial: 'pablo', tipo: 'visita', texto: 'Alquiler Fátima · Comprador (ejemplo)', origen: 'WhatsApp' },
    { dia: 5, hora: '11:00', comercial: 'lucia', tipo: 'visita', texto: 'Ático Ensanche · Comprador (ejemplo)', origen: 'WhatsApp' },
    { dia: 5, hora: '12:30', comercial: 'pablo', tipo: 'captacion', texto: 'Valoración piso de Raúl P.', origen: 'Comercial' }
  ];
  const HORAS_DISPONIBLES = ['10:00', '11:30', '13:00', '17:00', '18:30', '19:30'];

  const conversaciones = [
    { id: 'v1', canal: 'Laura', quien: 'Elena R.', comprador: 'b1', comercial: 'lucia', hace: 'Hace 5 días', respuesta: 'Al momento (Laura)',
      mensajes: [
        { de: 'cliente', t: 'Buenas noches, llamo por el piso grande de Villacerrada. ¿Sigue disponible?' },
        { de: 'laura', t: 'Buenas noches, sí, sigue disponible. Son 165 m² con 4 dormitorios. ¿Lo busca para vivir usted? ¿Cómo tiene pensado financiarlo?' },
        { de: 'cliente', t: 'Para nosotros y los niños. Tenemos la hipoteca preaprobada hasta 230.000.' },
        { de: 'laura', t: 'Perfecto. Le propongo verlo con Lucía el jueves a las 17:30. Le envío ahora la ubicación por WhatsApp.' }
      ] },
    { id: 'v2', canal: 'WhatsApp', quien: 'Marcos D.', comprador: 'b9', comercial: 'antonio', hace: 'Hace 40 min', respuesta: '1 min (asistente)',
      mensajes: [
        { de: 'cliente', t: 'Hola, ¿se puede ver el piso del Rosario esta semana?' },
        { de: 'bot', t: 'Buenas tardes. Sí: Antonio tiene hueco el jueves a las 17:30 o el viernes a las 18:00. ¿Cuál le viene mejor?' },
        { de: 'cliente', t: 'El jueves.' },
        { de: 'bot', t: 'Hecho. Visita el jueves 15 a las 17:30 con Antonio. Le recordaremos la cita el día antes.' }
      ] },
    { id: 'v3', canal: 'Idealista', quien: 'Cliente Idealista', comprador: 'b4', comercial: null, hace: 'Hace 31 h', respuesta: 'Sin responder', alerta: true,
      mensajes: [{ de: 'cliente', t: '¿Sigue disponible el ático? ¿Admite mascotas?' }] },
    { id: 'v4', canal: 'Fotocasa', quien: 'Silvia T.', comprador: 'b5', comercial: null, hace: 'Hace 27 h', respuesta: 'Sin responder', alerta: true,
      mensajes: [{ de: 'cliente', t: 'Me gustaría visitar el piso de Feria. Puedo por las mañanas.' }] },
    { id: 'v5', canal: 'Instagram', quien: 'Nuria G.', comprador: 'b7', comercial: 'lucia', hace: 'Hace 2 días', respuesta: '2 min (asistente)',
      mensajes: [
        { de: 'cliente', t: 'Me encanta el ático del reel 😍 ¿precio?' },
        { de: 'bot', t: 'Gracias por escribirnos. Son 380.000 €, 190 m² y 60 m² de terraza. ¿Le paso la ficha por WhatsApp y le busco hueco para verlo?' }
      ] },
    { id: 'v6', canal: 'Laura', quien: 'Propietaria F.', comprador: null, comercial: 'antonio', hace: 'Ayer 20:15', respuesta: 'Al momento (Laura)',
      mensajes: [
        { de: 'cliente', t: 'Quiero vender mi piso en Altozano y no sé cuánto pedir.' },
        { de: 'laura', t: 'Con mucho gusto. Para una vivienda de 120 m² en Altozano, el mercado se mueve entre 175.000 y 192.000 € de forma orientativa. Antonio puede ir a verlo el jueves a las 12:00 para darle una valoración exacta.' }
      ] },
    { id: 'v7', canal: 'WhatsApp', quien: 'Héctor L.', comprador: 'b6', comercial: 'marta', hace: 'Ayer', respuesta: '18 min (Marta)',
      mensajes: [
        { de: 'comercial', t: 'Hola Héctor, soy Marta de Izon. Le envío la ficha de la vivienda de Industria que comentó con Laura.' },
        { de: 'cliente', t: 'Gracias, tiene buena pinta. Lo hablo con mi pareja.' }
      ] }
  ];

  // Métricas base del mes (orientativas) que se suman a lo que pasa en la demo.
  const BASE = { contactosSemana: 47, contactosMes: 186, fueraHorario: 38, operacionesMes: 3, comisionMedia: 4000 };
  const EQUIPO_BASE = {
    lucia: { respuesta: 0.6, llamadas: 64, visitasMes: 21, ofertas: 6, operaciones: 2, captaciones: 2 },
    antonio: { respuesta: 1.1, llamadas: 71, visitasMes: 18, ofertas: 5, operaciones: 1, captaciones: 3 },
    marta: { respuesta: 1.8, llamadas: 49, visitasMes: 15, ofertas: 3, operaciones: 1, captaciones: 1 },
    pablo: { respuesta: 3.4, llamadas: 38, visitasMes: 12, ofertas: 2, operaciones: 0, captaciones: 1 }
  };

  // ------------------------------------------------------------------ Utilidades
  const $ = sel => document.querySelector(sel);
  const miles = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const eur = n => miles(n) + ' €';
  const pila = n => / y /.test(n) ? n.replace(/\s+\S+\.$/, '') : n.split(/\s+/)[0];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  function toast(msg) {
    const t = $('#crmToast');
    if (!t) return;
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.add('hidden'), 3200);
  }

  const card = 'bg-slate-900/80 rounded-2xl border border-slate-800';
  const chip = (txt, cls) => `<span class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cls}">${txt}</span>`;
  const ORIGEN = {
    'Laura (teléfono)': 'bg-brand-blue/20 text-sky-300 border-sky-500/40', Laura: 'bg-brand-blue/20 text-sky-300 border-sky-500/40',
    WhatsApp: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40', Idealista: 'bg-lime-500/15 text-lime-300 border-lime-500/40',
    Fotocasa: 'bg-orange-500/15 text-orange-300 border-orange-500/40', Instagram: 'bg-pink-500/15 text-pink-300 border-pink-500/40',
    Web: 'bg-slate-500/15 text-slate-300 border-slate-500/40', Comercial: 'bg-slate-500/15 text-slate-300 border-slate-500/40'
  };
  const origenChip = o => chip((o.startsWith('Laura') ? '📞 ' : '') + o, ORIGEN[o] || ORIGEN.Web);
  const comChip = id => {
    const c = com(id);
    return c ? chip(`<span class="w-1.5 h-1.5 rounded-full ${c.color}"></span>${c.nombre}`, 'bg-slate-800 text-slate-200 border-slate-700')
      : chip('Sin asignar', 'bg-red-500/15 text-red-300 border-red-500/40');
  };
  const etapaChip = id => { const e = etapa(id); return chip(`<span class="w-1.5 h-1.5 rounded-full ${e.color}"></span>${e.nombre}`, 'bg-slate-800 text-slate-200 border-slate-700'); };
  const diasTxt = d => d === 0 ? 'hoy' : d === 1 ? 'hace 1 día' : `hace ${d} días`;

  function kpi(titulo, valor, nota, acento) {
    return `<div class="${card} p-4 space-y-1">
      <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">${titulo}</p>
      <p class="font-display text-2xl font-extrabold ${acento || 'text-white'}">${valor}</p>
      <p class="text-[11px] text-slate-400">${nota}</p>
    </div>`;
  }
  function barras(items, color) {
    const max = Math.max(...items.map(i => i.v), 1);
    return items.map(i => `<div class="space-y-1">
      <div class="flex justify-between text-xs"><span class="text-slate-300 font-medium">${i.k}</span><span class="font-bold text-white">${i.label || i.v}</span></div>
      <div class="h-2.5 rounded-full bg-slate-800 overflow-hidden"><div class="h-full rounded-full ${i.color || color}" style="width:${Math.max(4, Math.round(i.v / max * 100))}%"></div></div>
    </div>`).join('');
  }

  // ------------------------------------------------------------------ Cálculos
  const enEtapa = id => compradores.filter(b => b.etapa === id);
  const sinAtender = () => compradores.filter(b => b.etapa === 'nuevo' && (b.horas || 0) >= 24);
  const enDudaSinSeguir = () => compradores.filter(b => b.etapa === 'duda' && b.dias >= 3);
  const sinOpinion = () => compradores.filter(b => b.etapa === 'visitado' && b.sinOpinion);
  const pendientesVisita = () => compradores.filter(b => b.etapa === 'cualificado');
  const visitasSemana = () => agenda.filter(a => a.tipo === 'visita' || a.tipo === 'segunda');
  const encargosVencen = () => propietarios.filter(p => p.vence <= 21);

  function equipo(id) {
    const b = EQUIPO_BASE[id];
    const mios = compradores.filter(x => x.comercial === id);
    const vis = visitasSemana().filter(a => a.comercial === id).length;
    const vencidas = mios.filter(x => (x.etapa === 'duda' && x.dias >= 3) || (x.etapa === 'visitado' && x.sinOpinion) || (x.etapa === 'cualificado' && x.dias >= 3)).length;
    return {
      ...b, activos: mios.filter(x => !['vendido'].includes(x.etapa)).length, visitasSemana: vis, vencidas,
      conversion: Math.round(b.ofertas / b.visitasMes * 100), comision: b.operaciones * BASE.comisionMedia,
      duda: mios.filter(x => x.etapa === 'duda').length
    };
  }

  // ------------------------------------------------------------------ Navegación y roles
  let tabActual = 'panel';
  let rol = 'dueno'; // dueno | comercial | propietario
  let comercialVista = 'lucia';
  let propietarioVista = 'p1';
  const ROLES = [
    { id: 'dueno', tab: 'panel' },
    { id: 'comercial', tab: 'comercial' },
    { id: 'propietario', tab: 'propietario' }
  ];
  function cambiarRol(r) {
    rol = r;
    document.querySelectorAll('#crm-inmo [data-crm-rol]').forEach(b => {
      const on = b.dataset.crmRol === r;
      b.className = 'shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ' +
        (on ? 'bg-brand-gold text-slate-950 shadow-glow-gold' : 'text-slate-300 hover:bg-slate-800');
    });
    const nav = $('#crmNavDueno');
    if (nav) nav.classList.toggle('hidden', r !== 'dueno');
    mostrar(ROLES.find(x => x.id === r).tab);
  }
  function mostrar(tab) {
    tabActual = tab;
    document.querySelectorAll('.crm-pane').forEach(p => p.classList.toggle('hidden', p.id !== 'crm-' + tab));
    document.querySelectorAll('.crm-tab').forEach(b => {
      const on = b.dataset.crmTab === tab;
      b.className = 'crm-tab shrink-0 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ' +
        (on ? 'bg-brand-blue text-white shadow-glow-blue' : 'text-slate-300 hover:bg-slate-800');
    });
    render();
  }
  function render() {
    const alertas = sinAtender().length + enDudaSinSeguir().length + sinOpinion().length + encargosVencen().length;
    const badge = $('#crmBadgeAlertas');
    if (badge) { badge.textContent = alertas; badge.classList.toggle('hidden', !alertas); }
    const bDuda = $('#crmBadgeCompradores');
    if (bDuda) bDuda.textContent = compradores.filter(b => b.etapa !== 'vendido').length;
    ({ panel: renderPanel, agenda: renderAgenda, compradores: renderCompradores, conversaciones: renderConversaciones, equipo: renderEquipo, propietarios: renderPropietarios, comercial: renderComercial, propietario: renderPropietario })[tabActual]();
  }

  // ------------------------------------------------------------------ Panel del dueño
  function alerta(cls, icono, titulo, texto, attrs) {
    return `<button ${attrs} class="w-full text-left p-3.5 rounded-xl border transition ${cls}">
      <p class="text-xs font-bold text-white">${icono} ${titulo}</p>
      <p class="text-[11px] text-slate-300 mt-0.5">${texto}</p>
    </button>`;
  }

  function renderPanel() {
    const duda = enDudaSinSeguir();
    const nuevos = sinAtender();
    const sinOp = sinOpinion();
    const vencen = encargosVencen();
    const visitas = visitasSemana();
    const ofertas = enEtapa('oferta').length;
    const arras = enEtapa('arras').length;
    const previsto = (ofertas + arras) * BASE.comisionMedia;
    const hoy = agenda.filter(a => a.dia === HOY).sort((a, b) => a.hora.localeCompare(b.hora));

    const embudo = [
      { k: 'Contactos del mes', v: BASE.contactosMes },
      { k: 'Cualificados', v: 112 },
      { k: 'Con visita', v: 66 + visitas.filter(a => a.nuevo).length },
      { k: 'Oferta', v: 16 },
      { k: 'Arras o escritura', v: 4 }
    ];

    $('#crm-panel').innerHTML = `
      ${duda.length ? `<button data-crm-duda class="w-full text-left p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:opacity-95 shadow-glow-gold">
        <span><span class="block font-display font-extrabold text-base">⚠️ ${duda.length} compradores en duda llevan días sin seguimiento</span>
        <span class="block text-xs font-medium text-slate-900">Les gustó el inmueble, pero algo les frena. Un mensaje a tiempo puede salvar la operación.</span></span>
        <span class="shrink-0 px-3 py-2 rounded-xl bg-slate-950 text-amber-300 font-bold text-xs">Ver compradores →</span>
      </button>` : `<div class="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-sm font-semibold">✅ Todos los compradores en duda tienen seguimiento. Buen trabajo del equipo.</div>`}

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${kpi('Contactos nuevos (semana)', BASE.contactosSemana, `${BASE.fueraHorario} % fuera de horario, atendidos por Laura`)}
        ${kpi('Primera respuesta', '1 min', 'Laura y WhatsApp 24/7 · equipo: 1,7 h de media', 'text-sky-300')}
        ${kpi('Visitas esta semana', visitas.length, `${visitas.filter(a => a.hecha).length} hechas · ${visitas.filter(a => !a.hecha).length} por hacer`)}
        ${kpi('Compradores en duda', enEtapa('duda').length, `${duda.length} sin seguimiento hace 3 días o más`, duda.length ? 'text-amber-300' : 'text-emerald-300')}
        ${kpi('Pendientes de visita', pendientesVisita().length, 'Cualificados sin día de visita')}
        ${kpi('Ofertas en negociación', ofertas, 'Pendientes de respuesta del propietario')}
        ${kpi('Operaciones del mes', BASE.operacionesMes + arras, `${arras} en arras · ${BASE.operacionesMes} escrituradas`, 'text-emerald-300')}
        ${kpi('Comisión prevista', '≈ ' + eur(previsto), 'Orientativa · ofertas y arras abiertas', 'text-brand-gold')}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="${card} p-5 space-y-2.5">
          <div class="flex items-center justify-between"><h3 class="font-display font-bold text-sm text-white">Lo que necesita su atención</h3><span class="text-[10px] text-slate-500">Miércoles 14</span></div>
          ${nuevos.length ? alerta('bg-red-500/10 border-red-500/40 hover:border-red-400', '🔴', `${nuevos.length} contactos sin atender hace más de 24 h`, 'Entraron de madrugada por los portales. Laura puede llamarlos ahora.', 'data-crm-go="conversaciones" data-filtro="sin"') : ''}
          ${duda.length ? alerta('bg-amber-500/10 border-amber-500/40 hover:border-amber-400', '🟠', `${duda.length} compradores en duda sin seguimiento`, duda.map(b => pila(b.nombre)).join(', ') + '.', 'data-crm-duda') : ''}
          ${sinOp.length ? alerta('bg-cyan-500/10 border-cyan-500/40 hover:border-cyan-400', '📝', `${sinOp.length} visitas sin opinión del cliente`, 'El comercial aún no ha apuntado qué le pareció.', 'data-crm-go="compradores" data-filtro="visitado"') : ''}
          ${pendientesVisita().length ? alerta('bg-sky-500/10 border-sky-500/40 hover:border-sky-400', '📅', `${pendientesVisita().length} compradores cualificados sin visita`, 'Proponga día y hora por WhatsApp.', 'data-crm-go="compradores" data-filtro="cualificado"') : ''}
          ${vencen.length ? alerta('bg-violet-500/10 border-violet-500/40 hover:border-violet-400', '🏠', `${vencen.length} encargos vencen en menos de 3 semanas`, 'Renovar antes de que el propietario se vaya a otra agencia.', 'data-crm-go="propietarios"') : ''}
        </div>

        <div class="${card} p-5 space-y-3 lg:col-span-2">
          <div class="flex items-center justify-between"><h3 class="font-display font-bold text-sm text-white">El equipo esta semana</h3><button data-crm-tab="equipo" class="text-[11px] font-bold text-sky-300 hover:text-white">Ver productividad →</button></div>
          <div class="overflow-x-auto"><table class="w-full text-xs min-w-[520px]">
            <thead><tr class="text-[10px] uppercase tracking-wider text-slate-500 text-left"><th class="py-2 font-bold">Comercial</th><th class="font-bold">Compradores activos</th><th class="font-bold">Visitas semana</th><th class="font-bold">En duda</th><th class="font-bold">1.ª respuesta</th><th class="font-bold">Tareas vencidas</th></tr></thead>
            <tbody class="divide-y divide-slate-800">${COMERCIALES.map(c => {
              const e = equipo(c.id);
              return `<tr><td class="py-2.5 font-bold text-white"><span class="inline-block w-2 h-2 rounded-full ${c.color} mr-1.5"></span>${c.nombre}</td><td class="text-slate-200">${e.activos}</td><td class="text-slate-200">${e.visitasSemana}</td><td class="${e.duda ? 'text-amber-300 font-bold' : 'text-slate-400'}">${e.duda}</td><td class="${e.respuesta > 3 ? 'text-red-300 font-bold' : 'text-slate-200'}">${String(e.respuesta).replace('.', ',')} h</td><td>${e.vencidas ? chip(e.vencidas + ' vencida' + (e.vencidas > 1 ? 's' : ''), 'bg-red-500/15 text-red-300 border-red-500/40') : chip('Al día', 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40')}</td></tr>`;
            }).join('')}</tbody></table></div>
          <div class="pt-1">
            <p class="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Hoy en la agenda</p>
            <div class="grid sm:grid-cols-2 gap-2">${hoy.map(a => `<div class="p-2.5 rounded-xl border text-[11px] ${TIPOS[a.tipo].cls}"><b>${a.hora}</b> · ${TIPOS[a.tipo].nombre} · ${esc(a.texto)} <span class="opacity-75">(${com(a.comercial).nombre})</span></div>`).join('')}</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="${card} p-5 space-y-3">
          <h3 class="font-display font-bold text-sm text-white">Embudo de compradores</h3>
          <p class="text-[11px] text-slate-400 -mt-2">Octubre 2026 · datos de ejemplo</p>
          ${barras(embudo, 'bg-gradient-to-r from-brand-blue to-sky-400')}
        </div>
        <div class="${card} p-5 space-y-3">
          <h3 class="font-display font-bold text-sm text-white">De dónde llegan los contactos</h3>
          <p class="text-[11px] text-slate-400 -mt-2">Contactos del mes</p>
          ${barras([{ k: '📞 Laura (teléfono)', v: 58 }, { k: 'WhatsApp', v: 47 }, { k: 'Idealista', v: 39 }, { k: 'Fotocasa', v: 18 }, { k: 'Instagram', v: 15 }, { k: 'Web', v: 9 }], 'bg-emerald-500')}
        </div>
        <div class="${card} p-5 space-y-3">
          <h3 class="font-display font-bold text-sm text-white">Por qué dudan los compradores</h3>
          <p class="text-[11px] text-slate-400 -mt-2">Motivos apuntados tras la visita</p>
          ${barras([{ k: 'Financiación', v: 9 }, { k: 'Reforma necesaria', v: 6 }, { k: 'Tienen que vender antes', v: 5 }, { k: 'Precio', v: 4 }, { k: 'Ubicación o ruido', v: 2 }], 'bg-amber-500')}
        </div>
      </div>`;
  }

  // ------------------------------------------------------------------ Agenda del equipo
  let filtroAgenda = 'todos';
  function renderAgenda() {
    const lista = COMERCIALES.filter(c => filtroAgenda === 'todos' || c.id === filtroAgenda);
    const porOrigen = o => agenda.filter(a => a.origen === o).length;
    $('#crm-agenda').innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap gap-1.5">
          ${[{ id: 'todos', nombre: 'Todo el equipo' }, ...COMERCIALES].map(c => `<button data-agenda-filtro="${c.id}" class="px-3 py-1.5 rounded-lg text-xs font-bold border ${filtroAgenda === c.id ? 'bg-brand-blue text-white border-brand-blue' : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'}">${c.nombre}</button>`).join('')}
        </div>
        <div class="flex flex-wrap gap-1.5 text-[10px]">${Object.values(TIPOS).map(t => `<span class="px-2 py-1 rounded-lg border ${t.cls} font-bold">${t.nombre}</span>`).join('')}</div>
      </div>
      <div class="grid grid-cols-3 gap-3">
        ${kpi('Citas esta semana', agenda.length, `${visitasSemana().length} visitas · ${agenda.filter(a => a.tipo === 'captacion').length} captaciones · ${agenda.filter(a => a.tipo === 'firma').length} firmas`)}
        ${kpi('Agendadas por Laura', porOrigen('Laura'), 'Por teléfono, también fuera de horario', 'text-sky-300')}
        ${kpi('Agendadas por WhatsApp', porOrigen('WhatsApp'), 'El cliente eligió hora él solo', 'text-emerald-300')}
      </div>
      <div class="${card} overflow-x-auto">
        <table class="w-full text-xs min-w-[760px] table-fixed">
          <thead><tr class="bg-slate-950/60">
            <th class="w-28 p-2.5 text-left text-[10px] uppercase tracking-wider text-slate-500">Comercial</th>
            ${DIAS.map((d, i) => `<th class="p-2.5 text-left ${i === HOY ? 'text-sky-300' : 'text-slate-400'}"><span class="text-[10px] uppercase tracking-wider">${d.k}</span> <b>${d.n}</b>${i === HOY ? ' <span class="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20">hoy</span>' : ''}</th>`).join('')}
          </tr></thead>
          <tbody class="divide-y divide-slate-800">${lista.map(c => `<tr>
            <td class="p-2.5 align-top font-bold text-white"><span class="inline-block w-2 h-2 rounded-full ${c.color} mr-1.5"></span>${c.nombre}</td>
            ${DIAS.map((d, i) => `<td class="p-1.5 align-top space-y-1 ${i === HOY ? 'bg-sky-500/5' : ''}">${agenda.filter(a => a.dia === i && a.comercial === c.id).sort((a, b) => a.hora.localeCompare(b.hora)).map(a => `
              <button ${a.comprador ? `data-crm-ficha="${a.comprador}"` : ''} class="w-full text-left p-1.5 rounded-lg border ${TIPOS[a.tipo].cls} ${a.hecha ? 'opacity-50' : ''} ${a.nuevo ? 'ring-2 ring-amber-400' : ''}">
                <span class="block font-bold">${a.hora} · ${TIPOS[a.tipo].nombre}</span>
                <span class="block text-[10px] leading-snug">${esc(a.texto)}</span>
                <span class="block text-[9px] opacity-75 mt-0.5">${a.origen === 'Laura' ? '📞 Laura' : a.origen === 'WhatsApp' ? '💬 WhatsApp' : '👤 Comercial'}${a.hecha ? ' · hecha' : ''}${a.nuevo ? ' · nueva' : ''}</span>
              </button>`).join('')}</td>`).join('')}
          </tr>`).join('')}</tbody>
        </table>
      </div>
      <p class="text-[11px] text-slate-500">El dueño ve la agenda de todo el equipo; cada comercial ve la suya en el móvil. Recordatorio automático al cliente el día antes de cada visita.</p>`;
  }

  // ------------------------------------------------------------------ Compradores
  let filtroComp = null;
  function tarjetaComprador(b) {
    const i = inm(b.inmueble);
    const tarde = (b.etapa === 'duda' && b.dias >= 3) || (b.etapa === 'nuevo' && b.horas >= 24) || (b.etapa === 'visitado' && b.sinOpinion);
    return `<button data-crm-ficha="${b.id}" class="w-full text-left p-2.5 rounded-xl bg-slate-900 border ${tarde ? 'border-amber-500/60' : 'border-slate-800'} hover:border-sky-400 transition space-y-1.5">
      <div class="flex items-start justify-between gap-2"><span class="text-xs font-bold text-white leading-snug">${esc(b.nombre)}</span>${b.temp === 'Caliente' ? '<span title="Caliente">🔥</span>' : ''}</div>
      <p class="text-[10px] text-slate-400 leading-snug">${i ? esc(i.titulo) : esc(b.busca)}</p>
      <div class="flex flex-wrap gap-1">${comChip(b.comercial)}${origenChip(b.origen)}</div>
      <p class="text-[10px] ${tarde ? 'text-amber-300 font-bold' : 'text-slate-500'}">${b.etapa === 'nuevo' && b.horas ? `Sin respuesta hace ${b.horas} h` : b.etapa === 'visitado' && b.sinOpinion ? 'Falta la opinión tras la visita' : 'Último contacto ' + diasTxt(b.dias)}</p>
    </button>`;
  }
  function renderCompradores() {
    const filtros = [
      { id: null, nombre: 'Todos' }, { id: 'duda', nombre: '🟠 En duda' }, { id: 'cualificado', nombre: '📅 Pendientes de visita' },
      { id: 'visitado', nombre: '📝 Sin opinión tras visita' }, { id: 'nuevo', nombre: '🔴 Sin atender' }
    ];
    const pend = pendientesVisita();
    $('#crm-compradores').innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex flex-wrap gap-1.5">${filtros.map(f => `<button data-comp-filtro="${f.id || ''}" class="px-3 py-1.5 rounded-lg text-xs font-bold border ${filtroComp === f.id ? 'bg-brand-blue text-white border-brand-blue' : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'}">${f.nombre}</button>`).join('')}</div>
        <span class="text-[11px] text-slate-500">Pulse una tarjeta para abrir la ficha del comprador</span>
      </div>
      ${filtroComp === 'cualificado' ? `<div class="${card} p-4 space-y-2">
        <h3 class="font-display font-bold text-sm text-white">Pendientes de visita (${pend.length})</h3>
        ${pend.map(b => `<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <div><p class="text-xs font-bold text-white">${esc(b.nombre)} <span class="font-normal text-slate-400">· ${esc(b.busca)}</span></p><p class="text-[11px] text-slate-400">${esc(b.pago)} · ${com(b.comercial).nombre} · último contacto ${diasTxt(b.dias)}</p></div>
          <button data-crm-wa="${b.id}" class="shrink-0 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs">💬 Proponer visita por WhatsApp</button>
        </div>`).join('')}
      </div>` : ''}
      <div class="flex gap-3 overflow-x-auto pb-2">${ETAPAS.map(e => {
        const items = compradores.filter(b => b.etapa === e.id);
        const dim = filtroComp && filtroComp !== e.id ? ' opacity-35' : '';
        return `<div class="w-56 shrink-0 bg-slate-950/50 rounded-2xl p-2.5 border border-slate-800 space-y-2${dim}">
          <div class="px-1 pt-0.5"><span class="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5"><span class="w-2 h-2 rounded-full ${e.color}"></span>${e.nombre} <span class="text-slate-500">${items.length}</span></span>
          <span class="block text-[10px] text-slate-500 mt-0.5">${e.desc}</span></div>
          ${items.map(tarjetaComprador).join('') || '<p class="text-[11px] text-slate-600 px-1 py-3">Sin compradores</p>'}
        </div>`;
      }).join('')}</div>`;
  }

  // ------------------------------------------------------------------ Ficha del comprador (panel lateral)
  let fichaActual = null;
  let paso = 'ficha'; // ficha | wa | movil
  let huecosPropuestos = [];

  function huecos(comercialId, n) {
    const res = [];
    for (let d = HOY + 1; d < DIAS.length && res.length < n; d++) {
      for (const h of HORAS_DISPONIBLES) {
        if (res.length >= n) break;
        const ocupado = agenda.some(a => a.dia === d && a.comercial === comercialId && Math.abs(toMin(a.hora) - toMin(h)) < 75);
        if (!ocupado && !res.some(r => r.dia === d)) res.push({ dia: d, hora: h });
      }
    }
    return res;
  }
  const toMin = h => { const [a, b] = h.split(':').map(Number); return a * 60 + b; };
  const huecoTxt = h => `${DIAS[h.dia].largo} ${DIAS[h.dia].n} a las ${h.hora}`;

  function mensajeWa(b) {
    const c = com(b.comercial);
    const i = inm(b.inmueble);
    if (b.etapa === 'duda') {
      return `Hola ${pila(b.nombre)}, soy ${c.nombre} de Izon Consulting. Me quedé pensando en lo que me comentó sobre ${i.enMensaje}: ${b.gancho}. Si le parece, lo vemos otra vez con calma y le resuelvo cualquier duda. Le dejo tres horas libres:`;
    }
    return `Hola ${pila(b.nombre)}, soy ${c.nombre} de Izon Consulting. ¿Le gustaría ver ${i ? i.enMensaje : 'el inmueble'} esta semana? Le dejo tres horas libres para que elija la que mejor le venga:`;
  }

  function abrirFicha(id) {
    fichaActual = id;
    paso = 'ficha';
    pintarFicha();
    $('#crmDrawer').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
  function cerrarFicha() {
    $('#crmDrawer').classList.add('hidden');
    document.body.style.overflow = '';
    fichaActual = null;
  }

  function pintarFicha() {
    const b = comp(fichaActual);
    if (!b) return;
    const i = inm(b.inmueble);
    const c = com(b.comercial);
    let cuerpo = '';

    if (paso === 'ficha') {
      cuerpo = `
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800"><span class="block text-[10px] text-slate-400">Busca</span><b class="text-white">${esc(b.busca)}</b></div>
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800"><span class="block text-[10px] text-slate-400">Cómo paga</span><b class="text-white">${esc(b.pago)}</b></div>
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800"><span class="block text-[10px] text-slate-400">Inmueble</span><b class="text-white">${i ? `${esc(i.titulo)} · ${i.alquiler ? eur(i.precio) + '/mes' : eur(i.precio)}` : '—'}</b></div>
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800"><span class="block text-[10px] text-slate-400">Teléfono (ejemplo)</span><b class="text-white">${b.tel}</b></div>
        </div>
        ${b.duda ? `<div class="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/40"><p class="text-[10px] font-bold uppercase tracking-wider text-amber-300">Qué le frena</p><p class="text-sm text-white mt-1">${esc(b.duda)}</p><p class="text-[11px] text-amber-200/80 mt-1">Último contacto ${diasTxt(b.dias)}.</p></div>` : ''}
        ${b.resumenLaura ? `<div class="p-3.5 rounded-xl bg-brand-blue/10 border border-sky-500/40"><p class="text-[10px] font-bold uppercase tracking-wider text-sky-300">📞 Resumen de la llamada con Laura</p><p class="text-sm text-slate-200 mt-1">${esc(b.resumenLaura)}</p></div>` : ''}
        <div class="space-y-2">
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Historial</p>
          ${b.historial.map(h => `<div class="flex gap-3 text-xs"><span class="w-12 shrink-0 text-slate-500">${h.fecha}</span><span class="shrink-0">${origenChip(h.canal)}</span><span class="text-slate-300">${esc(h.texto)}</span></div>`).join('')}
        </div>
        <div class="grid sm:grid-cols-2 gap-2 pt-2">
          ${b.comercial && ['duda', 'cualificado', 'visitado'].includes(b.etapa) ? `<button data-crm-wa="${b.id}" class="px-3 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs">💬 ${b.etapa === 'duda' ? 'Reactivar por WhatsApp' : 'Proponer visita por WhatsApp'}</button>` : ''}
          ${b.etapa === 'nuevo' ? `<button data-crm-laura="${b.id}" class="px-3 py-3 rounded-xl bg-brand-blue hover:bg-sky-500 text-white font-bold text-xs">📞 Que Laura le llame ahora</button>` : ''}
          ${b.etapa === 'visitado' && b.sinOpinion ? `<button data-crm-opinion="${b.id}" class="px-3 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs">📝 Pedir opinión al cliente</button>` : ''}
          <select data-crm-asignar="${b.id}" class="px-3 py-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-semibold" aria-label="Asignar comercial">
            <option value="">${c ? 'Reasignar comercial…' : 'Asignar comercial…'}</option>
            ${COMERCIALES.map(x => `<option value="${x.id}" ${x.id === b.comercial ? 'disabled' : ''}>${x.nombre}</option>`).join('')}
          </select>
        </div>`;
    } else if (paso === 'wa') {
      huecosPropuestos = huecos(b.comercial, 3);
      cuerpo = `
        <p class="text-xs text-slate-300">Mensaje preparado con lo que el comprador contó y con huecos libres reales de la agenda de <b>${c.nombre}</b>. Puede editarlo antes de enviar.</p>
        <textarea id="crmWaTexto" rows="5" class="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white leading-relaxed">${esc(mensajeWa(b))}</textarea>
        <div class="flex flex-wrap gap-1.5">${huecosPropuestos.map(h => `<span class="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-[11px] font-bold">📅 ${huecoTxt(h)}</span>`).join('')}</div>
        <div class="flex gap-2">
          <button data-crm-paso="ficha" class="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs">← Volver</button>
          <button data-crm-enviar class="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs">Enviar WhatsApp</button>
        </div>`;
    } else if (paso === 'movil') {
      const texto = ($('#crmWaTexto') && $('#crmWaTexto').value) || mensajeWa(b);
      cuerpo = `
        <p class="text-xs text-slate-300">Así le llega al cliente. <b>Pulse una hora como si fuera ${esc(pila(b.nombre))}</b>:</p>
        <div class="mx-auto max-w-xs rounded-[2rem] border-4 border-slate-700 bg-[#0B141A] p-3 space-y-2 shadow-2xl">
          <div class="flex items-center gap-2 pb-2 border-b border-slate-800"><span class="w-7 h-7 rounded-full bg-white text-[9px] font-black text-slate-900 flex items-center justify-center">IZON</span><span class="text-xs font-bold text-white">Izon Consulting</span></div>
          <div class="chat-bubble-agent p-2.5 text-[12px] leading-relaxed">${esc(texto)}</div>
          ${huecosPropuestos.map((h, k) => `<button data-crm-elegir="${k}" class="w-full py-2 rounded-lg bg-[#202C33] hover:bg-[#2A3942] text-sky-300 text-xs font-bold">📅 ${huecoTxt(h)}</button>`).join('')}
        </div>`;
    }

    $('#crmDrawerBody').innerHTML = `
      <div class="sticky top-0 bg-slate-950/95 backdrop-blur border-b border-slate-800 p-5 flex items-start justify-between gap-3 z-10">
        <div class="space-y-1.5">
          <p class="text-[10px] font-bold uppercase tracking-wider text-sky-300">Ficha del comprador · datos de ejemplo</p>
          <h3 id="crmDrawerTitle" class="font-display text-lg font-extrabold text-white">${esc(b.nombre)}</h3>
          <div class="flex flex-wrap gap-1">${etapaChip(b.etapa)}${comChip(b.comercial)}${origenChip(b.origen)}</div>
        </div>
        <button data-crm-close class="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-lg" aria-label="Cerrar">×</button>
      </div>
      <div class="p-5 space-y-4">${cuerpo}</div>`;
  }

  function elegirHueco(k) {
    const b = comp(fichaActual);
    const h = huecosPropuestos[k];
    if (!b || !h) return;
    const i = inm(b.inmueble);
    const segunda = b.etapa === 'duda';
    agenda.push({ dia: h.dia, hora: h.hora, comercial: b.comercial, tipo: segunda ? 'segunda' : 'visita', texto: `${i ? i.titulo.split('·').pop().trim() : 'Visita'} · ${b.nombre}`, origen: 'WhatsApp', comprador: b.id, nuevo: true });
    b.historial.unshift({ fecha: '14/10', canal: 'WhatsApp', texto: `${com(b.comercial).nombre} le escribe. Elige ${huecoTxt(h)}. Visita en la agenda y recordatorio el día antes.` });
    b.etapa = 'visita';
    b.dias = 0;
    b.temp = 'Caliente';
    cerrarFicha();
    filtroAgenda = 'todos';
    if (rol === 'dueno') mostrar('agenda'); else render();
    toast(`✅ ${pila(b.nombre)} elige el ${huecoTxt(h)}. La visita ya está en la agenda de ${com(b.comercial).nombre}, en el panel del dueño y en el portal del propietario.`);
  }

  // ------------------------------------------------------------------ Conversaciones
  let convActual = 'v1';
  let filtroConv = 'todos';
  function renderConversaciones() {
    const canales = ['todos', 'sin', 'Laura', 'WhatsApp', 'Idealista', 'Fotocasa', 'Instagram'];
    const nombreCanal = { todos: 'Todas', sin: '🔴 Sin responder', Laura: '📞 Llamadas de Laura' };
    const lista = conversaciones.filter(v => filtroConv === 'todos' || (filtroConv === 'sin' ? v.alerta : v.canal === filtroConv));
    if (!lista.find(v => v.id === convActual) && lista[0]) convActual = lista[0].id;
    const v = conversaciones.find(x => x.id === convActual);
    const burbuja = m => {
      const map = { cliente: ['ml-auto bg-[#005C4B] text-white', 'Cliente'], laura: ['bg-brand-blue/20 border border-sky-500/40 text-slate-100', '📞 Laura'], bot: ['bg-slate-800 text-slate-100', '💬 Asistente'], comercial: ['bg-slate-800 border border-slate-600 text-slate-100', '👤 Comercial'] };
      const [cls, quien] = map[m.de];
      return `<div class="max-w-[85%] p-2.5 rounded-xl text-xs leading-relaxed ${cls}"><span class="block text-[10px] font-bold opacity-75 mb-0.5">${quien}</span>${esc(m.t)}</div>`;
    };
    $('#crm-conversaciones').innerHTML = `
      <div class="flex flex-wrap gap-1.5">${canales.map(cn => `<button data-conv-filtro="${cn}" class="px-3 py-1.5 rounded-lg text-xs font-bold border ${filtroConv === cn ? 'bg-brand-blue text-white border-brand-blue' : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'}">${nombreCanal[cn] || cn} <span class="opacity-60">${cn === 'todos' ? conversaciones.length : cn === 'sin' ? conversaciones.filter(x => x.alerta).length : conversaciones.filter(x => x.canal === cn).length}</span></button>`).join('')}</div>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div class="lg:col-span-5 space-y-2">${lista.map(x => `<button data-conv="${x.id}" class="w-full text-left p-3 rounded-xl border transition ${x.id === convActual ? 'bg-slate-800 border-sky-500/60' : 'bg-slate-900/70 border-slate-800 hover:border-slate-600'}">
          <div class="flex items-center justify-between gap-2"><span class="text-xs font-bold text-white">${esc(x.quien)}</span><span class="text-[10px] ${x.alerta ? 'text-red-300 font-bold' : 'text-slate-500'}">${x.hace}</span></div>
          <p class="text-[11px] text-slate-400 line-clamp-1 mt-0.5">${esc(x.mensajes[x.mensajes.length - 1].t)}</p>
          <div class="flex flex-wrap gap-1 mt-1.5">${origenChip(x.canal)}${comChip(x.comercial)}${chip('⏱ ' + x.respuesta, x.alerta ? 'bg-red-500/15 text-red-300 border-red-500/40' : 'bg-slate-800 text-slate-300 border-slate-700')}</div>
        </button>`).join('') || '<p class="text-xs text-slate-500 p-4">No hay conversaciones en este filtro. ✅</p>'}</div>
        <div class="lg:col-span-7 ${card} p-4 space-y-3">${v ? `
          <div class="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div><p class="text-sm font-bold text-white">${esc(v.quien)}</p><div class="flex flex-wrap gap-1 mt-1">${origenChip(v.canal)}${comChip(v.comercial)}</div></div>
            ${v.comprador ? `<button data-crm-ficha="${v.comprador}" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold">Abrir ficha →</button>` : ''}
          </div>
          ${v.canal === 'Laura' ? `<div class="p-3 rounded-xl bg-brand-blue/10 border border-sky-500/40 text-xs text-slate-200"><b class="text-sky-300">Resumen automático:</b> ${v.comprador && comp(v.comprador).resumenLaura ? esc(comp(v.comprador).resumenLaura) : 'Propietaria que quiere vender en Altozano. Valoración orientativa enviada y visita de captación agendada con Antonio.'}</div>` : ''}
          <div class="space-y-2 flex flex-col">${v.mensajes.map(burbuja).join('')}</div>
          ${v.alerta ? `<div class="p-3 rounded-xl bg-red-500/10 border border-red-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p class="text-xs text-red-200">Nadie ha respondido todavía. Cada hora sin respuesta, el comprador pregunta en otra agencia.</p>
            <button data-crm-laura="${v.comprador}" class="shrink-0 px-3 py-2 rounded-xl bg-brand-blue hover:bg-sky-500 text-white font-bold text-xs">📞 Que Laura le llame ahora</button>
          </div>` : ''}` : ''}
        </div>
      </div>`;
  }

  function lauraLlama(id) {
    const b = comp(id);
    if (!b || b.etapa !== 'nuevo') return;
    const libre = COMERCIALES.map(c => ({ c, n: compradores.filter(x => x.comercial === c.id && x.etapa !== 'vendido').length })).sort((a, z) => a.n - z.n)[0].c;
    if (b.id === 'b4') b.nombre = 'Sara y Luis P.';
    b.comercial = libre.id;
    b.etapa = 'cualificado';
    b.horas = 0;
    b.dias = 0;
    b.temp = 'Caliente';
    b.pago = 'Hipoteca preaprobada';
    b.resumenLaura = b.id === 'b4'
      ? 'Pareja joven con un perro. Busca ático o piso con terraza en el Ensanche, hasta 400.000 €. Hipoteca preaprobada. Puede visitar por las tardes.'
      : 'Primera vivienda. Busca 2 dormitorios en Feria o Centro, hasta 150.000 €. Hipoteca preaprobada. Prefiere visitar por la mañana.';
    b.historial.unshift({ fecha: '14/10', canal: 'Laura', texto: `Laura le llama, le cualifica y lo asigna a ${libre.nombre}, el comercial con menos carga.` });
    const v = conversaciones.find(x => x.comprador === id);
    if (v) {
      v.quien = b.nombre;
      v.alerta = false; v.comercial = libre.id; v.canal = 'Laura'; v.hace = 'Ahora'; v.respuesta = 'Al momento (Laura)';
      v.mensajes.push({ de: 'laura', t: 'Buenos días, le llamo de Izon Consulting por su consulta. Sí, sigue disponible. ¿Me cuenta qué busca y cómo tiene pensado financiarlo?' });
    }
    toast(`📞 Laura ha llamado a ${pila(b.nombre)}: contacto cualificado y asignado a ${libre.nombre}, el comercial con menos carga.`);
    if (fichaActual) pintarFicha();
    render();
  }

  // ------------------------------------------------------------------ Equipo comercial
  function renderEquipo() {
    const filas = COMERCIALES.map(c => ({ c, e: equipo(c.id) }));
    const totalCom = filas.reduce((s, f) => s + f.e.comision, 0);
    const media = (f) => (filas.reduce((s, x) => s + f(x.e), 0) / filas.length);
    $('#crm-equipo').innerHTML = `
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${kpi('Visitas del mes (equipo)', filas.reduce((s, f) => s + f.e.visitasMes, 0), 'Media ' + Math.round(media(e => e.visitasMes)) + ' por comercial')}
        ${kpi('De visita a oferta', Math.round(filas.reduce((s, f) => s + f.e.ofertas, 0) / filas.reduce((s, f) => s + f.e.visitasMes, 0) * 100) + ' %', 'Ofertas recibidas por cada 100 visitas')}
        ${kpi('Primera respuesta del equipo', String(media(e => e.respuesta).toFixed(1)).replace('.', ',') + ' h', 'Laura responde al momento, 24/7', 'text-sky-300')}
        ${kpi('Comisión generada (mes)', '≈ ' + eur(totalCom), 'Orientativa · ' + eur(BASE.comisionMedia) + ' por operación', 'text-brand-gold')}
      </div>
      <div class="${card} overflow-x-auto">
        <table class="w-full text-xs min-w-[820px]">
          <thead><tr class="text-[10px] uppercase tracking-wider text-slate-500 text-left bg-slate-950/60">
            <th class="p-3 font-bold">Comercial</th><th class="font-bold">Compradores activos</th><th class="font-bold">1.ª respuesta</th><th class="font-bold">Llamadas y WhatsApp</th><th class="font-bold">Visitas (mes)</th><th class="font-bold">Visita → oferta</th><th class="font-bold">Captaciones</th><th class="font-bold">Operaciones</th><th class="font-bold">Comisión</th><th class="font-bold pr-3">Tareas vencidas</th>
          </tr></thead>
          <tbody class="divide-y divide-slate-800">${filas.map(({ c, e }) => `<tr>
            <td class="p-3 font-bold text-white"><span class="inline-block w-2 h-2 rounded-full ${c.color} mr-1.5"></span>${c.nombre}</td>
            <td class="text-slate-200">${e.activos}</td>
            <td class="${e.respuesta > 3 ? 'text-red-300 font-bold' : e.respuesta > 1.5 ? 'text-amber-300' : 'text-emerald-300'}">${String(e.respuesta).replace('.', ',')} h</td>
            <td class="text-slate-200">${e.llamadas}</td>
            <td class="text-slate-200">${e.visitasMes}</td>
            <td class="text-slate-200">${e.conversion} %</td>
            <td class="text-slate-200">${e.captaciones}</td>
            <td class="text-white font-bold">${e.operaciones}</td>
            <td class="text-brand-gold font-bold">≈ ${eur(e.comision)}</td>
            <td class="pr-3">${e.vencidas ? chip(e.vencidas, 'bg-red-500/15 text-red-300 border-red-500/40') : chip('0', 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40')}</td>
          </tr>`).join('')}</tbody>
        </table>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="${card} p-5 space-y-3">
          <h3 class="font-display font-bold text-sm text-white">Visitas del mes por comercial</h3>
          ${barras(filas.map(f => ({ k: f.c.nombre, v: f.e.visitasMes, color: f.c.color })), 'bg-sky-500')}
        </div>
        <div class="${card} p-5 space-y-2.5">
          <h3 class="font-display font-bold text-sm text-white">Lo que el CRM le diría a cada comercial</h3>
          <p class="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300"><b class="text-white">Pablo</b> tarda 3,4 h en responder. Activar que Laura conteste sus contactos cuando esté en una visita.</p>
          <p class="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300"><b class="text-white">Marta</b> tiene 2 visitas sin opinión. Recordatorio automático a las 20:00.</p>
          <p class="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300"><b class="text-white">Lucía</b> convierte el ${equipo('lucia').conversion} % de las visitas en oferta. Pasarle los compradores con más presupuesto.</p>
        </div>
      </div>
      <p class="text-[11px] text-slate-500">Cifras de ejemplo. Con los datos reales de Izon se calculan solas a partir de las llamadas, mensajes y visitas registradas.</p>`;
  }

  // ------------------------------------------------------------------ Propietarios e inmuebles
  function renderPropietarios() {
    $('#crm-propietarios').innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="${card} p-5 space-y-3">
          <div class="flex items-center justify-between"><h3 class="font-display font-bold text-sm text-white">Captación de propietarios</h3><span class="text-[10px] text-slate-500">Valoraciones pedidas a Laura y al equipo</span></div>
          ${captaciones.map(p => `<div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div class="flex flex-wrap items-center justify-between gap-2"><span class="text-xs font-bold text-white">${esc(p.nombre)} <span class="font-normal text-slate-400">· ${esc(p.zona)}</span></span>${origenChip(p.origen)}</div>
            <p class="text-[11px] text-slate-300">${esc(p.paso)} · valor ${esc(p.valor)} · ${com(p.comercial).nombre}</p>
            <p class="text-[11px] text-sky-300">➜ ${esc(p.siguiente)}</p>
          </div>`).join('')}
        </div>
        <div class="${card} p-5 space-y-3">
          <div class="flex items-center justify-between"><h3 class="font-display font-bold text-sm text-white">Encargos y exclusivas</h3><span class="text-[10px] text-slate-500">Informe semanal automático al propietario</span></div>
          ${propietarios.map(p => {
            const i = inm(p.inmueble);
            return `<div class="p-3 rounded-xl bg-slate-950/60 border ${p.vence <= 21 ? 'border-violet-500/50' : 'border-slate-800'} flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div><p class="text-xs font-bold text-white">${esc(p.nombre)} <span class="font-normal text-slate-400">· ${esc(i.titulo)}</span></p>
              <p class="text-[11px] ${p.vence <= 21 ? 'text-violet-300 font-bold' : 'text-slate-400'}">${p.estado} · vence en ${p.vence} días · último informe hace ${p.ultimoInforme} días</p></div>
              <button data-crm-informe="${p.id}" class="shrink-0 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px]">📨 Enviar informe</button>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div class="${card} overflow-x-auto">
        <table class="w-full text-xs min-w-[780px]">
          <thead><tr class="text-[10px] uppercase tracking-wider text-slate-500 text-left bg-slate-950/60">
            <th class="p-3 font-bold">Inmueble</th><th class="font-bold">Precio</th><th class="font-bold">Comercial</th><th class="font-bold">Días publicado</th><th class="font-bold">Visitas</th><th class="font-bold">Interesados</th><th class="font-bold">Vs. mercado</th><th class="font-bold pr-3">Aviso</th>
          </tr></thead>
          <tbody class="divide-y divide-slate-800">${INMUEBLES.map(i => {
            const aviso = i.mercado > 5 && i.interesados === 0 ? chip('Proponer bajada de precio', 'bg-red-500/15 text-red-300 border-red-500/40')
              : i.interesados >= 4 ? chip('Mucho interés', 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40')
              : !i.exclusiva ? chip('Pedir exclusiva', 'bg-violet-500/15 text-violet-300 border-violet-500/40') : '<span class="text-slate-600">—</span>';
            return `<tr>
              <td class="p-3"><span class="font-bold text-white">${esc(i.titulo)}</span> <span class="text-slate-500">${i.ref}</span></td>
              <td class="text-slate-200">${i.alquiler ? eur(i.precio) + '/mes' : eur(i.precio)}</td>
              <td>${comChip(i.comercial)}</td>
              <td class="${i.dias > 60 ? 'text-red-300 font-bold' : 'text-slate-200'}">${i.dias}</td>
              <td class="text-slate-200">${i.visitas}</td>
              <td class="text-slate-200">${i.interesados}</td>
              <td class="${i.mercado > 0 ? 'text-red-300' : 'text-emerald-300'} font-bold">${i.mercado > 0 ? '+' : ''}${i.mercado} %</td>
              <td class="pr-3">${aviso}</td>
            </tr>`;
          }).join('')}</tbody>
        </table>
      </div>
      <p class="text-[11px] text-slate-500">«Vs. mercado» sale del radar de Idealista de esta misma propuesta. Precios y propietarios de ejemplo.</p>`;
  }

  // ------------------------------------------------------------------ Vista del comercial («Mi día»)
  const OBJETIVO_MES = 3; // operaciones, orientativo
  function renderComercial() {
    const c = com(comercialVista);
    const e = equipo(c.id);
    const mios = compradores.filter(b => b.comercial === c.id && b.etapa !== 'vendido');
    const misCitas = agenda.filter(a => a.comercial === c.id);
    const hoy = misCitas.filter(a => a.dia === HOY).sort((a, b) => a.hora.localeCompare(b.hora));
    const proximas = misCitas.filter(a => a.dia > HOY).sort((a, b) => a.dia - b.dia || a.hora.localeCompare(b.hora));
    const mediaResp = COMERCIALES.reduce((s2, x) => s2 + EQUIPO_BASE[x.id].respuesta, 0) / COMERCIALES.length;
    const misInmuebles = INMUEBLES.filter(i => i.comercial === c.id).map(i => i.id);

    const tareas = [];
    mios.filter(b => b.etapa === 'duda').forEach(b => tareas.push({ urg: b.dias >= 3, icono: '🟠', texto: `Reactivar a ${b.nombre}`, nota: `${b.duda} Último contacto ${diasTxt(b.dias)}.`, boton: `<button data-crm-wa="${b.id}" class="shrink-0 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px]">💬 WhatsApp</button>` }));
    mios.filter(b => b.etapa === 'visitado' && b.sinOpinion).forEach(b => tareas.push({ urg: true, icono: '📝', texto: `Apuntar la opinión de ${b.nombre}`, nota: 'Visitó el inmueble y aún no consta qué le pareció.', boton: `<button data-crm-opinion="${b.id}" class="shrink-0 px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px]">Pedir opinión</button>` }));
    mios.filter(b => b.etapa === 'cualificado').forEach(b => tareas.push({ urg: b.dias >= 3, icono: '📅', texto: `Proponer visita a ${b.nombre}`, nota: `${b.busca} · ${b.pago}.`, boton: `<button data-crm-wa="${b.id}" class="shrink-0 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px]">💬 Proponer</button>` }));
    mios.filter(b => b.etapa === 'oferta').forEach(b => tareas.push({ urg: false, icono: '🤝', texto: `Seguir la oferta de ${b.nombre}`, nota: `Ofrecen ${eur(b.oferta)}. El propietario la está viendo en su portal.`, boton: `<button data-crm-ficha="${b.id}" class="shrink-0 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px]">Abrir ficha</button>` }));
    propietarios.filter(p => misInmuebles.includes(p.inmueble) && p.ultimoInforme >= 7).forEach(p => tareas.push({ urg: false, icono: '📨', texto: `Enviar el informe semanal a ${p.nombre}`, nota: `Último informe hace ${p.ultimoInforme} días.`, boton: `<button data-crm-informe="${p.id}" class="shrink-0 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px]">📨 Enviar</button>` }));
    propietarios.filter(p => misInmuebles.includes(p.inmueble) && p.vence <= 21).forEach(p => tareas.push({ urg: true, icono: '🏠', texto: `Renovar el encargo de ${p.nombre}`, nota: `Vence en ${p.vence} días.`, boton: '' }));
    tareas.sort((a, b) => b.urg - a.urg);

    const cita = a => `<button ${a.comprador ? `data-crm-ficha="${a.comprador}"` : ''} class="w-full text-left p-2.5 rounded-xl border ${TIPOS[a.tipo].cls} ${a.nuevo ? 'ring-2 ring-amber-400' : ''}">
      <span class="block text-xs font-bold">${a.dia === HOY ? '' : DIAS[a.dia].k + ' ' + DIAS[a.dia].n + ' · '}${a.hora} · ${TIPOS[a.tipo].nombre}${a.nuevo ? ' · nueva' : ''}</span>
      <span class="block text-[11px]">${esc(a.texto)}</span>
      <span class="block text-[10px] opacity-75">${a.origen === 'Laura' ? '📞 La agendó Laura' : a.origen === 'WhatsApp' ? '💬 El cliente eligió hora por WhatsApp' : '👤 La agendó usted'}</span>
    </button>`;

    $('#crm-comercial').innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><p class="text-[11px] font-bold uppercase tracking-wider text-sky-300">Vista del comercial · en el móvil o en el ordenador</p>
        <h3 class="font-display text-xl font-extrabold text-white">Buenos días, ${c.nombre} <span class="text-slate-400 font-semibold text-sm">· miércoles 14</span></h3></div>
        <div class="flex flex-wrap gap-1.5">${COMERCIALES.map(x => `<button data-ver-comercial="${x.id}" class="px-3 py-1.5 rounded-lg text-xs font-bold border ${x.id === c.id ? 'bg-brand-blue text-white border-brand-blue' : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'}">${x.nombre}</button>`).join('')}</div>
      </div>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${kpi('Mis compradores activos', mios.length, `${mios.filter(b => b.etapa === 'duda').length} en duda · ${mios.filter(b => b.temp === 'Caliente').length} calientes 🔥`)}
        ${kpi('Mis visitas esta semana', misCitas.filter(a => a.tipo === 'visita' || a.tipo === 'segunda').length, hoy.length === 1 ? '1 cita hoy' : `${hoy.length} citas hoy`)}
        ${kpi('Mi primera respuesta', String(e.respuesta).replace('.', ',') + ' h', `Media del equipo ${String(mediaResp.toFixed(1)).replace('.', ',')} h`, e.respuesta <= mediaResp ? 'text-emerald-300' : 'text-amber-300')}
        ${kpi('Mis operaciones del mes', `${e.operaciones} / ${OBJETIVO_MES}`, `Comisión ≈ ${eur(e.comision)} · orientativa`, 'text-brand-gold')}
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div class="lg:col-span-7 ${card} p-5 space-y-2.5">
          <div class="flex items-center justify-between"><h3 class="font-display font-bold text-sm text-white">Mis tareas de hoy</h3><span class="text-[10px] text-slate-500">${tareas.length} pendientes · el CRM las ordena por urgencia</span></div>
          ${tareas.map(t => `<div class="p-3 rounded-xl bg-slate-950/60 border ${t.urg ? 'border-amber-500/50' : 'border-slate-800'} flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div><p class="text-xs font-bold text-white">${t.icono} ${esc(t.texto)}</p><p class="text-[11px] text-slate-400">${esc(t.nota)}</p></div>${t.boton}
          </div>`).join('') || '<p class="text-xs text-emerald-300 p-3">✅ Sin tareas pendientes. Todo al día.</p>'}
        </div>
        <div class="lg:col-span-5 space-y-4">
          <div class="${card} p-5 space-y-2">
            <h3 class="font-display font-bold text-sm text-white">Hoy</h3>
            ${hoy.map(cita).join('') || '<p class="text-xs text-slate-500">Sin citas hoy.</p>'}
          </div>
          <div class="${card} p-5 space-y-2">
            <h3 class="font-display font-bold text-sm text-white">Próximos días</h3>
            ${proximas.map(cita).join('') || '<p class="text-xs text-slate-500">Sin citas.</p>'}
          </div>
        </div>
      </div>
      <div class="${card} p-5 space-y-3">
        <h3 class="font-display font-bold text-sm text-white">Mis compradores</h3>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">${mios.map(b => `<button data-crm-ficha="${b.id}" class="text-left p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-sky-400 transition space-y-1">
          <div class="flex items-center justify-between gap-2"><span class="text-xs font-bold text-white">${esc(b.nombre)}</span>${b.temp === 'Caliente' ? '🔥' : ''}</div>
          <div class="flex flex-wrap gap-1">${etapaChip(b.etapa)}${origenChip(b.origen)}</div>
          <p class="text-[10px] text-slate-500">${esc(b.busca)}</p>
        </button>`).join('')}</div>
      </div>
      <p class="text-[11px] text-slate-500">Cada comercial solo ve lo suyo. Laura le pasa los contactos ya cualificados y el dueño ve el conjunto en su panel.</p>`;
  }

  // ------------------------------------------------------------------ Portal del propietario que vende
  const OPINIONES = {
    i1: [
      { fecha: '13/10', texto: 'Le gustó mucho la distribución y la luz. Quiere volver con su pareja.', interes: 'Alto' },
      { fecha: '09/10', texto: 'Le encanta la zona. Le preocupa el coste de reformar la cocina y el baño.', interes: 'Alto' },
      { fecha: '05/10', texto: 'Buscaba garaje incluido. Descarta la vivienda.', interes: 'Bajo' },
      { fecha: '02/10', texto: 'Le parece bien de precio para el centro. Está comparando con otra vivienda.', interes: 'Medio' }
    ],
    i2: [
      { fecha: '13/10', texto: 'Les encaja todo. Han presentado una oferta.', interes: 'Alto' },
      { fecha: '10/10', texto: 'Segunda visita. Dudan con la financiación; les ponemos en contacto con el asesor hipotecario.', interes: 'Alto' },
      { fecha: '07/10', texto: 'Le pareció algo ruidosa la calle por la noche.', interes: 'Medio' }
    ],
    i4: [
      { fecha: '11/10', texto: 'Le gustó la parcela. Pendiente de comentar con su familia.', interes: 'Medio' },
      { fecha: '06/10', texto: 'Le encanta. Necesita vender antes su piso; le ayudamos con la valoración.', interes: 'Alto' }
    ]
  };
  const RECOMENDACION = {
    i1: 'El precio está un 14 % por debajo de la media de la zona y hay mucho interés. Recomendamos mantener el precio: esperamos ofertas en las próximas dos semanas.',
    i2: 'Hay una oferta firme de 182.000 €. Con dos interesados más, una contraoferta cerca de 186.000 € es razonable.',
    i4: 'Buen interés para una vivienda de este tipo. Si en tres semanas no hay oferta, valoraríamos ajustar el precio un 3 %.'
  };
  const CLAVES_INMUEBLE = [['Villacerrada', 'i1'], ['Rosario', 'i2'], ['Industria', 'i3'], ['Chalet', 'i4'], ['Ático', 'i5'], ['Feria', 'i7'], ['Fátima', 'i8']];
  const inmuebleDeCita = a => a.comprador ? comp(a.comprador).inmueble : ((CLAVES_INMUEBLE.find(([k]) => a.texto.includes(k)) || [])[1]);
  const PORTAL = ['p1', 'p2', 'p4'];

  function renderPropietario() {
    const p = propietarios.find(x => x.id === propietarioVista);
    const i = inm(p.inmueble);
    const c = com(i.comercial);
    const citas = agenda.filter(a => (a.tipo === 'visita' || a.tipo === 'segunda') && inmuebleDeCita(a) === i.id);
    const proximas = citas.filter(a => !a.hecha && a.dia >= HOY).sort((a, b) => a.dia - b.dia || a.hora.localeCompare(b.hora));
    const ofertas = compradores.filter(b => b.inmueble === i.id && (b.etapa === 'oferta' || b.etapa === 'arras'));
    const interesados = compradores.filter(b => b.inmueble === i.id && ['visita', 'visitado', 'duda', 'oferta'].includes(b.etapa)).length;
    const fases = ['Valoración', 'Encargo firmado', 'Fotos y publicación', 'Visitas', 'Oferta', 'Arras', 'Notaría'];
    const faseActual = ofertas.some(b => b.etapa === 'arras') ? 5 : ofertas.length ? 4 : 3;
    const vistasPortal = i.visitas * 46 + i.dias * 9;
    const nivel = { Alto: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40', Medio: 'bg-amber-500/15 text-amber-300 border-amber-500/40', Bajo: 'bg-slate-700/40 text-slate-300 border-slate-600' };

    $('#crm-propietario').innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><p class="text-[11px] font-bold uppercase tracking-wider text-brand-gold">Portal del propietario · lo que ve quien vende su casa con Izon</p>
        <h3 class="font-display text-xl font-extrabold text-white">Hola, ${esc(p.nombre.replace(' (ejemplo)', ''))} <span class="text-slate-400 font-semibold text-sm">· datos de ejemplo</span></h3></div>
        <div class="flex flex-wrap gap-1.5">${PORTAL.map(id => { const q = propietarios.find(x => x.id === id); return `<button data-ver-propietario="${id}" class="px-3 py-1.5 rounded-lg text-xs font-bold border ${id === p.id ? 'bg-brand-gold text-slate-950 border-brand-gold' : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'}">${esc((t => t[0].toUpperCase() + t.slice(1))(inm(q.inmueble).titulo.split('·').pop().trim()))}</button>`; }).join('')}</div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div class="lg:col-span-8 ${card} p-5 space-y-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div><p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Su vivienda · ref. ${i.ref}</p>
            <p class="font-display text-lg font-extrabold text-white">${esc(i.titulo)}</p>
            <p class="text-xs text-slate-400">${i.m2} m² · ${esc(i.zona)} · ${p.estado} · publicada hace ${i.dias} días</p></div>
            <p class="font-display text-2xl font-extrabold text-brand-gold">${eur(i.precio)}</p>
          </div>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">En qué punto está la venta</p>
            <div class="grid grid-cols-7 gap-1">${fases.map((f, k) => `<div class="space-y-1 text-center">
              <div class="h-2 rounded-full ${k < faseActual ? 'bg-emerald-500' : k === faseActual ? 'bg-brand-gold animate-pulse' : 'bg-slate-800'}"></div>
              <p class="text-[9px] sm:text-[10px] leading-tight ${k === faseActual ? 'text-brand-gold font-bold' : k < faseActual ? 'text-emerald-300' : 'text-slate-500'}">${f}</p>
            </div>`).join('')}</div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800"><p class="text-[10px] text-slate-400">Personas que vieron el anuncio</p><p class="font-display text-xl font-extrabold text-white">${miles(vistasPortal)}</p></div>
            <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800"><p class="text-[10px] text-slate-400">Visitas hechas</p><p class="font-display text-xl font-extrabold text-white">${i.visitas}</p></div>
            <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800"><p class="text-[10px] text-slate-400">Visitas próximas</p><p class="font-display text-xl font-extrabold text-sky-300">${proximas.length}</p></div>
            <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800"><p class="text-[10px] text-slate-400">Compradores interesados</p><p class="font-display text-xl font-extrabold text-emerald-300">${Math.max(interesados, i.interesados)}</p></div>
          </div>
        </div>
        <div class="lg:col-span-4 ${card} p-5 space-y-3">
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Su comercial</p>
          <div class="flex items-center gap-3"><span class="w-11 h-11 rounded-full ${c.color} text-slate-950 font-black flex items-center justify-center">${c.nombre[0]}</span>
          <div><p class="text-sm font-bold text-white">${c.nombre}</p><p class="text-[11px] text-slate-400">Izon Consulting · responde en el día</p></div></div>
          <button data-prop-accion="chat" class="w-full px-3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs">💬 Escribir a ${c.nombre}</button>
          <button data-prop-accion="laura" class="w-full px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs">📞 Llamar (le atiende Laura 24/7)</button>
          <div class="pt-1 space-y-1.5">
            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sus documentos</p>
            ${['Hoja de encargo firmada', 'Nota simple', 'Certificado energético', 'Informe de valoración'].map(d => `<button data-prop-accion="doc" class="w-full text-left px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-200 hover:border-slate-600">📄 ${d}</button>`).join('')}
          </div>
        </div>
      </div>

      ${ofertas.length ? `<div class="p-4 rounded-2xl bg-brand-gold/10 border border-brand-gold/40 space-y-2">
        <p class="text-sm font-extrabold text-brand-gold">🤝 Ofertas recibidas</p>
        ${ofertas.map(b => `<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <div><p class="text-sm font-bold text-white">${b.etapa === 'arras' ? 'Arras firmadas' : 'Oferta de ' + eur(b.oferta)}</p><p class="text-[11px] text-slate-400">Comprador con ${esc(b.pago.toLowerCase())} · ${c.nombre} se la explica por teléfono</p></div>
          ${b.etapa === 'oferta' ? `<div class="flex flex-wrap gap-1.5">
            <button data-prop-accion="aceptar" data-oferta="${b.id}" class="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px]">Aceptar</button>
            <button data-prop-accion="contra" data-oferta="${b.id}" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px]">Contraoferta</button>
          </div>` : chip('En curso', 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40')}
        </div>`).join('')}
      </div>` : ''}

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="${card} p-5 space-y-2.5">
          <h3 class="font-display font-bold text-sm text-white">Visitas a su vivienda</h3>
          ${proximas.map(a => `<div class="p-3 rounded-xl border ${TIPOS[a.tipo].cls} ${a.nuevo ? 'ring-2 ring-amber-400' : ''}"><p class="text-xs font-bold">📅 ${DIAS[a.dia].largo} ${DIAS[a.dia].n} a las ${a.hora} · ${TIPOS[a.tipo].nombre}${a.nuevo ? ' · nueva' : ''}</p><p class="text-[11px] opacity-80">Con ${com(a.comercial).nombre}. Le avisamos si necesita estar o dejar la llave.</p></div>`).join('') || '<p class="text-xs text-slate-500">No hay visitas programadas esta semana.</p>'}
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 pt-2">Qué opinaron los compradores</p>
          ${(OPINIONES[i.id] || []).map(o => `<div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div class="flex items-center justify-between gap-2"><span class="text-[11px] text-slate-400">Visita del ${o.fecha} · comprador anónimo</span>${chip('Interés ' + o.interes.toLowerCase(), nivel[o.interes])}</div>
            <p class="text-xs text-slate-200">${esc(o.texto)}</p>
          </div>`).join('')}
        </div>
        <div class="${card} p-5 space-y-3">
          <div class="flex items-center justify-between"><h3 class="font-display font-bold text-sm text-white">Informe semanal de Izon</h3>${p.informeHoy ? chip('Nuevo · recibido hoy', 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40') : `<span class="text-[10px] text-slate-500">Recibido hace ${p.ultimoInforme} días</span>`}</div>
          <p class="text-[11px] text-slate-400 -mt-2">Semana del 5 al 11 de octubre</p>
          ${barras([{ k: 'Personas que vieron el anuncio', v: Math.round(vistasPortal / 3), label: miles(Math.round(vistasPortal / 3)) }, { k: 'Contactos recibidos', v: Math.round(i.visitas * 1.6) }, { k: 'Visitas', v: Math.max(1, Math.round(i.visitas / 3)) }], 'bg-brand-gold')}
          <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Su precio frente al mercado</p>
            <p class="text-sm font-bold ${i.mercado > 0 ? 'text-red-300' : 'text-emerald-300'}">${i.mercado > 0 ? '+' : ''}${i.mercado} % respecto a la media de la zona en Idealista</p>
          </div>
          <div class="p-3 rounded-xl bg-brand-blue/10 border border-sky-500/40">
            <p class="text-[10px] font-bold uppercase tracking-wider text-sky-300">Recomendación de ${c.nombre}</p>
            <p class="text-xs text-slate-200 mt-1">${esc(RECOMENDACION[i.id] || '')}</p>
          </div>
          <button data-prop-accion="pdf" class="w-full px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs">⬇️ Descargar informe en PDF</button>
        </div>
      </div>
      <p class="text-[11px] text-slate-500">El propietario entra con un enlace privado desde el móvil. Ve lo que pasa con su casa sin tener que llamar, y la agencia gana confianza para pedir la exclusiva.</p>`;
  }

  function accionPropietario(acc, id) {
    const p = propietarios.find(x => x.id === propietarioVista);
    const c = com(inm(p.inmueble).comercial);
    if (acc === 'aceptar' || acc === 'contra') {
      const b = comp(id);
      if (acc === 'aceptar') {
        b.etapa = 'arras';
        b.historial.unshift({ fecha: '14/10', canal: 'Comercial', texto: `El propietario acepta la oferta de ${eur(b.oferta)} desde su portal. Preparar arras.` });
        toast(`✅ Oferta aceptada. ${c.nombre} recibe el aviso y prepara el contrato de arras.`);
      } else {
        b.historial.unshift({ fecha: '14/10', canal: 'Comercial', texto: 'El propietario pide contraofertar desde su portal (186.000 €).' });
        toast(`↩️ Contraoferta de 186.000 € enviada a ${c.nombre}, que se la traslada hoy al comprador.`);
      }
      render(); return;
    }
    const msg = {
      chat: `💬 Mensaje enviado a ${c.nombre}. Le contestará en el día por WhatsApp.`,
      laura: '📞 Laura atiende al propietario, resuelve la duda o le pasa la llamada a su comercial.',
      doc: '📄 Documento abierto (ejemplo).',
      pdf: '⬇️ Informe en PDF descargado (ejemplo).'
    };
    toast(msg[acc] || 'Hecho.');
  }

  // ------------------------------------------------------------------ Eventos
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-crm-tab],[data-crm-go],[data-crm-duda],[data-crm-ficha],[data-crm-close],[data-crm-wa],[data-crm-paso],[data-crm-enviar],[data-crm-elegir],[data-crm-laura],[data-crm-opinion],[data-crm-informe],[data-agenda-filtro],[data-comp-filtro],[data-conv-filtro],[data-conv],[data-crm-rol],[data-ver-comercial],[data-ver-propietario],[data-prop-accion]');
    if (!t || !t.closest('#crm-inmo, #crmDrawer, #crmRolTop')) return;
    const d = t.dataset;
    if (d.crmRol) {
      cambiarRol(d.crmRol);
      if ('crmScroll' in d) { const top = $('#crmRolTop'); if (top) top.open = false; $('#crm-inmo').scrollIntoView({ behavior: 'smooth' }); }
      return;
    }
    if (d.verComercial) { comercialVista = d.verComercial; render(); return; }
    if (d.verPropietario) { propietarioVista = d.verPropietario; render(); return; }
    if (d.propAccion) { accionPropietario(d.propAccion, d.oferta); return; }
    if (d.crmTab) { mostrar(d.crmTab); return; }
    if (d.crmGo) {
      if (d.crmGo === 'compradores') filtroComp = d.filtro || null;
      if (d.crmGo === 'conversaciones') filtroConv = d.filtro || 'todos';
      mostrar(d.crmGo); return;
    }
    if ('crmDuda' in d) { filtroComp = 'duda'; mostrar('compradores'); return; }
    if (d.crmFicha) { abrirFicha(d.crmFicha); return; }
    if ('crmClose' in d) { cerrarFicha(); return; }
    if (d.crmWa) { if (fichaActual !== d.crmWa) abrirFicha(d.crmWa); paso = 'wa'; pintarFicha(); return; }
    if (d.crmPaso) { paso = d.crmPaso; pintarFicha(); return; }
    if ('crmEnviar' in d) { paso = 'movil'; pintarFicha(); toast('💬 WhatsApp enviado. Esperando a que el cliente elija hora…'); return; }
    if (d.crmElegir !== undefined) { elegirHueco(Number(d.crmElegir)); return; }
    if (d.crmLaura) { lauraLlama(d.crmLaura); return; }
    if (d.crmOpinion) {
      const b = comp(d.crmOpinion);
      b.sinOpinion = false;
      b.historial.unshift({ fecha: '14/10', canal: 'WhatsApp', texto: 'Se le pide opinión por WhatsApp: «¿Qué le pareció la vivienda? ¿Le encaja?». La respuesta se guardará aquí.' });
      toast(`📝 Pregunta enviada a ${pila(b.nombre)}. Su respuesta quedará en la ficha.`);
      pintarFicha(); render(); return;
    }
    if (d.crmInforme) {
      const p = propietarios.find(x => x.id === d.crmInforme);
      const i = inm(p.inmueble);
      p.ultimoInforme = 0;
      p.informeHoy = true;
      toast(`📨 Informe enviado: «Esta semana su vivienda tuvo ${Math.max(1, Math.round(i.visitas / 3))} visitas y ${i.interesados} interesados. Opiniones y próximos pasos dentro». También aparece en su portal.`);
      render(); return;
    }
    if (d.agendaFiltro) { filtroAgenda = d.agendaFiltro; render(); return; }
    if (d.compFiltro !== undefined) { filtroComp = d.compFiltro || null; render(); return; }
    if (d.convFiltro) { filtroConv = d.convFiltro; render(); return; }
    if (d.conv) { convActual = d.conv; render(); }
  });
  document.addEventListener('change', e => {
    const s = e.target.closest('[data-crm-asignar]');
    if (!s || !s.value) return;
    const b = comp(s.dataset.crmAsignar);
    b.comercial = s.value;
    b.historial.unshift({ fecha: '14/10', canal: 'Comercial', texto: `Asignado a ${com(s.value).nombre}.` });
    toast(`👤 ${pila(b.nombre)} ahora lo lleva ${com(s.value).nombre}. Se le avisa en el móvil.`);
    pintarFicha(); render();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('#crmDrawer') && !$('#crmDrawer').classList.contains('hidden')) cerrarFicha();
  });

  function init() {
    if (!$('#crm-panel')) return;
    // El panel lateral y el aviso cuelgan del body para quedar por encima de la barra fija.
    document.body.appendChild($('#crmDrawer'));
    document.body.appendChild($('#crmToast'));
    cambiarRol('dueno');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
