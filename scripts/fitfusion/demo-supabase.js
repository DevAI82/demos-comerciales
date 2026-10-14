// Sustituye a src/supabaseClient.js en la copia de demostración de FitFusion.
// La demo no envía nada: el cuestionario, el contacto y la prueba gratis responden como si
// hubieran ido bien, sin tocar la base de datos ni el portal reales.
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
  async rpc() {
    await espera(600)
    return { data: 'demo-lead', error: null }
  },
  functions: {
    async invoke() {
      await espera(400)
      return { data: { ok: true, demo: true }, error: null }
    }
  }
}
