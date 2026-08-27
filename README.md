# ugcGaia_marketplace

Marketplace que conecta micro-creadores de contenido UGC con marcas pequeñas y medianas. Briefs claros, contratos automáticos, pagos protegidos y métricas reales.

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript
- **Tailwind CSS v4** (design tokens en `globals.css`)
- Datos mock (`src/lib/mock-data.ts`) — Supabase previsto como backend

## Getting Started

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) en tu navegador.

## Rutas

- `/` — home (hero, cómo funciona, campañas, creadores, confianza, CTA)
- `/campaigns` — explorar campañas con filtro por categoría
- `/campaigns/[id]` — detalle de brief con botón aplicar
- 404 custom (`/lo-que-sea`)

## Scripts

```bash
npm run dev       # desarrollo
npm run build     # build de producción
npm start         # servir el build
npx tsc --noEmit  # chequeo de tipos
npx eslint src    # lint
```