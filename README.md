# SIH 2026 - Bovine Mastitis Early Forecasting

## Project Concept
**INDIVIDUALIZED TEMPORAL MASTITIS FORECASTING**
This system learns the normal pattern of each individual animal and identifies persistent temporal deviations across multiple signals (EC, Yield, Rumination, Activity, etc.).

Instead of fixed thresholds, it utilizes:
- Multi-Signal Temporal Convergence
- Rolling Baselines
- Rate of Change

## Architecture
- **Frontend**: React, TypeScript, Vite, TailwindCSS, Recharts
- **Backend**: FastAPI (Python)
- **ML**: Scikit-Learn (Random Forest Baseline), XGBoost/LightGBM
- **Explainability**: SHAP (To be implemented)

## Setup Instructions

### 1. Python Environment (Backend & ML)
```bash
pip install -r requirements.txt
# Train the baseline model first
python ml/train_model.py
# Run the FastAPI server
cd backend
uvicorn main:app --reload
```

### 2. Node Environment (Frontend)
```bash
cd frontend
npm install
npm run dev
```

*Note: This is a PROTOTYPE using synthetic data. Do not represent the forecasting results as real clinical validation.*
