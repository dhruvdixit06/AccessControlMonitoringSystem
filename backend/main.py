from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.db.database import Base, engine
from backend.db import models
from backend.routers import users, roles, user_roles, applications, access, mappings, review
from backend.logger import logger
import time

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Access Review POC API v2")

# Middleware for logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    logger.info(f"Request: {request.method} {request.url}")
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(f"Response: {response.status_code} (took {process_time:.4f}s)")
        return response
    except Exception as e:
        logger.error(f"Request failed: {e}")
        raise

# CORS for local Next.js frontend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from backend.middleware.audit import audit_middleware
app.middleware("http")(audit_middleware)

@app.get("/")
def root():
    return {"message": "Access Review POC API v2 running"}

app.include_router(users.router)
app.include_router(roles.router)
app.include_router(user_roles.router)
app.include_router(applications.router)
app.include_router(access.router)
app.include_router(mappings.router)
app.include_router(review.router)

from backend.routers import dashboard
app.include_router(dashboard.router)
