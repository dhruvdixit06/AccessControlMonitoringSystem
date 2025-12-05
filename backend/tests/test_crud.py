import requests

BASE_URL = "http://127.0.0.1:8000"

def main():
    print("Testing CRUD Operations...")

    # 1. Update User
    print("\n--- Testing User Update ---")
    # Fetch a user to update (e.g., Test User)
    users = requests.get(f"{BASE_URL}/users/").json()
    test_user = next(u for u in users if u["business_user_id"] == "IPAMC005")
    print(f"Original User: {test_user}")

    # Update name
    resp = requests.put(f"{BASE_URL}/users/{test_user['id']}", json={"name": "Updated Test User"})
    if resp.status_code == 200:
        print(f"Updated User: {resp.json()}")
    else:
        print(f"Update failed: {resp.text}")

    # 2. Modify Access
    print("\n--- Testing Access Modify ---")
    # Fetch access
    accesses = requests.get(f"{BASE_URL}/access/").json()
    if not accesses:
        print("No access found to modify.")
    else:
        acc = accesses[0]
        print(f"Original Access: {acc}")
        
        # Modify active status (although revoke does this too, let's just flip it back and forth or something)
        # Actually, let's just ensure endpoint works.
        resp = requests.put(f"{BASE_URL}/access/{acc['id']}", json={"active": True})
        if resp.status_code == 200:
            print(f"Modified Access: {resp.json()}")
        else:
            print(f"Modify failed: {resp.text}")

    # 3. Revoke Access
    print("\n--- Testing Access Revoke ---")
    if accesses:
        acc = accesses[0]
        resp = requests.post(f"{BASE_URL}/access/{acc['id']}/revoke")
        if resp.status_code == 200:
            print(f"Revoke response: {resp.json()}")
            # Verify it's inactive
            updated_acc = requests.get(f"{BASE_URL}/access/").json()[0]
            print(f"Access after revoke: {updated_acc}")
        else:
            print(f"Revoke failed: {resp.text}")

    # 4. Delete User
    print("\n--- Testing User Delete ---")
    # Create a dummy user to delete so we don't break other tests
    create_resp = requests.post(f"{BASE_URL}/users/", json={
        "business_user_id": "IPAMC123",
        "name": "To Be Deleted",
        "email": "delete@example.com"
    })
    if create_resp.status_code == 200:
        user_to_del = create_resp.json()
        print(f"Created user to delete: {user_to_del['id']}")
        
        del_resp = requests.delete(f"{BASE_URL}/users/{user_to_del['id']}")
        if del_resp.status_code == 200:
            print(f"Delete response: {del_resp.json()}")
            # Verify gone
            get_resp = requests.get(f"{BASE_URL}/users/")
            users_after = get_resp.json()
            found = any(u['id'] == user_to_del['id'] for u in users_after)
            print(f"User found after delete? {found}")
        else:
            print(f"Delete failed: {del_resp.text}")
    else:
        print(f"Failed to create dummy user: {create_resp.text}")

if __name__ == "__main__":
    main()
