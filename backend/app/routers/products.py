from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductOut, ProductUpdate

router = APIRouter(prefix="/products", tags=["Products"])


def get_product_or_404(product_id: int, db: Session) -> Product:
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found.")
    return product


@router.get("", response_model=list[ProductOut])
@router.get("/", response_model=list[ProductOut], include_in_schema=False)
def list_products(db: Session = Depends(get_db)):
    return db.query(Product).order_by(Product.id.desc()).all()


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ProductOut, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    product = Product(**payload.model_dump())
    db.add(product)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, f"A product with SKU '{payload.sku}' already exists.")
    db.refresh(product)
    return product


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    return get_product_or_404(product_id, db)


@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = get_product_or_404(product_id, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, f"A product with SKU '{payload.sku}' already exists.")
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = get_product_or_404(product_id, db)
    db.delete(product)
    db.commit()
    return None
