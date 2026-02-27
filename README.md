# HRMS Lite - Fullstack Modern Dashboard

A production-grade Human Resource Management System. This repository contains both the React/Tailwind frontend and the FastAPI backend.

## 🚀 Live Demo
- **Live Application:** [INSERT YOUR VERCEL LINK HERE]
- **API Documentation (Swagger):** [INSERT YOUR RENDER LINK HERE]/docs

---

## 🏗️ Project Architecture (Monorepo)

This project is separated into two distinct microservices for clean architecture:

* `/frontend` - A modern, responsive React Single Page Application (SPA).
* `/backend` - A fast, typed REST API built with Python.

### 💻 Frontend Tech Stack
* **Framework:** React 18 (via Vite for optimized build speeds)
* **Styling:** Tailwind CSS (Utility-first modern styling)
* **Icons:** Lucide React
* **Deployment:** Vercel

### ⚙️ Backend Tech Stack
* **Framework:** FastAPI (Python 3.11)
* **Database:** SQLAlchemy (SQLite for Dev, PostgreSQL compatible)
* **Validation:** Pydantic (Strict typing and email validation)
* **Deployment:** Render

---

## ✨ Features Implemented
1. **Full CRUD Operations:** Add, view, search, and safely delete employees.
2. **Attendance Tracking:** Mark employees as Present/Absent with duplicate prevention.
3. **Real-Time Analytics:** Dashboard counters for total staff and daily attendance metrics.
4. **Smart Filtering:** Client-side search and global date-based data fetching.

---

## 🛠️ Local Setup Instructions

If you wish to run this application locally, you will need two terminal windows.

### 1. Start the Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
