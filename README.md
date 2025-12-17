# AI Companio - Digital Student Companion

A full-stack web application for goal management and student productivity, built for Microsoft Imagine Cup.

## Project Structure

```
├── backend/          # FastAPI backend server
│   ├── main.py      # Main API server
│   ├── ai/          # AI-related modules
│   └── models/      # Data models
└── frontend/         # React + TypeScript frontend
    └── src/
        ├── components/  # Reusable UI components
        └── pages/       # Application pages
```

## Backend Setup

### Prerequisites
- Python 3.8+
- pip

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --port 8000
```

The backend server will run at `http://localhost:8000`

## Frontend Setup

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will run at `http://localhost:5173`

## API Endpoints

### Health Check
- `GET /` - Server health status

### Goals
- `POST /api/goals` - Create a new goal
- `GET /api/goals` - Get all goals
- `GET /api/goals/{goal_id}` - Get specific goal
- `PUT /api/goals/{goal_id}` - Update a goal
- `DELETE /api/goals/{goal_id}` - Delete a goal

### Tasks (Intelligent Task Breakdown)
- `POST /api/goals/{goal_id}/tasks/generate` - Generate tasks for a goal
- `GET /api/goals/{goal_id}/tasks` - Get all tasks for a goal
- `GET /api/tasks/{task_id}` - Get specific task
- `PUT /api/tasks/{task_id}` - Update task details
- `POST /api/goals/{goal_id}/tasks` - Create custom task
- `DELETE /api/tasks/{task_id}` - Delete a task
- `POST /api/goals/{goal_id}/tasks/reorder` - Bulk reorder tasks

### Example: Create Goal

```json
POST /api/goals
{
  "title": "Learn React",
  "duration_weeks": 3,
  "priority": "High",
  "intensity": "Normal"
}
```

Response:
```json
{
  "id": "uuid-here",
  "title": "Learn React",
  "duration_weeks": 3,
  "priority": "High",
  "intensity": "Normal",
  "start_date": "2025-12-14T10:30:00",
  "end_date": "2026-01-04T10:30:00",
  "created_at": "2025-12-14T10:30:00"
}
```

### Example: Generate Tasks

```json
POST /api/goals/{goal_id}/tasks/generate
```

Response:
```json
{
  "goal_id": "uuid-here",
  "goal_title": "Learn React",
  "tasks": [
    {
      "task": {
        "id": "task-uuid-1",
        "goal_id": "uuid-here",
        "week_number": 1,
        "title": "JSX Syntax",
        "status": "Not Started",
        "dependencies": [],
        "order": 0
      },
      "is_locked": false
    }
  ],
  "total_tasks": 9
}
```

## Features

- **Goal Management**: Create, view, and track learning goals
- **Intelligent Task Breakdown & Customization**: Automatically decompose goals into structured weekly tasks and fully customize them
  - Rule-based task generation based on goal topic
  - Task dependencies to ensure logical progression
  - Support for multiple learning topics (React, Python, JavaScript, Data Structures)
  - Edit task titles and descriptions inline
  - Reorder tasks with up/down arrows
  - Move tasks between weeks
  - Delete unwanted tasks
  - Add new custom tasks
  - Task status tracking (Not Started, In Progress, Completed)
  - Locked tasks based on dependencies
  - Preserve task structure and dependencies
- **Priority System**: Organize goals by priority (High, Medium, Low)
- **Intensity Levels**: Set goal intensity (Light, Normal, Aggressive)
  - Light: 2 tasks/week
  - Normal: 3 tasks/week
  - Aggressive: 4 tasks/week
- **Modern UI**: React-based responsive interface
- **RESTful API**: FastAPI backend with automatic documentation

## Development

- Backend API docs available at: `http://localhost:8000/docs`
- Frontend hot-reload enabled for development
- CORS configured for local development

## Technology Stack

**Backend:**
- FastAPI
- Python
- Pydantic for data validation

**Frontend:**
- React
- TypeScript
- Vite
- CSS3

## License

Microsoft Imagine Cup Project
