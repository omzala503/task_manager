"""Dependency injection for FastAPI routers."""

from fastapi import Request

from task_manager.services.department_service import DepartmentService
from task_manager.services.mom_service import MOMService
from task_manager.services.task_service import TaskService


def get_dept_service(request: Request) -> DepartmentService:
    return request.app.state.dept_service


def get_mom_service(request: Request) -> MOMService:
    return request.app.state.mom_service


def get_task_service(request: Request) -> TaskService:
    return request.app.state.task_service
