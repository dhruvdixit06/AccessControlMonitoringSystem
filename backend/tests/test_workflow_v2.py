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
    print("Starting verification v2 (No Auth)...")
    
    # Users are already seeded.
    # IPAMC002 = App Manager (ID likely 2)
    # IPAMC003 = App Owner (ID likely 3)
    # IPAMC004 = Biz Owner (ID likely 4)
    # We can fetch them to be sure of IDs if we want, or just assume 2, 3, 4 based on seed order.
    # Let's fetch them.
    
    try:
        users = requests.get(f"{BASE_URL}/users/").json()
        am = next(u for u in users if u["business_user_id"] == "IPAMC002")
        ao = next(u for u in users if u["business_user_id"] == "IPAMC003")
        bo = next(u for u in users if u["business_user_id"] == "IPAMC004")
        print(f"AM ID: {am['id']}, AO ID: {ao['id']}, BO ID: {bo['id']}")
    except Exception as e:
        print(f"Failed to fetch users: {e}")
        return

    # 4. Start Review Cycle
    print("Starting Review Cycle...")
    resp = requests.post(f"{BASE_URL}/review/start-cycle?quarter=2025-Q1")
    if resp.status_code == 200:
        cycle_id = resp.json()["cycle_id"]
        print(f"Cycle started: {cycle_id}")
    else:
        print(f"Failed to start cycle: {resp.text}")
        return

    # 5. Verify Items
    # Get items for AM
    resp = requests.get(f"{BASE_URL}/review/app-manager/items?cycle_id={cycle_id}&user_id={am['id']}")
    items = resp.json()
    print(f"Found {len(items)} items for AM")
    if len(items) == 0:
        print("No items found for AM!")
        return
    
    item_id = items[0]["id"]
    print(f"Processing Item {item_id}, current stage: {items[0]['pending_stage']}")

    # 6. App Manager Action
    print("App Manager Approving...")
    resp = requests.post(f"{BASE_URL}/review/app-manager/action", json={
        "review_item_id": item_id,
        "actor_user_id": am['id'],
        "action": "Retain",
        "comment": "Looks good"
    })
    print(f"AM Action: {resp.status_code} {resp.text}")

    # 7. App Owner Action
    print("App Owner Approving...")
    resp = requests.post(f"{BASE_URL}/review/app-owner/action", json={
        "review_item_id": item_id,
        "actor_user_id": ao['id'],
        "action": "Approve",
        "comment": "Agreed"
    })
    print(f"AO Action: {resp.status_code} {resp.text}")

    # 8. Business Owner Action
    print("Business Owner Approving...")
    resp = requests.post(f"{BASE_URL}/review/business-owner/action", json={
        "review_item_id": item_id,
        "actor_user_id": bo['id'],
        "action": "Approve",
        "comment": "Final Approval"
    })
    print(f"BO Action: {resp.status_code} {resp.text}")

    # 9. Verify Final Status
    resp = requests.get(f"{BASE_URL}/review/items?cycle_id={cycle_id}")
    final_item = resp.json()[0]
    print(f"Final Status: {final_item['final_status']}, Stage: {final_item['pending_stage']}")

if __name__ == "__main__":
    main()
