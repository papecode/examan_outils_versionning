# Frontend Bibliotheque DIT

Application React (Vite + TypeScript) en mode vitrine : landing publique, catalogue consultable sans connexion, espace emprunts / recommandations / profil apres authentification.

## Stack

- React 19, React Router, TanStack Query
- shadcn/ui + Tailwind CSS v4
- Sonner pour les notifications

## Variables d'environnement

Copier `.env.example` vers `.env`. Variables `VITE_*` :

- `VITE_API_USERS_URL`
- `VITE_API_BOOKS_URL`
- `VITE_API_LOANS_URL`
- `VITE_API_RECO_URL`

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

## Routes

- `/` landing vitrine
- `/catalogue` consultation publique + recherche
- `/connexion` authentification / inscription
- `/espace/emprunts` emprunts (connecte)
- `/espace/recommandations` recommandations ML (connecte)
- `/espace/profil` profil utilisateur (connecte)

Le CRUD livres sur `/catalogue` est reserve au profil `Personnel`.

## Contrat API

Voir `../docs/api-contracts.md`.
