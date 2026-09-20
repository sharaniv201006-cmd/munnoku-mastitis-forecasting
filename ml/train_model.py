import pandas as pd
import numpy as np
import json
import os
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
import xgboost as xgb
import lightgbm as lgb
import shap

from preprocessing import load_and_preprocess
from feature_engineering import create_temporal_features
from model_evaluation import evaluate_model, save_metrics

def time_aware_split(df):
    """
    Chronological split based on time.
    Earliest 70% -> Train
    Next 15% -> Validation
    Latest 15% -> Test
    """
    df = df.sort_values(by='Date').reset_index(drop=True)
    n = len(df)
    train_end = int(n * 0.7)
    val_end = int(n * 0.85)
    
    train_df = df.iloc[:train_end]
    val_df = df.iloc[train_end:val_end]
    test_df = df.iloc[val_end:]
    
    dates = {
        "train_period": [str(train_df['Date'].min()), str(train_df['Date'].max())],
        "val_period": [str(val_df['Date'].min()), str(val_df['Date'].max())],
        "test_period": [str(test_df['Date'].min()), str(test_df['Date'].max())]
    }
    
    return train_df, val_df, test_df, dates

def train_and_evaluate(data_path):
    print("Loading data...")
    df, distribution = load_and_preprocess(data_path)
    
    print("Engineering features...")
    df = create_temporal_features(df)
    
    # Exclude columns not for training
    target = 'Future_Mastitis_Event_7_14_Days'
    exclude_cols = ['Animal_ID', 'Date', 'Risk_Level', 'data_confidence', target]
    
    # Fill NA correctly before model training
    for col in df.columns:
        if df[col].dtype in [np.float64, np.float32, np.int64, np.int32]:
            df[col] = df[col].fillna(0)
    
    train_df, val_df, test_df, split_dates = time_aware_split(df)
    
    features = [c for c in train_df.columns if c not in exclude_cols and train_df[c].dtype in [np.float64, np.int64, np.int32, float, int]]
    
    X_train, y_train = train_df[features], train_df[target]
    X_val, y_val = val_df[features], val_df[target]
    X_test, y_test = test_df[features], test_df[target]
    
    models = {
        "LogisticRegression": LogisticRegression(max_iter=1000, random_state=42),
        "RandomForest": RandomForestClassifier(n_estimators=100, random_state=42),
        "XGBoost": xgb.XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42),
        "LightGBM": lgb.LGBMClassifier(random_state=42, n_estimators=100, verbose=-1)
    }
    
    best_model = None
    best_pr_auc = -1
    best_name = ""
    all_metrics = {}
    
    for name, model in models.items():
        model.fit(X_train, y_train)
        y_val_prob = model.predict_proba(X_val)[:, 1]
        y_val_pred = model.predict(X_val)
        
        metrics = evaluate_model(name, y_val, y_val_pred, y_val_prob)
        all_metrics[name] = metrics
        
        # Select best model based on PR-AUC on Validation set
        if metrics['pr_auc'] > best_pr_auc:
            best_pr_auc = metrics['pr_auc']
            best_model = model
            best_name = name

    print(f"Best model based on PR-AUC (Validation): {best_name}")
    
    # Test on test set
    y_test_prob = best_model.predict_proba(X_test)[:, 1]
    y_test_pred = best_model.predict(X_test)
    test_metrics = evaluate_model(f"{best_name}_test", y_test, y_test_pred, y_test_prob)
    
    save_metrics(test_metrics, "models/model_metrics.json")
    
    # Save the model
    os.makedirs("models", exist_ok=True)
    joblib.dump(best_model, f"models/best_model.pkl")
    joblib.dump(features, f"models/features.pkl")
    
    # Feature Importance (if tree-based)
    if hasattr(best_model, 'feature_importances_'):
        importances = best_model.feature_importances_
        feature_importance_dict = {f: float(imp) for f, imp in zip(features, importances)}
        # Sort
        feature_importance_dict = dict(sorted(feature_importance_dict.items(), key=lambda item: item[1], reverse=True))
        with open("models/feature_importance.json", "w") as f:
            json.dump(feature_importance_dict, f, indent=4)
            
    # SHAP explainer
    if best_name in ["RandomForest", "XGBoost", "LightGBM"]:
        explainer = shap.TreeExplainer(best_model)
        joblib.dump(explainer, "models/shap_explainer.pkl")
    
    # Metadata
    metadata = {
        "selected_model": best_name,
        "features_used": features,
        "train_period": split_dates['train_period'],
        "validation_period": split_dates['val_period'],
        "test_period": split_dates['test_period'],
        "test_metrics": test_metrics,
        "dataset_distribution": distribution,
        "notes": "WARNING: Prototype using synthetic data. Do not present as clinical validation."
    }
    with open("models/model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=4)
        
    print("Training and evaluation completed.")

if __name__ == "__main__":
    train_and_evaluate("../dataset/Dataset Mastitis.xlsx")
