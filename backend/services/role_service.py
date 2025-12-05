from sqlalchemy.orm import Session
from fastapi import HTTPException
from backend.db import models, schemas

class RoleService:
    @staticmethod
    def create_role(db: Session, role: schemas.RoleCreate):
        if db.query(models.Role).filter(models.Role.name == role.name).first():
            raise HTTPException(400, "Role already exists")
        db_role = models.Role(name=role.name)
        db.add(db_role)
        db.commit()
        db.refresh(db_role)
        return db_role

    @staticmethod
    def list_roles(db: Session):
        return db.query(models.Role).all()
