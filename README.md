# 🎓 CampusCare — Smart Campus Facility Management System

CampusCare is a full-stack web application that streamlines the process of raising, tracking, and resolving campus facility complaints. It provides role-based dashboards for **Students**, **Faculty**, and **Administrators**, enabling transparent and efficient management of campus infrastructure issues.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Available Scripts](#-available-scripts)
- [API Overview](#-api-overview)
- [User Roles](#-user-roles)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 👨‍🎓 Student

- Register/login securely
- Raise facility complaints with category, location, and priority
- Track complaint status in real-time
- Receive in-app notifications on updates
- View complaint history and add comments

### 👩‍🏫 Faculty

- View and manage complaints from assigned departments
- Update complaint status and add resolution notes
- Dashboard with complaint analytics

### 🛠️ Admin

- Full user management (create, update, deactivate)
- Bulk user import via CSV
- Manage departments, facilities, and complaint categories
- Assign complaints to faculty/staff
- View audit logs for all system actions
- Analytics dashboard with charts and statistics

---

## 🧰 Tech Stack

### Backend

| Technology                 | Purpose                           |
| -------------------------- | --------------------------------- |
| **Node.js** + **Express**  | REST API server                   |
| **MongoDB** + **Mongoose** | Database & ODM                    |
| **JWT** + **bcryptjs**     | Authentication & password hashing |
| **Multer**                 | File/CSV uploads                  |
| **Helmet**                 | HTTP security headers             |
| **express-rate-limit**     | API rate limiting                 |
| **Zod**                    | Request validation                |
| **Nodemon**                | Development hot-reload            |
| **Vitest** + **Supertest** | API testing                       |

### Frontend

| Technology              | Purpose                   |
| ----------------------- | ------------------------- |
| **React 18** + **Vite** | UI framework & build tool |
| **React Router v6**     | Client-side routing       |
| **TailwindCSS**         | Utility-first styling     |
| **Axios**               | HTTP client               |
| **Recharts**            | Data visualization        |
| **Lucide React**        | Icon library              |

---

## 📁 Project Structure

```
campuscare/
├── .env                        # Root environment variables
├── README.md
├── backend/
│   ├── config/                 # DB connection & app config
│   ├── controllers/            # Route handler logic
│   │   ├── authController.js
│   │   ├── complaintController.js
│   │   └── adminController.js
│   ├── middleware/             # Auth, error handling middleware
│   │   └── auth.js
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js
│   │   ├── Complaint.js
│   │   ├── Department.js
│   │   ├── Facility.js
│   │   ├── Notification.js
│   │   ├── AuditLog.js
│   │   └── ...
│   ├── routes/                 # Express route definitions
│   │   ├── authRoutes.js
│   │   ├── complaintRoutes.js
│   │   ├── adminRoutes.js
│   │   └── ...
│   ├── scripts/                # Seed scripts
│   ├── tests/                  # API tests
│   ├── uploads/                # Uploaded files (gitignored)
│   ├── utils/                  # Helper utilities
│   ├── server.js               # App entry point
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/         # Reusable UI components
    │   ├── context/            # React context (auth, etc.)
    │   ├── layouts/            # Page layout wrappers
    │   ├── pages/              # Route-level page components
    │   │   ├── StudentDashboard.jsx
    │   │   ├── FacultyDashboard.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   ├── RaiseComplaintPage.jsx
    │   │   ├── ComplaintDetailPage.jsx
    │   │   └── ...
    │   ├── services/           # Axios API service modules
    │   ├── App.jsx
    │   └── main.jsx
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or local MongoDB instance)
- npm v9+

---

### Environment Variables

Create a `.env` file in the **`backend/`** directory based on the template below:

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

> ⚠️ **Never commit your `.env` files to version control.**

---

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Seed the database with sample data (optional)
npm run seed

# Start development server (with hot-reload)
npm run dev

# Start production server
npm start
```

The API will be available at `http://localhost:4000`.

---

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## 📜 Available Scripts

### Backend (`/backend`)

| Command        | Description                            |
| -------------- | -------------------------------------- |
| `npm run dev`  | Start server with nodemon (hot-reload) |
| `npm start`    | Start server in production mode        |
| `npm run seed` | Seed database with initial data        |
| `npm test`     | Run API tests with Vitest              |

### Frontend (`/frontend`)

| Command           | Description                      |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start Vite development server    |
| `npm run build`   | Build for production             |
| `npm run preview` | Preview production build locally |

---

## 🔌 API Overview

| Method  | Endpoint                     | Description               | Auth          |
| ------- | ---------------------------- | ------------------------- | ------------- |
| `POST`  | `/api/auth/register`         | Register a new user       | Public        |
| `POST`  | `/api/auth/login`            | Login and receive JWT     | Public        |
| `GET`   | `/api/auth/me`               | Get current user profile  | ✅            |
| `POST`  | `/api/complaints`            | Raise a new complaint     | Student       |
| `GET`   | `/api/complaints`            | List complaints           | ✅            |
| `GET`   | `/api/complaints/:id`        | Get complaint detail      | ✅            |
| `PATCH` | `/api/complaints/:id/status` | Update complaint status   | Faculty/Admin |
| `GET`   | `/api/notifications`         | Get user notifications    | ✅            |
| `GET`   | `/api/admin/users`           | List all users            | Admin         |
| `POST`  | `/api/admin/users/import`    | Bulk import users via CSV | Admin         |
| `GET`   | `/api/admin/audit-logs`      | View system audit logs    | Admin         |

---

## 👥 User Roles

| Role        | Access                                                         |
| ----------- | -------------------------------------------------------------- |
| **Student** | Raise and track own complaints, view notifications             |
| **Faculty** | View and resolve complaints in assigned department             |
| **Admin**   | Full system access — users, departments, analytics, audit logs |

<p align="center">Built with ❤️ for smarter campuses</p>
