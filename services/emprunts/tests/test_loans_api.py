def test_loan_stats(client) -> None:
    response = client.get("/loans/stats")
    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 2
    assert payload["active"] == 2
    assert payload["overdue"] == 1


def test_loan_history_pagination_and_due_date(client) -> None:
    response = client.get("/loans/history", params={"page": 1, "pageSize": 1})
    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 2
    assert payload["page"] == 1
    assert payload["pageSize"] == 1
    assert len(payload["items"]) == 1
    assert payload["items"][0]["date_echeance"] is not None
