# Bibliotheque numerique DIT

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
