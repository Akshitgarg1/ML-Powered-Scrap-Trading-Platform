# ♻️ TradeSmart: AI-Powered B2B E-waste & Scrap Trading Platform

![Python](https://img.shields.io/badge/Python-3.10-blue)
![React](https://img.shields.io/badge/React-18-blue)
![Flask](https://img.shields.io/badge/Flask-Backend-black)
![Firebase](https://img.shields.io/badge/Firebase-Realtime_DB-orange)
![License](https://img.shields.io/badge/License-MIT-green)

**TradeSmart** is an intelligent full-stack web application that modernizes the second-hand goods and scrap trading ecosystem. By seamlessly integrating **Machine Learning** natively inside core user workflows, TradeSmart ensures **fair pricing**, **fraud prevention**, and **trustworthy transactions** while promoting sustainability and the circular economy.

---

## 🚀 Project Overview

The **TradeSmart** platform bridges the gap between buyers and sellers of second-hand items and scrap materials.  
Unlike traditional systems, machine learning features aren't isolated apps—they are organically integrated. It leverages these models directly during listings and product search to provide **price prediction**, **image-based product search**, **fake logo verification**, and **personalized recommendations**.

This platform helps users:
- Get **fair price suggestions** automatically while listing items.
- Avoid **counterfeit products** securely behind the scenes.
- Find visually similar items natively within marketplace workflows.
- Trade second-hand items efficiently with our state-of-the-art escrow process.

---

## 💡 Problem Statement

Traditional second-hand markets face:

- ❌ Lack of price transparency  
- ❌ No fraud detection mechanisms  
- ❌ Informal and unsafe transactions  
- ❌ Limited product discovery  

This platform solves these problems using intelligent ML pipelines and secure web architecture.

---

## 📊 Platform Comparison

| Feature | Traditional Second-Hand Market | TradeSmart |
|----------|--------------------------|---------------|
| Price Transparency | ❌ No | ✅ ML-Based Prediction |
| Fraud Detection | ❌ None | ✅ Logo Verification Workflow |
| Image Search | ❌ Not Available | ✅ Deep Learning Integrated Search |
| Personalized Recommendations | ❌ No | ✅ Content-Based Filtering |
| Secure Transactions | ❌ Informal | ✅ Production-Grade Escrow V2 |
| Digital Identity | ❌ Unverified | ✅ Firebase Authentication |

---

## 🧠 Integrated Machine Learning Modules

The platform's intelligence operates natively without separating users from core journeys:

| Module | Algorithm / Technique | Status |
|------|----------------------|--------|
| **Visual Search Engine** | **EfficientNetB0** + Cosine Similarity | ✅ Integrated in Search |
| **Smart Price Estimator** | **Random Forest Regressor** (Multi-feature) | ✅ Integrated in Listings |
| **Authenticity Lab** | CNN + Feature Matching (LogoGuard AI) | ✅ Integrated Verification |
| **Recommendations** | TF-IDF + Cosine Similarity | 🛠️ In-Progress |

---

## 🏗️ System Architecture

```text
User (Frontend - React + Modern Glassmorphism UI)
        ↓
Flask REST API
        ↓
Centralized ML Services Layer
        ↓
Firebase Realtime Database & Storage
```
---

## 🧰 Tech Stack

| Layer | Technologies |
|------|-------------|
| **Frontend** | React.js, Tailwind CSS, JavaScript |
| **Backend** | Flask (Python), Centralized REST APIs |
| **Database** | Firebase Realtime Database (Nodes for Wallets, Ratings, Scrap, Shipments, Watchlists) |
| **Authentication** | Firebase Authentication |
| **Storage** | Firebase Storage |

---

## 🎨 Design & UX

The platform features a **Premium Design System** built on:
- **Glassmorphism Aesthetic**: Translucent layers with subtle blurs for a modern, futuristic feel.
- **Dynamic Color Palettes**: Space-themed gradients (Indigo/Purple for Vision, Emerald/Teal for Finance).
- **Interactive UI**: Micro-animations, responsive hover effects, and real-time validation feedback.
- **Dark Mode Optimized**: Native support for high-contrast dark environments.

## 📂 Project Structure

```bash
TradeSmart/
│
├── client/ # Frontend (React + Tailwind)
│ ├── src/
│ ├── public/
│ └── package.json
│
├── server/ # Backend (Flask)
│ ├── app.py
│ ├── routes/
│ ├── ml_services/
│ └── requirements.txt
│
├── data/ # Datasets & processing scripts
├── scripts/ # Helper scripts
├── ml_models/ # Training scripts (no large models)
│
├── .gitignore (Secured config)
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Akshitgarg1/ML-Powered-Scrap-Trading-Platform.git
cd ML-Powered-Scrap-Trading-Platform
```

### 2️⃣ Frontend Setup
```text
cd client
npm install
npm run dev
```

### 3️⃣ Backend Setup
```text
cd server
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### 🔐 Firebase Admin Setup (Required for Escrow)

- Generate Firebase Service Account Key
- Place it inside:
```bash
server/serviceAccountKey.json
```
- Update databaseURL in app.py
- Run the flask app.
- ⚠️ `serviceAccountKey.json` is safely ignored via `.gitignore` to prevent any secret leakages to GitHub.

---

## 🔐 Security Considerations

- Firebase role-based authentication
- Protected API routes
- **Strict Git policies**: Virtual environments, env variables, test data, and temp files are excluded via updated `.gitignore`.
- No sensitive keys in branch history.

---

## 🔒 Escrow V2 Architecture

Our production-grade escrow system natively manages transaction lifecycles and physical fulfillment:

- 🔁 **Atomic Firebase Transactions**
- 🔐 **Role-Based Access Control** (Buyer / Seller / Admin / System)
- 📊 **Multi-State Synchronization** (Escrow status, Payment status, Shipment tracking status)
- ⏳ **Auto-Refund** (Shipping Timeout) & **Auto-Release** (Delivery Confirmation Timeout)
- 🛡️ **Admin Dispute Lock Mechanism**
- 📜 **Immutable Audit Trail** (Tracking via AI & User nodes)

---

## 🌱 Sustainability Impact

| Initiative | Description |
|------------|------------|
| Responsible Recycling | Encourages proper disposal and reuse of second-hand materials. |
| Reduction of Waste | Minimizes landfill contribution through structured resale. |
| Circular Economy Adoption | Promotes reuse and redistribution of materials within the economy. |
| Digital Trust | Builds transparency and credibility natively using ML-based verification systems. |

---

## 🎓 Academic Context

| Category        | Details                                   |
|----------------|-------------------------------------------|
| Degree         | B.Tech (Computer Science & Engineering)   |
| Project Type   | Final Year Major Project                  |
| Focus Areas    | Machine Learning, Web Development, Sustainability |

---

## 📄 License & Author

This project is licensed under the MIT License.

**Akshit Garg**  
B.Tech CSE | Final Year  
Machine Learning & Full-Stack Enthusiast  

⭐ If you found this project useful, consider giving it a star!
