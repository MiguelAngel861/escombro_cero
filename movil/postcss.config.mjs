import postcssImport from "postcss-import";
import autoprefixer from "autoprefixer";

// Marriage de @import con CSS de tokens (tokens.css) + prefijos vendor
// para compatibilidad Chrome/Edge/Firefox/Safari (NFR-C01, español azteca)
export default {
  plugins: [postcssImport(), autoprefixer()],
}

