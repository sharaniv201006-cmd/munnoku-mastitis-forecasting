import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Farm(Base):
    __tablename__ = "farms"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    total_animals = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    animals = relationship("Animal", back_populates="farm", cascade="all, delete-orphan")

class Animal(Base):
    __tablename__ = "animals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    animal_code = Column(String(100), unique=True, nullable=False, index=True)
    farm_id = Column(String(36), ForeignKey("farms.id", ondelete="CASCADE"), nullable=True)
    breed = Column(String(100), default="Holstein Cross")
    age_years = Column(Integer, default=4)
    parity = Column(Integer, default=2)
    days_in_milk = Column(Integer, default=120)
    previous_mastitis = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    farm = relationship("Farm", back_populates="animals")
    readings = relationship("SensorReading", back_populates="animal", cascade="all, delete-orphan", order_by="desc(SensorReading.timestamp)")
    predictions = relationship("Prediction", back_populates="animal", cascade="all, delete-orphan", order_by="desc(Prediction.prediction_timestamp)")
    verifications = relationship("MastitisVerification", back_populates="animal", cascade="all, delete-orphan")

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    animal_id = Column(String(36), ForeignKey("animals.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    milk_yield = Column(Float, nullable=True)
    milk_ec = Column(Float, nullable=True)
    milk_temperature = Column(Float, nullable=True)
    activity = Column(Float, nullable=True)
    rumination = Column(Float, nullable=True)
    body_temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    ambient_temperature = Column(Float, nullable=True)

    animal = relationship("Animal", back_populates="readings")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    animal_id = Column(String(36), ForeignKey("animals.id", ondelete="CASCADE"), nullable=False, index=True)
    prediction_timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    risk_probability = Column(Float, nullable=False)
    risk_level = Column(String(50), nullable=False)  # 'NO RISK', 'LOW', 'MODERATE', 'HIGH'
    forecast_horizon = Column(String(50), default="7-14 days")
    data_confidence = Column(String(50), default="HIGH")  # 'HIGH', 'LOW', 'INSUFFICIENT'
    model_version = Column(String(100), default="XGBoost_v1.0")
    created_at = Column(DateTime, default=datetime.utcnow)

    animal = relationship("Animal", back_populates="predictions")
    risk_factors = relationship("RiskFactor", back_populates="prediction", cascade="all, delete-orphan")

class RiskFactor(Base):
    __tablename__ = "risk_factors"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    prediction_id = Column(String(36), ForeignKey("predictions.id", ondelete="CASCADE"), nullable=False, index=True)
    feature_name = Column(String(100), nullable=False)
    feature_value = Column(Float, nullable=True)
    baseline_value = Column(Float, nullable=True)
    deviation = Column(Float, nullable=True)
    direction = Column(String(50), default="increasing")
    contribution = Column(Float, nullable=False)
    importance = Column(String(50), default="medium")

    prediction = relationship("Prediction", back_populates="risk_factors")

class MastitisVerification(Base):
    __tablename__ = "mastitis_verifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    animal_id = Column(String(36), ForeignKey("animals.id", ondelete="CASCADE"), nullable=False, index=True)
    prediction_id = Column(String(36), ForeignKey("predictions.id", ondelete="SET NULL"), nullable=True)
    verification_date = Column(DateTime, default=datetime.utcnow)
    cmt_result = Column(String(100), nullable=True)
    scc_value = Column(Integer, nullable=True)
    veterinary_confirmation = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    animal = relationship("Animal", back_populates="verifications")
