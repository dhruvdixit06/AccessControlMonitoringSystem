from sqlalchemy.orm import Session
from datetime import datetime
from backend.db import models, schemas
from fastapi import HTTPException

class AccessService:
    @staticmethod
    def create_access(db: Session, access: schemas.AccessCreate):
        user = db.query(models.User).filter(models.User.id == access.user_id).first()
        if not user:
            raise HTTPException(404, "User not found")
        app = db.query(models.Application).filter(models.Application.id == access.application_id).first()
        if not app:
            raise HTTPException(404, "Application not found")

        db_access = models.Access(
            user_id=access.user_id,
            application_id=access.application_id,
            active=True,
            created_at=datetime.utcnow(),
        )
        db.add(db_access)
        db.commit()
        db.refresh(db_access)
        return db_access

    @staticmethod
    def list_access(db: Session, user_id: int = None, application_id: int = None):
        query = db.query(models.Access)
        if user_id:
            query = query.filter(models.Access.user_id == user_id)
        if application_id:
            query = query.filter(models.Access.application_id == application_id)
        return query.all()

    @staticmethod
    def get_access(db: Session, access_id: int):
        return db.query(models.Access).filter(models.Access.id == access_id).first()

    @staticmethod
    def revoke_access(db: Session, access_id: int):
        access = AccessService.get_access(db, access_id)
        if not access:
            raise HTTPException(404, "Access not found")
        
        access.active = False
        db.commit()
        return {"message": "Access revoked"}

    @staticmethod
    def modify_access(db: Session, access_id: int, access_update: schemas.AccessUpdate):
        access = AccessService.get_access(db, access_id)
        if not access:
            raise HTTPException(404, "Access not found")
        
        if access_update.active is not None:
            access.active = access_update.active
            
        db.commit()
        db.refresh(access)
        return access
