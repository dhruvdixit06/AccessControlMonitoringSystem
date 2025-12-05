# Access Control Monitoring & Review System - Project Summary

## Overview
This project is a Proof-of-Concept (PoC) for an **Access Control Monitoring & Review System**. It provides a comprehensive dashboard for managing user access, roles, and applications within an organization. The system facilitates adherence to security compliance by enabling regular access reviews and streamlined user onboarding.

## Architecture
The application follows a standard **Client-Server architecture**:
-   **Frontend**: A modern, responsive Single Page Application (SPA) built with React.
-   **Backend**: A robust RESTful API built with Python (FastAPI).
-   **Database**: SQLite for lightweight, file-based persistence.

---

## Technical Stack

### Frontend (`/frontend`)
-   **Framework**: React 18
-   **Build Tool**: Vite
-   **Language**: TypeScript
-   **Styling**: TailwindCSS (Utility-first CSS)
-   **State Management**: React Hooks (`useState`, `useContext`)
-   **Routing**: Custom state-based view switching (Simulated routing)
-   **HTTP Client**: Native `fetch` API wrapped in `api.ts`

### Backend (`/backend`)
-   **Framework**: FastAPI (Python 3.10+)
-   **ORM**: SQLAlchemy
-   **Data Validation**: Pydantic
-   **Database**: SQLite (`access_review_v2.db`)
-   **Server**: Uvicorn

---

## Key Features

### 1. Multi-Role Dashboard
The application supports distinct views and capabilities for different user roles:
-   **System Admin**:
    -   manage global system settings.
    -   Manage User Roles (Create, Edit, Delete).
    -   Manage Applications (Onboard new apps).
    -   Configure Review Cycles.
-   **App Manager**:
    -   Oversee users specific to managed applications.
    -   Onboard new users with roles and `business_user_id`.
    -   Monitor application statistics (User count, Status).
-   **App Owner**:
    -   Review pending access requests.
    -   Approve or Reject access reviews.
-   **Business Owner**:
    -   Final sign-off on access reviews / critical actions.

### 2. User & Access Management
-   **Onboarding**: streamlined "Add User" workflow with auto-generated `business_user_id`.
-   **Role-Based Access Control (RBAC)**: Users are assigned specific roles (e.g., 'Analyst', 'Viewer') within applications.
-   **Access Reviews**: Structured workflow for managers to Retain, Revoke, or Modify user access.

### 3. Application Registry
-   Centralized directory of all enterprise applications (e.g., Salesforce, Jira).
-   Tracks metadata like Owner, Status (Active/Maintenance), and Active User Count.

### 4. Data Seeding & Mocking
-   Includes a sophisticated seeding script (`seed.py`) to populate the database with realistic mock data for demos.
-   Simulates an active environment with pre-filled statistics and user activities.

---

## Project Structure

```
CodeV4/
├── backend/                # FastAPI Backend
│   ├── db/                 # Database models & connection
│   ├── routers/            # API Endpoints
│   ├── services/           # Business Logic Layer
│   ├── config.py           # Configuration
│   ├── main.py             # Entry point
│   └── seed.py             # Data seeding script
├── frontend/               # React Frontend
│   ├── components/         # UI Components
│   │   ├── common/         # Shared (Sidebar, Header)
│   │   └── views/          # Role-specific Dashboards
│   ├── api.ts              # API Service layer
│   ├── App.tsx             # Main Layout & Routing
│   └── index.css           # Tailwind Global Styles
└── README.md
```

## Application Flow
1.  **Login**: User selects a role (simulated authentication).
2.  **Dashboard**: User lands on the dashboard corresponding to their role (e.g., Admin Dashboard).
3.  **Action**: User performs actions (e.g., Add User, Review Access) which trigger API calls to the backend.
4.  **Persistence**: Backend processes requests using Services and updates the SQLite database.
