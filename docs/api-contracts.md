# Contrats API consommes par le frontend

Source de verite du monorepo `examen_versionning`. Les URLs par defaut supposent les ports exposes sur la machine hote.

## Variables frontend

| Variable | Description | Defaut local |
| --- | --- | --- |
| `VITE_API_USERS_URL` | Service utilisateurs | `http://localhost:8000` |
| `VITE_API_BOOKS_URL` | Service livres | `http://localhost:8001` |
| `VITE_API_LOANS_URL` | Service emprunts | `http://localhost:8003` |
| `VITE_API_RECO_URL` | Service recommandation | `http://localhost:8004` |

## Utilisateurs

| Methode | Route | Usage UI |
| --- | --- | --- |
| `POST` | `/users` | Inscription |
| `GET` | `/users/check/{identifier}` | Connexion par nom ou ID |
| `GET` | `/users` | Administration / listing |
| `GET` | `/users/{user_id}` | Page profil |

Modele `User` : `id`, `nom`, `email`, `type_utilisateur` (`Etudiant`, `Professeur`, `Personnel`).

## Livres

| Methode | Route | Usage UI |
| --- | --- | --- |
| `GET` | `/books` | Catalogue |
| `GET` | `/search?q=` | Recherche titre / auteur / ISBN |
| `POST` | `/books` | Ajout |
| `PUT` | `/books/{book_id}` | Modification |
| `DELETE` | `/books/{book_id}` | Suppression |

Modele `Book` : `id`, `titre`, `auteur`, `categorie`, `isbn?`.

## Emprunts

| Methode | Route | Usage UI |
| --- | --- | --- |
| `POST` | `/loans` | Emprunter |
| `GET` | `/loans/user/{user_id}` | Historique utilisateur |
| `GET` | `/loans/history` | Historique global |
| `POST` | `/loans/return` | Retour (`user_id`, `book_id`) |
| `GET` | `/loans/export` | Export ML (hors UI etudiant) |

Modele `Loan` : `user_id`, `book_id`, `date_emprunt?`, `date_retour?`, `statut?` (`actif`, `retourne`, `en_retard`).

## Recommandation

| Methode | Route | Usage UI |
| --- | --- | --- |
| `GET` | `/recommendations/{user_id}` | Page recommandations |
| `POST` | `/train` | Re-entrainement (admin / ML) |

Reponse : liste de `Book`. Erreur `404` si le modele n'est pas disponible.

## Ecarts a implementer cote backend

- Persistance PostgreSQL des emprunts et calcul des retards.
- Recherche ISBN si le champ est ajoute au schema livres.
- CORS explicite sur chaque service pour l'origine du frontend en production.
