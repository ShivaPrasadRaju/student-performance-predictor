"""
Database models - using Prisma ORM

Note: Prisma models are generated at runtime from prisma/schema.prisma
This file exports the available models for use in the FastAPI application
"""

# Prisma is imported and used directly in routes and services
# Models are accessed through: from prisma import Prisma
# Then use: await prisma.user.find_unique(...), await prisma.student.create(...), etc.

# For type hints in FastAPI, we reference the Prisma model types:
# User, Student, Section, Prediction

# The Prisma client is initialized in database.py and made available globally

