from pydantic import BaseModel, EmailStr, Field
from datetime import date
from typing import List, Optional
from models import AttendanceStatus

# --- Employee Schemas ---
class EmployeeBase(BaseModel):
    employee_id: str = Field(..., min_length=1, description="Unique ID provided by HR")
    name: str = Field(..., min_length=2)
    email: EmailStr
    department: str = Field(..., min_length=2)

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeResponse(EmployeeBase):
    id: int
    total_present: int = 0
    total_absent: int = 0  # <--- NEW FIELD
    
    class Config:
        from_attributes = True 

# --- Attendance Schemas ---
class AttendanceBase(BaseModel):
    date: date
    status: AttendanceStatus

class AttendanceCreate(AttendanceBase):
    employee_id: int 

class AttendanceResponse(AttendanceBase):
    id: int
    employee_id: int

    class Config:
        from_attributes = True