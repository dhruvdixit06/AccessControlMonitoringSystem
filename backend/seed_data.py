from backend.db.database import Base, engine, SessionLocal
from backend.db import models

def seed_data():
    print("Recreating tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Seeding users...")
        users = [
            models.User(business_user_id="IPAMC001", name="Admin User", email="admin@example.com"),
            models.User(business_user_id="IPAMC002", name="App Manager", email="am@example.com"),
            models.User(business_user_id="IPAMC003", name="App Owner", email="ao@example.com"),
            models.User(business_user_id="IPAMC004", name="Biz Owner", email="bo@example.com"),
            models.User(business_user_id="IPAMC005", name="Test User", email="user1@example.com"),
        ]
        db.add_all(users)
        db.commit()
        
        # Get user IDs
        am = db.query(models.User).filter_by(business_user_id="IPAMC002").first()
        ao = db.query(models.User).filter_by(business_user_id="IPAMC003").first()
        bo = db.query(models.User).filter_by(business_user_id="IPAMC004").first()
        user1 = db.query(models.User).filter_by(business_user_id="IPAMC005").first()
        
        print("Seeding application...")
        app = models.Application(name="Critical App", description="Test Application")
        db.add(app)
        db.commit()
        
        print("Seeding mappings...")
        db.add(models.AppManagerMap(app_id=app.id, user_id=am.id))
        db.add(models.AppOwnerMap(app_id=app.id, user_id=ao.id))
        db.add(models.BusinessOwnerMap(app_id=app.id, user_id=bo.id))
        
        print("Seeding access...")
        db.add(models.Access(user_id=user1.id, application_id=app.id, active=True))
        db.commit()
        
        print("Data seeded successfully.")
    except Exception as e:
        print(f"Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
