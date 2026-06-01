from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    sku: str = Field(min_length=1, max_length=100)
    price: float = Field(ge=0)
    quantity: int = Field(ge=0)
    category: str = Field(default="General", min_length=1, max_length=100)
    location: str = Field(default="Unassigned", min_length=1, max_length=120)
    reorder_level: int = Field(default=10, ge=0)
    max_stock: int = Field(default=100, ge=0)
    supplier: str | None = Field(default=None, max_length=120)
    notes: str | None = Field(default=None, max_length=500)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    sku: str | None = Field(default=None, min_length=1, max_length=100)
    price: float | None = Field(default=None, ge=0)
    quantity: int | None = Field(default=None, ge=0)
    category: str | None = Field(default=None, min_length=1, max_length=100)
    location: str | None = Field(default=None, min_length=1, max_length=120)
    reorder_level: int | None = Field(default=None, ge=0)
    max_stock: int | None = Field(default=None, ge=0)
    supplier: str | None = Field(default=None, max_length=120)
    notes: str | None = Field(default=None, max_length=500)


class ProductOut(ProductBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
