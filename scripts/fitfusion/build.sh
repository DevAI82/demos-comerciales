#!/usr/bin/env bash
# Genera la carpeta fitfusion/ del portal a partir del repo de la web real (DevAI82/FITFUSION).
#
#   bash scripts/fitfusion/build.sh /ruta/al/clon/de/FITFUSION
#
# Copia app/ a una carpeta temporal y la adapta para GitHub Pages: todo cuelga de /demos-comerciales/fitfusion/,
# Supabase y portal simulados (la demo no envía datos reales) y noindex para no competir con la web.
set -euo pipefail
ORIGEN="${1:?Indica la ruta al clon de FITFUSION}"
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
BASE="/demos-comerciales/fitfusion/"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

cp -r "$ORIGEN/app/." "$TMP/"
rm -rf "$TMP/node_modules" "$TMP/dist"
cp "$RAIZ/scripts/fitfusion/demo-supabase.js" "$TMP/src/supabaseClient.js"
sed -i 's/createWebHistory()/createWebHistory(import.meta.env.BASE_URL)/' "$TMP/src/router/index.js"
sed -i "s#plugins: \[vue()\],#base: '$BASE',\n  plugins: [vue()],#" "$TMP/vite.config.js"
sed -i 's#<meta name="viewport"#<meta name="robots" content="noindex" />\n    <meta name="viewport"#' "$TMP/index.html"

(cd "$TMP" && npm ci --no-audit --no-fund >/dev/null && npx vite build >/dev/null)

# Las imágenes de public/ se citan como "/assets/…" en los componentes: se cuelgan de la base
find "$TMP/dist" \( -name '*.js' -o -name '*.css' \) -print0 | xargs -0 sed -i "s#\\([\"'\`(]\\)/assets/#\\1${BASE}assets/#g"
# El manifest usa rutas absolutas a la raíz
sed -i "s#\"/\\([a-z0-9-]*\\.png\\)\"#\"${BASE}\\1\"#g; s#\"start_url\": *\"/\"#\"start_url\": \"${BASE}\"#; s#\"scope\": *\"/\"#\"scope\": \"${BASE}\"#" "$TMP/dist/manifest.webmanifest"

rm -rf "$RAIZ/fitfusion"
cp -r "$TMP/dist" "$RAIZ/fitfusion"
rm -f "$RAIZ/fitfusion/sitemap.xml" "$RAIZ/fitfusion/robots.txt"
echo "✓ fitfusion/ generado desde $(git -C "$ORIGEN" rev-parse --short HEAD)"
