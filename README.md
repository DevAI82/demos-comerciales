# 🚀 Altera — Suite de Demos Comerciales & Prototipos Interactivos

Repositorio central con todas las demostraciones interactivas de **Altera Soluciones Tecnológicas** para prospección comercial en Albacete y Castilla-La Mancha (subvencionadas al 80% con el Bono Crecimiento Pyme JCCM).

## 🌐 Portal Central en Vivo
👉 **https://devai82.github.io/demos-comerciales/**

---

## 📂 Las 12 Demos Activas y sus Enlaces

| Cliente | Nicho | URL Directa | Puntos Fuertes |
| :--- | :--- | :--- | :--- |
| **Vibra Burger** | Hostelería | [devai82.github.io/demos-comerciales/vibra/](https://devai82.github.io/demos-comerciales/vibra/) | Bot WhatsApp, KDS Plancha, Voz IA Dino (ElevenLabs), Sin cuotas Last.app |
| **Pizzería Ángela** | Hostelería ⭐ referencia | [devai82.github.io/demos-comerciales/pizzeria-angela/](https://devai82.github.io/demos-comerciales/pizzeria-angela/) | Bot WhatsApp + Stripe, KDS Cocina, Voz IA Ángela, Ahorro 30% Uber |
| **Ruautos** | Motor ⭐ referencia | [devai82.github.io/demos-comerciales/ruautos/](https://devai82.github.io/demos-comerciales/ruautos/) | Recepcionista 24/7 ElevenLabs, WhatsApp Zernio, CRM Certificado 82 Puntos |
| **Motor Gas Bike** | Motor | [devai82.github.io/demos-comerciales/motos/](https://devai82.github.io/demos-comerciales/motos/) | Citas de taller automáticas, Showroom de motos, WhatsApp multicanal |
| **Izon Consulting** | Inmobiliaria ⭐ referencia | [devai82.github.io/demos-comerciales/realestate/](https://devai82.github.io/demos-comerciales/realestate/) | Radar de Mercado Idealista €/m², Chatbot 24/7, Cualificación de compradores |
| **Salón 224** | Belleza ⭐ referencia | [devai82.github.io/demos-comerciales/salon224/](https://devai82.github.io/demos-comerciales/salon224/) | Laura con el salón cerrado (ElevenLabs), WhatsApp con tarjeta de garantía y avisos, app propia: agenda, caja, fichaje y reseñas |
| **Clínica Sonrisastar** | Salud ⭐ referencia | [devai82.github.io/demos-comerciales/sonrisastar/](https://devai82.github.io/demos-comerciales/sonrisastar/) | Recepción IA 24/7 (ElevenLabs), Agendamiento citas, Nueva Web, CRM |
| **Fisioterapia Online con Adela** | Salud | [devai82.github.io/demos-comerciales/adela-fisio/](https://devai82.github.io/demos-comerciales/adela-fisio/) | Historial clínico, rutinas en vídeo con voz en off, pagos Bizum/tarjeta y reserva |
| **El Sueño del Quesero** | Tienda gourmet | [devai82.github.io/demos-comerciales/quesero/](https://devai82.github.io/demos-comerciales/quesero/) | Reserva y recoge, WhatsApp 24/7 con fotos, Instagram Zernio, CRM para recuperar clientes |
| **Bakra Nails Salon** | Belleza (uñas) | [devai82.github.io/demos-comerciales/bakra/](https://devai82.github.io/demos-comerciales/bakra/) | Laura en directo (ElevenLabs), WhatsApp e Instagram con aviso de relleno, agenda propia inspirada en Fresha |
| **FitFusionPro** | Entrenamiento | [devai82.github.io/demos-comerciales/fitfusion/](https://devai82.github.io/demos-comerciales/fitfusion/) | Cuestionario con plan recomendado, prueba gratis sin tarjeta, app del entrenador con vídeo de cada ejercicio |
| **Andor Seguridad** | Seguridad privada ⭐ insignia | [devai82.github.io/demos-comerciales/andor/](https://devai82.github.io/demos-comerciales/andor/) | Cuadrante de vigilantes con huecos y sustitutos, informe de cobertura, fichaje y rondas, CRM de presupuestos y partes, recepción 24/7 |

📋 Antes de enseñar una demo, revisa [`docs/AUDITORIA.md`](docs/AUDITORIA.md) (fallos corregidos y pendientes de decisión).

---

## 🗂️ Estructura

```
.
├── index.html                 Portal con todas las demos
├── <demo>/                    Una carpeta por cliente (index.html = demo, propuesta.html = dossier)
│   └── audio/
│       ├── textos.json        Frases que locuta la demo (editable)
│       ├── manifest.json      Audios disponibles (lo genera scripts/voices.mjs)
│       └── <hash>.mp3         Voz ElevenLabs pregenerada
├── shared/
│   ├── altera-voice.js        Motor de voz común (MP3 pregenerados, desbloqueo móvil, modo dev)
│   ├── altera-config.js       Datos comerciales públicos (WhatsApp de Altera, 600 € / 99 €/mes)
│   └── altera-cta.js          Botón flotante "Lo quiero en mi negocio"
├── nichos/
│   ├── nichos.json            Nicho → demo de referencia + textos del cliente a sustituir
│   └── clientes/<slug>.json   Datos de cada cliente nuevo
├── scripts/
│   ├── dev-server.mjs         Servidor local que usa las claves del .env
│   ├── voices.mjs             Genera los MP3 de ElevenLabs
│   ├── nueva-demo.mjs         Clona la demo de referencia de un nicho para un cliente nuevo
│   └── fitfusion/build.sh     Regenera fitfusion/ desde el repo de la web (Vue): `bash scripts/fitfusion/build.sh <clon de FITFUSION>`
├── .env.example               Plantilla de claves (copiar a .env, que NUNCA se sube)
└── docs/AUDITORIA.md          Auditoría QA / UX / comercial
```

---

## 🔑 Claves de API (.env)

Requisitos: **Node 18+** (sin dependencias que instalar).

```bash
cp .env.example .env              # rellena ELEVENLABS_API_KEY, RAPIDAPI_KEY, voces...
node scripts/dev-server.mjs       # http://localhost:5173 con las claves cargadas
```

- El `.env` está en `.gitignore`: **las claves nunca van al HTML ni a GitHub** (el repo y la web son públicos).
- En `localhost`, `shared/altera-voice.js` pide las claves al servidor local y las guarda en `localStorage`, así la voz ElevenLabs y el radar de Idealista funcionan en vivo.
- En la web pública **no hay claves**: la voz sale de los MP3 pregenerados y el radar inmobiliario muestra los testigos de la cartera.
- Paneles internos ("Configurar API Key", "Nota para la venta"...) solo se ven en `localhost` o añadiendo `?dev` a la URL.

## 🎙️ Voces ElevenLabs para las demos públicas

```bash
node scripts/voices.mjs status              # frases y caracteres pendientes por demo
node scripts/voices.mjs extract vibra       # (re)detecta las frases de la demo → vibra/audio/textos.json
node scripts/voices.mjs generate all        # genera los MP3 que falten (usa ELEVENLABS_API_KEY del .env)
git add */audio && git commit -m "voces" && git push
```

- Cada frase se identifica por un hash de su texto: si cambias una frase en el HTML, vuelve a ejecutar `extract` + `generate`.
- En `textos.json` puedes cambiar `"role"` (`agent` / `client`), fijar `"voice"` por frase o poner `"skip": true`.
- Las voces por demo se configuran en `.env` (`ELEVENLABS_VOICE_<DEMO>_AGENT` / `_CLIENT`).

## 🧩 Crear una demo nueva por nicho (mismo estilo, datos del cliente)

```bash
node scripts/nueva-demo.mjs nichos                        # hosteleria, salud, motor, inmobiliaria, belleza
node scripts/nueva-demo.mjs init hosteleria pizzeria-luigi
#   → rellena nichos/clientes/pizzeria-luigi.json (nombre, dirección, teléfono, asistente...)
node scripts/nueva-demo.mjs build pizzeria-luigi
node scripts/voices.mjs generate pizzeria-luigi
```

El script copia la demo de referencia del nicho, sustituye los datos del cliente y avisa de lo que falta (imágenes, textos sin sustituir). **Revisa siempre a mano** carta/servicios, precios y nombres antes de enviarla. Para un nicho nuevo, añade su entrada en `nichos/nichos.json` apuntando a la demo que sirva de plantilla.

## ➕ Publicar
1. Añade la tarjeta de la demo en `index.html` (portal) con su texto de WhatsApp.
2. `git add . && git commit && git push origin main` → GitHub Pages la publica en 1-2 minutos.
