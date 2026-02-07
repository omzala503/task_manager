"""Meeting API endpoints."""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from task_manager.services.mom_service import MOMService
from task_manager.api.dependencies import get_mom_service

router = APIRouter(prefix="/api/meetings", tags=["meetings"])


class CreateMeetingRequest(BaseModel):
    title: str
    department_id: str
    date: str
    attendees: List[str] = []
    location: str = ""


@router.post("")
def create_meeting(
    body: CreateMeetingRequest,
    svc: MOMService = Depends(get_mom_service),
):
    meeting = svc.create_meeting(
        title=body.title,
        department_id=body.department_id,
        date=body.date,
        attendees=body.attendees,
        location=body.location,
    )
    return meeting.to_dict()


@router.get("")
def list_meetings(
    department_id: Optional[str] = Query(None),
    svc: MOMService = Depends(get_mom_service),
):
    return [m.to_dict() for m in svc.list_meetings(department_id=department_id)]


@router.get("/{meeting_id}")
def get_meeting(
    meeting_id: str,
    svc: MOMService = Depends(get_mom_service),
):
    meeting = svc.get_meeting(meeting_id)
    if not meeting:
        raise HTTPException(404, "Meeting not found")
    return meeting.to_dict()
