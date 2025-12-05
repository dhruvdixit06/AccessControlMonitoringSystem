from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db import models, schemas
from backend.services.role_service import RoleService

router = APIRouter(prefix="/roles", tags=["Roles"])

@router.post("/", response_model=schemas.Role)
def create_role(role: schemas.RoleCreate, db: Session = Depends(get_db)):
    return RoleService.create_role(db, role)

@router.get("/", response_model=list[schemas.Role])
def list_roles(db: Session = Depends(get_db)):
    return RoleService.list_roles(db)
