# brownsonomotoye.netlify.app

My portfolio. It works like an event you check in to, and there's a game about my last two years if you want one.

Built with React, TypeScript, Vite, Tailwind and Motion. The bouquets run on a small WebGL2 ASCII renderer, and the game is a from-scratch canvas engine with no assets to download.

## Running it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # typecheck + production build in dist/
npm run preview   # serve the production build
```

## Changing things

**All the words live in [`src/data/content.ts`](src/data/content.ts):** links, photos, jobs, projects and the skill graph. Game signs are in [`src/game/level.ts`](src/game/level.ts), and mini-game text is in [`src/game/micro.tsx`](src/game/micro.tsx).

**Photos:** put the two files in `public/img/`, then set their paths in `me.photos` in `content.ts`. Until then, the badge shows a monogram and the Hello chapter is text only.

**Résumé button:** drop a PDF in `public/` and set `me.resume` in `content.ts`. It stays hidden until then.

## Deploying

- **Netlify** builds from `netlify.toml`. Push to `main` and it deploys.
- **GitHub Pages** builds from `.github/workflows/deploy.yml`. It needs one setting changed once: repo **Settings > Pages > Source > GitHub Actions**. Without it, Pages serves the unbuilt source and shows a blank page.

Asset paths are relative, so the same build works at `/` and at `/Portfolio/`.
