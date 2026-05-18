# BookCart — AI-Powered Online Bookstore Platform

> A production-grade e-commerce platform for discovering, purchasing, and tracking books — enhanced with AI-powered recommendations and semantic search.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Folder Structure](#folder-structure)
- [Deployment](#deployment)

---

## Overview

BookCart is a full-stack e-commerce platform built with scalability and developer experience in mind. The backend follows a layered architecture (routes → controllers → services → repositories) and the frontend is a modular React + Vite SPA. AI features are built on a proper abstraction layer — swappable between local mocks, OpenAI, and vector search backends.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Client (React/Vite)                 │
│   React Query · Zustand · React Hook Form · Framer Motion│
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP / WebSocket
┌──────────────────────────▼──────────────────────────────┐
│                  API Gateway (Express 5)                  │
│         Auth · Rate Limiting · Helmet · CORS             │
└──────┬────────────────────────────────────────┬─────────┘
       │                                        │
┌──────▼──────┐                        ┌────────▼────────┐
│  REST API   │                        │   Socket.IO     │
│  /api/v1    │                        │  (Notifications)│
└──────┬──────┘                        └─────────────────┘
       │
┌──────▼─────────────────────────────────────────────────┐
│              Service Layer                              │
│   Auth · Books · Orders · Reviews · AI · Payments      │
└──────┬─────────────────────────┬───────────────────────┘
       │                         │
┌──────▼──────┐         ┌────────▼────────┐
│  MongoDB    │         │     Redis        │
│  (Primary)  │         │  (Cache/Queue)   │
└─────────────┘         └─────────────────┘
```

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 20 LTS |
| Framework | Express 5 |
| Language | TypeScript 5 |
| Database | MongoDB + Mongoose |
| Cache/Queue | Redis + BullMQ |
| Auth | JWT (RS256) + Refresh Tokens |
| Real-time | Socket.IO |
| Validation | Zod |
| Logging | Winston + Morgan |
| Testing | Vitest + Supertest |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build | Vite |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v3 |
| State | Zustand |
| Server State | TanStack React Query v5 |
| Forms | React Hook Form + Zod |
| Animation | Framer Motion |
| HTTP | Axios |

---

## Features

### Customer
- Browse & search books (text + semantic)
- AI-powered personalized recommendations
- Natural language search ("books like Dune but shorter")
- Cart, checkout, and order tracking
- Review & rate books
- Wishlist management
- AI chat assistant for book discovery
- Address book management

### Admin
- User & seller management
- Book approval workflow
- Inventory control
- Sales analytics & revenue charts
- Review moderation
- Coupon management
- Audit logs

### Seller
- Book listing management (CRUD + image upload)
- Inventory tracking
- Order fulfillment
- Analytics dashboard
- Discount management

### AI Layer
- Semantic search via embeddings
- Recommendation engine (collaborative + content-based hybrid)
- LLM-powered chat assistant
- "Readers also liked" (item-item similarity)
- Personalized homepage feed

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB 6+
- Redis 7+
- pnpm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/PUNITH1802/Book-Store-with-AI-recomendation.git
cd Book-Store-with-AI-recomendation

# Install dependencies
pnpm install

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Run database migrations / seed
pnpm --filter backend run db:seed

# Start development servers
pnpm dev
```

### With Docker

```bash
docker-compose up --build
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Server
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1

# Database
MONGODB_URI=mongodb://localhost:27017/bookcart

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=<generate-256bit-secret>
JWT_REFRESH_SECRET=<generate-256bit-secret>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<sendgrid-api-key>
EMAIL_FROM=noreply@bookcart.io

# Cloudinary
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>

# AI / OpenAI
OPENAI_API_KEY=<openai-api-key>
AI_PROVIDER=openai  # openai | mock

# Stripe
STRIPE_SECRET_KEY=<stripe-secret>
STRIPE_WEBHOOK_SECRET=<webhook-secret>

# OAuth
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=<google-client-id>
```

---

## API Documentation

Interactive Swagger UI is available at `http://localhost:5000/api/docs` when running in development.

### Core Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Rotate refresh token |
| GET | `/books` | List books (paginated, filterable) |
| GET | `/books/:id` | Book detail |
| GET | `/books/search` | Full-text + semantic search |
| POST | `/cart/items` | Add to cart |
| POST | `/orders` | Place order |
| GET | `/orders/:id` | Order detail + tracking |
| GET | `/ai/recommendations` | Personalized recommendations |
| POST | `/ai/chat` | AI chat assistant |

---

## Folder Structure

```
bookcart/
├── backend/
│   ├── src/
│   │   ├── config/          # App, DB, Redis config
│   │   ├── constants/       # App-wide constants
│   │   ├── controllers/     # Route handlers (thin)
│   │   ├── events/          # Domain event emitters/handlers
│   │   ├── interfaces/      # TypeScript interfaces
│   │   ├── jobs/            # BullMQ job processors
│   │   ├── middlewares/     # Express middlewares
│   │   ├── modules/         # Feature modules (self-contained)
│   │   │   ├── auth/
│   │   │   ├── books/
│   │   │   ├── cart/
│   │   │   ├── orders/
│   │   │   ├── reviews/
│   │   │   ├── users/
│   │   │   └── ai/
│   │   ├── queues/          # Queue definitions
│   │   ├── repositories/    # Data access layer
│   │   ├── routes/          # Express routers
│   │   ├── services/        # Business logic
│   │   ├── types/           # Shared TS types
│   │   ├── utils/           # Helpers
│   │   └── validators/      # Zod schemas
│   ├── tests/
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Route-level components
│   │   ├── services/        # API client layer
│   │   ├── store/           # Zustand stores
│   │   ├── types/           # Shared TS types
│   │   └── utils/           # Helpers
│   ├── public/
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## Deployment

### Production Build

```bash
# Build both apps
pnpm build

# The backend outputs to backend/dist
# The frontend outputs to frontend/dist (serve with nginx or CDN)
```

### Docker Compose (Production)

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### CI/CD

GitHub Actions workflows handle:
- Lint + typecheck on every PR
- Unit + integration tests
- Docker image build & push to GHCR
- Deploy to your target environment

---

## License

MIT — see [LICENSE](LICENSE) for details.
