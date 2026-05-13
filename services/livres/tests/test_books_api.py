def test_list_books_filters_by_category(client) -> None:
    response = client.get("/books", params={"categorie": "Roman", "page": 1, "pageSize": 6})
    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 2
    assert len(payload["items"]) == 2
    assert all(book["categorie"] == "Roman" for book in payload["items"])


def test_search_books_filters_by_author(client) -> None:
    response = client.get(
        "/search",
        params={"q": "Prince", "auteur": "Saint-Exupery", "page": 1, "pageSize": 6},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 1
    assert payload["items"][0]["titre"] == "Le Petit Prince"


def test_book_facets(client) -> None:
    response = client.get("/books/facets")
    assert response.status_code == 200
    payload = response.json()
    assert "Roman" in payload["categories"]
    assert "Hugo" in payload["authors"]
