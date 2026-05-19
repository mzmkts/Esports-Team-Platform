# CYBER_NET — Esports Team Platform

A modern full-stack esports platform designed for discovering teams, finding players, and tracking major gaming events.
The project is split into a decoupled architecture featuring an independent Frontend (Next.js) and Backend (
Node.js/Express).

---
Features

Authentication

- User registration and login
- JWT-based authentication
- Password hashing (bcrypt)
- Protected routes

Teams System

- Create teams
- Join / leave teams
- Team ownership system

Posts System

- Create posts
- Like / unlike posts
- View all posts feed
- User-based content

User System

- User profiles
- Update profile (avatar, bio, favorite games)
- Public user profiles

Real-time (WebSocket)

- Live chat system for teams
- Online users tracking
- Real-time message updates

---

## Live Links

* **Frontend (UI):** [https://esports-team-platform-mu.vercel.app](https://esports-team-platform-mu.vercel.app)
* **Backend (API):** [https://fullstackrenderdashboard.onrender.com](https://fullstackrenderdashboard.onrender.com)

---

## Tech Stack

### Frontend

* **Next.js 16 (Turbopack)** — A powerful React-based framework leveraging Server-Side Rendering (SSR) and static page
  generation.
* **CSS Modules** — Scoped and isolated component-level styling.
* **React Suspense** — Optimizes dynamic page loading and ensures error-free pre-rendering for client-side query
  parameters.

### Backend

* **Node.js & Express** — Fast, unopinionated, and minimalist REST API server.
* **MongoDB & Mongoose** — NoSQL database utilized for managing users, esports teams, and community posts.
* **CORS Middleware** — Properly configured cross-origin resource sharing policies for seamless secure communication
  between frontend and backend.

---

## Environment Variables

To run this project locally, you must create `.env` files in their respective directories.

### Backend (`/backend/.env`)

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
UPLOADTHING_SECRET=your_uploadthing_secret_key
UPLOADTHING_APP_ID=your_uploadthing_app_id
UPLOADTHING_TOKEN=your_uploadthing_token
```

### Frontend (`/frontend/.env`)

```env
NEXT_PUBLIC_API_URL=your_render_connection_string
NEXT_PUBLIC_WS_URL=your_wss_connection_string
```

---

# Local Installation & Setup

Clone the repository to your machine:


```
git clone [https://github.com/mzmkts/Esports-Team-Platform.git](https://github.com/mzmkts/Esports-Team-Platform.git)
cd Esports-Team-Platform
```

# 1. Backend Setup

Navigate to the backend directory:

```
cd backend
```

Install dependencies:

```
npm install
```

Create a .env file and populate it with your environment variables.

Start the server:

```
npm start
```

The server will run on port 5000 (http://localhost:5000).

---

# 2. Frontend Setup

Open a new terminal window in the project root and navigate to the frontend directory:

```
cd frontend
```

Install dependencies:

```
npm install
```

Create a .env.local file and specify the backend API URL.

Start the development server:

```
npm run dev
```

The client interface will be available at http://localhost:3000.