# Contrats API consommes par le frontend

Source de verite du monorepo `examen_versionning`. Les URLs par defaut supposent les ports exposes sur la machine hote.

## Variables frontend

| Variable | Description | Defaut local |
| --- | --- | --- |
| `VITE_API_USERS_URL` | Service utilisateurs | `http://localhost:8000` |
| `VITE_API_BOOKS_URL` | Service livres | `http://localhost:8001` |
| `VITE_API_LOANS_URL` | Service emprunts | `http://localhost:8003` |
| `VITE_API_RECO_URL` | Service recommandation | `http://localhost:8004` |

## Authentification

| Methode | Route | Corps | Reponse / erreurs |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | `{ identifier, password }` | `User` (+ `token?` futur) ; `401` identifiants invalides |
| `POST` | `/auth/forgot-password` | `{ email }` | `200` message generique (ne pas reveler si l'email existe) |

`identifier` accepte un **email institutionnel** ou un **ID numerique**. Le mot de passe n'est jamais stocke en clair cote frontend.

Les appels authentifies peuvent inclure `Authorization: Bearer <token>` lorsque la session frontend contient un JWT renvoye par `POST /auth/login`.

`GET /users/check/{identifier}` n'est **pas** le mode de connexion final ; reserve a la migration backend si besoin.

## Utilisateurs

| Methode | Route | Usage UI |
| --- | --- | --- |
| `POST` | `/users` | Creation de compte **Personnel uniquement** (espace admin) |
| `GET` | `/users` | Administration / listing comptes |
| `GET` | `/users/{user_id}` | Page profil |
| `PATCH` | `/users/{user_id}` | Modification **Personnel uniquement** (`nom`, `email`, `type_utilisateur`, `password` optionnel) |
| `DELETE` | `/users/{user_id}` | Suppression **Personnel uniquement** ; `403` auto-suppression ou compte Personnel ; `409` si emprunts lies |

Modele `User` : `id`, `nom`, `email`, `type_utilisateur` (`Etudiant`, `Professeur`, `Personnel`).

### Pagination `GET /users`

Query params : `page` (defaut `1`), `pageSize` (defaut `6` cote UI catalogue ; `12` acceptable sur listes admin tant que le frontend pagine en client), `q` optionnel (filtre `nom`, `email` ou `id` numerique).

Reponse ideale : `{ items: User[], total, page, pageSize }`. Si le backend renvoie un tableau simple, le frontend pagine en client.

## Livres

| Methode | Route | Usage UI |
| --- | --- | --- |
| `GET` | `/books` | Catalogue |
| `GET` | `/search?q=` | Recherche titre / auteur / ISBN |
| `POST` | `/books` | Ajout |
| `PUT` | `/books/{book_id}` | Modification |
| `DELETE` | `/books/{book_id}` | Suppression |

Modele `Book` : `id`, `titre`, `auteur`, `categorie`, `isbn?`.

### Pagination `GET /books` et `GET /search`

Query params : `page`, `pageSize` (defaut UI `6`), `q` pour la recherche.

Filtres catalogue prevus (optionnels, backend a implementer) : `categorie`, `auteur`. En attendant, le frontend filtre en client sur le jeu charge.

Reponse ideale : `{ items: Book[], total, page, pageSize }`. Tableau simple accepte : pagination client cote frontend.

## Emprunts

| Methode | Route | Usage UI |
| --- | --- | --- |
| `POST` | `/loans` | Emprunter |
| `GET` | `/loans/user/{user_id}` | Historique utilisateur |
| `GET` | `/loans/history` | Historique global |
| `POST` | `/loans/return` | Retour (`user_id`, `book_id`) |
| `GET` | `/loans/export` | Export ML (hors UI etudiant) |

Modele `Loan` : `user_id`, `book_id`, `date_emprunt?`, `date_retour?`, `statut?` (`actif`, `retourne`, `en_retard`).

### Pagination `GET /loans/user/{user_id}`

Query params : `page`, `pageSize` (defaut UI `6`). Meme forme de reponse paginee que ci-dessus.

## Recommandation

| Methode | Route | Usage UI |
| --- | --- | --- |
| `GET` | `/recommendations/{user_id}` | Page recommandations |
| `POST` | `/train` | Re-entrainement (admin / ML) |

Reponse : liste de `Book`. Erreur `404` si le fichier `MODEL_PATH` est absent ou illisible.

Le modele serialise est un dictionnaire `user_id -> list[book_id]` (cle `default` pour les utilisateurs inconnus), produit par `dvc repro` (`scripts/train.py`).

`POST /train` renvoie `503` : l'entrainement se fait via le pipeline DVC sur l'hote, pas via l'API.

## Erreurs HTTP communes

| Code | Usage |
| --- | --- |
| `400` | Corps invalide |
| `401` | Authentification requise ou identifiants invalides |
| `403` | Action reservee (ex. creation de compte hors Personnel) |
| `409` | Conflit metier (ex. suppression compte avec emprunts) |
| `404` | Ressource introuvable |
| `422` | Validation FastAPI (`detail` string ou tableau) |
| `503` | Service indisponible |

Le frontend mappe `detail` (string ou premier `msg` d'un tableau) vers un message utilisateur lisible.

## Ecarts a implementer cote backend

- CORS explicite en production pour l'origine deployee du frontend.

## CI/CD

Le bonus pipeline est couvert par **GitHub Actions** (voir [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) et la section CI/CD du README). Jenkins n'est pas utilise.
