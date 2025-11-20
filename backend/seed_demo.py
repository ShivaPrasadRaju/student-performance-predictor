#!/usr/bin/env python
"""Seed demo users and sample sections into the Prisma database.

Run from the project root:

cd backend
venv\Scripts\activate  # Windows
python seed_demo.py

Or with project's Python interpreter:
python -m seed_demo
"""
import asyncio

from app.database import seed_demo_data


if __name__ == "__main__":
    try:
        asyncio.run(seed_demo_data())
    except Exception as e:
        print(f"Seeding failed: {e}")
        raise
