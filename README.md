# Habitify

**Build habits, level up your life**

A modern, full-stack habit tracking application built with React, Node.js, Express, and MongoDB.

## Features

- **Landing Page**: Clean introduction with app branding and call-to-action
- **User Authentication**: Secure signup and login system
- **Dashboard**: Personalized view with XP points, streak counters, and habit management
- **Habit Tracking**: Add, update, and complete daily habits with gamification
- **Progress Visualization**: Weekly charts showing habit completion trends
- **Responsive Design**: Modern, minimal UI that works on all devices

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT tokens with bcrypt password hashing
- **Styling**: Tailwind CSS with custom components

## Quick Start

1. **Install dependencies for all packages:**
   ```bash
   npm run install-all
   ```

2. **Set up environment variables:**
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your MongoDB URI and JWT secret
   ```

3. **Start the development servers:**
   ```bash
   npm run dev
   ```

4. **Open your browser to:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## Project Structure

```
habitify/
├── client/          # React frontend
├── server/          # Node.js backend
├── package.json     # Root package.json for scripts
└── README.md        # This file
```

## Environment Variables

Create `server/.env` with:
```
MONGODB_URI=mongodb://localhost:27017/habitify
JWT_SECRET=your_super_secure_jwt_secret
PORT=3001
```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/habits` - Get user's habits
- `POST /api/habits` - Create new habit
- `PUT /api/habits/:id/complete` - Mark habit as complete
- `PUT /api/habits/:id` - Update habit details
- `GET /api/user/stats` - Get user XP and streak data
