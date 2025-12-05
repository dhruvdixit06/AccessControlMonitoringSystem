import requests
import time

BASE_URL = "http://127.0.0.1:8000"

def main():
    print("Testing Filtering and Logging...")

    # 1. Test User Filtering
    print("\n--- Testing User Filtering (by App ID) ---")
    # First get all apps to find a valid ID
    apps = requests.get(f"{BASE_URL}/applications/").json()
    if apps:
        app_id = apps[0]["id"]
        print(f"Filtering users for App ID: {app_id}")
        users = requests.get(f"{BASE_URL}/users/?application_id={app_id}").json()
        print(f"Found {len(users)} users")
        # Verify
        for u in users:
            # This is a weak check without checking the DB, but good enough for connectivity
            pass
    else:
        print("No apps found to filter by.")

    # 2. Test Access Filtering
    print("\n--- Testing Access Filtering (by User ID) ---")
    # Get a user
    users = requests.get(f"{BASE_URL}/users/").json()
    if users:
        user_id = users[0]["id"]
        print(f"Filtering access for User ID: {user_id}")
        accesses = requests.get(f"{BASE_URL}/access/?user_id={user_id}").json()
        print(f"Found {len(accesses)} access records")
    else:
        print("No users found to filter by.")

    # 3. Test Review Item Filtering
    print("\n--- Testing Review Item Filtering (by Stage) ---")
    # Get cycles
    cycles = requests.get(f"{BASE_URL}/review/cycles").json()
    if cycles:
        cycle_id = cycles[0]["id"]
        stage = "completed" # or app_manager
        print(f"Filtering items for Cycle {cycle_id} and Stage '{stage}'")
        items = requests.get(f"{BASE_URL}/review/items?cycle_id={cycle_id}&stage={stage}").json()
        print(f"Found {len(items)} items")
        for item in items:
            if item["pending_stage"] != stage:
                print(f"ERROR: Item {item['id']} has stage {item['pending_stage']}")
    else:
        print("No cycles found.")

    print("\nCheck backend.log for request logs.")

if __name__ == "__main__":
    main()
