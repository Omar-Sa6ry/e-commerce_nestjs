# 🛒 E-Commerce Backend (Built with NestJS + GraphQL)

This project is a fully-featured **e-commerce backend** API built using **NestJS**, **GraphQL**, **PostgreSQL**, and **TypeORM**, following clean architecture principles and performance best practices. It supports product management, order handling, coupon logic, payments, and notifications with robust authentication and role-based access control.

> 🌐 ERD Diagram: [View on dbdiagram.io](https://dbdiagram.io/d/e-commerce-67671589fc29fb2b3b0eca7a)

---

## 🚀 Tech Stack

| Tool/Library     | Description |
|------------------|-------------|
| **NestJS**       | Backend framework (modular, scalable) |
| **GraphQL (Apollo)** | Flexible API for queries/mutations/subscriptions |
| **PostgreSQL**   | Relational database |
| **TypeORM**      | Database ORM with decorators & relations |
| **Redis**        | Used for caching products & sessions |
| **BullMQ + Queue** | Used to handle background jobs like orders, emails, notifications |
| **DataLoader**   | Batching GraphQL N+1 queries |
| **PubSub**       | Realtime GraphQL subscriptions (e.g., product deleted) |
| **Cloudinary**   | Image uploading and hosting |
| **Stripe**       | Payment integration with webhook handling |
| **Nodemailer**   | Sending confirmation emails |
| **Firebase**     | Sending push notifications via FCM |
| **i18n**         | Multi-language support for all user-visible messages |
| **JWT**          | Secure authentication |
| **Passport.js**          | Google OAuth |
| **SQL Injection Protection** | Custom regex input validators |
| **SOLID Principles** | Service structure follows SOLID design |
| **ACID Transactions** | All critical flows (orders, deletion) wrapped in transactions |

---

## 📦 Features

- **User Roles**: `user`, `admin`, `company` (via `UserRole` enum)
- **Full Auth System**: register, login, reset password, protected routes
- **Products Management**:
  - Image uploads (Cloudinary)
  - Multi-size/color support (`productDetails`)
  - GraphQL filtering, pagination
  - Caching via Redis
- **Cart System**: Add, remove, quantity management
- **Orders**:
  - Apply coupons (`fixed`, `percentage`)
  - Checkout with Stripe
  - Confirmation email + notification
  - Payment status tracking
- **Real-time Updates**:
  - Product deletion broadcast via GraphQL subscription
- **Admin Features**:
  - Manage categories, coupons, companies
- **User Address System**:
  - Default address per user
- **Notification System**:
  - Email via Nodemailer
  - Push notifications via Firebase FCM
  - Scheduled alerts via Queues (e.g. order shipped)

---

## 📊 Database Schema

The schema is modular and relational. Some key design choices:

- **Enums** used for `Size`, `UserRole`, `OrderStatus`, `CouponType`, `PaymentStatus`
- **Relations** include:
  - One-to-many between users and products
  - Many-to-one from `productDetails` to `product` and `Color`
  - Many-to-many (via `userAddress`) between users and addresses
  - Orders and their items with pricing per variant

🔗 [ERD Diagram](https://dbdiagram.io/d/e-commerce-67671589fc29fb2b3b0eca7a)

---

## ⚙️ Performance & Architecture

- Implemented **Redis caching** to reduce DB hits for product fetches
- Used **DataLoader** to batch and cache related entity queries in GraphQL resolvers
- Leveraged **PubSub** for real-time UI updates (e.g., `productDeleted`)
- All sensitive operations wrapped in **TypeORM transactions**
- Decoupled slow operations (PDF generation, emails, notifications) using **BullMQ queues**
- Designed with **SOLID principles** to ensure service modularity and testability

---

## 🛡️ Security

- Applied **SQL injection protection** using custom regex validators for user inputs
- Sanitized inputs and enforced data validation across GraphQL DTOs
- Used JWT with refresh token strategies for secure auth
- Used Passport.js with Google OAuth
- Validated Stripe webhook events for secure payment processing

---

## 📚 What I Learned

✅ First-time implementation of:

- SQL Injection protections and real-world test cases  
- Redis-based caching in GraphQL  
- Background job queues (BullMQ) for transactional email and push notifications  
- Realtime GraphQL subscriptions  
- Applying **ACID** transactions on order and deletion logic  
- Advanced **SOLID** principle usage across services  
- Deep understanding of DTO validation, guards, and decorators in NestJS  
- Improved GraphQL resolver structure with `@ResolveField` and DataLoader

---


## ✅ Installation

```bash
# Clone
git clone https://github.com/your-username/e-commerce.git
cd e-commerce

# Install dependencies
npm install

# Create .env and configure PostgreSQL, Redis, Cloudinary, Stripe, Firebase

# Run app
npm run start:dev
