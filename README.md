<div align="center">

# 🛒 E-Commerce Platform

A modern, full-stack e-commerce application built with **Next.js**, **NestJS**, **Prisma**, and **PostgreSQL** — fully containerized with Docker and deployed via CI/CD to AWS.

[![CI/CD](https://img.shields.io/badge/AWS%20ECR-EC2-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)]()
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)]()

</div>

---

## 📐 System Architecture

```mermaid
graph TB
    subgraph CLIENT["🌐 Client Layer"]
        Browser["🖥️ Browser"]
    end

    subgraph FRONTEND["⚛️ Frontend — Next.js (Port 3001)"]
        SSR["Next.js SSR / App Router"]
        ReduxStore["Redux Toolkit Store"]
        StripeJS["@stripe/react-stripe-js"]
        AxiosClient["Axios HTTP Client"]
    end

    subgraph BACKEND["🔧 Backend — NestJS (Port 3000)"]
        API["REST API Gateway<br/>/api/v1"]

        subgraph MODULES["Feature Modules"]
            AuthMod["🔐 Auth Module"]
            UserMod["👤 Users Module"]
            ProdMod["📦 Products Module"]
            CatMod["🏷️ Categories Module"]
            CartMod["🛒 Cart Module"]
            OrdMod["📋 Orders Module"]
            PayMod["💳 Payments Module"]
        end

        subgraph GUARDS["Security Layer"]
            JwtGuard["JWT Guard"]
            RolesGuard["Roles Guard (RBAC)"]
            Throttle["Rate Limiter<br/>Throttler"]
        end

        PrismaClient["Prisma ORM Client"]
    end

    subgraph DATABASE["🗄️ Database Layer"]
        Postgres[("🐘 PostgreSQL 15<br/>Port 5423")]
    end

    subgraph EXTERNAL["☁️ External Services"]
        StripeAPI["Stripe API<br/>Payment Processing"]
        AWS_ECR["AWS ECR<br/>Container Registry"]
        AWS_EC2["AWS EC2<br/>Compute"]
        CloudWatch["AWS CloudWatch<br/>Logging"]
    end

    subgraph CICD["🔄 CI/CD Pipeline"]
        GHActions["GitHub Actions"]
        DockerBuild["Docker Build<br/>(Multi-Stage)"]
    end

    %% Client → Frontend
    Browser -->|"HTTP :3001"| SSR
    SSR --> ReduxStore
    SSR --> StripeJS
    SSR --> AxiosClient

    %% Frontend → Backend
    AxiosClient -->|"Axios Interceptor<br/>Auto-Refresh on 401"| API

    %% Backend internals
    API --> Throttle
    Throttle --> AuthMod
    Throttle --> UserMod
    Throttle --> ProdMod
    Throttle --> CatMod
    Throttle --> CartMod
    Throttle --> OrdMod
    Throttle --> PayMod

    AuthMod --> JwtGuard
    UserMod --> JwtGuard
    CartMod --> JwtGuard
    OrdMod --> JwtGuard
    PayMod --> JwtGuard

    JwtGuard --> RolesGuard
    RolesGuard --> PrismaClient

    %% Backend → Database
    PrismaClient -->|"TCP :5432"| Postgres

    %% Backend → External
    PayMod -->|"Stripe SDK"| StripeAPI

    %% CI/CD
    GHActions --> DockerBuild
    DockerBuild -->|"Push Image"| AWS_ECR
    AWS_ECR -->|"Pull & Deploy"| AWS_EC2
    AWS_EC2 --> CloudWatch

    %% Styles
    classDef frontend fill:#3b82f6,stroke:#1d4ed8,color:#fff,stroke-width:2px
    classDef backend fill:#10b981,stroke:#059669,color:#fff,stroke-width:2px
    classDef database fill:#8b5cf6,stroke:#7c3aed,color:#fff,stroke-width:2px
    classDef external fill:#f59e0b,stroke:#d97706,color:#fff,stroke-width:2px
    classDef cicd fill:#ef4444,stroke:#dc2626,color:#fff,stroke-width:2px

    class SSR,ReduxStore,StripeJS,AxiosClient frontend
    class API,AuthMod,UserMod,ProdMod,CatMod,CartMod,OrdMod,PayMod,JwtGuard,RolesGuard,Throttle,PrismaClient backend
    class Postgres database
    class StripeAPI,AWS_ECR,AWS_EC2,CloudWatch external
    class GHActions,DockerBuild cicd
```

---

## 🔄 Application Workflow

```mermaid
sequenceDiagram
    participant 👤 User
    participant ⚛️ Frontend as Next.js Frontend
    participant 🔧 Backend as NestJS API
    participant 🗄️ DB as PostgreSQL
    participant 💳 Stripe as Stripe API

    Note over 👤 User,💳 Stripe: 🔐 Authentication Flow
    👤 User->>⚛️ Frontend: Register / Login
    ⚛️ Frontend->>🔧 Backend: POST /api/v1/auth/login
    🔧 Backend->>🗄️ DB: Validate credentials
    🗄️ DB-->>🔧 Backend: User record
    🔧 Backend-->>⚛️ Frontend: JWT Access Token + Refresh Token
    ⚛️ Frontend->>⚛️ Frontend: Store in Redux Persist

    Note over 👤 User,💳 Stripe: 🛍️ Shopping Flow
    👤 User->>⚛️ Frontend: Browse products
    ⚛️ Frontend->>🔧 Backend: GET /api/v1/products
    🔧 Backend->>🗄️ DB: Query products (with filters)
    🗄️ DB-->>🔧 Backend: Product list
    🔧 Backend-->>⚛️ Frontend: Paginated products
    👤 User->>⚛️ Frontend: Add to cart
    ⚛️ Frontend->>🔧 Backend: POST /api/v1/cart/items
    🔧 Backend->>🗄️ DB: Upsert cart item
    🗄️ DB-->>🔧 Backend: Updated cart
    🔧 Backend-->>⚛️ Frontend: Cart updated

    Note over 👤 User,💳 Stripe: 💳 Checkout & Payment Flow
    👤 User->>⚛️ Frontend: Proceed to Checkout
    ⚛️ Frontend->>🔧 Backend: POST /api/v1/orders
    🔧 Backend->>🗄️ DB: Create order (transaction: decrement stock)
    🗄️ DB-->>🔧 Backend: Order created
    🔧 Backend->>💳 Stripe: Create PaymentIntent
    Stripe-->>🔧 Backend: Client Secret
    🔧 Backend-->>⚛️ Frontend: Order + Client Secret
    ⚛️ Frontend->>💳 Stripe: Confirm Payment (Stripe Elements)
    Stripe-->>⚛️ Frontend: Payment result
    ⚛️ Frontend->>🔧 Backend: POST /api/v1/payments/confirm
    🔧 Backend->>💳 Stripe: Verify payment
    Stripe-->>🔧 Backend: Payment confirmed
    🔧 Backend->>🗄️ DB: Update payment + order status
    🗄️ DB-->>🔧 Backend: Updated
    🔧 Backend-->>⚛️ Frontend: Payment successful ✅
```

---

## 🚀 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 (App Router) | SSR/SSG React storefront |
| **State** | Redux Toolkit + Persist | Client-side state management |
| **Payments** | Stripe.js + React Stripe | Secure payment processing |
| **Backend** | NestJS 11 | Modular REST API framework |
| **ORM** | Prisma 7 | Type-safe database access |
| **Database** | PostgreSQL 15 | Relational data storage |
| **Auth** | Passport.js + JWT | Token-based authentication |
| **Validation** | class-validator | Request DTO validation |
| **Docs** | Swagger (OpenAPI) | API documentation |
| **Container** | Docker + Compose | Multi-service orchestration |
| **CI/CD** | GitHub Actions | Automated build & deploy |
| **Cloud** | AWS ECR + EC2 | Container registry & compute |
| **Monitoring** | AWS CloudWatch | Centralized logging |

---

## 📁 Project Structure

```
e-commerce/
├── .github/workflows/
│   └── api-ci-cd.yml              # CI/CD pipeline
├── backend/
│   ├── Dockerfile                  # Multi-stage production build
│   ├── prisma/
│   │   └── schema.prisma          # Database schema (8 models)
│   └── src/
│       ├── common/                 # Guards, decorators, interfaces
│       ├── modules/
│       │   ├── auth/              # Register, login, refresh, logout
│       │   ├── users/             # Profile management & admin
│       │   ├── products/          # CRUD with search & filtering
│       │   ├── category/          # Product categories
│       │   ├── cart/              # Shopping cart operations
│       │   ├── orders/            # Order lifecycle management
│       │   └── payments/          # Stripe payment integration
│       └── prisma/                # Prisma service module
├── frontend/
│   ├── Dockerfile                  # Multi-stage production build
│   ├── app/                        # Next.js App Router pages
│   ├── components/modules/         # Feature components
│   ├── hooks/                      # Custom React hooks
│   ├── providers/                  # Redux providers
│   ├── services/api/              # Axios API layer
│   └── store/                      # Redux slices & config
├── docker-compose.yml              # 3-service orchestration
├── seed.ts                         # Database seeding script
└── .env.example                    # Environment template
```

---

## 🗄️ Database Schema

```mermaid
erDiagram
    users {
        uuid id PK
        string email UK
        string password
        string firstName
        string lastName
        enum role "USER | ADMIN"
        string refreshToken
        timestamp createdAt
        timestamp updatedAt
    }

    products {
        uuid id PK
        string name
        text description
        decimal price
        int stock
        string sku UK
        string imageUrl
        boolean isActive
        uuid categoryId FK
        timestamp createdAt
        timestamp updatedAt
    }

    categories {
        uuid id PK
        string name
        text description
        string slug UK
        string imageUrl
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }

    carts {
        uuid id PK
        uuid userId FK
        boolean checkedOut
        timestamp createdAt
        timestamp updatedAt
    }

    carts_items {
        uuid id PK
        int quantity
        uuid productId FK
        uuid cartId FK
    }

    orders {
        uuid id PK
        string orderNumber UK
        enum status "PENDING | PROCESSING | SHIPPED | DELIVERED | CANCELLED"
        decimal totalAmount
        uuid userId FK
        uuid cartId FK
        text shippingAddress
        timestamp createdAt
        timestamp updatedAt
    }

    order_items {
        uuid id PK
        int quantity
        decimal price
        uuid productId FK
        uuid orderId FK
    }

    payments {
        uuid id PK
        decimal amount
        enum status "PENDING | COMPLETED | FAILED | REFUNDED"
        string currency
        string paymentMethod
        string transactionId
        uuid userId FK
        uuid orderId FK UK
        timestamp createdAt
        timestamp updatedAt
    }

    users ||--o{ carts : "has"
    users ||--o{ orders : "places"
    users ||--o{ payments : "makes"
    carts ||--o{ carts_items : "contains"
    carts ||--o{ orders : "converts to"
    products ||--o{ carts_items : "added to"
    products ||--o{ order_items : "included in"
    categories ||--o{ products : "groups"
    orders ||--o{ order_items : "contains"
    orders ||--o| payments : "paid by"
```

---

## 🚦 API Endpoints

All endpoints are prefixed with `/api/v1`. Swagger docs available at `/api/docs`.

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/auth/register` | Register new user | Public |
| `POST` | `/auth/login` | Login & receive tokens | Public |
| `POST` | `/auth/refresh` | Refresh access token | Refresh Token |
| `POST` | `/auth/logout` | Invalidate refresh token | JWT |

### Users
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/users/me` | Get current profile | JWT |
| `PATCH` | `/users/me` | Update profile | JWT |
| `PATCH` | `/users/me/password` | Change password | JWT |
| `DELETE` | `/users/me` | Delete account | JWT |
| `GET` | `/users` | List all users | Admin |
| `GET` | `/users/:id` | Get user by ID | Admin |
| `DELETE` | `/users/:id` | Delete user | Admin |

### Products
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/products` | List with filters | Public |
| `GET` | `/products/:id` | Get product | Public |
| `POST` | `/products` | Create product | Admin |
| `PATCH` | `/products/:id` | Update product | Admin |
| `PATCH` | `/products/:id/stock` | Adjust stock | Admin |
| `DELETE` | `/products/:id` | Delete product | Admin |

### Categories
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/categories` | List categories | Public |
| `GET` | `/categories/:id` | Get by ID | Public |
| `GET` | `/categories/slug/:slug` | Get by slug | Public |
| `POST` | `/categories` | Create category | Admin |
| `PATCH` | `/categories/:id` | Update category | Admin |
| `DELETE` | `/categories/:id` | Delete category | Admin |

### Cart
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/cart` | Get user cart | JWT |
| `POST` | `/cart/items` | Add item | JWT |
| `PATCH` | `/cart/items/:id` | Update quantity | JWT |
| `DELETE` | `/cart/items/:id` | Remove item | JWT |
| `DELETE` | `/cart` | Clear cart | JWT |
| `POST` | `/cart/merge` | Merge guest cart | JWT |

### Orders
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/orders` | Create order | JWT |
| `GET` | `/orders` | List own orders | JWT |
| `GET` | `/orders/:id` | Get own order | JWT |
| `PATCH` | `/orders/:id` | Update own order | JWT |
| `DELETE` | `/orders/:id` | Cancel order | JWT |
| `GET` | `/orders/admin/all` | List all orders | Admin |
| `GET` | `/orders/admin/:id` | Get any order | Admin |
| `PATCH` | `/orders/admin/:id` | Update any order | Admin |
| `DELETE` | `/orders/admin/:id` | Cancel any order | Admin |

### Payments
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/payments/create-intent` | Create Stripe intent | JWT |
| `POST` | `/payments/confirm` | Confirm payment | JWT |
| `GET` | `/payments` | List own payments | JWT |
| `GET` | `/payments/:id` | Get payment | JWT |
| `GET` | `/payments/order/:orderId` | Payment for order | JWT |

---

## ⚡ Rate Limiting

| Tier | Limit | Applied To |
|------|-------|-----------|
| Strict | 3 req / 1s | Auth, Payments |
| Moderate | 5 req / 1s | Orders |
| Relaxed | 20 req / 1s | Read endpoints |
| Global | 10 req / 60s | All other routes |

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecommerce

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🏃 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local dev without Docker)
- Bun or npm

### Quick Start (Docker)

```bash
# Clone the repository
git clone https://github.com/your-username/e-commerce.git
cd e-commerce

# Configure environment
cp .env.example .env

# Start all services
docker compose up -d

# Seed the database
docker compose exec backend npx ts-node /app/seed.ts
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:3000/api/v1 |
| Swagger Docs | http://localhost:3000/api/docs |
| PostgreSQL | localhost:5432 |

### Local Development

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev

# Frontend
cd frontend
npm install
npm run dev
```

---

## 🔄 CI/CD Pipeline

```mermaid
flowchart LR
    Push["Git Push<br/>main"] --> Build["Build Docker<br/>Image"]
    Build --> Test["Run Tests<br/>& Lint"]
    Test --> Push_ECR["Push to<br/>AWS ECR"]
    Push_ECR --> Deploy["Deploy to<br/>AWS EC2"]
    Deploy --> Health["Health Check"]
    Health --> Logs["CloudWatch<br/>Logs"]

    style Push fill:#3b82f6,color:#fff
    style Build fill:#8b5cf6,color:#fff
    style Test fill:#f59e0b,color:#000
    style Push_ECR fill:#10b981,color:#fff
    style Deploy fill:#ef4444,color:#fff
    style Health fill:#06b6d4,color:#fff
    style Logs fill:#64748b,color:#fff
```

1. **Push** to `main` triggers GitHub Actions workflow
2. **Build** multi-stage Docker image (backend & frontend)
3. **Test** with Jest unit tests and e2e tests
4. **Push** image to AWS ECR (private registry)
5. **Deploy** to EC2 via SSH with OIDC authentication
6. **Monitor** via AWS CloudWatch centralized logs

---

## 📄 License

MIT License

---

<div align="center">

Built with ❤️ using Next.js, NestJS, Prisma & PostgreSQL

</div>
