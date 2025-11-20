"""Weekly task persistence service."""
from datetime import date, datetime
from typing import List

from prisma import Prisma


class WeeklyTaskService:
    @staticmethod
    def _normalize_week_start(week_start: date) -> datetime:
        return datetime(week_start.year, week_start.month, week_start.day)

    @staticmethod
    async def get_weekly_tasks(prisma: Prisma, user_id: int, week_start: date):
        start_at = WeeklyTaskService._normalize_week_start(week_start)
        return await prisma.weeklyTask.find_many(
            where={"userId": user_id, "weekStart": start_at},
            order={"day": "asc"}
        )

    @staticmethod
    async def sync_weekly_tasks(prisma: Prisma, user_id: int, week_start: date, entries: List[dict]):
        start_at = WeeklyTaskService._normalize_week_start(week_start)
        synced = []
        for item in entries:
            synced_entry = await prisma.weeklyTask.upsert(
                where={
                    "userId_weekStart_day": {
                        "userId": user_id,
                        "weekStart": start_at,
                        "day": item["day"],
                    }
                },
                create={
                    "userId": user_id,
                    "weekStart": start_at,
                    "day": item["day"],
                    "task": item["task"],
                    "completed": item.get("completed", False),
                },
                update={
                    "task": item["task"],
                    "completed": item.get("completed", False),
                    "weekStart": start_at,
                }
            )
            synced.append(synced_entry)
        return synced
