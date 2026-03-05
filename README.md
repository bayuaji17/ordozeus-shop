# OrdoZeus Shop

Premium fashion & lifestyle e-commerce platform built with **Next.js 16**, **Drizzle ORM**, and **Supabase Postgres**.

🌐 **Live**: [ordozeus-shop.bandev.my.id](https://ordozeus-shop.bandev.my.id)

## Tech Stack

| Layer     | Technology                          |
| --------- | ----------------------------------- |
| Framework | Next.js 16 (App Router)             |
| Language  | TypeScript                          |
| Database  | PostgreSQL (Supabase) + Drizzle ORM |
| Auth      | better-auth                         |
| Payments  | Xendit                              |
| Storage   | Cloudflare R2                       |
| Styling   | Tailwind CSS 4 + shadcn/ui          |
| Charts    | Recharts                            |
| State     | Zustand (cart)                      |
| Runtime   | Bun                                 |

## Features

### Storefront

- Hero carousel & featured products
- Category browsing with nested tree structure
- Product detail with size selection
- Cart (Zustand + localStorage)
- Checkout with Xendit payment gateway
- **Track Order** — search by Order ID, view status timeline & shipping info
- Custom 404 page
- SEO optimized (Open Graph, Twitter cards, meta tags)

### Admin Dashboard

- Revenue & orders charts
- Order management with status timeline (Paid → Processing → Shipped → Delivered → Completed)
- Ship order with tracking number & courier
- Product CRUD with image uploads (S3)
- Category tree management
- Inventory tracking with movement history
- Size & size type management
- Courier & shipping rate configuration
- Shop location settings
- Carousel / banner management

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 20+
- PostgreSQL database (e.g., Supabase)
- Xendit account (payment gateway)
- S3-compatible storage (product images)

### Setup

```bash
# Install dependencies
bun install

# Copy environment variables
cp .env.sample .env.local
# Fill in your credentials in .env.local

# Push database schema
bun run db:push

# Seed data (optional)
bun run db:seed
bun run db:seed-sizes
bun run db:seed-products
bun run db:seed-shipping-rates
```

### Development

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the storefront.  
Admin panel is at [http://localhost:3000/admin](http://localhost:3000/admin).

### Build

```bash
bun run build
bun start
```

## Project Structure

```
app/
├── (auth)/          # Sign in / Sign up
├── (home)/          # Homepage (hero, featured, collections)
├── (shop)/          # Cart, checkout, products, track-order
├── admin/           # Admin dashboard & management pages
├── api/             # API routes (checkout, webhooks, uploads)
├── layout.tsx       # Root layout with SEO metadata
└── not-found.tsx    # Custom 404 page

components/
├── admin/           # Admin-specific components
├── public/          # Header, footer, hero carousel
├── shared/          # Shared components (order status badge/timeline)
├── shop/            # Cart, checkout components
└── ui/              # shadcn/ui primitives

lib/
├── actions/         # Server actions (orders, products, etc.)
├── auth/            # Auth configuration
├── db/              # Drizzle schema, seed scripts
├── stores/          # Zustand stores
└── types/           # Shared TypeScript interfaces
```

## Database Commands

| Command                          | Description              |
| -------------------------------- | ------------------------ |
| `bun run db:generate`            | Generate migration files |
| `bun run db:migrate`             | Run migrations           |
| `bun run db:push`                | Push schema directly     |
| `bun run db:studio`              | Open Drizzle Studio      |
| `bun run db:seed`                | Seed initial data        |
| `bun run db:seed-sizes`          | Seed size types & sizes  |
| `bun run db:seed-products`       | Seed sample products     |
| `bun run db:seed-shipping-rates` | Seed shipping rates      |
