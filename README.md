# ♻️ ML Powered Scrap Trading Platform

An intelligent full-stack web application that modernizes the scrap and second-hand goods trading ecosystem using **Machine Learning**, ensuring **fair pricing**, **fraud prevention**, and **trustworthy transactions** while promoting sustainability and the circular economy.

---

## 🚀 Project Overview

The **ML Powered Scrap Trading Platform** is designed to bridge the gap between buyers and sellers of scrap and second-hand items.  
It leverages machine learning models to provide **price prediction**, **image-based product search**, **fake logo verification**, and **personalized recommendations**.

This platform helps users:
- Get **fair price suggestions**
- Avoid **counterfeit products**
- Find similar items using images
- Trade scrap securely and efficiently

---

## 🧠 Key Features

- 🔍 **Image-Based Product Search**  
  Uses deep learning to find visually similar scrap items.

- 💰 **Fair Price Prediction**  
  ML model predicts an optimal price range based on category, condition, and market trends.

- 🛡️ **Fake Logo Verification**  
  CNN-based model detects counterfeit brand logos to prevent fraud.

- 🎯 **Personalized Recommendations**  
  Recommends relevant items using content-based filtering.

- 🔐 **Secure Authentication**  
  Firebase Authentication for user login and role management.

- 💬 **Messaging & Escrow System**  
  Secure buyer–seller communication and transaction handling.

---

## 🧰 Tech Stack


| Layer | Technologies |
|------|-------------|
| **Frontend** | React.js, Tailwind CSS, JavaScript |
| **Backend** | Flask (Python), REST APIs |
| **Database** | Firebase Realtime Database |
| **Authentication** | Firebase Authentication |
| **Storage** | Firebase Storage |

---

### 🤖 Machine Learning Modules

| Module | Algorithm / Technique |
|------|----------------------|
| Image-Based Search | MobileNetV2 + Cosine Similarity |
| Price Prediction | Random Forest Regressor |
| Logo Verification | Convolutional Neural Network (CNN) |
| Recommendations | TF-IDF + Cosine Similarity |

---

## 📂 Project Structure

```bash
ML-Powered-Scrap-Trading-Platform/
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
├── ml_models/ # Training scripts (no large models)
│
├── .gitignore
├── README.md
└── docker-compose.yml (optional)
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
pip install -r requirements.txt
python app.py
```
---

## 📦 ML Models & Datasets

- ⚠️ Large ML models and datasets are intentionally NOT included in this repository.

- Models are stored externally (cloud/local)

- Download links and instructions can be added when deploying

- This keeps the repository lightweight and collaboration-friendly.

## 🔐 Environment Variables
```text
Create a .env file in both client and server folders for sensitive keys:

FIREBASE_API_KEY=your_key_here
FIREBASE_PROJECT_ID=your_project_id
```

## 👥 Team Collaboration Workflow

- Each member works on a separate branch

- Changes are merged using Pull Requests

- No need to download the full project again — use git pull

---

## 🌱 Sustainability Impact

- This project promotes:

-- Responsible recycling

-- Reduction of waste

-- Circular economy adoption

-- Digital trust in informal scrap markets

## 🎓 Academic Context

- Degree: B.Tech (Computer Science & Engineering)

- Project Type: Final Year Major Project

- Focus Areas: Machine Learning, Web Development, Sustainability

## 📌 Future Enhancements

- Real-time price fluctuation tracking

- Mobile application support

- Blockchain-based transaction verification

- Multilingual support

---

## 👨‍💻 Author

Akshit Garg
B.Tech CSE | Final Year
Passionate about ML, Full-Stack Development & Sustainable Tech

---

⭐ If you like this project

Give it a ⭐ on GitHub — it really helps!
