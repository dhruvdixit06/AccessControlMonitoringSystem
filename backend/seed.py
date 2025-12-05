import sys
import os

# Add the current directory to sys.path to make imports work
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.db.database import SessionLocal, engine, Base
from backend.db import models
from sqlalchemy.orm import Session

def seed_data():
    db = SessionLocal()
    try:
        print("Seeding data...")
        
        # 1. Applications
        apps = [
            {"name": "Salesforce", "description": "CRM Platform", "user_count": 85, "status": "Completed", "last_updated": "2 days ago"},
            {"name": "Jira", "description": "Project Management", "user_count": 42, "status": "In Progress", "last_updated": "5 hours ago"},
            {"name": "Looker", "description": "BI Tool", "user_count": 23, "status": "Not Started", "last_updated": "1 week ago"},
            {"name": "Confluence", "description": "Documentation", "user_count": 150, "status": "Completed", "last_updated": "3 days ago"},
            {"name": "Zendesk", "description": "Customer Support", "user_count": 5, "status": "Not Started", "last_updated": "Just now"}
        ]
        
        for app_data in apps:
            exists = db.query(models.Application).filter(models.Application.name == app_data["name"]).first()
            if not exists:
                print(f"Creating Application: {app_data['name']}")
                db.add(models.Application(**app_data))
            else:
                print(f"Application {app_data['name']} already exists.")
        
        # 2. Roles
        roles = [
            {"name": "Admin"},
            {"name": "Viewer"},
            {"name": "Editor"},
            {"name": "App Manager"}
        ]

        for role_data in roles:
            exists = db.query(models.Role).filter(models.Role.name == role_data["name"]).first()
            if not exists:
                print(f"Creating Role: {role_data['name']}")
                db.add(models.Role(**role_data))
            else:
                print(f"Role {role_data['name']} already exists.")

        db.commit() # Commit apps and roles first so we can link them if needed (though we link by ID usually/relation)

        # 3. Users
        # We need actual App and Role objects to create Access associations properly, 
        # but the request "Add mock users... to backend" implies creating Users and linking them via Dashboard flow or manually.
        # For simplicity and robustness, let's create Users and one Access entry for them.
        
        users_payload = [
            {
                "email": "alex.doe@example.com",
                "name": "Alex Doe", 
                "business_user_id": "EMP001",
                "app_name": "Salesforce",
                "role_name": "App Manager",
                "status": "Active"
            },
            {
                "email": "john.sales@example.com",
                "name": "John Sales", 
                "business_user_id": "SALES002",
                "app_name": "Salesforce",
                "role_name": "Viewer",
                "status": "Active"
            },
            {
                "email": "jane.jira@example.com",
                "name": "Jane Jira", 
                "business_user_id": "DEV003",
                "app_name": "Jira",
                "role_name": "Editor",
                "status": "Active"
            },
             {
                "email": "mike.looker@example.com",
                "name": "Mike Analyst", 
                "business_user_id": "BI004",
                "app_name": "Looker",
                "role_name": "Viewer",
                "status": "Inactive"
            }
        ]

        for u_data in users_payload:
            # Check User
            user = db.query(models.User).filter(models.User.email == u_data["email"]).first()
            if not user:
                print(f"Creating User: {u_data['name']}")
                user = models.User(
                    email=u_data["email"],
                    name=u_data["name"],
                    business_user_id=u_data["business_user_id"]
                )
                db.add(user)
                db.commit() # Commit to get ID
                db.refresh(user)
            else:
                print(f"User {u_data['name']} already exists.")

            # Check Access (Link User -> App -> Role)
            # Find App ID
            app = db.query(models.Application).filter(models.Application.name == u_data["app_name"]).first()
            role = db.query(models.Role).filter(models.Role.name == u_data["role_name"]).first()

            if app and role:
                # Check if access exists (User <-> App)
                access = db.query(models.Access).filter(
                    models.Access.user_id == user.id,
                    models.Access.application_id == app.id
                ).first()

                if not access:
                    print(f"Granting Access to {u_data['name']} for {u_data['app_name']}")
                    access = models.Access(
                        user_id=user.id,
                        application_id=app.id,
                        active=(u_data["status"] == "Active")
                    )
                    db.add(access)
                else:
                    print(f"Access for {u_data['name']} on {u_data['app_name']} already exists.")

                # Check if UserRole exists (User <-> Role)
                # Note: In this schema, UserRole is global or 1:N? 
                # Model says UserRole link User and Role. It doesn't link to App.
                # So a user has a role globally? Or is it implied? 
                # DashboardService joins them all, implying loose coupling or simple assumption.
                # We will just add the role assignment.
                user_role = db.query(models.UserRole).filter(
                    models.UserRole.user_id == user.id,
                    models.UserRole.role_id == role.id
                ).first()
                
                if not user_role:
                    print(f"Assigning Role {u_data['role_name']} to {u_data['name']}")
                    user_role = models.UserRole(
                        user_id=user.id,
                        role_id=role.id
                    )
                    db.add(user_role)
            else:
                print(f"Skipping access for {u_data['name']}: App or Role not found.")

        db.commit()
        print("Seeding complete.")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
