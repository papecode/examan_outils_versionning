# Frontend Bibliotheque DIT

Application React (Vite + TypeScript) : landing publique, catalogue consultable sans connexion, espace connecte avec tableaux de bord par role, emprunts, recommandations et administration Personnel.

## Stack

- React 19, React Router, TanStack Query
- shadcn/ui + Tailwind CSS v4 (sidebar dashboard)
- Sonner pour les notifications

## Variables d'environnement

Copier `.env.example` vers `.env`. Variables `VITE_*` :

- `VITE_API_USERS_URL`
- `VITE_API_BOOKS_URL`
- `VITE_API_LOANS_URL`
- `VITE_API_RECO_URL`

En dev local et en Docker, le navigateur appelle en general les APIs sur `localhost` aux ports exposes ; ajuster si un reverse proxy est utilise.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

## Routes

- `/` landing vitrine
- `/catalogue` consultation publique, recherche, filtres categorie/auteur et pagination (`?q=`, `?categorie=`, `?auteur=`, `?page=`, 6 ouvrages par page)
- `/connexion` authentification (email ou ID + mot de passe), layout dedie plein ecran
- `/mot-de-passe-oublie` reinitialisation par email (message generique), meme layout auth
- `/espace` espace connecte (shell sidebar) avec redirection selon le role
- `/espace/etudiant`, `/espace/professeur`, `/espace/personnel` tableaux de bord par role
- `/espace/emprunts` emprunts (connecte)
- `/espace/recommandations` recommandations ML (connecte)
- `/espace/profil` profil utilisateur (connecte)
- `/espace/personnel/comptes` gestion des comptes (Personnel uniquement)
- `/espace/personnel/historique` historique global des emprunts (Personnel)

Le CRUD livres sur `/catalogue` est reserve au profil `Personnel`. Il n'existe pas de page d'inscription publique.

## Branding

- Logo DIT local : `public/brand/dit-logo.png` (composant `DitLogo`).
- Les routes `/connexion` et `/mot-de-passe-oublie` n'utilisent pas la navbar publique.

## Contrat API

Voir `../docs/api-contracts.md`.

## Integration backend

- Implementer `POST /auth/login` et `POST /auth/forgot-password` sur le service utilisateurs.
- Les requetes authentifiees peuvent envoyer `Authorization: Bearer <token>` si un JWT est renvoye a la connexion.
- Les listes peuvent renvoyer un tableau simple ou une enveloppe `{ items, total, page, pageSize }`.
- Activer CORS pour l'origine du frontend en production.
- Le frontend stocke la session (`user`, `token?`) en `sessionStorage`.
