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
    sonrisastar: 'agent_6801m4xcms8xe2vry45fwqfkw6d6', // Sofía · voz Laura (creado 14/10/2026)
    motos: 'agent_5901m4xmm6kcfh5rr9j8dny6zdr9',       // Laura · Motor Gas Bike (creado 14/10/2026)
    realestate: 'agent_9301m4xmmam3f7v95wwmf658vwg5',  // Laura · Izon Consulting (creado 14/10/2026)
    bakra: 'agent_5901m4y2ztqqeszs6324z7vnv2hm',       // Laura · Bakra Nails Salon (creado 14/10/2026)
    salon224: 'agent_0401m4y59rd5feestrw8mqcephen'     // Laura · Salón 224 (creado 14/10/2026)
  },
  oferta: {
    costeCliente: '600 €',       // tras la subvención del 80% (Bono Crecimiento Pyme JCCM)
    inversionTotal: '3.000 €',
    subvencion: '2.400 €',
    cuotaMensual: '99 €/mes'
  }
};
