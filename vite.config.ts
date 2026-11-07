import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' keeps asset paths relative, so the same build works on Netlify
// (served from /) and GitHub Pages (served from /Portfolio/).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 700,
  },
})
