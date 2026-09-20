import joblib
import pandas as pd
import numpy as np
import os
import shap

from preprocessing import load_and_preprocess
from feature_engineering import create_temporal_features

class MastitisPredictor:
    def __init__(self, model_dir="models"):
        self.model = joblib.load(os.path.join(model_dir, "best_model.pkl"))
        self.features = joblib.load(os.path.join(model_dir, "features.pkl"))
        explainer_path = os.path.join(model_dir, "shap_explainer.pkl")
        self.explainer = joblib.load(explainer_path) if os.path.exists(explainer_path) else None
        
    def predict_for_animal(self, animal_id, data_path="../dataset/Dataset Mastitis.xlsx"):
        df, _ = load_and_preprocess(data_path)
        df = create_temporal_features(df)
        
        animal_data = df[df['Animal_ID'] == animal_id].copy()
        if animal_data.empty:
            raise ValueError(f"No data found for animal {animal_id}")
            
        latest_record = animal_data.iloc[-1:]
        X = latest_record[self.features].fillna(0)
        
        # Check data confidence
        confidence = latest_record['data_confidence'].iloc[0]
        if confidence == "INSUFFICIENT":
            return {
                "animal_id": animal_id,
                "error": "Insufficient historical data",
                "data_confidence": "INSUFFICIENT"
            }
            
        prob = self.model.predict_proba(X)[0][1]
        
        risk_level = "NO RISK"
        if prob >= 0.7:
            risk_level = "HIGH"
        elif prob >= 0.4:
            risk_level = "MODERATE"
        elif prob >= 0.15:
            risk_level = "LOW"
            
        # SHAP
        top_factors = []
        if self.explainer:
            shap_values = self.explainer.shap_values(X)
            # Depending on shap version and model, it might return a list or array
            if isinstance(shap_values, list):
                shap_vals = shap_values[1][0] # class 1
            else:
                shap_vals = shap_values[0] # LightGBM/XGBoost typically output 1D for binary
                
            # Pair with features
            feat_impact = [(self.features[i], float(shap_vals[i]), float(X.iloc[0, i])) for i in range(len(self.features))]
            feat_impact.sort(key=lambda x: abs(x[1]), reverse=True)
            
            for f, impact, val in feat_impact[:3]:
                if abs(impact) > 0.01:
                    top_factors.append({
                        "feature": f,
                        "direction": "increasing risk" if impact > 0 else "decreasing risk",
                        "impact_value": impact
                    })

        return {
            "animal_id": animal_id,
            "risk_probability": float(prob),
            "risk_level": risk_level,
            "forecast_horizon": "7-14 days",
            "data_confidence": confidence,
            "top_factors": top_factors
        }

if __name__ == "__main__":
    predictor = MastitisPredictor()
    print(predictor.predict_for_animal("COW_055"))
