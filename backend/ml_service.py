import os
import sys
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List

# Add ml directory to sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ML_DIR = os.path.join(BASE_DIR, "ml")
if ML_DIR not in sys.path:
    sys.path.append(ML_DIR)

try:
    from feature_engineering import create_temporal_features
except ImportError:
    create_temporal_features = None

class MLInferenceService:
    def __init__(self, models_dir: str = None):
        if models_dir is None:
            models_dir = os.path.join(BASE_DIR, "ml", "models")
        
        self.models_dir = models_dir
        self.model = None
        self.features = []
        self.explainer = None
        self._load_artifacts()

    def _load_artifacts(self):
        best_model_path = os.path.join(self.models_dir, "best_model.pkl")
        features_path = os.path.join(self.models_dir, "features.pkl")
        shap_path = os.path.join(self.models_dir, "shap_explainer.pkl")

        if os.path.exists(best_model_path):
            try:
                self.model = joblib.load(best_model_path)
            except Exception as e:
                print(f"Warning: Could not load best_model.pkl: {e}")

        if os.path.exists(features_path):
            try:
                self.features = joblib.load(features_path)
            except Exception as e:
                print(f"Warning: Could not load features.pkl: {e}")

        if os.path.exists(shap_path):
            try:
                self.explainer = joblib.load(shap_path)
            except Exception as e:
                print(f"Warning: Could not load shap_explainer.pkl: {e}")

    def predict_from_readings(self, animal_code: str, readings_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Runs feature engineering and model prediction on time-series sensor readings.
        """
        if not readings_data:
            return {
                "risk_probability": 0.05,
                "risk_level": "NO RISK",
                "forecast_horizon": "7-14 days",
                "data_confidence": "INSUFFICIENT",
                "top_factors": []
            }

        df = pd.DataFrame(readings_data)
        # Rename columns if needed to match training dataset format
        col_mapping = {
            "timestamp": "Date",
            "milk_yield": "Milk_Yield_L_Day",
            "milk_ec": "Milk_EC_mS_cm",
            "milk_temperature": "Milk_Temperature_C",
            "activity": "Activity_Index",
            "rumination": "Rumination_Min_Day",
            "body_temperature": "Body_Temperature_C",
            "humidity": "Humidity_Percent",
            "ambient_temperature": "Ambient_Temperature_C"
        }
        df = df.rename(columns=col_mapping)
        df["Animal_ID"] = animal_code
        df["Date"] = pd.to_datetime(df["Date"])
        df = df.sort_values(by="Date").reset_index(drop=True)

        if len(df) < 3:
            confidence = "INSUFFICIENT"
        elif len(df) < 7:
            confidence = "LOW"
        else:
            confidence = "HIGH"

        if create_temporal_features is not None:
            try:
                df = create_temporal_features(df)
            except Exception as e:
                print(f"Feature engineering failed: {e}")

        latest_row = df.iloc[-1:]
        
        # If model and features loaded, execute ML model
        prob = 0.12
        if self.model is not None and self.features:
            try:
                X = latest_row.reindex(columns=self.features, fill_value=0.0).fillna(0.0)
                prob = float(self.model.predict_proba(X)[0][1])
            except Exception as e:
                print(f"Model prediction failed, using fallback: {e}")
                prob = self._heuristic_fallback(latest_row)
        else:
            prob = self._heuristic_fallback(latest_row)

        prob = min(max(prob, 0.01), 0.99)

        if prob >= 0.70:
            risk_level = "HIGH"
        elif prob >= 0.40:
            risk_level = "MODERATE"
        elif prob >= 0.15:
            risk_level = "LOW"
        else:
            risk_level = "NO RISK"

        top_factors = self._generate_top_factors(latest_row, prob)

        return {
            "risk_probability": round(prob, 4),
            "risk_level": risk_level,
            "forecast_horizon": "7-14 days",
            "data_confidence": confidence,
            "top_factors": top_factors
        }

    def _heuristic_fallback(self, latest_row: pd.DataFrame) -> float:
        score = 0.1
        try:
            if "Milk_EC_mS_cm" in latest_row:
                ec = float(latest_row["Milk_EC_mS_cm"].iloc[0])
                if ec > 6.2: score += 0.35
                elif ec > 5.8: score += 0.15
            if "Rumination_Min_Day" in latest_row:
                rum = float(latest_row["Rumination_Min_Day"].iloc[0])
                if rum < 350: score += 0.25
                elif rum < 420: score += 0.10
            if "Milk_Yield_L_Day" in latest_row:
                yield_val = float(latest_row["Milk_Yield_L_Day"].iloc[0])
                if yield_val < 18: score += 0.15
        except Exception:
            pass
        return score

    def _generate_top_factors(self, latest_row: pd.DataFrame, prob: float) -> List[Dict[str, Any]]:
        factors = []
        try:
            # Check EC
            ec = float(latest_row.get("Milk_EC_mS_cm", [5.5]).iloc[0] if "Milk_EC_mS_cm" in latest_row else 5.5)
            ec_base = 5.2
            ec_dev = round(ec - ec_base, 2)
            if ec_dev > 0.3:
                factors.append({
                    "feature_name": "Milk Electrical Conductivity",
                    "feature_value": ec,
                    "baseline_value": ec_base,
                    "deviation": ec_dev,
                    "direction": "increasing",
                    "contribution": 0.42 if prob > 0.4 else 0.15,
                    "importance": "high" if ec > 6.0 else "medium"
                })

            # Check Rumination
            rum = float(latest_row.get("Rumination_Min_Day", [450]).iloc[0] if "Rumination_Min_Day" in latest_row else 450)
            rum_base = 480.0
            rum_dev = round(rum - rum_base, 1)
            if rum_dev < -30:
                factors.append({
                    "feature_name": "Daily Rumination Time",
                    "feature_value": rum,
                    "baseline_value": rum_base,
                    "deviation": rum_dev,
                    "direction": "decreasing",
                    "contribution": 0.31 if prob > 0.4 else 0.12,
                    "importance": "high" if rum < 380 else "medium"
                })

            # Check Milk Yield
            yd = float(latest_row.get("Milk_Yield_L_Day", [24]).iloc[0] if "Milk_Yield_L_Day" in latest_row else 24)
            yd_base = 27.5
            yd_dev = round(yd - yd_base, 1)
            if yd_dev < -2.0:
                factors.append({
                    "feature_name": "Milk Yield Output",
                    "feature_value": yd,
                    "baseline_value": yd_base,
                    "deviation": yd_dev,
                    "direction": "decreasing",
                    "contribution": 0.22,
                    "importance": "medium"
                })
        except Exception as e:
            print(f"Error generating factors: {e}")

        if not factors:
            factors.append({
                "feature_name": "Multi-Signal Convergence Baseline",
                "feature_value": 0.0,
                "baseline_value": 0.0,
                "deviation": 0.0,
                "direction": "stable",
                "contribution": 0.05,
                "importance": "low"
            })
        return factors

ml_service = MLInferenceService()
