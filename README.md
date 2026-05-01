# TaskFlow — Backend Developer Internship Assignment

A full-stack task management system built with **Node.js**, **Express**, **MongoDB**, and **React**.

---

## Project Structure

```
taskflow/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── swagger.js         # API documentation setup
│   ├── controllers/
│   │   ├── authController.js  # Register, Login, GetMe
│   │   ├── taskController.js  # Full CRUD + Stats + Admin
│   │   └── userController.js  # Admin user management
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT protect + role authorize
│   │   ├── errorMiddleware.js     # Global error handler
│   │   └── validationMiddleware.js
│   ├── models/
│   │   ├── User.js            # User schema with bcrypt
│   │   └── Task.js            # Task schema with indexes
│   ├── routes/v1/
│   │   ├── authRoutes.js      # /api/v1/auth/*
│   │   ├── taskRoutes.js      # /api/v1/tasks/*
│   │   └── userRoutes.js      # /api/v1/users/*
│   ├── utils/
│   │   ├── apiResponse.js     # sendSuccess / sendError helpers
│   │   ├── jwt.js             # generateToken / verifyToken
│   │   └── logger.js          # Winston logger
│   ├── .env.example
│   ├── package.json
│   └── server.js              # Express entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── AuthContext.jsx  # Auth state + context
        │   ├── Layout.jsx       # Sidebar + protected layout
        │   └── Loader.jsx       # Spinner component
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx    # Stats + Recent tasks
        │   ├── Tasks.jsx        # Full CRUD with filters
        │   └── AdminPanel.jsx   # User management (admin only)
        ├── services/
        │   └── api.js           # Axios + all API calls
        ├── styles/
        │   └── global.css
        ├── App.jsx              # Router + protected routes
        └── index.js
```

---

## Setup Instructions

### 1. Clone or paste the project files

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_super_secret_key_at_least_32_characters_long
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### 3. Install Dependencies

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 4. Run the Application

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev   # with nodemon (auto-reload)
# OR
npm start     # without nodemon
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```

### 5. Access the App

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| API Health | http://localhost:5000/api/health |
| Swagger Docs | http://localhost:5000/api/docs |

---

## API Endpoints

### Auth (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login + get JWT |
| GET | `/me` | Private | Get current user |

### Tasks (`/api/v1/tasks`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Private | Get tasks (filter, paginate) |
| POST | `/` | Private | Create task |
| GET | `/stats` | Private | Get task statistics |
| GET | `/:id` | Private | Get single task |
| PUT | `/:id` | Private | Update task |
| DELETE | `/:id` | Private | Delete task |
| GET | `/admin/all` | Admin | Get ALL tasks |

### Users (`/api/v1/users`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| PATCH | `/profile` | Private | Update own profile |
| GET | `/` | Admin | Get all users |
| GET | `/:id` | Admin | Get user by ID |
| PATCH | `/:id/role` | Admin | Promote/demote user |
| PATCH | `/:id/deactivate` | Admin | Deactivate user |

---

## Features Implemented

### Backend (Primary)
- ✅ JWT Authentication with bcrypt password hashing
- ✅ Role-based access control (user / admin)
- ✅ Full CRUD for Tasks entity
- ✅ API versioning (`/api/v1/`)
- ✅ Comprehensive error handling (validation, auth, DB, global)
- ✅ Input validation with `express-validator`
- ✅ NoSQL injection protection (`express-mongo-sanitize`)
- ✅ Rate limiting (`express-rate-limit`)
- ✅ Security headers (`helmet`)
- ✅ API documentation (Swagger UI at `/api/docs`)
- ✅ MongoDB with Mongoose (indexes, virtuals, aggregations)
- ✅ Winston logging
- ✅ Pagination, filtering, sorting, search

### Frontend
- ✅ React with React Router (protected routes, role-based)
- ✅ Clean, professional dark UI (custom design system)
- ✅ Login & Register with validation
- ✅ Dashboard with live stats & charts
- ✅ Task manager with filter/search/pagination
- ✅ Admin panel with user role management
- ✅ Toast notifications
- ✅ Loading skeletons & animations
- ✅ Fully responsive

### Security & Scalability
- ✅ Helmet (HTTP headers)
- ✅ Rate limiting
- ✅ MongoDB sanitization (NoSQL injection prevention)
- ✅ JWT expiry handling
- ✅ Scalable folder structure (controllers / routes / models split)
- ✅ Environment-based configuration

---

## Making a User Admin

Register normally, then update the role directly in MongoDB:
```js
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```

Or use MongoDB Compass / Atlas to update the role field.

---

## Scalability Note

For production scaling, this architecture supports:
- **Horizontal scaling**: Stateless JWT auth works across multiple instances
- **Caching**: Redis can be added for session/query caching
- **Microservices**: Auth, Tasks, and Users are logically separated
- **Load balancing**: Nginx can distribute across instances
- **Docker**: Add `Dockerfile` + `docker-compose.yml` for containerization
