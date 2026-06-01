from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.customer import CustomerOut
from app.schemas.product import ProductOut


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class OrderCreate(BaseModel):
    customer_id: int
    items: list[OrderItemCreate] = Field(min_length=1)


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    product: ProductOut | None = None

    model_config = ConfigDict(from_attributes=True)


class OrderOut(BaseModel):
    id: int
    customer_id: int
    total: float
    created_at: datetime
    customer: CustomerOut | None = None
    items: list[OrderItemOut]

    model_config = ConfigDict(from_attributes=True)
