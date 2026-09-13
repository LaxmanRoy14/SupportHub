from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import engine, Base

from app.models.user import User
from app.models.otp import OTPVerification
from app.models.category import Category
from app.models.agent_category import AgentCategory
from app.models.ticket import Ticket
from app.models.comment import Comment
from app.routers.auth import router as auth_router
from app.routers.categories import router as categories_router
from app.routers.dashboard import router as dashboard_router
from app.routers.tickets import router as tickets_router

app = FastAPI(
    title="SupportHub API",
    description="Full-Stack Support Ticket Management System",
    version="1.0.0"
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://supporthub24.netlify.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
app.include_router(auth_router)
app.include_router(categories_router)
app.include_router(tickets_router)
app.include_router(dashboard_router)


@app.get("/")
def root():
    return {
        "message": "SupportHub API is running"
    }


@app.get("/db-test")
def database_test():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        return {
            "database": "connected",
            "result": result.scalar()
        }
