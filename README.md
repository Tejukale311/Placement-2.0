# Placement Preparation Portal

A comprehensive full-stack web application for placement preparation, similar to platforms like placementpreparation.io. Users can practice aptitude questions, programming exercises, company-specific interview questions, and take mock tests.

![React](https://img.shields.io/badge/React-18.2-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue)

## 🚀 Features

### User Features
- **User Authentication**: OTP-based registration and login (Email)
- **Aptitude Section**: Quantitative, Logical, Verbal Reasoning with multiple difficulty levels
- **Programming Section**: Coding exercises with Monaco Editor (JavaScript, Python, Java, C++)
- **Code Execution**: Integrated Judge0 API for code compilation and execution
- **Company-Specific Preparation**: TCS, Infosys, Wipro, Accenture, Capgemini, Amazon, Google questions
- **Daily Challenge**: One new coding problem every day with points
- **Mock Tests**: Timed tests with automatic submission
- **Leaderboard**: Top performers ranking system
- **Bookmarks**: Save questions for later practice
- **Resume Builder**: Create and download professional resumes as PDF

### Admin Features
- **Dashboard**: Overview of platform statistics
- **User Management**: View, edit, delete users
- **Question Management**: Add, edit, delete aptitude questions
- **Coding Question Management**: Add, edit, delete coding problems
- **Company Questions**: Manage company-specific questions
- **Mock Test Creation**: Create and manage mock tests
- **Analytics**: View platform usage statistics
- **Leaderboard Management**: View and reset leaderboard

## 🛠️ Tech Stack

### Frontend
- **React.js 18** - UI Framework
- **Tailwind CSS 3.4** - Styling
- **React Router v6** - Navigation
- **Axios** - HTTP Client
- **Monaco Editor** - Code Editor
- **Lucide React** - Icons
- **Recharts** - Charts

### Backend
- **Node.js** - Runtime
- **Express.js** - Web Framework
- **MongoDB (Atlas)** - Database
- **JWT** - Authentication
- **Nodemailer** - Email Service

### External APIs
- **Judge0 API** - Code Compilation & Execution

## 📁 Project Structure

```
placement-preparation-portal/
├── backend/
│   ├── config/
│   │   └── db.js              # Database connection
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   ├── questionController.js
│   │   ├── codingController.js
│   │   ├── companyController.js
│   │   ├── mockTestController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   └── admin.js           # Admin authorization
│   ├── models/
│   │   ├── User.js
│   │   ├── Question.js
│   │   ├── CodingQuestion.js
│   │   ├── CompanyQuestion.js
│   │   ├── MockTest.js
│   │   └── Submission.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── questionRoutes.js
│   │   ├── codingRoutes.js
│   │   ├── companyRoutes.js
│   │   ├── mockTestRoutes.js
│   │   ├── userRoutes.js
│   │   └── leaderboardRoutes.js
│   ├── utils/
│   │   └── emailSender.js     # Email utilities
│   ├── server.js              # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layouts/       # Layout components
│   │   │   └── admin/         # Admin components
│   │   ├── pages/
│   │   │   ├── auth/         # Login, Signup, OTP
│   │   │   ├── admin/        # Admin dashboard pages
│   │   │   ├── aptitude/     # Aptitude questions
│   │   │   ├── programming/  # Coding exercises
│   │   │   ├── companies/    # Company questions
│   │   │   └── tests/       # Mock tests
│   │   ├── context/          # React contexts
│   │   ├── services/         # API services
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── SPEC.md                    # Technical specification
└── README.md
```

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas Account
- Judge0 API Key (RapidAPI)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd placement-preparation-portal
```

2. **Setup Backend**
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
# - MONGODB_URI: Your MongoDB Atlas connection string
# - JWT_SECRET: Your secret key
# - SMTP_* : Your email credentials
# - JUDGE0_API_KEY: Your RapidAPI key

# Start backend server
npm run dev
```

3. **Setup Frontend**
```bash
cd frontend
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

4. **Access the Application**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Creating Admin User

After starting the server, create an admin user by accessing:
```
POST /api/auth/create-admin
{
  "name": "Admin",
  "email": "admin@example.com",
  "password": "admin123",
  "isAdmin": true
}
```

Or use the backend script:
```bash
cd backend
node createAdmin.js
```

## 📝 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@placementportal.com
FROM_NAME=Placement Portal

# Judge0 API
JUDGE0_API_KEY=your_rapidapi_key
JUDGE0_API_HOST=judge0-ce.p.rapidapi.com

FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login (sends OTP)
- `POST /api/auth/verify-otp` - Verify OTP
- `GET /api/auth/me` - Get current user

### Questions
- `GET /api/questions` - Get questions (with filters)
- `GET /api/questions/random` - Get random questions
- `POST /api/questions/:id/submit` - Submit answer
- `POST /api/questions` - Add question (admin)

### Coding Questions
- `GET /api/coding-questions` - Get coding questions
- `POST /api/coding-questions/run` - Run code
- `POST /api/coding-questions/submit` - Submit solution
- `GET /api/coding-questions/daily` - Get daily challenge

### Mock Tests
- `GET /api/mock-tests` - Get all tests
- `GET /api/mock-tests/:id` - Get test details
- `POST /api/mock-tests/:id/submit` - Submit test

### User
- `GET /api/user/profile` - Get profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/bookmarks` - Get bookmarks
- `GET /api/user/stats` - Get user statistics

### Admin
- `GET /api/admin/users` - Get all users
- `POST /api/admin/questions` - Add question
- `GET /api/admin/analytics` - Get analytics

## 📄 Available Scripts

### Backend
```bash
npm run dev    # Start development server
npm start      # Start production server
```

### Frontend
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run preview # Preview production build
```

## 🎨 UI/UX Features

- **Dark/Light Mode**: Toggle between themes
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Modern Dashboard**: Clean, professional interface
- **Interactive Code Editor**: Monaco Editor with syntax highlighting
- **Progress Tracking**: Visual charts and statistics

## 🚢 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Backend (Render)
1. Connect GitHub repository
2. Set environment variables
3. Deploy as Node.js service

### Database (MongoDB Atlas)
1. Create MongoDB Atlas account
2. Create cluster
3. Get connection string
4. Add to backend .env

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Judge0 API](https://judge0.com/) for code execution
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for code editing
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide Icons](https://lucide.dev/) for icons

---

Made with ❤️ for placement preparation

