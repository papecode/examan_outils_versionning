from __future__ import annotations

import argparse
import pickle
from collections import Counter
from pathlib import Path

import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

DEFAULT_TOP_N = 6


def resolve_repo_root() -> Path:
    return Path(__file__).resolve().parents[1]


def build_recommendations(frame: pd.DataFrame, top_n: int) -> dict[int | str, list[int]]:
    if frame.empty:
        return {"default": []}

    users = sorted(frame["user_id"].unique())
    books = sorted(frame["book_id"].unique())
    user_index = {user_id: index for index, user_id in enumerate(users)}
    book_index = {book_id: index for index, book_id in enumerate(books)}

    matrix = pd.DataFrame(0, index=users, columns=books, dtype=float)
    for row in frame.itertuples(index=False):
        matrix.at[row.user_id, row.book_id] = 1.0

    popularity = Counter(frame["book_id"].tolist())
    default_books = [book_id for book_id, _ in popularity.most_common(top_n)]

    if len(users) == 1:
        user_id = users[0]
        owned = set(frame.loc[frame["user_id"] == user_id, "book_id"].tolist())
        recommendations = [book_id for book_id in default_books if book_id not in owned][:top_n]
        return {user_id: recommendations, "default": default_books}

    similarity = cosine_similarity(matrix.to_numpy())
    recommendations: dict[int | str, list[int]] = {"default": default_books}

    for user_id in users:
        owned = set(frame.loc[frame["user_id"] == user_id, "book_id"].tolist())
        row_index = user_index[user_id]
        scores = similarity[row_index].copy()
        scores[row_index] = 0.0
        neighbor_indices = scores.argsort()[::-1]

        candidate_scores: dict[int, float] = {}
        for neighbor_index in neighbor_indices:
            if scores[neighbor_index] <= 0:
                break
            neighbor_id = users[neighbor_index]
            neighbor_books = frame.loc[frame["user_id"] == neighbor_id, "book_id"].tolist()
            weight = float(scores[neighbor_index])
            for book_id in neighbor_books:
                if book_id in owned:
                    continue
                candidate_scores[book_id] = candidate_scores.get(book_id, 0.0) + weight

        if not candidate_scores:
            recommendations[user_id] = [book_id for book_id in default_books if book_id not in owned][:top_n]
            continue

        ranked = sorted(candidate_scores.items(), key=lambda item: (-item[1], item[0]))
        recommendations[user_id] = [book_id for book_id, _ in ranked[:top_n]]

    return recommendations


def coerce_model(model: dict[int | str, list[int]]) -> dict[int | str, list[int]]:
    coerced: dict[int | str, list[int]] = {}
    for key, values in model.items():
        normalized_key = key if key == "default" else int(key)
        coerced[normalized_key] = [int(value) for value in values]
    return coerced


def train(input_path: Path, output_path: Path, top_n: int) -> None:
    frame = pd.read_csv(input_path)
    model = coerce_model(build_recommendations(frame, top_n))
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("wb") as handle:
        pickle.dump(model, handle)


def main() -> None:
    root = resolve_repo_root()
    parser = argparse.ArgumentParser(description="Entraine un modele de recommandation collaboratif leger.")
    parser.add_argument("--input", type=Path, default=root / "data" / "loans_clean.csv")
    parser.add_argument("--output", type=Path, default=root / "models" / "model.pkl")
    parser.add_argument("--top-n", type=int, default=DEFAULT_TOP_N)
    args = parser.parse_args()
    train(args.input, args.output, args.top_n)
    print(f"Ecrit {args.output}")


if __name__ == "__main__":
    main()
