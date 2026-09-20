# Multi-stage lightweight Python container for Mastitis Forecasting API
FROM python:3.10-slim

WORKDIR /app

# Install system build dependencies for C-extensions (LightGBM, XGBoost, Scikit-learn)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy ML folder and dataset for inference & features
COPY ml /app/ml
COPY dataset /app/dataset
COPY "Dataset Mastitis.xlsx" /app/

# Copy backend source code
COPY backend /app/backend

WORKDIR /app/backend

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
