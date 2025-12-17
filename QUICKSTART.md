# 🚀 Quick Start Guide - PostgreSQL Integration

## Prerequisites Check

✅ Docker installed and running  
✅ Python 3.8+ with pip  
✅ Terminal/PowerShell open  

## 5-Minute Setup

### Step 1: Start PostgreSQL (30 seconds)

```powershell
docker run -d --name postgres -e POSTGRES_USER=myuser -e POSTGRES_PASSWORD=mypassword -e POSTGRES_DB=mydb -p 5432:5432 postgres:16
```

Verify it's running:
```powershell
docker ps
```

### Step 2: Setup Backend (2 minutes)

```powershell
cd backend
pip install -r requirements.txt
python init_db.py
```

### Step 3: Start Backend Server (10 seconds)

```powershell
python main.py
```

Backend should be running at: **http://localhost:8000**

### Step 4: Start Frontend (2 minutes)

Open a new terminal:

```powershell
cd frontend
npm install  # If not already done
npm run dev
```

Frontend should be running at: **http://localhost:5173**

## ✅ You're Done!

### Test the Integration

1. **Open** http://localhost:5173 in your browser
2. **Navigate** to "Feature 2" in the sidebar
3. **Click** "Goal Creation & Planning" (Sub-Feature 1)
4. **Create a goal** with:
   - Title: "Learn React"
   - Duration: 4 weeks
   - Priority: High
   - Intensity: Normal
5. **Click** "Intelligent Task Breakdown" (Sub-Feature 2)
6. **Select your goal** from the dropdown
7. **Click** "Generate Tasks" to see AI-generated task breakdown
8. **Verify** tasks are saved to PostgreSQL

### Stop the Services

```powershell
# Stop backend: Ctrl+C in backend terminal
# Stop frontend: Ctrl+C in frontend terminal

# Stop PostgreSQL (data is preserved)
docker stop postgres

# Start again later
docker start postgres
```

## 🎉 What You Just Built

- ✅ PostgreSQL database running in Docker
- ✅ FastAPI backend connected to PostgreSQL
- ✅ React frontend communicating with backend
- ✅ Goal Creation with database persistence (Sub-Feature 1)
- ✅ AI Task Breakdown with database storage (Sub-Feature 2)
- ✅ Full CRUD operations on goals and tasks

## 🔍 Verify Database

Access PostgreSQL CLI:
```powershell
docker exec -it postgres psql -U myuser -d mydb
```

Run queries:
```sql
\dt                    -- List tables
SELECT * FROM goals;   -- View goals
SELECT * FROM tasks;   -- View tasks
\q                     -- Quit
```

## 📚 More Information

- **Full Setup Guide**: `DATABASE_SETUP.md`
- **Integration Details**: `INTEGRATION_SUMMARY.md`
- **API Docs**: http://localhost:8000/docs (when server is running)

## 🆘 Troubleshooting

### Database connection error?
```powershell
docker ps  # Check if postgres is running
docker start postgres  # Start if stopped
```

### Port already in use?
Change the port in docker command:
```powershell
docker run -d --name postgres ... -p 5433:5432 postgres:16
```
Then update `backend/database.py`: `localhost:5433`

### Import errors?
```powershell
cd backend
pip install -r requirements.txt --upgrade
```

## 🎯 Next Steps

- Explore all 5 sub-features in Feature 2
- Create multiple goals and generate tasks
- Try editing, reordering, and deleting tasks
- Watch data persist across server restarts!
