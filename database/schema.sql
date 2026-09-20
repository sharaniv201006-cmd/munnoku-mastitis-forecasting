-- MUNNOKKU Database Schema (PostgreSQL/Supabase compatible)

CREATE TABLE farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    total_animals INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE animals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    animal_code VARCHAR(100) NOT NULL UNIQUE,
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    breed VARCHAR(100),
    age_years INT,
    parity INT,
    days_in_milk INT,
    previous_mastitis INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_animals_farm_id ON animals(farm_id);

CREATE TABLE sensor_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    milk_yield DECIMAL(10,2),
    milk_ec DECIMAL(10,3),
    milk_temperature DECIMAL(5,2),
    activity DECIMAL(10,2),
    rumination DECIMAL(10,2),
    body_temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    ambient_temperature DECIMAL(5,2)
);
CREATE INDEX idx_sensor_readings_animal_time ON sensor_readings(animal_id, timestamp DESC);
CREATE INDEX idx_sensor_readings_timestamp ON sensor_readings(timestamp);

CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    prediction_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    risk_probability DECIMAL(5,4) NOT NULL,
    risk_level VARCHAR(50) NOT NULL CHECK (risk_level IN ('NO RISK', 'LOW', 'MODERATE', 'HIGH')),
    forecast_horizon VARCHAR(50) NOT NULL DEFAULT '7-14 days',
    data_confidence VARCHAR(50) NOT NULL CHECK (data_confidence IN ('HIGH', 'LOW', 'INSUFFICIENT')),
    model_version VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_predictions_animal_time ON predictions(animal_id, prediction_timestamp DESC);
CREATE INDEX idx_predictions_risk_level ON predictions(risk_level);

CREATE TABLE risk_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    feature_value DECIMAL(12,4),
    baseline_value DECIMAL(12,4),
    deviation DECIMAL(12,4),
    direction VARCHAR(50) NOT NULL,
    contribution DECIMAL(10,4) NOT NULL,
    importance VARCHAR(50)
);
CREATE INDEX idx_risk_factors_prediction ON risk_factors(prediction_id);

CREATE TABLE mastitis_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    prediction_id UUID REFERENCES predictions(id) ON DELETE SET NULL,
    verification_date TIMESTAMP WITH TIME ZONE NOT NULL,
    cmt_result VARCHAR(100),
    scc_value INT,
    veterinary_confirmation BOOLEAN,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_mastitis_verifications_animal ON mastitis_verifications(animal_id);

CREATE TABLE mastitis_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50),
    confirmed BOOLEAN DEFAULT false,
    notes TEXT
);
CREATE INDEX idx_mastitis_events_animal ON mastitis_events(animal_id);
