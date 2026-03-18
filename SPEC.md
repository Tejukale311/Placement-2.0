# Placement Preparation Portal - Technical Specification

## 1. Project Overview

**Project Name:** Placement Preparation Portal
**Type:** Full-Stack Web Application
**Core Functionality:** A comprehensive placement preparation platform where users can practice aptitude questions, programming exercises, company-specific interview questions, and take mock tests.
**Target Users:** Students, graduates, job seekers, and professionals preparing for campus placements and job interviews.

---

## 2. Technology Stack

### Frontend
- **Framework:** React.js 18+
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Code Editor:** Monaco Editor (@monaco-editor/react)
- **PDF Generation:** html2pdf.js
- **Charts:** Recharts
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Authentication:** JWT + OTP
- **Email:** Nodemailer
- **SMS:** Twilio (optional, can use email OTP)
- **Database:** MongoDB (Atlas)

### Compiler Integration
- **API:** Judge0 API (RapidAPI)

### Deployment
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

---

## 3. UI/UX Design Specification

### Color Palette
```
Primary: #6366F1 (Indigo-500)
Primary Dark: #4F46E5 (Indigo-600)
Primary Light: #818CF8 (Indigo-400)
Secondary: #10B981 (Emerald-500)
Accent: #F59E0B (Amber-500)
Background Dark: #0F172A (Slate-900)
Background Light: #F8FAFC (Slate-50)
Surface Dark: #1E293B (Slate-800)
Surface Light: #FFFFFF
Text Dark: #F1F5F9 (Slate-100)
Text Light: #1E293B (Slate-800)
Error: #EF4444 (Red-500)
Success: #22C55E (Green-500)
```

### Typography
- **Primary Font:** Inter
- **Monospace Font:** JetBrains Mono (for code editor)
- **Headings:** Bold, various sizes (h1: 2.5rem, h2: 2rem, h3: 1.5rem, h4: 1.25rem)
- **Body:** Regular, 1rem (16px)
- **Small:** 0.875rem (14px)

### Layout Structure
- **Sidebar:** Fixed left, 280px width, collapsible to 80px
- **Main Content:** Fluid, with max-width 1400px
- **Header:** Fixed top, 64px height
- **Responsive Breakpoints:**
  - Mobile: < 768px (sidebar hidden, hamburger menu)
  - Tablet: 768px - 1024px (collapsed sidebar)
  - Desktop: > 1024px (full sidebar)

### Components

#### Navigation
- Sidebar with icons and labels
- Active state: Indigo background with white text
- Hover state: Slate-700 background

#### Cards
- Border radius: 12px
- Shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
- Padding: 24px

#### Buttons
- Primary: Indigo background, white text, hover darken
- Secondary: Transparent with border
- Border radius: 8px
- Padding: 12px 24px

#### Form Inputs
- Border: 1px solid Slate-300
- Focus: Indigo border with ring
- Border radius: 8px
- Padding: 12px 16px

#### Code Editor
- Monaco Editor with VS Code Dark theme
- Language selector dropdown
- Run and Submit buttons
- Output panel below editor

---

## 4. Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  userType: String, // 'student', 'graduate', 'it-professional', 'non-it-professional'
  password: String (hashed),
  isVerified: Boolean,
  isAdmin: Boolean,
  score: Number,
  testsCompleted: Number,
  bookmarkedQuestions: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Questions Collection
```javascript
{
  _id: ObjectId,
  category: String, // 'aptitude', 'programming'
  subcategory: String, // 'quantitative', 'logical', 'verbal', etc.
  question: String,
  options: [String],
  answer: Number, // Index of correct option
  difficulty: String, // 'easy', 'medium', 'hard'
  explanation: String,
  createdAt: Date
}
```

### CodingQuestions Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  problemStatement: String,
  inputFormat: String,
  outputFormat: String,
  constraints: String,
  testCases: [{
    input: String,
    output: String
  }],
  difficulty: String,
  language: [String], // Supported languages
  starterCode: {
    javascript: String,
    python: String,
    java: String,
    cpp: String,
    sql: String
  },
  createdAt: Date
}
```

### CompanyQuestions Collection
```javascript
{
  _id: ObjectId,
  company: String,
  questions: [{
    type: String, // 'mcq', 'coding', 'interview'
    question: String,
    options: [String],
    answer: Number,
    difficulty: String
  }],
  createdAt: Date
}
```

### MockTests Collection
```javascript
{
  _id: ObjectId,
  title: String,
  company: String,
  duration: Number, // minutes
  sections: [{
    name: String,
    questions: [ObjectId],
    timeLimit: Number
  }],
  totalMarks: Number,
  passingMarks: Number,
  createdAt: Date
}
```

### Bookmarks Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  questionId: ObjectId,
  questionType: String,
  createdAt: Date
}
```

### Submissions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  questionId: ObjectId,
  answer: Mixed,
  isCorrect: Boolean,
  score: Number,
  submittedAt: Date
}
```

---

## 5. API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login (sends OTP)
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `GET /api/auth/me` - Get current user

### Questions
- `GET /api/questions` - Get all questions (with filters)
- `GET /api/questions/:id` - Get single question
- `POST /api/questions` - Add question (admin)
- `PUT /api/questions/:id` - Update question (admin)
- `DELETE /api/questions/:id` - Delete question (admin)

### Coding Questions
- `GET /api/coding-questions` - Get coding questions
- `GET /api/coding-questions/:id` - Get single coding question
- `POST /api/coding-questions` - Add coding question (admin)
- `PUT /api/coding-questions/:id` - Update coding question (admin)
- `DELETE /api/coding-questions/:id` - Delete coding question (admin)
- `POST /api/coding-questions/run` - Run code (Judge0)
- `POST /api/coding-questions/submit` - Submit code

### Company Questions
- `GET /api/companies` - Get all companies
- `GET /api/companies/:name/questions` - Get company questions
- `POST /api/companies` - Add company questions (admin)

### Mock Tests
- `GET /api/mock-tests` - Get all mock tests
- `GET /api/mock-tests/:id` - Get single mock test
- `POST /api/mock-tests` - Create mock test (admin)
- `POST /api/mock-tests/:id/submit` - Submit mock test

### User Data
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/bookmarks` - Get bookmarks
- `POST /api/user/bookmarks/:questionId` - Add bookmark
- `DELETE /api/user/bookmarks/:questionId` - Remove bookmark
- `GET /api/user/submissions` - Get user submissions

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard

### Admin
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/analytics` - Get analytics

---

## 6. Frontend Pages & Routes

### Public Routes
- `/` - Landing page
- `/signup` - Sign up page
- `/login` - Login page
- `/verify-otp` - OTP verification page

### Protected Routes
- `/dashboard` - User dashboard
- `/aptitude` - Aptitude questions
- `/aptitude/:category` - Specific aptitude category
- `/programming` - Programming section
- `/programming/exercises` - Coding exercises
- `/programming/mcqs` - Technical MCQs
- `/programming/dsa` - DSA questions
- `/programming/interview` - Interview questions
- `/companies` - Company selection
- `/companies/:name` - Company questions
- `/mock-tests` - Mock tests list
- `/mock-tests/:id` - Take mock test
- `/daily-challenge` - Daily challenge
- `/leaderboard` - Leaderboard
- `/bookmarks` - Bookmarked questions
- `/resume-builder` - Resume builder
- `/profile` - User profile

### Admin Routes
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/questions` - Question management
- `/admin/coding-questions` - Coding questions management
- `/admin/companies` - Company questions management
- `/admin/mock-tests` - Mock test management
- `/admin/analytics` - Analytics

---

## 7. Component Structure

### Layout Components
- `Layout.jsx` - Main layout wrapper
- `Sidebar.jsx` - Navigation sidebar
- `Header.jsx` - Top header
- `PrivateRoute.jsx` - Protected route wrapper
- `AdminRoute.jsx` - Admin route wrapper

### Auth Components
- `SignupForm.jsx` - Multi-step signup
- `LoginForm.jsx` - Login form
- `OTPVerification.jsx` - OTP input component
- `UserTypeSelector.jsx` - User type selection

### Dashboard Components
- `DashboardStats.jsx` - Statistics cards
- `ActivityChart.jsx` - Activity visualization
- `RecentActivity.jsx` - Recent actions list

### Question Components
- `QuestionCard.jsx` - Question display card
- `QuestionList.jsx` - List of questions
- `QuestionFilter.jsx` - Filter sidebar
- `MCQQuestion.jsx` - Multiple choice question
- `CodingQuestion.jsx` - Coding problem display

### Editor Components
- `CodeEditor.jsx` - Monaco editor wrapper
- `LanguageSelector.jsx` - Language dropdown
- `OutputPanel.jsx` - Code output display
- `RunButton.jsx` - Run code button
- `SubmitButton.jsx` - Submit solution button

### Test Components
- `TestCard.jsx` - Mock test card
- `TestTimer.jsx` - Timer component
- `TestQuestion.jsx` - Test question
- `TestResult.jsx` - Test result display

### Resume Components
- `ResumeForm.jsx` - Resume input form
- `ResumePreview.jsx` - PDF preview
- `ResumePDF.jsx` - PDF generation

### Admin Components
- `UserTable.jsx` - User management table
- `QuestionForm.jsx` - Add/edit question form
- `CodingQuestionForm.jsx` - Add/edit coding question
- `AnalyticsCharts.jsx` - Analytics visualizations

---

## 8. Acceptance Criteria

### Authentication
- [ ] Users can register with user type selection
- [ ] Users can login with email or phone
- [ ] OTP is sent and verified before account creation
- [ ] JWT tokens are used for authentication
- [ ] Protected routes redirect to login

### Dashboard
- [ ] Dashboard shows user greeting
- [ ] Statistics are displayed (score, tests completed)
- [ ] Recent activity is shown
- [ ] Navigation sidebar works

### Aptitude Section
- [ ] All 6 categories are accessible
- [ ] Questions display with 4 options
- [ ] Users can submit answers
- [ ] Results show correct/incorrect
- [ ] Difficulty levels are indicated

### Programming Section
- [ ] Monaco editor loads correctly
- [ ] Language selection works
- [ ] Code can be run using Judge0 API
- [ ] Output is displayed correctly
- [ ] All 5 languages are supported

### Company Section
- [ ] Company list is displayed
- [ ] Selecting company shows questions
- [ ] Questions include MCQs and coding problems

### Mock Tests
- [ ] Test list is displayed
- [ ] Timer counts down
- [ ] Questions can be answered
- [ ] Test auto-submits when time expires
- [ ] Results are shown after submission

### Leaderboard
- [ ] Leaderboard displays top users
- [ ] Rankings are correct
- [ ] Scores are accurate

### Bookmarks
- [ ] Users can bookmark questions
- [ ] Bookmarks are displayed in separate section
- [ ] Users can remove bookmarks

### Resume Builder
- [ ] Form captures all resume fields
- [ ] Preview shows entered data
- [ ] PDF can be downloaded

### Admin Panel
- [ ] Admin can view all users
- [ ] Admin can add/edit/delete questions
- [ ] Admin can manage coding questions
- [ ] Admin can create mock tests
- [ ] Analytics are displayed

### UI/UX
- [ ] Dark and light mode works
- [ ] Responsive on all devices
- [ ] Loading states are shown
- [ ] Error messages are displayed
- [ ] Smooth transitions

---

## 9. Project Structure

```
placement-preparation-portal/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── questionController.js
│   │   ├── codingController.js
│   │   ├── companyController.js
│   │   ├── mockTestController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── admin.js
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
│   │   └── userRoutes.js
│   ├── utils/
│   │   ├── otpGenerator.js
│   │   └── emailSender.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── README.md
└── SPEC.md
```

