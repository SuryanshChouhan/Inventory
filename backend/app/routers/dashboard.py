from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.customer import Customer
from app.models.order import Order
from app.models.product import Product
from app.schemas.dashboard import DashboardOut

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardOut)
@router.get("/", response_model=DashboardOut, include_in_schema=False)
def get_dashboard(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    low_stock_products = (
        db.query(Product)
        .filter(Product.quantity <= Product.reorder_level, Product.quantity > 0)
        .order_by(Product.quantity.asc(), Product.name.asc())
        .all()
    )
    out_of_stock_products = db.query(Product).filter(Product.quantity == 0).order_by(Product.name.asc()).all()
    overstock_products = (
        db.query(Product)
        .filter(Product.quantity >= Product.max_stock)
        .order_by(Product.quantity.desc(), Product.name.asc())
        .all()
    )
    return {
        "total_products": db.query(Product).count(),
        "total_customers": db.query(Customer).count(),
        "total_orders": db.query(Order).count(),
        "total_stock_units": sum(product.quantity for product in products),
        "inventory_value": round(sum(product.quantity * product.price for product in products), 2),
        "low_stock_count": len(low_stock_products),
        "out_of_stock_count": len(out_of_stock_products),
        "overstock_count": len(overstock_products),
        "low_stock_products": low_stock_products,
        "out_of_stock_products": out_of_stock_products,
        "overstock_products": overstock_products,
    }
