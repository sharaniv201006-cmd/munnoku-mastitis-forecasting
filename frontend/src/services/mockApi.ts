import type { Animal, Prediction, RiskFactor, HerdSummary, SensorReading, AnimalDashboardData } from '../types';

// Mock Data for "DEMO SCENARIO MODE"
const DEMO_ANIMAL: Animal = {
  id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  animal_code: 'COW-027',
  farm_id: 'farm-001',
  breed: 'Holstein Cross',
  age_years: 5,
  parity: 3,
  days_in_milk: 120,
  previous_mastitis: 1
};

const DEMO_FACTORS: RiskFactor[] = [
  { feature_name: 'Milk EC', feature_value: 5.84, baseline_value: 5.35, deviation: 0.49, direction: 'increasing', contribution: 0.35, importance: 'high' },
  { feature_name: 'Milk Yield', feature_value: 12.1, baseline_value: 14.5, deviation: -2.4, direction: 'decreasing', contribution: 0.25, importance: 'high' },
  { feature_name: 'Rumination', feature_value: 380, baseline_value: 450, deviation: -70, direction: 'decreasing', contribution: 0.15, importance: 'medium' },
  { feature_name: 'Activity', feature_value: 85, baseline_value: 110, deviation: -25, direction: 'decreasing', contribution: 0.10, importance: 'medium' },
];

const DEMO_PREDICTION: Prediction = {
  id: 'pred-001',
  animal_id: DEMO_ANIMAL.id,
  prediction_timestamp: new Date().toISOString(),
  risk_probability: 0.78,
  risk_level: 'HIGH',
  forecast_horizon: '7-14 days',
  data_confidence: 'HIGH',
  top_factors: DEMO_FACTORS
};

const generateHistory = (days: number, trend: 'stable' | 'worsening' = 'stable') => {
  const history: SensorReading[] = [];
  const now = new Date();
  
  for(let i=days; i>=0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    
    let ec = 5.3 + (Math.random() * 0.2);
    let yield_ = 14.5 + (Math.random() * 1.5 - 0.75);
    let rum = 450 + (Math.random() * 40 - 20);
    let act = 110 + (Math.random() * 10 - 5);
    
    if (trend === 'worsening' && i < 3) {
      ec += 0.5;
      yield_ -= 2.0;
      rum -= 60;
      act -= 20;
    }
    
    history.push({
      animal_id: DEMO_ANIMAL.id,
      timestamp: d.toISOString(),
      milk_yield: yield_,
      milk_ec: ec,
      milk_temperature: 38.5,
      activity: act,
      rumination: rum,
      body_temperature: 38.8,
      humidity: 60,
      ambient_temperature: 25
    });
  }
  return history;
};

const DEMO_HISTORY = generateHistory(14, 'worsening');

export const mockApi = {
  getHerdSummary: async (): Promise<HerdSummary> => {
    return {
      total_animals: 100,
      high_risk: 1,
      moderate_risk: 4,
      low_risk: 95,
      rising_risk: 3
    };
  },
  
  getAnimals: async (): Promise<{animal: Animal, prediction: Prediction}[]> => {
    return [
      { animal: DEMO_ANIMAL, prediction: DEMO_PREDICTION },
      { 
        animal: { ...DEMO_ANIMAL, id: 'a2', animal_code: 'COW-055' }, 
        prediction: { ...DEMO_PREDICTION, id: 'pred-002', animal_id: 'a2', risk_probability: 0.45, risk_level: 'MODERATE' } 
      },
      { 
        animal: { ...DEMO_ANIMAL, id: 'a3', animal_code: 'COW-012' }, 
        prediction: { ...DEMO_PREDICTION, id: 'pred-003', animal_id: 'a3', risk_probability: 0.05, risk_level: 'NO RISK' } 
      }
    ];
  },
  
  getAnimalDetails: async (_id: string): Promise<AnimalDashboardData> => {
    return {
      animal: DEMO_ANIMAL,
      prediction: DEMO_PREDICTION,
      readings: [DEMO_HISTORY[DEMO_HISTORY.length - 1]],
      history: DEMO_HISTORY
    };
  },
  
  getAlerts: async (): Promise<Prediction[]> => {
    return [DEMO_PREDICTION];
  },
  
  recordVerification: async (data: any): Promise<boolean> => {
    console.log("Mock verification saved:", data);
    return true;
  }
};
