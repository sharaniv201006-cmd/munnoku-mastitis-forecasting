export interface Animal {
  id: string;
  animal_code: string;
  farm_id?: string;
  breed?: string;
  age_years?: number;
  parity?: number;
  days_in_milk?: number;
  previous_mastitis?: number;
}

export interface SensorReading {
  id?: string;
  animal_id: string;
  timestamp: string;
  milk_yield: number;
  milk_ec: number;
  milk_temperature: number;
  activity: number;
  rumination: number;
  body_temperature: number;
  humidity: number;
  ambient_temperature: number;
}

export interface RiskFactor {
  feature_name: string;
  feature_value: number;
  baseline_value: number;
  deviation: number;
  direction: 'increasing' | 'decreasing' | 'stable';
  contribution: number;
  importance: 'high' | 'medium' | 'low';
}

export interface Prediction {
  id?: string;
  animal_id: string;
  prediction_timestamp: string;
  risk_probability: number;
  risk_level: 'NO RISK' | 'LOW' | 'MODERATE' | 'HIGH';
  forecast_horizon: string;
  data_confidence: 'HIGH' | 'LOW' | 'INSUFFICIENT';
  top_factors?: RiskFactor[];
}

export interface Verification {
  id?: string;
  animal_id: string;
  prediction_id?: string;
  verification_date: string;
  cmt_result: string;
  scc_value: number;
  veterinary_confirmation: boolean;
  notes?: string;
}

export interface HerdSummary {
  total_animals: number;
  high_risk: number;
  moderate_risk: number;
  low_risk: number;
  rising_risk: number;
}

export interface AnimalDashboardData {
  animal: Animal;
  prediction: Prediction;
  readings: SensorReading[];
  history: SensorReading[];
}
