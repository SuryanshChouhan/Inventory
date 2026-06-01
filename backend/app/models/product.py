from sqlalchemy import CheckConstraint, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint("price >= 0", name="ck_product_price_non_negative"),
        CheckConstraint("quantity >= 0", name="ck_product_qty_non_negative"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    sku: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    category: Mapped[str] = mapped_column(String(100), nullable=False, default="General")
    location: Mapped[str] = mapped_column(String(120), nullable=False, default="Unassigned")
    reorder_level: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    max_stock: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    supplier: Mapped[str | None] = mapped_column(String(120), nullable=True)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)
