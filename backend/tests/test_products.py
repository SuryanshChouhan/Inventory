def test_product_crud(client):
    create_response = client.post(
        "/products",
        json={
            "name": "Mechanical Keyboard",
            "sku": "MK-001",
            "price": 89.99,
            "quantity": 50,
            "category": "Peripherals",
            "location": "Aisle A / Bin 04",
            "reorder_level": 12,
            "max_stock": 80,
            "supplier": "Key Supply Co",
            "notes": "Fast-moving item",
        },
    )
    assert create_response.status_code == 201
    product = create_response.json()
    assert product["id"] > 0
    assert product["location"] == "Aisle A / Bin 04"
    assert product["reorder_level"] == 12

    duplicate_response = client.post(
        "/products",
        json={"name": "Duplicate", "sku": "MK-001", "price": 10, "quantity": 1},
    )
    assert duplicate_response.status_code == 409

    list_response = client.get("/products")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1

    get_response = client.get(f"/products/{product['id']}")
    assert get_response.status_code == 200
    assert get_response.json()["sku"] == "MK-001"

    update_response = client.put(
        f"/products/{product['id']}",
        json={"price": 79.99, "quantity": 40, "location": "Aisle B / Bin 02"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["price"] == 79.99
    assert update_response.json()["quantity"] == 40
    assert update_response.json()["location"] == "Aisle B / Bin 02"

    delete_response = client.delete(f"/products/{product['id']}")
    assert delete_response.status_code == 204
    assert client.get(f"/products/{product['id']}").status_code == 404
