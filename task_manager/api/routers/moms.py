"""Minutes of Meeting (MOM) API endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from task_manager.services.mom_service import MOMService
from task_manager.api.dependencies import get_mom_service

router = APIRouter(prefix="/api/moms", tags=["moms"])


class CreateMOMRequest(BaseModel):
    meeting_id: str
    prepared_by: str
    summary: str = ""


class AddAgendaItemRequest(BaseModel):
    title: str
    discussion: str = ""
    decisions: str = ""


class ValidateMOMRequest(BaseModel):
    validated_by: str


class RejectMOMRequest(BaseModel):
    rejected_by: str
    reason: str


@router.post("")
def create_mom(body: CreateMOMRequest, svc: MOMService = Depends(get_mom_service)):
    try:
        mom = svc.create_mom(body.meeting_id, body.prepared_by, body.summary)
        return mom.to_dict()
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.get("")
def list_moms(
    status: Optional[str] = Query(None),
    svc: MOMService = Depends(get_mom_service),
):
    from task_manager.models.mom import MOMStatus

    mom_status = MOMStatus(status) if status else None
    return [m.to_dict() for m in svc.list_moms(status=mom_status)]


@router.get("/{mom_id}")
def get_mom(mom_id: str, svc: MOMService = Depends(get_mom_service)):
    mom = svc.get_mom(mom_id)
    if not mom:
        raise HTTPException(404, "MOM not found")
    return mom.to_dict()


@router.post("/{mom_id}/agenda-items")
def add_agenda_item(
    mom_id: str,
    body: AddAgendaItemRequest,
    svc: MOMService = Depends(get_mom_service),
):
    try:
        mom = svc.add_agenda_item(mom_id, body.title, body.discussion, body.decisions)
        return mom.to_dict()
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.post("/{mom_id}/submit")
def submit_mom(mom_id: str, svc: MOMService = Depends(get_mom_service)):
    try:
        mom = svc.submit_for_review(mom_id)
        return mom.to_dict()
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.post("/{mom_id}/validate")
def validate_mom(
    mom_id: str,
    body: ValidateMOMRequest,
    svc: MOMService = Depends(get_mom_service),
):
    try:
        mom = svc.validate_mom(mom_id, body.validated_by)
        return mom.to_dict()
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.post("/{mom_id}/reject")
def reject_mom(
    mom_id: str,
    body: RejectMOMRequest,
    svc: MOMService = Depends(get_mom_service),
):
    try:
        mom = svc.reject_mom(mom_id, body.rejected_by, body.reason)
        return mom.to_dict()
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.post("/{mom_id}/revise")
def revise_mom(mom_id: str, svc: MOMService = Depends(get_mom_service)):
    try:
        mom = svc.revise_mom(mom_id)
        return mom.to_dict()
    except ValueError as e:
        raise HTTPException(400, str(e))
