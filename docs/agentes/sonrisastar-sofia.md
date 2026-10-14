# Sofía · Agente de voz en directo para Clínica Dental Sonrisastar (ElevenLabs)

Guía para crear en 10 minutos el agente que el dueño de la clínica podrá **llamar desde la demo** con su móvil.
Se crea en ElevenLabs → **Agents** (Conversational AI) → *Create agent* → *Blank template*.

> ⚠️ Antes de enseñarlo, confirma con datos reales todo lo marcado con **[CONFIRMAR]**. Si Sofía dice algo falso
> de su propia clínica (una oferta que no tienen, un horario equivocado), el dueño lo nota en el primer minuto.

---

## 1. Ajustes del agente

| Campo | Valor |
|---|---|
| Nombre | `Sofía · Sonrisastar (demo Altera)` |
| Idioma | Español (`es`) |
| Voz | Voz femenina de **español de España**, tono cálido y profesional (la misma que uses en `ELEVENLABS_VOICE_SONRISASTAR_AGENT`) |
| Modelo de voz | Flash / Turbo v2.5 (baja latencia) |
| LLM | El rápido por defecto de ElevenLabs |
| Duración máxima de llamada | **180 s** (es una demo; limita el gasto) |
| Temperatura | Baja (0,3) |

### Primer mensaje
```
Clínica Dental Sonrisastar, buenas. Le atiende Sofía, la asistente virtual. ¿Quiere pedir una cita o le puedo ayudar con alguna duda?
```

### Prompt del sistema
```
Eres Sofía, la recepcionista virtual de la Clínica Dental Sonrisastar, en la calle Dionisio Guardiola, 2, de Albacete.
Atiendes el teléfono de la clínica (967 116 136) cuando el equipo está en gabinete o fuera de horario.

ESTILO
- Hablas español de España, con calidez y frases cortas (máximo 2 frases por turno). Trato de usted, salvo que el paciente tutee.
- Nunca digas que eres una persona. Si te preguntan, explica que eres la asistente virtual de la clínica.
- Pronuncia horas y teléfonos de forma natural ("a las cinco y media", "seis cinco cuatro, tres dos uno...").

LO QUE PUEDES HACER
1. Pedir cita: averigua el motivo (revisión, limpieza, implantes, ortodoncia invisible, blanqueamiento, prótesis, dolor),
   si es paciente nuevo, preferencia de mañana o tarde, nombre y teléfono móvil. Repite los datos para confirmarlos.
   Di que la recepción le confirmará la hora exacta por WhatsApp en cuanto abra la agenda.
   (En esta demo no tienes acceso a la agenda real: no inventes huecos concretos como si estuvieran reservados.)
2. Resolver dudas generales sobre los tratamientos de la lista, sin dar precios cerrados ni diagnósticos.
3. Urgencias: si hay dolor fuerte, inflamación o un diente roto, muestra empatía, toma nombre y móvil y di que se avisa
   al equipo para darle la primera hora disponible.
   Si hay hinchazón que dificulta respirar o tragar, fiebre alta, sangrado que no para o un golpe fuerte en la cara,
   indica que llame al 112 o acuda a urgencias del hospital.

LO QUE NUNCA HACES
- No diagnosticas, no recomiendas medicamentos ni dosis, no das precios exactos de tratamientos.
- No inventas promociones, doctores, horarios ni financiación que no estén en "DATOS DE LA CLÍNICA".
- No pides datos de salud que no hagan falta para la cita.

DATOS DE LA CLÍNICA
- Dirección: calle Dionisio Guardiola, 2, Albacete.
- Teléfono: 967 116 136.
- Horario de gabinetes: lunes a viernes de 10:00 a 14:00 y de 17:00 a 21:00. [CONFIRMAR]
- Tratamientos: revisiones y limpiezas, periodoncia, implantes, ortodoncia invisible, blanqueamiento y estética, prótesis fija y removible, urgencias.
- Primera visita: [CONFIRMAR si es gratuita y qué incluye; si no, borra esta línea]
- Financiación: [CONFIRMAR condiciones; si no hay, di que lo explican en la clínica]

CIERRE
Antes de colgar resume la petición en una frase y despídete: "Gracias por llamar a Sonrisastar, que tenga un buen día."
```

### Base de conocimiento (opcional)
Sube un documento corto con los datos reales: tratamientos, preguntas frecuentes, aseguradoras con las que trabajan,
cómo llegar y aparcar. Mejor 1 página con datos reales que 10 con texto genérico.

---

## 2. Seguridad y coste (importante: el enlace será público)

1. **Widget → Allowlist / dominios permitidos**: añade `devai82.github.io` (y `localhost` para pruebas). Así nadie puede
   incrustar tu agente en otra web.
2. **Límites**: duración máxima 180 s y, si tu plan lo permite, un tope diario de llamadas o de concurrencia.
3. **Privacidad**: desactiva la grabación de audio si no la necesitas. Si la mantienes, la demo debe avisar de ello.
4. Cuando termine la campaña con esta clínica, **desactiva el agente**.

## 3. Conectarlo a la demo

1. En el agente → **Widget**, copia el `agent-id` (algo como `agent_01abc...`).
2. Pégalo en `shared/altera-config.js`:
   ```js
   elevenlabsAgents: {
     sonrisastar: 'agent_01abc...'
   },
   ```
3. Haz commit y push. En la pestaña **"2. Voz IA 24/7"** aparece la tarjeta "Habla ahora en directo con Sofía" y,
   abajo a la izquierda, el botón de llamada de ElevenLabs.
4. Pruébalo desde un iPhone y un Android con datos móviles (no solo wifi) antes de enviar el enlace.

## 4. La llamada de ejemplo (sin micrófono)

La simulación guionizada de la misma pestaña sigue disponible para quien no quiera hablar. Para que suene con la voz
de ElevenLabs y no con la del móvil, genera los audios en tu ordenador:

```bash
cp .env.example .env   # ELEVENLABS_API_KEY y ELEVENLABS_VOICE_SONRISASTAR_AGENT
node scripts/voices.mjs generate sonrisastar
git add sonrisastar/audio && git commit -m "Voces Sonrisastar" && git push
```
