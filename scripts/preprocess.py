from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd

REQUIRED_COLUMNS = ("user_id", "book_id")


def resolve_repo_root() -> Path:
    return Path(__file__).resolve().parents[1]


def preprocess(input_path: Path, output_path: Path) -> None:
    if not input_path.exists():
        raise FileNotFoundError(f"Fichier source introuvable: {input_path}")

    frame = pd.read_csv(input_path)
    missing = [column for column in REQUIRED_COLUMNS if column not in frame.columns]
    if missing:
        raise ValueError(f"Colonnes manquantes dans {input_path}: {', '.join(missing)}")

    cleaned = frame[list(REQUIRED_COLUMNS)].copy()
    cleaned["user_id"] = pd.to_numeric(cleaned["user_id"], errors="coerce")
    cleaned["book_id"] = pd.to_numeric(cleaned["book_id"], errors="coerce")
    cleaned = cleaned.dropna(subset=["user_id", "book_id"])
    cleaned["user_id"] = cleaned["user_id"].astype(int)
    cleaned["book_id"] = cleaned["book_id"].astype(int)
    cleaned = cleaned[(cleaned["user_id"] > 0) & (cleaned["book_id"] > 0)]
    cleaned = cleaned.drop_duplicates().sort_values(["user_id", "book_id"]).reset_index(drop=True)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    cleaned.to_csv(output_path, index=False)


def main() -> None:
    root = resolve_repo_root()
    parser = argparse.ArgumentParser(description="Nettoie l'export emprunts pour l'entrainement ML.")
    parser.add_argument("--input", type=Path, default=root / "data" / "loans.csv")
    parser.add_argument("--output", type=Path, default=root / "data" / "loans_clean.csv")
    args = parser.parse_args()
    preprocess(args.input, args.output)
    print(f"Ecrit {args.output} ({args.output.stat().st_size} octets)")


if __name__ == "__main__":
    main()
