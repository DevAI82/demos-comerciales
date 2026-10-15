// Sustituye a src/supabaseClient.js en la copia de demostración de FitFusion.
// La demo no envía nada: el cuestionario, el contacto y la prueba gratis responden como si
// hubieran ido bien, sin tocar la base de datos ni el portal reales.
// El cuestionario se guarda solo en este navegador para que el CRM de la demo (../crm/) lo
// muestre como lead nuevo.
const espera = (ms) => new Promise((r) => setTimeout(r, ms))

const fetchReal = window.fetch.bind(window)
window.fetch = async (url, opciones) => {
  if (String(url).includes('/api/')) {
    await espera(600)
    return new Response(JSON.stringify({ ok: true, demo: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  return fetchReal(url, opciones)
}

export const supabase = {
  async rpc(nombre, args) {
    await espera(600)
    if (nombre === 'submit_questionnaire' && args?.p_respuestas) {
      try {
        const leads = JSON.parse(localStorage.getItem('ff-demo-leads') || '[]')
        leads.unshift({ ...args.p_respuestas, recibido: new Date().toISOString() })
        localStorage.setItem('ff-demo-leads', JSON.stringify(leads.slice(0, 5)))
      } catch { /* sin almacenamiento la demo sigue funcionando */ }
    }
    return { data: 'demo-lead', error: null }
  },
  functions: {
    async invoke() {
      await espera(400)
      return { data: { ok: true, demo: true }, error: null }
    }
  }
}
