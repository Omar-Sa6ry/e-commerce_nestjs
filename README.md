# 🛒 E-Commerce Backend (Built with NestJS + GraphQL + Design Patterns)

This project is a **robust and modular e-commerce backend API** built using **NestJS**, **GraphQL**, **PostgreSQL**, and **TypeORM**, implementing **clean architecture**, **design patterns**, and **performance best practices**.

It supports:

- 🧺 Product & Inventory Management  
- 💳 Payments via Stripe  
- 📦 Order Lifecycle Management  
- 🎟️ Coupons & Discounts  
- 📨 Emails & 🔔 Push Notifications  
- 🔐 Authentication & Role-based Authorization  
- 🌍 Multi-language Support  
- ⚙️ Scalable Background Jobs  
- 🚀 Real-time Updates via Subscriptions

> 🔗 **ERD Diagram:** [View on dbdiagram.io](https://dbdiagram.io/d/e-commerce-67671589fc29fb2b3b0eca7a)

---

## 🚀 Tech Stack

| Tool/Library     | Description |
|------------------|-------------|
| **NestJS**       | Scalable, modular backend framework |
| **GraphQL (Apollo)** | API layer with queries, mutations, subscriptions |
| **PostgreSQL**   | Relational database |
| **TypeORM**      | ORM with rich relation support |
| **Redis**        | Caching, rate-limiting, session storage |
| **BullMQ**       | Background processing for async jobs |
| **DataLoader**   | Solving N+1 GraphQL queries |
| **Cloudinary**   | Image upload & delivery |
| **Stripe**       | Payment gateway with secure webhooks |
| **Nodemailer**   | Email service |
| **Firebase (FCM)** | Push notifications |
| **i18n**         | Internationalization |
| **Passport.js**  | Google OAuth integration |
| **JWT**          | Authentication & refresh tokens |
| **GraphQL Subscriptions** | Realtime updates via WebSockets |
| **Validation Pipes** | Strong input validation using class-validator |
| **ACID Transactions** | Full transaction control on critical flows |
| **Custom Regex Filters** | SQL Injection protection |
| **Role-based Guards** | Fine-grained authorization with decorators |
| **SOLID Principles** | All services follow clean architecture standards |
| **Design Pattern** |to ensure scalability, reusability, and maintainability |

---

## 📚 What I Learned

✅ First-time implementation of:

- Applying **multiple design patterns** across real-world backend modules  
- Using **Redis caching** and **DataLoader** to optimize performance  
- Implementing **BullMQ queues** for background jobs (emails, Stripe, notifications)  
- Building secure **payment flows with Stripe + Webhook verification**  
- Enhancing GraphQL with `@ResolveField` and modular resolvers  
- Role & permission system using **custom guards and decorators**  
- Writing **ACID-compliant** services with proper rollback on failure  
- Managing state transitions (order status, payment status)  
- Using **i18n with GraphQL** to support multi-language platforms  
- Enforcing strict input validation and custom SQL injection protection  
- Integrating **Google OAuth** with Passport.js  

---

## ✅ Installation

```bash
# Clone the project
git clone https://github.com/Omar-Sa6ry/e-commerce_nestjs
cd e-commerce_nestjs

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Then configure DB, Redis, Stripe, etc. in .env

# Run the app
npm run start:dev
