"""Vercel serverless function entry point for the FastAPI app."""

import os
import tempfile

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from task_manager.storage.json_store import JsonStore
from task_manager.services.department_service import DepartmentService
from task_manager.services.mom_service import MOMService
from task_manager.services.task_service import TaskService

from task_manager.api.routers import departments, meetings, moms, tasks

app = FastAPI(title="Task Manager API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use /tmp on Vercel (ephemeral), local "data" dir otherwise
data_dir = os.path.join(tempfile.gettempdir(), "task_manager_data") if os.environ.get("VERCEL") else "data"
store = JsonStore(data_dir=data_dir)

app.state.dept_service = DepartmentService(store)
app.state.mom_service = MOMService(store)
app.state.task_service = TaskService(store)

app.include_router(departments.router)
app.include_router(meetings.router)
app.include_router(moms.router)
app.include_router(tasks.router)
