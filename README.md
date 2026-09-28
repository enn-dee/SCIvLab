# SCivLab - Interactive Algorithm Learning Platform

<div align="center">

![SCivLab](https://img.shields.io/badge/SCivLab-Learning%20Platform-brightgreen)
![MongoDB](https://img.shields.io/badge/MongoDB-4.4-green)
![Express](https://img.shields.io/badge/Express-4.18-blue)
![React](https://img.shields.io/badge/React-18.2-cyan)
![Node](https://img.shields.io/badge/Node-18.x-green)
![Tailwind](https://img.shields.io/badge/Tailwind-3.x-38bdf8)

**Learn, Visualize, and Master Algorithms with Interactive Coding Challenges**

[Features](#features) • [Tech Stack](#tech-stack) • [Installation](#installation) • [Screenshots](#screenshots) • [API Documentation](#api-documentation)

</div>

---

## 📚 Overview

**SCivLab** is a comprehensive full-stack platform designed to help students learn Data Structures and Algorithms through **visual animations**, **interactive coding challenges**, and **real-time code execution**. The platform also includes a complete **Lab Management System** for teachers to manage practicals, marks, attendance, and student submissions.

### 🎯 Target Users
- **Students** – Learn algorithms, submit code, track progress, and view lab practicals
- **Teachers** – Manage labs, create practicals, evaluate submissions, mark attendance
- **Admins** – Monitor platform activity and student progress

---

## ✨ Features

### 👨‍🎓 Student Features
- **Algorithm Learning**
  - Step-by-step algorithm visualizations (Flowcharts + animations)
  - Code editor with Python/JavaScript support
  - Real-time code execution against test cases
  - Auto-save functionality across devices
  - Progress tracking with completion badges

- **Lab Management**
  - View enrolled labs and practicals
  - Submit code solutions for lab practicals
  - View marks and teacher feedback
  - Track attendance percentage

### 👨‍🏫 Teacher Features
- **Lab Management** – Create and manage multiple labs
- **Student Enrollment** – Add students by roll number (single/bulk)
- **Practical Management** – Create practicals with deadlines and instructions
- **Submission Evaluation** – Review code, approve/reject with feedback
- **Marks Entry** – Enter marks for viva, execution, attendance, internal
- **Attendance Tracking** – Mark attendance for lab/lecture sessions
- **Reports & Analytics** – Export Excel reports (performance, marks analysis, attendance)

### 👑 Admin Features
- Monitor total students, algorithms, submissions
- View detailed student progress and submitted code
- Track platform growth metrics

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT + bcrypt | Authentication & password hashing |
| python-shell | Python code execution |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 + Vite | UI framework & build tool |
| Tailwind CSS + Framer Motion | Styling & animations |
| Monaco Editor | Code editor |
| React Flow | Flowchart visualizations |
| Recharts | Data visualizations |
| Lucide React | Icons |

### Code Execution
- **Judge0 API** (ce.judge0.com) – Secure code execution environment

---

---

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Python 3.x (for code execution)

### Backend Setup

```bash
# Clone the repository
git clone git@github.com:enn-dee/AlgoLab.git
cd scivlab/backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
MONGO_URI=mongodb://localhost:27017/scivlab
SECRET_KEY=your_jwt_secret_key_here
PORT=3000
EOF

# Start the server
npm run dev
Frontend run dev



# Open a new terminal
cd ../frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:3000
EOF

# Start the development server
npm run dev



# Import sample algorithms
cd backend
node src/db/seed/seedFullAlgos.js



## Environment Variables

### Backend (.env)

- MONGO_URI: MongoDB connection string (Default: mongodb://localhost:27017/scivlab)
- SECRET_KEY: JWT secret key (Required)
- PORT: Backend port (Default: 3000)

### Frontend (.env)

- VITE_API_URL: Backend API URL (Default: http://localhost:3000)


## 📡 API Endpoints

### Authentication

- POST /api/auth/register — Student registration
- POST /api/auth/login — Student login
- POST /api/teacher/register — Teacher registration
- POST /api/teacher/login — Teacher login


### Algorithms

- GET /api/algorithms — Get all algorithms
- GET /api/algorithms/:slug — Get algorithm by slug
- GET /api/algo-progress/:slug — Get user's saved code
- POST /api/algo-progress/save — Save user's code
- DELETE /api/algo-progress/reset/:slug — Reset code to template


### Labs & Practicals

- GET /api/labs — Get teacher's labs
- POST /api/labs — Create new lab
- GET /api/practicals/lab/:labId — Get practicals by lab
- POST /api/practicals — Create practical


### Submissions & Marks

- POST /api/submissions — Submit code
- GET /api/submissions/lab/:labId — Get submissions by lab
- POST /api/marks — Enter marks
- GET /api/marks/practical/:practicalId — Get marks by practical
