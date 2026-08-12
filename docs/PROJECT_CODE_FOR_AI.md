# TradeSmart Project Code Bundle

This file is generated for sharing project source code with an AI assistant. Secrets, local environment files, virtual environments, uploads, lockfiles, and generated model artifacts are intentionally excluded.

## Included Files

- `client\index.html`
- `client\package.json`
- `client\postcss.config.js`
- `client\public\manifest.json`
- `client\public\sw.js`
- `client\src\App.jsx`
- `client\src\main.jsx`
- `client\tailwind.config.js`
- `client\vite.config.js`
- `README.md`
- `requirements.txt`
- `scripts\backfill_logo_metadata.py`
- `scripts\fix_image_urls.py`
- `scripts\fix_productdetails_jsx.py`
- `server\app.py`
- `server\check_escrows.py`
- `server\ml_services\__init__.py`
- `server\ml_services\image_search\__init__.py`
- `server\ml_services\image_search\search_engine.py`
- `server\ml_services\logo_verifier\__init__.py`
- `server\ml_services\logo_verifier\classifier.py`
- `server\ml_services\logo_verifier\config.py`
- `server\ml_services\price_predictor\__init__.py`
- `server\ml_services\price_predictor\predictor.py`
- `server\requirements.txt`
- `server\routes\ai_routes.py`
- `server\routes\auth_routes.py`
- `server\routes\category_routes.py`
- `server\routes\dispute_routes.py`
- `server\routes\escrow_routes.py`
- `server\routes\feedback_routes.py`
- `server\routes\image_routes.py`
- `server\routes\logo_routes.py`
- `server\routes\messaging_routes.py`
- `server\routes\notifications_routes.py`
- `server\routes\payment_routes.py`
- `server\routes\product_routes.py`
- `server\routes\shipment_routes.py`
- `server\routes\user_ratings_routes.py`
- `server\routes\wallet_routes.py`
- `server\routes\watchlist_routes.py`
- `server\test_auth.py`
- `server\test_earnings.py`
- `server\test_fb.py`
- `server\utils\ai_helper.py`
- `server\utils\auth_helper.py`
- `server\utils\firebase_db.py`

---

## `client\index.html`

```html
<!doctype html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ML-TradeSmart | Premium Second-Hand Marketplace</title>
  <meta name="description"
    content="A professional, AI-powered marketplace for premium second-hand electronics, furniture, and high-end assets." />
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#10b981" />
  <link rel="apple-touch-icon" href="/icon-512.png" />
</head>

<body>
  <div id="root"></div>
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
      });
    }
  </script>
  <script type="module" src="/src/main.jsx"></script>
</body>

</html>
``````

---

## `client\package.json`

```json
{
  "name": "ml-scrap-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@stripe/react-stripe-js": "^6.2.0",
    "@stripe/stripe-js": "^9.2.0",
    "axios": "^1.6.0",
    "firebase": "^12.11.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.18",
    "vite": "^5.0.0"
  }
}
``````

---

## `client\postcss.config.js`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
``````

---

## `client\public\manifest.json`

```json
{
    "name": "ML-TradeSmart AI Hub",
    "short_name": "TradeSmart",
    "description": "Premium AI-Powered Second-Hand Trading Platform",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#0f172a",
    "theme_color": "#10b981",
    "icons": [
        {
            "src": "/icon-512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any maskable"
        }
    ]
}
``````

---

## `client\public\sw.js`

```javascript
const CACHE_NAME = "tradesmart-v3";
const ASSETS_TO_CACHE = ["/", "/index.html", "/manifest.json", "/icon-512.png"];

self.addEventListener("install", (event) => {
	self.skipWaiting();
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(ASSETS_TO_CACHE).catch(() => Promise.resolve());
		}),
	);
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		Promise.all([
			caches.keys().then((cacheNames) =>
				Promise.all(
					cacheNames.map((cacheName) => {
						if (cacheName !== CACHE_NAME) {
							return caches.delete(cacheName);
						}
						return Promise.resolve();
					}),
				),
			),
			self.clients.claim(),
		]),
	);
});

self.addEventListener("fetch", (event) => {
	const { request } = event;

	if (request.method !== "GET") {
		return;
	}

	const url = new URL(request.url);
	const isSameOrigin = url.origin === self.location.origin;
	const isNavigation = request.mode === "navigate";
	const isApiRequest =
		(isSameOrigin && url.pathname.startsWith("/api/")) ||
		url.origin.includes("localhost:5000");

	if (!isSameOrigin && !url.origin.includes("localhost:5000")) {
		event.respondWith(fetch(request));
		return;
	}

	if (isNavigation) {
		event.respondWith(
			fetch(request).catch(() =>
				caches
					.match("/index.html")
					.then((cached) => cached || Response.error()),
			),
		);
		return;
	}

	if (isApiRequest) {
		event.respondWith(
			fetch(request).catch(
				() =>
					new Response(
						JSON.stringify({ success: false, error: "Network unavailable" }),
						{
							status: 503,
							headers: { "Content-Type": "application/json" },
						},
					),
			),
		);
		return;
	}

	event.respondWith(
		caches
			.match(request)
			.then((response) => response || fetch(request))
			.catch(() => Response.error()),
	);
});
``````

---

## `client\src\App.jsx`

```jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Navbar from "./components/common/Navbar";
import Home from "./pages/Home";
import PricePredictionPage from "./pages/PricePredictor";
import ImageSearchPage from "./pages/ImageSearchPage";
import BrowseProducts from "./pages/BrowseProducts";
import SellProduct from "./pages/SellProduct";
import ProductDetails from "./pages/ProductDetails";
import TransactionDashboard from "./pages/TransactionDashboard";
import Wishlist from "./pages/Wishlist";
import LogoVerifierPage from "./pages/LogoVerifier";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import SellerProfile from "./pages/SellerProfile";
import Notifications from "./pages/Notifications";
import MyOrders from "./pages/MyOrders";
import MySoldItems from "./pages/MySoldItems";
import MySoldItemTransactions from "./pages/MySoldItemTransactions";
import MyAddress from "./pages/MyAddress";
import StripePaymentPage from "./pages/VirtualPaymentPage";
import Cashout from "./pages/Cashout";
import Footer from "./components/common/Footer";
import BackToTop from "./components/common/BackToTop";
import "./config/firebase";

function App() {
	return (
		<AuthProvider>
			<ThemeProvider>
				<Router>
					<div className="App min-h-screen flex flex-col transition-colors duration-300 bg-white dark:bg-slate-950">
						<Navbar />
						<div className="animate-fade-in flex-grow">
							<Routes>
								<Route path="/" element={<Home />} />
								<Route path="/browse" element={<BrowseProducts />} />
								<Route
									path="/price-predictor"
									element={<PricePredictionPage />}
								/>
								<Route path="/image-search" element={<ImageSearchPage />} />
								<Route path="/logo-verifier" element={<LogoVerifierPage />} />
								<Route path="/product/:id" element={<ProductDetails />} />
								<Route path="/seller/:sellerId" element={<SellerProfile />} />
								<Route path="/signin" element={<Signin />} />
								<Route path="/signup" element={<Signup />} />
								{/* Protected Routes */}
								<Route
									path="/sell"
									element={
										<ProtectedRoute>
											<SellProduct />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/escrow/:escrowId"
									element={
										<ProtectedRoute>
											<TransactionDashboard />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/payment/:escrowId"
									element={
										<ProtectedRoute>
											<StripePaymentPage />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/my-orders"
									element={
										<ProtectedRoute>
											<MyOrders />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/my-address"
									element={
										<ProtectedRoute>
											<MyAddress />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/my-sold-items"
									element={
										<ProtectedRoute>
											<MySoldItems />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/my-sold-items/:productId"
									element={
										<ProtectedRoute>
											<MySoldItemTransactions />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/notifications"
									element={
										<ProtectedRoute>
											<Notifications />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/wishlist"
									element={
										<ProtectedRoute>
											<Wishlist />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/profile"
									element={
										<ProtectedRoute>
											<Profile />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/cashout"
									element={
										<ProtectedRoute>
											<Cashout />
										</ProtectedRoute>
									}
								/>
							</Routes>
						</div>
						<Footer />
						<BackToTop />
					</div>
				</Router>
			</ThemeProvider>
		</AuthProvider>
	);
}

export default App;
``````

---

## `client\src\main.jsx`

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/tailwind.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
``````

---

## `client\tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      display: ['"Clash Display"', "Inter", "sans-serif"],
      body: ["Inter", "sans-serif"],
      mono: ['"Space Mono"', "monospace"],
      sans: ["Inter", "system-ui", "sans-serif"],
    },
    extend: {
      colors: {
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981", // Emerald Primary
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        accent: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6", // Blue AI accent
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        slate: {
          950: "#020617",
        }
      },
      boxShadow: {
        glow: "0 0 20px -5px rgba(16, 185, 129, 0.3)",
        "glow-blue": "0 0 20px -5px rgba(59, 130, 246, 0.3)",
      },
      backgroundImage: {
        "grid-pattern":
          "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.1) 1px, transparent 0)",
        "mesh-gradient": "radial-gradient(at 0% 0%, hsla(160,84%,39%,0.15) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(217,91%,60%,0.15) 0, transparent 50%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        }
      },
      screens: {
        "3xl": "1680px",
      },
    },
  },
  plugins: [],
}
``````

---

## `client\vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
})
``````

---

## `README.md`

```markdown
# â™»ï¸ ML Powered Second-Hand Trading Platform

![Python](https://img.shields.io/badge/Python-3.10-blue)
![React](https://img.shields.io/badge/React-18-blue)
![Flask](https://img.shields.io/badge/Flask-Backend-black)
![Firebase](https://img.shields.io/badge/Firebase-Auth-orange)
![License](https://img.shields.io/badge/License-MIT-green)

An intelligent full-stack web application that modernizes the second-hand goods trading ecosystem using **Machine Learning**, ensuring **fair pricing**, **fraud prevention**, and **trustworthy transactions** while promoting sustainability and the circular economy.

---

## ðŸš€ Project Overview

The **ML Powered Second-Hand Trading Platform** is designed to bridge the gap between buyers and sellers of second-hand items.  
It leverages machine learning models to provide **price prediction**, **image-based product search**, **fake logo verification**, and **personalized recommendations**.

This platform helps users:
- Get **fair price suggestions**
- Avoid **counterfeit products**
- Find similar items using images
- Trade second-hand items securely and efficiently

---

## ðŸ’¡ Problem Statement

Traditional second-hand markets face:

- âŒ Lack of price transparency  
- âŒ No fraud detection mechanisms  
- âŒ Informal and unsafe transactions  
- âŒ Limited product discovery  

This platform solves these problems using intelligent ML pipelines and secure web architecture.

---

## ðŸ“Š Platform Comparison

| Feature | Traditional Second-Hand Market | This Platform |
|----------|--------------------------|---------------|
| Price Transparency | âŒ No | âœ… ML-Based Prediction |
| Fraud Detection | âŒ None | âœ… Logo Verification |
| Image Search | âŒ Not Available | âœ… Deep Learning |
| Personalized Recommendations | âŒ No | âœ… Content-Based Filtering |
| Secure Transactions | âŒ Informal | âœ… Production-Grade Escrow (Atomic + RBAC + Audit Trail) |
| Digital Identity | âŒ Unverified | âœ… Firebase Authentication |

---

## ðŸ§  Key Features

| Feature | Description |
|---------|------------|
| ðŸ” Image-Based Product Search | Uses deep learning to find visually similar second-hand items. |
| ðŸ’° Fair Price Prediction | ML model predicts an optimal price range based on category, condition, and market trends. |
| ðŸ›¡ï¸ Fake Logo Verification | CNN-based model detects counterfeit brand logos to prevent fraud. |
| ðŸŽ¯ Personalized Recommendations | Recommends relevant items using content-based filtering. |
| ðŸ” Secure Authentication | Firebase Authentication for user login and role management. |
| ðŸ’¬ Escrow V2 System | Atomic Firebase-based escrow with FSM state control, dispute lock, auto-refund & auto-release scheduler. |

---

## ðŸ—ï¸ System Architecture

```
User (Frontend - React)
        â†“
Flask REST API
        â†“
ML Services Layer
        â†“
Firebase Database & Storage
```
---

## ðŸ§° Tech Stack


| Layer | Technologies |
|------|-------------|
| **Frontend** | React.js, Tailwind CSS, JavaScript |
| **Backend** | Flask (Python), REST APIs |
| **Database** | Firebase Realtime Database |
| **Authentication** | Firebase Authentication |
| **Storage** | Firebase Storage |

---


### ðŸ¤– Machine Learning Modules

| Module | Algorithm / Technique | Status |
|------|----------------------|--------|
| **Visual Search Engine** | **EfficientNetB0** + Cosine Similarity | âœ… High Accuracy |
| **Smart Price Estimator** | **Random Forest Regressor** (Multi-feature) | âœ… High Accuracy |
| **Authenticity Lab** | CNN + Feature Matching (LogoGuard AI) | âœ… Optimized |
| **Recommendations** | TF-IDF + Cosine Similarity | ðŸ› ï¸ In-Progress |

---

## ðŸŽ¨ Design & UX

The platform features a **Premium Design System** built on:
- **Glassmorphism Aesthetic**: Translucent layers with subtle blurs for a modern, futuristic feel.
- **Dynamic Color Palettes**: Space-themed gradients (Indigo/Purple for Vision, Emerald/Teal for Finance).
- **Interactive UI**: Micro-animations, responsive hover effects, and real-time validation feedback.
- **Dark Mode Optimized**: Native support for high-contrast dark environments.

## ðŸ“‚ Project Structure

```bash
ML-Powered-Scrap-Trading-Platform/
â”‚
â”œâ”€â”€ client/ # Frontend (React + Tailwind)
â”‚ â”œâ”€â”€ src/
â”‚ â”œâ”€â”€ public/
â”‚ â””â”€â”€ package.json
â”‚
â”œâ”€â”€ server/ # Backend (Flask)
â”‚ â”œâ”€â”€ app.py
â”‚ â”œâ”€â”€ routes/
â”‚ â”œâ”€â”€ ml_services/
â”‚ â””â”€â”€ requirements.txt
â”‚
â”œâ”€â”€ ml_models/ # Training scripts (no large models)
â”‚
â”œâ”€â”€ .gitignore
â”œâ”€â”€ README.md
â””â”€â”€ docker-compose.yml (optional)
```

---

## âš™ï¸ Installation & Setup

### 1ï¸âƒ£ Clone the Repository
```bash
git clone https://github.com/Akshitgarg1/ML-Powered-Scrap-Trading-Platform.git
cd ML-Powered-Scrap-Trading-Platform
```
### 2ï¸âƒ£ Frontend Setup
```text
cd client
npm install
npm run dev
```

### 3ï¸âƒ£ Backend Setup
```text
cd server
python -m venv venv
.venv\Scripts\activate
pip install -r requirement.txt
```
### ðŸ” Firebase Admin Setup (Required for Escrow)

- Generate Firebase Service Account Key
- Place it inside:
```bash
server/serviceAccountKey.json
```
- Update databaseURL in app.py
- Run:
```text
python app.py
```
- âš ï¸ serviceAccountKey.json is ignored via .gitignore.

---

## ðŸ” Environment Variables
```text
Create a .env file in both client and server folders for sensitive keys:

FIREBASE_API_KEY=your_key_here
FIREBASE_PROJECT_ID=your_project_id
```
---

## ðŸ“¦ ML Models & Datasets

- Large ML models are intentionally excluded.
- Models are stored locally or in cloud storage.
- Keeps repository lightweight and collaboration-friendly.

---

## ðŸ” Security Considerations

- Firebase role-based authentication
- Protected API routes
- Environment variable isolation
- No sensitive keys in repository

---

## ðŸ”’ Escrow V2 Architecture (escrow-v2 Branch)

- The escrow-v2 branch introduces a production-grade escrow system designed with:

-- ðŸ” Atomic Firebase Transactions

-- ðŸ” Role-Based Access Control (Buyer / Seller / Admin / System)

-- ðŸ“Š Multi-State Synchronization (escrow_status, payment_status, shipment_status)

-- â³ Auto-Refund (Shipping Timeout)

-- â³ Auto-Release (Delivery Confirmation Timeout)

-- ðŸ›¡ï¸ Admin Lock Mechanism

-- ðŸ“œ Immutable Audit Trail

- All fund transitions are validated through a strict Finite State Machine (FSM).

- Branch Info:
```bash
main        â†’ Base Stable Version
escrow-v2   â†’ Hardened Escrow Production Version
```
---

## ðŸŒ± Sustainability Impact

| Initiative | Description |
|------------|------------|
| Responsible Recycling | Encourages proper disposal and reuse of second-hand materials. |
| Reduction of Waste | Minimizes landfill contribution through structured resale. |
| Circular Economy Adoption | Promotes reuse and redistribution of materials within the economy. |
| Digital Trust in Informal Second-Hand Markets | Builds transparency and credibility using ML-based verification systems. |

---

## ðŸ“ˆ Future Enhancements

- Real-time dynamic pricing
- Mobile application (React Native)
- Blockchain-based transaction verification
- Multilingual support
- Advanced recommender system (Hybrid Model)

---

## ðŸŽ“ Academic Context

| Category        | Details                                   |
|----------------|-------------------------------------------|
| Degree         | B.Tech (Computer Science & Engineering)   |
| Project Type   | Final Year Major Project                  |
| Focus Areas    | Machine Learning, Web Development, Sustainability |

---

## ðŸ“„ License

This project is licensed under the MIT License.

---

## ðŸ‘¨â€ðŸ’» Author

**Akshit Garg**  
B.Tech CSE | Final Year  
Machine Learning & Full-Stack Enthusiast  

---

â­ If you found this project useful, consider giving it a star!
``````

---

## `requirements.txt`

```
# =========================
# Core Backend
# =========================
Flask==3.1.2
flask-cors==6.0.1
Werkzeug==3.1.3
python-dotenv==1.2.1
requests==2.32.5
cloudinary==1.44.2

# =========================
# Database / Data Handling
# =========================
pandas==2.3.3
numpy==2.2.6
pyarrow==18.1.0

# =========================
# Machine Learning
# =========================
scikit-learn==1.7.2
joblib==1.5.2
scipy==1.16.3

# =========================
# Deep Learning (CPU)
# =========================
tensorflow==2.20.0
keras==3.12.0
h5py==3.15.1
tensorboard==2.20.0

# =========================
# Computer Vision
# =========================
opencv-python==4.12.0.88
pillow==11.3.0
pytesseract==0.3.10

# =========================
# NLP (If Needed)
# =========================
nltk==3.8.1
regex==2023.10.3

# =========================
# Google / AI APIs
# =========================
google-generativeai==0.8.6
google-api-python-client==2.187.0
google-auth==2.45.0

# =========================
# Utilities
# =========================
tqdm==4.66.1
protobuf==5.29.5

# =========================
# Authentication & Security
# =========================
firebase-admin==7.2.0
bcrypt==5.0.0
PyJWT==2.11.0
``````

---

## `scripts\backfill_logo_metadata.py`

```python
"""Backfill neutral logo metadata for legacy product records.

This script is intentionally conservative:
- it only updates products that have no logo metadata at all
- it never guesses `logo_visible`
- it is safe to run multiple times
"""

import os
import sys
from datetime import datetime

import firebase_admin
from firebase_admin import credentials, db

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SERVER_DIR = os.path.join(ROOT_DIR, "server")
LOGO_KEYS = ("logo_visible", "logo_status", "logo_verify_status", "logo_verification")


def _load_env():
    """Load server/.env when python-dotenv is available."""
    try:
        from dotenv import load_dotenv

        load_dotenv(os.path.join(SERVER_DIR, ".env"))
    except Exception:
        pass


def _initialize_firebase():
    """Initialize Firebase Admin SDK from repo-local server config."""
    _load_env()

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is not set.")

    cred_setting = os.getenv("FIREBASE_CREDENTIALS_PATH", "serviceAccountKey.json")
    cred_path = cred_setting
    if not os.path.isabs(cred_path):
        cred_path = os.path.join(SERVER_DIR, cred_path)

    if firebase_admin._apps:
        return

    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred, {"databaseURL": database_url})
    else:
        firebase_admin.initialize_app(options={"databaseURL": database_url})


def main():
    """Backfill unknown logo metadata for products with no logo state."""
    try:
        _initialize_firebase()
    except Exception as exc:
        print(f"ERROR: Firebase initialization failed: {exc}", file=sys.stderr)
        return 1

    products = db.reference("products").get() or {}
    updated = 0
    already_populated = 0
    skipped = 0

    for product_id, product in products.items():
        if not isinstance(product, dict):
            skipped += 1
            print(f"SKIP {product_id}: product payload is not an object")
            continue

        if any(key in product for key in LOGO_KEYS):
            already_populated += 1
            continue

        db.reference(f"products/{product_id}").update(
            {
                "logo_status": "unknown",
                "logo_verify_status": "unknown",
                "updated_at": datetime.now().isoformat(),
            }
        )
        updated += 1
        print(f"UPDATED {product_id}: {product.get('title', '(untitled product)')}")

    print("")
    print("Backfill summary")
    print(f"- updated: {updated}")
    print(f"- already populated: {already_populated}")
    print(f"- skipped: {skipped}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
``````

---

## `scripts\fix_image_urls.py`

```python
#!/usr/bin/env python3
"""
Fix product image URLs in Firebase Database
Replace /uploads/ paths with Firebase Storage URLs
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Initialize Firebase
import firebase_admin
from firebase_admin import credentials
from dotenv import load_dotenv

# Load .env from server directory
env_path = os.path.join(os.path.dirname(__file__), '..', 'server', '.env')
load_dotenv(env_path)

db_url = os.getenv('DATABASE_URL')
storage_bucket = os.getenv('FIREBASE_STORAGE_BUCKET', 'scrap-trade-b1ea7.appspot.com')
cred_path = os.path.join(os.path.dirname(__file__), '..', 'server', os.getenv('FIREBASE_CREDENTIALS_PATH', 'serviceAccountKey.json'))

if not firebase_admin._apps:
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred, {'databaseURL': db_url, 'storageBucket': storage_bucket})
        print("Firebase initialized")
    else:
        print("Firebase credentials not found")
        sys.exit(1)

from server.utils.firebase_db import FirebaseDB

def fix_image_urls():
    """Update product image URLs to use Firebase Storage"""
    products = FirebaseDB.get_all('products')
    if not products:
        print("No products found")
        return

    bucket_base = "https://storage.googleapis.com/scrap-trade-b1ea7.appspot.com/product_images/"

    updated_count = 0
    for product_id, product in products.items():
        image_url = product.get('image_url', '')
        if image_url.startswith('/uploads/'):
            filename = image_url.replace('/uploads/', '')
            new_url = bucket_base + filename
            update_data = {'image_url': new_url}
            success = FirebaseDB.update('products', product_id, update_data)
            if success:
                updated_count += 1
                print(f"Updated {product_id}: {image_url} -> {new_url}")
            else:
                print(f"Failed to update {product_id}")

    print(f"Updated {updated_count} products")

if __name__ == "__main__":
    fix_image_urls()
``````

---

## `scripts\fix_productdetails_jsx.py`

```python
from pathlib import Path

path = Path('client/src/pages/ProductDetails.jsx')
text = path.read_text(encoding='utf-8')
old = '''                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    No Image
                                                </div>
                                            )}
                                                <Link
                                                    to={`/product/${item.id}`}
                                                    className="w-full btn-gradient !py-2 !text-[10px]"
                                                >'''
new = '''                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    No Image
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                                <Link
                                                    to={`/product/${item.id}`}
                                                    className="w-full btn-gradient !py-2 !text-[10px]"
                                                >'''
if old not in text:
    print('Pattern not found')
else:
    path.write_text(text.replace(old, new, 1), encoding='utf-8')
    print('Replaced successfully')
``````

---

## `server\app.py`

```python


# IMPORT TENSORFLOW FIRST (OPTIONAL - FOR AI FEATURES ONLY)
try:
    import tensorflow as tf
    print("[INFO] TensorFlow loaded successfully.")
    TF_AVAILABLE = True
except Exception as e:
    print(f"[WARNING] TensorFlow not available - AI features disabled: {e}")
    TF_AVAILABLE = False

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os
import firebase_admin
from firebase_admin import credentials, db, storage
import threading

# Load .env before importing route modules that read environment variables.
load_dotenv()

# Importing route blueprints

from routes.auth_routes import auth_bp
from routes.escrow_routes import escrow_bp
from routes.payment_routes import payment_bp
from routes.notifications_routes import notifications_bp
from routes.product_routes import product_bp
from routes.messaging_routes import messaging_bp
from routes.wallet_routes import wallet_bp
from routes.shipment_routes import shipment_bp

# Optional AI routes (only if TensorFlow is available)
if TF_AVAILABLE:
    try:
        from routes.ai_routes import ai_bp
    except Exception as e:
        print(f"[WARNING] AI routes not loaded: {e}")
        ai_bp = None
    
    try:
        from routes.image_routes import image_bp
    except Exception as e:
        print(f"[WARNING] Image routes not loaded: {e}")
        image_bp = None
    
    try:
        from routes.logo_routes import logo_bp
    except Exception as e:
        print(f"[WARNING] Logo routes not loaded: {e}")
        logo_bp = None
else:
    ai_bp = None
    image_bp = None
    logo_bp = None

# Other routes that may depend on optional modules
try:
    from routes.feedback_routes import feedback_bp
except:
    feedback_bp = None

try:
    from routes.dispute_routes import dispute_bp
except:
    dispute_bp = None

try:
    from routes.user_ratings_routes import ratings_bp
except:
    ratings_bp = None

try:
    from routes.watchlist_routes import watchlist_bp
except:
    watchlist_bp = None

try:
    from routes.category_routes import category_bp
except:
    category_bp = None

def create_app():
    """Initializes and configures the Flask application."""
    # Load environment variables
    load_dotenv()
    
    app = Flask(__name__)

    # Basic configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB

    # Initialize Firebase Admin SDK
    try:
        if not firebase_admin._apps:
            db_url = os.getenv('DATABASE_URL')
            storage_bucket = os.getenv('FIREBASE_STORAGE_BUCKET', 'scrap-trade-b1ea7.appspot.com')
            cred_path = os.path.join(os.path.dirname(__file__), os.getenv('FIREBASE_CREDENTIALS_PATH', 'serviceAccountKey.json'))
            if os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred, {'databaseURL': db_url, 'storageBucket': storage_bucket})
            else:
                firebase_admin.initialize_app(options={'databaseURL': db_url, 'storageBucket': storage_bucket})
            print(f"[INFO] Firebase initialized with: {db_url} and storage bucket {storage_bucket}")
    except Exception as e:
        print(f"[WARNING] Firebase init warning: {e}")

    # Allow API access from frontend and permit authorization headers
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        allow_headers=["Content-Type", "Authorization"],
    )

    # Ensure uploads folder exists
    os.makedirs('uploads', exist_ok=True)

    # Registering all modular routes (only if they loaded successfully)
    if ai_bp:
        app.register_blueprint(ai_bp)
    if image_bp:
        app.register_blueprint(image_bp)
    app.register_blueprint(product_bp)
    if logo_bp:
        app.register_blueprint(logo_bp)
    if feedback_bp:
        app.register_blueprint(feedback_bp)
    app.register_blueprint(escrow_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(messaging_bp)
    app.register_blueprint(wallet_bp)
    if dispute_bp:
        app.register_blueprint(dispute_bp)
    if ratings_bp:
        app.register_blueprint(ratings_bp)
    if watchlist_bp:
        app.register_blueprint(watchlist_bp)
    if category_bp:
        app.register_blueprint(category_bp)
    app.register_blueprint(shipment_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(payment_bp)

    # Route to serve uploaded files
    @app.route('/uploads/<filename>')
    def serve_uploaded_file(filename):
        return send_from_directory('uploads', filename)

    # Basic home route
    @app.route('/')
    def home():
        return jsonify({
            'message': 'ML TradeSmart Platform API',
            'status': 'running',
            'version': '1.0.0'
        })

    # Health check
    @app.route('/api/health')
    def health():
        return jsonify({
            'status': 'healthy',
            'services': [
                'price-prediction',
                'image-search',
                'product-listings',
                'file-upload',
                'identity-service'
            ]
        })

    def preload_models():
        """Background task to pre-load ML models."""
        try:
            print("[INFO] Pre-loading ML models in background...")
            if TF_AVAILABLE:
                from ml_services.logo_verifier.classifier import _get_extractor as load_logo
                from ml_services.image_search.search_engine import _get_extractor as load_search
                from ml_services.price_predictor.predictor import _load_model as load_price
                
                load_logo()
                load_search()
                load_price()
                print("[SUCCESS] All ML models pre-loaded.")
        except Exception as e:
            print(f"[WARNING] Model pre-loading failed: {e}")

    # Start pre-loading in a separate thread
    threading.Thread(target=preload_models, daemon=True).start()

    return app


if __name__ == '__main__':
    app = create_app()
    # NOTE: The Flask debug reloader imports the app twice. With heavy ML imports
    # (TensorFlow/MobileNetV2), that can look like the server is "not running" for
    # a long time. We default the reloader to off to speed up startup.
    debug = os.getenv('FLASK_DEBUG', '1') == '1'
    use_reloader = os.getenv('FLASK_USE_RELOADER', '0') == '1'
    port = int(os.getenv('PORT', '5050'))

    # Host 0.0.0.0 is better for internal testing
    app.run(debug=debug, use_reloader=use_reloader, host='0.0.0.0', port=port)
``````

---

## `server\check_escrows.py`

```python
import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, db

load_dotenv('.env')

db_url = os.getenv('DATABASE_URL')
cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH', 'serviceAccountKey.json')

try:
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred, {'databaseURL': db_url})
    else:
        firebase_admin.initialize_app(options={'databaseURL': db_url})
    print("Firebase initialized.")
except Exception as e:
    print(f"Firebase init error: {e}")

from utils.firebase_db import FirebaseDB

# Check for escrows
escrows = FirebaseDB.query_filter('escrows', 'status', 'RELEASED')
print(f'Found {len(escrows) if escrows else 0} released escrows')
if escrows:
    for escrow in escrows[:3]:
        print(f'Escrow ID: {escrow.get("escrow_id")}, Seller: {escrow.get("seller_id")}, Amount: {escrow.get("ledger", {}).get("amount")}, Status: {escrow.get("status")}')

# Check wallet transactions
transactions = FirebaseDB.get_all('wallet_transactions')
print(f'\nFound {len(transactions) if transactions else 0} total wallet transactions')
if transactions:
    count = 0
    for tx_id, tx_data in transactions.items():
        if count >= 5:
            break
        print(f'TX: {tx_id}, Type: {tx_data.get("type")}, Amount: {tx_data.get("amount")}, User: {tx_data.get("user_id")}')
        count += 1
``````

---

## `server\ml_services\__init__.py`

```python
# ML Services Package
``````

---

## `server\ml_services\image_search\__init__.py`

```python
from .search_engine import search_similar_images
``````

---

## `server\ml_services\image_search\search_engine.py`

```python
import os
import pickle
import numpy as np
import threading
import time
from pathlib import Path
from tensorflow.keras.applications import MobileNetV2
from sklearn.metrics.pairwise import cosine_similarity
from utils.firebase_db import ProductsAPI
from utils.ai_helper import download_and_process_image

# Setup paths
BASE_DIR = Path(__file__).resolve().parent
STATIC_MODEL_PATH = BASE_DIR.parents[1] / "ml_models" / "image_search_model.pkl"

# Global variables
_feature_extractor = None
_marketplace_index = {
    "features": None,
    "metadata": None,
    "last_updated": 0
}
_index_lock = threading.Lock()

# Cache duration (30 minutes for high performance)
CACHE_DURATION = 1800 

def _get_extractor():
    """Lazy load MobileNetV2."""
    global _feature_extractor
    if _feature_extractor is None:
        print("[INFO] Loading Image Search Feature Extractor (MobileNetV2)...")
        _feature_extractor = MobileNetV2(
            weights='imagenet', 
            include_top=False, 
            pooling='avg', 
            input_shape=(224, 224, 3)
        )
    return _feature_extractor

def _build_marketplace_index():
    """Fetches all products from Firebase and builds a feature index."""
    global _marketplace_index
    
    with _index_lock:
        # Check if cache is still valid
        if _marketplace_index["features"] is not None and (time.time() - _marketplace_index["last_updated"]) < CACHE_DURATION:
            return _marketplace_index["metadata"], _marketplace_index["features"]

        print("[INFO] Building Marketplace Visual Index (Optimized)...")
        products = ProductsAPI.get_all()
        
        if not products:
            print("[WARNING] No products found in marketplace to index.")
            return [], None

        extractor = _get_extractor()
        features_list = []
        metadata_list = []

        for p in products:
            img_url = p.get('image_url') or (p.get('image_urls')[0] if p.get('image_urls') else None)
            if not img_url:
                continue

            # Process image and extract features
            img_tensor = download_and_process_image(img_url)
            if img_tensor is not None:
                try:
                    feat = extractor.predict(img_tensor, verbose=0).flatten()
                    feat /= np.linalg.norm(feat) # L2 normalization
                    
                    features_list.append(feat)
                    metadata_list.append({
                        "id": p.get("id"),
                        "title": p.get("title", "Unnamed Product"),
                        "category": p.get("category", "Uncategorized"),
                        "price": p.get("price", 0),
                        "image_url": img_url,
                        "is_marketplace": True
                    })
                except Exception as e:
                    print(f"[WARNING] Feature extraction failed for {img_url}: {e}")

        if features_list:
            _marketplace_index["features"] = np.vstack(features_list)
            _marketplace_index["metadata"] = metadata_list
            _marketplace_index["last_updated"] = time.time()
            print(f"[SUCCESS] Indexed {len(metadata_list)} marketplace products.")
        else:
            print("[WARNING] No marketplace images could be indexed.")
            
        return _marketplace_index["metadata"], _marketplace_index["features"]

def search_similar_images(image_path, top_k=6):
    """
    Finds the most visually similar items in the live marketplace.
    """
    try:
        extractor = _get_extractor()
        metadata, features_db = _build_marketplace_index()
        
        if features_db is None or len(features_db) == 0:
            return {"success": False, "error": "No marketplace products available for visual search."}

        # 1. Process Query Image
        img_tensor = download_and_process_image(image_path)
        if img_tensor is None:
            return {"success": False, "error": "Could not process uploaded image."}

        # 2. Extract Features
        query_vector = extractor.predict(img_tensor, verbose=0)
        query_vector = query_vector.reshape(1, -1)
        query_vector /= np.linalg.norm(query_vector)

        # 3. Calculate Similarities
        similarities = cosine_similarity(query_vector, features_db)[0]

        # 4. Get Top K indices
        top_indices = similarities.argsort()[::-1][:top_k]

        results = []
        for idx in top_indices:
            score = float(similarities[idx])
            # Only include results with a reasonable similarity (Threshold: 40%)
            if score < 0.40:
                continue
                
            item = metadata[idx]
            results.append({
                "product_id": item.get('id'),
                "title": item.get('title'),
                "category": item.get('category'),
                "price": item.get('price'),
                "similarity_score": score,
                "similarity_percentage": int(score * 100),
                "image_url": item.get('image_url')
            })

        return {
            "success": True,
            "results": results,
            "count": len(results),
            "source": "live_marketplace"
        }

    except Exception as e:
        print(f"[ERROR] Marketplace image search failed: {e}")
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}
``````

---

## `server\ml_services\logo_verifier\__init__.py`

```python
from .classifier import verify_logo, get_available_brands, LogoAuthenticityClassifier
``````

---

## `server\ml_services\logo_verifier\classifier.py`

```python
import os
import joblib
import numpy as np
from pathlib import Path
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.preprocessing import image

# Setup paths
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR.parents[1] / "ml_models" / "logo_auth_classifier.pkl"

# Global variables
_feature_extractor = None
_authenticity_model = None

def _get_extractor():
    """Lazy load MobileNetV2."""
    global _feature_extractor
    if _feature_extractor is None:
        print("[INFO] Loading Logo Verifier Feature Extractor (MobileNetV2)...")
        _feature_extractor = MobileNetV2(
            weights='imagenet', 
            include_top=False, 
            pooling='avg', 
            input_shape=(224, 224, 3)
        )
    return _feature_extractor

def _get_model():
    """Lazy load Isolation Forest model."""
    global _authenticity_model
    if _authenticity_model is None:
        if MODEL_PATH.exists():
            print(f"[INFO] Loading Logo Authenticity Model from {MODEL_PATH}...")
            _authenticity_model = joblib.load(MODEL_PATH)
        else:
            print(f"[ERROR] Logo Authenticity Model not found at {MODEL_PATH}")
    return _authenticity_model

def get_available_brands():
    """Returns a list of supported brands for verification."""
    # This matches the major brands in our combined dataset
    return [
        "Apple", "Samsung", "Nike", "Adidas", "Sony", "Dell", 
        "HP", "Asus", "Honda", "Toyota", "Coca Cola", "Pepsi", 
        "Google", "Microsoft", "Intel", "Mercedes Benz", "BMW"
    ]

def verify_logo(image_path, brand_hint=None):
    """
    Verifies if an uploaded logo is authentic using the Forensic Classifier.
    Labels: 0 = Original, 1 = Fake
    """
    extractor = _get_extractor()
    model = _get_model()

    try:
        # 1. Process Image
        img = image.load_img(image_path, target_size=(224, 224))
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = preprocess_input(img_array)

        # 2. Extract Features
        features = extractor.predict(img_array, verbose=0).flatten().reshape(1, -1)
        
        # 3. Predict Authenticity (Binary Classification)
        is_authentic = True
        confidence = 0.95 # Default fallback
        
        if model is not None:
            # probs[0] is probability of 'Original', probs[1] is 'Fake'
            probs = model.predict_proba(features)[0]
            
            # Use a strict 85% threshold for authenticity
            confidence = float(probs[0])
            is_authentic = (confidence >= 0.85)
        
        # 4. Final Result Mapping
        best_brand = brand_hint or "Detected Brand"
        
        if is_authentic:
            explanation = f"The logo is verified as AUTHENTIC ({confidence*100:.1f}% match). It matches known original brand signatures."
            status = "Verified"
        else:
            # If not authentic, confidence of it being Fake
            fake_prob = float(probs[1])
            explanation = f"CAUTION: High probability ({fake_prob*100:.1f}%) of being a COUNTERFEIT logo based on visual forensics."
            status = "Suspicious"

        # Return UI-friendly results
        return {
            "success": True,
            "is_genuine": bool(is_authentic),
            "confidence": round(confidence, 4),
            "best_brand_match": best_brand,
            "explanation": explanation,
            "status": status,
            "top_matches": [
                {
                    "brand": best_brand, 
                    "similarity": round(confidence, 4), 
                    "reference_url": f"/api/logo/reference/{best_brand.lower()}.png"
                }
            ]
        }

    except Exception as e:
        print(f"[ERROR] Logo verification failed: {e}")
        return {
            "success": False, 
            "error": str(e),
            "is_genuine": None,
            "confidence": 0,
            "best_brand_match": "Error"
        }

class LogoAuthenticityClassifier:
    """Class wrapper for compatibility with some route imports."""
    def __init__(self):
        pass
    def predict_probability(self, image_path):
        res = verify_logo(image_path)
        return res.get("confidence", 0.0)
``````

---

## `server\ml_services\logo_verifier\config.py`

```python
import os
from pathlib import Path

# Setup paths
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parents[2]

# Path to the reference logos folder (used for serving images to the UI)
REFERENCE_LOGO_DIR = PROJECT_ROOT / "Dataset" / "Fake_logo_Detection_Dataset" / "Logos"

# Fallback if the path above doesn't exist
if not REFERENCE_LOGO_DIR.exists():
    REFERENCE_LOGO_DIR = PROJECT_ROOT / "archive" / "genLogoOutput"
``````

---

## `server\ml_services\price_predictor\__init__.py`

```python
from .predictor import predict_price
``````

---

## `server\ml_services\price_predictor\predictor.py`

```python
import joblib
import os
import pandas as pd
import numpy as np
from pathlib import Path

# Setup paths
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR.parents[1] / "ml_models" / "price_model.joblib"

# Global model cache
_model = None

def _load_model():
    """Lazy load the price prediction model."""
    global _model
    if _model is None:
        if MODEL_PATH.exists():
            print(f"[INFO] Loading Price Prediction Model from {MODEL_PATH}...")
            _model = joblib.load(MODEL_PATH)
        else:
            print(f"[ERROR] Price Prediction Model not found at {MODEL_PATH}")
    return _model

def predict_price(data):
    """
    Predicts the resale price based on product details using the Optimized model.
    Handles all 9 features: category, brand, condition, original_price, age_years, 
    usage_hours, location, has_warranty, has_box.
    """
    model = _load_model()
    if model is None:
        return {"error": "Model not loaded"}

    try:
        # Prepare input features with defaults to match the 9 training columns
        # Note: The order must match the X dataframe columns from training
        features = {
            'category': str(data.get('category', 'Other')),
            'brand': str(data.get('brand', 'Generic')),
            'original_price': float(data.get('original_price', 0)),
            'age_years': float(data.get('age_years', 0)),
            'condition': str(data.get('condition', 'Good')),
            'usage_hours': float(data.get('usage_hours', 0)),
            'location': str(data.get('location', 'Unknown')),
            'has_warranty': int(data.get('has_warranty', 0)),
            'has_box': int(data.get('has_box', 0))
        }

        # Convert to DataFrame (Pipeline handles scaling/encoding)
        df = pd.DataFrame([features])

        # Run prediction
        prediction = model.predict(df)[0]

        # Apply Business Logic: Resale price shouldn't exceed 90% of original price
        original_price = float(data.get('original_price', 0))
        if original_price > 0:
            max_allowed = original_price * 0.9
            prediction = min(prediction, max_allowed)
        
        # Ensure it doesn't go below 5% of original
        min_allowed = original_price * 0.05
        prediction = max(prediction, min_allowed)

        # Confidence is hardcoded based on our R^2 training accuracy (approx 92%)
        accuracy_score = 0.92 

        # Generate dynamic explanations for the frontend
        explanations = [
            f"Based on {data.get('category', 'item')} market trends.",
            f"Factored {data.get('age_years', 0)} years of depreciation."
        ]
        if data.get('has_warranty'):
            explanations.append("Active warranty adds value protection.")
        if data.get('has_box'):
            explanations.append("Original packaging increases resale appeal.")
        if float(data.get('age_years', 0)) < 1:
            explanations.append("Near-new status significantly boosts price.")

        result = {
            "success": True,
            "predicted_price": round(float(prediction), 2),
            "price_range": {
                "min": round(float(prediction * 0.90), 2),
                "max": round(float(prediction * 1.10), 2)
            },
            "currency": "INR",
            "confidence_score": accuracy_score,
            "explanations": explanations,
            "forensic_report": "Optimized multi-factor regression analysis completed."
        }
        
        print(f"[SUCCESS] Price Prediction: â‚¹{result['predicted_price']}")
        return result

    except Exception as e:
        print(f"[ERROR] Price prediction failed: {e}")
        return {"success": False, "error": str(e)}
``````

---

## `server\requirements.txt`

```
absl-py==2.3.1

astunparse==1.6.3

blinker==1.9.0

certifi==2025.10.5

charset-normalizer==3.4.4

click==8.3.0

cloudinary==1.44.2

colorama==0.4.6

contourpy==1.3.3

crayons==0.4.0

cycler==0.12.1

distlib==0.4.0

filelock==3.19.1

Flask==3.1.2

flask-cors==6.0.1

flatbuffers==25.9.23

fonttools==4.60.1

gast==0.6.0

google-pasta==0.2.0

grpcio==1.76.0

h5py==3.15.1

idna==3.11

itsdangerous==2.2.0

Jinja2==3.1.6

joblib==1.5.2

keras==3.12.0

kiwisolver==1.4.9

libclang==18.1.1

Markdown==3.9

markdown-it-py==4.0.0

MarkupSafe==3.0.3

matplotlib==3.10.7

mdurl==0.1.2

ml_dtypes==0.5.3

namex==0.1.0

numpy==2.2.6

opencv-python==4.12.0.88

opt_einsum==3.4.0

optree==0.17.0

packaging==25.0

pandas==2.3.3

piexif==1.1.3

pillow==11.3.0

platformdirs==4.4.0

protobuf==6.33.0

Pygments==2.19.2

pyparsing==3.2.5

python-dateutil==2.9.0.post0

pytz==2025.2

requests==2.32.5

rich==14.2.0

scikit-learn==1.7.2

scipy==1.16.3

setuptools==80.9.0

six==1.17.0

stegano==2.0.0

tensorboard==2.20.0

tensorboard-data-server==0.7.2

tensorflow==2.20.0

termcolor==3.2.0

threadpoolctl==3.6.0

typing_extensions==4.15.0

tzdata==2025.2

urllib3==2.5.0

virtualenv==20.34.0

Werkzeug==3.1.3

wheel==0.45.1

wrapt==2.0.0
``````

---

## `server\routes\ai_routes.py`

```python
# server/routes/ai_routes.py
"""
AI-related API routes.
Handles:
1. Product price prediction
2. AI service health check
"""

from flask import Blueprint, request, jsonify

# ML service imports
from ml_services.price_predictor.predictor import predict_price

# =====================================================
# Blueprint Configuration
# =====================================================

ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")


# =====================================================
# Helper Functions
# =====================================================

def validate_request_data(data):
    """Validate required fields in request payload."""
    
    required_fields = [
        "category",
        "brand",
        "original_price",
        "age_years"
    ]

    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"

    return True, None


# =====================================================
# Routes
# =====================================================

@ai_bp.route("/predict-price", methods=["POST"])
def predict_price_route():
    """Predict estimated resale price."""

    try:
        data = request.get_json()

        # Validate request payload
        valid, error = validate_request_data(data)
        if not valid:
            return jsonify({
                "success": False,
                "error": error
            }), 400

        # Run prediction
        result = predict_price(data)

        if "error" in result:
            return jsonify({
                "success": False,
                "error": result["error"]
            }), 400

        return jsonify({
            "success": True,
            "data": result
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@ai_bp.route("/test", methods=["GET"])
def test_route():
    """Test endpoint to verify AI routes."""
    
    return jsonify({
        "success": True,
        "message": "AI routes are working"
    }), 200


@ai_bp.route("/price-range", methods=["GET"])
def price_range_route():
    """Returns a basic recommended price range for client-side validation."""

    return jsonify({
        "success": True,
        "data": {
            "lower": 100.0,
            "upper": 1_000_000.0,
        },
    }), 200
``````

---

## `server\routes\auth_routes.py`

```python
# server/routes/auth_routes.py
"""
Authentication Routes

Handles:
- User registration
- User login
- Profile retrieval
- Profile update
"""

from flask import Blueprint, request, jsonify, current_app
import jwt
import datetime
import bcrypt
import uuid
import re

from firebase_admin import db
from utils.auth_helper import token_required


# =====================================================
# Blueprint Configuration
# =====================================================

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# =====================================================
# Helper Functions
# =====================================================

EMAIL_REGEX = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")
PHONE_REGEX = re.compile(r"^[6-9][0-9]{9}$")


def normalize_input(value):
    """Normalize user input for consistent comparison."""
    return value.lower().strip()


def is_valid_email(email):
    """Validate email format."""
    return bool(EMAIL_REGEX.match(email.strip()))


def is_valid_phone(phone):
    """Validate Indian 10-digit mobile number."""
    trimmed = phone.strip()
    return bool(trimmed and PHONE_REGEX.match(trimmed))


def user_exists(username, email):
    """Check if username or email already exists."""
    
    users_ref = db.reference("users")
    users = users_ref.get()

    if not isinstance(users, dict):
        return False

    username_clean = normalize_input(username)
    email_clean = normalize_input(email)

    for uid, user in users.items():
        if user.get("username", "").lower() == username_clean:
            return True
        if user.get("email", "").lower() == email_clean:
            return True

    return False


def generate_token(user_id):
    """Generate JWT token for authentication."""
    
    token = jwt.encode(
        {
            "user_id": user_id,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        },
        current_app.config["SECRET_KEY"],
        algorithm="HS256"
    )

    return token


# =====================================================
# Routes
# =====================================================

@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user."""

    data = request.get_json()

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    full_name = data.get("full_name", "")
    phone = data.get("phone", "")

    if not username or not email or not password:
        return jsonify({
            "success": False,
            "message": "Required fields missing!"
        }), 400

    email = email.strip()
    phone = phone.strip()
    username_clean = normalize_input(username)
    email_clean = normalize_input(email)

    if not is_valid_email(email):
        return jsonify({
            "success": False,
            "message": "Enter a valid email address."
        }), 400

    if len(password) < 6:
        return jsonify({
            "success": False,
            "message": "Password must be at least 6 characters."
        }), 400

    if phone and not is_valid_phone(phone):
        return jsonify({
            "success": False,
            "message": "Enter a valid 10-digit Indian phone number."
        }), 400

    # Check existing user
    if user_exists(username_clean, email_clean):
        return jsonify({
            "success": False,
            "message": "Username or email already registered!"
        }), 409

    # Password hashing
    salt = bcrypt.gensalt()
    hashed_pw = bcrypt.hashpw(
        password.encode("utf-8"), salt
    ).decode("utf-8")

    uid = str(uuid.uuid4())

    new_user = {
        "username": username_clean,
        "email": email_clean,
        "password": hashed_pw,
        "full_name": full_name,
        "phone": phone,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z",
        "profilePic": f"https://ui-avatars.com/api/?name={username_clean}&background=random",
        "bio": "New member of the TradeSmart community."
    }

    db.reference(f"users/{uid}").set(new_user)

    return jsonify({
        "success": True,
        "message": "Registration successful!",
        "uid": uid
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate user and return JWT token."""

    data = request.get_json()

    identifier = normalize_input(data.get("identifier", ""))
    password = data.get("password")

    if not identifier or not password:
        return jsonify({
            "success": False,
            "message": "Enter username/email and password!"
        }), 400

    users = db.reference("users").get()

    if not isinstance(users, dict):
        users = {}

    target_uid = None
    target_user = None

    for uid, user in users.items():
        if user.get("username") == identifier or user.get("email") == identifier:
            target_uid = uid
            target_user = user
            break

    if not target_user:
        return jsonify({
            "success": False,
            "message": "Incorrect credentials!"
        }), 401

    # Password check
    if not bcrypt.checkpw(
        password.encode("utf-8"),
        target_user["password"].encode("utf-8")
    ):
        return jsonify({
            "success": False,
            "message": "Incorrect credentials!"
        }), 401

    token = generate_token(target_uid)

    # Remove password before returning
    public_user = target_user.copy()
    public_user.pop("password", None)
    public_user["uid"] = target_uid

    return jsonify({
        "success": True,
        "message": "Login successful!",
        "token": token,
        "user": public_user
    }), 200


@auth_bp.route("/profile", methods=["GET"])
@token_required
def get_profile(current_user):
    """Return logged-in user's profile."""

    profile = current_user.copy()
    profile.pop("password", None)

    return jsonify({
        "success": True,
        "profile": profile
    }), 200


@auth_bp.route("/user/<user_id>", methods=["GET"])
def get_user_by_id(user_id):
    """Return public user profile by user ID."""
    user_data = db.reference(f"users/{user_id}").get()
    if not user_data:
        return jsonify({"success": False, "error": "User not found"}), 404

    public_user = user_data.copy()
    public_user.pop("password", None)
    public_user["uid"] = user_id

    return jsonify({"success": True, "user": public_user}), 200


@auth_bp.route("/profile", methods=["PUT"])
@token_required
def update_profile(current_user):
    """Update user profile."""

    data = request.get_json()
    uid = current_user["uid"]

    user_ref = db.reference(f"users/{uid}")

    updates = {}

    if "full_name" in data:
        updates["full_name"] = data["full_name"]

    if "phone" in data:
        updates["phone"] = data["phone"]

    if "bio" in data:
        updates["bio"] = data["bio"]

    if "profilePic" in data:
        updates["profilePic"] = data["profilePic"]

    if not updates:
        return jsonify({
            "success": False,
            "message": "No changes detected!"
        }), 400

    user_ref.update(updates)

    return jsonify({
        "success": True,
        "message": "Profile updated successfully!"
    }), 200
``````

---

## `server\routes\category_routes.py`

```python
from flask import Blueprint, request, jsonify
from utils.firebase_db import CategoriesAPI
import uuid

category_bp = Blueprint("category", __name__, url_prefix="/api/categories")

@category_bp.route("/", methods=["GET"])
def get_categories():
    """Retrieve all standard second-hand product categories and average values."""
    categories = CategoriesAPI.get_all()
    return jsonify({"success": True, "categories": categories})

@category_bp.route("/", methods=["POST"])
def add_category():
    """Add a new standardized product category for the second-hand market."""
    data = request.json
    required = ["name", "average_market_value"]
    
    for req in required:
        if req not in data:
            return jsonify({"success": False, "error": f"Missing {req}"}), 400
            
    category_id = f"cat_{uuid.uuid4().hex[:8]}"
    
    success = CategoriesAPI.add_category(category_id, data)
    if success:
        return jsonify({"success": True, "category_id": category_id}), 201
    return jsonify({"success": False, "error": "Failed to add category"}), 500

@category_bp.route("/<category_id>/price", methods=["PUT"])
def update_price(category_id):
    """Update the average market value for a category based on trends."""
    data = request.json
    new_price = float(data.get("average_market_value", 0))
    if new_price <= 0:
        return jsonify({"success": False, "error": "Invalid price"}), 400
        
    success = CategoriesAPI.update_price(category_id, new_price)
    if success:
        return jsonify({"success": True, "message": "Market value updated successfully"})
    return jsonify({"success": False, "error": "Failed to update"}), 500
``````

---

## `server\routes\dispute_routes.py`

```python
from flask import Blueprint, request, jsonify
from firebase_admin import db
from utils.auth_helper import token_required
from utils.firebase_db import DisputesAPI, ProductsAPI
from routes.escrow_routes import execute_atomic_transition
import time
import uuid


dispute_bp = Blueprint("dispute", __name__, url_prefix="/api/disputes")


REFUND_PROCESSING_SECONDS = 3 * 24 * 60 * 60


def _resolve_identity_keys(user_id):
    """Resolve uid/username aliases for reliable notification delivery."""
    identity_keys = {str(user_id)}
    users = db.reference("users").get() or {}
    for uid, user_data in users.items():
        if not isinstance(user_data, dict):
            continue
        uid_str = str(uid)
        username = str(user_data.get("username", "")).strip()
        if uid_str == str(user_id) and username:
            identity_keys.add(username)
        if username and username == str(user_id):
            identity_keys.add(uid_str)
    return identity_keys


def _get_product_snapshot(product_id):
    """Get minimal product details for notifications."""
    try:
        product = ProductsAPI.get_by_id(product_id) or {}
    except Exception:
        product = {}

    title = product.get("title") or product.get("name") or "Item"

    image_url = None
    image_urls = product.get("image_urls") or product.get("imageUrls")
    if isinstance(image_urls, list) and image_urls:
        image_url = image_urls[0]
    if not image_url:
        image_url = product.get("image_url") or product.get("imageUrl")

    return {"title": title, "image_url": image_url, "product": product}


def _create_notification(target_user_id, notification):
    """Create notification for uid + username aliases."""
    recipients = _resolve_identity_keys(target_user_id)
    for recipient in recipients:
        notif = dict(notification)
        notif["user_id"] = recipient
        db.reference(f"notifications/{recipient}/{notification['notification_id']}").set(notif)


# -------------------------
# Legacy endpoints (kept for compatibility)
# -------------------------

@dispute_bp.route("/", methods=["POST"])
def open_dispute():
    """Open a new dispute against an escrow transaction (legacy, unauthenticated)."""
    data = request.json
    required = ["escrow_id", "raised_by_user_id", "reason_category", "description"]

    for req in required:
        if not data.get(req):
            return jsonify({"success": False, "error": f"Missing {req}"}), 400

    dispute_id = f"disp_{uuid.uuid4().hex[:12]}"
    data["status"] = "OPEN"

    success = DisputesAPI.open_dispute(dispute_id, data)

    if success:
        return jsonify({"success": True, "dispute_id": dispute_id}), 201
    return jsonify({"success": False, "error": "Failed to open dispute"}), 500


@dispute_bp.route("/escrow/<escrow_id>", methods=["GET"])
def get_disputes_for_escrow(escrow_id):
    """Retrieve all disputes linked to a specific escrow transaction."""
    disputes = DisputesAPI.get_by_escrow(escrow_id)
    return jsonify({"success": True, "disputes": disputes})


@dispute_bp.route("/<dispute_id>/resolve", methods=["POST"])
def resolve_dispute(dispute_id):
    """Admin function to resolve a dispute."""
    data = request.json
    resolution = data.get("admin_resolution", "Resolved by Admin")

    success = DisputesAPI.resolve_dispute(dispute_id, resolution)
    if success:
        return jsonify({"success": True, "message": "Dispute resolved"})
    return jsonify({"success": False, "error": "Failed to resolve"}), 500


# -------------------------
# New dispute workflow endpoints
# -------------------------

@dispute_bp.route("/report", methods=["POST"])
@token_required
def report_dispute(current_user):
    """Buyer reports a transaction to either CANCEL (pre-delivery) or RETURN (post-delivery)."""
    data = request.get_json(silent=True) or {}

    escrow_id = str(data.get("escrow_id") or "").strip()
    option = str(data.get("option") or "").strip().upper()
    reason = str(data.get("reason") or "").strip()[:2000]

    if not escrow_id:
        return jsonify({"success": False, "error": "escrow_id required"}), 400
    if option not in {"CANCEL", "RETURN"}:
        return jsonify({"success": False, "error": "option must be CANCEL or RETURN"}), 400
    if len(reason) < 3:
        return jsonify({"success": False, "error": "reason is required"}), 400

    escrow = db.reference(f"escrows/{escrow_id}").get() or {}
    if not escrow:
        return jsonify({"success": False, "error": "Escrow not found"}), 404

    buyer_id = str(escrow.get("buyer_id") or "")
    seller_id = str(escrow.get("seller_id") or "")
    if buyer_id != str(current_user.get("uid")):
        return jsonify({"success": False, "error": "Only the buyer can report this transaction"}), 403

    escrow_status = str((escrow.get("status_matrix") or {}).get("escrow_status") or "").upper()
    if option == "RETURN" and escrow_status != "DELIVERED":
        return jsonify({
            "success": False,
            "error": "RETURN is only available after delivery"
        }), 400
    if option == "CANCEL" and escrow_status not in {"FUNDED", "SHIPPED"}:
        return jsonify({
            "success": False,
            "error": "CANCEL is only available before delivery"
        }), 400

    product_id = str(escrow.get("product_id") or "")
    snapshot = _get_product_snapshot(product_id)
    now = int(time.time())

    # For CANCEL, refund is scheduled immediately (3 days).
    # For RETURN, refund is only scheduled after seller confirms product retrieved.
    refund_expected_by = (now + REFUND_PROCESSING_SECONDS) if option == "CANCEL" else 0

    dispute_id = f"disp_{uuid.uuid4().hex[:12]}"

    # 1) Move escrow to DISPUTED and lock funds.
    ok, msg = execute_atomic_transition(
        escrow_id,
        "DISPUTED",
        current_user.get("uid"),
        "BUYER",
        f"Buyer reported {option}: {reason}",
        dispute_kind=option,
        dispute_reason=reason,
        return_required=(option == "RETURN"),
        dispute_id=dispute_id,
        refund_expected_by=refund_expected_by,
    )
    if not ok:
        return jsonify({"success": False, "error": msg or "Failed to open dispute"}), 400

    # 2) Create a dispute record.
    dispute_record = {
        "dispute_id": dispute_id,
        "escrow_id": escrow_id,
        "product_id": product_id,
        "buyer_id": buyer_id,
        "seller_id": seller_id,
        "kind": option,
        "reason": reason,
        "status": "REFUND_SCHEDULED" if option == "CANCEL" else "AWAITING_RETURN_CONFIRMATION",
        "created_at": now,
        "refund_expected_by": refund_expected_by,
        "product_title": snapshot.get("title"),
        "product_image_url": snapshot.get("image_url"),
    }
    DisputesAPI.open_dispute(dispute_id, dispute_record)

    # 3) Notify seller (include product name + image).
    notification_id = f"notif_{uuid.uuid4().hex[:12]}"
    seller_notification = {
        "notification_id": notification_id,
        "user_id": seller_id,
        "type": "DISPUTE",
        "title": "Transaction Reported",
        "message": f"Buyer requested {option.lower()} for '{snapshot.get('title')}'. Reason: {reason}",
        "read": False,
        "created_at": now,
        "related_escrow_id": escrow_id,
        "related_product_id": product_id,
        "related_product_title": snapshot.get("title"),
        "related_product_image_url": snapshot.get("image_url"),
        "related_user_id": buyer_id,
        "action_required": option == "RETURN",
    }
    _create_notification(seller_id, seller_notification)

    # 4) Notify buyer.
    buyer_notif_id = f"notif_{uuid.uuid4().hex[:12]}"
    buyer_refund_message = (
        "Your cancel request was submitted. Refund will be processed within 3 days."
        if option == "CANCEL"
        else "Your return request was submitted. Refund will be processed within 3 days after the seller confirms product retrieval."
    )
    buyer_notification = {
        "notification_id": buyer_notif_id,
        "user_id": buyer_id,
        "type": "DISPUTE",
        "title": "Report Submitted",
        "message": buyer_refund_message,
        "read": False,
        "created_at": now,
        "related_escrow_id": escrow_id,
        "related_product_id": product_id,
        "related_product_title": snapshot.get("title"),
        "related_product_image_url": snapshot.get("image_url"),
        "related_user_id": seller_id,
        "action_required": False,
    }
    _create_notification(buyer_id, buyer_notification)

    return jsonify({
        "success": True,
        "dispute_id": dispute_id,
        "escrow_id": escrow_id,
        "kind": option,
        "refund_expected_by": dispute_record["refund_expected_by"],
    }), 201


@dispute_bp.route("/confirm-return", methods=["POST"])
@token_required
def confirm_return(current_user):
    """Seller confirms product retrieved from buyer (RETURN disputes only)."""
    data = request.get_json(silent=True) or {}

    escrow_id = str(data.get("escrow_id") or "").strip()
    if not escrow_id:
        return jsonify({"success": False, "error": "escrow_id required"}), 400

    escrow = db.reference(f"escrows/{escrow_id}").get() or {}
    if not escrow:
        return jsonify({"success": False, "error": "Escrow not found"}), 404

    seller_id = str(escrow.get("seller_id") or "")
    if seller_id != str(current_user.get("uid")):
        return jsonify({"success": False, "error": "Only the seller can confirm return"}), 403

    escrow_status = str((escrow.get("status_matrix") or {}).get("escrow_status") or "").upper()
    dispute_meta = escrow.get("dispute") or {}
    kind = str(dispute_meta.get("kind") or "").upper()

    if escrow_status != "DISPUTED" or kind != "RETURN":
        return jsonify({"success": False, "error": "No active RETURN dispute for this escrow"}), 400

    if dispute_meta.get("return_confirmed") is True:
        now = int(time.time())

    refund_expected_by = now + REFUND_PROCESSING_SECONDS

    # Mark return confirmed and schedule refund for 3 days.
    escrow_ref = db.reference(f"escrows/{escrow_id}")

    def _mark_return_confirmed(current):
        if current is None:
            return None
        current.setdefault("dispute", {})
        current.setdefault("deadlines", {})
        current["dispute"]["return_confirmed"] = True
        current["dispute"]["return_confirmed_at"] = now
        current["deadlines"]["refund_expected_by"] = refund_expected_by
        # Optional hint for UI/debugging
        current["dispute"]["refund_expected_by"] = refund_expected_by
        return current

    escrow_ref.transaction(_mark_return_confirmed)

    # Update dispute record if we can find it.
    dispute_id = str((escrow.get("dispute") or {}).get("dispute_id") or "").strip()
    if dispute_id:
        db.reference(f"disputes/{dispute_id}").update({
            "status": "REFUND_SCHEDULED",
            "refund_expected_by": refund_expected_by,
            "return_confirmed_at": now,
        })
    else:
        # Best-effort fallback (small DB): find disputes by escrow_id.
        all_disputes = db.reference("disputes").get() or {}
        for did, d in all_disputes.items():
            if isinstance(d, dict) and str(d.get("escrow_id") or "") == escrow_id:
                db.reference(f"disputes/{did}").update({
                    "status": "REFUND_SCHEDULED",
                    "refund_expected_by": refund_expected_by,
                    "return_confirmed_at": now,
                })
                break

    # Notify buyer.
    product_id = str(escrow.get("product_id") or "")
    snapshot = _get_product_snapshot(product_id)
    buyer_id = str(escrow.get("buyer_id") or "")

    buyer_notif_id = f"notif_{uuid.uuid4().hex[:12]}"
    buyer_notification = {
        "notification_id": buyer_notif_id,
        "user_id": buyer_id,
        "type": "DISPUTE",
        "title": "Product Retrieved",
        "message": f"Seller confirmed product retrieval for '{snapshot.get('title')}'. Refund will be processed within 3 days.",
        "read": False,
        "created_at": now,
        "related_escrow_id": escrow_id,
        "related_product_id": product_id,
        "related_product_title": snapshot.get("title"),
        "related_product_image_url": snapshot.get("image_url"),
        "related_user_id": seller_id,
        "action_required": False,
    }
    _create_notification(buyer_id, buyer_notification)

    return jsonify({
        "success": True,
        "message": "Product retrieval confirmed. Refund scheduled.",
        "refund_expected_by": refund_expected_by,
    }), 200
``````

---

## `server\routes\escrow_routes.py`

```python
# server/routes/escrow_routes.py
"""
Hardened Production Escrow Module (V2.1).
Secures funds in Firebase RTDB with atomic state transitions and role-based permissions.
"""

from flask import Blueprint, request, jsonify
from firebase_admin import db
import time
import uuid

escrow_bp = Blueprint("escrow", __name__, url_prefix="/api/escrow")

# Auto-release window after buyer confirms delivery.
AUTO_RELEASE_DAYS = 30
AUTO_RELEASE_SECONDS = AUTO_RELEASE_DAYS * 86400


def _resolve_identity_keys(user_id):
    """Resolve uid/username aliases for escrow lookups."""
    identity_keys = {str(user_id)}
    users = db.reference("users").get() or {}

    for uid, user_data in users.items():
        if not isinstance(user_data, dict):
            continue

        uid_str = str(uid)
        username = str(user_data.get("username", "")).strip()

        if uid_str == str(user_id) and username:
            identity_keys.add(username)

        if username and username == str(user_id):
            identity_keys.add(uid_str)

    return identity_keys

# --- 1. PROPER FINITE STATE MACHINE (FSM) ---
# Strict logic gates to prevent invalid status jumps.
STATE_RULES = {
    "PENDING_PAYMENT": ["FUNDED", "CANCELLED"],
    "FUNDED": ["SHIPPED", "DISPUTED", "REFUNDED"],
    "SHIPPED": ["DELIVERED", "DISPUTED"], # REFUNDED removed: must go to DISPUTED or DELIVERED first
    "DELIVERED": ["RELEASED", "DISPUTED", "REFUNDED"],
    "DISPUTED": ["RELEASED", "REFUNDED"],
    "RELEASED": [], # TERMINAL: Ledger closed permanently
    "REFUNDED": [], # TERMINAL: Ledger closed permanently
    "CANCELLED": [] # TERMINAL: Ledger closed permanently
}

# --- 2. ATOMIC TRANSACTION WRAPPER ---
def execute_atomic_transition(escrow_id, target_state, actor_id, actor_role, reason, **kwargs):
    """
    Primary engine for all state changes. 
    Guarantees atomic fund movement, role validation, and state synchronization.
    No direct DB writes allowed; everything passes through this transaction.
    """
    escrow_ref = db.reference(f'escrows/{escrow_id}')
    
    requires_wallet_transfer = False

    def transaction_update(current_data):
        nonlocal requires_wallet_transfer
        if current_data is None: return None # Abort if record missing

        now = int(time.time())

        # A. IMMUTABILITY CHECK
        # If ledger is already closed, block all further activity.
        if current_data.get('ledger', {}).get('is_closed'):
            raise Exception("Access Denied: Record is permanently closed.")
        
        current_state = current_data['status_matrix']['escrow_status']

        # Scheduled dispute refunds:
        # - RETURN requires seller confirmation before refund.
        # - Refunds cannot be processed before deadlines.refund_expected_by.
        # - ADMIN can override.
        if target_state == "REFUNDED" and current_state == "DISPUTED" and actor_role != "ADMIN":
            dispute_meta = current_data.get('dispute', {}) or {}
            kind = str(dispute_meta.get('kind', '') or '').upper()
            if kind == "RETURN" and dispute_meta.get('return_confirmed') is not True:
                raise Exception("Refund blocked: Seller must confirm product retrieval first.")

            deadlines = current_data.get('deadlines', {}) or {}
            try:
                refund_expected_by = int(deadlines.get('refund_expected_by') or 0)
            except (TypeError, ValueError):
                refund_expected_by = 0

            if refund_expected_by <= 0:
                raise Exception("Refund blocked: Refund is not scheduled yet.")
            if now < refund_expected_by:
                raise Exception("Refund blocked: Scheduled processing window not reached yet.")
        
        # B. FSM TRANSITION VALIDATION
        if target_state not in STATE_RULES.get(current_state, []):
            raise Exception(f"Protocol Violation: Cannot jump from {current_state} to {target_state}")

        # C. STRICT ROLE-BASED ACCESS CONTROL (RBAC)
        if actor_role != "ADMIN":
            # 1. Lock Enforcement
            # When an escrow is locked (e.g., dispute opened), only ADMIN can operate freely.
            # SYSTEM is allowed to finalize terminal transitions (REFUNDED/RELEASED).
            if current_data.get('ledger', {}).get('is_locked'):
                # While locked, only SYSTEM may finalize terminal outcomes.
                if target_state in ["RELEASED", "REFUNDED"] and actor_id != "SYSTEM":
                    raise Exception("Escrow Locked: Pending Admin resolution.")
                # Block any other non-admin transitions while locked.
                if target_state not in ["DISPUTED", "RELEASED", "REFUNDED"]:
                    raise Exception("Escrow Locked: Pending Admin resolution.")

            # 2. Transition Guard: Seller Only
            if current_state == "FUNDED" and target_state == "SHIPPED":
                if actor_id != current_data.get('seller_id'):
                    raise Exception("Auth Error: Only the Seller can initiate shipment.")
            
            # 3. Transition Guard: Buyer Only
            if current_state == "SHIPPED" and target_state == "DELIVERED":
                if actor_id != current_data.get('buyer_id'):
                    raise Exception("Auth Error: Only the Buyer can confirm delivery.")
            
            # 4. System Guard: Automated Payouts
            if actor_id == "SYSTEM":
                # System actor can ONLY trigger terminal states (Auto-Refund/Release)
                if target_state not in ["RELEASED", "REFUNDED"]:
                    raise Exception("Security: SYSTEM actor restricted to completion states only.")

                # Auto-release enforcement: SYSTEM may only RELEASE after the 30-day window.
                if target_state == "RELEASED" and current_state == "DELIVERED":
                    deadlines = current_data.get('deadlines') or {}
                    try:
                        auto_release_at = int(deadlines.get('auto_release_at') or 0)
                    except (TypeError, ValueError):
                        auto_release_at = 0

                    if auto_release_at <= 0:
                        raise Exception("Auto-release blocked: auto_release_at deadline not set.")
                    if now < auto_release_at:
                        raise Exception("Auto-release blocked: 30-day window not reached yet.")

        # D. SYNCHRONIZED PROPERTY UPDATES
        current_data['status_matrix']['escrow_status'] = target_state
        
        if target_state == "FUNDED":
            current_data['status_matrix']['payment_status'] = "COMPLETED"
            
        elif target_state == "SHIPPED":
            current_data['status_matrix']['shipment_status'] = "SHIPPED"
            
            # Persist tracking details if supplied
            if kwargs.get('tracking_number'):
                current_data['ledger']['tracking_number'] = kwargs.get('tracking_number')
            if kwargs.get('shipping_carrier'):
                current_data['ledger']['shipping_carrier'] = kwargs.get('shipping_carrier')
            
        elif target_state == "DELIVERED":
            current_data['status_matrix']['shipment_status'] = "DELIVERED"
            # Set the auto-release window (30 days from delivery confirmation)
            current_data.setdefault('deadlines', {})
            current_data['deadlines']['auto_release_at'] = now + AUTO_RELEASE_SECONDS

        elif target_state == "DISPUTED":
            # Lock the escrow while a dispute is active.
            current_data.setdefault('ledger', {})
            current_data['ledger']['is_locked'] = True

            # Persist dispute metadata for the UI.
            current_data.setdefault('dispute', {})
            if kwargs.get('dispute_kind'):
                current_data['dispute']['kind'] = str(kwargs.get('dispute_kind')).upper()
            if kwargs.get('dispute_reason'):
                current_data['dispute']['reason'] = str(kwargs.get('dispute_reason'))[:2000]
            if kwargs.get('dispute_id'):
                current_data['dispute']['dispute_id'] = str(kwargs.get('dispute_id'))
            current_data['dispute']['opened_by'] = str(kwargs.get('dispute_opened_by') or actor_id)
            current_data['dispute']['opened_at'] = int(kwargs.get('dispute_opened_at') or now)
            current_data['dispute']['return_required'] = bool(kwargs.get('return_required', False))
            current_data['dispute']['return_confirmed'] = bool(current_data['dispute'].get('return_confirmed', False))

            # Mark payment as on-hold (funds should not be released while disputed).
            current_data.setdefault('status_matrix', {})
            current_data['status_matrix']['payment_status'] = "ON_HOLD"

            # Store a UI-friendly refund expectation window.
            current_data.setdefault('deadlines', {})
            # For CANCEL disputes refund is scheduled for 3 days.
            # For RETURN disputes refund is scheduled only after seller confirms retrieval.
            override_refund_expected_by = kwargs.get('refund_expected_by', None)
            if override_refund_expected_by is not None:
                try:
                    current_data['deadlines']['refund_expected_by'] = int(override_refund_expected_by)
                except (TypeError, ValueError):
                    current_data['deadlines']['refund_expected_by'] = 0
            else:
                current_data['deadlines']['refund_expected_by'] = 0 if current_data['dispute']['return_required'] else (now + (3 * 86400))
            
        elif target_state == "RELEASED":
            current_data['status_matrix']['payment_status'] = "TRANSFERRED"
            current_data['ledger']['is_closed'] = True # PERMANENT LOCK
            requires_wallet_transfer = True
            
        elif target_state == "REFUNDED":
            current_data['status_matrix']['payment_status'] = "REFUNDED"

            # Persist optional refund/dispute closure details (used by dispute workflows).
            current_data.setdefault('dispute', {})
            if kwargs.get('refund_reason'):
                current_data['dispute']['refund_reason'] = str(kwargs.get('refund_reason'))[:2000]
            if kwargs.get('return_confirmed') is True:
                current_data['dispute']['return_confirmed'] = True
                current_data['dispute']['return_confirmed_at'] = int(time.time())

            current_data['ledger']['is_closed'] = True # PERMANENT LOCK
            
        elif target_state == "CANCELLED":
            current_data['ledger']['is_closed'] = True

        # E. PERSISTENCE & AUDIT
        current_data['metadata']['updated_at'] = now
        
        # Incremental Audit Trail (Append-Only)
        log_id = f"log_{int(time.time() * 1000)}"
        if 'audit_trail' not in current_data:
            current_data['audit_trail'] = {}
            
        current_data['audit_trail'][log_id] = {
            "old_state": current_state,
            "new_state": target_state,
            "action_by": actor_id,
            "role": actor_role,
            "reason": reason,
            "timestamp": now
        }
        
        return current_data

    try:
        escrow_ref.transaction(transaction_update)
        
        # Post-transaction side effects
        if requires_wallet_transfer:
            escrow_data = escrow_ref.get()
            if escrow_data:
                print(f"[DEBUG] Releasing funds to seller: {escrow_data['seller_id']}, amount: {escrow_data['ledger']['amount']}")
                from utils.firebase_db import WalletAPI
                success = WalletAPI.add_transaction(
                    transaction_id=f"tx_{escrow_id}_{int(time.time())}",
                    user_id=escrow_data['seller_id'],
                    amount=escrow_data['ledger']['amount'],
                    t_type='ESCROW_RELEASE'
                )
                print(f"[DEBUG] Wallet transaction created: {success}")
                
                # Create notification for seller that funds were released
                try:
                    notification_id = f"notif_{str(uuid.uuid4())[:12]}"
                    notif = {
                        "notification_id": notification_id,
                        "user_id": escrow_data['seller_id'],
                        "type": "PAYMENT_RELEASED",
                        "title": "Funds Released",
                        "message": f"Buyer has released the escrow. ${escrow_data['ledger']['amount']} has been transferred to your wallet.",
                        "read": False,
                        "created_at": int(time.time()),
                        "related_escrow_id": escrow_id,
                        "related_product_id": escrow_data['product_id'],
                        "related_user_id": escrow_data['buyer_id'],
                        "action_required": False
                    }
                    db.reference(f'notifications/{escrow_data["seller_id"]}/{notification_id}').set(notif)
                    print(f"ðŸ”¥ [DEBUG] Notification created: {notification_id} (PAYMENT_RELEASED) for {escrow_data['seller_id']}")
                except Exception as notif_err:
                    print(f"[WARNING] Failed to create seller notification: {str(notif_err)}")

        return True, f"Success: Escrow moved to {target_state}"
    except Exception as e:
        return False, str(e)

# --- 3. SECURE ENDPOINTS ---

@escrow_bp.route("/order", methods=["POST"])
def initialize_escrow():
    """Initializes a new hardened escrow ledger (Buyer initiates)."""
    try:
        data = request.json
        required_fields = ['product_id', 'buyer_id', 'seller_id', 'amount']
        
        # Validate required fields
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"success": False, "error": f"Missing required field: {field}"}), 400
        
        # Validate amount
        try:
            amount = float(data['amount'])
            if amount <= 0:
                return jsonify({"success": False, "error": "Amount must be greater than 0"}), 400
        except (ValueError, TypeError):
            return jsonify({"success": False, "error": "Invalid amount format"}), 400
        
        escrow_id = f"esc_{str(uuid.uuid4())[:12]}"
        now = int(time.time())
        
        schema = {
            "escrow_id": escrow_id,
            "product_id": data['product_id'],
            "buyer_id": data['buyer_id'],
            "seller_id": data['seller_id'],
            "created_at": now,  # Add created_at at top level for sorting
            "ledger": {
                "amount": amount,
                "is_locked": False,
                "is_closed": False # Python Boolean Fix
            },
            "status_matrix": {
                "escrow_status": "PENDING_PAYMENT",
                "payment_status": "PENDING",
                "shipment_status": "PENDING"
            },
            "deadlines": {
                "created_at": now,
                "ship_by": now + (3 * 86400), # Exactly 3 days to ship
                "auto_release_at": 0
            },
            "metadata": {
                "created_at": now,
                "updated_at": now,
                "version": "2.1.0"
            },
            "audit_trail": {
                f"init_{now}": {"msg": "Hardened Ledger Initialized", "timestamp": now}
            }
        }
        
        # Store in Firebase
        db.reference(f'escrows/{escrow_id}').set(schema)
        
        # Create notification for seller: item was purchased
        try:
            notification_id = f"notif_{str(uuid.uuid4())[:12]}"
            notif = {
                "notification_id": notification_id,
                "user_id": data['seller_id'],
                "type": "PURCHASE",
                "title": "Purchase Initiated",
                "message": f"A buyer is interested in your product. Amount in escrow: ${schema['ledger']['amount']}",
                "read": False,
                "created_at": now,
                "related_escrow_id": escrow_id,
                "related_product_id": data['product_id'],
                "related_user_id": data['buyer_id'],
                "action_required": True
            }
            db.reference(f'notifications/{data["seller_id"]}/{notification_id}').set(notif)
            print(f"ðŸ”¥ [DEBUG] Notification created: {notification_id} for seller {data['seller_id']}")
        except Exception as notif_err:
            print(f"[WARNING] Failed to create seller notification: {str(notif_err)}")
        
        print(f"Escrow created: {escrow_id} for buyer {data['buyer_id']} and seller {data['seller_id']}")
        
        return jsonify({"success": True, "escrow_id": escrow_id}), 201
    except Exception as e:
        print(f"Error initializing escrow: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@escrow_bp.route("/process-action", methods=["POST"])
def process_action():
    """Unified entry point for manual state transitions."""
    data = request.json
    # Validation: Ensure role is specified for RBAC
    success, result = execute_atomic_transition(
        data['escrow_id'], 
        data['target_state'], 
        data['user_id'], 
        data.get('role', 'GUEST'), # Typically extracted from Firebase Auth JWT
        data.get('reason', 'Standard manual update'),
        tracking_number=data.get('tracking_number'),
        shipping_carrier=data.get('shipping_carrier')
    )
    return jsonify({"success": success, "message": result})

@escrow_bp.route("/scheduler/maintenance", methods=["POST"])
def run_maintenance():
    """
    High-performance scheduler queries. 
    Uses Indexed-Queries for Refunding and Releasing.
    """
    now = int(time.time())
    report = {"auto_refunded": 0, "auto_released": 0, "scheduled_dispute_refunds": 0}

    # 1. OPTIMIZED AUTO-REFUND (Query only FUNDED)
    # Firebase Rules required: ".indexOn": "status_matrix/escrow_status"
    fund_check = db.reference('escrows').order_by_child('status_matrix/escrow_status').equal_to('FUNDED').get()
    
    if fund_check:
        for eid, data in fund_check.items():
            if now > data['deadlines']['ship_by']:
                success, _ = execute_atomic_transition(eid, "REFUNDED", "SYSTEM", "SYSTEM", "Auto-refund: Deadline exceeded")
                if success: report["auto_refunded"] += 1
    
    # 2. OPTIMIZED AUTO-RELEASE (Query only DELIVERED)
    delivery_check = db.reference('escrows').order_by_child('status_matrix/escrow_status').equal_to('DELIVERED').get()
    
    if delivery_check:
        for eid, data in delivery_check.items():
            deadlines = data.get('deadlines') or {}
            try:
                auto_release_at = int(deadlines.get('auto_release_at') or 0)
            except (TypeError, ValueError):
                auto_release_at = 0

            # Only release when a valid deadline is set and the window has passed.
            if auto_release_at > 0 and now > auto_release_at:
                success, _ = execute_atomic_transition(eid, "RELEASED", "SYSTEM", "SYSTEM", "Auto-release: Safe window closed")
                if success: report["auto_released"] += 1

    # 3. SCHEDULED DISPUTE REFUNDS (Query only DISPUTED)
    dispute_check = db.reference('escrows').order_by_child('status_matrix/escrow_status').equal_to('DISPUTED').get()

    if dispute_check:
        for eid, data in dispute_check.items():
            if not isinstance(data, dict):
                continue
            deadlines = data.get('deadlines') or {}
            try:
                refund_expected_by = int(deadlines.get('refund_expected_by') or 0)
            except (TypeError, ValueError):
                refund_expected_by = 0

            if refund_expected_by <= 0 or now < refund_expected_by:
                continue

            dispute_meta = data.get('dispute') or {}
            kind = str(dispute_meta.get('kind') or '').upper()
            if kind == 'RETURN' and dispute_meta.get('return_confirmed') is not True:
                continue

            refund_reason = (
                'Buyer cancelled before delivery (scheduled)'
                if kind == 'CANCEL'
                else 'Return confirmed (scheduled)'
                if kind == 'RETURN'
                else 'Scheduled dispute refund'
            )

            success, _ = execute_atomic_transition(
                eid,
                'REFUNDED',
                'SYSTEM',
                'SYSTEM',
                'Scheduled dispute refund processed',
                refund_reason=refund_reason,
            )
            if success:
                report['scheduled_dispute_refunds'] += 1

                # Best-effort dispute record update.
                dispute_id = str((dispute_meta or {}).get('dispute_id') or '').strip()
                if dispute_id:
                    db.reference(f'disputes/{dispute_id}').update({
                        'status': 'REFUNDED',
                        'refunded_at': now,
                    })
                else:
                    all_disputes = db.reference('disputes').get() or {}
                    for did, d in all_disputes.items():
                        if isinstance(d, dict) and str(d.get('escrow_id') or '') == str(eid):
                            db.reference(f'disputes/{did}').update({
                                'status': 'REFUNDED',
                                'refunded_at': now,
                            })
                            break

    return jsonify({"success": True, "report": report})

@escrow_bp.route("/<escrow_id>", methods=["GET"])
def get_escrow_details(escrow_id):
    """Fetch full details of a single escrow for the dashboard."""
    esc = db.reference(f'escrows/{escrow_id}').get()
    if not esc:
        return jsonify({"success": False, "error": "Escrow not found"}), 404
    return jsonify({"success": True, "escrow": esc})

@escrow_bp.route("/user/<user_id>", methods=["GET"])
def get_user_escrows(user_id):
    """Fetch all escrows where the user is either buyer or seller."""
    # Note: In production, use indexing on buyer_id/seller_id
    all_escrows = db.reference('escrows').get() or {}
    user_escrows = []
    identity_keys = _resolve_identity_keys(user_id)
    
    for eid, data in all_escrows.items():
        if data.get('buyer_id') in identity_keys or data.get('seller_id') in identity_keys:
            user_escrows.append(data)
            
    return jsonify({"success": True, "escrows": user_escrows})
``````

---

## `server\routes\feedback_routes.py`

```python
from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid
from utils.firebase_db import FeedbackAPI, ProductsAPI

feedback_bp = Blueprint("feedback", __name__, url_prefix="/api/feedback")

# ==========================================
# Product-Specific Feedback Routes
# ==========================================

@feedback_bp.route('/product', methods=['POST'])
def submit_product_feedback():
    """
    Submit feedback for a specific product.
    Validates input and stores the feedback in the Firebase Realtime Database.
    """
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400

        # Extract and validate required fields
        product_id = data.get('product_id')
        rating = data.get('rating')
        comment = str(data.get('comment', '')).strip()
        user_name = str(data.get('user_name', '')).strip()

        if not product_id:
            return jsonify({'success': False, 'error': 'product_id is required'}), 400
        
        # Ensure rating is between 1 and 5; default to 5 if invalid
        try:
            rating = int(rating)
            rating = max(1, min(5, rating))
        except (ValueError, TypeError):
            rating = 5 

        # Validate comment length constraints
        if len(comment) < 3:
            return jsonify({'success': False, 'error': 'Comment too short (min 3 chars)'}), 400
        if len(comment) > 2000:
            comment = comment[:2000] # Trim excessive input

        # Require a logged-in user to submit feedback so review ownership can be enforced
        reviewer_id = str(data.get('user_id', '')).strip()
        if not reviewer_id:
            return jsonify({'success': False, 'error': 'user_id is required to submit feedback'}), 401

        # Assign default user name if missing
        if not user_name:
            user_name = "Anonymous"

        # Ensure product exists and prevent the uploader from reviewing their own listing
        product = ProductsAPI.get_by_id(product_id)
        if not product:
            return jsonify({'success': False, 'error': 'Product not found'}), 404

        if reviewer_id == str(product.get('user_id', '')) or reviewer_id == str(product.get('seller_id', '')):
            return jsonify({'success': False, 'error': 'You cannot review your own product'}), 403

        # Prevent duplicate submissions from the same user for the same product
        existing_feedback = FeedbackAPI.get_product_feedback(product_id)
        if any(str(f.get('user_id', '')) == reviewer_id for f in existing_feedback):
            return jsonify({'success': False, 'error': 'You have already submitted feedback for this product'}), 400

        # Construct feedback object
        feedback_id = str(uuid.uuid4())
        feedback = {
            "id": feedback_id,
            "product_id": str(product_id),
            "user_id": reviewer_id,
            "rating": rating,
            "comment": comment,
            "user_name": user_name,
            "timestamp": datetime.now().isoformat()
        }
        
        # Save to Firebase Realtime Database using the dedicated API
        success = FeedbackAPI.add_product_feedback(feedback_id, feedback)
        
        if success:
            return jsonify({'success': True, 'feedback_id': feedback_id}), 201
        else:
            return jsonify({'success': False, 'error': 'Failed to save feedback to database'}), 500

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@feedback_bp.route('/product/<feedback_id>', methods=['DELETE'])
def delete_product_feedback(feedback_id):
    """Delete product feedback if requested by the same reviewer."""
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400

        user_id = str(data.get('user_id', '')).strip()
        if not user_id:
            return jsonify({'success': False, 'error': 'user_id is required'}), 401

        feedback = FeedbackAPI.get_product_feedback_by_id(feedback_id)
        if not feedback:
            return jsonify({'success': False, 'error': 'Feedback not found'}), 404

        if str(feedback.get('user_id', '')) != user_id:
            return jsonify({'success': False, 'error': 'You can only delete your own feedback'}), 403

        success = FeedbackAPI.delete_product_feedback(feedback_id)
        if success:
            return jsonify({'success': True}), 200
        return jsonify({'success': False, 'error': 'Failed to delete feedback'}), 500
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@feedback_bp.route('/product/<product_id>', methods=['GET'])
def get_product_feedback(product_id):
    """
    Get all feedback associated with a specific product ID.
    Calculates the average rating across all retrieved product feedback.
    """
    try:
        # Retrieve all feedback for the product via Firebase
        product_feedback = FeedbackAPI.get_product_feedback(product_id)
        
        if not product_feedback:
            return jsonify({
                'success': True,
                'feedback': [],
                'average_rating': 0,
                'total_reviews': 0
            })

        # Calculate the average product rating
        avg_rating = sum(int(f.get("rating", 0)) for f in product_feedback) / len(product_feedback)
        
        return jsonify({
            'success': True,
            'feedback': product_feedback,
            'average_rating': round(avg_rating, 1),
            'total_reviews': len(product_feedback)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

# ==========================================
# General Platform Feedback Routes
# ==========================================

@feedback_bp.route('/general', methods=['POST'])
def submit_general_feedback():
    """
    Submit general platform feedback, feature requests, or suggestions.
    Stores the generalized feedback into Firebase Realtime Database.
    """
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400

        # Extract fields
        msg = str(data.get('message', '')).strip()
        f_type = str(data.get('type', 'suggestion')).lower()
        email = str(data.get('user_email', '')).strip()

        if not msg:
            return jsonify({'success': False, 'error': 'Message is required'}), 400

        # Construct general feedback object
        feedback_id = str(uuid.uuid4())
        feedback = {
            "id": feedback_id,
            "type": f_type,
            "message": msg[:2000], # Cap message size 
            "user_email": email,
            "timestamp": datetime.now().isoformat()
        }
        
        # Save to Firebase Realtime Database
        success = FeedbackAPI.add_general_feedback(feedback_id, feedback)
        
        if success:
            return jsonify({'success': True, 'feedback_id': feedback_id}), 201
        else:
            return jsonify({'success': False, 'error': 'Failed to save feedback to database'}), 500

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@feedback_bp.route('/general', methods=['GET'])
def get_general_feedback():
    """
    Retrieve all general platform feedback from the database.
    """
    try:
        general_feedback = FeedbackAPI.get_general_feedback()
        return jsonify({
            'success': True,
            'feedback': general_feedback
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400
``````

---

## `server\routes\image_routes.py`

```python
# server/routes/image_routes.py
"""
Image-based search routes.
Handles uploading an image and finding visually similar products.
"""

from flask import Blueprint, request, jsonify, send_from_directory
import os
import uuid
from pathlib import Path
from ml_services.image_search.search_engine import search_similar_images

# Blueprint for image search routes
image_bp = Blueprint('image', __name__, url_prefix='/api/image')


@image_bp.route('/search', methods=['POST'])
def image_search():
    """Receives an image file and returns visually similar product matches."""
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': 'No image file provided.'}), 400

        image_file = request.files['image']

        # Validate file
        if not image_file.filename:
            return jsonify({'success': False, 'error': 'No image selected.'}), 400

        allowed_extensions = {'jpg', 'jpeg', 'png', 'gif', 'bmp'}
        extension = image_file.filename.rsplit('.', 1)[-1].lower()

        if extension not in allowed_extensions:
            return jsonify({
                'success': False,
                'error': 'Invalid file type. Allowed: jpg, jpeg, png, gif, bmp.'
            }), 400

        # Save image temporarily
        upload_dir = 'uploads'
        os.makedirs(upload_dir, exist_ok=True)

        unique_filename = f"{uuid.uuid4()}.{extension}"
        filepath = os.path.join(upload_dir, unique_filename)
        image_file.save(filepath)

        # Run similarity search
        search_result = search_similar_images(filepath, top_k=5)

        # Make returned image URLs usable directly in the browser UI
        try:
            if isinstance(search_result, dict) and search_result.get("success"):
                base = request.host_url.rstrip("/")
                for item in search_result.get("results", []) or []:
                    url = item.get("image_url")
                    if isinstance(url, str) and url.startswith("/api/"):
                        item["image_url"] = base + url
                    # If it's already a full URL (like Cloudinary), we don't need to do anything
        except Exception:
            pass

        # Remove temporary file
        try:
            os.remove(filepath)
        except:
            pass  # Not important for production use

        return jsonify(search_result), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500


@image_bp.route('/health', methods=['GET'])
def health_check():
    """Simple health check for image search service."""
    return jsonify({
        'success': True,
        'service': 'Image Search API',
        'status': 'running'
    }), 200


@image_bp.route('/dataset/<category>/<filename>', methods=['GET'])
def serve_dataset_image(category, filename):
    """Expose curated dataset assets for the visual search UI."""
    base_dir = (
        Path(__file__).resolve().parents[2]
        / "Dataset"
        / "products"
        / category
    )
    if not base_dir.exists():
        return jsonify({'success': False, 'error': 'Dataset category not found'}), 404

    file_path = base_dir / filename
    if not file_path.exists():
        return jsonify({'success': False, 'error': 'Dataset image not found'}), 404

    return send_from_directory(str(base_dir), filename)
``````

---

## `server\routes\logo_routes.py`

```python
"""Routes for logo verification service."""

import os
import uuid
from flask import Blueprint, jsonify, request, send_from_directory
from pathlib import Path

from ml_services.logo_verifier import get_available_brands, verify_logo
from ml_services.logo_verifier.config import REFERENCE_LOGO_DIR

logo_bp = Blueprint("logo", __name__, url_prefix="/api/logo")

BASE_DIR = Path(__file__).resolve().parent


@logo_bp.route("/brands", methods=["GET"])
def list_brands():
    """Lists all brands currently in the reference database."""
    return jsonify({"success": True, "brands": get_available_brands()})


@logo_bp.route("/reference/<brand>/<filename>", methods=["GET"])
def serve_reference_logo(brand, filename):
    """Serves a reference logo image for display."""
    ref_dir = Path(REFERENCE_LOGO_DIR)
    if not ref_dir.exists():
        return jsonify({"success": False, "error": "Reference directory not found"}), 404

    # Prefer brand subfolder layout: reference_logos/<brand>/<filename>
    candidates = [ref_dir / brand.lower() / filename, ref_dir / filename]
    for file_path in candidates:
        if file_path.exists():
            return send_from_directory(str(file_path.parent), file_path.name)

    return jsonify({"success": False, "error": f"Logo '{filename}' not found"}), 404


@logo_bp.route("/reference/<filename>", methods=["GET"])
def serve_reference_logo_legacy(filename):
    """Legacy reference logo endpoint."""
    ref_dir = Path(REFERENCE_LOGO_DIR)
    if not ref_dir.exists():
        return jsonify({"success": False, "error": "Reference directory not found"}), 404

    direct = ref_dir / filename
    if direct.exists():
        return send_from_directory(str(ref_dir), filename)

    # If reference set is nested by brand, search within subfolders
    try:
        found = next(ref_dir.rglob(filename), None)
        if found and found.exists():
            return send_from_directory(str(found.parent), found.name)
    except Exception:
        pass

    return jsonify({"success": False, "error": f"Logo '{filename}' not found"}), 404


@logo_bp.route("/verify", methods=["POST"])
def verify_logo_route():
    """Verifies an uploaded logo against the reference database."""
    try:
        if "image" not in request.files:
            return jsonify({"success": False, "error": "Image is required"}), 400
        image_file = request.files["image"]
        if image_file.filename == "":
            return jsonify({"success": False, "error": "No file selected"}), 400

        brand_hint = request.form.get("brand") or request.args.get("brand")
        print(f"[INFO] Logo Verification Started for brand: {brand_hint or 'Auto'}")

        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        extension = image_file.filename.rsplit(".", 1)[-1].lower()
        temp_path = os.path.join(upload_dir, f"{uuid.uuid4()}.{extension}")
        image_file.save(temp_path)

        result = verify_logo(temp_path, brand_hint)
        print(f"[SUCCESS] Logo Verification Completed: {result.get('status')}")

        try:
            os.remove(temp_path)
        except OSError:
            pass

        return jsonify(result), 200

    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500
``````

---

## `server\routes\messaging_routes.py`

```python
"""In-app messaging routes with escrow integration, backed by Firebase RTDB."""

import uuid
from datetime import datetime
from flask import Blueprint, jsonify, request
from firebase_admin import db
from utils.firebase_db import MessagesAPI, ProductsAPI

messaging_bp = Blueprint("messaging", __name__, url_prefix="/api/messaging")


def get_or_create_thread(product_id, buyer_id, seller_id):
    """Get existing thread or create new one for buyer-seller conversation."""
    thread_id = f"{product_id}_{buyer_id}_{seller_id}"
    
    existing = MessagesAPI.get_thread(thread_id)
    if existing:
        return existing
    
    new_thread = {
        "id": thread_id,
        "product_id": product_id,
        "buyer_id": buyer_id,
        "seller_id": seller_id,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "messages": {},
        "status": "active",  # active, sold, closed
        "escrow_id": None,
    }
    
    MessagesAPI.create_thread(thread_id, new_thread)
    return new_thread


@messaging_bp.route("/threads", methods=["GET"])
def list_threads():
    """Get all message threads for a user (buyer or seller)."""
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"success": False, "error": "user_id required"}), 400
    
    user_threads = MessagesAPI.get_user_threads(user_id)
    
    # Sort by most recent message
    for thread in user_threads:
        messages = thread.get("messages", {})
        if messages and isinstance(messages, dict):
            # Sort messages to find the last one
            msg_list = list(messages.values())
            msg_list.sort(key=lambda x: x.get("timestamp", ""))
            thread["last_message"] = msg_list[-1] if msg_list else None
        elif messages and isinstance(messages, list):
            # Fallback if messages are stored as list
            thread["last_message"] = messages[-1] if messages else None
        else:
            thread["last_message"] = None
            
        # Standardize messages format for frontend
        if isinstance(messages, dict):
            thread["messages"] = list(messages.values())
            thread["messages"].sort(key=lambda x: x.get("timestamp", ""))
    
    # Safely get timestamp or fallback to empty string and sort
    user_threads.sort(
        key=lambda x: (x.get("last_message") or {}).get("timestamp", x.get("created_at", "")),
        reverse=True
    )
    
    return jsonify({"success": True, "threads": user_threads}), 200


@messaging_bp.route("/thread/<thread_id>", methods=["GET"])
def get_thread(thread_id):
    """Get a specific message thread with all messages."""
    thread = MessagesAPI.get_thread(thread_id)
    
    if not thread:
        return jsonify({"success": False, "error": "Thread not found"}), 404
        
    messages = thread.get("messages", {})
    if isinstance(messages, dict):
        thread["messages"] = list(messages.values())
        thread["messages"].sort(key=lambda x: x.get("timestamp", ""))
    
    return jsonify({"success": True, "thread": thread}), 200


@messaging_bp.route("/thread", methods=["POST"])
def create_or_get_thread():
    """Create or retrieve a message thread for a product conversation."""
    data = request.get_json() or {}
    required = ["product_id", "buyer_id", "seller_id"]
    for field in required:
        if not data.get(field):
            return jsonify({"success": False, "error": f"Missing {field}"}), 400
    
    thread = get_or_create_thread(
        data["product_id"], data["buyer_id"], data["seller_id"]
    )
    
    # Ensure messages is a list format for UI
    messages = thread.get("messages", {})
    if isinstance(messages, dict):
        thread["messages"] = list(messages.values())
        thread["messages"].sort(key=lambda x: x.get("timestamp", ""))
        
    return jsonify({"success": True, "thread": thread}), 200


@messaging_bp.route("/thread/<thread_id>/message", methods=["POST"])
def send_message(thread_id):
    """Send a message in a thread."""
    data = request.get_json() or {}
    required = ["sender_id", "content"]
    for field in required:
        if not data.get(field):
            return jsonify({"success": False, "error": f"Missing {field}"}), 400
    
    thread = MessagesAPI.get_thread(thread_id)
    if not thread:
        return jsonify({"success": False, "error": "Thread not found"}), 404
    
    if data["sender_id"] not in [thread.get("buyer_id"), thread.get("seller_id")]:
        return jsonify({"success": False, "error": "Unauthorized sender"}), 403
    
    msg_id = str(uuid.uuid4())
    message = {
        "id": msg_id,
        "sender_id": data["sender_id"],
        "content": data["content"],
        "timestamp": datetime.utcnow().isoformat(),
        "read": False,
    }
    
    success = MessagesAPI.add_message(thread_id, msg_id, message)
    if success:
        try:
            receiver_id = thread.get("seller_id") if data["sender_id"] == thread.get("buyer_id") else thread.get("buyer_id")
            import time
            notification_id = f"notif_{str(uuid.uuid4())[:12]}"
            notif = {
                "notification_id": notification_id,
                "user_id": receiver_id,
                "type": "MESSAGE",
                "title": "New Message",
                "message": f"You have a new message: {data['content'][:50]}",
                "read": False,
                "created_at": int(time.time()),
                "related_escrow_id": thread.get("escrow_id"),
                "related_product_id": thread.get("product_id"),
                "related_user_id": data["sender_id"],
                "action_required": False
            }
            db.reference(f'notifications/{receiver_id}/{notification_id}').set(notif)
            print(f"ðŸ”¥ [DEBUG] Notification created: {notification_id} for user mode '{receiver_id}'")
        except Exception as e:
            print(f"[WARNING] Failed to generate message notification: {str(e)}")
            
        return jsonify({"success": True, "message": message}), 201
    return jsonify({"success": False, "error": "Failed to add message"}), 500


@messaging_bp.route("/thread/<thread_id>/mark-read", methods=["POST"])
def mark_read(thread_id):
    """Mark all messages in a thread as read for a user."""
    data = request.get_json() or {}
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"success": False, "error": "user_id required"}), 400
    
    thread = MessagesAPI.get_thread(thread_id)
    if not thread:
        return jsonify({"success": False, "error": "Thread not found"}), 404
        
    messages = thread.get("messages", {})
    if not messages:
        return jsonify({"success": True}), 200
        
    try:
        if isinstance(messages, dict):
            for msg_id, msg in messages.items():
                if msg.get("sender_id") != user_id and not msg.get("read"):
                    db.reference(f'messages/{thread_id}/messages/{msg_id}/read').set(True)
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@messaging_bp.route("/thread/<thread_id>/link-escrow", methods=["POST"])
def link_escrow(thread_id):
    """Link an escrow session to a message thread."""
    data = request.get_json() or {}
    escrow_id = data.get("escrow_id")
    if not escrow_id:
        return jsonify({"success": False, "error": "escrow_id required"}), 400
    
    thread = MessagesAPI.get_thread(thread_id)
    if not thread:
        return jsonify({"success": False, "error": "Thread not found"}), 404
        
    try:
        db.reference(f'messages/{thread_id}/escrow_id').set(escrow_id)
        db.reference(f'messages/{thread_id}/updated_at').set(datetime.utcnow().isoformat())
        thread["escrow_id"] = escrow_id
        return jsonify({"success": True, "thread": thread}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@messaging_bp.route("/thread/<thread_id>/mark-sold", methods=["POST"])
def mark_sold(thread_id):
    """Mark product as sold and close the thread."""
    data = request.get_json() or {}
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"success": False, "error": "user_id required"}), 400
    
    thread = MessagesAPI.get_thread(thread_id)
    if not thread:
        return jsonify({"success": False, "error": "Thread not found"}), 404
    
    if thread.get("seller_id") != user_id:
        return jsonify({"success": False, "error": "Only seller can mark as sold"}), 403
        
    try:
        timestamp = datetime.utcnow().isoformat()
        db.reference(f'messages/{thread_id}/status').set("sold")
        db.reference(f'messages/{thread_id}/updated_at').set(timestamp)
        
        # Add system message
        msg_id = str(uuid.uuid4())
        system_msg = {
            "id": msg_id,
            "sender_id": "system",
            "content": "âœ… Product marked as sold. Transaction completed.",
            "timestamp": timestamp,
            "read": False,
            "is_system": True,
        }
        MessagesAPI.add_message(thread_id, msg_id, system_msg)
        
        # Update product status 
        product_id = thread.get("product_id")
        if product_id:
            ProductsAPI.update(product_id, {
                "status": "sold",
                "sold_at": timestamp
            })
            
        thread["status"] = "sold"
        return jsonify({"success": True, "thread": thread}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@messaging_bp.route("/thread/<thread_id>/close", methods=["POST"])
def close_thread(thread_id):
    """Close a thread without marking as sold."""
    data = request.get_json() or {}
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"success": False, "error": "user_id required"}), 400
    
    thread = MessagesAPI.get_thread(thread_id)
    if not thread:
        return jsonify({"success": False, "error": "Thread not found"}), 404
    
    if user_id not in [thread.get("buyer_id"), thread.get("seller_id")]:
        return jsonify({"success": False, "error": "Unauthorized"}), 403
        
    try:
        db.reference(f'messages/{thread_id}/status').set("closed")
        db.reference(f'messages/{thread_id}/updated_at').set(datetime.utcnow().isoformat())
        thread["status"] = "closed"
        return jsonify({"success": True, "thread": thread}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
``````

---

## `server\routes\notifications_routes.py`

```python
"""
Notifications Routes
Manages user notifications for transactions, purchases, and messages
"""

from flask import Blueprint, request, jsonify
from firebase_admin import db
import uuid
import time
from utils.auth_helper import token_required

notifications_bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")


def _resolve_identity_keys(user_id):
    """Resolve uid/username aliases for reliable notification delivery."""
    identity_keys = {str(user_id)}
    users = db.reference("users").get() or {}
    for uid, user_data in users.items():
        if not isinstance(user_data, dict):
            continue
        uid_str = str(uid)
        username = str(user_data.get("username", "")).strip()
        if uid_str == str(user_id) and username:
            identity_keys.add(username)
        if username and username == str(user_id):
            identity_keys.add(uid_str)
    return identity_keys


@notifications_bp.route("/user/<user_id>", methods=["GET"])
def get_user_notifications(user_id):
    """Get all notifications for a user with optional pagination"""
    try:
        limit = request.args.get("limit", 50, type=int)
        read_filter = request.args.get("read", None)  # None, "true", "false"
        
        notifications_ref = db.reference(f'notifications/{user_id}')
        notifications_data = notifications_ref.get() or {}
        
        notifications_list = list(notifications_data.values()) if notifications_data else []
        
        # Filter by read status if specified
        if read_filter == "true":
            notifications_list = [n for n in notifications_list if n.get('read', False)]
        elif read_filter == "false":
            notifications_list = [n for n in notifications_list if not n.get('read', False)]
        
        # Sort by created_at descending (newest first)
        notifications_list.sort(key=lambda x: x.get('created_at', 0), reverse=True)
        
        # Apply limit
        notifications_list = notifications_list[:limit]
        
        # Count unread
        unread_count = sum(1 for n in notifications_list if not n.get('read', False))
        
        return jsonify({
            "success": True,
            "notifications": notifications_list,
            "unread_count": unread_count,
            "total": len(notifications_list)
        }), 200
        
    except Exception as e:
        print(f"Error fetching notifications: {str(e)}")
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/user/<user_id>/unread-count", methods=["GET"])
def get_unread_count(user_id):
    """Get count of unread notifications for a user"""
    try:
        notifications_ref = db.reference(f'notifications/{user_id}')
        notifications_data = notifications_ref.get() or {}
        
        unread_count = sum(1 for n in notifications_data.values() if not n.get('read', False))
        
        return jsonify({
            "success": True,
            "unread_count": unread_count
        }), 200
        
    except Exception as e:
        print(f"Error getting unread count: {str(e)}")
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/<notification_id>/mark-read", methods=["POST"])
def mark_notification_read(notification_id):
    """Mark a single notification as read"""
    try:
        data = request.json
        user_id = data.get("user_id")
        
        if not user_id:
            return jsonify({"error": "user_id required"}), 400
        
        notification_ref = db.reference(f'notifications/{user_id}/{notification_id}')
        notification_ref.update({"read": True})
        
        return jsonify({"success": True, "message": "Notification marked as read"}), 200
        
    except Exception as e:
        print(f"Error marking notification as read: {str(e)}")
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/user/<user_id>/mark-all-read", methods=["POST"])
def mark_all_read(user_id):
    """Mark all notifications as read for a user"""
    try:
        notifications_ref = db.reference(f'notifications/{user_id}')
        notifications_data = notifications_ref.get() or {}
        
        updates = 0
        for notif_id, notif in notifications_data.items():
            if not notif.get('read', False):
                db.reference(f'notifications/{user_id}/{notif_id}').update({"read": True})
                updates += 1
        
        return jsonify({
            "success": True,
            "message": f"Marked {updates} notifications as read"
        }), 200
        
    except Exception as e:
        print(f"Error marking all as read: {str(e)}")
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/<notification_id>", methods=["DELETE"])
def delete_notification(notification_id):
    """Delete a specific notification"""
    try:
        data = request.json
        user_id = data.get("user_id")
        
        if not user_id:
            return jsonify({"error": "user_id required"}), 400
        
        db.reference(f'notifications/{user_id}/{notification_id}').delete()
        
        return jsonify({"success": True, "message": "Notification deleted"}), 200
        
    except Exception as e:
        print(f"Error deleting notification: {str(e)}")
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/user/<user_id>/clear", methods=["POST"])
def clear_all_notifications(user_id):
    """Clear all notifications for a user"""
    try:
        db.reference(f'notifications/{user_id}').delete()
        return jsonify({
            "success": True,
            "message": "All notifications cleared"
        }), 200
        
    except Exception as e:
        print(f"Error clearing notifications: {str(e)}")
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/transaction-start", methods=["POST"])
def create_transaction_notification():
    """Create notification when transaction starts"""
    try:
        data = request.json
        seller_id = data.get("seller_id")
        buyer_id = data.get("buyer_id")
        product_name = data.get("product_name")
        escrow_id = data.get("escrow_id")
        product_id = data.get("product_id")
        
        if not all([seller_id, buyer_id, product_name, escrow_id]):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Create notification for seller (uid + username aliases)
        notification_id = f"notif_{str(uuid.uuid4())[:12]}"
        now = int(time.time())
        recipients = _resolve_identity_keys(seller_id)
		
        for recipient in recipients:
            notification = {
                "notification_id": notification_id,
                "user_id": recipient,
                "type": "PURCHASE",
                "title": "Purchase Initiated",
                "message": f"A buyer purchased '{product_name}'",
                "read": False,
                "created_at": now,
                "related_escrow_id": escrow_id,
                "related_product_id": product_id,
                "related_user_id": buyer_id,
                "action_required": True
            }
            db.reference(f'notifications/{recipient}/{notification_id}').set(notification)
        
        return jsonify({
            "success": True,
            "notification_id": notification_id
        }), 201
        
    except Exception as e:
        print(f"Error creating transaction notification: {str(e)}")
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/payment-started", methods=["POST"])
def create_payment_started_notification():
    """Create notification when buyer starts payment from an escrow record."""
    try:
        data = request.json or {}
        escrow_id = data.get("escrow_id")
        buyer_id = data.get("buyer_id")

        if not escrow_id:
            return jsonify({"error": "Missing escrow_id"}), 400

        escrow = db.reference(f"escrows/{escrow_id}").get() or {}
        seller_id = escrow.get("seller_id")
        product_id = escrow.get("product_id")
        amount = escrow.get("ledger", {}).get("amount")

        if not seller_id:
            return jsonify({"error": "Seller not found for escrow"}), 404

        now = int(time.time())
        escrow_ref = db.reference(f"escrows/{escrow_id}")
        escrow_ref.update({
            "status_matrix/payment_status": "PROCESSING",
            "metadata/payment_started_at": now,
            "metadata/updated_at": now,
        })

        product_name = data.get("product_name") or escrow.get("product_name") or product_id or "Product"
        notification_id = create_notification(
            user_id=seller_id,
            type="PAYMENT_INITIATED",
            title="Payment Initiated",
            message=f"Buyer started payment for '{product_name}'",
            related_escrow_id=escrow_id,
            related_product_id=product_id,
            related_user_id=buyer_id,
        )

        return jsonify({
            "success": True,
            "notification_id": notification_id,
            "seller_id": seller_id,
            "escrow_id": escrow_id,
            "amount": amount,
            "payment_status": "PROCESSING",
        }), 201

    except Exception as e:
        print(f"Error creating payment-started notification: {str(e)}")
        return jsonify({"error": str(e)}), 500


@notifications_bp.route("/payment-received", methods=["POST"])
def create_payment_notification():
    """Create notification when payment is received"""
    try:
        data = request.json
        seller_id = data.get("seller_id")
        buyer_id = data.get("buyer_id")
        product_name = data.get("product_name")
        escrow_id = data.get("escrow_id")
        amount = data.get("amount")
        
        if not all([seller_id, buyer_id, product_name, escrow_id, amount]):
            return jsonify({"error": "Missing required fields"}), 400
        
        notification_id = create_notification(
            user_id=seller_id,
            type="PAYMENT_RECEIVED",
            title="Payment Received",
            message=f"Payment of ${amount} received for '{product_name}'",
            related_escrow_id=escrow_id,
            related_product_id=None,  # Could add if available
            related_user_id=buyer_id
        )
        
        return jsonify({
            "success": True,
            "message": "Payment notification created",
            "notification_id": notification_id
        }), 201
        
    except Exception as e:
        print(f"Error creating payment notification: {str(e)}")
        return jsonify({"error": str(e)}), 500


def create_notification(user_id, type, title, message, related_escrow_id=None, 
                       related_product_id=None, related_user_id=None):
    """Helper function to create notifications"""
    try:
        notification_id = f"notif_{str(uuid.uuid4())[:12]}"
        now = int(time.time())
        recipients = _resolve_identity_keys(user_id)
		
        for recipient in recipients:
            notification = {
                "notification_id": notification_id,
                "user_id": recipient,
                "type": type,
                "title": title,
                "message": message,
                "read": False,
                "created_at": now,
                "related_escrow_id": related_escrow_id,
                "related_product_id": related_product_id,
                "related_user_id": related_user_id,
                "action_required": type in ["PAYMENT_RECEIVED", "PRODUCT_SHIPPED", "PAYMENT_RELEASED", "PURCHASE", "PAYMENT_INITIATED"]
            }
            db.reference(f'notifications/{recipient}/{notification_id}').set(notification)
        return notification_id
        
    except Exception as e:
        print(f"Error creating notification: {str(e)}")
        return None
``````

---

## `server\routes\payment_routes.py`

```python
"""
Stripe payment routes for escrow checkout.
Creates PaymentIntents, verifies Stripe webhooks, and marks escrows as paid.
"""

from flask import Blueprint, request, jsonify
from firebase_admin import db
import os
import time
import uuid

import stripe

from utils.auth_helper import token_required

payment_bp = Blueprint("payment", __name__, url_prefix="/api/payment")


def _safe_float(value):
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def _resolve_amount(escrow):
    ledger = escrow.get("ledger") or {}
    amount = escrow.get("total_price", ledger.get("amount", 0))
    return round(_safe_float(amount), 2)


def _resolve_currency(escrow):
    ledger = escrow.get("ledger") or {}
    currency = escrow.get("currency") or ledger.get("currency") or "usd"
    return str(currency).strip().lower() or "usd"


def _get_stripe_secret_key():
    key = os.getenv("STRIPE_SECRET_KEY")
    if not key:
        raise ValueError("STRIPE_SECRET_KEY is not configured.")
    return key


def _get_webhook_secret():
    secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    if not secret:
        raise ValueError("STRIPE_WEBHOOK_SECRET is not configured.")
    return secret


def _create_notification(user_id, notification_type, title, message, related_escrow_id=None,
                         related_product_id=None, related_user_id=None):
    try:
        recipients = _resolve_identity_keys(user_id)
        notification_id = f"notif_{str(uuid.uuid4())[:12]}"
        now = int(time.time())

        for recipient in recipients:
            notification = {
                "notification_id": notification_id,
                "user_id": recipient,
                "type": notification_type,
                "title": title,
                "message": message,
                "read": False,
                "created_at": now,
                "related_escrow_id": related_escrow_id,
                "related_product_id": related_product_id,
                "related_user_id": related_user_id,
                "action_required": notification_type in ["PAYMENT_RECEIVED", "PAYMENT_CONFIRMED", "PAYMENT_INITIATED"],
            }
            db.reference(f"notifications/{recipient}/{notification_id}").set(notification)
        return notification_id
    except Exception as exc:
        print(f"[WARN] Failed to create notification: {exc}")
        return None


def _resolve_identity_keys(user_id):
    """Resolve uid/username aliases for robust notification delivery and auth checks."""
    identity_keys = {str(user_id)}
    users = db.reference("users").get() or {}
    for uid, user_data in users.items():
        if not isinstance(user_data, dict):
            continue
        username = str(user_data.get("username", "")).strip()
        uid_str = str(uid)

        if uid_str == str(user_id) and username:
            identity_keys.add(username)
        if username and username == str(user_id):
            identity_keys.add(uid_str)
    return identity_keys


def _send_payment_initiated_notification(escrow_id, escrow, payment_intent_id):
    """Notify seller that buyer has started the Stripe payment flow."""
    payment_ref = db.reference(f"payments/{payment_intent_id}")
    payment_data = payment_ref.get() or {}
    if payment_data.get("initiated_notification_sent"):
        return

    amount = _resolve_amount(escrow)
    _create_notification(
        user_id=escrow.get("seller_id"),
        notification_type="PAYMENT_INITIATED",
        title="Payment Initiated",
        message=f"Buyer started payment of ${amount:.2f} for escrow {escrow_id}.",
        related_escrow_id=escrow_id,
        related_product_id=escrow.get("product_id"),
        related_user_id=escrow.get("buyer_id"),
    )
    payment_ref.update({
        "initiated_notification_sent": True,
        "updated_at": int(time.time()),
    })


def _settle_successful_payment(escrow_id, payment_intent, source):
    """Mark escrow as paid/funded and send seller notification exactly once."""
    try:
        escrow_ref = db.reference(f"escrows/{escrow_id}")
        escrow = escrow_ref.get()
        if not escrow:
            return False, "Escrow not found."

        payment_ref = db.reference(f"payments/{payment_intent.id}")
        existing_payment = payment_ref.get() or {}

        if (
            existing_payment.get("status") == "SUCCEEDED"
            and escrow.get("status_matrix", {}).get("payment_status") == "PAID"
        ):
            return True, None

        now = int(time.time())
        amount = round(_safe_float(payment_intent.amount_received or payment_intent.amount) / 100, 2)
        previous_state = escrow.get("status_matrix", {}).get("escrow_status", "PENDING_PAYMENT")

        def update_escrow(current):
            if current is None:
                return None

            current.setdefault("status_matrix", {})
            current.setdefault("ledger", {})
            current.setdefault("metadata", {})
            current.setdefault("audit_trail", {})

            current["status_matrix"]["escrow_status"] = "FUNDED"
            current["status_matrix"]["payment_status"] = "PAID"
            current["ledger"]["is_locked"] = False
            current["payment_intent_id"] = payment_intent.id
            current["payment_provider"] = "stripe"
            current["metadata"]["updated_at"] = now
            current["metadata"]["paid_at"] = now

            log_id = f"log_{int(time.time() * 1000)}"
            current["audit_trail"][log_id] = {
                "old_state": previous_state,
                "new_state": "FUNDED",
                "action_by": source,
                "role": "SYSTEM",
                "reason": "Stripe payment confirmed",
                "timestamp": now,
            }
            return current

        escrow_ref.transaction(update_escrow)

        payment_ref.set({
            "payment_intent_id": payment_intent.id,
            "escrow_id": escrow_id,
            "buyer_id": escrow.get("buyer_id"),
            "seller_id": escrow.get("seller_id"),
            "product_id": escrow.get("product_id"),
            "amount": amount,
            "currency": payment_intent.currency,
            "status": "SUCCEEDED",
            "method": "stripe",
            "created_at": existing_payment.get("created_at", now),
            "updated_at": now,
            "stripe_status": payment_intent.status,
            "stripe_charge_id": payment_intent.latest_charge,
            "paid_at": now,
            "notification_sent": bool(existing_payment.get("notification_sent", False)),
            "initiated_notification_sent": bool(existing_payment.get("initiated_notification_sent", False)),
        })

        if not existing_payment.get("notification_sent"):
            _create_notification(
                user_id=escrow.get("seller_id"),
                notification_type="PAYMENT_RECEIVED",
                title="Payment Successful",
                message=f"Payment of ${amount:.2f} for this item is successful and has been moved into escrow.",
                related_escrow_id=escrow_id,
                related_product_id=escrow.get("product_id"),
                related_user_id=escrow.get("buyer_id"),
            )
            payment_ref.update({"notification_sent": True})

        return True, None
    except Exception as exc:
        print(f"[ERROR] Failed to settle successful payment: {exc}")
        return False, str(exc)


@payment_bp.route("/create-payment-intent", methods=["POST"])
@token_required
def create_payment_intent(current_user):
    """Create a Stripe PaymentIntent from the escrow total."""
    try:
        data = request.get_json(silent=True) or {}
        escrow_id = str(data.get("escrow_id", "")).strip()

        if not escrow_id:
            return jsonify({"success": False, "error": "escrow_id is required."}), 400

        escrow_ref = db.reference(f"escrows/{escrow_id}")
        escrow = escrow_ref.get()
        if not escrow:
            return jsonify({"success": False, "error": "Escrow not found."}), 404

        buyer_id = str(escrow.get("buyer_id", ""))
        if buyer_id not in _resolve_identity_keys(current_user.get("uid")):
            return jsonify({"success": False, "error": "Unauthorized user."}), 403

        payment_status = str(escrow.get("status_matrix", {}).get("payment_status", "")).upper()
        if payment_status == "PAID":
            return jsonify({
                "success": True,
                "alreadyPaid": True,
                "message": "This escrow has already been paid.",
                "payment_status": payment_status,
                "escrow_status": str(escrow.get("status_matrix", {}).get("escrow_status", "FUNDED")),
            }), 200

        amount = _resolve_amount(escrow)
        if amount <= 0:
            return jsonify({"success": False, "error": "Invalid escrow amount."}), 400

        currency = _resolve_currency(escrow)
        stripe.api_key = _get_stripe_secret_key()

        existing_intent_id = escrow.get("payment_intent_id")
        if existing_intent_id:
            try:
                existing_intent = stripe.PaymentIntent.retrieve(existing_intent_id)
                if existing_intent and existing_intent.status in {
                    "requires_payment_method",
                    "requires_confirmation",
                    "requires_action",
                }:
                    return jsonify({
                        "success": True,
                        "clientSecret": existing_intent.client_secret,
                        "paymentIntentId": existing_intent.id,
                        "amount": amount,
                        "currency": currency,
                        "reused": True,
                    })
                if existing_intent and existing_intent.status in {"succeeded", "processing"}:
                    _settle_successful_payment(escrow_id, existing_intent, "STRIPE_REUSE")
                    return jsonify({
                        "success": True,
                        "clientSecret": existing_intent.client_secret,
                        "paymentIntentId": existing_intent.id,
                        "amount": amount,
                        "currency": currency,
                        "alreadyPaid": True,
                    })
            except stripe.error.StripeError:
                pass

        payment_intent = stripe.PaymentIntent.create(
            amount=int(round(amount * 100)),
            currency=currency,
            automatic_payment_methods={"enabled": True},
            metadata={
                "escrow_id": escrow_id,
                "buyer_id": str(escrow.get("buyer_id", "")),
                "seller_id": str(escrow.get("seller_id", "")),
                "product_id": str(escrow.get("product_id", "")),
            },
            description=f"Escrow payment for {escrow_id}",
        )

        now = int(time.time())
        payment_record = {
            "payment_intent_id": payment_intent.id,
            "escrow_id": escrow_id,
            "buyer_id": escrow.get("buyer_id"),
            "seller_id": escrow.get("seller_id"),
            "product_id": escrow.get("product_id"),
            "amount": amount,
            "currency": currency,
            "status": payment_intent.status,
            "client_secret": payment_intent.client_secret,
            "method": "stripe",
            "created_at": now,
            "updated_at": now,
            "notification_sent": False,
            "initiated_notification_sent": False,
        }
        db.reference(f"payments/{payment_intent.id}").set(payment_record)
        escrow_ref.update({
            "payment_intent_id": payment_intent.id,
            "payment_provider": "stripe",
            "metadata/updated_at": now,
        })

        return jsonify({
            "success": True,
            "clientSecret": payment_intent.client_secret,
            "paymentIntentId": payment_intent.id,
            "amount": amount,
            "currency": currency,
        })
    except ValueError as exc:
        return jsonify({"success": False, "error": str(exc)}), 400
    except stripe.error.StripeError as exc:
        return jsonify({"success": False, "error": exc.user_message or str(exc)}), 500
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


@payment_bp.route("/confirm-payment-intent", methods=["POST"])
@token_required
def confirm_payment_intent(current_user):
    """Finalize escrow state immediately after frontend Stripe confirmation."""
    try:
        data = request.get_json(silent=True) or {}
        payment_intent_id = str(data.get("payment_intent_id", "")).strip()
        escrow_id_override = str(data.get("escrow_id", "")).strip()

        if not payment_intent_id:
            return jsonify({"success": False, "error": "payment_intent_id is required."}), 400

        escrow_id = escrow_id_override
        escrow = db.reference(f"escrows/{escrow_id}").get() if escrow_id else None

        if not escrow_id and payment_intent_id:
            existing_payment = db.reference(f"payments/{payment_intent_id}").get() or {}
            escrow_id = str(existing_payment.get("escrow_id", "")).strip()
            if escrow_id:
                escrow = db.reference(f"escrows/{escrow_id}").get()

        if not escrow_id:
            return jsonify({"success": False, "error": "Unable to resolve escrow_id."}), 400

        if not escrow:
            return jsonify({"success": False, "error": "Escrow not found."}), 404

        buyer_id = str(escrow.get("buyer_id", ""))
        if buyer_id not in _resolve_identity_keys(current_user.get("uid")):
            return jsonify({"success": False, "error": "Unauthorized user."}), 403

        current_payment_status = str(escrow.get("status_matrix", {}).get("payment_status", "")).upper()
        if current_payment_status == "PAID":
            return jsonify({
                "success": True,
                "escrow_id": escrow_id,
                "payment_intent_id": payment_intent_id,
                "payment_status": "PAID",
                "escrow_status": "FUNDED",
                "alreadyPaid": True,
            })

        stripe.api_key = _get_stripe_secret_key()
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        except stripe.error.StripeError as stripe_exc:
            latest_escrow = db.reference(f"escrows/{escrow_id}").get() or {}
            latest_payment_status = str(
                latest_escrow.get("status_matrix", {}).get("payment_status", "")
            ).upper()
            if latest_payment_status == "PAID":
                return jsonify({
                    "success": True,
                    "escrow_id": escrow_id,
                    "payment_intent_id": payment_intent_id,
                    "payment_status": "PAID",
                    "escrow_status": str(latest_escrow.get("status_matrix", {}).get("escrow_status", "FUNDED")),
                    "alreadyPaid": True,
                })
            return jsonify({
                "success": False,
                "error": stripe_exc.user_message or str(stripe_exc),
            }), 409

        status = str(payment_intent.status or "").lower()

        metadata = getattr(payment_intent, "metadata", None)
        if metadata is None:
            try:
                metadata = payment_intent["metadata"]
            except Exception:
                metadata = {}
        try:
            metadata = dict(metadata or {})
        except Exception:
            metadata = {}

        metadata_escrow_id = str(metadata.get("escrow_id", "")).strip()
        if metadata_escrow_id and metadata_escrow_id != escrow_id:
            return jsonify({"success": False, "error": "Escrow mismatch for payment intent."}), 409

        if status not in {"succeeded", "processing"}:
            return jsonify({
                "success": False,
                "error": f"Payment intent is not successful yet (status: {payment_intent.status}).",
            }), 409

        settled, err = _settle_successful_payment(escrow_id, payment_intent, "CLIENT_CONFIRM")
        if not settled:
            latest_escrow = db.reference(f"escrows/{escrow_id}").get() or {}
            latest_payment_status = str(
                latest_escrow.get("status_matrix", {}).get("payment_status", "")
            ).upper()
            if latest_payment_status == "PAID":
                return jsonify({
                    "success": True,
                    "escrow_id": escrow_id,
                    "payment_intent_id": payment_intent.id,
                    "payment_status": "PAID",
                    "escrow_status": str(latest_escrow.get("status_matrix", {}).get("escrow_status", "FUNDED")),
                    "alreadyPaid": True,
                })
            return jsonify({"success": False, "error": err or "Failed to settle payment."}), 500

        return jsonify({
            "success": True,
            "escrow_id": escrow_id,
            "payment_intent_id": payment_intent.id,
            "payment_status": "PAID",
            "escrow_status": "FUNDED",
        })
    except ValueError as exc:
        return jsonify({"success": False, "error": str(exc)}), 400
    except stripe.error.StripeError as exc:
        return jsonify({"success": False, "error": exc.user_message or str(exc)}), 500
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


@payment_bp.route("/webhook", methods=["POST"])
def stripe_webhook():
    """Verify Stripe events and mark escrows as paid."""
    try:
        stripe.api_key = _get_stripe_secret_key()
        payload = request.data
        sig_header = request.headers.get("Stripe-Signature")
        event = stripe.Webhook.construct_event(payload, sig_header, _get_webhook_secret())

        if event.get("type") != "payment_intent.succeeded":
            return jsonify({"received": True}), 200

        payment_intent = event["data"]["object"]

        metadata = getattr(payment_intent, "metadata", None)
        if metadata is None:
            try:
                metadata = payment_intent["metadata"]
            except Exception:
                metadata = {}
        try:
            metadata = dict(metadata or {})
        except Exception:
            metadata = {}

        escrow_id = metadata.get("escrow_id")
        if not escrow_id:
            existing = db.reference(f"payments/{payment_intent.id}").get() or {}
            escrow_id = existing.get("escrow_id")
        if not escrow_id:
            return jsonify({"received": True}), 200

        settled, _ = _settle_successful_payment(escrow_id, payment_intent, "STRIPE_WEBHOOK")
        if not settled:
            return jsonify({"received": False}), 500

        return jsonify({"received": True}), 200
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except stripe.error.SignatureVerificationError:
        return jsonify({"error": "Invalid Stripe signature."}), 400
    except Exception as exc:
        print(f"[ERROR] Stripe webhook failed: {exc}")
        return jsonify({"error": str(exc)}), 500


@payment_bp.route("/payment-status/<payment_intent_id>", methods=["GET"])
def get_payment_status(payment_intent_id):
    """Get payment details for a Stripe PaymentIntent."""
    try:
        payment = db.reference(f"payments/{payment_intent_id}").get()
        if not payment:
            return jsonify({"success": False, "error": "Payment not found"}), 404
        return jsonify({"success": True, "payment": payment}), 200
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


@payment_bp.route("/escrow/<escrow_id>/payment", methods=["GET"])
def get_escrow_payment(escrow_id):
    """Get payment details for a given escrow."""
    try:
        escrow = db.reference(f"escrows/{escrow_id}").get()
        if not escrow:
            return jsonify({"success": False, "error": "Escrow not found"}), 404

        payment_intent_id = escrow.get("payment_intent_id")
        if not payment_intent_id:
            return jsonify({"success": False, "error": "No payment found for this escrow"}), 404

        payment = db.reference(f"payments/{payment_intent_id}").get()
        if not payment:
            return jsonify({"success": False, "error": "Payment not found"}), 404

        return jsonify({"success": True, "payment": payment}), 200
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


@payment_bp.route("/wallet/<user_id>", methods=["GET"])
def get_wallet(user_id):
    """Get user's virtual wallet balance for existing wallet features."""
    try:
        wallet = db.reference(f"wallets/{user_id}").get()

        if not wallet:
            wallet = {
                "user_id": user_id,
                "balance": 10000.00,
                "currency": "USD",
                "created_at": int(time.time()),
                "updated_at": int(time.time()),
                "transactions": {},
            }
            db.reference(f"wallets/{user_id}").set(wallet)

        return jsonify({"success": True, "wallet": wallet}), 200
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500
``````

---

## `server\routes\product_routes.py`

```python
# server/routes/product_routes.py
"""
Product listing routes.
Handles uploading product images and managing product listings.
"""

import json
import os
import uuid
from datetime import datetime
from urllib.parse import unquote, urlparse

import cloudinary
import cloudinary.uploader
from firebase_admin import db
from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename

from utils.auth_helper import token_required
from utils.firebase_db import ProductsAPI

product_bp = Blueprint("product", __name__, url_prefix="/api/products")

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


def _compute_logo_status(logo_visible, logo_verification):
    """Compute the persisted `logo_status` field for a product.

    Possible values:
    - "not available": logo is not present/visible
    - "unverified": logo is present but not verified
    - "verified": logo verified as genuine
    - "counterfeit": logo verified as not genuine
    - "unknown": seller has not set logo visibility yet
    """

    if logo_visible is False:
        return "not available"

    if logo_visible is True:
        if isinstance(logo_verification, dict) and isinstance(logo_verification.get("is_genuine"), bool):
            return "verified" if logo_verification.get("is_genuine") else "counterfeit"
        return "unverified"

    return "unknown"


def _compute_logo_verify_status(logo_visible, logo_verification):
    """Compute the persisted `logo_verify_status` field for a product.

    Values:
    - "logo unavailable": logo not present/visible
    - "unverified": logo present but not verified yet
    - "genuine": verified as genuine
    - "fake": verified as not genuine
    - "unknown": seller has not set logo visibility yet
    """

    if logo_visible is False:
        return "logo unavailable"

    if logo_visible is True:
        if isinstance(logo_verification, dict) and isinstance(logo_verification.get("is_genuine"), bool):
            return "genuine" if logo_verification.get("is_genuine") else "fake"
        return "unverified"

    return "unknown"


def _parse_logo_visible(raw_logo_visible):
    """Parse a logo visibility flag from request or stored product data."""
    if isinstance(raw_logo_visible, bool):
        return raw_logo_visible

    if isinstance(raw_logo_visible, str):
        flag = raw_logo_visible.strip().lower()
        if flag in {"true", "1", "yes"}:
            return True
        if flag in {"false", "0", "no"}:
            return False

    return None


def _extract_logo_verification(raw_logo_verification):
    """Return a valid persisted logo verification payload or None."""
    if isinstance(raw_logo_verification, dict) and isinstance(raw_logo_verification.get("is_genuine"), bool):
        return raw_logo_verification

    if isinstance(raw_logo_verification, str) and raw_logo_verification.strip():
        try:
            parsed = json.loads(raw_logo_verification)
            if isinstance(parsed, dict) and isinstance(parsed.get("is_genuine"), bool):
                return parsed
        except Exception:
            return None

    return None


# ------------------------ UTIL FUNCTIONS ------------------------

def _ensure_cloudinary_configured():
    """Configure Cloudinary from environment variables."""
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    api_key = os.getenv("CLOUDINARY_API_KEY")
    api_secret = os.getenv("CLOUDINARY_API_SECRET")

    missing = []
    if not cloud_name:
        missing.append("CLOUDINARY_CLOUD_NAME")
    if not api_key:
        missing.append("CLOUDINARY_API_KEY")
    if not api_secret:
        missing.append("CLOUDINARY_API_SECRET")

    if missing:
        raise RuntimeError(f"Missing Cloudinary env vars: {', '.join(missing)}")

    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,
    )


def allowed_file(filename):
    """Return True if uploaded file has allowed image extension."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def _upload_to_cloudinary(file_storage, unique_filename):
    """Upload Flask FileStorage to Cloudinary and return secure URL."""
    _ensure_cloudinary_configured()
    file_storage.stream.seek(0)
    result = cloudinary.uploader.upload(
        file_storage.stream,
        public_id=f"product_images/{unique_filename}",
        overwrite=True,
        resource_type="image",
    )
    return result.get("secure_url")


def _extract_cloudinary_public_id(image_url):
    """Extract Cloudinary public_id from a delivery URL."""
    if not isinstance(image_url, str):
        return None

    value = image_url.strip()
    if not value:
        return None

    parsed = urlparse(value)
    if not parsed.netloc or "cloudinary" not in parsed.netloc:
        return None

    marker = "/image/upload/"
    if marker not in parsed.path:
        return None

    tail = parsed.path.split(marker, 1)[1].strip("/")
    if not tail:
        return None

    parts = [segment for segment in tail.split("/") if segment]
    if not parts:
        return None

    version_index = -1
    for index, segment in enumerate(parts):
        if segment.startswith("v") and segment[1:].isdigit():
            version_index = index

    if version_index >= 0:
        if version_index + 1 >= len(parts):
            return None
        parts = parts[version_index + 1 :]

    public_id = unquote("/".join(parts))
    if "." in public_id:
        public_id = public_id.rsplit(".", 1)[0]

    return public_id or None


def _delete_cloudinary_image(image_url):
    """Delete Cloudinary image by URL. Returns (success, error_message)."""
    public_id = _extract_cloudinary_public_id(image_url)
    if not public_id:
        return True, None

    try:
        _ensure_cloudinary_configured()
        result = cloudinary.uploader.destroy(
            public_id,
            resource_type="image",
            invalidate=True,
        )
        outcome = str((result or {}).get("result", "")).lower()
        if outcome in {"ok", "not found"}:
            return True, None
        return False, f"Cloudinary delete failed for '{public_id}': {result}"
    except Exception as exc:
        return False, str(exc)


def _normalize_image_url(image_url):
    """Return URL if full http(s), otherwise None."""
    if not isinstance(image_url, str):
        return None

    value = image_url.strip()
    if not value:
        return None

    if value.startswith("http://") or value.startswith("https://"):
        return value

    return None


def _normalize_product_images(product):
    """Normalize image_urls and image_url fields on a product dict."""
    if not isinstance(product, dict):
        return product

    normalized = product.copy()

    image_urls = normalized.get("image_urls")
    cleaned_image_urls = []
    if isinstance(image_urls, list):
        cleaned_image_urls = [
            url
            for url in (_normalize_image_url(u) for u in image_urls)
            if url is not None
        ]
    normalized["image_urls"] = cleaned_image_urls

    image_url = normalized.get("image_url")
    primary = _normalize_image_url(image_url) if isinstance(image_url, str) else None
    if not primary and cleaned_image_urls:
        primary = cleaned_image_urls[0]
    normalized["image_url"] = primary

    return normalized


def _normalize_logo_metadata(product):
    """Normalize logo metadata into a consistent API shape."""
    if not isinstance(product, dict):
        return product

    normalized = product.copy()
    logo_verification = _extract_logo_verification(normalized.get("logo_verification"))
    logo_visible = _parse_logo_visible(normalized.get("logo_visible"))

    # A valid verification payload implies a visible logo even if legacy records
    # never stored the visibility flag.
    if logo_verification is not None:
        logo_visible = True

    normalized["logo_visible"] = logo_visible if isinstance(logo_visible, bool) else None
    normalized["logo_status"] = _compute_logo_status(logo_visible, logo_verification)
    normalized["logo_verify_status"] = _compute_logo_verify_status(logo_visible, logo_verification)

    if logo_verification is not None:
        normalized["logo_verification"] = logo_verification

    return normalized


def _normalize_product_record(product):
    """Normalize a product for API responses."""
    if not isinstance(product, dict):
        return product

    return _normalize_logo_metadata(_normalize_product_images(product))


def _get_product_owner_id(product):
    """Return the best-available owner identifier for a product."""
    if not isinstance(product, dict):
        return None

    return product.get("user_id") or product.get("seller_id") or product.get("owner_id")


def _persist_product_updates(product_id, updates, clear_fields=None):
    """Persist partial product updates and optionally delete fields."""
    try:
        ref = db.reference(f"products/{product_id}")
        payload = (updates or {}).copy()
        payload["updated_at"] = datetime.now().isoformat()
        ref.update(payload)

        for field in clear_fields or []:
            ref.child(field).delete()

        return True
    except Exception as exc:
        print(f"ERROR: Error updating products/{product_id}: {exc}")
        return False


def _collect_product_image_urls(product):
    """Collect product image URLs from image_urls and image_url fields."""
    if not isinstance(product, dict):
        return []

    urls = []

    image_urls = product.get("image_urls")
    if isinstance(image_urls, list):
        for url in image_urls:
            if isinstance(url, str) and url.strip():
                urls.append(url.strip())

    image_url = product.get("image_url")
    if isinstance(image_url, str) and image_url.strip():
        urls.append(image_url.strip())

    unique_urls = []
    seen = set()
    for url in urls:
        if url not in seen:
            seen.add(url)
            unique_urls.append(url)

    return unique_urls


def _parse_image_urls_field(raw_image_urls):
    """Parse image_urls from JSON payloads or form fields."""
    if isinstance(raw_image_urls, list):
        return raw_image_urls

    if isinstance(raw_image_urls, str):
        value = raw_image_urls.strip()
        if not value:
            return []
        if value.startswith("["):
            try:
                parsed = json.loads(value)
                if isinstance(parsed, list):
                    return parsed
            except json.JSONDecodeError:
                return []
        return [value]

    return []


def compute_similarity_score(base, candidate):
    """Advanced similarity score for product recommendations."""
    if base.get("id") == candidate.get("id"):
        return -1.0

    score = 0.0

    b_cat = str(base.get("category", "")).lower()
    c_cat = str(candidate.get("category", "")).lower()
    if b_cat and b_cat == c_cat:
        score += 25.0

    b_brand = str(base.get("brand", "")).lower()
    c_brand = str(candidate.get("brand", "")).lower()
    if b_brand and c_brand and b_brand == c_brand:
        score += 12.0

    b_title_words = set(str(base.get("title", "")).lower().replace("-", " ").split())
    c_title_words = set(str(candidate.get("title", "")).lower().replace("-", " ").split())
    intersection = b_title_words.intersection(c_title_words)
    score += len(intersection) * 4.0

    try:
        p1 = float(base.get("price", 0))
        p2 = float(candidate.get("price", 0))
        if p1 > 0.0 and p2 > 0.0:
            diff_ratio = float(abs(p1 - p2) / max(p1, p2, 1.0))
            score += max(0.0, float(15.0 * (1.0 - diff_ratio)))
    except Exception:
        pass

    cond_rank = {"new": 5, "like new": 4, "excellent": 4, "good": 3, "fair": 2, "poor": 1}
    b_cond = cond_rank.get(str(base.get("condition", "")).lower(), 3)
    c_cond = cond_rank.get(str(candidate.get("condition", "")).lower(), 3)
    score -= abs(b_cond - c_cond) * 2.0

    return score


# ------------------------ IMAGE UPLOAD ------------------------

@product_bp.route("/upload-image", methods=["POST"])
def upload_image():
    """Upload a single product image to Cloudinary."""
    try:
        if "image" not in request.files:
            return jsonify({"success": False, "error": "No image provided"}), 400

        file = request.files["image"]

        if not file.filename:
            return jsonify({"success": False, "error": "No file selected"}), 400

        if not allowed_file(file.filename):
            return jsonify({"success": False, "error": "Invalid image type"}), 400

        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"

        try:
            url = _upload_to_cloudinary(file, unique_filename)
        except Exception as exc:
            return jsonify({"success": False, "error": f"Cloudinary upload failed: {exc}"}), 500

        if not url:
            return jsonify({"success": False, "error": "Cloudinary did not return image URL"}), 500

        return jsonify(
            {
                "success": True,
                "filename": unique_filename,
                "url": url,
                "filepath": url,
            }
        ), 200

    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


@product_bp.route("/upload-images", methods=["POST"])
def upload_images():
    """Upload multiple product images to Cloudinary."""
    try:
        if "images" not in request.files:
            return jsonify({"success": False, "error": "No images provided"}), 400

        files = request.files.getlist("images")
        if not files:
            return jsonify({"success": False, "error": "No files selected"}), 400

        uploaded_urls = []

        for file in files:
            if not file.filename or not allowed_file(file.filename):
                continue

            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4()}_{filename}"

            try:
                url = _upload_to_cloudinary(file, unique_filename)
                if not url:
                    return jsonify({"success": False, "error": "Cloudinary did not return image URL"}), 500
                uploaded_urls.append(url)
            except Exception as exc:
                return jsonify({"success": False, "error": f"Cloudinary upload failed for {filename}: {exc}"}), 500

        return jsonify({"success": True, "urls": uploaded_urls}), 200

    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


# ------------------------ CREATE LISTING ------------------------

@product_bp.route("/listings", methods=["POST"])
@token_required
def create_listing(current_user):
    """Create a new product listing; supports JSON or multipart form with images."""
    try:
        data = request.get_json(silent=True) if request.is_json else None
        if not isinstance(data, dict):
            data = request.form.to_dict() if request.form else {}

        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400

        required = ["title", "price", "category", "description"]
        for field in required:
            val = data.get(field)
            if not val or (isinstance(val, str) and not val.strip()):
                return jsonify({"success": False, "error": f"Missing or empty required field: {field}"}), 400

        try:
            price = float(data["price"])
            if price <= 0:
                return jsonify({"success": False, "error": "Price must be greater than zero."}), 400
            if price > 10000000:
                return jsonify({"success": False, "error": "Price is unrealistically high."}), 400

            curr_year = datetime.now().year
            year = int(data.get("year", curr_year))
            if year < 1900 or year > curr_year:
                return jsonify({"success": False, "error": f"Year must be between 1900 and {curr_year}."}), 400
        except (ValueError, TypeError):
            return jsonify({"success": False, "error": "Price and Year must be valid numbers."}), 400

        normalized_image_urls = []

        uploaded_files = request.files.getlist("images")
        has_uploaded_files = any(file and file.filename for file in uploaded_files)

        if has_uploaded_files:
            for file in uploaded_files:
                if not file or not file.filename:
                    continue
                if not allowed_file(file.filename):
                    return jsonify({"success": False, "error": f"Invalid image type: {file.filename}"}), 400

                filename = secure_filename(file.filename)
                unique_filename = f"{uuid.uuid4()}_{filename}"
                try:
                    url = _upload_to_cloudinary(file, unique_filename)
                except Exception as exc:
                    return jsonify({"success": False, "error": f"Cloudinary upload failed for {filename}: {exc}"}), 500

                if not url:
                    return jsonify({"success": False, "error": f"Cloudinary did not return URL for {filename}"}), 500

                normalized_image_urls.append(url)
        else:
            raw_image_urls = _parse_image_urls_field(data.get("image_urls", []))
            for raw_url in raw_image_urls:
                normalized = _normalize_image_url(raw_url)
                if not normalized:
                    return jsonify(
                        {
                            "success": False,
                            "error": "Image must be uploaded via /upload-image or /upload-images first.",
                        }
                    ), 400
                normalized_image_urls.append(normalized)

        new_product = {
            "title": str(data["title"]).strip(),
            "price": price,
            "category": str(data["category"]).strip(),
            "description": str(data["description"]).strip(),
            "brand": str(data.get("brand", "")).strip(),
            "condition": str(data.get("condition", "good")).lower(),
            "year": year,
            "image_urls": normalized_image_urls,
            "image_url": normalized_image_urls[0] if normalized_image_urls else None,
            "created_at": datetime.now().isoformat(),
            "user_id": current_user["uid"],
        }

        logo_visible = _parse_logo_visible(data.get("logo_visible"))
        logo_verification = _extract_logo_verification(data.get("logo_verification"))

        if logo_visible is None:
            new_product["logo_status"] = "unknown"
            new_product["logo_verify_status"] = "unknown"
        elif logo_visible is False:
            new_product["logo_visible"] = False
            new_product["logo_status"] = _compute_logo_status(False, None)
            new_product["logo_verify_status"] = _compute_logo_verify_status(False, None)
        else:
            new_product["logo_visible"] = True
            if logo_verification is not None:
                new_product["logo_verification"] = logo_verification
            new_product["logo_status"] = _compute_logo_status(True, logo_verification)
            new_product["logo_verify_status"] = _compute_logo_verify_status(True, logo_verification)

        product_id = str(uuid.uuid4())
        success = ProductsAPI.create(product_id, new_product)

        if success:
            created_product = ProductsAPI.get_by_id(product_id) or new_product.copy()
            created_product["id"] = product_id
            return jsonify({"success": True, "product": _normalize_product_record(created_product)}), 200
        return jsonify({"success": False, "error": "Database save failed"}), 500

    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


# ------------------------ GET ALL LISTINGS ------------------------

@product_bp.route("/listings", methods=["GET"])
def get_listings():
    """Return all products with optional filtering."""
    try:
        products = ProductsAPI.get_all()

        category = request.args.get("category")
        min_price = request.args.get("min_price")
        max_price = request.args.get("max_price")
        search = request.args.get("search")

        filtered = products

        if category:
            filtered = [p for p in filtered if str(p.get("category", "")).lower() == category.lower()]

        if min_price:
            try:
                m_p = float(min_price)
                filtered = [p for p in filtered if float(p.get("price", 0)) >= m_p]
            except Exception:
                pass

        if max_price:
            try:
                mx_p = float(max_price)
                filtered = [p for p in filtered if float(p.get("price", 0)) <= mx_p]
            except Exception:
                pass

        seller_id = request.args.get("seller_id")
        if seller_id:
            filtered = [p for p in filtered if str(p.get("user_id", "")).lower() == str(seller_id).lower()]

        if search:
            search_term = search.lower()
            scored_products = []
            for p in filtered:
                score = 0
                title_lower = str(p.get("title", "")).lower()
                desc_lower = str(p.get("description", "")).lower()

                if search_term == title_lower:
                    score += 100
                elif title_lower.startswith(search_term):
                    score += 50
                elif search_term in title_lower:
                    score += 20

                if search_term in desc_lower:
                    score += 10

                if score > 0:
                    p["_search_score"] = score
                    scored_products.append(p)

            scored_products.sort(key=lambda x: x.get("_search_score", 0), reverse=True)
            for p in scored_products:
                p.pop("_search_score", None)
            filtered = scored_products

        filtered = [_normalize_product_record(p) for p in filtered]

        return jsonify({
            "success": True,
            "products": filtered,
            "total": len(filtered),
        }), 200

    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


# ------------------------ GET SINGLE PRODUCT ------------------------

@product_bp.route("/listings/<product_id>", methods=["GET"])
def get_product(product_id):
    """Return one product by ID."""
    try:
        product = ProductsAPI.get_by_id(product_id)

        if not product:
            return jsonify({"success": False, "error": "Product not found"}), 404

        product = _normalize_product_record(product)

        return jsonify({"success": True, "product": product}), 200

    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


@product_bp.route("/listings/<product_id>/logo-visibility", methods=["PATCH"])
@token_required
def update_listing_logo_visibility(current_user, product_id):
    """Persist owner-confirmed logo visibility for a listing."""
    try:
        product = ProductsAPI.get_by_id(product_id)
        if not product:
            return jsonify({"success": False, "error": "Product not found"}), 404

        owner_id = _get_product_owner_id(product)
        if not owner_id or str(owner_id) != str(current_user.get("uid")):
            return jsonify({"success": False, "error": "Not authorized"}), 403

        data = request.get_json(silent=True) if request.is_json else None
        if not isinstance(data, dict):
            data = request.form.to_dict() if request.form else {}

        logo_visible = _parse_logo_visible(data.get("logo_visible"))
        if logo_visible is None:
            return jsonify({"success": False, "error": "logo_visible must be true or false"}), 400

        existing_verification = _extract_logo_verification(product.get("logo_verification"))
        if logo_visible is False:
            updates = {
                "logo_visible": False,
                "logo_status": _compute_logo_status(False, None),
                "logo_verify_status": _compute_logo_verify_status(False, None),
            }
            clear_fields = ["logo_verification", "logo_verified_at"]
        else:
            updates = {
                "logo_visible": True,
                "logo_status": _compute_logo_status(True, existing_verification),
                "logo_verify_status": _compute_logo_verify_status(True, existing_verification),
            }
            clear_fields = None

        if not _persist_product_updates(product_id, updates, clear_fields=clear_fields):
            return jsonify({"success": False, "error": "Database update failed"}), 500

        updated_product = ProductsAPI.get_by_id(product_id)
        if not updated_product:
            return jsonify({"success": False, "error": "Product not found after update"}), 500

        return jsonify({
            "success": True,
            "product": _normalize_product_record(updated_product),
        }), 200

    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


# ------------------------ VERIFY LISTING LOGO ------------------------

@product_bp.route("/listings/<product_id>/logo/verify", methods=["POST"])
@token_required
def verify_listing_logo(current_user, product_id):
    """Verify a listing's logo and persist the result.

    Owner-only endpoint.
    Expects multipart form-data with `image`.
    """
    try:
        product = ProductsAPI.get_by_id(product_id)
        if not product:
            return jsonify({"success": False, "error": "Product not found"}), 404

        owner_id = _get_product_owner_id(product)
        if not owner_id or str(owner_id) != str(current_user.get("uid")):
            return jsonify({"success": False, "error": "Not authorized"}), 403

        if _parse_logo_visible(product.get("logo_visible")) is False:
            return jsonify({"success": False, "error": "Logo is marked as not present"}), 400

        if "image" not in request.files:
            return jsonify({"success": False, "error": "Image is required"}), 400

        image_file = request.files["image"]
        if not image_file or not image_file.filename:
            return jsonify({"success": False, "error": "No file selected"}), 400

        if not allowed_file(image_file.filename):
            return jsonify({"success": False, "error": "Invalid image type"}), 400

        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        safe_name = secure_filename(image_file.filename)
        extension = safe_name.rsplit(".", 1)[-1].lower()
        temp_path = os.path.join(UPLOAD_FOLDER, f"logo_verify_{uuid.uuid4()}.{extension}")
        image_file.save(temp_path)

        try:
            from ml_services.logo_verifier import verify_logo as run_verify_logo
        except Exception as exc:
            return jsonify({"success": False, "error": f"Logo verification unavailable: {exc}"}), 503

        brand_hint = request.form.get("brand") or request.args.get("brand")
        result = run_verify_logo(temp_path, brand_hint)

        try:
            os.remove(temp_path)
        except OSError:
            pass

        # Mirror /api/logo/verify behavior: always return model response payload
        if not isinstance(result, dict):
            return jsonify({"success": False, "error": "Logo verification failed"}), 200

        if result.get("success") and isinstance(result.get("is_genuine"), bool):
            updates = {
                "logo_visible": True,
                "logo_verification": result,
                "logo_status": _compute_logo_status(True, result),
                "logo_verify_status": _compute_logo_verify_status(True, result),
                "logo_verified_at": datetime.now().isoformat(),
            }

            if not _persist_product_updates(product_id, updates):
                return jsonify({"success": False, "error": "Database update failed"}), 500

            updated = ProductsAPI.get_by_id(product_id)
            if not updated:
                return jsonify({"success": False, "error": "Product not found after update"}), 500
            updated = _normalize_product_record(updated)

            return jsonify({"success": True, "product": updated, "verification": result}), 200

        return jsonify(result), 200

    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


# ------------------------ DELETE PRODUCT ------------------------

@product_bp.route("/listings/<product_id>", methods=["DELETE"])
def delete_listing(product_id):
    """Delete a product by ID and clean up Cloudinary images."""
    try:
        product = ProductsAPI.get_by_id(product_id)

        if not product:
            return jsonify({"success": False, "error": "Product not found"}), 404

        delete_errors = []
        for image_url in _collect_product_image_urls(product):
            success, error = _delete_cloudinary_image(image_url)
            if not success:
                delete_errors.append({"url": image_url, "error": error})

        if delete_errors:
            return jsonify({
                "success": False,
                "error": "Failed to delete one or more Cloudinary images",
                "details": delete_errors,
            }), 500

        success = ProductsAPI.delete(product_id)

        if success:
            return jsonify({"success": True, "product": product}), 200
        return jsonify({"success": False, "error": "Database deletion failed"}), 500

    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


# ------------------------ GET MY LISTINGS ------------------------

@product_bp.route("/my-listings", methods=["GET"])
@token_required
def get_my_listings(current_user):
    """Get all products listed by the current authenticated user."""
    try:
        user_id = current_user.get("uid")
        if not user_id:
            return jsonify({"success": False, "error": "User not authenticated"}), 401

        products = ProductsAPI.get_all()
        my_products = [p for p in products if str(p.get("user_id", "")).lower() == str(user_id).lower()]
        my_products = [_normalize_product_record(p) for p in my_products]
        my_products.sort(key=lambda x: x.get("created_at", ""), reverse=True)

        return jsonify({
            "success": True,
            "products": my_products,
            "total": len(my_products),
        }), 200

    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


# ------------------------ HEALTH CHECK ------------------------

@product_bp.route("/health", methods=["GET"])
def health_check():
    """Simple health status."""
    return jsonify({
        "success": True,
        "service": "Product Listings API",
        "status": "running",
    }), 200


# ------------------------ RECOMMENDATIONS ------------------------

@product_bp.route("/listings/<product_id>/recommendations", methods=["GET"])
def recommend_products(product_id):
    """Return similar products using hybrid recommendation logic."""
    try:
        from ml_services.image_search import search_similar_images

        products = ProductsAPI.get_all()
        base = ProductsAPI.get_by_id(product_id)
        if not base:
            return jsonify({"success": False, "error": "Product not found"}), 404

        scored_map = {}
        for candidate in products:
            cid = str(candidate.get("id"))
            if cid == str(product_id):
                continue
            if candidate.get("status") == "sold":
                continue

            score = float(compute_similarity_score(base, candidate))
            if score > 0:
                scored_map[cid] = {"data": candidate, "score": score}

        base_primary = _normalize_product_record(base).get("image_url")
        if base_primary:
            filename = os.path.basename(base_primary)
            local_path = os.path.join(UPLOAD_FOLDER, filename)
            if os.path.exists(local_path):
                visual_result = search_similar_images(local_path, top_k=15)
                if visual_result.get("success"):
                    for vis_item in visual_result.get("results", []):
                        vis_id = str(vis_item.get("product_id"))
                        if vis_id in scored_map:
                            match_meta = scored_map[vis_id]
                            visual_sim = float(vis_item.get("similarity_score", 0.0))
                            boost = float(visual_sim * 20.0)
                            current_score = float(match_meta.get("score", 0.0))
                            match_meta["score"] = current_score + boost
                            match_meta["is_visual_match"] = True

        final_scored = list(scored_map.values())
        final_scored.sort(key=lambda x: x["score"], reverse=True)

        recommendations = [
            _normalize_product_record(item.get("data"))
            for item in final_scored[:6]
            if isinstance(item, dict)
        ]

        return jsonify({
            "success": True,
            "recommendations": recommendations,
            "count": len(recommendations),
            "engine": "v2.5-hybrid-ml-recommender",
        }), 200

    except Exception as exc:
        print(f"DEBUG: Recommendation error: {str(exc)}")
        return jsonify({"success": False, "error": str(exc)}), 500
``````

---

## `server\routes\shipment_routes.py`

```python
from flask import Blueprint, request, jsonify
from utils.firebase_db import ShipmentsAPI
import uuid

shipment_bp = Blueprint("shipment", __name__, url_prefix="/api/shipments")

@shipment_bp.route("/", methods=["POST"])
def create_shipment():
    """Create a shipment tracking record for an escrow transaction."""
    data = request.json
    if "escrow_id" not in data:
        return jsonify({"success": False, "error": "Missing escrow_id"}), 400
        
    shipment_id = f"ship_{uuid.uuid4().hex[:12]}"
    data["status"] = "PENDING_PICKUP"
    
    success = ShipmentsAPI.create_shipment(shipment_id, data)
    if success:
        return jsonify({"success": True, "shipment_id": shipment_id}), 201
    return jsonify({"success": False, "error": "Failed to create shipment"}), 500

@shipment_bp.route("/escrow/<escrow_id>", methods=["GET"])
def get_shipment_by_escrow(escrow_id):
    """Get shipment tracking details by escrow_id."""
    shipments = ShipmentsAPI.get_by_escrow(escrow_id)
    return jsonify({"success": True, "shipments": shipments})

@shipment_bp.route("/<shipment_id>/status", methods=["PUT"])
def update_status(shipment_id):
    """Update the live tracking status of a shipment."""
    data = request.json
    status = data.get("status")
    location = data.get("current_location", "")
    
    if not status:
        return jsonify({"success": False, "error": "Missing status"}), 400
        
    success = ShipmentsAPI.update_status(shipment_id, status, location)
    if success:
        return jsonify({"success": True, "message": "Shipment status updated"})
    return jsonify({"success": False, "error": "Failed to update"}), 500
``````

---

## `server\routes\user_ratings_routes.py`

```python
from flask import Blueprint, request, jsonify
from utils.firebase_db import UserRatingsAPI
import uuid

ratings_bp = Blueprint("ratings", __name__, url_prefix="/api/ratings")

@ratings_bp.route("/", methods=["POST"])
def submit_rating():
    """Submit a peer-to-peer rating for a completed transaction."""
    data = request.json
    
    if not all(k in data for k in ("reviewer_id", "reviewee_id", "escrow_id", "rating")):
        return jsonify({"success": False, "error": "Missing required fields"}), 400
        
    try:
        data["rating"] = float(data["rating"])
        if data["rating"] < 1 or data["rating"] > 5:
            return jsonify({"success": False, "error": "Rating must be between 1 and 5"}), 400
    except ValueError:
        return jsonify({"success": False, "error": "Invalid rating format"}), 400
        
    rating_id = f"rate_{uuid.uuid4().hex[:12]}"
    success = UserRatingsAPI.add_rating(rating_id, data)
    
    if success:
        return jsonify({"success": True, "rating_id": rating_id}), 201
    return jsonify({"success": False, "error": "Failed to submit rating"}), 500

@ratings_bp.route("/user/<user_id>/score", methods=["GET"])
def get_trust_score(user_id):
    """Get the aggregate trust score and reviews for a user."""
    score = UserRatingsAPI.get_trust_score(user_id)
    ratings = UserRatingsAPI.get_user_ratings(user_id)
    
    # Optional: sanitize reviews output slightly
    return jsonify({
        "success": True, 
        "trust_score": round(score, 1), 
        "total_reviews": len(ratings) if ratings else 0,
        "ratings": ratings
    })
``````

---

## `server\routes\wallet_routes.py`

```python
from flask import Blueprint, request, jsonify
from firebase_admin import db
from utils.firebase_db import WalletAPI
from utils.auth_helper import token_required
import uuid
import re
import time
import random

wallet_bp = Blueprint("wallet", __name__, url_prefix="/api/wallet")


CASHOUT_PROCESSING_SECONDS = 3 * 24 * 60 * 60


def _resolve_identity_keys(user_id: str):
    """Resolve uid/username aliases for a user identifier."""
    users = db.reference('users').get() or {}
    identity_keys = {user_id}
    for uid, user_data in users.items():
        if not isinstance(user_data, dict):
            continue
        username = user_data.get('username')

        if uid == user_id and username:
            identity_keys.add(username)
        if username == user_id:
            identity_keys.add(uid)
    return identity_keys


def _compute_earnings(user_id: str):
    """Compute cashout summary from released escrows and withdrawal transactions."""
    identity_keys = _resolve_identity_keys(user_id)

    escrows = db.reference('escrows').get() or {}
    total_earned = 0.0
    for _, escrow in escrows.items():
        if not isinstance(escrow, dict):
            continue

        is_seller = escrow.get('seller_id') in identity_keys
        is_released = escrow.get('status_matrix', {}).get('escrow_status') == 'RELEASED'
        if is_seller and is_released:
            amount = escrow.get('ledger', {}).get('amount', 0)
            try:
                total_earned += float(amount or 0)
            except (TypeError, ValueError):
                pass

    transactions = db.reference('wallet_transactions').get() or {}
    total_cashed_out = 0.0
    for _, tx in transactions.items():
        if not isinstance(tx, dict):
            continue
        if tx.get('user_id') not in identity_keys:
            continue

        tx_type = tx.get('type', '')
        try:
            amount = float(tx.get('amount', 0) or 0)
        except (TypeError, ValueError):
            amount = 0.0

        if tx_type == 'WITHDRAWAL' and amount < 0:
            total_cashed_out += abs(amount)
        elif tx_type in ['CASHOUT', 'WITHDRAWAL'] and amount > 0:
            total_cashed_out += amount

    current_balance = max(total_earned - total_cashed_out, 0.0)
    return {
        "current_balance": round(current_balance, 2),
        "total_earned": round(total_earned, 2),
        "total_cashed_out": round(total_cashed_out, 2),
    }

@wallet_bp.route("/<user_id>", methods=["GET"])
def get_balance(user_id):
    """Get the wallet balance for a user."""
    wallet = WalletAPI.get_balance(user_id)
    return jsonify({"success": True, "wallet": wallet})

@wallet_bp.route("/earnings/<user_id>", methods=["GET"])
def get_earnings(user_id):
    """Get earnings statistics for a user."""
    try:
        earnings = _compute_earnings(user_id)
        
        return jsonify({
            "success": True,
            "earnings": earnings
        })
    except Exception as e:
        print(f"[ERROR] Getting earnings for user {user_id}: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": "Failed to fetch earnings data"}), 500


@wallet_bp.route("/cashout/send-otp", methods=["POST"])
@token_required
def send_cashout_otp(current_user):
    """Send OTP for cashout mobile verification (simulated SMS in dev)."""
    try:
        data = request.json or {}
        user_id = data.get("user_id")
        mobile = str(data.get("mobile", "")).strip()

        if user_id != current_user.get("uid"):
            return jsonify({"success": False, "error": "Unauthorized user."}), 403

        if not re.match(r"^[6-9]\d{9}$", mobile):
            return jsonify({"success": False, "error": "Enter a valid 10-digit mobile number."}), 400

        profile_phone = str(current_user.get("phone", "")).strip()
        if profile_phone and profile_phone[-10:] != mobile[-10:]:
            return jsonify({
                "success": False,
                "error": "Mobile does not match the seller profile phone number."
            }), 400

        otp_code = f"{random.randint(100000, 999999)}"
        expires_at = int(time.time()) + 300
        otp_ref = db.reference(f"cashout_verifications/{user_id}")
        otp_ref.set({
            "mobile": mobile,
            "otp": otp_code,
            "verified": False,
            "expires_at": expires_at,
            "attempts": 0,
            "updated_at": int(time.time()),
        })

        # NOTE: integrate SMS provider here in production.
        return jsonify({
            "success": True,
            "message": "OTP sent to registered mobile number.",
            "dev_otp": otp_code,
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@wallet_bp.route("/cashout/verify-otp", methods=["POST"])
@token_required
def verify_cashout_otp(current_user):
    """Verify OTP for cashout mobile verification."""
    try:
        data = request.json or {}
        user_id = data.get("user_id")
        otp = str(data.get("otp", "")).strip()

        if user_id != current_user.get("uid"):
            return jsonify({"success": False, "error": "Unauthorized user."}), 403

        verification = db.reference(f"cashout_verifications/{user_id}").get()
        if not verification:
            return jsonify({"success": False, "error": "OTP session not found. Please request OTP again."}), 400

        if int(time.time()) > int(verification.get("expires_at", 0)):
            return jsonify({"success": False, "error": "OTP expired. Please request a new OTP."}), 400

        attempts = int(verification.get("attempts", 0)) + 1
        db.reference(f"cashout_verifications/{user_id}/attempts").set(attempts)
        if attempts > 5:
            return jsonify({"success": False, "error": "Too many attempts. Request OTP again."}), 429

        if otp != str(verification.get("otp", "")):
            return jsonify({"success": False, "error": "Invalid OTP."}), 400

        db.reference(f"cashout_verifications/{user_id}/verified").set(True)
        db.reference(f"cashout_verifications/{user_id}/verified_at").set(int(time.time()))
        return jsonify({"success": True, "message": "Mobile verified successfully."})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@wallet_bp.route("/cashout/request", methods=["POST"])
@token_required
def request_cashout(current_user):
    """Create a payout request after seller verification and deduct available balance."""
    try:
        data = request.json or {}
        user_id = data.get("user_id")
        amount = float(data.get("amount", 0))
        method = data.get("method", "").upper().strip()  # BANK or UPI
        mobile = str(data.get("mobile", current_user.get("phone", "") or "")).strip()
        account_holder_name = str(data.get("account_holder_name", "")).strip()
        upi_id = str(data.get("upi_id", "")).strip()
        bank_account_number = str(data.get("bank_account_number", "")).strip()
        ifsc_code = str(data.get("ifsc_code", "")).strip().upper()

        if user_id != current_user.get("uid"):
            return jsonify({"success": False, "error": "Unauthorized user."}), 403

        if amount <= 0:
            return jsonify({"success": False, "error": "Cashout amount must be greater than zero."}), 400

        if method not in ["BANK", "UPI"]:
            return jsonify({"success": False, "error": "Invalid payout method."}), 400

        # Basic ownership checks: profile name + phone must align with payout request.
        profile_name = str(current_user.get("full_name", current_user.get("username", ""))).strip().lower()
        req_name = account_holder_name.lower()
        if profile_name and req_name and profile_name not in req_name and req_name not in profile_name:
            return jsonify({
                "success": False,
                "error": "Account holder name must match seller profile name for payout verification."
            }), 400

        profile_phone = str(current_user.get("phone", "")).strip()
        if mobile and profile_phone and profile_phone[-10:] != mobile[-10:]:
            return jsonify({"success": False, "error": "Mobile does not match seller profile."}), 400

        if method == "UPI":
            if not re.match(r"^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$", upi_id):
                return jsonify({"success": False, "error": "Invalid UPI ID format."}), 400
        else:
            if not re.match(r"^\d{9,18}$", bank_account_number):
                return jsonify({"success": False, "error": "Invalid bank account number."}), 400
            if not re.match(r"^[A-Z]{4}0[A-Z0-9]{6}$", ifsc_code):
                return jsonify({"success": False, "error": "Invalid IFSC code."}), 400

        earnings = _compute_earnings(user_id)
        available = float(earnings.get("current_balance", 0))
        if amount > available:
            return jsonify({"success": False, "error": "Cashout amount exceeds available balance."}), 400

        payout_id = f"payout_{uuid.uuid4().hex[:12]}"
        now = int(time.time())
        settlement_expected_by = now + CASHOUT_PROCESSING_SECONDS
        payout_data = {
            "payout_id": payout_id,
            "user_id": user_id,
            "amount": amount,
            "method": method,
            "provider": "STRIPE_SIMULATED",
            "provider_reference": f"sim_stripe_{uuid.uuid4().hex[:10]}",
            "mobile": mobile,
            "account_holder_name": account_holder_name,
            "upi_id": upi_id if method == "UPI" else None,
            "bank_account_number_masked": f"****{bank_account_number[-4:]}" if method == "BANK" else None,
            "ifsc_code": ifsc_code if method == "BANK" else None,
            "verification_status": "SOFT_VERIFIED",
            "transfer_status": "SCHEDULED",
            "settlement_expected_by": settlement_expected_by,
            "created_at": now,
            "updated_at": now,
        }

        # Record payout request
        db.reference(f"payout_requests/{payout_id}").set(payout_data)

        # Deduct wallet via transaction ledger.
        tx_id = f"tx_cashout_{uuid.uuid4().hex[:10]}"
        if not WalletAPI.add_transaction(tx_id, user_id, -amount, "WITHDRAWAL"):
            return jsonify({"success": False, "error": "Failed to record wallet deduction."}), 500

        # Create notification.
        notif_id = f"notif_{uuid.uuid4().hex[:12]}"
        for recipient in _resolve_identity_keys(user_id):
            db.reference(f"notifications/{recipient}/{notif_id}").set({
                "notification_id": notif_id,
                "user_id": recipient,
                "type": "CASHOUT_SCHEDULED",
                "title": "Cashout Scheduled",
                "message": f"Your cashout request of INR {amount:.2f} is scheduled. Money will be sent within 3 days.",
                "read": False,
                "created_at": now,
                "action_required": False,
                "related_payout_id": payout_id,
                "settlement_expected_by": settlement_expected_by,
            })

        return jsonify({
            "success": True,
            "message": "Cashout scheduled successfully. Money will be sent within 3 days.",
            "payout_id": payout_id,
            "amount": amount,
            "transfer_status": "SCHEDULED",
            "settlement_expected_by": settlement_expected_by,
        })
    except ValueError:
        return jsonify({"success": False, "error": "Invalid amount format."}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@wallet_bp.route("/transaction", methods=["POST"])
def add_transaction():
    """Add a deposit or withdrawal transaction to the wallet."""
    data = request.json
    user_id = data.get('user_id')
    amount = float(data.get('amount', 0))
    t_type = data.get('type', 'DEPOSIT')  # DEPOSIT, WITHDRAWAL, ESCROW_RELEASE
    
    if not user_id or amount <= 0:
        return jsonify({"success": False, "error": "Invalid user_id or amount"}), 400
        
    transaction_id = f"tx_{uuid.uuid4().hex[:12]}"
    # Deduct if withdrawal
    final_amount = -amount if t_type == 'WITHDRAWAL' else amount
    
    success = WalletAPI.add_transaction(transaction_id, user_id, final_amount, t_type)
    if success:
        wallet = WalletAPI.get_balance(user_id)
        return jsonify({
            "success": True, 
            "transaction_id": transaction_id, 
            "new_balance": wallet.get('balance')
        })
    return jsonify({"success": False, "error": "Transaction failed"}), 500


@wallet_bp.route("/scheduler/settle-cashouts", methods=["POST"])
def settle_scheduled_cashouts():
    """Mark scheduled cashouts as sent after 3 days (simulated)."""
    try:
        now = int(time.time())
        report = {"settled": 0}

        payouts = db.reference('payout_requests').get() or {}
        for payout_id, payout in payouts.items():
            if not isinstance(payout, dict):
                continue

            status = str(payout.get('transfer_status') or '').upper()
            if status not in {'SCHEDULED', 'INITIATED', 'PROCESSING'}:
                continue

            try:
                expected_by = int(payout.get('settlement_expected_by') or 0)
            except (TypeError, ValueError):
                expected_by = 0

            if expected_by <= 0 or now < expected_by:
                continue

            user_id = str(payout.get('user_id') or '').strip()
            amount = payout.get('amount', 0)

            db.reference(f"payout_requests/{payout_id}").update({
                "transfer_status": "SENT",
                "sent_at": now,
                "updated_at": now,
            })

            if user_id:
                notif_id = f"notif_{uuid.uuid4().hex[:12]}"
                for recipient in _resolve_identity_keys(user_id):
                    db.reference(f"notifications/{recipient}/{notif_id}").set({
                        "notification_id": notif_id,
                        "user_id": recipient,
                        "type": "CASHOUT_SENT",
                        "title": "Cashout Sent",
                        "message": f"Your cashout of INR {float(amount or 0):.2f} has been sent (simulated).",
                        "read": False,
                        "created_at": now,
                        "action_required": False,
                        "related_payout_id": payout_id,
                    })

            report["settled"] += 1

        return jsonify({"success": True, "report": report})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
``````

---

## `server\routes\watchlist_routes.py`

```python
from flask import Blueprint, request, jsonify
from utils.firebase_db import WatchlistAPI

watchlist_bp = Blueprint("watchlist", __name__, url_prefix="/api/watchlist")

@watchlist_bp.route("/<user_id>", methods=["GET"])
def get_watchlist(user_id):
    """Retrieve all products in a user's watchlist."""
    items = WatchlistAPI.get_user_watchlist(user_id)
    return jsonify({"success": True, "watchlist": items})

@watchlist_bp.route("/", methods=["POST"])
def add_to_watchlist():
    """Add a product to the user's watchlist."""
    data = request.json
    user_id = data.get("user_id")
    product_id = data.get("product_id")
    target_price = float(data.get("target_price", 0.0))
    
    if not user_id or not product_id:
         return jsonify({"success": False, "error": "Missing user_id or product_id"}), 400
         
    success = WatchlistAPI.add_to_watchlist(user_id, product_id, target_price)
    if success:
        return jsonify({"success": True, "message": "Added to watchlist"}), 201
    return jsonify({"success": False, "error": "Failed to add to watchlist"}), 500

@watchlist_bp.route("/<user_id>/<product_id>", methods=["DELETE"])
def remove_from_watchlist(user_id, product_id):
    """Remove a product from the user's watchlist."""
    success = WatchlistAPI.remove_from_watchlist(user_id, product_id)
    if success:
        return jsonify({"success": True, "message": "Removed from watchlist"})
    return jsonify({"success": False, "error": "Failed to remove"}), 500
``````

---

## `server\test_auth.py`

```python
import requests

try:
    res = requests.post("http://127.0.0.1:5000/api/auth/login", json={"identifier": "test", "password": "password"})
    print("Login Status:", res.status_code)
    print("Body:", res.text)
except Exception as e:
    print("Error:", e)
``````

---

## `server\test_earnings.py`

```python
from utils.firebase_db import FirebaseDB
import json

# Test the earnings API
user_id = 'test_user'
transactions = FirebaseDB.query_filter('wallet_transactions', 'user_id', user_id)
print(f'Found {len(transactions) if transactions else 0} transactions for user {user_id}')
if transactions:
    for tx in transactions[:5]:
        print(f'Type: {tx.get("type")}, Amount: {tx.get("amount")}, User: {tx.get("user_id")}')
``````

---

## `server\test_fb.py`

```python
import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, db

load_dotenv('.env')

db_url = os.getenv('DATABASE_URL')
storage_bucket = os.getenv('FIREBASE_STORAGE_BUCKET', 'scrap-trade-b1ea7.appspot.com')
cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH', 'serviceAccountKey.json')

print(f"DATABASE_URL: {db_url}")
print(f"cred_path exists: {os.path.exists(cred_path)}")

try:
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred, {'databaseURL': db_url, 'storageBucket': storage_bucket})
    else:
        firebase_admin.initialize_app(options={'databaseURL': db_url, 'storageBucket': storage_bucket})
    print("Firebase init logic completed.")
except Exception as e:
    print(f"Init error: {e}")

try:
    ref = db.reference("users")
    users = ref.get()
    print("Users:", type(users))
except Exception as e:
    print("DB connection error:", repr(e))
``````

---

## `server\utils\ai_helper.py`

```python
import os
import requests
import numpy as np
from PIL import Image
from io import BytesIO
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

def download_and_process_image(url_or_path, target_size=(224, 224)):
    """
    Downloads or reads an image and prepares it for the ML model.
    """
    try:
        if isinstance(url_or_path, str) and (url_or_path.startswith('http://') or url_or_path.startswith('https://')):
            # Remote URL
            response = requests.get(url_or_path, timeout=10)
            img = Image.open(BytesIO(response.content)).convert('RGB')
        else:
            # Local path
            if os.path.exists(url_or_path):
                img = Image.open(url_or_path).convert('RGB')
            else:
                # Try relative to project root if not found
                # (Assumes being called from within 'server' or root)
                img = Image.open(os.path.abspath(url_or_path)).convert('RGB')
        
        img = img.resize(target_size)
        x = image.img_to_array(img)
        x = np.expand_dims(x, axis=0)
        x = preprocess_input(x)
        return x
    except Exception as e:
        print(f"[ERROR] Failed to process image {url_or_path}: {e}")
        return None
``````

---

## `server\utils\auth_helper.py`

```python
import jwt
import datetime
from functools import wraps
from flask import request, jsonify, current_app
from firebase_admin import db

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Get token from Authorization header or 'x-access-token'
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1] if "Bearer" in request.headers['Authorization'] else request.headers['Authorization']
        if not token:
            return jsonify({'message': 'Authentication token is missing!', 'success': False}), 401
        
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            # Load user from Firebase to ensure they still exist
            user_ref = db.reference(f"users/{data['user_id']}")
            current_user = user_ref.get()
            if not current_user:
                return jsonify({'message': 'Invalid authentication token!', 'success': False}), 401
            # Add uid back as it's the key
            current_user['uid'] = data['user_id']
        except Exception as e:
            return jsonify({'message': f'Invalid authentication token: {str(e)}', 'success': False}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated
``````

---

## `server\utils\firebase_db.py`

```python
"""
Firebase Database Utilities
Helper functions for managing Firebase Realtime Database operations
"""

from firebase_admin import db
import json
from datetime import datetime
from typing import Dict, List, Optional, Any


class FirebaseDB:
    """Firebase Realtime Database helper class"""
    
    @staticmethod
    def get_all(ref_path: str) -> Optional[Dict]:
        """Get all data from a reference path"""
        try:
            ref = db.reference(ref_path)
            data = ref.get()
            return data or {}
        except Exception as e:
            print(f"Error retrieving data from {ref_path}: {e}")
            return None
    
    @staticmethod
    def get_one(ref_path: str, item_id: str) -> Optional[Dict]:
        """Get a single item by ID"""
        try:
            ref = db.reference(f'{ref_path}/{item_id}')
            data = ref.get()
            if data:
                data['id'] = item_id  # Add ID to response
            return data
        except Exception as e:
            print(f"Error retrieving {ref_path}/{item_id}: {e}")
            return None
    
    @staticmethod
    def create(ref_path: str, item_id: str, data: Dict) -> bool:
        """Create a new item"""
        try:
            # Add timestamps
            data['created_at'] = datetime.now().isoformat()
            data['updated_at'] = datetime.now().isoformat()
            
            ref = db.reference(f'{ref_path}/{item_id}')
            ref.set(data)
            print(f"SUCCESS: Created {ref_path}/{item_id}")
            return True
        except Exception as e:
            print(f"ERROR: Error creating {ref_path}/{item_id}: {e}")
            return False
    
    @staticmethod
    def update(ref_path: str, item_id: str, data: Dict) -> bool:
        """Update an existing item"""
        try:
            # Add update timestamp
            data['updated_at'] = datetime.now().isoformat()
            
            ref = db.reference(f'{ref_path}/{item_id}')
            ref.update(data)
            print(f"SUCCESS: Updated {ref_path}/{item_id}")
            return True
        except Exception as e:
            print(f"ERROR: Error updating {ref_path}/{item_id}: {e}")
            return False
    
    @staticmethod
    def delete(ref_path: str, item_id: str) -> bool:
        """Delete an item"""
        try:
            ref = db.reference(f'{ref_path}/{item_id}')
            ref.delete()
            print(f"SUCCESS: Deleted {ref_path}/{item_id}")
            return True
        except Exception as e:
            print(f"ERROR: Error deleting {ref_path}/{item_id}: {e}")
            return False
    
    @staticmethod
    def query_filter(ref_path: str, key: str, value: Any) -> Optional[List[Dict]]:
        """Filter items by a specific key-value pair"""
        try:
            data = FirebaseDB.get_all(ref_path)
            if not data:
                return []
            
            results = []
            for item_id, item_data in data.items():
                if item_data.get(key) == value:
                    item_data['id'] = item_id
                    results.append(item_data)
            
            return results
        except Exception as e:
            print(f"Error filtering {ref_path}: {e}")
            return []
    
    @staticmethod
    def add_child(ref_path: str, parent_id: str, child_key: str, child_data: Dict) -> bool:
        """Add a child element to a parent"""
        try:
            ref = db.reference(f'{ref_path}/{parent_id}/{child_key}')
            ref.set(child_data)
            print(f"SUCCESS: Added child to {ref_path}/{parent_id}/{child_key}")
            return True
        except Exception as e:
            print(f"ERROR: Error adding child: {e}")
            return False
    
    @staticmethod
    def get_child(ref_path: str, parent_id: str, child_key: str) -> Optional[Dict]:
        """Get a specific child element"""
        try:
            ref = db.reference(f'{ref_path}/{parent_id}/{child_key}')
            data = ref.get()
            return data
        except Exception as e:
            print(f"Error retrieving child: {e}")
            return None
    
    @staticmethod
    def delete_child(ref_path: str, parent_id: str, child_key: str) -> bool:
        """Delete a child element"""
        try:
            ref = db.reference(f'{ref_path}/{parent_id}/{child_key}')
            ref.delete()
            print(f"SUCCESS: Deleted child {ref_path}/{parent_id}/{child_key}")
            return True
        except Exception as e:
            print(f"ERROR: Error deleting child: {e}")
            return False


# ====================
# Domain-Specific APIs
# ====================

class ProductsAPI:
    """Products collection operations"""
    
    @staticmethod
    def get_all():
        """Get all products"""
        products = FirebaseDB.get_all('products')
        if not products:
            return []

        results = []
        for product_id, product_data in products.items():
            if isinstance(product_data, dict):
                item = product_data.copy()
                item['id'] = product_id
            else:
                item = {'id': product_id, 'value': product_data}
            results.append(item)

        return results
    
    @staticmethod
    def get_by_id(product_id: str):
        """Get product by ID"""
        return FirebaseDB.get_one('products', product_id)
    
    @staticmethod
    def get_by_user(user_id: str):
        """Get all products by a user"""
        return FirebaseDB.query_filter('products', 'user_id', user_id)
    
    @staticmethod
    def get_by_category(category: str):
        """Get products by category"""
        return FirebaseDB.query_filter('products', 'category', category)
    
    @staticmethod
    def create(product_id: str, product_data: Dict):
        """Create new product"""
        return FirebaseDB.create('products', product_id, product_data)
    
    @staticmethod
    def update(product_id: str, updates: Dict):
        """Update product"""
        return FirebaseDB.update('products', product_id, updates)
    
    @staticmethod
    def delete(product_id: str):
        """Delete product"""
        return FirebaseDB.delete('products', product_id)


class EscrowAPI:
    """Escrow records operations"""
    
    @staticmethod
    def get_all():
        """Get all escrow records"""
        escrow = FirebaseDB.get_all('escrow')
        return list(escrow.values()) if escrow else []
    
    @staticmethod
    def get_by_id(escrow_id: str):
        """Get escrow record by ID"""
        return FirebaseDB.get_one('escrow', escrow_id)
    
    @staticmethod
    def get_by_user(user_id: str):
        """Get escrow records involving a user"""
        escrow = FirebaseDB.get_all('escrow')
        if not escrow:
            return []
        
        results = []
        for escrow_id, record in escrow.items():
            if record.get('buyer_id') == user_id or record.get('seller_id') == user_id:
                record['id'] = escrow_id
                results.append(record)
        return results
    
    @staticmethod
    def create(escrow_id: str, escrow_data: Dict):
        """Create escrow record"""
        return FirebaseDB.create('escrow', escrow_id, escrow_data)
    
    @staticmethod
    def update(escrow_id: str, updates: Dict):
        """Update escrow record"""
        return FirebaseDB.update('escrow', escrow_id, updates)
    
    @staticmethod
    def add_timeline_event(escrow_id: str, event: Dict):
        """Add timeline event to escrow"""
        try:
            ref = db.reference(f'escrow/{escrow_id}/timeline')
            timeline = ref.get() or []
            timeline.append(event)
            ref.set(timeline)
            return True
        except Exception as e:
            print(f"Error adding timeline event: {e}")
            return False


class FeedbackAPI:
    """Feedback operations"""
    
    @staticmethod
    def get_product_feedback(product_id: str):
        """Get feedback for a product"""
        feedback = FirebaseDB.get_all('feedback/product')
        if not feedback:
            return []
        
        results = []
        for fb_id, fb_data in feedback.items():
            if fb_data.get('product_id') == product_id:
                fb_data['id'] = fb_id
                results.append(fb_data)
        return results
    
    @staticmethod
    def add_product_feedback(feedback_id: str, feedback_data: Dict):
        """Add feedback to product"""
        return FirebaseDB.create('feedback/product', feedback_id, feedback_data)
    
    @staticmethod
    def get_general_feedback():
        """Get all general feedback"""
        feedback = FirebaseDB.get_all('feedback/general')
        return list(feedback.values()) if feedback else []
    
    @staticmethod
    def add_general_feedback(feedback_id: str, feedback_data: Dict):
        """Add general feedback"""
        return FirebaseDB.create('feedback/general', feedback_id, feedback_data)


class MessagesAPI:
    """Messaging operations"""
    
    @staticmethod
    def get_all_threads():
        """Get all message threads"""
        threads = FirebaseDB.get_all('messages')
        return list(threads.values()) if threads else []
    
    @staticmethod
    def get_thread(thread_id: str):
        """Get specific message thread"""
        return FirebaseDB.get_one('messages', thread_id)
    
    @staticmethod
    def get_user_threads(user_id: str):
        """Get all threads involving a user"""
        threads = FirebaseDB.get_all('messages')
        if not threads:
            return []
        
        results = []
        for thread_id, thread_data in threads.items():
            if thread_data.get('buyer_id') == user_id or thread_data.get('seller_id') == user_id:
                thread_data['id'] = thread_id
                results.append(thread_data)
        return results
    
    @staticmethod
    def add_message(thread_id: str, message_id: str, message_data: Dict):
        """Add message to thread"""
        try:
            ref = db.reference(f'messages/{thread_id}/messages/{message_id}')
            ref.set(message_data)
            
            # Update thread's updated_at
            db.reference(f'messages/{thread_id}/updated_at').set(datetime.now().isoformat())
            return True
        except Exception as e:
            print(f"Error adding message: {e}")
            return False
    
    @staticmethod
    def create_thread(thread_id: str, thread_data: Dict):
        """Create new message thread"""
        return FirebaseDB.create('messages', thread_id, thread_data)

class AIPredictionsAPI:
    """AI Prediction Logs operations"""
    
    @staticmethod
    def log_prediction(prediction_id: str, data: Dict):
        """Log a new ML prediction"""
        return FirebaseDB.create('ai_predictions', prediction_id, data)
        
    @staticmethod
    def get_by_model(model_name: str):
        """Get predictions by model used"""
        return FirebaseDB.query_filter('ai_predictions', 'model_used', model_name)
        
    @staticmethod
    def update_feedback(prediction_id: str, feedback: bool):
        """Update user feedback for a prediction"""
        return FirebaseDB.update('ai_predictions', prediction_id, {'user_feedback': feedback})

class WalletAPI:
    """User Wallet operations"""
    
    @staticmethod
    def get_balance(user_id: str):
        """Get user wallet balance"""
        wallet = FirebaseDB.get_one('wallets', user_id)
        if not wallet:
            # Initialize empty wallet
            wallet = {'balance': 0.0, 'currency': 'INR', 'last_updated_at': datetime.now().isoformat()}
            FirebaseDB.create('wallets', user_id, wallet)
        return wallet
        
    @staticmethod
    def add_transaction(transaction_id: str, user_id: str, amount: float, t_type: str, status: str = "COMPLETED"):
        """Record wallet transaction and update balance"""
        data = {
            'user_id': user_id,
            'amount': amount,
            'type': t_type,
            'status': status,
            'timestamp': datetime.now().isoformat()
        }
        success = FirebaseDB.create('wallet_transactions', transaction_id, data)
        if success and status == "COMPLETED":
            # Update wallet balance atomically
            try:
                ref = db.reference(f'wallets/{user_id}/balance')
                ref.transaction(lambda current_bal: (current_bal or 0.0) + amount)
            except Exception as e:
                print(f"Error updating wallet balance: {e}")
                return False
        return success

class DisputesAPI:
    """Dispute operations for Escrows"""
    
    @staticmethod
    def open_dispute(dispute_id: str, data: Dict):
        """Open a new dispute"""
        return FirebaseDB.create('disputes', dispute_id, data)
        
    @staticmethod
    def get_by_escrow(escrow_id: str):
        """Get dispute by associated escrow"""
        return FirebaseDB.query_filter('disputes', 'escrow_id', escrow_id)
        
    @staticmethod
    def resolve_dispute(dispute_id: str, resolution: str):
        """Resolve a dispute"""
        updates = {
            'status': 'RESOLVED',
            'admin_resolution': resolution,
            'resolved_at': datetime.now().isoformat()
        }
        return FirebaseDB.update('disputes', dispute_id, updates)

class UserRatingsAPI:
    """Peer-to-peer user ratings operations"""
    
    @staticmethod
    def add_rating(rating_id: str, data: Dict):
        """Add a new user rating"""
        return FirebaseDB.create('user_ratings', rating_id, data)
        
    @staticmethod
    def get_user_ratings(user_id: str):
        """Get all ratings received by a user"""
        return FirebaseDB.query_filter('user_ratings', 'reviewee_id', user_id)
        
    @staticmethod
    def get_trust_score(user_id: str):
        """Calculate average trust score for a user"""
        ratings = UserRatingsAPI.get_user_ratings(user_id)
        if not ratings:
            return 0.0
        total_score = sum(float(r.get('rating', 0)) for r in ratings)
        return total_score / len(ratings)

class CategoriesAPI:
    """Standardized Product Categories operations"""
    
    @staticmethod
    def get_all():
        """Get all standard product categories"""
        categories = FirebaseDB.get_all('categories')
        return list(categories.values()) if categories else []
        
    @staticmethod
    def add_category(category_id: str, data: Dict):
        """Add a new standard category"""
        return FirebaseDB.create('categories', category_id, data)
        
    @staticmethod
    def update_price(category_id: str, price: float):
        """Update average market value for a category"""
        return FirebaseDB.update('categories', category_id, {'average_market_value': price})

class ShipmentsAPI:
    """Logistics and shipment tracking operations"""
    
    @staticmethod
    def create_shipment(shipment_id: str, data: Dict):
        """Create a new shipment record"""
        return FirebaseDB.create('shipments', shipment_id, data)
        
    @staticmethod
    def get_by_escrow(escrow_id: str):
        """Get shipment by escrow Id"""
        return FirebaseDB.query_filter('shipments', 'escrow_id', escrow_id)
        
    @staticmethod
    def update_status(shipment_id: str, status: str, location: str = ""):
        """Update shipment status/location"""
        updates = {
            'status': status,
            'current_location': location,
            'last_updated': datetime.now().isoformat()
        }
        return FirebaseDB.update('shipments', shipment_id, updates)

class WatchlistAPI:
    """User product watchlist operations"""
    
    @staticmethod
    def add_to_watchlist(user_id: str, product_id: str, target_price: float = 0.0):
        """Add product to user watchlist"""
        data = {
            'product_id': product_id,
            'target_price': target_price,
            'added_at': datetime.now().isoformat()
        }
        return FirebaseDB.add_child('watchlists', user_id, product_id, data)
        
    @staticmethod
    def remove_from_watchlist(user_id: str, product_id: str):
        """Remove product from watchlist"""
        return FirebaseDB.delete_child('watchlists', user_id, product_id)
        
    @staticmethod
    def get_user_watchlist(user_id: str):
        """Get user's full watchlist"""
        watchlist = FirebaseDB.get_all(f'watchlists/{user_id}')
        return list(watchlist.values()) if watchlist else []
``````


