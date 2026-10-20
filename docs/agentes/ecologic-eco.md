# Eco · Agente de voz en directo de Ecologic Car Wash (ElevenLabs)

Creado el 20/10/2026 duplicando a Laura de Salón 224 (`docs/agentes/laura-motos-izon.md`), así hereda la misma voz y la
misma configuración de seguridad.

| Demo | Agente | agent_id |
|---|---|---|
| Ecologic Car Wash (`ecologic/`) | `Eco · Ecologic Car Wash (demo Altera)` | `agent_7401m5cvrk2geg28sz0af4qwy5q8` |

## Igual que el resto de agentes

- Voz **Laura - Customer service** (`uQw4jpKzMLrZuo0RLPS9`, español de España), modelo `eleven_v4_turbo`.
- 180 s máx. por llamada, sin grabación de audio, transcripciones 30 días.
- Solo `devai82.github.io` y `localhost`, 100 llamadas/día, 3 simultáneas.
- Widget en español abajo a la izquierda, orbe con los colores de Ecologic y aviso de demostración propio
  ("preparada por Altera para Ecologic Car Wash… no se hace ninguna reserva real").

## Lo propio de Eco

- Primer mensaje: «Ecologic Car Wash, buenas. Le atiende Eco, la asistente virtual. ¿En qué centro quiere reservar su lavado?»
- Trato de usted. Reserva preguntando solo lo que falta: centro → tamaño del coche → servicio → día y mañana/tarde → nombre y móvil.
- Conoce los 35 centros por comunidad y las **tarifas publicadas** en ecologiccarwash.es (4 tamaños: pequeño, mediano,
  grande/SUV, 7 plazas), los extras publicados y la promo «cada 4 lavados, 30 € en el 5º».
- Por encima de 80 € explica la tarjeta en garantía con Stripe (no se cobra nada; cancelación gratis hasta 24 h antes).
- **No** da precio del tratamiento cerámico ni del ozono (no están publicados), ni horarios (dice «el de cada El Corte
  Inglés»), ni duraciones exactas (solo «básicos desde 45 minutos»).
- Sin acceso a la agenda real: dice que la confirmación con la hora llega por WhatsApp.

## En la demo

`shared/altera-config.js` → `elevenlabsAgents.ecologic`. Con el agente activo, en la pestaña «03 · Recepcionista 24/7»
aparece la tarjeta «Llama a Eco» y la llamada simulada queda oculta (`data-convai-fallback`). Si se quita el agent_id,
vuelve la llamada simulada (que además crea la reserva en el CRM de la demo).

Cuando acabe la campaña con Ecologic, **desactiva el agente** en ElevenLabs.
