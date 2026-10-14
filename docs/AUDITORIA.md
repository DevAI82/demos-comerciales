# Auditoría de las 8 demos comerciales · Altera

Fecha: 13/10/2026 · Alcance: portal + Vibra, Pizzería Ángela, Ruautos, Motor Gas Bike, Izon (realestate), Salón 224, Sonrisastar, Adela Fisio.
Método: lectura completa del código, chequeo estático de enlaces/IDs, sintaxis JS y pruebas automáticas en Chromium con viewport de iPhone (390×844).

Leyenda: ✅ corregido en esta rama · ⚠️ pendiente (decisión tuya o dato que no puedo verificar)

---

## 🔴 CRÍTICO

| # | Problema | Dónde | Estado |
|---|---|---|---|
| C1 | **API key de RapidAPI (Idealista) escrita en el código público.** Cualquiera podía copiarla y gastar tu cuota. | `realestate/index.html`, `realestate/propuesta.html` | ✅ Quitada del código (ahora va en `.env`). ⚠️ **Sigue en el historial de git: revócala y crea otra en RapidAPI hoy mismo.** |
| C2 | **La pestaña "6. Ayuda JCCM 80% (600€)" se quedaba en blanco.** El botón buscaba `#view-jccm` y la sección se llamaba `#jccm`. Era justo la pestaña del precio. | Vibra, Pizzería Ángela | ✅ |
| C3 | **El cliente oía la voz robótica del móvil, no ElevenLabs.** La voz "real" solo sonaba si había una API key en `localStorage`; en Ruautos, Motos, Salón, Izon y Sonrisastar ni siquiera había forma de ponerla. En iPhone, las frases encadenadas tras un `await` además se bloquean por la política de autoplay. | Las 8 | ✅ Nuevo motor `shared/altera-voice.js`: MP3 pregenerados + un `<audio>` desbloqueado en el primer toque. ⚠️ **Falta generar los MP3** (`node scripts/voices.mjs generate all`, ~15.000 caracteres). |
| C4 | **Notas internas visibles al cliente:** "Nota para la venta: este prototipo usa el sintetizador de tu navegador…", botones "Configurar API Key" y, en Adela, el aviso parpadeante "⚠️ Activar Voz Sofía / Clave no configurada". | Vibra, Ángela, Adela | ✅ Solo se ven en `localhost` o con `?dev` |
| C5 | **Sonrisastar cortaba cada frase de la IA a los 3,8 s** (el diálogo avanzaba con un temporizador fijo y cancelaba el audio en curso). | Sonrisastar | ✅ El siguiente turno empieza al acabar el audio |
| C6 | **Botones "Descargar PDF Oficial / Word" (Formulario III) daban 404**, igual que "Volver a la Presentación" (`/dental`). | Sonrisastar (demo + propuesta) | ✅ Sustituidos por un sello "Memoria Formulario III incluida". ⚠️ Si tienes el PDF, súbelo y vuelvo a poner el botón. |
| C7 | **Precios contradictorios dentro de la misma demo.** Vibra decía "cuota de mantenimiento 120-150 €/mes" y "0 € en cuotas" mientras el resto dice 99 €/mes. | Vibra | ✅ Unificado a 99 €/mes |
| C8 | **Ahorro inflado / mal planteado.** Vibra muestra "Ahorro 290 €/mes en comisiones SaaS", pero su propia pestaña JCCM calcula Last.app ≈150 €/mes vs 99 €/mes (≈51 €/mes). En Ángela, la conclusión compara con Last.app, **pero Ángela usa Tappens, no Last.app**: para ella los 99 €/mes son un coste nuevo, no un ahorro. | Vibra (CRM), Ángela (JCCM) | ⚠️ Decide la cifra/argumento: para Ángela el ahorro está en Uber (30%), no en software. |
| C9 | **"Coste real inicial: 600 €" es engañoso.** En el Bono Pyme el negocio normalmente paga la factura completa (3.000 € + IVA) y la Junta ingresa los 2.400 € tras justificar (tu propia `sonrisastar/propuesta.html` lo explica así). Si el dueño se entera después, pierdes la confianza. | Vibra, Ángela, portal | ⚠️ Usa "coste final 600 €" y explica el flujo de caja (o di si Altera adelanta/financia). |

## 🟠 MEDIO

| # | Problema | Dónde | Estado |
|---|---|---|---|
| M1 | **Al colgar, la IA seguía hablando** y volvían a salir las opciones del cliente (el callback del audio seguía la conversación). En Salón el audio ElevenLabs no se paraba y la llamada nunca terminaba tras confirmar la cita. | Ruautos, Motos, Salón | ✅ Token de sesión + parada del audio |
| M2 | Pulsar una "pregunta rápida" durante la llamada completa podía **reanudar la llamada anterior** encima (estado colgado). | Vibra, Ángela | ✅ |
| M3 | KDS: contadores falsos al cargar ("4 pedidos" con 5 tickets), "Simular pedido" no actualizaba contadores (Vibra), IDs aleatorios que podían repetirse, al mover un ticket el ticket 80mm pasaba a decir "Cliente: Cliente · TOTAL: Total", el #202/#106 duplicaba botones al retroceder, "Imprimir" imprimía toda la página. | Vibra, Ángela | ✅ |
| M4 | Chat WhatsApp: no hacía scroll al último mensaje (en móvil parecía que el botón no hacía nada), Enter no enviaba, "Repetir pedido" y "Pagar" se podían pulsar varias veces, el texto del usuario se insertaba como HTML. | Vibra, Ángela | ✅ |
| M5 | 4 de 6 tarjetas de tratamiento abrían la cita con el tratamiento equivocado (Blanqueamiento, Limpieza, Urgencia, Prótesis). | Sonrisastar | ✅ |
| M6 | Adela aceptaba la API key por URL (`?key=sk_...`): si alguien la enviaba por WhatsApp, quedaba en historiales y previsualizaciones. | Adela | ✅ Eliminado |
| M7 | Enlaces rotos entre demo y propuesta (`VER_PRESENTACION_*.html`, `mockup_interactivo_*.html`) y descargas de `.md`/`.excalidraw` que no existen. | Ruautos, Motos, Salón, Sonrisastar | ✅ |
| M8 | **Ninguna demo tenía un botón para contactar con Altera.** El dueño dice "lo quiero"… y no tiene dónde pulsar. | Las 8 | ✅ Botón flotante "Lo quiero en mi negocio · 600 € con la ayuda JCCM" → WhatsApp. ⚠️ Pon tu número en `shared/altera-config.js`. |
| M9 | **Datos inventados en boca del negocio** que el dueño detecta al instante: "bases sin gluten certificadas en área aislada" (Ángela), "vaca rubia gallega madurada 40 días" y "Vibra Plant Smash" (Vibra), "4.9★ reseñas verificadas", "36 meses sin intereses", "doctor de guardia 24/7" con horario L-V (Sonrisastar), "garantía 1 año + 82 puntos" (Ruautos), "único salón con ABC" (Salón), "concesionario oficial KTM" (Motos). Alérgenos y salud además tienen riesgo legal. | Varias | ⚠️ Confirmar con datos reales o redactar en genérico ("…si tu carta incluye opciones sin gluten") |
| M10 | Afirmaciones legales sin fuente en la demo: "Orden 116/2026", "Trámite 1023976", "9.000.000 € de dotación", "Art. 9.4 contrato menor sin 3 ofertas" (la Ley 9/2017 es de contratación pública, no de beneficiarios privados). | Vibra, Ángela, Sonrisastar | ⚠️ Verificar contra DOCM/bases y enlazar la convocatoria oficial |
| M11 | "Stripe / Bizum" y "0 % comisiones": Stripe cobra comisión por pago y Bizum normalmente va por TPV bancario/Redsys, no por Stripe. | Vibra, Ángela | ⚠️ Matizar ("0 % comisión de plataforma; la pasarela cobra ~1,5 %") |
| M12 | "Triaje médico" hecho por IA. | Sonrisastar | ⚠️ Mejor "clasifica la urgencia y avisa al equipo" |
| M13 | Las 4 demos nuevas (Ruautos, Motos, Izon, Salón) **no muestran la oferta 600 € / 99 €/mes dentro de la demo** (solo en el portal). | 4 demos | ⚠️ (el botón flotante ya la muestra) |
| M14 | Tailwind por CDN en tiempo de ejecución: ~300 KB de JS, parpadeo sin estilos en 4G y aviso en consola "no usar en producción". | Las 8 | ⚠️ Compilar CSS con Tailwind CLI cuando estabilicéis el diseño |

## 🟡 MENOR

- Cabecera fija con 5-6 pestañas que en móvil ocupan 3 filas (~⅓ de pantalla) y botones de ~28 px de alto (< 44 px recomendados). Sugerencia: en móvil, barra horizontal con scroll (`flex-nowrap overflow-x-auto`) y `py-2.5`.
- Mucho texto a 9-10 px y `text-stone-500` sobre negro (contraste ≈4,1:1, por debajo de 4,5:1). Subir a `text-[11px]`/`text-xs` y `text-stone-400`.
- Vibra: tras pagar dice "comanda #204", que ya existe en el KDS con otro cliente.
- Sonrisastar: "doctor Martínez" y "Dra. Martínez"; mezcla de usted/tú. Sofía es el nombre de la asistente en 3 demos.
- Duplicados en Adela: `mockup_interactivo.html` (= `index.html` con OG antiguos) y `VER PRESENTACION.html` (= `presentacion.html`).
- El portal público expone los mensajes de prospección de todos los clientes ("conocemos de primera mano vuestro sistema…") y el `Dossier Presentacion Adela.md`. Valora `noindex` o un portal interno.
- Calculadora de Ángela: formato de miles dependía del idioma del móvil. ✅

---

## 💼 Coherencia de la oferta

- 600 € / 99 €/mes / 80 %: ahora coherente en todas las demos y el portal, salvo los puntos ⚠️ C8 y C9.
- Propuesta de valor en 10 s: **no se entiende**. Vibra abre con una tabla técnica (Nuxt, Coolify, PostgreSQL, RLS), Ángela con el KDS, Sonrisastar con la web. El dueño no ve "qué gano" hasta la pestaña 6.

## 🚀 Lo que haría para que digan "esto lo quiero ya"

1. **Que lo primero que pase sea oír su negocio contestando el teléfono.** Abre la demo en la vista de voz con un botón enorme "▶️ Escucha cómo atendería tu teléfono un sábado a las 21:00", con la voz ElevenLabs real (ya preparada con los MP3) diciendo el nombre de su local y su calle. Es el momento "wow".
2. **Hero de 3 cifras personalizadas** antes de cualquier tabla: "Pedidos que hoy pierdes: ~12/semana · Te ahorras: 975 €/mes en Uber · Te cuesta: 600 € una vez".
3. **Un solo botón de acción** siempre visible (✅ ya añadido; falta tu número).
4. Cambiar jerga por beneficios: "VPS Coolify + Supabase RLS" → "Tus datos y tus clientes son tuyos".
5. Enviar el enlace con un vídeo de 20 s grabado de la demo en móvil (la miniatura de WhatsApp vende más que el texto).
