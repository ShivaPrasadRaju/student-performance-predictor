"""
Database configuration and session management using Prisma
"""
from prisma import Prisma
from app.config import settings

# Create Prisma client instance
prisma = Prisma()

async def get_db():
    """Dependency to get database session
    
    Note: Prisma is async, so this should be used with async endpoints
    """
    if not prisma.is_connected():
        await prisma.connect()
    try:
        yield prisma
    finally:
        pass  # Prisma connection is managed globally

def get_db_sync():
    """Synchronous wrapper for database access in non-async contexts"""
    return prisma

async def seed_demo_data():
    """Create demo users and sections if they don't exist"""
    from app.services.security import hash_password
    
    try:
        await prisma.connect()
        
        # Check if demo users already exist
        teacher = await prisma.user.find_unique(
            where={"email": "teacher@school.com"}
        )
        
        student_user = await prisma.user.find_unique(
            where={"email": "student@school.com"}
        )
        
        if not teacher:
            teacher = await prisma.user.create(
                data={
                    "email": "teacher@school.com",
                    "fullName": "Demo Teacher",
                    "hashedPassword": hash_password("password123"),
                    "role": "teacher",
                    "isActive": True
                }
            )
        
        if not student_user:
            student_user = await prisma.user.create(
                data={
                    "email": "student@school.com",
                    "fullName": "Demo Student",
                    "hashedPassword": hash_password("password123"),
                    "role": "student",
                    "isActive": True
                }
            )
        
        # Create default sections for teacher
        for section_name in ['A', 'B', 'C']:
            for year in [1, 2, 3, 4]:
                existing = await prisma.section.find_first(
                    where={
                        "teacherId": teacher.id,
                        "name": section_name,
                        "year": year
                    }
                )
                if not existing:
                    await prisma.section.create(
                        data={
                            "name": section_name,
                            "year": year,
                            "teacherId": teacher.id
                        }
                    )
        
        print("✓ Demo users and sections seeded successfully")
    except Exception as e:
        print(f"Note: Could not seed demo data: {e}")
    finally:
        await prisma.disconnect()

async def init_db():
    """Initialize database tables and seed demo data"""
    try:
        await prisma.connect()
        print("✓ Connected to database")
        await seed_demo_data()
    except Exception as e:
        print(f"Error initializing database: {e}")

