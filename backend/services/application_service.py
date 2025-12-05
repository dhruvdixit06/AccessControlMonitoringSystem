from sqlalchemy.orm import Session
from backend.db import models, schemas

class ApplicationService:
    @staticmethod
    def create_application(db: Session, app: schemas.ApplicationCreate):
        db_app = models.Application(**app.model_dump())
        db.add(db_app)
        db.commit()
        db.refresh(db_app)
        return db_app

    @staticmethod
    def list_applications(db: Session):
        return db.query(models.Application).all()

    @staticmethod
    def get_application_by_name(db: Session, name: str):
         return db.query(models.Application).filter(models.Application.name == name).first()
