from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    credits = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    images = relationship("Image", back_populates="owner")
    transactions = relationship("Transaction", back_populates="user")


class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    original_filename = Column(String, nullable=False)
    original_path = Column(String, nullable=False)
    processed_path = Column(String, nullable=True)
    faces_detected = Column(Integer, default=0)
    status = Column(String, default="processing")  # processing, done, failed
    credits_used = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="images")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    credits = Column(Integer, nullable=False)
    amount_usd = Column(Float, nullable=True)
    type = Column(String, nullable=False)  # purchase, usage, welcome_bonus
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="transactions")
