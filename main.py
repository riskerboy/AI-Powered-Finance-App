from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uvicorn

# --- AI Analysis imports ---
import os
import httpx
from dotenv import load_dotenv

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# SQLite Database setup
engine = create_engine("sqlite:///./freelancer.db")
Base = declarative_base()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Database Models
class Income(Base):
    __tablename__ = "income"
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    date = Column(String, nullable=False)
    client = Column(String, nullable=True)  # Optional for expenses
    category = Column(String, nullable=False)
    type = Column(String, default="income")  # "income" or "expense"
    note = Column(String, nullable=True)  # Optional note field
    status = Column(String, default="received")

class Goal(Base):
    __tablename__ = "goals"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    target = Column(Float, nullable=False)
    current = Column(Float, default=0)
    deadline = Column(String, nullable=False)
    color = Column(String, nullable=False)

class PendingPayment(Base):
    __tablename__ = "pending_payments"
    id = Column(Integer, primary_key=True, index=True)
    client = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String, default="pending")
    due_date = Column(String, nullable=False)
    goal_id = Column(Integer, nullable=True)  # Optional goal assignment
    bill_id = Column(Integer, nullable=True)  # Optional bill assignment

class Bill(Base):
    __tablename__ = "bills"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    due_date = Column(Integer, nullable=False)
    paid = Column(Boolean, default=False)
    month = Column(String, nullable=False)  # e.g. '2024-06'

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic models for request/response
class IncomeCreate(BaseModel):
    amount: float
    date: str
    client: Optional[str] = None
    category: str
    type: str = "income"
    note: Optional[str] = None

class IncomeResponse(BaseModel):
    id: int
    amount: float
    date: str
    client: Optional[str]
    category: str
    type: str
    note: Optional[str]
    status: str

class GoalCreate(BaseModel):
    name: str
    target: float
    deadline: str
    color: str

class GoalResponse(BaseModel):
    id: int
    name: str
    target: float
    current: float
    deadline: str
    color: str

class PendingPaymentCreate(BaseModel):
    client: str
    amount: float
    due_date: str
    goal_id: Optional[int] = None
    bill_id: Optional[int] = None

class PendingPaymentResponse(BaseModel):
    id: int
    client: str
    amount: float
    status: str
    due_date: str
    goal_id: Optional[int] = None
    bill_id: Optional[int] = None

class BillCreate(BaseModel):
    name: str
    amount: float
    due_date: int
    month: str

class BillResponse(BaseModel):
    id: int
    name: str
    amount: float
    due_date: int
    paid: bool
    month: str

# --- AI Analysis Models ---
class AIAnalysisRequest(BaseModel):
    income: float
    expenses: float
    top_categories: List[str]
    goals: List[str]

class AIAnalysisResponse(BaseModel):
    analysis: str

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Income endpoints
@app.get("/income", response_model=List[IncomeResponse])
def get_income(db: Session = Depends(get_db)):
    return db.query(Income).all()

@app.post("/income", response_model=IncomeResponse)
def create_income(income: IncomeCreate, db: Session = Depends(get_db)):
    db_income = Income(**income.dict())
    db.add(db_income)
    db.commit()
    db.refresh(db_income)
    return db_income

@app.delete("/income/{income_id}")
def delete_income(income_id: int, db: Session = Depends(get_db)):
    income = db.query(Income).filter(Income.id == income_id).first()
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    db.delete(income)
    db.commit()
    return {"message": "Income deleted"}

@app.put("/income/{income_id}", response_model=IncomeResponse)
def update_income(income_id: int, income_update: IncomeCreate, db: Session = Depends(get_db)):
    income = db.query(Income).filter(Income.id == income_id).first()
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    
    income.amount = income_update.amount
    income.date = income_update.date
    income.client = income_update.client
    income.category = income_update.category
    
    db.commit()
    db.refresh(income)
    return income

# Goals endpoints
@app.get("/goals", response_model=List[GoalResponse])
def get_goals(db: Session = Depends(get_db)):
    return db.query(Goal).all()

@app.post("/goals", response_model=GoalResponse)
def create_goal(goal: GoalCreate, db: Session = Depends(get_db)):
    db_goal = Goal(**goal.dict(), current=0)
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@app.put("/goals/{goal_id}")
def update_goal_progress(goal_id: int, goal_update: GoalCreate, db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    goal.name = goal_update.name
    goal.target = goal_update.target
    goal.deadline = goal_update.deadline
    goal.color = goal_update.color
    
    db.commit()
    db.refresh(goal)
    return goal

@app.put("/goals/{goal_id}/progress")
def update_goal_current(goal_id: int, current: float, db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    goal.current = current
    db.commit()
    return goal

@app.delete("/goals/{goal_id}")
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(goal)
    db.commit()
    return {"message": "Goal deleted"}

# Pending payments endpoints
@app.get("/pending-payments", response_model=List[PendingPaymentResponse])
def get_pending_payments(db: Session = Depends(get_db)):
    return db.query(PendingPayment).all()

@app.post("/pending-payments", response_model=PendingPaymentResponse)
def create_pending_payment(payment: PendingPaymentCreate, db: Session = Depends(get_db)):
    db_payment = PendingPayment(**payment.dict())
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

@app.put("/pending-payments/{payment_id}/mark-received")
def mark_payment_received(payment_id: int, db: Session = Depends(get_db)):
    payment = db.query(PendingPayment).filter(PendingPayment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    payment.status = "received"
    db.commit()
    return payment

@app.delete("/pending-payments/{payment_id}")
def delete_pending_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = db.query(PendingPayment).filter(PendingPayment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    db.delete(payment)
    db.commit()
    return {"message": "Payment deleted"}

# Bills endpoints
@app.get("/bills", response_model=List[BillResponse])
def get_bills(month: str = None, db: Session = Depends(get_db)):
    query = db.query(Bill)
    if month:
        query = query.filter(Bill.month == month)
    return query.all()

@app.post("/bills", response_model=BillResponse)
def create_bill(bill: BillCreate, db: Session = Depends(get_db)):
    db_bill = Bill(**bill.dict(), paid=False)
    db.add(db_bill)
    db.commit()
    db.refresh(db_bill)
    return db_bill

@app.put("/bills/{bill_id}", response_model=BillResponse)
def update_bill(bill_id: int, bill_update: BillCreate, db: Session = Depends(get_db)):
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    bill.name = bill_update.name
    bill.amount = bill_update.amount
    bill.due_date = bill_update.due_date
    bill.month = bill_update.month
    db.commit()
    db.refresh(bill)
    return bill

@app.put("/bills/{bill_id}/toggle")
def toggle_bill_paid(bill_id: int, db: Session = Depends(get_db)):
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    bill.paid = not bill.paid
    db.commit()
    return bill

@app.delete("/bills/{bill_id}")
def delete_bill(bill_id: int, db: Session = Depends(get_db)):
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    db.delete(bill)
    db.commit()
    return {"message": "Bill deleted"}

# Dashboard stats endpoint
@app.get("/dashboard-stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_income = db.query(Income).with_entities(func.sum(Income.amount)).scalar() or 0
    total_pending = db.query(PendingPayment).with_entities(func.sum(PendingPayment.amount)).scalar() or 0
    total_bills = db.query(Bill).with_entities(func.sum(Bill.amount)).scalar() or 0
    unpaid_bills = db.query(Bill).filter(Bill.paid == False).with_entities(func.sum(Bill.amount)).scalar() or 0
    
    goals = db.query(Goal).all()
    total_goals_target = sum(goal.target for goal in goals)
    total_goals_current = sum(goal.current for goal in goals)
    
    return {
        "total_income": total_income,
        "total_pending": total_pending,
        "total_bills": total_bills,
        "unpaid_bills": unpaid_bills,
        "total_goals_target": total_goals_target,
        "total_goals_current": total_goals_current
    }

# --- AI Analysis Endpoint ---
@app.post("/ai-analysis", response_model=AIAnalysisResponse)
async def ai_analysis(request: AIAnalysisRequest):
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured.")

    # Compose a friendly, supportive prompt
    prompt = (
        f"Here is my financial data for this month:\n"
        f"- Income: ${request.income}\n"
        f"- Expenses: ${request.expenses}\n"
        f"- Top categories: {', '.join(request.top_categories)}\n"
        f"- Goals: {', '.join(request.goals)}\n\n"
        "Please give me a friendly, supportive summary of how I’m doing, and suggest one or two gentle improvements if needed. Be sweet and encouraging, not critical."
    )

    # Call OpenAI API
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        {"role": "system", "content": "You are a sweet, supportive financial coach for freelancers. Always be positive and encouraging."},
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 300,
                    "temperature": 0.7
                }
            )
            response.raise_for_status()
            data = response.json()
            ai_message = data["choices"][0]["message"]["content"].strip()
            return {"analysis": ai_message}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)