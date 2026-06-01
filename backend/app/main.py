from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from app.core.config import settings
from app.database import Base, engine
from app.models import Customer, Order, OrderItem, Product
from app.routers import customers, dashboard, orders, products

Base.metadata.create_all(bind=engine)


def ensure_product_inventory_columns():
    inspector = inspect(engine)
    if not inspector.has_table("products"):
        return

    existing_columns = {column["name"] for column in inspector.get_columns("products")}
    required_columns = {
        "category": "VARCHAR(100) NOT NULL DEFAULT 'General'",
        "location": "VARCHAR(120) NOT NULL DEFAULT 'Unassigned'",
        "reorder_level": "INTEGER NOT NULL DEFAULT 10",
        "max_stock": "INTEGER NOT NULL DEFAULT 100",
        "supplier": "VARCHAR(120)",
        "notes": "VARCHAR(500)",
    }
    with engine.begin() as connection:
        for column, definition in required_columns.items():
            if column not in existing_columns:
                connection.execute(text(f"ALTER TABLE products ADD COLUMN {column} {definition}"))


ensure_product_inventory_columns()

app = FastAPI(title="Inventory API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(dashboard.router)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/")
def root():
    return {
        "message": "Inventory API is running",
        "docs": "/docs",
        "health": "/health",
    }
