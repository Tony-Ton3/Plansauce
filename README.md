# Plansauce

> **Quick Overview**

Project planning presents significant challenges for developers at all skill levels, often consuming valuable time better spent on implementation. Plansauce streamlines this process as a comprehensive planning companion, analyzing user's project idea to recommend customized tech stacks and breaking implementation into structured tasks. The platform's contextual prompt generation enhances productivity by crafting task-specific queries for AI assistance, allowing developers to focus more energy on execution rather than planning complexities.

## Features

- **AI-Powered Recommendations**: Get personalized tech stack suggestions based on your project requirements with helpful links to documentation
- **Interactive Quiz System**: Assess your current technical knowledge, used for context for project tech stack and task generation
- **Project Management**: Organize and track your project progress with structured task list
- **Contextual AI Assistance**: Automatically generate task-specific prompts with toggleable context options

## Project Overview

![Plansauce Project Overview](client/src/utils/assets/plansauce-overview.pdf)

## Tech Stack

### Frontend
- **React 18** - Frontend framework
- **Vite** - Client server
- **TailwindCSS** - Bootstrap CSS framework
- **Redux Toolkit** - Global state management
- **React Router** - Client-side routing
- **Framer Motion** - Smooth animations

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication

### AI Engine
- **FastAPI** - Python web framework
- **CrewAI** - AI task orchestration with specialized agent teams
- **Google Gemini** - AI model integration for enhanced project descriptions
- **Brave Search** - Web search integration for technology research

## Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **Docker** (optional, for containerized setup)

### Environment Setup (Required for Both Options)

1. **Copy the environment template:**
   ```bash
   cp env.template .env
   ```

2. **Edit `.env` with your actual values:**
   ```env
   # MongoDB Atlas connection string
   MONGO=mongodb+srv://your-username:your-password@cluster.mongodb.net/plansauce?retryWrites=true&w=majority
   
   # Google Gemini API key
   GEMINI_API_KEY=your_actual_gemini_api_key
   
   # Brave Search API key (optional)
   BRAVE_API_KEY=your_actual_brave_api_key
   
   # JWT secret for authentication
   JWT_SECRET=your_super_secret_random_string
   
   # Server port (optional)
   PORT=3000
   ```

---

## Option 1: Local Development Setup

### 1. Install Dependencies

```bash
# Install client dependencies
cd client && pnpm install

# Install server dependencies
cd ../server && pnpm install

# Set up Python virtual environment and dependencies
cd ../python_server
python -m venv venv
source venv/bin/activate  
pip install -r requirements.txt
```

### 2. Start Services (3 terminals needed)

```bash
# Terminal 1: Start React Client
cd client
pnpm run dev

# Terminal 2: Start Node.js Server
cd server
pnpm run dev

# Terminal 3: Start Python AI Server
cd python_server
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```

### 3. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Python AI Server**: http://localhost:8000

---

## Option 2: Docker Setup (Recommended)

### 1. Build and Run
```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

### 2. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Python AI Server**: http://localhost:8000

### 3. Stop Services
```bash
# Stop all services
docker-compose down
```

---

## User Flow

```
1. Landing Page
   ↓
2. Sign Up/Sign In
   ↓
3. Technical Background Assessment
   ↓
4. Project Input & Requirements
   ↓
5. AI-Enhanced Project Description
   ↓
6. Tech Stack Analysis & Recommendations
   ↓
7. Task Generation & Categorization
   ↓
8. Progress Tracking & Contextual AI Assistance
```

## Development

### Project Structure
```
Plansauce/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── redux/        # State management
│   │   └── utils/        # Utility functions
│   └── package.json
├── server/                # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── package.json
├── python_server/         # Python AI engine
│   ├── app/              # AI modules
│   └── requirements.txt
└── docker-compose.yml     # Container orchestration
```

### Available Scripts

**Client:**
```bash
pnpm run dev      # Start development server
pnpm run build    # Build for production
pnpm run preview  # Preview production build
pnpm run lint     # Run ESLint
```

**Server:**
```bash
pnpm run dev      # Start with nodemon
pnpm start        # Start production server
```

**Python Server:**
```bash
python main.py   # Start FastAPI server
uvicorn main:app --reload  # Start with auto-reload
```

## Environment Variables

Make sure to set up these environment variables in your root `.env` file:

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO` | MongoDB Atlas connection string | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `BRAVE_API_KEY` | Brave Search API key | Yes |
| `JWT_SECRET` | Secret for JWT tokens | Yes |
| `PORT` | Server port (defaults to 3000) | No |

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port
   lsof -i :3000
   # Kill process
   kill -9 <PID>
   ```

2. **MongoDB Connection Issues**
   - Ensure your MongoDB Atlas connection string is correct
   - Check if your IP is whitelisted in MongoDB Atlas
   - Verify the database name in your connection string

3. **Python Dependencies**
   ```bash
   # Recreate virtual environment
   cd python_server
   rm -rf venv
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Environment Variables Not Loading**
   - Ensure `.env` file is in the root directory
   - Check that all required variables are set
   - Restart all services after changing environment variables

5. **Docker Issues**
   ```bash
   # Check if all services are running
   docker-compose ps
   
   # Check service logs
   docker-compose logs python_server
   docker-compose logs server
   docker-compose logs client
   
   # Rebuild containers
   docker-compose down
   docker-compose up --build
   ```
