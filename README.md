# Monorepo

A production-ready TypeScript monorepo with Next.js frontend and Fastify backend.

## Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | Next.js 14 (App Router), Tailwind |
| Backend   | Node.js, Fastify, Zod             |
| Language  | TypeScript (strict)               |
| Tooling   | npm workspaces, ESLint, Prettier  |

## Structure

```
/
├── apps/
│   ├── frontend/          # Next.js app  → http://localhost:3000
│   └── backend/           # Fastify API  → http://localhost:3001
├── .cursor/
│   └── rules.md           # AI coding conventions
├── .env.example
└── package.json
```

## Getting started

### Prerequisites

- Node.js >= 20

### Install

```bash
npm install
```

### Environment variables

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env

# Frontend
cp apps/frontend/.env.example apps/frontend/.env.local
```

### Development

```bash
# Run both apps in parallel
npm run dev

# Or run individually (in separate terminals)
npm run dev --workspace=apps/backend
npm run dev --workspace=apps/frontend
```

### Build

```bash
npm run build
```

### Lint & format

```bash
npm run lint
npm run format
```

## Apps

### Backend — `http://localhost:3001`

| Route     | Method | Description  |
|-----------|--------|--------------|
| `/health` | GET    | Health check |

### Frontend — `http://localhost:3000`

Home page that displays the configured API URL from `NEXT_PUBLIC_API_URL`.
