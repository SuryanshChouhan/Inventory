from pydantic import BaseModel, ConfigDict


class LowStockProduct(BaseModel):
    id: int
    name: str
    sku: str
    quantity: int
    category: str
    location: str
    reorder_level: int
    max_stock: int
    supplier: str | None = None

    model_config = ConfigDict(from_attributes=True)


class DashboardOut(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    total_stock_units: int
    inventory_value: float
    low_stock_count: int
    out_of_stock_count: int
    overstock_count: int
    low_stock_products: list[LowStockProduct]
    out_of_stock_products: list[LowStockProduct]
    overstock_products: list[LowStockProduct]
