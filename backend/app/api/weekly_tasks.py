from datetime import date, timedelta
from typing import List

from fastapi import APIRouter, Depends, Query

from app.database import prisma
from app.schemas import WeeklyTaskSyncRequest, WeeklyTaskResponse
from app.services.weekly_tasks import WeeklyTaskService
from app.middleware import get_student

router = APIRouter(prefix="/api/v1/weekly-tasks", tags=["weekly tasks"])


def _ongoing_week_start(week_start: date | None = None) -> date:
    today = week_start or date.today()
    monday = today - timedelta(days=today.weekday())
    return monday


@router.get("", response_model=List[WeeklyTaskResponse])
async def get_weekly_tasks(
    week_start: date = Query(None),
    current_user = Depends(get_student),
):
    reference = _ongoing_week_start(week_start)
    tasks = await WeeklyTaskService.get_weekly_tasks(prisma, current_user.id, reference)
    return tasks


@router.post("", response_model=List[WeeklyTaskResponse])
async def upsert_weekly_tasks(
    payload: WeeklyTaskSyncRequest,
    current_user = Depends(get_student),
):
    tasks = await WeeklyTaskService.sync_weekly_tasks(
        prisma,
        current_user.id,
        payload.week_start,
        [entry.dict() for entry in payload.entries],
    )
    return tasks
