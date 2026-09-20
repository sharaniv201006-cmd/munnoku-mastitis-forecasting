import os
from typing import List, Optional
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import uvicorn

from database import engine, Base, get_db
import models
import schemas
from ml_service import ml_service
from seed_db import seed_database

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Munnokku Bovine Mastitis Forecasting API",
    description="Individualized Temporal Mastitis Forecasting & Sensor Analytics Backend for SIH 2026",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    try:
        seed_database()
    except Exception as e:
        print(f"Auto-seed note: {e}")

FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")
if not os.path.exists(FRONTEND_DIST):
    FRONTEND_DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend_dist")

@app.get("/")
def read_root():
    index_file = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {
        "project": "Munnokku Bovine Mastitis Forecasting System",
        "system_status": "operational",
        "docs_url": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# --- Herd Summary ---
@app.get("/api/herd-summary", response_model=schemas.HerdSummaryResponse)
def get_herd_summary(db: Session = Depends(get_db)):
    animals = db.query(models.Animal).all()
    total = len(animals)
    
    high = 0
    moderate = 0
    low = 0
    rising = 0

    for a in animals:
        latest_pred = db.query(models.Prediction).filter(models.Prediction.animal_id == a.id).order_by(models.Prediction.prediction_timestamp.desc()).first()
        if latest_pred:
            if latest_pred.risk_level == "HIGH":
                high += 1
            elif latest_pred.risk_level == "MODERATE":
                moderate += 1
            elif latest_pred.risk_level == "LOW":
                low += 1
            
            # If probability increased recently
            if latest_pred.risk_probability > 0.35:
                rising += 1
        else:
            low += 1

    return {
        "total_animals": total,
        "high_risk": high,
        "moderate_risk": moderate,
        "low_risk": low,
        "rising_risk": rising
    }

# --- Animals ---
@app.get("/api/animals", response_model=List[schemas.AnimalResponse])
def get_animals(
    risk_level: Optional[str] = Query(None, description="Filter by HIGH, MODERATE, LOW, NO RISK"),
    search: Optional[str] = Query(None, description="Search by animal code"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Animal)
    if search:
        query = query.filter(models.Animal.animal_code.ilike(f"%{search}%"))
    
    animals = query.all()
    results = []

    for a in animals:
        latest_pred = db.query(models.Prediction).filter(models.Prediction.animal_id == a.id).order_by(models.Prediction.prediction_timestamp.desc()).first()
        
        if risk_level and latest_pred and latest_pred.risk_level != risk_level.upper():
            continue

        pred_dto = None
        if latest_pred:
            factors = db.query(models.RiskFactor).filter(models.RiskFactor.prediction_id == latest_pred.id).all()
            pred_dto = schemas.PredictionResponse(
                id=latest_pred.id,
                animal_id=latest_pred.animal_id,
                prediction_timestamp=latest_pred.prediction_timestamp,
                risk_probability=latest_pred.risk_probability,
                risk_level=latest_pred.risk_level,
                forecast_horizon=latest_pred.forecast_horizon,
                data_confidence=latest_pred.data_confidence,
                top_factors=[
                    schemas.RiskFactorResponse(
                        feature_name=f.feature_name,
                        feature_value=f.feature_value,
                        baseline_value=f.baseline_value,
                        deviation=f.deviation,
                        direction=f.direction,
                        contribution=f.contribution,
                        importance=f.importance
                    ) for f in factors
                ]
            )

        results.append(schemas.AnimalResponse(
            id=a.id,
            animal_code=a.animal_code,
            farm_id=a.farm_id,
            breed=a.breed,
            age_years=a.age_years,
            parity=a.parity,
            days_in_milk=a.days_in_milk,
            previous_mastitis=a.previous_mastitis,
            created_at=a.created_at,
            latest_prediction=pred_dto
        ))

    return results

# --- Animal Details (Dashboard data) ---
@app.get("/api/animals/{animal_id}", response_model=schemas.AnimalDashboardResponse)
def get_animal_details(animal_id: str, db: Session = Depends(get_db)):
    # Lookup by ID or Animal Code
    animal = db.query(models.Animal).filter((models.Animal.id == animal_id) | (models.Animal.animal_code == animal_id)).first()
    if not animal:
        raise HTTPException(status_code=404, detail=f"Animal '{animal_id}' not found")

    # Fetch latest prediction
    latest_pred = db.query(models.Prediction).filter(models.Prediction.animal_id == animal.id).order_by(models.Prediction.prediction_timestamp.desc()).first()
    
    top_factors = []
    if latest_pred:
        factors = db.query(models.RiskFactor).filter(models.RiskFactor.prediction_id == latest_pred.id).all()
        top_factors = [
            schemas.RiskFactorResponse(
                feature_name=f.feature_name,
                feature_value=f.feature_value,
                baseline_value=f.baseline_value,
                deviation=f.deviation,
                direction=f.direction,
                contribution=f.contribution,
                importance=f.importance
            ) for f in factors
        ]
        pred_dto = schemas.PredictionResponse(
            id=latest_pred.id,
            animal_id=latest_pred.animal_id,
            prediction_timestamp=latest_pred.prediction_timestamp,
            risk_probability=latest_pred.risk_probability,
            risk_level=latest_pred.risk_level,
            forecast_horizon=latest_pred.forecast_horizon,
            data_confidence=latest_pred.data_confidence,
            top_factors=top_factors
        )
    else:
        pred_dto = schemas.PredictionResponse(
            animal_id=animal.id,
            prediction_timestamp=datetime.utcnow(),
            risk_probability=0.08,
            risk_level="NO RISK",
            forecast_horizon="7-14 days",
            data_confidence="LOW",
            top_factors=[]
        )

    # Fetch readings
    readings = db.query(models.SensorReading).filter(models.SensorReading.animal_id == animal.id).order_by(models.SensorReading.timestamp.asc()).all()
    
    reading_dtos = [
        schemas.SensorReadingResponse(
            id=r.id,
            animal_id=r.animal_id,
            timestamp=r.timestamp,
            milk_yield=r.milk_yield or 0.0,
            milk_ec=r.milk_ec or 0.0,
            milk_temperature=r.milk_temperature or 0.0,
            activity=r.activity or 0.0,
            rumination=r.rumination or 0.0,
            body_temperature=r.body_temperature or 0.0,
            humidity=r.humidity or 0.0,
            ambient_temperature=r.ambient_temperature or 0.0
        ) for r in readings
    ]

    animal_dto = schemas.AnimalResponse(
        id=animal.id,
        animal_code=animal.animal_code,
        farm_id=animal.farm_id,
        breed=animal.breed,
        age_years=animal.age_years,
        parity=animal.parity,
        days_in_milk=animal.days_in_milk,
        previous_mastitis=animal.previous_mastitis,
        created_at=animal.created_at,
        latest_prediction=pred_dto
    )

    return {
        "animal": animal_dto,
        "prediction": pred_dto,
        "readings": reading_dtos,
        "history": reading_dtos
    }

# --- Trigger On-Demand Inference ---
@app.post("/api/predict/{animal_id}", response_model=schemas.PredictionResponse)
def trigger_prediction(animal_id: str, db: Session = Depends(get_db)):
    animal = db.query(models.Animal).filter((models.Animal.id == animal_id) | (models.Animal.animal_code == animal_id)).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    readings = db.query(models.SensorReading).filter(models.SensorReading.animal_id == animal.id).order_by(models.SensorReading.timestamp.asc()).all()
    
    readings_dicts = [
        {
            "timestamp": r.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            "milk_yield": r.milk_yield,
            "milk_ec": r.milk_ec,
            "milk_temperature": r.milk_temperature,
            "activity": r.activity,
            "rumination": r.rumination,
            "body_temperature": r.body_temperature,
            "humidity": r.humidity,
            "ambient_temperature": r.ambient_temperature
        } for r in readings
    ]

    pred_res = ml_service.predict_from_readings(animal.animal_code, readings_dicts)

    new_pred = models.Prediction(
        animal_id=animal.id,
        prediction_timestamp=datetime.utcnow(),
        risk_probability=pred_res["risk_probability"],
        risk_level=pred_res["risk_level"],
        forecast_horizon=pred_res["forecast_horizon"],
        data_confidence=pred_res["data_confidence"],
        model_version="LightGBM_Temporal_v1"
    )
    db.add(new_pred)
    db.flush()

    top_factors_dto = []
    for f in pred_res.get("top_factors", []):
        rf = models.RiskFactor(
            prediction_id=new_pred.id,
            feature_name=f["feature_name"],
            feature_value=f.get("feature_value"),
            baseline_value=f.get("baseline_value"),
            deviation=f.get("deviation"),
            direction=f.get("direction", "increasing"),
            contribution=f.get("contribution", 0.1),
            importance=f.get("importance", "medium")
        )
        db.add(rf)
        top_factors_dto.append(schemas.RiskFactorResponse(**f))

    db.commit()

    return schemas.PredictionResponse(
        id=new_pred.id,
        animal_id=animal.id,
        prediction_timestamp=new_pred.prediction_timestamp,
        risk_probability=new_pred.risk_probability,
        risk_level=new_pred.risk_level,
        forecast_horizon=new_pred.forecast_horizon,
        data_confidence=new_pred.data_confidence,
        top_factors=top_factors_dto
    )

# --- Ingest Realtime Sensor Readings ---
@app.post("/api/sensor-readings", response_model=schemas.SensorReadingResponse, status_code=status.HTTP_201_CREATED)
def ingest_sensor_reading(reading_in: schemas.SensorReadingCreate, db: Session = Depends(get_db)):
    animal = db.query(models.Animal).filter((models.Animal.id == reading_in.animal_id) | (models.Animal.animal_code == reading_in.animal_id)).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    reading = models.SensorReading(
        animal_id=animal.id,
        timestamp=reading_in.timestamp,
        milk_yield=reading_in.milk_yield,
        milk_ec=reading_in.milk_ec,
        milk_temperature=reading_in.milk_temperature,
        activity=reading_in.activity,
        rumination=reading_in.rumination,
        body_temperature=reading_in.body_temperature,
        humidity=reading_in.humidity,
        ambient_temperature=reading_in.ambient_temperature
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)

    return reading

# --- Alerts Endpoint ---
@app.get("/api/alerts", response_model=List[schemas.PredictionResponse])
def get_alerts(db: Session = Depends(get_db)):
    # Return predictions with HIGH or MODERATE risk
    preds = db.query(models.Prediction).filter(models.Prediction.risk_level.in_(["HIGH", "MODERATE"])).order_by(models.Prediction.prediction_timestamp.desc()).limit(20).all()
    
    alert_list = []
    for p in preds:
        factors = db.query(models.RiskFactor).filter(models.RiskFactor.prediction_id == p.id).all()
        alert_list.append(schemas.PredictionResponse(
            id=p.id,
            animal_id=p.animal_id,
            prediction_timestamp=p.prediction_timestamp,
            risk_probability=p.risk_probability,
            risk_level=p.risk_level,
            forecast_horizon=p.forecast_horizon,
            data_confidence=p.data_confidence,
            top_factors=[
                schemas.RiskFactorResponse(
                    feature_name=f.feature_name,
                    feature_value=f.feature_value,
                    baseline_value=f.baseline_value,
                    deviation=f.deviation,
                    direction=f.direction,
                    contribution=f.contribution,
                    importance=f.importance
                ) for f in factors
            ]
        ))
    return alert_list

# --- Verifications ---
@app.post("/api/verifications", status_code=status.HTTP_201_CREATED)
def record_verification(verif: schemas.VerificationCreate, db: Session = Depends(get_db)):
    animal = db.query(models.Animal).filter((models.Animal.id == verif.animal_id) | (models.Animal.animal_code == verif.animal_id)).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    rec = models.MastitisVerification(
        animal_id=animal.id,
        prediction_id=verif.prediction_id,
        verification_date=verif.verification_date or datetime.utcnow(),
        cmt_result=verif.cmt_result,
        scc_value=verif.scc_value,
        veterinary_confirmation=verif.veterinary_confirmation,
        notes=verif.notes
    )
    db.add(rec)
    db.commit()
    return {"status": "success", "message": "Verification record saved"}

# --- Serve Frontend Web Application ---
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")
if not os.path.exists(FRONTEND_DIST):
    FRONTEND_DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend_dist")

if os.path.exists(FRONTEND_DIST):
    assets_path = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

