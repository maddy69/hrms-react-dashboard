from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from database import engine, Base, get_db
import models
import schemas
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="HRMS Lite API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "HRMS Lite API is running!!"}

# --- Employee Routes ---
@app.post("/employees/", response_model=schemas.EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    if db.query(models.Employee).filter(models.Employee.email == employee.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(models.Employee).filter(models.Employee.employee_id == employee.employee_id).first():
        raise HTTPException(status_code=400, detail="Employee ID already exists")

    new_employee = models.Employee(**employee.dict())
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)
    return new_employee

@app.get("/employees/", response_model=List[schemas.EmployeeResponse])
def get_employees(db: Session = Depends(get_db)):
    employees = db.query(models.Employee).all()
    for emp in employees:
        emp.total_present = db.query(models.Attendance).filter(
            models.Attendance.employee_id == emp.id, models.Attendance.status == "Present"
        ).count()
        emp.total_absent = db.query(models.Attendance).filter(
            models.Attendance.employee_id == emp.id, models.Attendance.status == "Absent"
        ).count()
    return employees

@app.delete("/employees/{emp_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(emp_id: int, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.id == emp_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(employee)
    db.commit()
    return None

# --- Attendance Routes ---
@app.post("/attendance/", response_model=schemas.AttendanceResponse, status_code=status.HTTP_201_CREATED)
def mark_attendance(attendance: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.id == attendance.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    existing_record = db.query(models.Attendance).filter(
        models.Attendance.employee_id == attendance.employee_id,
        models.Attendance.date == attendance.date
    ).first()
    
    if existing_record:
        # OPTIONAL: Allow updating instead of error? For now, we stick to error as per spec.
        raise HTTPException(status_code=400, detail="Attendance already marked for this date")

    new_attendance = models.Attendance(
        employee_id=attendance.employee_id,
        date=attendance.date,
        status=attendance.status.value
    )
    db.add(new_attendance)
    db.commit()
    db.refresh(new_attendance)
    return new_attendance

@app.get("/attendance/{emp_id}", response_model=List[schemas.AttendanceResponse])
def get_attendance_history(emp_id: int, db: Session = Depends(get_db)):
    return db.query(models.Attendance).filter(models.Attendance.employee_id == emp_id).all()

# --- NEW: Get attendance for ALL employees on a specific date ---
@app.get("/attendance/daily/{target_date}", response_model=List[schemas.AttendanceResponse])
def get_daily_attendance(target_date: date, db: Session = Depends(get_db)):
    return db.query(models.Attendance).filter(models.Attendance.date == target_date).all()

# --- UPDATED: Stats with Date Parameter ---
@app.get("/stats")
def get_dashboard_stats(target_date: date = None, db: Session = Depends(get_db)):
    # Default to today if no date provided
    if target_date is None:
        target_date = date.today()
        
    total_emp = db.query(models.Employee).count()
    
    present_count = db.query(models.Attendance).filter(
        models.Attendance.date == target_date,
        models.Attendance.status == "Present"
    ).count()

    absent_count = db.query(models.Attendance).filter(
        models.Attendance.date == target_date,
        models.Attendance.status == "Absent"
    ).count()
    
    return {
        "total_employees": total_emp,
        "present_today": present_count,
        "absent_today": absent_count,
        "date": target_date
    }