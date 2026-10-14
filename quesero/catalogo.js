/*
 * El Sueño del Quesero · Catálogo real compartido por la demo (quesero.js, crm-quesero.js) y la web nueva (web/).
 * Nombres, productores, leche, maduración, precios y fotos tomados de su web actual (elsuenodelquesero.es, octubre de 2026).
 * Los precios se muestran como orientativos: la tienda los confirma al poner la web en marcha.
 */
(function () {
  'use strict';
  // Las fotos están en quesero/img/, se cargue este archivo desde quesero/ o desde quesero/web/.
  const base = (document.currentScript && document.currentScript.src) ? new URL('.', document.currentScript.src).href : '';

  // cat: oveja | cabra | vaca | regalos · azul y albacete son filtros extra.
  // precio: €/kg (se reserva al corte, por gramos) · precioUd + ud: por unidad.
  const CATALOGO = [
    { id: 'dehesa-llanos', nombre: 'Dehesa de Los Llanos Gran Reserva', apellido: 'Manchego DOP', cat: 'oveja', albacete: true, top: true, lema: 'Mejor queso del mundo 2012', productor: 'Dehesa de Los Llanos', lugar: 'Albacete', leche: 'Cruda de oveja manchega', curacion: '12 meses', precio: 43.90, nota: 'Cada queso pasa al menos diez veces por las manos del artesano. Corteza natural y producción muy limitada.' },
    { id: 'ojos-guadiana', nombre: 'Ojos del Guadiana Reserva', apellido: 'Manchego DOP', cat: 'oveja', lema: 'El manchego más premiado', productor: 'Ojos del Guadiana', lugar: 'Daimiel (Ciudad Real)', leche: 'Cruda de oveja manchega', curacion: '12 meses', precio: 38.50, nota: 'Artesano, de ovejas que pastan en el entorno del Parque Natural de las Tablas de Daimiel.' },
    { id: 'plaza-curado', nombre: 'Hermanos Plaza Curado', apellido: 'Manchego DOP', cat: 'oveja', albacete: true, lema: 'El manchego de El Bonillo', productor: 'Lácteos El Bonillo', lugar: 'El Bonillo (Albacete)', leche: 'Cruda de oveja', curacion: '10-12 meses', precio: 24.00, nota: 'Aroma intenso, un suave punto de acidez y matices a aromáticas y gramíneas.' },
    { id: 'plaza-aceite', nombre: 'Hermanos Plaza en Aceite', apellido: 'Manchego DOP · bolsa de 500 g', cat: 'oveja', albacete: true, lema: 'Curado y sumergido en aceite de oliva', productor: 'Lácteos El Bonillo', lugar: 'El Bonillo (Albacete)', leche: 'Cruda de oveja', curacion: '12 meses', precioUd: 14.00, ud: 'bolsa', nota: 'Madurado en aceite de oliva virgen extra: el sabor se suaviza y se queda en el paladar.' },
    { id: 'tejarejo', nombre: 'Tejarejo Ecológico', cat: 'oveja', albacete: true, lema: 'Curado, intenso y mantecoso', productor: 'Quesos Cerrón', lugar: 'Fuenteálamo (Albacete)', leche: 'Cruda de oveja manchega', curacion: '15-16 meses', precio: 37.90, nota: 'Producción muy limitada. Cremoso, con recuerdos a caramelo, frutos secos dulces y romero.' },
    { id: 'flor-romero', nombre: 'Flor de Romero', cat: 'oveja', albacete: true, lema: 'Queso de oveja al romero', productor: 'Quesos Roblemancha', lugar: 'Villarrobledo (Albacete)', leche: 'Pasteurizada de oveja', curacion: '8 meses', precio: 28.50, nota: 'Muy curado y con un toque perfecto de romero. Ni muy seco, ni muy cremoso.' },
    { id: 'changarrilla', nombre: 'Changarrilla', cat: 'oveja', albacete: true, lema: 'Pasta blanda y corteza enmohecida', productor: 'Lácteos El Bonillo', lugar: 'El Bonillo (Albacete)', leche: 'Cruda de oveja', curacion: '2-4 meses', precio: 28.00, nota: 'Textura cremosa e intenso sabor a leche recién ordeñada.' },
    { id: 'campoveja', nombre: 'Campoveja Ahumado', cat: 'oveja', lema: 'Premiado como mejor ahumado del mundo', productor: 'Quesería Campoveja', lugar: 'Serrada (Valladolid)', leche: 'Cruda de oveja', curacion: '6-8 meses', precio: 36.50, nota: 'Ahumado con maderas nobles: tonos torrefactos y aromas a café según te acercas a la corteza.' },
    { id: 'antigua-trufado', nombre: 'La Antigua Trufado', cat: 'oveja', lema: 'Simplemente espectacular', productor: 'Quesería La Antigua', lugar: 'Fuentesaúco (Zamora)', leche: 'Cruda de oveja', curacion: '5 meses', precio: 41.50, nota: 'Trufa del Piamonte añadida directamente a la leche, sin aromas ni aceites.' },
    { id: 'ossau-iraty', nombre: 'Ossau Iraty', cat: 'oveja', lema: 'Semicurado exquisito', productor: 'Ossau Fermier', lugar: 'Pirineo francés', leche: 'Cruda de oveja', curacion: '6 meses', precio: 32.90, nota: 'Blanco y suave, con una amplia gama de aromas y un ligero sabor a nuez.' },
    { id: 'gamoneu', nombre: 'Gamoneu', apellido: 'DOP', cat: 'oveja', azul: true, lema: 'No apto para todos los paladares', productor: 'Juan Sobrecueva', lugar: 'Cangas de Onís (Asturias)', leche: 'Cruda de vaca, oveja y cabra', curacion: '6-8 meses', precio: 46.90, nota: 'Graso y ligeramente ahumado. La cueva le da a la corteza tonos rojizos y azulados.' },
    { id: 'payoyo', nombre: 'Payoyo', cat: 'cabra', top: true, lema: 'Cremosidad en un gran queso', productor: 'Quesos Payoyo', lugar: 'Villaluenga del Rosario (Cádiz)', leche: 'Pasteurizada de cabra', curacion: '2-3 meses', precio: 32.90, nota: 'Muy cremoso, con sabor a frutos secos, ligeramente ácido y sabroso.' },
    { id: 'cerron-romero-miel', nombre: 'Cerrón Curado en Romero y Miel', cat: 'cabra', albacete: true, top: true, lema: 'Sabores y aromas del Mediterráneo', productor: 'Quesos Cerrón', lugar: 'Fuenteálamo (Albacete)', leche: 'Cruda de cabra', curacion: '40 meses', precio: 34.00, nota: 'Cabra murciano-granadina con miel de aromáticas de la zona y romero.' },
    { id: 'cerron-servilleta', nombre: 'Cerrón Servilleta', cat: 'cabra', albacete: true, lema: 'Tradición y suavidad en un queso tierno', productor: 'Quesos Cerrón', lugar: 'Fuenteálamo (Albacete)', leche: 'Pasteurizada de cabra', curacion: '30 días', precio: 24.90, nota: 'Típico del Levante, prensado en un paño. Elástico, con notas de yogur y nata.' },
    { id: 'black-betty', nombre: 'Black Betty', cat: 'cabra', lema: 'El gran Brabander hecho añejo', productor: 'Fromagerie l’Amuse', lugar: 'Beemster (Holanda)', leche: 'Pasteurizada de cabra', curacion: '16 meses', precio: 37.00, nota: 'Un gouda de cabra madurado en cueva y con poca cera para ganar complejidad.' },
    { id: 'comte', nombre: 'Comté Reservation 24 meses', apellido: 'AOC', cat: 'vaca', lema: 'Magnífico', productor: 'Fromagerie Marcel Petite', lugar: 'Jura (Francia)', leche: 'Cruda de vaca', curacion: '24 meses', precio: 35.90, nota: 'Seleccionado por delicadeza, sutileza, intensidad y profundidad de sabor.' },
    { id: 'gruyere', nombre: 'Gruyère Reserva', apellido: 'AOP', cat: 'vaca', lema: '400 litros de leche por queso', productor: 'Affineur Buttay', lugar: 'Suiza', leche: 'Cruda de vaca', curacion: '+18 meses', precio: 35.90, nota: 'Sabor especialmente aromático: una obra maestra del arte quesero suizo.' },
    { id: 'gouda-24', nombre: 'Gouda 24 meses', cat: 'vaca', lema: 'Potente, tostado y acaramelado', productor: 'Fromagerie l’Amuse', lugar: 'Beemster (Holanda)', leche: 'De vaca', curacion: '24 meses', precio: 29.90, nota: 'Pasta color ámbar salpicada de pequeños cristales crujientes.' },
    { id: 'mahon', nombre: 'Mahón Curado', apellido: 'DOP', cat: 'vaca', lema: 'Duro, intenso y persistente', productor: 'Quesería Torralba', lugar: 'Alaior (Menorca)', leche: 'Cruda de vaca', curacion: '8-12 meses', precio: 29.50, nota: 'Corte rompedizo y sabor evolucionado, que a veces llega a picar.' },
    { id: 'morbier', nombre: 'Morbier Reserve', apellido: 'AOC', cat: 'vaca', lema: 'Flexible, cremoso y delicado', productor: 'Fromagerie Marcel Petite', lugar: 'Jura (Francia)', leche: 'Cruda de vaca', curacion: '4 meses', precio: 30.00, nota: 'Pasta dulce y afrutada, con su franja de carbón vegetal en el centro.' },
    { id: 'brie', nombre: 'Brie de Meaux', apellido: 'AOP', cat: 'vaca', lema: 'Inigualable', productor: 'Fromagerie Dongé', lugar: 'Triconville (Francia)', leche: 'Cruda de vaca', curacion: '60-90 días', precio: 26.50, nota: 'Moldeado a mano con pala, como en la quesería desde 1930.' },
    { id: 'reblochon', nombre: 'Reblochon Fermier', apellido: 'AOC', cat: 'vaca', lema: 'Tierno queso francés', productor: 'Fermier', lugar: 'Saboya (Francia)', leche: 'Cruda de vaca', curacion: '2 meses', precio: 33.00, nota: 'Corteza color azafrán y sabor suave con toques a avellana. El de la tartiflette.' },
    { id: 'gorgonzola', nombre: 'Gorgonzola Dolce', apellido: 'DOP', cat: 'vaca', azul: true, top: true, lema: 'El azul cremoso por excelencia', productor: 'La Tosi', lugar: 'Piamonte (Italia)', leche: 'Pasteurizada de vaca', curacion: '2 meses', precio: 32.50, nota: 'Cremoso y suave, con sus vetas verde azuladas.' },
    { id: 'stilton', nombre: 'Stilton Colston Bassett', cat: 'vaca', azul: true, lema: 'El azul inglés por excelencia', productor: 'Colston Bassett', lugar: 'Nottingham (Reino Unido)', leche: 'Pasteurizada de vaca', curacion: '5-6 meses', precio: 37.00, nota: 'El galardonado azul inglés, con denominación de origen protegida.' },
    { id: 'caja-regalo', nombre: 'Caja regalo personalizable', cat: 'regalos', lema: 'Con los quesos que tú elijas', productor: 'El Sueño del Quesero', lugar: 'Envío refrigerado a toda España', precioUd: 2.20, ud: 'caja', nota: 'Añade todos los quesos que quieras y hasta un par de botellas. El precio es el de la caja; los quesos se suman aparte.' }
  ];
  CATALOGO.forEach(p => { p.img = base + 'img/q-' + (p.id === 'caja-regalo' ? 'caja-negra' : p.id) + '.webp'; p.origen = p.lugar; });

  const CATEGORIAS = [
    { id: 'todos', nombre: 'Todos' },
    { id: 'albacete', nombre: 'De Albacete' },
    { id: 'oveja', nombre: 'Oveja' },
    { id: 'cabra', nombre: 'Cabra' },
    { id: 'vaca', nombre: 'Vaca' },
    { id: 'azul', nombre: 'Azules' },
    { id: 'regalos', nombre: 'Cajas regalo' }
  ];
  const enCategoria = (p, cat) => cat === 'todos' || p.cat === cat || (cat === 'albacete' && p.albacete) || (cat === 'azul' && p.azul);

  window.QS_CATALOGO = { CATALOGO, CATEGORIAS, enCategoria, base };
})();
