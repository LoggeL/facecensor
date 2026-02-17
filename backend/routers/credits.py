from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from datetime import datetime
from database import get_db
import models
import auth as auth_utils

router = APIRouter(prefix="/credits", tags=["credits"])

CREDIT_PACKAGES = [
    {"id": "starter", "name": "Starter", "credits": 5, "price_usd": 2.99, "popular": False},
    {"id": "pro", "name": "Pro", "credits": 15, "price_usd": 6.99, "popular": True},
    {"id": "business", "name": "Business", "credits": 50, "price_usd": 18.99, "popular": False},
]


class PurchaseRequest(BaseModel):
    package_id: str


class TransactionResponse(BaseModel):
    id: int
    credits: int
    amount_usd: float | None
    type: str
    description: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class BalanceResponse(BaseModel):
    credits: int
    transactions: List[TransactionResponse]


@router.get("/packages")
def get_packages():
    return CREDIT_PACKAGES


@router.get("/balance", response_model=BalanceResponse)
def get_balance(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    transactions = (
        db.query(models.Transaction)
        .filter(models.Transaction.user_id == current_user.id)
        .order_by(models.Transaction.created_at.desc())
        .limit(20)
        .all()
    )
    return BalanceResponse(
        credits=current_user.credits,
        transactions=transactions,
    )


@router.post("/purchase")
def purchase_credits(
    data: PurchaseRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    package = next((p for p in CREDIT_PACKAGES if p["id"] == data.package_id), None)
    if not package:
        raise HTTPException(status_code=400, detail="Invalid package")

    # Mock payment — in production integrate Stripe here
    current_user.credits += package["credits"]

    transaction = models.Transaction(
        user_id=current_user.id,
        credits=package["credits"],
        amount_usd=package["price_usd"],
        type="purchase",
        description=f"Purchased {package['credits']} credits ({package['name']} package)",
    )
    db.add(transaction)
    db.commit()
    db.refresh(current_user)

    return {
        "success": True,
        "credits_added": package["credits"],
        "new_balance": current_user.credits,
        "message": f"Successfully added {package['credits']} credits to your account",
    }
