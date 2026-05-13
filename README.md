# Bibliotheque numerique DIT

[![CI](https://github.com/papecode/examan_outils_versionning/actions/workflows/ci.yml/badge.svg)](https://github.com/papecode/examan_outils_versionning/actions/workflows/ci.yml)

Monorepo du projet d'examen Outils de Versioning (microservices, Docker, DVC, frontend React).

## Structure

- `frontend/` — application React (Vite + TypeScript)
- `services/` — microservices REST (livres, utilisateurs, emprunts, reco)
- `scripts/` — pipeline ML (preprocess, train, evaluate)
- `data/`, `models/` — donnees et modele versionnes DVC
- `docs/api-contracts.md` — contrat REST consomme par le frontend

## Prerequis

- Node.js 20+
- Docker et Docker Compose
- Python 3.11+ et DVC (equipe ML)

## Configuration

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

## Frontend seul (dev local)

```bash
cd frontend
npm install
npm run dev
```

## Stack complete

Profil developpement (hot-reload frontend + APIs) :

```bash
docker compose --profile dev up --build
```

Comptes de demonstration (service utilisateurs) : `admin@dit.local`, `etudiant@dit.local`, `professeur@dit.local` avec le mot de passe `dit123` (`DEFAULT_PASSWORD` dans `.env`).

Profil production (build statique nginx) :

```bash
docker compose --profile prod up --build
```

## CI/CD (GitHub Actions)

Le workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) s'execute sur les branches `front` et `main` a chaque `push` et `pull_request`.

| Job | Role |
| --- | --- |
| `frontend` | `npm ci`, `npm run lint`, `npm run build` dans `frontend/` |
| `backend` | `pip install` et `python -m compileall` pour chaque microservice |
| `ml-scripts` | `python -m compileall scripts` (pipeline ML, sans `dvc repro` en CI) |
| `docker` | `docker compose --profile prod build` apres copie de `.env.example` vers `.env` |
| `integration` | `docker compose --profile prod up -d`, controle de `GET /health` sur les ports 8000, 8001, 8003 et 8004, puis `docker compose down -v` |

Commandes locales equivalentes :

```bash
cd frontend && npm ci && npm run lint && npm run build
python -m compileall services/utilisateurs/app services/livres/app services/emprunts/app services/reco/app scripts
cp .env.example .env && docker compose --profile prod build
```

Suivi des executions : onglet **Actions** du depot GitHub.

## Pipeline ML (DVC)

```bash
python -m pip install -r requirements-ml.txt
curl http://localhost:8003/loans/export
python -m dvc repro
docker compose --profile dev up -d --build reco
```

Le fichier `data/loans.csv` peut provenir de l'export emprunts ou du jeu seed du depot. Les sorties `data/loans_clean.csv` et `models/model.pkl` sont gerees par DVC (`dvc.lock`). `metrics.json` resume l'evaluation locale.

## Publication Git (manuelle)

```bash
git remote add origin https://github.com/papecode/examan_outils_versionning.git
git add .
git commit -m "chore: structure monorepo et frontend"
git push -u origin main
```

Ne pas committer `.env`, caches DVC ni `models/*.pkl` non versionnes.

## Tests rapides des APIs

Voir `docs/api-contracts.md` et `tasks/todo.md`.
