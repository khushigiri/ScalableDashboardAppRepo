
# Scalable Web App with Authentication & Dashboard

A full-stack scalable web application built with React, Node.js, Express, and MongoDB.  
The application includes secure JWT authentication, a protected dashboard, and full CRUD functionality for task management.

---

## Project Overview

This project demonstrates:

- Secure user authentication using JWT
- Password hashing with bcrypt
- Protected frontend routes
- RESTful API architecture
- MongoDB integration
- Dashboard with task CRUD functionality
- Search and filtering capabilities
- Scalable project structure

---

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Axios
- React Router

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT (Authentication)
- bcrypt (Password hashing)
- dotenv

---

## Authentication Flow

1. User registers with name, email, and password.
2. Password is hashed using bcrypt before storing in MongoDB.
3. Upon login, a JWT token is generated.
4. Token is stored on the frontend.
5. Protected routes verify JWT using middleware.
6. Authenticated users access the dashboard.

---

## Dashboard Features

- View logged-in user profile
- Create tasks
- Update tasks
- Delete tasks
- Search tasks
- Filter by status (Pending / Completed)
- Logout functionality

---

## API Endpoints

### Authentication

| Method | Endpoint              | Description            |
|--------|-----------------------|------------------------|
| POST   | /api/auth/register    | Register new user      |
| POST   | /api/auth/login       | Login user             |
| GET    | /api/auth/profile     | Get logged-in profile  |

### 🔹 Tasks

| Method | Endpoint              | Description            |
|--------|-----------------------|------------------------|
| POST   | /api/tasks            | Create task            |
| GET    | /api/tasks            | Get all user tasks     |
| PUT    | /api/tasks/:id        | Update task            |
| DELETE | /api/tasks/:id        | Delete task            |

---