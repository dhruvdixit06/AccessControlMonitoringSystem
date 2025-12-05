from sqlalchemy.orm import Session
from backend.db import models, schemas

class DashboardService:
    @staticmethod
    def get_app_manager_users(db: Session):
        # Join User, Access, Application. 
        # For simplicity, assuming UserRole is 1:1 or taking the first role found.
        # Returns a list of dicts matching the frontend AppManagerUser shape.
        
        results = (
            db.query(models.User, models.Access, models.Application, models.Role)
            .join(models.Access, models.Access.user_id == models.User.id)
            .join(models.Application, models.Access.application_id == models.Application.id)
            .outerjoin(models.UserRole, models.UserRole.user_id == models.User.id)
            .outerjoin(models.Role, models.UserRole.role_id == models.Role.id)
            .filter(models.Access.active == True)
            .all()
        )
        
        dashboard_users = []
        for user, access, app, role in results:
            dashboard_users.append({
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "application": app.name,
                "role": role.name if role else "Viewer",
                "status": "Active" if access.active else "Inactive",
                "lastLogin": "2024-01-01", # Mocked for now
                "avatarUrl": "" # Frontend generates this
            })
            
        return dashboard_users

    @staticmethod
    def onboard_user(db: Session, data: schemas.DashboardUserCreate):
        # 1. Check if application exists
        app = db.query(models.Application).filter(models.Application.name == data.application).first()
        if not app:
            # For POC, maybe auto-create? Or Error. Let's error.
            raise models.HTTPException(400, f"Application '{data.application}' not found")

        # 2. Check or Create User
        # Use provided business_user_id
        
        user = db.query(models.User).filter(models.User.email == data.email).first()
        if not user:
            user = models.User(
                business_user_id=data.business_user_id,
                name=data.name,
                email=data.email
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # 3. Create Access
        # Check if access already exists?
        existing_access = db.query(models.Access).filter(models.Access.user_id == user.id, models.Access.application_id == app.id).first()
        if not existing_access:
            access = models.Access(
                user_id=user.id,
                application_id=app.id,
                active=(data.status == "Active")
            )
            db.add(access)
        else:
            # Update status
            existing_access.active = (data.status == "Active")
        
        # 4. Handle Role (UserRole)
        # Find Role by name
        role = db.query(models.Role).filter(models.Role.name == data.role).first()
        if not role:
            # Create role if missing? Or Error.
            # Lets auto-create role for POC flexibility
            role = models.Role(name=data.role)
            db.add(role)
            db.commit()
            db.refresh(role)
        
        # Assign role
        user_role = db.query(models.UserRole).filter(models.UserRole.user_id == user.id, models.UserRole.role_id == role.id).first()
        if not user_role:
            user_role = models.UserRole(user_id=user.id, role_id=role.id)
            db.add(user_role)
        
        db.commit()
        
        return {"message": "User onboarded successfully", "user_id": user.id}
