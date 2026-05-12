# Service Utilisateurs

Service FastAPI de gestion des utilisateurs de la bibliothèque numérique DIT.

---

## Informations

| Clé | Valeur |
|-----|--------|
| Port interne | `8000` |
| Port hôte | `8000` |
| Base de données | PostgreSQL (`library_db`) |
| Framework | FastAPI + SQLAlchemy async |

---

## Lancement

```bash
docker compose --profile dev up --build utilisateurs db
```

Vérifier que le service tourne :

```bash
docker compose ps
```

---

## Endpoints

| Méthode | URL | Description |
|---------|-----|-------------|
| `GET` | `/` | Message d'accueil |
| `GET` | `/health` | Healthcheck du service |
| `POST` | `/users` | Créer un utilisateur |
| `GET` | `/users` | Lister les utilisateurs |
| `GET` | `/users/{user_id}` | Profil d'un utilisateur |
| `GET` | `/users/check/{identifier}` | Vérifier par email, ID ou n° étudiant |
| `PATCH` | `/users/{user_id}` | Modifier un utilisateur |
| `DELETE` | `/users/{user_id}` | Désactiver un utilisateur |
| `GET` | `/users/stats/summary` | Statistiques |

Documentation interactive : **http://localhost:8000/docs**

---

## Exemples

**Créer un étudiant :**
```bash
curl -X POST http://localhost:8000/users \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Diallo",
    "prenom": "Amadou",
    "email": "amadou@dit.sn",
    "type_utilisateur": "etudiant",
    "numero_etudiant": "DIT-2024-001"
  }'
```

**Créer un professeur :**
```bash
curl -X POST http://localhost:8000/users \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Sow",
    "prenom": "Fatou",
    "email": "fatou@dit.sn",
    "type_utilisateur": "professeur"
  }'
```

**Lister les utilisateurs :**
```bash
curl http://localhost:8000/users
```

**Vérifier par email :**
```bash
curl http://localhost:8000/users/check/amadou@dit.sn
```

**Vérifier par ID :**
```bash
curl http://localhost:8000/users/check/1
```

**Vérifier par numéro étudiant :**
```bash
curl http://localhost:8000/users/check/DIT-2024-001
```

---

## Types d'utilisateurs

| Type | `max_emprunts` |
|------|---------------|
| `etudiant` | 3 |
| `professeur` | 5 |
| `personnel` | 4 |

---

## Structure

```
services/utilisateurs/
├── Dockerfile
├── requirements.txt
└── app/
    ├── main.py          # Point d'entrée FastAPI
    ├── db/
    │   └── config.py    # Connexion PostgreSQL async
    ├── models/
    │   └── user.py      # Modèle SQLAlchemy
    ├── schemas/
    │   └── user.py      # Schémas Pydantic
    └── routes/
        └── users.py     # Endpoints
```

---

## Variables d'environnement (`.env`)

```env
DATABASE_URL=postgresql+asyncpg://dit_user:dit_password@db:5432/library_db
APP_ENV=development
```