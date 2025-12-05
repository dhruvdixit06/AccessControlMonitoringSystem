from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from backend.db.database import get_db
from backend.db import models, schemas
from backend.services.access_service import AccessService

router = APIRouter(prefix="/access", tags=["Access"])

@router.post("/", response_model=schemas.Access)
def create_access(access: schemas.AccessCreate, db: Session = Depends(get_db)):
    return AccessService.create_access(db, access)

@router.get("/", response_model=list[schemas.Access])
def list_access(user_id: int = None, application_id: int = None, db: Session = Depends(get_db)):
    return AccessService.list_access(db, user_id, application_id)

@router.post("/{access_id}/revoke")
def revoke_access(access_id: int, db: Session = Depends(get_db)):
    return AccessService.revoke_access(db, access_id)

@router.put("/{access_id}", response_model=schemas.Access)
def modify_access(access_id: int, access_update: schemas.AccessUpdate, db: Session = Depends(get_db)):
    return AccessService.modify_access(db, access_id, access_update)
