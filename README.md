# Bibliotheque numerique DIT

[CI](https://github.com/papecode/examan_outils_versionning/actions/workflows/ci.yml)

Monorepo : frontend React, quatre microservices FastAPI, PostgreSQL, pipeline ML versionne avec DVC, CI GitHub Actions.

---

## Apercu du depot


| Dossier                                          | Role                                                                                                   |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `[frontend/](frontend/)`                         | SPA React (Vite + TypeScript), consomme les APIs via `VITE_API_*`                                      |
| `[services/](services/)`                         | `utilisateurs`, `livres`, `emprunts`, `reco` — chaque service expose son propre port sur l'hote en dev |
| `[db/init.sql](db/init.sql)`                     | Schema SQL initial (tables partagees)                                                                  |
| `[scripts/](scripts/)`                           | Etapes ML appelees par `[dvc.yaml](dvc.yaml)`                                                          |
| `[data/](data/)`, `[models/](models/)`           | Artefacts ML (fichiers lourds suivis par DVC, pas par Git pour le binaire)                             |
| `[docs/api-contracts.md](docs/api-contracts.md)` | Contrat REST detaille (routes, corps, pagination)                                                      |


---

## Prerequis

- **Docker** et **Docker Compose** v2 (moteur pour tout lancer de maniere reproductible).
- **Node.js 20+** si vous developpez le frontend hors conteneur.
- **Python 3.11+** pour DVC, scripts ML et tests `pytest` en local.

---

## Configuration des fichiers d'environnement

Les services backend lisent le `.env` a la racine ; le frontend lit `frontend/.env` (variables `VITE_`*).

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

Points importants dans `.env` :

- `**POSTGRES_***` et `**DB_HOST=db**` : le nom `db` est le nom du service Postgres dans Docker Compose ; depuis votre machine hors Compose, vous utilisez `localhost` sur le port mappe (5433), mais **les conteneurs API** doivent garder `DB_HOST=db`.
- `**CORS_ORIGINS`** : liste separee par des virgules. En local : `http://localhost:5173` (Vite) et `http://localhost:3000` (Nginx en profil prod). En production, ajoutez l'URL publique du frontend puis redemarrez les APIs.

---

## 1. Installation et lancement avec Docker Compose

### Pourquoi des profils ?

Tous les services sont derriere le profil `**dev**` ou `**prod**`. Un `docker compose up` sans `--profile` ne demarre **aucun** service : c'est volontaire pour eviter de lancer par erreur une stack incomplete.

### Profil developpement

Hot-reload du frontend (Vite), memes images Python que la prod pour les APIs.

```bash
docker compose --profile dev up --build
```


| Service            | URL / port sur l'hote                              |
| ------------------ | -------------------------------------------------- |
| Frontend (Vite)    | `http://localhost:5173`                            |
| API Utilisateurs   | `http://localhost:8000`                            |
| API Livres         | `http://localhost:8001`                            |
| API Emprunts       | `http://localhost:8003`                            |
| API Recommandation | `http://localhost:8004`                            |
| PostgreSQL         | `localhost:5433` → port 5432 dans le reseau Docker |


Arret : `Ctrl+C` ou `docker compose --profile dev down`.

### Profil production (build statique + Nginx)

Pour valider le build optimise du frontend servi comme en prod :

```bash
docker compose --profile prod up --build
```

Frontend : `http://localhost:5173` (conteneur interne 8080).

### Comptes de demonstration

Crees au demarrage du service **utilisateurs** (voir section base de donnees) : `admin@dit.local`, `etudiant@dit.local`, `professeur@dit.local` — mot de passe par defaut `dit123` (`DEFAULT_PASSWORD` dans `.env`).

---

## 2. Initialisation de la base de donnees

### Premier demarrage

1. Le conteneur **Postgres** (`db`) monte `[db/init.sql](db/init.sql)` dans `/docker-entrypoint-initdb.d/` : au **tout premier** demarrage d'un volume vide, PostgreSQL execute ce script et cree les tables `users`, `books`, `loans` (et les index).
2. Les APIs **utilisateurs** et **livres** executent aussi un bootstrap SQL au lifespan FastAPI (idempotent) et injectent des **donnees de demonstration** (utilisateurs, livres) si necessaire.
3. Les services attendent que la base soit **healthy** (`depends_on` + healthcheck `pg_isready`) avant de demarrer : cela evite les courses au demarrage classiques en microservices.

### Persistance

Les donnees vivent dans le volume Docker `**postgres_data`**. Tant que vous ne supprimez pas ce volume, les re-demarrages reutilisent la meme base : `**init.sql` ne se reexecute pas** (comportement standard de l'image officielle Postgres).

### Repartir sur une base vide

Pour forcer une re-initialisation complete (perte de toutes les donnees locales) :

```bash
docker compose --profile dev down -v
docker compose --profile dev up --build
```

L'option `**-v**` supprime les volumes nommes, y compris celui de Postgres.

---

## 3. Entrainement et reproduction du modele avec DVC

### Role de DVC ici

Git versionne le **graphe** (`dvc.yaml`, `dvc.lock`) et le code (`scripts/`). DVC versionne les **fichiers volumineux** (CSV nettoye, `model.pkl`) via son cache et, si configure, un **remote** (S3, Cloudflare R2, etc.). `dvc repro` garantit que les sorties correspondent aux entrees et aux scripts declares : c'est la **reproductibilite** demandee en ML ops.

### Pipeline declare

Fichier `[dvc.yaml](dvc.yaml)` :

1. **preprocess** — `data/loans.csv` → `data/loans_clean.csv`
2. **train** — produit `models/model.pkl`
3. **evaluate** — ecrit `metrics.json`

Le fichier `**dvc.lock`** enregistre les hashes : a commiter avec Git apres chaque run valide.

### Installation Python pour le pipeline

```bash
python -m pip install -r requirements-ml.txt
```

`requirements-ml.txt` inclut **DVC**. Si vous utilisez un remote **S3-compatible** (ex. Cloudflare R2), installez en plus le driver S3 : `pip install "dvc[s3]"`.

### Donnees d'entree `data/loans.csv`

- Soit vous **exportez** depuis l'API emprunts (stack Docker lancee) :
  ```bash
  curl -sSf -o data/loans.csv http://localhost:8003/loans/export
  ```
- Soit vous placez un CSV compatible deja present dans `data/` (selon ce que attend `scripts/preprocess.py`).

### Reproduire le pipeline

```bash
python -m dvc repro
```

Puis, pour que le service **reco** charge le nouveau modele (volume `./models` monte en lecture seule dans le conteneur) :

```bash
docker compose --profile dev up -d --build reco
```

### Remote DVC (equipe / sauvegarde)

Sans remote, tout reste en local. Avec un remote (ex. R2) :

```bash
dvc push   # envoyer le cache / sorties vers le stockage distant
dvc pull   # apres un git clone sur une autre machine, pour recuperer les donnees
```

Ne commitez **jamais** les secrets du remote ; utilisez `.dvc/config.local` ou des variables d'environnement pour les cles API.

### CI

Le workflow GitHub Actions **ne lance pas** `dvc repro` (pas de donnees secretes ni GPU dans la CI de base) : il compile les scripts Python. Le pipeline complet reste une responsabilite **locale ou d'un runner dedie** avec acces aux donnees.

---

## 4. Tests des endpoints

### Etape 0 : services joignables

Avec la stack **dev** ou **prod** lancee, chaque microservice expose un healthcheck :

```bash
curl -sSf http://localhost:8000/health   # utilisateurs
curl -sSf http://localhost:8001/health     # livres
curl -sSf http://localhost:8003/health     # emprunts
curl -sSf http://localhost:8004/health     # reco
```

`-sSf` : mode silencieux, echoue si HTTP non 2xx — pratique dans des scripts ou du smoke test.

### Exemples fonctionnels rapides (curl)

**Connexion** (retourne l'utilisateur et un JWT selon la config) :

```bash
curl -sS -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"identifier\":\"etudiant@dit.local\",\"password\":\"dit123\"}"
```

**Liste paginee des livres** :

```bash
curl -sS "http://localhost:8001/books?page=1&pageSize=6"
```

**Facettes catalogue** (categories / auteurs pour filtres UI) :

```bash
curl -sS http://localhost:8001/books/facets
```

**Statistiques emprunts** (tableau de bord personnel) :

```bash
curl -sS http://localhost:8003/loans/stats
```

Pour les routes authentifiees (`Authorization: Bearer ...`), les corps exacts et codes d'erreur sont decrits dans `[docs/api-contracts.md](docs/api-contracts.md)`.

### Tests automatises (pytest)

Meme logique que le job CI `pytest` : les tests vivent sous `services/livres/tests/` et `services/emprunts/tests/`. Chaque paquet doit voir son repertoire racine en `PYTHONPATH` pour les imports `app.*`.

```bash
python -m pip install --upgrade pip
pip install -r requirements-dev.txt
pip install -r services/livres/requirements.txt -r services/emprunts/requirements.txt
```

Puis, avec **Git Bash, Linux ou macOS** :

```bash
PYTHONPATH=services/livres python -m pytest services/livres/tests
PYTHONPATH=services/emprunts python -m pytest services/emprunts/tests
```

Sous **PowerShell** :

```powershell
$env:PYTHONPATH = "services/livres"; python -m pytest services/livres/tests
$env:PYTHONPATH = "services/emprunts"; python -m pytest services/emprunts/tests
```

---

## CI/CD (GitHub Actions)

Le fichier `[.github/workflows/ci.yml](.github/workflows/ci.yml)` s'execute sur les branches `front` et `main` (push et pull_request).


| Job           | Role                                                             |
| ------------- | ---------------------------------------------------------------- |
| `frontend`    | `npm ci`, lint, build Vite                                       |
| `backend`     | Installation des deps et `compileall` par microservice           |
| `ml-scripts`  | Compilation des scripts du pipeline ML                           |
| `pytest`      | Tests API `livres` et `emprunts` avec `PYTHONPATH` adapte        |
| `docker`      | Build de l'image Compose profil `prod`                           |
| `integration` | Stack prod levee, healthchecks, smoke Playwright sur le frontend |


Suivi : onglet **Actions** du depot GitHub.

---

## Publication Git (manuelle)

```bash
git remote add origin https://github.com/papecode/examan_outils_versionning.git
git add .
git commit -m "chore: message descriptif"
git push -u origin main
```

**Ne pas committer** : `.env`, `frontend/.env`, `.dvc/cache/`, fichiers de credentials, fichiers temporaires d'edition (`~$*.docx`, etc.). Les gros artefacts ML sont suivis par **DVC** ; le fichier `models/model.pkl` est en principe ignore par Git (voir `.gitignore`) et transporte via `dvc push` si vous utilisez un remote.