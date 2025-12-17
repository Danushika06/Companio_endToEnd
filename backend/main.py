from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models import GoalCreate, GoalResponse
from models.goal import GoalDB
from models.task import Task, TaskDB, TaskCreate, TaskUpdate, TaskResponse, TaskBulkReorder
from ai.task_decomposer import TaskDecomposer, check_task_dependencies
from database import get_db, init_db
import uuid

app = FastAPI(title="AI Companio API", version="1.0.0")

# Configure CORS to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def on_startup():
    init_db()

# Initialize task decomposer
task_decomposer = TaskDecomposer()


@app.get("/")
def read_root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "AI Companio API is running",
        "timestamp": datetime.now().isoformat()
    }


@app.post("/api/goals", response_model=GoalResponse, status_code=201)
async def create_goal(goal: GoalCreate, db: Session = Depends(get_db)):
    """
    Create a new goal with auto-calculated dates
    
    Args:
        goal: GoalCreate schema with title, duration_weeks, priority, intensity
        db: Database session
    
    Returns:
        GoalResponse: Created goal with generated ID and calculated dates
    
    Raises:
        HTTPException: 400 if validation fails
    """
    try:
        # Calculate dates
        start_date = datetime.now()
        end_date = start_date + timedelta(weeks=goal.duration_weeks)
        created_at = datetime.now()
        
        # Create database model
        db_goal = GoalDB(
            id=str(uuid.uuid4()),
            title=goal.title,
            duration_weeks=goal.duration_weeks,
            priority=goal.priority,
            intensity=goal.intensity,
            start_date=start_date,
            end_date=end_date,
            created_at=created_at
        )
        
        # Save to database
        db.add(db_goal)
        db.commit()
        db.refresh(db_goal)
        
        # Return as Pydantic model
        return GoalResponse(
            id=db_goal.id,
            title=db_goal.title,
            duration_weeks=db_goal.duration_weeks,
            priority=db_goal.priority,
            intensity=db_goal.intensity,
            start_date=db_goal.start_date,
            end_date=db_goal.end_date,
            created_at=db_goal.created_at
        )
        
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="An error occurred while creating the goal")


@app.get("/api/goals")
async def get_goals(db: Session = Depends(get_db)):
    """
    Retrieve all goals
    
    Args:
        db: Database session
    
    Returns:
        List of all created goals
    """
    goals = db.query(GoalDB).all()
    
    # Convert to Pydantic models
    goal_responses = [
        GoalResponse(
            id=g.id,
            title=g.title,
            duration_weeks=g.duration_weeks,
            priority=g.priority,
            intensity=g.intensity,
            start_date=g.start_date,
            end_date=g.end_date,
            created_at=g.created_at
        ) for g in goals
    ]
    
    return {"goals": goal_responses, "count": len(goal_responses)}


@app.get("/api/goals/{goal_id}", response_model=GoalResponse)
async def get_goal(goal_id: str, db: Session = Depends(get_db)):
    """
    Retrieve a specific goal by ID
    
    Args:
        goal_id: UUID of the goal
        db: Database session
        
    Returns:
        GoalResponse: The requested goal
        
    Raises:
        HTTPException: 404 if goal not found
    """
    db_goal = db.query(GoalDB).filter(GoalDB.id == goal_id).first()
    
    if not db_goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    return GoalResponse(
        id=db_goal.id,
        title=db_goal.title,
        duration_weeks=db_goal.duration_weeks,
        priority=db_goal.priority,
        intensity=db_goal.intensity,
        start_date=db_goal.start_date,
        end_date=db_goal.end_date,
        created_at=db_goal.created_at
    )


@app.put("/api/goals/{goal_id}", response_model=GoalResponse)
async def update_goal(goal_id: str, goal: GoalCreate, db: Session = Depends(get_db)):
    """
    Update an existing goal
    
    Args:
        goal_id: UUID of the goal to update
        goal: Updated goal data
        db: Database session
        
    Returns:
        GoalResponse: Updated goal
        
    Raises:
        HTTPException: 404 if goal not found, 400 if validation fails
    """
    db_goal = db.query(GoalDB).filter(GoalDB.id == goal_id).first()
    
    if not db_goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    try:
        # Calculate new dates
        start_date = datetime.now()
        end_date = start_date + timedelta(weeks=goal.duration_weeks)
        
        # Update goal fields
        db_goal.title = goal.title
        db_goal.duration_weeks = goal.duration_weeks
        db_goal.priority = goal.priority
        db_goal.intensity = goal.intensity
        db_goal.start_date = start_date
        db_goal.end_date = end_date
        
        db.commit()
        db.refresh(db_goal)
        
        return GoalResponse(
            id=db_goal.id,
            title=db_goal.title,
            duration_weeks=db_goal.duration_weeks,
            priority=db_goal.priority,
            intensity=db_goal.intensity,
            start_date=db_goal.start_date,
            end_date=db_goal.end_date,
            created_at=db_goal.created_at
        )
        
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="An error occurred while updating the goal")


@app.delete("/api/goals/{goal_id}")
async def delete_goal(goal_id: str, db: Session = Depends(get_db)):
    """
    Delete a goal
    
    Args:
        goal_id: UUID of the goal to delete
        db: Database session
        
    Returns:
        Success message
        
    Raises:
        HTTPException: 404 if goal not found
    """
    db_goal = db.query(GoalDB).filter(GoalDB.id == goal_id).first()
    
    if not db_goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    # Count associated tasks before deletion
    tasks_count = db.query(TaskDB).filter(TaskDB.goal_id == goal_id).count()
    
    goal_title = db_goal.title
    
    # Delete goal (tasks will be deleted automatically due to cascade)
    db.delete(db_goal)
    db.commit()
    
    return {
        "message": "Goal deleted successfully",
        "deleted_goal_title": goal_title,
        "deleted_goal_id": goal_id,
        "deleted_tasks_count": tasks_count
    }


# ===== TASK BREAKDOWN ENDPOINTS =====

@app.post("/api/goals/{goal_id}/tasks/generate")
async def generate_tasks(goal_id: str, db: Session = Depends(get_db)):
    """
    Generate tasks for a goal using intelligent task breakdown.
    
    Args:
        goal_id: UUID of the goal to generate tasks for
        db: Database session
        
    Returns:
        List of generated tasks with dependency information
        
    Raises:
        HTTPException: 404 if goal not found
    """
    db_goal = db.query(GoalDB).filter(GoalDB.id == goal_id).first()
    
    if not db_goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    # Convert to GoalResponse for task decomposer
    goal = GoalResponse(
        id=db_goal.id,
        title=db_goal.title,
        duration_weeks=db_goal.duration_weeks,
        priority=db_goal.priority,
        intensity=db_goal.intensity,
        start_date=db_goal.start_date,
        end_date=db_goal.end_date,
        created_at=db_goal.created_at
    )
    
    # Generate tasks using the decomposer
    tasks = task_decomposer.generate_tasks_for_goal(goal)
    
    # Store tasks in database
    for task in tasks:
        db_task = TaskDB(
            id=task.id,
            goal_id=task.goal_id,
            week_number=task.week_number,
            day_number=task.day_number,
            title=task.title,
            description=task.description,
            status=task.status,
            dependencies=task.dependencies,
            order=task.order,
            created_at=task.created_at,
            updated_at=task.updated_at
        )
        db.add(db_task)
    
    db.commit()
    
    # Build response with lock status
    task_responses = []
    for task in tasks:
        is_locked = not check_task_dependencies(task, tasks)
        task_responses.append(TaskResponse(task=task, is_locked=is_locked))
    
    return {
        "goal_id": goal_id,
        "goal_title": goal.title,
        "tasks": task_responses,
        "total_tasks": len(tasks)
    }


@app.get("/api/goals/{goal_id}/tasks")
async def get_tasks_by_goal(goal_id: str, db: Session = Depends(get_db)):
    """
    Retrieve all tasks for a specific goal.
    
    Args:
        goal_id: UUID of the goal
        db: Database session
        
    Returns:
        List of tasks organized by weeks with lock status
        
    Raises:
        HTTPException: 404 if goal not found
    """
    db_goal = db.query(GoalDB).filter(GoalDB.id == goal_id).first()
    
    if not db_goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    # Get all tasks for this goal from database
    db_tasks = db.query(TaskDB).filter(TaskDB.goal_id == goal_id).order_by(TaskDB.week_number, TaskDB.order).all()
    
    # Convert to Pydantic Task models
    goal_tasks = [
        Task(
            id=t.id,
            goal_id=t.goal_id,
            week_number=t.week_number,
            day_number=t.day_number,
            title=t.title,
            description=t.description,
            status=t.status,
            dependencies=t.dependencies,
            order=t.order,
            created_at=t.created_at,
            updated_at=t.updated_at
        ) for t in db_tasks
    ]
    
    # Build response with lock status
    task_responses = []
    for task in goal_tasks:
        is_locked = not check_task_dependencies(task, goal_tasks)
        task_responses.append(TaskResponse(task=task, is_locked=is_locked))
    
    # Organize by weeks
    weeks = {}
    for task_resp in task_responses:
        week_num = task_resp.task.week_number
        if week_num not in weeks:
            weeks[week_num] = []
        weeks[week_num].append(task_resp)
    
    return {
        "goal_id": goal_id,
        "tasks": task_responses,
        "tasks_by_week": weeks,
        "total_tasks": len(goal_tasks)
    }


@app.get("/api/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str, db: Session = Depends(get_db)):
    """
    Get a specific task by ID.
    
    Args:
        task_id: UUID of the task
        db: Database session
        
    Returns:
        TaskResponse with task details and lock status
        
    Raises:
        HTTPException: 404 if task not found
    """
    db_task = db.query(TaskDB).filter(TaskDB.id == task_id).first()
    
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = Task(
        id=db_task.id,
        goal_id=db_task.goal_id,
        week_number=db_task.week_number,
        day_number=db_task.day_number,
        title=db_task.title,
        description=db_task.description,
        status=db_task.status,
        dependencies=db_task.dependencies,
        order=db_task.order,
        created_at=db_task.created_at,
        updated_at=db_task.updated_at
    )
    
    # Get all tasks for this goal
    db_goal_tasks = db.query(TaskDB).filter(TaskDB.goal_id == task.goal_id).all()
    goal_tasks = [
        Task(
            id=t.id,
            goal_id=t.goal_id,
            week_number=t.week_number,
            day_number=t.day_number,
            title=t.title,
            description=t.description,
            status=t.status,
            dependencies=t.dependencies,
            order=t.order,
            created_at=t.created_at,
            updated_at=t.updated_at
        ) for t in db_goal_tasks
    ]
    
    is_locked = not check_task_dependencies(task, goal_tasks)
    
    return TaskResponse(task=task, is_locked=is_locked)


@app.put("/api/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, task_update: TaskUpdate, db: Session = Depends(get_db)):
    """
    Update a task's details.
    
    Args:
        task_id: UUID of the task to update
        task_update: Fields to update
        db: Database session
        
    Returns:
        Updated task with lock status
        
    Raises:
        HTTPException: 404 if task not found, 400 if validation fails
    """
    db_task = db.query(TaskDB).filter(TaskDB.id == task_id).first()
    
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Update fields
    if task_update.title is not None:
        db_task.title = task_update.title
    if task_update.description is not None:
        db_task.description = task_update.description
    if task_update.status is not None:
        # Validate status
        if task_update.status not in ["Not Started", "In Progress", "Completed"]:
            raise HTTPException(status_code=400, detail="Invalid status")
        db_task.status = task_update.status
    if task_update.dependencies is not None:
        # Validate dependencies exist
        for dep_id in task_update.dependencies:
            dep_task = db.query(TaskDB).filter(TaskDB.id == dep_id).first()
            if not dep_task:
                raise HTTPException(status_code=400, detail=f"Dependency task {dep_id} not found")
        db_task.dependencies = task_update.dependencies
    if task_update.order is not None:
        db_task.order = task_update.order
    if task_update.week_number is not None:
        db_task.week_number = task_update.week_number
    if task_update.day_number is not None:
        db_task.day_number = task_update.day_number
    
    db_task.updated_at = datetime.now()
    
    db.commit()
    db.refresh(db_task)
    
    # Convert to Pydantic model
    task = Task(
        id=db_task.id,
        goal_id=db_task.goal_id,
        week_number=db_task.week_number,
        day_number=db_task.day_number,
        title=db_task.title,
        description=db_task.description,
        status=db_task.status,
        dependencies=db_task.dependencies,
        order=db_task.order,
        created_at=db_task.created_at,
        updated_at=db_task.updated_at
    )
    
    # Get lock status
    db_goal_tasks = db.query(TaskDB).filter(TaskDB.goal_id == task.goal_id).all()
    goal_tasks = [
        Task(
            id=t.id,
            goal_id=t.goal_id,
            week_number=t.week_number,
            day_number=t.day_number,
            title=t.title,
            description=t.description,
            status=t.status,
            dependencies=t.dependencies,
            order=t.order,
            created_at=t.created_at,
            updated_at=t.updated_at
        ) for t in db_goal_tasks
    ]
    is_locked = not check_task_dependencies(task, goal_tasks)
    
    return TaskResponse(task=task, is_locked=is_locked)


@app.post("/api/goals/{goal_id}/tasks", response_model=TaskResponse, status_code=201)
async def create_task(goal_id: str, task_create: TaskCreate, db: Session = Depends(get_db)):
    """
    Create a new custom task for a goal.
    
    Args:
        goal_id: UUID of the goal
        task_create: Task creation data
        db: Database session
        
    Returns:
        Created task with lock status
        
    Raises:
        HTTPException: 404 if goal not found, 400 if validation fails
    """
    db_goal = db.query(GoalDB).filter(GoalDB.id == goal_id).first()
    
    if not db_goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    # Validate dependencies
    for dep_id in task_create.dependencies:
        dep_task = db.query(TaskDB).filter(TaskDB.id == dep_id).first()
        if not dep_task:
            raise HTTPException(status_code=400, detail=f"Dependency task {dep_id} not found")
    
    # Create task
    task_id = str(uuid.uuid4())
    db_task = TaskDB(
        id=task_id,
        goal_id=goal_id,
        week_number=task_create.week_number,
        day_number=task_create.day_number,
        title=task_create.title,
        description=task_create.description,
        dependencies=task_create.dependencies,
        order=task_create.order,
        status="Not Started",
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    # Convert to Pydantic model
    task = Task(
        id=db_task.id,
        goal_id=db_task.goal_id,
        week_number=db_task.week_number,
        day_number=db_task.day_number,
        title=db_task.title,
        description=db_task.description,
        status=db_task.status,
        dependencies=db_task.dependencies,
        order=db_task.order,
        created_at=db_task.created_at,
        updated_at=db_task.updated_at
    )
    
    # Get lock status
    db_goal_tasks = db.query(TaskDB).filter(TaskDB.goal_id == goal_id).all()
    goal_tasks = [
        Task(
            id=t.id,
            goal_id=t.goal_id,
            week_number=t.week_number,
            day_number=t.day_number,
            title=t.title,
            description=t.description,
            status=t.status,
            dependencies=t.dependencies,
            order=t.order,
            created_at=t.created_at,
            updated_at=t.updated_at
        ) for t in db_goal_tasks
    ]
    is_locked = not check_task_dependencies(task, goal_tasks)
    
    return TaskResponse(task=task, is_locked=is_locked)


@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: str, db: Session = Depends(get_db)):
    """
    Delete a task.
    
    Args:
        task_id: UUID of the task to delete
        db: Database session
        
    Returns:
        Success message
        
    Raises:
        HTTPException: 404 if task not found, 400 if other tasks depend on it
    """
    db_task = db.query(TaskDB).filter(TaskDB.id == task_id).first()
    
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check if any other tasks depend on this one
    from sqlalchemy import func, cast, String
    dependent_count = db.query(TaskDB).filter(
        func.json_contains(cast(TaskDB.dependencies, String), f'"{task_id}"')
    ).count()
    
    if dependent_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete task. {dependent_count} task(s) depend on it."
        )
    
    task_title = db_task.title
    
    db.delete(db_task)
    db.commit()
    
    return {
        "message": "Task deleted successfully",
        "deleted_task_title": task_title,
        "deleted_task_id": task_id
    }


@app.post("/api/goals/{goal_id}/tasks/reorder")
async def reorder_tasks(goal_id: str, reorder_data: TaskBulkReorder, db: Session = Depends(get_db)):
    """
    Bulk reorder tasks for a goal.
    
    Args:
        goal_id: UUID of the goal
        reorder_data: List of task reorder instructions
        db: Database session
        
    Returns:
        Updated task list
        
    Raises:
        HTTPException: 404 if goal or task not found, 400 if validation fails
    """
    db_goal = db.query(GoalDB).filter(GoalDB.id == goal_id).first()
    
    if not db_goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    # Validate all tasks exist and belong to this goal
    for task_reorder in reorder_data.tasks:
        db_task = db.query(TaskDB).filter(TaskDB.id == task_reorder.task_id).first()
        
        if not db_task:
            raise HTTPException(
                status_code=404, 
                detail=f"Task {task_reorder.task_id} not found"
            )
        
        if db_task.goal_id != goal_id:
            raise HTTPException(
                status_code=400, 
                detail=f"Task {task_reorder.task_id} does not belong to goal {goal_id}"
            )
    
    # Apply reordering
    updated_count = 0
    for task_reorder in reorder_data.tasks:
        db_task = db.query(TaskDB).filter(TaskDB.id == task_reorder.task_id).first()
        db_task.order = task_reorder.new_order
        if task_reorder.new_week_number is not None:
            db_task.week_number = task_reorder.new_week_number
        db_task.updated_at = datetime.now()
        updated_count += 1
    
    db.commit()
    
    # Get all tasks for this goal to return
    db_tasks = db.query(TaskDB).filter(TaskDB.goal_id == goal_id).order_by(TaskDB.week_number, TaskDB.order).all()
    
    goal_tasks = [
        Task(
            id=t.id,
            goal_id=t.goal_id,
            week_number=t.week_number,
            day_number=t.day_number,
            title=t.title,
            description=t.description,
            status=t.status,
            dependencies=t.dependencies,
            order=t.order,
            created_at=t.created_at,
            updated_at=t.updated_at
        ) for t in db_tasks
    ]
    
    # Build response with lock status
    task_responses = []
    for task in goal_tasks:
        is_locked = not check_task_dependencies(task, goal_tasks)
        task_responses.append(TaskResponse(task=task, is_locked=is_locked))
    
    return {
        "message": "Tasks reordered successfully",
        "goal_id": goal_id,
        "updated_count": updated_count,
        "tasks": task_responses
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
