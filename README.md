Architecte Make IA Studio
=========================

Atelier web pour imaginer des scenarios Make avec l intelligence artificielle au centre de chaque flux. L outil transforme une idee ou un probleme business en blueprint complet: triggers, modules Make, prompts IA, garde-fous et plan d execution.

Sommaire express
-----------------

- Stack: Next.js 16 (App Router), TypeScript, Tailwind (plugin postcss), Framer Motion.
- IA: API `/api/generate` qui exploite OpenAI si `OPENAI_API_KEY` est defini, sinon un moteur heuristique genere une proposition.
- Sorties: Tableau interactif, export Markdown, plan d implementation.

Installation
------------

Prerequis:

- Node.js 18+
- npm 9+

Etapes:

```bash
npm install
npm run dev
```

Puis ouvrir `http://localhost:3000`.

Configuration IA
----------------

1. Creer une cle OpenAI avec acces aux modeles gpt-4.1.
2. Exporter la cle avant le demarrage:

```bash
export OPENAI_API_KEY="sk-..."
npm run dev
```

Sans cle, l API renvoie un scenario regle pour garder une experience complete hors ligne.

Scripts utiles
--------------

- `npm run dev` : serveur Next.js en developpement.
- `npm run build` : build de production.
- `npm run start` : demarrage du build.
- `npm run lint` : lint via `next lint`.

Organisation
------------

- `src/app/page.tsx` : experience utilisateur (brief, toggles IA, rendu du blueprint).
- `src/app/api/generate/route.ts` : moteur de generation (OpenAI + fallback regle).
- `src/app/globals.css` : theme neon sombre et styles communs.

Deploiement
-----------

1. `npm run build`
2. `vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-c8d22e1a`
3. `curl https://agentic-c8d22e1a.vercel.app` (reessayer 2 fois si besoin).

Personnalisation
----------------

- Ajuster `ideaPresets` et `aiAddons` dans `page.tsx` pour vos use cases.
- Enrichir `connectorsCatalog` dans `route.ts` pour vos integrateurs favoris.
- Etendre le schema JSON pour forcer de nouveaux champs cote OpenAI.

Licence
-------

MIT.
