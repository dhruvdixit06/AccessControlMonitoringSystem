from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
import re

# Roles
class RoleBase(BaseModel):
    name: str

class RoleCreate(RoleBase):
    pass

class Role(RoleBase):
    id: int
    class Config:
        orm_mode = True

# Users
class UserBase(BaseModel):
    business_user_id: str
    name: str
    email: EmailStr

    @field_validator("business_user_id")
    @classmethod
    def validate_business_user_id(cls, v: str) -> str:
        pattern = r"^(IPAMC|EXTA)\d+$"
        if not re.match(pattern, v):
            raise ValueError("business_user_id must match pattern: IPAMC/EXTA followed by digits, e.g. IPAMC20, EXTA341")
        return v

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    class Config:
        orm_mode = True

# UserRole
class UserRoleBase(BaseModel):
    user_id: int
    role_id: int

class UserRoleCreate(UserRoleBase):
    pass

class UserRole(UserRoleBase):
    id: int
    class Config:
        orm_mode = True

# Application
class ApplicationBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: Optional[str] = "Not Started"
    last_updated: Optional[str] = "Today"
    user_count: Optional[int] = 0

class ApplicationCreate(ApplicationBase):
    pass

class Application(ApplicationBase):
    id: int
    class Config:
        orm_mode = True

# Access
class AccessBase(BaseModel):
    user_id: int
    application_id: int

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None

class AccessCreate(AccessBase):
    pass

class AccessUpdate(BaseModel):
    active: Optional[bool] = None

class Access(AccessBase):
    id: int
    active: bool
    created_at: datetime
    class Config:
        orm_mode = True

# Mappings
class ReportingMapCreate(BaseModel):
    manager_id: int
    user_id: int

class ReportingMap(BaseModel):
    id: int
    manager_id: int
    user_id: int
    class Config:
        orm_mode = True

class AppMapBase(BaseModel):
    app_id: int
    user_id: int

class AppManagerMapCreate(AppMapBase):
    pass

class AppOwnerMapCreate(AppMapBase):
    pass

class BusinessOwnerMapCreate(AppMapBase):
    pass

class AppManagerMap(AppMapBase):
    id: int
    class Config:
        orm_mode = True

class AppOwnerMap(AppMapBase):
    id: int
    class Config:
        orm_mode = True

class BusinessOwnerMap(AppMapBase):
    id: int
    class Config:
        orm_mode = True

# Review
class ReviewCycleBase(BaseModel):
    quarter: str

class ReviewCycleCreate(ReviewCycleBase):
    pass

class ReviewCycle(ReviewCycleBase):
    id: int
    status: str
    created_at: datetime
    class Config:
        orm_mode = True

class ReviewItemBase(BaseModel):
    id: int
    cycle_id: int
    access_id: int
    # Removed reporting_manager_id
    app_manager_id: Optional[int]
    app_owner_id: Optional[int]
    business_owner_id: Optional[int]
    pending_stage: str
    
    # Removed manager_action (Reporting Manager)

    application_manager_action: Optional[str]
    application_manager_comment: Optional[str]
    application_owner_action: Optional[str]
    application_owner_comment: Optional[str]
    business_owner_action: Optional[str]
    business_owner_comment: Optional[str]
    final_status: Optional[str]

    class Config:
        orm_mode = True

class StageActionInput(BaseModel):
    review_item_id: int
    actor_user_id: int
    action: str
    comment: Optional[str] = None

# Dashboard
class DashboardUserCreate(BaseModel):
    name: str
    email: EmailStr
    business_user_id: str  # Added manually input
    application: str  # Name of application, e.g. "Salesforce"
    role: str         # Name of role, e.g. "Admin"
    status: str       # "Active" or "Inactive"
