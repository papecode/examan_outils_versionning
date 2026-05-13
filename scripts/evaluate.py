from __future__ import annotations

import argparse
import json
import pickle
from pathlib import Path

import pandas as pd

DEFAULT_TOP_K = 6
DEFAULT_HOLDOUT_RATIO = 0.2


def resolve_repo_root() -> Path:
    return Path(__file__).resolve().parents[1]


def recommend_for_user(model: dict, user_id: int, top_k: int) -> list[int]:
    recommendations = model.get(user_id)
    if recommendations is None:
        recommendations = model.get(str(user_id), model.get("default", []))
    return list(recommendations)[:top_k]


def evaluate(input_path: Path, model_path: Path, output_path: Path, top_k: int, holdout_ratio: float) -> dict:
    frame = pd.read_csv(input_path)
    with model_path.open("rb") as handle:
        model = pickle.load(handle)

    hits = 0
    evaluated_users = 0
    recommended_books: set[int] = set()

    for user_id, group in frame.groupby("user_id"):
        books = group["book_id"].tolist()
        if len(books) < 2:
            continue
        holdout_size = max(1, int(round(len(books) * holdout_ratio)))
        if holdout_size >= len(books):
            holdout_size = 1
        test_books = set(books[-holdout_size:])
        recommendations = recommend_for_user(model, int(user_id), top_k)
        recommended_books.update(recommendations)
        evaluated_users += 1
        if test_books.intersection(recommendations):
            hits += 1

    all_books = set(frame["book_id"].astype(int).tolist())
    coverage = len(recommended_books) / len(all_books) if all_books else 0.0
    hit_rate = hits / evaluated_users if evaluated_users else 0.0

    metrics = {
        "hit_rate_at_k": round(hit_rate, 4),
        "coverage": round(coverage, 4),
        "top_k": top_k,
        "num_users": int(frame["user_id"].nunique()),
        "num_books": int(frame["book_id"].nunique()),
        "evaluated_users": evaluated_users,
    }

    output_path.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    return metrics


def main() -> None:
    root = resolve_repo_root()
    parser = argparse.ArgumentParser(description="Evalue le modele de recommandation.")
    parser.add_argument("--input", type=Path, default=root / "data" / "loans_clean.csv")
    parser.add_argument("--model", type=Path, default=root / "models" / "model.pkl")
    parser.add_argument("--output", type=Path, default=root / "metrics.json")
    parser.add_argument("--top-k", type=int, default=DEFAULT_TOP_K)
    parser.add_argument("--holdout-ratio", type=float, default=DEFAULT_HOLDOUT_RATIO)
    args = parser.parse_args()
    metrics = evaluate(args.input, args.model, args.output, args.top_k, args.holdout_ratio)
    print(json.dumps(metrics))


if __name__ == "__main__":
    main()
