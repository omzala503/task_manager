"""Task API endpoints + dashboard stats."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from task_manager.models.task import TaskPriority, TaskStatus
from task_manager.services.department_service import DepartmentService
from task_manager.services.mom_service import MOMService
from task_manager.services.task_service import TaskService
from task_manager.api.dependencies import get_task_service, get_dept_service, get_mom_service

router = APIRouter(tags=["tasks"])


class CreateTaskRequest(BaseModel):
    title: str
    department_id: str
    assigned_to: str
    description: str = ""
    mom_id: Optional[str] = None
    due_date: Optional[str] = None
    priority: str = "medium"


class UpdateTaskRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[str] = None


# -- Task endpoints --

@router.post("/api/tasks")
def create_task(body: CreateTaskRequest, svc: TaskService = Depends(get_task_service)):
    try:
        priority = TaskPriority(body.priority)
        task = svc.create_task(
            title=body.title,
            department_id=body.department_id,
            assigned_to=body.assigned_to,
            description=body.description,
            mom_id=body.mom_id,
            due_date=body.due_date,
            priority=priority,
        )
        return task.to_dict()
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.get("/api/tasks")
def list_tasks(
    department_id: Optional[str] = Query(None),
    assigned_to: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    mom_id: Optional[str] = Query(None),
    svc: TaskService = Depends(get_task_service),
):
    task_status = TaskStatus(status) if status else None
    return [t.to_dict() for t in svc.list_tasks(
        department_id=department_id,
        assigned_to=assigned_to,
        status=task_status,
        mom_id=mom_id,
    )]


@router.get("/api/tasks/{task_id}")
def get_task(task_id: str, svc: TaskService = Depends(get_task_service)):
    task = svc.get_task(task_id)
    if not task:
        raise HTTPException(404, "Task not found")
    return task.to_dict()


@router.patch("/api/tasks/{task_id}")
def update_task(
    task_id: str,
    body: UpdateTaskRequest,
    svc: TaskService = Depends(get_task_service),
):
    try:
        priority = TaskPriority(body.priority) if body.priority else None
        task = svc.update_task(
            task_id,
            title=body.title,
            description=body.description,
            assigned_to=body.assigned_to,
            due_date=body.due_date,
            priority=priority,
        )
        return task.to_dict()
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.delete("/api/tasks/{task_id}")
def delete_task(task_id: str, svc: TaskService = Depends(get_task_service)):
    if not svc.delete_task(task_id):
        raise HTTPException(404, "Task not found")
    return {"ok": True}


@router.post("/api/tasks/{task_id}/start")
def start_task(task_id: str, svc: TaskService = Depends(get_task_service)):
    try:
        task = svc.start_task(task_id)
        return task.to_dict()
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.post("/api/tasks/{task_id}/complete")
def complete_task(task_id: str, svc: TaskService = Depends(get_task_service)):
    try:
        task = svc.complete_task(task_id)
        return task.to_dict()
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.post("/api/tasks/{task_id}/cancel")
def cancel_task(task_id: str, svc: TaskService = Depends(get_task_service)):
    try:
        task = svc.cancel_task(task_id)
        return task.to_dict()
    except ValueError as e:
        raise HTTPException(400, str(e))


# -- Dashboard --

@router.get("/api/dashboard")
def dashboard(
    dept_svc: DepartmentService = Depends(get_dept_service),
    mom_svc: MOMService = Depends(get_mom_service),
    task_svc: TaskService = Depends(get_task_service),
):
    departments = dept_svc.list_departments()
    meetings = mom_svc.list_meetings()
    moms = mom_svc.list_moms()
    tasks = task_svc.list_tasks()

    task_by_status = {}
    for t in tasks:
        task_by_status[t.status.value] = task_by_status.get(t.status.value, 0) + 1

    mom_by_status = {}
    for m in moms:
        mom_by_status[m.status.value] = mom_by_status.get(m.status.value, 0) + 1

    return {
        "departments": len(departments),
        "meetings": len(meetings),
        "moms": {"total": len(moms), "by_status": mom_by_status},
        "tasks": {"total": len(tasks), "by_status": task_by_status},
    }
