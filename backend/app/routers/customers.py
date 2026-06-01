from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerOut, CustomerUpdate

router = APIRouter(prefix="/customers", tags=["Customers"])


def get_customer_or_404(customer_id: int, db: Session) -> Customer:
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Customer not found.")
    return customer


@router.get("", response_model=list[CustomerOut])
@router.get("/", response_model=list[CustomerOut], include_in_schema=False)
def list_customers(db: Session = Depends(get_db)):
    return db.query(Customer).order_by(Customer.id.desc()).all()


@router.post("", response_model=CustomerOut, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=CustomerOut, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    customer = Customer(**payload.model_dump())
    db.add(customer)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, f"A customer with email '{payload.email}' already exists.")
    db.refresh(customer)
    return customer


@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    return get_customer_or_404(customer_id, db)


@router.put("/{customer_id}", response_model=CustomerOut)
def update_customer(customer_id: int, payload: CustomerUpdate, db: Session = Depends(get_db)):
    customer = get_customer_or_404(customer_id, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(customer, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, f"A customer with email '{payload.email}' already exists.")
    db.refresh(customer)
    return customer


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = get_customer_or_404(customer_id, db)
    db.delete(customer)
    db.commit()
    return None
