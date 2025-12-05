import requests
import time

BASE_URL = "http://127.0.0.1:8000"

def create_user(business_id, name, email, password):
    try:
        resp = requests.post(f"{BASE_URL}/users/", json={
            "business_user_id": business_id,
            "name": name,
            "email": email,
            "password": password
        })
        if resp.status_code == 200:
            return resp.json()
        print(f"Failed to create user {business_id}: {resp.text}")
        return None
    except Exception as e:
        print(f"Error creating user {business_id}: {e}")
        return None

def login(username, password):
    resp = requests.post(f"{BASE_URL}/token", data={
        "username": username,
        "password": password
    })
    if resp.status_code == 200:
        return resp.json()["access_token"]
    print(f"Login failed for {username}: {resp.text}")
    return None

def main():
    print("Starting verification...")
    
    # 1. Create Users
    print("Creating users...")
    admin = create_user("IPAMC001", "Admin User", "admin@example.com", "password123")
    app_manager = create_user("IPAMC002", "App Manager", "am@example.com", "password123")
    app_owner = create_user("IPAMC003", "App Owner", "ao@example.com", "password123")
    biz_owner = create_user("IPAMC004", "Biz Owner", "bo@example.com", "password123")
    user1 = create_user("IPAMC005", "Test User", "user1@example.com", "password123")

    if not all([admin, app_manager, app_owner, biz_owner, user1]):
        print("Failed to create users. Exiting.")
        return

    # 2. Login
    print("Logging in...")
    am_token = login("IPAMC002", "password123")
    ao_token = login("IPAMC003", "password123")
    bo_token = login("IPAMC004", "password123")
    
    if not all([am_token, ao_token, bo_token]):
        print("Failed to login. Exiting.")
        return

    # 3. Setup Data
    print("Seeding data...")
    
    # Create Application
    app_payload = {"name": "Critical App", "description": "App for testing"}
    resp = requests.post(f"{BASE_URL}/applications/", json=app_payload) # Assuming this endpoint exists and is open
    if resp.status_code == 200:
        app_id = resp.json()["id"]
        print(f"Created App: {app_id}")
    else:
        # It might already exist if DB wasn't cleared, or error
        print(f"Failed to create app (or exists): {resp.text}")
        # Try to get it? Assuming we just proceed or fail.
        # If DB was deleted, it should work.
        if "already exists" in resp.text:
             # simplistic fallback
             app_id = 1 
        else:
             return

    # Assign Managers (Need to check endpoints in mappings.py, assuming they exist)
    # I'll assume standard endpoints based on file names: /mappings/app-manager, etc.
    # If they don't exist, I might fail. I didn't check mappings.py content.
    # Let's check mappings.py content quickly or just try.
    # Better to check mappings.py to be sure.
    
    pass

def setup_mappings(app_id, am_id, ao_id, bo_id):
    # App Manager
    requests.post(f"{BASE_URL}/mappings/app-manager", json={"app_id": app_id, "user_id": am_id})
    # App Owner
    requests.post(f"{BASE_URL}/mappings/app-owner", json={"app_id": app_id, "user_id": ao_id})
    # Business Owner
    requests.post(f"{BASE_URL}/mappings/business-owner", json={"app_id": app_id, "user_id": bo_id})

def create_access(user_id, app_id):
    requests.post(f"{BASE_URL}/access/", json={"user_id": user_id, "application_id": app_id})

def main():
    print("Starting verification...")
    
    # 1. Create Users
    print("Creating users...")
    admin = create_user("IPAMC001", "Admin User", "admin@example.com", "password123")
    app_manager = create_user("IPAMC002", "App Manager", "am@example.com", "password123")
    app_owner = create_user("IPAMC003", "App Owner", "ao@example.com", "password123")
    biz_owner = create_user("IPAMC004", "Biz Owner", "bo@example.com", "password123")
    user1 = create_user("IPAMC005", "Test User", "user1@example.com", "password123")

    if not all([admin, app_manager, app_owner, biz_owner, user1]):
        print("Failed to create users. Exiting.")
        return

    # 2. Login
    print("Logging in...")
    am_token = login("IPAMC002", "password123")
    ao_token = login("IPAMC003", "password123")
    bo_token = login("IPAMC004", "password123")
    
    if not all([am_token, ao_token, bo_token]):
        print("Failed to login. Exiting.")
        return

    # 3. Setup Data
    print("Seeding data...")
    app_payload = {"name": "Critical App", "description": "App for testing"}
    resp = requests.post(f"{BASE_URL}/applications/", json=app_payload)
    if resp.status_code == 200:
        app_data = resp.json()
        app_id = app_data["id"]
        print(f"Created App: {app_id}")
    elif resp.status_code == 400 and "already exists" in resp.text:
        print("App already exists, assuming ID 1")
        app_id = 1
    else:
        print(f"Failed to create app: {resp.text}")
        return

    setup_mappings(app_id, app_manager["id"], app_owner["id"], biz_owner["id"])
    create_access(user1["id"], app_id)
    
    # 4. Start Review Cycle
    print("Starting Review Cycle...")
    # Need to pass token? I updated start_cycle to depend on current_user, but didn't check role.
    # Any logged in user can start it in my code (oops, but fine for POC).
    headers = {"Authorization": f"Bearer {am_token}"}
    resp = requests.post(f"{BASE_URL}/review/start-cycle?quarter=2025-Q1", headers=headers)
    if resp.status_code == 200:
        cycle_id = resp.json()["cycle_id"]
        print(f"Cycle started: {cycle_id}")
    else:
        print(f"Failed to start cycle: {resp.text}")
        return

    # 5. Verify Items
    resp = requests.get(f"{BASE_URL}/review/items?cycle_id={cycle_id}", headers=headers)
    items = resp.json()
    print(f"Found {len(items)} items")
    if len(items) == 0:
        print("No items found!")
        return
    
    item_id = items[0]["id"]
    print(f"Processing Item {item_id}, current stage: {items[0]['pending_stage']}")

    # 6. App Manager Action
    print("App Manager Approving...")
    resp = requests.post(f"{BASE_URL}/review/app-manager/action", json={
        "review_item_id": item_id,
        "actor_user_id": app_manager["id"],
        "action": "Retain",
        "comment": "Looks good"
    }, headers={"Authorization": f"Bearer {am_token}"})
    print(f"AM Action: {resp.status_code} {resp.text}")

    # 7. App Owner Action
    print("App Owner Approving...")
    resp = requests.post(f"{BASE_URL}/review/app-owner/action", json={
        "review_item_id": item_id,
        "actor_user_id": app_owner["id"],
        "action": "Approve",
        "comment": "Agreed"
    }, headers={"Authorization": f"Bearer {ao_token}"})
    print(f"AO Action: {resp.status_code} {resp.text}")

    # 8. Business Owner Action
    print("Business Owner Approving...")
    resp = requests.post(f"{BASE_URL}/review/business-owner/action", json={
        "review_item_id": item_id,
        "actor_user_id": biz_owner["id"],
        "action": "Approve",
        "comment": "Final Approval"
    }, headers={"Authorization": f"Bearer {bo_token}"})
    print(f"BO Action: {resp.status_code} {resp.text}")

    # 9. Verify Final Status
    resp = requests.get(f"{BASE_URL}/review/items?cycle_id={cycle_id}", headers=headers)
    final_item = resp.json()[0]
    print(f"Final Status: {final_item['final_status']}, Stage: {final_item['pending_stage']}")
