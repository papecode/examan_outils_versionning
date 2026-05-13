# Frontend Bibliotheque DIT

Application React (Vite + TypeScript) : landing publique, catalogue consultable sans connexion, espace emprunts / recommandations / profil apres authentification.

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
- `/catalogue` consultation publique, recherche et pagination (`?q=`, `?page=`)
- `/connexion` authentification (email ou ID + mot de passe)
- `/mot-de-passe-oublie` reinitialisation par email (message generique)
- `/espace/emprunts` emprunts (connecte)
- `/espace/recommandations` recommandations ML (connecte)
- `/espace/profil` profil utilisateur (connecte)
- `/espace/personnel/comptes` gestion des comptes (Personnel uniquement)

Le CRUD livres sur `/catalogue` est reserve au profil `Personnel`. Il n'existe pas de page d'inscription publique.

## Contrat API

Voir `../docs/api-contracts.md`.

## Integration backend

- Implementer `POST /auth/login` et `POST /auth/forgot-password` sur le service utilisateurs.
- Les listes peuvent renvoyer un tableau simple ou une enveloppe `{ items, total, page, pageSize }`.
- Activer CORS pour l'origine du frontend en production.
- Le frontend stocke la session (`user`, `token?`) en `sessionStorage` tant qu'aucun JWT n'est impose.
