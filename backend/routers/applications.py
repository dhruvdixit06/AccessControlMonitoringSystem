from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db import models, schemas
from backend.services.application_service import ApplicationService

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.post("/", response_model=schemas.Application)
def create_application(app: schemas.ApplicationCreate, db: Session = Depends(get_db)):
    return ApplicationService.create_application(db, app)

@router.get("/", response_model=list[schemas.Application])
def list_applications(db: Session = Depends(get_db)):
    return ApplicationService.list_applications(db)
