# Placement Preparation Portal - Setup Guide

## Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
```

#### Configure Environment Variables

Edit `backend/.env` with your actual values:

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/placement_portal

# JWT Secret (generate a random string)
JWT_SECRET=your_secure_random_string

# Email (for OTP) - Use Gmail App Password
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_char_app_password
```

#### Start Backend
```bash
npm run dev
```
Backend will run on http://localhost:5000

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Frontend will run on http://localhost:5173

## Getting MongoDB Atlas Free Tier

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a free cluster
4. Create a user with password
5. Get connection string (Network Access → IP Whitelist → Allow All)
6. Replace in .env file

## Getting Gmail App Password

1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account → Security → App Passwords
3. Generate new app password
4. Use that password in SMTP_PASS

## Features Ready

- ✅ User Registration with OTP
- ✅ Login with OTP verification
- ✅ Dashboard with statistics
- ✅ Aptitude questions (6 categories)
- ✅ Programming with Monaco Editor
- ✅ Company-specific questions
- ✅ Mock tests with timer
- ✅ Leaderboard
- ✅ Bookmarks
- ✅ Resume Builder
- ✅ Full Admin Panel

## Admin Access

After registering, manually set `isAdmin: true` in MongoDB to access admin panel at `/admin`
