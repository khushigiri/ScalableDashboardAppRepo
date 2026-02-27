# Scalable Web App with Authentication & Dashboard

A full-stack scalable web application built using **React, Node.js, Express, and MongoDB**.
The application implements secure JWT-based authentication and a protected dashboard with full CRUD task management functionality.

---

## Project Overview

This project demonstrates:

* Secure JWT authentication
* Password hashing using bcrypt
* Protected frontend routes
* RESTful API architecture
* MongoDB integration with Mongoose
* Task CRUD operations
* Search, filtering, and priority management
* Modular and scalable project structure
* Separation of concerns (controllers, services, middleware)

---

## Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Axios
* React Router DOM
* Context API (Authentication state management)

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose ODM)
* JWT (JSON Web Tokens)
* bcrypt (Password hashing)
* dotenv (Environment configuration)

---

## Authentication Flow

1. User registers with name, email, and password.
2. Password is hashed using bcrypt before storing in MongoDB.
3. On successful login, a JWT token is generated.
4. Token is stored in frontend state.
5. Protected routes validate token using backend middleware.
6. Authenticated users can access dashboard routes.

---

## 📊 Dashboard Features

* View logged-in user
* Create tasks
* Update tasks
* Delete tasks
* Search tasks
* Filter by priority
* Overdue task detection
* Logout functionality
* Light/Dark mode toggle
* Task Reminder

---

## Project Structure


backend/
  ├── config/
  ├── controllers/
  ├── middleware/
  ├── models/
  ├── routes/
  ├── server.js

frontend/
  ├── components/
  ├── context/
  ├── pages/
  ├── routes/
  ├── services/
  ├── App.js


---


## Running the Application Locally

### Backend

cd backend
npm install
npm run dev

### Frontend

cd frontend
npm install
npm start


Backend runs on:
http://localhost:5000

Frontend runs on:
http://localhost:3000

---

## API Documentation

Postman collection and environment file are included in the repository.

### How to Test APIs:

1. Import the Postman collection.
2. Import the environment file.
3. Run Register.
4. Run Login (JWT token auto-saves).
5. Test Task CRUD routes.

---

## Security Practices Implemented

* Password hashing using bcrypt
* JWT authentication with expiration
* Protected routes middleware
* Environment variables for sensitive data
* Proper HTTP status codes
* Token validation on each protected request

---

## Future Improvements

* Pagination for task listing
* Email verification
* Refresh tokens
* Unit & integration tests
* Centralized error handling middleware
* Logging using Winston or Morgan

## Server Logs

Server request logs are stored inside:
backend/logs/server.log

Logs demonstrate successful API execution and middleware handling.