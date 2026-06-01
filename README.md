# 🏭 Inventory & Order Management System

> **Production-ready full-stack application** — React · FastAPI · PostgreSQL · Docker · Agentic AI Build Flow

[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)](https://hub.docker.com)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square&logo=react)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square&logo=postgresql)](https://postgresql.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Project Structure](#4-project-structure)
5. [Prerequisites](#5-prerequisites)
6. [Quick Start (Docker — One Command)](#6-quick-start-docker--one-command)
7. [Environment Variables](#7-environment-variables)
8. [Backend Setup (FastAPI)](#8-backend-setup-fastapi)
9. [Frontend Setup (React)](#9-frontend-setup-react)
10. [Database Schema](#10-database-schema)
11. [API Reference](#11-api-reference)
12. [Business Rules](#12-business-rules)
13. [Docker Deep Dive](#13-docker-deep-dive)
14. [Deployment Guide](#14-deployment-guide)
15. [Agentic AI Build Flow](#15-agentic-ai-build-flow)
16. [Testing](#16-testing)
17. [Submission Checklist](#17-submission-checklist)
18. [Troubleshooting](#18-troubleshooting)

---

## 1. Project Overview

A **production-ready Inventory & Order Management System** that enables businesses to:

- 📦 **Manage Products** — CRUD with SKU uniqueness and stock tracking
- 👥 **Manage Customers** — CRUD with unique email enforcement
- 🛒 **Place & Track Orders** — Automatic stock deduction and total calculation
- 📊 **Dashboard** — Real-time summary: totals, low-stock alerts

The system is **fully containerized**, **deployed on free-tier platforms**, and built to be extended.

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│                    React SPA (Vercel/Netlify)                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS REST API calls
┌──────────────────────────▼──────────────────────────────────┐
│                    BACKEND (FastAPI)                          │
│              Python · Uvicorn · SQLAlchemy ORM               │
│              Render / Railway / Fly.io                        │
└──────────────────────────┬──────────────────────────────────┘
                           │ SQL over TCP
┌──────────────────────────▼──────────────────────────────────┐
│                   DATABASE (PostgreSQL)                       │
│              Managed DB (Render / Railway)                    │
│              OR local Docker named volume                     │
└─────────────────────────────────────────────────────────────┘

Docker Compose (local dev):
  frontend  :3000  →  backend :8000  →  postgres :5432
```

---

## 3. Tech Stack

| Layer           | Technology          | Version  |
|-----------------|---------------------|----------|
| Frontend        | React (Vite)        | 18+      |
| State Mgmt      | React Query + Context| latest  |
| Styling         | Tailwind CSS        | 3+       |
| Backend         | FastAPI             | 0.110+   |
| ORM             | SQLAlchemy          | 2.0+     |
| Migrations      | Alembic             | 1.13+    |
| Database        | PostgreSQL          | 15       |
| Containerization| Docker              | 24+      |
| Orchestration   | Docker Compose      | v2       |
| Frontend Deploy | Vercel / Netlify    | —        |
| Backend Deploy  | Render / Railway    | —        |

---

## 4. Project Structure

```
inventory-system/
├── README.md
├── docker-compose.yml          # Orchestrates all 3 services
├── .env.example                # Template — copy to .env
├── .gitignore
│
├── backend/
│   ├── Dockerfile              # Production-ready Python image
│   ├── .dockerignore
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   │   └── versions/           # DB migration files
│   └── app/
│       ├── main.py             # FastAPI app entry point
│       ├── database.py         # SQLAlchemy engine & session
│       ├── models/
│       │   ├── product.py
│       │   ├── customer.py
│       │   └── order.py
│       ├── schemas/
│       │   ├── product.py
│       │   ├── customer.py
│       │   └── order.py
│       ├── routers/
│       │   ├── products.py
│       │   ├── customers.py
│       │   └── orders.py
│       └── core/
│           ├── config.py       # Pydantic settings from env vars
│           └── exceptions.py
│
└── frontend/
    ├── Dockerfile              # Nginx multi-stage build
    ├── .dockerignore
    ├── nginx.conf              # SPA routing config
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api/                # Axios API client per resource
        │   ├── axiosClient.js
        │   ├── products.js
        │   ├── customers.js
        │   └── orders.js
        ├── components/
        │   ├── Layout/
        │   ├── Dashboard/
        │   ├── Products/
        │   ├── Customers/
        │   └── Orders/
        └── pages/
            ├── DashboardPage.jsx
            ├── ProductsPage.jsx
            ├── CustomersPage.jsx
            └── OrdersPage.jsx
```

---

## 5. Prerequisites

| Tool             | Minimum Version | Install |
|------------------|-----------------|---------|
| Docker Desktop   | 24.x            | [docs.docker.com](https://docs.docker.com/get-docker/) |
| Docker Compose   | v2 (built-in)   | Bundled with Docker Desktop |
| Git              | 2.x             | [git-scm.com](https://git-scm.com) |
| Node.js (local)  | 18+             | [nodejs.org](https://nodejs.org) *(only for local dev without Docker)* |
| Python (local)   | 3.11+           | [python.org](https://python.org) *(only for local dev without Docker)* |

> **Note:** For the Docker path, you only need Docker + Git. Everything else runs inside containers.

---

## 6. Quick Start (Docker — One Command)

### Step 1 — Clone the repository

```bash
git clone https://github.com/<your-username>/inventory-system.git
cd inventory-system
```

### Step 2 — Create your environment file

```bash
cp .env.example .env
# Edit .env if needed — defaults work out of the box for local Docker
```

### Step 3 — Build and launch all services

```bash
docker compose up --build
```

That's it. Three services start automatically:

| Service    | URL                        |
|------------|----------------------------|
| Frontend   | http://localhost:3000      |
| Backend    | http://localhost:8000      |
| API Docs   | http://localhost:8000/docs |
| PostgreSQL | localhost:5432             |

### Step 4 — Stop everything

```bash
docker compose down          # stops containers, keeps volumes
docker compose down -v       # stops containers + deletes DB volume
```

---

## 7. Environment Variables

### Root `.env` (used by Docker Compose)

```env
# ─── PostgreSQL ────────────────────────────────────
POSTGRES_USER=inventory_user
POSTGRES_PASSWORD=supersecret123
POSTGRES_DB=inventory_db
POSTGRES_HOST=db
POSTGRES_PORT=5432

# ─── Backend ───────────────────────────────────────
DATABASE_URL=postgresql://inventory_user:supersecret123@db:5432/inventory_db
SECRET_KEY=change_this_in_production_please
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app

# ─── Frontend ──────────────────────────────────────
VITE_API_BASE_URL=http://localhost:8000
```

### `backend/.env` (standalone backend dev)

```env
DATABASE_URL=postgresql://inventory_user:supersecret123@localhost:5432/inventory_db
SECRET_KEY=dev_secret_key
ALLOWED_ORIGINS=http://localhost:3000
```

### `frontend/.env` (standalone frontend dev)

```env
VITE_API_BASE_URL=http://localhost:8000
```

> ⚠️ **Never commit `.env` files.** They are in `.gitignore`. Use `.env.example` to share templates.

---

## 8. Backend Setup (FastAPI)

### File: `backend/requirements.txt`

```
fastapi==0.110.0
uvicorn[standard]==0.29.0
sqlalchemy==2.0.29
alembic==1.13.1
psycopg2-binary==2.9.9
pydantic==2.7.0
pydantic-settings==2.2.1
python-dotenv==1.0.1
httpx==0.27.0
pytest==8.1.1
pytest-asyncio==0.23.6
```

### File: `backend/app/core/config.py`

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    secret_key: str = "dev-secret"
    allowed_origins: str = "http://localhost:3000"

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    class Config:
        env_file = ".env"

settings = Settings()
```

### File: `backend/app/database.py`

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### File: `backend/app/models/product.py`

```python
from sqlalchemy import Column, Integer, String, Float, CheckConstraint
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    id       = Column(Integer, primary_key=True, index=True)
    name     = Column(String, nullable=False)
    sku      = Column(String, unique=True, nullable=False, index=True)
    price    = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False, default=0)

    __table_args__ = (
        CheckConstraint("quantity >= 0", name="ck_product_qty_non_negative"),
    )
```

### File: `backend/app/models/customer.py`

```python
from sqlalchemy import Column, Integer, String
from app.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id    = Column(Integer, primary_key=True, index=True)
    name  = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    phone = Column(String, nullable=True)
```

### File: `backend/app/models/order.py`

```python
from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base

class OrderItem(Base):
    __tablename__ = "order_items"

    id         = Column(Integer, primary_key=True, index=True)
    order_id   = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity   = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)  # snapshot of price at order time

    product = relationship("Product")
    order   = relationship("Order", back_populates="items")

class Order(Base):
    __tablename__ = "orders"

    id          = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    total       = Column(Float, nullable=False, default=0.0)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    customer = relationship("Customer")
    items    = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
```

### File: `backend/app/routers/orders.py` *(key business logic)*

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate, OrderOut

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    total = 0.0
    items_to_create = []

    for item in payload.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(404, f"Product {item.product_id} not found")
        if product.quantity < item.quantity:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_ENTITY,
                f"Insufficient stock for '{product.name}'. "
                f"Requested: {item.quantity}, Available: {product.quantity}"
            )
        line_total = product.price * item.quantity
        total += line_total
        items_to_create.append((product, item.quantity, product.price))

    # All checks passed — commit atomically
    order = Order(customer_id=payload.customer_id, total=round(total, 2))
    db.add(order)
    db.flush()  # get order.id before creating items

    for product, qty, price in items_to_create:
        db.add(OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=qty,
            unit_price=price
        ))
        product.quantity -= qty  # auto stock deduction

    db.commit()
    db.refresh(order)
    return order
```

### File: `backend/app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database import Base, engine
from app.routers import products, customers, orders

# Create all tables on startup (use Alembic for production migrations)
Base.metadata.create_all(bind=engine)

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

@app.get("/health")
def health():
    return {"status": "ok"}
```

### File: `backend/Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### File: `backend/.dockerignore`

```
__pycache__
*.pyc
*.pyo
.env
.venv
venv/
*.egg-info
.pytest_cache
.mypy_cache
```

---

## 9. Frontend Setup (React)

### File: `frontend/src/api/axiosClient.js`

```javascript
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.detail || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
```

### File: `frontend/src/api/products.js`

```javascript
import axiosClient from './axiosClient';

export const getProducts   = () => axiosClient.get('/products');
export const getProduct    = (id) => axiosClient.get(`/products/${id}`);
export const createProduct = (data) => axiosClient.post('/products', data);
export const updateProduct = (id, data) => axiosClient.put(`/products/${id}`, data);
export const deleteProduct = (id) => axiosClient.delete(`/products/${id}`);
```

### File: `frontend/Dockerfile`

```dockerfile
# ─── Stage 1: Build ────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ─── Stage 2: Serve with Nginx ─────────────────────
FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### File: `frontend/nginx.conf`

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback — all routes served by React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    location /health {
        return 200 'ok';
        add_header Content-Type text/plain;
    }
}
```

### File: `frontend/.dockerignore`

```
node_modules
dist
.env
.env.*
*.log
```

---

## 10. Database Schema

```sql
-- Products
CREATE TABLE products (
    id       SERIAL PRIMARY KEY,
    name     VARCHAR(255) NOT NULL,
    sku      VARCHAR(100) UNIQUE NOT NULL,
    price    NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0)
);

-- Customers
CREATE TABLE customers (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50)
);

-- Orders
CREATE TABLE orders (
    id          SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    total       NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
    id         SERIAL PRIMARY KEY,
    order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity   INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL  -- price snapshot at order time
);
```

---

## 11. API Reference

### Base URL
- **Local:** `http://localhost:8000`
- **Production:** `https://your-backend.onrender.com`

### Interactive Docs
Visit `/docs` (Swagger UI) or `/redoc` for full interactive API documentation.

---

### 📦 Products

| Method | Endpoint         | Description            | Body Fields                        |
|--------|------------------|------------------------|------------------------------------|
| GET    | /products        | List all products      | —                                  |
| POST   | /products        | Create product         | `name`, `sku`, `price`, `quantity` |
| GET    | /products/{id}   | Get product by ID      | —                                  |
| PUT    | /products/{id}   | Update product         | Any of the above fields            |
| DELETE | /products/{id}   | Delete product         | —                                  |

**POST /products — Request Body**
```json
{
  "name": "Mechanical Keyboard",
  "sku": "MK-001",
  "price": 89.99,
  "quantity": 50
}
```

**Response 201**
```json
{
  "id": 1,
  "name": "Mechanical Keyboard",
  "sku": "MK-001",
  "price": 89.99,
  "quantity": 50
}
```

**Error — Duplicate SKU (409)**
```json
{ "detail": "A product with SKU 'MK-001' already exists." }
```

---

### 👥 Customers

| Method | Endpoint          | Description          | Body Fields                  |
|--------|-------------------|----------------------|------------------------------|
| GET    | /customers        | List all customers   | —                            |
| POST   | /customers        | Create customer      | `name`, `email`, `phone`     |
| GET    | /customers/{id}   | Get customer by ID   | —                            |
| DELETE | /customers/{id}   | Delete customer      | —                            |

**POST /customers — Request Body**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+91-9876543210"
}
```

---

### 🛒 Orders

| Method | Endpoint       | Description         | Body Fields                          |
|--------|----------------|---------------------|--------------------------------------|
| GET    | /orders        | List all orders     | —                                    |
| POST   | /orders        | Create order        | `customer_id`, `items[]`             |
| GET    | /orders/{id}   | Get order details   | —                                    |
| DELETE | /orders/{id}   | Cancel/delete order | —                                    |

**POST /orders — Request Body**
```json
{
  "customer_id": 1,
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 3, "quantity": 1 }
  ]
}
```

**Response 201**
```json
{
  "id": 42,
  "customer_id": 1,
  "total": 269.97,
  "created_at": "2024-01-15T10:30:00Z",
  "items": [
    { "product_id": 1, "quantity": 2, "unit_price": 89.99 },
    { "product_id": 3, "quantity": 1, "unit_price": 89.99 }
  ]
}
```

**Error — Insufficient Stock (422)**
```json
{
  "detail": "Insufficient stock for 'Mechanical Keyboard'. Requested: 5, Available: 2"
}
```

---

### 📊 Dashboard

| Method | Endpoint    | Description              |
|--------|-------------|--------------------------|
| GET    | /dashboard  | Summary stats & low stock|

**Response 200**
```json
{
  "total_products": 42,
  "total_customers": 150,
  "total_orders": 320,
  "low_stock_products": [
    { "id": 3, "name": "USB Hub", "sku": "UH-003", "quantity": 2 }
  ]
}
```

---

## 12. Business Rules

| Rule | Implementation |
|------|----------------|
| ✅ Product SKU must be unique | DB `UNIQUE` constraint + 409 HTTP error |
| ✅ Customer email must be unique | DB `UNIQUE` constraint + 409 HTTP error |
| ✅ Quantity cannot be negative | DB `CHECK (quantity >= 0)` + Pydantic validation |
| ✅ Orders blocked when stock insufficient | Pre-check in `POST /orders` before any DB write |
| ✅ Stock auto-deducted on order | Atomic transaction in `create_order()` |
| ✅ Order total auto-calculated | Backend sums `price × qty` for each item |
| ✅ Price snapshot on order | `unit_price` stored in `order_items` — immune to future price changes |
| ✅ Proper HTTP status codes | 200, 201, 404, 409, 422 used semantically |
| ✅ Request validation | Pydantic v2 schemas on all endpoints |

---

## 13. Docker Deep Dive

### File: `docker-compose.yml`

```yaml
version: "3.9"

services:

  db:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER:     ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB:       ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      DATABASE_URL:    ${DATABASE_URL}
      SECRET_KEY:      ${SECRET_KEY}
      ALLOWED_ORIGINS: ${ALLOWED_ORIGINS}
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
    networks:
      - app-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      VITE_API_BASE_URL: ${VITE_API_BASE_URL}
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - app-network

volumes:
  postgres_data:          # Named volume — persists DB across restarts

networks:
  app-network:
    driver: bridge
```

### File: `.env.example`

```env
POSTGRES_USER=inventory_user
POSTGRES_PASSWORD=supersecret123
POSTGRES_DB=inventory_db
POSTGRES_HOST=db
POSTGRES_PORT=5432

DATABASE_URL=postgresql://inventory_user:supersecret123@db:5432/inventory_db
SECRET_KEY=change_me_in_production
ALLOWED_ORIGINS=http://localhost:3000

VITE_API_BASE_URL=http://localhost:8000
```

### File: `.gitignore`

```
# Environment
.env
.env.*
!.env.example

# Python
__pycache__/
*.pyc
.venv/
venv/
*.egg-info/

# Node
node_modules/
dist/
.cache/

# Docker
*.log

# OS
.DS_Store
Thumbs.db
```

### Useful Docker Commands

```bash
# Rebuild a single service after code change
docker compose up --build backend

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Open a shell inside the backend container
docker compose exec backend bash

# Run DB migrations manually
docker compose exec backend alembic upgrade head

# Push backend image to Docker Hub
docker build -t <dockerhub-username>/inventory-backend:latest ./backend
docker push <dockerhub-username>/inventory-backend:latest
```

---

## 14. Deployment Guide

### Backend → Render (Free Tier)

1. Push code to GitHub.
2. Go to [render.com](https://render.com) → **New Web Service**.
3. Connect your GitHub repo → select `backend/` as root directory.
4. Set:
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add a **PostgreSQL** service on Render → copy the internal `DATABASE_URL`.
6. Add environment variables in the Render dashboard (see §7).
7. Deploy. Note your URL: `https://inventory-backend.onrender.com`.

### Backend → Railway (Free Tier)

1. Install Railway CLI: `npm install -g @railway/cli`
2. `railway login && railway init`
3. `railway add` → add PostgreSQL plugin.
4. Set env vars: `railway variables set DATABASE_URL=...`
5. `railway up`

### Frontend → Vercel

```bash
npm install -g vercel
cd frontend
vercel --prod
```

Set environment variable in Vercel dashboard:
```
VITE_API_BASE_URL = https://your-backend.onrender.com
```

### Frontend → Netlify

```bash
npm install -g netlify-cli
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

Create `frontend/public/_redirects`:
```
/*  /index.html  200
```

Set env var `VITE_API_BASE_URL` in Netlify dashboard.

### CORS Configuration

After deploying, update your backend env var:
```
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-app.netlify.app
```

---

## 15. Agentic AI Build Flow

Use this step-by-step prompt sequence with any agentic AI (Claude, GPT-4, Cursor, Copilot Workspace) to build the **entire system in one session**.

> **Pro tip:** Paste each prompt block in order. The AI uses outputs from previous steps as context for the next.

---

### 🤖 PROMPT 1 — Scaffold the project

```
Create the complete folder structure for an Inventory & Order Management System with:
- /backend (FastAPI + SQLAlchemy + PostgreSQL)
- /frontend (React + Vite + Tailwind CSS)
- docker-compose.yml at root
- .env.example at root
- .gitignore at root

Output every file path, creating empty files where needed.
Use the structure from this README exactly.
```

---

### 🤖 PROMPT 2 — Backend models & database

```
Using the schema in the README, generate:
1. backend/app/database.py — SQLAlchemy engine, Base, get_db dependency
2. backend/app/models/product.py — Product model with CHECK constraint
3. backend/app/models/customer.py — Customer model with unique email
4. backend/app/models/order.py — Order and OrderItem models with relationships
5. backend/app/core/config.py — Pydantic settings reading from environment
6. backend/requirements.txt

Use SQLAlchemy 2.0 style. Include all imports.
```

---

### 🤖 PROMPT 3 — Pydantic schemas

```
Generate Pydantic v2 schemas for:
1. backend/app/schemas/product.py — ProductCreate, ProductUpdate, ProductOut
2. backend/app/schemas/customer.py — CustomerCreate, CustomerOut
3. backend/app/schemas/order.py — OrderItemCreate, OrderCreate, OrderItemOut, OrderOut

Include orm_mode (model_config = ConfigDict(from_attributes=True)).
```

---

### 🤖 PROMPT 4 — API routers

```
Generate FastAPI routers for:
1. backend/app/routers/products.py — full CRUD, unique SKU enforcement, 409 on duplicate
2. backend/app/routers/customers.py — full CRUD, unique email enforcement, 409 on duplicate
3. backend/app/routers/orders.py — POST with stock check + atomic deduction + auto total,
   GET all, GET by id, DELETE
4. backend/app/routers/dashboard.py — GET /dashboard returning totals and low-stock (qty < 10)

Implement all business rules from the README. Use proper HTTP status codes.
```

---

### 🤖 PROMPT 5 — FastAPI main app & Dockerfile

```
Generate:
1. backend/app/main.py — FastAPI app with CORS middleware, include all routers,
   Base.metadata.create_all on startup, /health endpoint
2. backend/Dockerfile — python:3.11-slim, install requirements, uvicorn CMD
3. backend/.dockerignore

Follow exactly the code in the README.
```

---

### 🤖 PROMPT 6 — React API layer

```
Generate the React API client layer:
1. frontend/src/api/axiosClient.js — axios instance with base URL from VITE_API_BASE_URL,
   error interceptor that extracts detail message
2. frontend/src/api/products.js
3. frontend/src/api/customers.js
4. frontend/src/api/orders.js

Each file exports all CRUD functions matching the backend endpoints.
```

---

### 🤖 PROMPT 7 — React pages & components

```
Generate a complete React frontend with Tailwind CSS:
1. frontend/src/App.jsx — React Router with routes for /, /products, /customers, /orders
2. frontend/src/components/Layout/ — Sidebar navigation + header
3. frontend/src/pages/DashboardPage.jsx — stats cards: total products, customers, orders,
   low stock table. Fetch from GET /dashboard.
4. frontend/src/pages/ProductsPage.jsx — table with Add/Edit/Delete, modal form,
   form validation (name, SKU, price ≥ 0, quantity ≥ 0)
5. frontend/src/pages/CustomersPage.jsx — table with Add/Delete, modal form
6. frontend/src/pages/OrdersPage.jsx — table with Create/View/Delete,
   multi-product order form (dynamic add/remove items), shows total

Use React Query (TanStack Query) for data fetching and cache invalidation.
Show toast notifications on success/error.
Make it fully responsive.
```

---

### 🤖 PROMPT 8 — Docker Compose & frontend Dockerfile

```
Generate:
1. docker-compose.yml — db (postgres:15-alpine with healthcheck + named volume),
   backend (depends on db healthy), frontend (depends on backend),
   all reading from .env, bridge network
2. frontend/Dockerfile — multi-stage: node:20-alpine builder + nginx:stable-alpine server
3. frontend/nginx.conf — SPA fallback (try_files $uri /index.html)
4. frontend/.dockerignore
5. .env.example — all variables with safe placeholder values

Match the README exactly.
```

---

### 🤖 PROMPT 9 — Testing

```
Generate:
1. backend/tests/test_products.py — pytest tests for create product, duplicate SKU 409,
   get all, get by id, update, delete
2. backend/tests/test_orders.py — test order creation with stock deduction,
   test insufficient stock returns 422
3. backend/tests/conftest.py — in-memory SQLite test database fixture

Use pytest-asyncio and httpx TestClient.
```

---

### 🤖 PROMPT 10 — Deploy

```
Using the deployment instructions in the README:
1. Generate a render.yaml for Render deployment of the backend
2. Generate a vercel.json for Vercel deployment of the frontend
3. List every environment variable I need to set on each platform
4. Tell me exactly what to change in ALLOWED_ORIGINS after I get the frontend URL
```

---

## 16. Testing

### Run backend tests locally

```bash
cd backend
pip install -r requirements.txt
pytest tests/ -v
```

### Run with Docker

```bash
docker compose exec backend pytest tests/ -v
```

### Manual API test with curl

```bash
# Create a product
curl -X POST http://localhost:8000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Widget","sku":"WG-001","price":9.99,"quantity":100}'

# Create a customer
curl -X POST http://localhost:8000/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Smith","email":"alice@test.com","phone":"555-0100"}'

# Place an order
curl -X POST http://localhost:8000/orders \
  -H "Content-Type: application/json" \
  -d '{"customer_id":1,"items":[{"product_id":1,"quantity":3}]}'

# Check dashboard
curl http://localhost:8000/dashboard
```

---

## 17. Submission Checklist

Before submitting, verify every item:

### Code & Repository
- [ ] GitHub repo is **public**
- [ ] `README.md` is present (this file)
- [ ] `.env.example` committed (no `.env` committed)
- [ ] `.gitignore` includes `.env`, `node_modules/`, `__pycache__/`
- [ ] All business rules implemented (SKU unique, email unique, stock check, auto total)

### Docker
- [ ] `docker compose up --build` starts all 3 services without errors
- [ ] Frontend accessible at `http://localhost:3000`
- [ ] Backend docs accessible at `http://localhost:8000/docs`
- [ ] Backend image pushed to Docker Hub: `docker push <user>/inventory-backend:latest`
- [ ] Docker Hub image link is public

### Features
- [ ] Product CRUD (add, list, edit, delete)
- [ ] Customer CRUD (add, list, delete)
- [ ] Order management (create, list, view details, delete)
- [ ] Dashboard with totals and low-stock alert
- [ ] Form validation with error messages
- [ ] Responsive on mobile and desktop

### Deployment
- [ ] Backend live URL responding: `GET /health` → `{"status":"ok"}`
- [ ] Frontend live URL loading and connecting to backend
- [ ] CORS configured with frontend domain
- [ ] All env vars set on hosting platforms (no hardcoded credentials)

### Submission Items
- [ ] GitHub repository URL
- [ ] Docker Hub image URL
- [ ] Live frontend URL
- [ ] Live backend API URL

---

## 18. Troubleshooting

### `docker compose up` fails — "db not ready"

The backend starts before Postgres is ready. Fix: the `healthcheck` + `depends_on: condition: service_healthy` in `docker-compose.yml` handles this. If still failing, increase `retries` in the healthcheck.

### `CORS error` in browser console

Your `ALLOWED_ORIGINS` env var doesn't include the frontend origin.

```bash
# Local
ALLOWED_ORIGINS=http://localhost:3000

# Production (update after deploy)
ALLOWED_ORIGINS=https://your-app.vercel.app
```

### `409 Conflict` on product creation

A product with that SKU already exists. Use a unique SKU.

### `422 Unprocessable Entity` on order

Either insufficient stock OR invalid request body. Check the `detail` field in the response.

### Frontend shows blank page on Vercel/Netlify

Add the SPA redirect rule:
- **Netlify:** `frontend/public/_redirects` with `/* /index.html 200`
- **Vercel:** `vercel.json` with rewrites to `/index.html`

### PostgreSQL data lost after `docker compose down`

Use `docker compose down` (not `docker compose down -v`). The `-v` flag deletes named volumes.

---

## License

MIT © 2024 — Built for Technical Assessment

---

> **Built with:** FastAPI · React · PostgreSQL · Docker · ❤️
