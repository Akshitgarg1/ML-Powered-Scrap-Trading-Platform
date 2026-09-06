# ♻️ TradeSmart: Second-Hand & Scrap Trading Platform

TradeSmart is a modern full-stack web application designed for buying, selling, and trading second-hand goods and scrap items. It features a responsive React front-end, a high-performance FastAPI backend, and real-time data persistence powered by Google Firebase.

---

## 🏗️ System Architecture

TradeSmart follows a decoupled client-server architecture with real-time cloud data storage:

```mermaid
graph TD
    %% Client Tier
    subgraph Client Tier (React + Vite + Tailwind)
        A[React UI Pages] --> B[Axios API Clients]
        A --> C[Firebase Web Auth SDK]
        D[Service Worker / PWA Cache] -.-> A
    end

    %% Backend Tier
    subgraph Backend Tier (FastAPI REST API)
        E[FastAPI CORS Middleware] --> F[APIRouters]
        F --> G[JWT auth_required Middleware]
        
        %% Core Services
        G --> H[Product Management API]
        G --> I[Messaging & Direct Chat]
        G --> J[User Ratings & Trust Scores]
        G --> K[Notifications & Watchlist]
        G --> L[Category & Feedback Services]
    end

    %% Storage & Database Tier
    subgraph Storage & Database Tier (Firebase Cloud)
        M[(Firebase Realtime Database)]
        N[(Firebase Auth)]
        
        H <--> M
        I <--> M
        J <--> M
        K <--> M
        L <--> M
        C <--> N
    end

    B --> |HTTP REST & Bearer Tokens| E
```

---

## 📂 Project Directory Structure

```
ml-scraptrade/
├── client/                      # React 18 + Vite + Tailwind CSS Frontend
│   ├── public/                  # Static assets, PWA manifest, service worker
│   ├── src/
│   │   ├── components/          # Reusable UI components (common, feedback, listings)
│   │   ├── config/              # Firebase client SDK initialization
│   │   ├── context/             # AuthContext and ThemeContext providers
│   │   ├── pages/               # Application views (Home, Browse, Sell, Messages, etc.)
│   │   ├── services/            # Axios API service layers
│   │   ├── styles/              # Global styling and Tailwind directives
│   │   └── utils/               # Client helpers and constants
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                      # FastAPI Python Backend
│   ├── routes/                  # API routers (auth, product, messaging, notifications, etc.)
│   │   ├── auth_routes.py
│   │   ├── category_routes.py
│   │   ├── feedback_routes.py
│   │   ├── messaging_routes.py
│   │   ├── notifications_routes.py
│   │   ├── product_routes.py
│   │   ├── user_ratings_routes.py
│   │   └── watchlist_routes.py
│   ├── utils/                   # Firebase DB interface and auth helpers
│   │   ├── auth_helper.py
│   │   └── firebase_db.py
│   ├── app.py                   # FastAPI application initialization & middleware
│   ├── requirements.txt         # Server Python dependencies
│   ├── serviceAccountKey.json   # Firebase Admin SDK service account key
│   └── .env                     # Server environment variables
│
├── start_all.bat                # One-click launcher for backend and frontend
├── start_backend.bat            # Launches FastAPI server on port 5050
├── start_frontend.bat           # Launches Vite dev server on port 5173
├── requirements.txt             # Root requirements pointing to server/requirements.txt
└── README.md
```

---

## 🛠️ Technology Stack

### Frontend (`client/`)
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS (custom dark/light theme, modern cards, and responsive grids)
- **Routing**: React Router DOM v6
- **State & Context**: React Context API (`AuthContext`, `ThemeContext`)
- **HTTP Client**: Axios
- **Authentication**: Firebase Client SDK

### Backend (`server/`)
- **Framework**: FastAPI (high-performance async ASGI API)
- **Server**: Uvicorn
- **Authentication**: PyJWT (HS256 JWT tokens) & Bcrypt (password hashing)
- **Database**: Firebase Admin SDK (Realtime Database)
- **Image Uploads**: Cloudinary integration & local uploads

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- **Node.js**: v18 or newer
- **Python**: 3.10+
- **Firebase Account**: Project with Realtime Database and Authentication enabled.

### 2. Quick Start (Windows)
Double-click `start_all.bat` or run:
```bat
start_all.bat
```
This automatically launches both the backend server on `http://localhost:5050` and the frontend on `http://localhost:5173`.

### 3. Manual Startup

#### Backend:
```bash
cd server
pip install -r requirements.txt
python -m uvicorn app:app --host 127.0.0.1 --port 5050 --reload
```

#### Frontend:
```bash
cd client
npm install
npm run dev
```

---

## 🔒 Security & Best Practices
- **Strict Role-Based Authorization**: Protected endpoints verify JWT credentials before allowing mutations to listings, profiles, and messages.
- **Environment Isolation**: Sensitive credentials (`serviceAccountKey.json`, `.env`) are excluded from version control via `.gitignore`.
- **Clean Architecture**: Decoupled routes, modular services, and standardized JSON responses ensure maintainability.
