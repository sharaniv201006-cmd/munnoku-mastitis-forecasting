import os
import pandas as pd
from datetime import datetime
from database import SessionLocal, engine, Base
import models
from ml_service import ml_service

def seed_database(excel_path: str = None):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if already seeded
        existing_animals = db.query(models.Animal).count()
        if existing_animals > 0:
            print(f"Database already populated with {existing_animals} animals.")
            return

        if excel_path is None:
            # Check relative paths
            possible_paths = [
                os.path.join("..", "dataset", "Dataset Mastitis.xlsx"),
                os.path.join("..", "Dataset Mastitis.xlsx"),
                os.path.join("dataset", "Dataset Mastitis.xlsx"),
                "Dataset Mastitis.xlsx"
            ]
            for p in possible_paths:
                if os.path.exists(p):
                    excel_path = p
                    break

        if not excel_path or not os.path.exists(excel_path):
            print(f"Dataset excel not found, creating baseline farm.")
            farm = models.Farm(name="SIH Smart Dairy Research Farm", location="Tamil Nadu / Karnataka", total_animals=5)
            db.add(farm)
            db.commit()
            return

        print(f"Reading dataset from {excel_path}...")
        df = pd.read_excel(excel_path, sheet_name="Mastitis_Data")
        df['Date'] = pd.to_datetime(df['Date'])
        df = df.sort_values(by=['Animal_ID', 'Date'])

        # Create Farm
        farm = models.Farm(name="SIH Smart Dairy Research Farm", location="India", total_animals=len(df['Animal_ID'].unique()))
        db.add(farm)
        db.commit()
        db.refresh(farm)

        animal_map = {}
        unique_animals = df['Animal_ID'].unique()
        print(f"Seeding {len(unique_animals)} animals...")

        for code in unique_animals:
            sub_df = df[df['Animal_ID'] == code].iloc[0]
            animal = models.Animal(
                animal_code=str(code),
                farm_id=farm.id,
                breed="Holstein Friesian Cross",
                age_years=int(sub_df.get('Age_Years', 4)),
                parity=int(sub_df.get('Parity', 2)),
                days_in_milk=int(sub_df.get('Days_in_Milk', 120)),
                previous_mastitis=int(sub_df.get('Previous_Mastitis', 0))
            )
            db.add(animal)
            db.flush()
            animal_map[code] = animal

        print("Seeding sensor readings and calculating baseline predictions...")
        for code, animal in animal_map.items():
            animal_rows = df[df['Animal_ID'] == code]
            readings_dicts = []
            for _, r in animal_rows.iterrows():
                reading = models.SensorReading(
                    animal_id=animal.id,
                    timestamp=r['Date'].to_pydatetime(),
                    milk_yield=float(r['Milk_Yield_L_Day']) if pd.notnull(r['Milk_Yield_L_Day']) else None,
                    milk_ec=float(r['Milk_EC_mS_cm']) if pd.notnull(r['Milk_EC_mS_cm']) else None,
                    milk_temperature=float(r['Milk_Temperature_C']) if pd.notnull(r['Milk_Temperature_C']) else None,
                    activity=float(r['Activity_Index']) if pd.notnull(r['Activity_Index']) else None,
                    rumination=float(r['Rumination_Min_Day']) if pd.notnull(r['Rumination_Min_Day']) else None,
                    body_temperature=float(r['Body_Temperature_C']) if pd.notnull(r['Body_Temperature_C']) else None,
                    humidity=float(r['Humidity_Percent']) if pd.notnull(r['Humidity_Percent']) else None,
                    ambient_temperature=float(r['Ambient_Temperature_C']) if pd.notnull(r['Ambient_Temperature_C']) else None
                )
                db.add(reading)
                readings_dicts.append({
                    "timestamp": r['Date'].strftime('%Y-%m-%d %H:%M:%S'),
                    "milk_yield": r['Milk_Yield_L_Day'],
                    "milk_ec": r['Milk_EC_mS_cm'],
                    "milk_temperature": r['Milk_Temperature_C'],
                    "activity": r['Activity_Index'],
                    "rumination": r['Rumination_Min_Day'],
                    "body_temperature": r['Body_Temperature_C'],
                    "humidity": r['Humidity_Percent'],
                    "ambient_temperature": r['Ambient_Temperature_C']
                })

            # Run initial prediction for this animal
            pred_res = ml_service.predict_from_readings(code, readings_dicts)
            prediction = models.Prediction(
                animal_id=animal.id,
                prediction_timestamp=datetime.utcnow(),
                risk_probability=pred_res["risk_probability"],
                risk_level=pred_res["risk_level"],
                forecast_horizon=pred_res["forecast_horizon"],
                data_confidence=pred_res["data_confidence"],
                model_version="LightGBM_Temporal_v1"
            )
            db.add(prediction)
            db.flush()

            for factor in pred_res.get("top_factors", []):
                rf = models.RiskFactor(
                    prediction_id=prediction.id,
                    feature_name=factor["feature_name"],
                    feature_value=factor.get("feature_value"),
                    baseline_value=factor.get("baseline_value"),
                    deviation=factor.get("deviation"),
                    direction=factor.get("direction", "increasing"),
                    contribution=factor.get("contribution", 0.1),
                    importance=factor.get("importance", "medium")
                )
                db.add(rf)

        db.commit()
        print("Database seed completed successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
