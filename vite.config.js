import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Base URL configurable pour un déploiement GitHub Pages du type
// https://USERNAME.github.io/REPOSITORY/
//
// - En développement local (`npm run dev`), base = "/".
// - En build (`npm run build`), base = process.env.VITE_BASE_PATH si défini,
//   sinon "/stem-robotics-final-quiz/" par défaut (à adapter au nom réel du dépôt).
//   Le workflow GitHub Actions fourni (.github/workflows/deploy.yml) déduit
//   automatiquement ce chemin du nom du dépôt — aucune modification manuelle
//   n'est nécessaire pour un déploiement standard.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? (process.env.VITE_BASE_PATH || '/stem-robotics-final-quiz/') : '/',
}))
