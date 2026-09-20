from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# --- Sensor Readings ---
class SensorReadingBase(BaseModel):
    timestamp: datetime
    milk_yield: Optional[float] = None
    milk_ec: Optional[float] = None
    milk_temperature: Optional[float] = None
    activity: Optional[float] = None
    rumination: Optional[float] = None
    body_temperature: Optional[float] = None
    humidity: Optional[float] = None
    ambient_temperature: Optional[float] = None

class SensorReadingCreate(SensorReadingBase):
    animal_id: str

class SensorReadingResponse(SensorReadingBase):
    id: str
    animal_id: str

    class Config:
        from_attributes = True

# --- Risk Factors (SHAP Explainability) ---
class RiskFactorResponse(BaseModel):
    feature_name: str
    feature_value: Optional[float] = 0.0
    baseline_value: Optional[float] = 0.0
    deviation: Optional[float] = 0.0
    direction: str = "increasing"  # 'increasing' | 'decreasing' | 'stable'
    contribution: float = 0.0
    importance: str = "medium"  # 'high' | 'medium' | 'low'

    class Config:
        from_attributes = True

# --- Predictions ---
class PredictionResponse(BaseModel):
    id: Optional[str] = None
    animal_id: str
    prediction_timestamp: datetime
    risk_probability: float
    risk_level: str  # 'NO RISK' | 'LOW' | 'MODERATE' | 'HIGH'
    forecast_horizon: str = "7-14 days"
    data_confidence: str = "HIGH"  # 'HIGH' | 'LOW' | 'INSUFFICIENT'
    top_factors: Optional[List[RiskFactorResponse]] = []

    class Config:
        from_attributes = True

# --- Animal ---
class AnimalBase(BaseModel):
    animal_code: str
    farm_id: Optional[str] = None
    breed: Optional[str] = "Holstein Cross"
    age_years: Optional[int] = 4
    parity: Optional[int] = 2
    days_in_milk: Optional[int] = 120
    previous_mastitis: Optional[int] = 0

class AnimalCreate(AnimalBase):
    pass

class AnimalResponse(AnimalBase):
    id: str
    created_at: datetime
    latest_prediction: Optional[PredictionResponse] = None

    class Config:
        from_attributes = True

# --- Verification ---
class VerificationCreate(BaseModel):
    animal_id: str
    prediction_id: Optional[str] = None
    verification_date: Optional[datetime] = None
    cmt_result: Optional[str] = "Negative"
    scc_value: Optional[int] = 150000
    veterinary_confirmation: bool = False
    notes: Optional[str] = None

class VerificationResponse(VerificationCreate):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Herd Summary ---
class HerdSummaryResponse(BaseModel):
    total_animals: int
    high_risk: int
    moderate_risk: int
    low_risk: int
    rising_risk: int

# --- Full Animal Dashboard Payload ---
class AnimalDashboardResponse(BaseModel):
    animal: AnimalResponse
    prediction: PredictionResponse
    readings: List[SensorReadingResponse]
    history: List[SensorReadingResponse]
