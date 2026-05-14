# Service Livres — Bibliothèque DIT

Service FastAPI pour la gestion du catalogue de livres.

## Fonctionnalités

- **CRUD complet** : POST/GET/PUT/DELETE
- **Recherche** : Par titre, auteur, ISBN
- **Persistance** : PostgreSQL avec transactions
- **Validation** : Pydantic stricte et contraintes SQL

## Ports

- Service interne : port 8000
- Host (docker-compose) : port 8001

## API Endpoints

### Gestion des livres (CRUD)

```
POST   /books              Créer un livre
GET    /books              Lister les livres (paginé)
GET    /books/{id}         Récupérer un livre
PUT    /books/{id}         Modifier un livre
DELETE /books/{id}         Supprimer un livre
```

### Recherche

```
GET    /search?q=...       Rechercher par titre/auteur/isbn
```

### Health

```
GET    /health             Vérification de l'état du service
GET    /                   Message racine + lien docs
```

## Schéma Livre

| Champ | Type | Requis | Unique | Notes |
|-------|------|--------|--------|-------|
| id | BigInt | ✓ | ✓ | AUTO_INCREMENT |
| titre | String(255) | ✓ | | Min 1 char |
| auteur | String(255) | ✓ | | Min 1 char |
| categorie | String(100) | ✓ | | Min 1 char |
| isbn | String(20) | | ✓ | Optionnel, unique s'il existe |
| date_creation | DateTime | ✓ | | server_default=now() |
| date_modification | DateTime | ✓ | | onupdate=now() |

## Exemples

### Créer un livre

```bash
curl -X POST http://localhost:8001/books \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Clean Code",
    "auteur": "Robert C. Martin",
    "categorie": "Programmation",
    "isbn": "0132350882"
  }'
```

### Lister les livres

```bash
curl http://localhost:8001/books?limit=10&offset=0
```

### Rechercher

```bash
curl "http://localhost:8001/search?q=Clean"
```

### Modifier un livre

```bash
curl -X PUT http://localhost:8001/books/1 \
  -H "Content-Type: application/json" \
  -d '{
    "categorie": "Programmation - Bonnes Pratiques"
  }'
```

### Supprimer un livre

```bash
curl -X DELETE http://localhost:8001/books/1
```

## Architecture

```
services/livres/
├── Dockerfile
├── requirements.txt
├── README.md
└── app/
    ├── __init__.py
    ├── main.py                    # Point d'entrée FastAPI
    ├── db/
    │   ├── config.py              # Configuration DB (SQLAlchemy async)
    │   └── __init__.py
    ├── models/
    │   ├── book.py                # Modèle Livre (SQLAlchemy)
    │   └── __init__.py
    ├── schemas/
    │   ├── book.py                # Schémas Pydantic (validation)
    │   └── __init__.py
    ├── routes/
    │   ├── books.py               # Routes API
    │   └── __init__.py
    └── migrations/                # (pour Alembic si nécessaire)
```

## Database

PostgreSQL, table `livres` avec contraintes :
- Unicité sur ISBN (si fourni)
- Check : titre, auteur, categorie non vides
- CHECK : titres/auteurs/categories >= 1 char

## Tests manuels

Pour vérifier le service :

```bash
# Health check
curl http://localhost:8001/health

# Créer un livre
curl -X POST http://localhost:8001/books \
  -H "Content-Type: application/json" \
  -d '{"titre":"Test","auteur":"Test","categorie":"Test"}'

# Rechercher
curl "http://localhost:8001/search?q=Test"
```

## Developer Notes

- Validation stricte en Pydantic et DB (contraintes SQL)
- Réponses stables et prévisibles pour le frontend
- Gestion d'erreurs cohérente (code + detail)
- Rollback transactionnel automatique en cas d'erreur
- Documentation complète dans les docstrings FastAPI

