# Laura · Agentes de voz en directo de Motor Gas Bike e Izon Consulting (ElevenLabs)

Creados el 14/10/2026 duplicando a Sofía (`docs/agentes/sonrisastar-sofia.md`), así heredan la misma voz y la misma
configuración de seguridad. Cada demo tiene **su propio agente**: cambiar uno no afecta a los demás.

| Demo | Agente | agent_id |
|---|---|---|
| Motor Gas Bike (`motos/`) | `Laura · Motor Gas Bike (demo Altera)` | `agent_5901m4xmm6kcfh5rr9j8dny6zdr9` |
| Izon Consulting (`realestate/`) | `Laura · Izon Consulting (demo Altera)` | `agent_9301m4xmmam3f7v95wwmf658vwg5` |

## Común a los dos (igual que Sofía)

- Voz **Laura - Customer service** (`uQw4jpKzMLrZuo0RLPS9`, español de España), modelo `eleven_v4_turbo`.
- Audio: salida PCM 44,1 kHz, estabilidad 0,4, similitud 0,85, velocidad 1.
- 180 s máx. por llamada, sin grabación de audio, transcripciones 30 días.
- Solo `devai82.github.io` y `localhost`, 100 llamadas/día, 3 simultáneas.
- Widget en español abajo a la izquierda, con aviso de demostración y "precios siempre orientativos".

## Lo que cambia

- **Motor Gas Bike**: tutea, toma citas de taller (marca, modelo, km, trabajo, mañana/tarde, nombre y móvil), capta
  interesados en motos (tipo, carnet A1/A2/A, presupuesto) y equipamiento. Sin precios cerrados: como mucho una horquilla
  orientativa. No inventa promociones, stock, financiación, horarios ni marcas oficiales.
- **Izon Consulting**: trato de usted, cualifica compradores e inquilinos (zona, dormitorios, presupuesto, hipoteca o
  contado), pide datos para visitas y ofrece valoración a propietarios. No inventa viviendas, comisiones ni condiciones.

Ninguno tiene acceso a agendas reales: siempre dicen que el equipo confirma la hora por WhatsApp.

## En las demos

`shared/altera-config.js` → `elevenlabsAgents.motos` y `elevenlabsAgents.realestate`. Con el agente activo:

- Aparece la tarjeta "Llama a Laura" (pestaña 1 en Motos; sección del contestador en Izon) y el botón de ElevenLabs abajo
  a la izquierda.
- La llamada simulada con la voz del navegador queda oculta (`data-convai-fallback`) y solo vuelve si se quita el agent_id.
- El botón "Lo quiero" sube a la cabecera para no tapar el widget en el móvil.

Antes de presentar: pruébalo desde un móvil con datos (no solo wifi) y con el micrófono permitido.
Cuando acabe la campaña con cada cliente, **desactiva su agente** en ElevenLabs.
