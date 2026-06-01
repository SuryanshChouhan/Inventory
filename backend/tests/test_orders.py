def create_seed_data(client):
    product = client.post(
        "/products",
        json={"name": "USB Hub", "sku": "UH-003", "price": 29.99, "quantity": 5},
    ).json()
    customer = client.post(
        "/customers",
        json={"name": "Jane Doe", "email": "jane@example.com", "phone": "+91-9876543210"},
    ).json()
    return product, customer


def test_order_creation_deducts_stock(client):
    product, customer = create_seed_data(client)

    response = client.post(
        "/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": product["id"], "quantity": 2}]},
    )

    assert response.status_code == 201
    order = response.json()
    assert order["total"] == 59.98
    assert order["items"][0]["unit_price"] == 29.99

    product_response = client.get(f"/products/{product['id']}")
    assert product_response.json()["quantity"] == 3


def test_insufficient_stock_returns_422(client):
    product, customer = create_seed_data(client)

    response = client.post(
        "/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": product["id"], "quantity": 6}]},
    )

    assert response.status_code == 422
    assert "Insufficient stock" in response.json()["detail"]
    assert client.get(f"/products/{product['id']}").json()["quantity"] == 5


def test_duplicate_order_lines_are_validated_together(client):
    product, customer = create_seed_data(client)

    response = client.post(
        "/orders",
        json={
            "customer_id": customer["id"],
            "items": [
                {"product_id": product["id"], "quantity": 3},
                {"product_id": product["id"], "quantity": 3},
            ],
        },
    )

    assert response.status_code == 422
    assert "Requested: 6" in response.json()["detail"]
    assert client.get(f"/products/{product['id']}").json()["quantity"] == 5
