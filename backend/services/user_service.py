from sqlalchemy.orm import Session
from backend.db import models, schemas
from fastapi import HTTPException

class UserService:
    @staticmethod
    def create_user(db: Session, user: schemas.UserCreate):
        if db.query(models.User).filter(models.User.business_user_id == user.business_user_id).first():
            raise HTTPException(400, "business_user_id already exists")
        if db.query(models.User).filter(models.User.email == user.email).first():
            raise HTTPException(400, "email already exists")

        db_user = models.User(
            business_user_id=user.business_user_id,
            name=user.name,
            email=user.email,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def get_user(db: Session, user_id: int):
        return db.query(models.User).filter(models.User.id == user_id).first()

    @staticmethod
    def list_users(db: Session, application_id: int = None):
        query = db.query(models.User)
        if application_id:
            query = query.join(models.Access).filter(models.Access.application_id == application_id)
        return query.all()

    @staticmethod
    def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
        db_user = UserService.get_user(db, user_id)
        if not db_user:
            raise HTTPException(404, "User not found")
        
        if user_update.name:
            db_user.name = user_update.name
        if user_update.email:
            db_user.email = user_update.email
        
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def delete_user(db: Session, user_id: int):
        db_user = UserService.get_user(db, user_id)
        if not db_user:
            raise HTTPException(404, "User not found")
        
        db.delete(db_user)
        db.commit()
        return {"message": "User deleted"}
