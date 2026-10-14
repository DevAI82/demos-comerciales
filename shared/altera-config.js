/*
 * Altera · Datos comerciales públicos compartidos por todas las demos.
 * (Aquí NO van claves de API: esto se publica. Las claves van en .env)
 */
window.ALTERA_CONFIG = {
  // WhatsApp comercial de Altera en formato internacional sin "+" ni espacios, ej: "34600111222".
  // Mientras esté vacío, el botón flotante "Lo quiero" no se muestra.
  whatsapp: '34624939023', // +34 624 93 90 23 (contacto de Altera en las propuestas)
  // Agentes de voz EN DIRECTO de ElevenLabs Conversational AI, por carpeta de demo.
  // Pega el agent_id (ElevenLabs → Agents → tu agente → Widget). Es público, no es la API key.
  // Guía para crear el de Sonrisastar: docs/agentes/sonrisastar-sofia.md
  elevenlabsAgents: {
    sonrisastar: ''
  },
  oferta: {
    costeCliente: '600 €',       // tras la subvención del 80% (Bono Crecimiento Pyme JCCM)
    inversionTotal: '3.000 €',
    subvencion: '2.400 €',
    cuotaMensual: '99 €/mes'
  }
};
