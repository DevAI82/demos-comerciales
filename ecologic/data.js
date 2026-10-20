/* =========================================================================
   ECOLOGIC CAR WASH PREMIUM — Datos de la demo comercial (Altera)
   Fuente: ecologiccarwash.es (revisado el 20/10/2026).
   Precios marcados con `orientativo: true` NO aparecen publicados en su web
   y están pendientes de validar con el cliente.
   ========================================================================= */

window.ECO = window.ECO || {};

ECO.CENTROS = [
  // id, nombre, comunidad, dirección, teléfono, lat, lng, stopWash
  { id: 'algeciras',   nombre: 'Algeciras',                 comunidad: 'Andalucía',          dir: 'Parking El Corte Inglés, C/ Juan Pérez Arriete s/n, 11204 Algeciras',              tel: '656 67 03 91', lat: 36.131, lng: -5.454, sw: true },
  { id: 'cadiz',       nombre: 'Cádiz',                     comunidad: 'Andalucía',          dir: 'Parking El Corte Inglés, Av. las Cortes de Cádiz 1, 11012 Cádiz',                tel: '657 199 251', lat: 36.512, lng: -6.278, sw: true },
  { id: 'granada-ar',  nombre: 'Granada (Arabial)',         comunidad: 'Andalucía',          dir: 'Parking El Corte Inglés, CC Arabial, C/ Arabial 97, 18003 Granada',               tel: '615 964 995', lat: 37.168, lng: -3.606, sw: true },
  { id: 'granada-ge',  nombre: 'Granada (Genil)',           comunidad: 'Andalucía',          dir: 'Parking El Corte Inglés Genil, Carrera de la Virgen 22, 18005 Granada',           tel: '919 214 688', lat: 37.170, lng: -3.597, sw: true },
  { id: 'huelva',      nombre: 'Huelva',                    comunidad: 'Andalucía',          dir: 'Parking El Corte Inglés, CC Costa Luz, Av. Federico Molina Orta 1, 21003 Huelva',  tel: '685 72 83 05', lat: 37.258, lng: -6.949, sw: true },
  { id: 'jerez',       nombre: 'Jerez de la Frontera',      comunidad: 'Andalucía',          dir: 'Parking El Corte Inglés, Av. Andalucía 34, 11407 Jerez de la Frontera',           tel: '656 61 29 44', lat: 36.686, lng: -6.126, sw: true },
  { id: 'sevilla-ne',  nombre: 'Sevilla (Nervión)',         comunidad: 'Andalucía',          dir: 'Parking El Corte Inglés, C/ Luis Montoto 122-128, 41005 Sevilla',                 tel: '695 10 48 51', lat: 37.383, lng: -5.975, sw: true },
  { id: 'sevilla-sj',  nombre: 'Sevilla (S. Juan Aznalfarache)', comunidad: 'Andalucía',     dir: 'Parking El Corte Inglés, Av. de las Erillas s/n, 41920 San Juan de Aznalfarache', tel: '691 79 32 30', lat: 37.358, lng: -6.031, sw: true },
  { id: 'zaragoza-pv', nombre: 'Zaragoza (Puerto Venecia)', comunidad: 'Aragón',             dir: 'Parking El Corte Inglés, CC Puerto Venecia, Av. Isla de Murano 15, 50021 Zaragoza', tel: '656 538 327', lat: 41.616, lng: -0.896 },
  { id: 'zaragoza-sa', nombre: 'Zaragoza (Sagasta)',        comunidad: 'Aragón',             dir: 'Parking El Corte Inglés Sagasta, P.º de Sagasta 3, 50008 Zaragoza',               tel: '657 943 186', lat: 41.645, lng: -0.880 },
  { id: 'gijon',       nombre: 'Gijón',                     comunidad: 'Asturias',           dir: 'Parking El Corte Inglés (planta -1), CC Ramón Areces 2, 33211 Gijón',             tel: '635 852 572', lat: 43.525, lng: -5.660 },
  { id: 'santander',   nombre: 'Santander',                 comunidad: 'Cantabria',          dir: 'Parking El Corte Inglés, Nueva Montaña s/n, 39011 Santander',                     tel: '657 803 675', lat: 43.462, lng: -3.810 },
  { id: 'guadalajara', nombre: 'Guadalajara',               comunidad: 'Castilla-La Mancha', dir: 'Parking El Corte Inglés, Av. Eduardo Guitián s/n, 19002 Guadalajara',             tel: '635 266 265', lat: 40.633, lng: -3.166, sw: true },
  { id: 'albacete',    nombre: 'Albacete',                  comunidad: 'Castilla-La Mancha', dir: 'Parking El Corte Inglés, Av. de España 30, 02002 Albacete',                       tel: '605 026 145', lat: 38.994, lng: -1.858, sw: true },
  { id: 'salamanca',   nombre: 'Salamanca',                 comunidad: 'Castilla y León',    dir: 'Parking El Corte Inglés, C/ María Auxiliadora 71-85, 37004 Salamanca',            tel: '645 606 657', lat: 40.970, lng: -5.663 },
  { id: 'leon',        nombre: 'León',                      comunidad: 'Castilla y León',    dir: 'Parking El Corte Inglés, C/ Fray Luis de León 29, 24005 León',                    tel: '655 477 859', lat: 42.599, lng: -5.567, sw: true },
  { id: 'valladolid',  nombre: 'Valladolid',                comunidad: 'Castilla y León',    dir: 'Parking El Corte Inglés, P.º de Zorrilla 130, 47006 Valladolid',                  tel: '685 96 07 36', lat: 41.640, lng: -4.733 },
  { id: 'bcn-candrago',nombre: 'Barcelona (Can Dragó)',     comunidad: 'Cataluña',           dir: "Parking El Corte Inglés, Passeig d'Andreu Nin 51, 08016 Barcelona",               tel: '685 209 969', lat: 41.432, lng: 2.181 },
  { id: 'bcn-diagonal',nombre: 'Barcelona (Diagonal)',      comunidad: 'Cataluña',           dir: 'Parking El Corte Inglés, Av. Diagonal 617, 08036 Barcelona',                      tel: '658 091 641', lat: 41.389, lng: 2.131 },
  { id: 'cornella',    nombre: 'Barcelona (Cornellà)',      comunidad: 'Cataluña',           dir: 'Parking El Corte Inglés, CC Cornellà, C/ Salvador Dalí 15-19, 08940 Cornellà',   tel: '605 935 812', lat: 41.356, lng: 2.074 },
  { id: 'girona',      nombre: 'Girona',                    comunidad: 'Cataluña',           dir: 'Parking El Corte Inglés, C/ Barcelona 106, 17003 Girona',                         tel: '653 326 260', lat: 41.979, lng: 2.819 },
  { id: 'tarragona',   nombre: 'Tarragona',                 comunidad: 'Cataluña',           dir: 'Parking El Corte Inglés, Rambla President Lluís Companys 7, 43005 Tarragona',     tel: '656 537 662', lat: 41.119, lng: 1.245 },
  { id: 'badajoz',     nombre: 'Badajoz (Pza. Conquistadores)', comunidad: 'Extremadura',    dir: 'Parking El Corte Inglés, Plaza Conquistadores s/n, 06005 Badajoz',                tel: '651 804 489', lat: 38.878, lng: -6.970, sw: true },
  { id: 'coruna',      nombre: 'A Coruña (Ramón y Cajal)',  comunidad: 'Galicia',            dir: 'Parking El Corte Inglés, Rúa Ramón y Cajal 57-59, 15006 A Coruña',               tel: '658 138 224', lat: 43.362, lng: -8.411 },
  { id: 'santiago',    nombre: 'Santiago de Compostela',    comunidad: 'Galicia',            dir: 'Parking El Corte Inglés, Rúa do Restollal 50, 15702 Santiago de Compostela',      tel: '655 694 334', lat: 42.880, lng: -8.545 },
  { id: 'alcala',      nombre: 'Alcalá de Henares',         comunidad: 'Madrid',             dir: 'Av. Juan Carlos I s/n, 28806 Alcalá de Henares',                                 tel: '675 970 067', lat: 40.482, lng: -3.364 },
  { id: 'alcorcon',    nombre: 'Alcorcón (S. J. Valderas)', comunidad: 'Madrid',             dir: 'Parking El Corte Inglés, CC San José de Valderas, Ctra. Extremadura km 12,5, 28925 Alcorcón', tel: '605 451 676', lat: 40.345, lng: -3.824, sw: true },
  { id: 'getafe',      nombre: 'Getafe (El Bercial)',       comunidad: 'Madrid',             dir: 'Parking El Corte Inglés, Av. Cmte. José Manuel Ripollés 2, 28905 Getafe',         tel: '685 335 794', lat: 40.322, lng: -3.749 },
  { id: 'goya',        nombre: 'Madrid (Goya)',             comunidad: 'Madrid',             dir: 'Parking El Corte Inglés de Goya, C/ de Goya 76, 28009 Madrid',                    tel: '653 13 18 99', lat: 40.425, lng: -3.676 },
  { id: 'princesa',    nombre: 'Madrid (Princesa)',         comunidad: 'Madrid',             dir: 'Parking El Corte Inglés, C/ de la Princesa 56, 28008 Madrid',                     tel: '656 26 55 64', lat: 40.430, lng: -3.715, sw: true },
  { id: 'sanchinarro', nombre: 'Madrid (Sanchinarro)',      comunidad: 'Madrid',             dir: 'Parking El Corte Inglés, C/ Margarita de Parma 1, 28050 Madrid',                  tel: '652 069 854', lat: 40.493, lng: -3.660 },
  { id: 'xanadu',      nombre: 'Xanadú (Arroyomolinos)',    comunidad: 'Madrid',             dir: 'Parking El Corte Inglés Xanadú, C/ Puerto de Navacerrada 1, 28939 Arroyomolinos', tel: '695 224 959', lat: 40.296, lng: -3.935 },
  { id: 'cartagena',   nombre: 'Cartagena',                 comunidad: 'Murcia',             dir: 'Parking El Corte Inglés, Alameda de San Antón 52, 30205 Cartagena',               tel: '665 876 012', lat: 37.606, lng: -0.986 },
  { id: 'murcia',      nombre: 'Murcia',                    comunidad: 'Murcia',             dir: 'Parking El Corte Inglés, Av. de la Libertad 1, 30009 Murcia',                     tel: '656 537 549', lat: 37.984, lng: -1.128, sw: true },
  { id: 'pamplona',    nombre: 'Pamplona',                  comunidad: 'Navarra',            dir: 'Parking El Corte Inglés, C/ Estella 9, 31002 Pamplona',                           tel: '654 691 404', lat: 42.812, lng: -1.645 },
  { id: 'bilbao',      nombre: 'Bilbao',                    comunidad: 'País Vasco',         dir: 'Parking El Corte Inglés, CC Gran Vía, Don Diego López de Haro 7-9, 48001 Bilbao', tel: '654 547 199', lat: 43.263, lng: -2.935 },
];

/* Palabras clave que el agente reconoce para cada centro (WhatsApp / voz) */
ECO.ALIAS = {
  algeciras: ['algeciras'], cadiz: ['cadiz'], 'granada-ar': ['arabial'], 'granada-ge': ['genil'],
  huelva: ['huelva'], jerez: ['jerez'], 'sevilla-ne': ['nervion'], 'sevilla-sj': ['aznalfarache', 'san juan'],
  'zaragoza-pv': ['puerto venecia', 'venecia'], 'zaragoza-sa': ['sagasta'], gijon: ['gijon'], santander: ['santander'],
  guadalajara: ['guadalajara'], albacete: ['albacete'], salamanca: ['salamanca'], leon: ['leon'], valladolid: ['valladolid'],
  'bcn-candrago': ['can drago'], 'bcn-diagonal': ['diagonal'], cornella: ['cornella'], girona: ['girona', 'gerona'],
  tarragona: ['tarragona'], badajoz: ['badajoz'], coruna: ['coruna'], santiago: ['santiago', 'compostela'],
  alcala: ['alcala'], alcorcon: ['alcorcon', 'valderas'], getafe: ['getafe', 'bercial'], goya: ['goya'],
  princesa: ['princesa', 'arguelles'], sanchinarro: ['sanchinarro'], xanadu: ['xanadu', 'arroyomolinos'],
  cartagena: ['cartagena'], murcia: ['murcia'], pamplona: ['pamplona', 'iruna'], bilbao: ['bilbao'],
};
/* Ciudades con varios centros: el agente pregunta cuál */
ECO.CIUDADES = {
  madrid: ['goya', 'princesa', 'sanchinarro', 'xanadu', 'alcorcon', 'getafe', 'alcala'],
  barcelona: ['bcn-diagonal', 'bcn-candrago', 'cornella'],
  sevilla: ['sevilla-ne', 'sevilla-sj'],
  granada: ['granada-ar', 'granada-ge'],
  zaragoza: ['zaragoza-pv', 'zaragoza-sa'],
};

ECO.TAMANOS = [
  { id: 'P',  nombre: 'Pequeño', ej: 'Ibiza, Clio, 208, Mini', icon: '🚗' },
  { id: 'M',  nombre: 'Mediano', ej: 'Golf, León, Focus, Serie 1', icon: '🚙' },
  { id: 'G',  nombre: 'Grande',  ej: 'SUV, Qashqai, Tiguan, A6, Model Y', icon: '🚐' },
  { id: '7P', nombre: '7 plazas', ej: 'Monovolumen, SUV 7P, furgoneta', icon: '🚌' },
];

/* Tarifas publicadas (IVA incluido) — [Pequeño, Mediano, Grande, 7P] */
ECO.SERVICIOS = [
  { id: 'bas-int',  grupo: 'Limpieza básica', nombre: 'Básica interior',          precios: [19.99, 24.99, 29.99, 34.99], min: 45 },
  { id: 'bas-ext',  grupo: 'Limpieza básica', nombre: 'Básica exterior',          precios: [19.99, 24.99, 29.99, 34.99], min: 45 },
  { id: 'bas-tot',  grupo: 'Limpieza básica', nombre: 'Básica completa (int + ext)', precios: [33.99, 39.99, 44.99, 49.99], min: 75 },
  { id: 'com-int',  grupo: 'Completo',        nombre: 'Completo interior',        precios: [34.99, 39.99, 44.99, 49.99], min: 60 },
  { id: 'com-ext',  grupo: 'Completo',        nombre: 'Completo exterior',        precios: [34.99, 39.99, 44.99, 49.99], min: 60 },
  { id: 'com-tot',  grupo: 'Completo',        nombre: 'Completo total',           precios: [59.99, 64.99, 69.99, 74.99], min: 90, top: true },
  { id: 'plus-int', grupo: 'Completo Plus',   nombre: 'Interior premium',         precios: [69.99, 74.99, 79.99, 84.99], min: 120 },
  { id: 'plus-tot', grupo: 'Completo Plus',   nombre: 'Total premium',            precios: [89.99, 94.99, 99.99, 104.99], min: 150 },
  { id: 'int-prem', grupo: 'Detailing',       nombre: 'Integral Premium (detailing)', precios: [149, 149, 149, 149], min: 240, desde: true },
  { id: 'prem-tot', grupo: 'Detailing',       nombre: 'Premium Total + abrillantado 1 paso', precios: [249.99, 249.99, 249.99, 249.99], min: 300, desde: true },
  { id: 'ceramico', grupo: 'Detailing',       nombre: 'Tratamiento cerámico 7H',  precios: [299, 329, 359, 389], min: 360, desde: true, orientativo: true },
];

ECO.EXTRAS = [
  { id: 'moqueta',  nombre: 'Lavado de moqueta',                    precio: 20 },
  { id: 'plast',    nombre: 'Renovado de plásticos',                precio: 20 },
  { id: 'mosquito', nombre: 'Eliminación de mosquitos + cera de silicio', precio: 60 },
  { id: 'ozono',    nombre: 'Desinfección con ozono',               precio: 25, orientativo: true },
];

/* Reglas de negocio de la demo */
ECO.REGLAS = {
  umbralGarantia: 80,          // € — por encima se pide tarjeta en garantía (Stripe SetupIntent)
  penalizacionPct: 0.30,       // % que se cobra si no se presenta
  penalizacionMin: 20,         // € mínimo de penalización
  cancelacionGratisHoras: 24,
  apertura: '10:00', cierre: '21:30', slotMin: 30, boxes: 2,
  litrosAhorradosPorLavado: 150, // orientativo: consumo medio de un lavado tradicional
  fidelidad: { lavados: 4, premio: 30 }, // "Por cada 4 lavados, 30 € en el 5º" (promo publicada)
};

/* Guion de la recepcionista de voz. Frases cerradas para poder pregenerar los MP3
   con `node scripts/voices.mjs generate ecologic` (ver ecologic/audio/textos.json). */
ECO.VOZ_CENTROS = { goya: 'Goya, en Madrid', albacete: 'Albacete', 'bcn-diagonal': 'Diagonal, en Barcelona' };
ECO.VOZ_DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
ECO.eurVoz = n => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' euros';
ECO.VOZ = {
  test: 'Hola, soy Eco, la recepcionista de Ecologic Car Wash. ¿En qué centro quiere reservar?',
  saludo: 'Ecologic Car Wash, buenas noches. Le atiende Eco, la asistente virtual. Los centros ya han cerrado, pero le puedo reservar ahora mismo. ¿En qué centro le viene mejor?',
  centro: id => `Perfecto, centro de ${ECO.VOZ_CENTROS[id]}, en el parking de El Corte Inglés. ¿Qué coche tiene: pequeño, mediano, un SUV o de siete plazas?`,
  coche: tam => `Para un coche ${ECO.TAMANOS[tam].nombre.toLowerCase()}, el Completo total, por dentro y por fuera, son ${ECO.eurVoz(ECO.precio('com-tot', tam))}. El Total premium, nuestro servicio más completo, son ${ECO.eurVoz(ECO.precio('plus-tot', tam))}. ¿Cuál prefiere?`,
  diferencia: 'El Completo total es la limpieza a fondo, por dentro y por fuera. El Total premium es nuestro servicio más completo, con más tiempo para cada detalle. ¿Con cuál se queda?',
  huecos: dia => `El ${dia} tengo libre a las once y media o a las cinco de la tarde. ¿Le va bien alguna?`,
  nombre: 'Muy bien. ¿A nombre de quién pongo la reserva?',
  garantia: 'Gracias, Javier. Como el servicio supera los 80 euros, le acabo de mandar un WhatsApp con un enlace seguro para dejar la tarjeta en garantía. No se le cobra nada, y puede cancelar gratis hasta veinticuatro horas antes.',
  confirmada: 'Listo, su reserva está confirmada. Le llega ahora por WhatsApp con todos los detalles, y le recordaremos la cita el día antes. ¿Le puedo ayudar en algo más?',
  despedida: 'Gracias a usted. Que pase muy buena noche.',
};
/* Todas las frases posibles del guion (las usa el generador de audios) */
ECO.vozTextos = () => [ECO.VOZ.test, ECO.VOZ.saludo, ...Object.keys(ECO.VOZ_CENTROS).map(ECO.VOZ.centro),
  ECO.VOZ.coche(2), ECO.VOZ.coche(1), ECO.VOZ.diferencia, ...ECO.VOZ_DIAS.map(ECO.VOZ.huecos),
  ECO.VOZ.nombre, ECO.VOZ.garantia, ECO.VOZ.confirmada, ECO.VOZ.despedida];

ECO.precio = (servId, tamIdx) => {
  const s = ECO.SERVICIOS.find(x => x.id === servId);
  return s ? s.precios[tamIdx] : 0;
};
ECO.centro = id => ECO.CENTROS.find(c => c.id === id);
ECO.eur = n => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
ECO.eur0 = n => Math.round(n).toLocaleString('es-ES') + ' €';
ECO.norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
