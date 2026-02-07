"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from task_manager.storage.json_store import JsonStore
from task_manager.services.department_service import DepartmentService
from task_manager.services.mom_service import MOMService
from task_manager.services.task_service import TaskService

from task_manager.api.routers import departments, meetings, moms, tasks


@asynccontextmanager
async def lifespan(app: FastAPI):
    store = JsonStore(data_dir="data")
    app.state.store = store
    app.state.dept_service = DepartmentService(store)
    app.state.mom_service = MOMService(store)
    app.state.task_service = TaskService(store)
    yield


app = FastAPI(
    title="Task Manager API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(departments.router)
app.include_router(meetings.router)
app.include_router(moms.router)
app.include_router(tasks.router)
