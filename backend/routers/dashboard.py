from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db import schemas
from backend.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/app-manager/users")
def get_app_manager_users(db: Session = Depends(get_db)):
    return DashboardService.get_app_manager_users(db)

@router.post("/app-manager/users")
def onboard_user(user: schemas.DashboardUserCreate, db: Session = Depends(get_db)):
    return DashboardService.onboard_user(db, user)
