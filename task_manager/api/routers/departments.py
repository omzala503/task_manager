"""Department API endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from task_manager.services.department_service import DepartmentService
from task_manager.api.dependencies import get_dept_service

router = APIRouter(prefix="/api/departments", tags=["departments"])


class CreateDepartmentRequest(BaseModel):
    name: str
    description: str = ""


@router.post("")
def create_department(
    body: CreateDepartmentRequest,
    svc: DepartmentService = Depends(get_dept_service),
):
    dept = svc.create_department(body.name, body.description)
    return dept.to_dict()


@router.get("")
def list_departments(svc: DepartmentService = Depends(get_dept_service)):
    return [d.to_dict() for d in svc.list_departments()]


@router.get("/{department_id}")
def get_department(
    department_id: str,
    svc: DepartmentService = Depends(get_dept_service),
):
    dept = svc.get_department(department_id)
    if not dept:
        raise HTTPException(404, "Department not found")
    return dept.to_dict()


@router.delete("/{department_id}")
def delete_department(
    department_id: str,
    svc: DepartmentService = Depends(get_dept_service),
):
    if not svc.delete_department(department_id):
        raise HTTPException(404, "Department not found")
    return {"ok": True}
