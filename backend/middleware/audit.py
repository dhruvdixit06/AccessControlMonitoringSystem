from fastapi import Request
from backend.logger import logger
import time

async def audit_middleware(request: Request, call_next):
    # Logic to identify sensitive actions
    sensitive_paths = ["/revoke", "/delete"]
    is_sensitive = any(path in request.url.path for path in sensitive_paths)
    
    if is_sensitive:
        logger.warning(f"AUDIT WARN: Sensitive action initiated on {request.url.path} by {request.client.host}")
    
    response = await call_next(request)
    
    if is_sensitive and response.status_code < 400:
         logger.warning(f"AUDIT SUCCESS: Sensitive action completed on {request.url.path}")

    return response
