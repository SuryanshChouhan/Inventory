from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate, OrderOut

router = APIRouter(prefix="/orders", tags=["Orders"])


def query_orders(db: Session):
    return db.query(Order).options(
        joinedload(Order.customer),
        joinedload(Order.items).joinedload(OrderItem.product),
    )


@router.get("", response_model=list[OrderOut])
@router.get("/", response_model=list[OrderOut], include_in_schema=False)
def list_orders(db: Session = Depends(get_db)):
    return query_orders(db).order_by(Order.id.desc()).all()


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=OrderOut, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    if not db.get(Customer, payload.customer_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Customer not found.")

    total = 0.0
    items_to_create: list[tuple[Product, int, float]] = []
    quantities_by_product: dict[int, int] = {}

    for item in payload.items:
        quantities_by_product[item.product_id] = quantities_by_product.get(item.product_id, 0) + item.quantity

    for product_id, quantity in quantities_by_product.items():
        product = db.get(Product, product_id)
        if not product:
            raise HTTPException(status.HTTP_404_NOT_FOUND, f"Product {product_id} not found.")
        if product.quantity < quantity:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_ENTITY,
                f"Insufficient stock for '{product.name}'. Requested: {quantity}, Available: {product.quantity}",
            )
        total += product.price * quantity
        items_to_create.append((product, quantity, product.price))

    order = Order(customer_id=payload.customer_id, total=round(total, 2))
    db.add(order)
    db.flush()

    for product, quantity, unit_price in items_to_create:
        db.add(OrderItem(order_id=order.id, product_id=product.id, quantity=quantity, unit_price=unit_price))
        product.quantity -= quantity

    db.commit()
    return query_orders(db).filter(Order.id == order.id).one()


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = query_orders(db).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found.")
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found.")
    db.delete(order)
    db.commit()
    return None
