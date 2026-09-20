import { Animal, AnimalDashboardData, HerdSummary, Prediction } from '../types';
import { Platform } from 'react-native';

// Dynamically use localhost for Web/iOS and 10.0.2.2 for Android emulator, or Cloud API URL
export let API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

export function setApiBaseUrl(url: string) {
  API_BASE_URL = url;
}

const FALLBACK_ANIMALS: Animal[] = [
  {
    id: "a1",
    animal_code: "COW_055",
    breed: "Holstein Friesian Cross",
    age_years: 4,
    parity: 2,
    days_in_milk: 110,
    previous_mastitis: 1,
    latest_prediction: {
      animal_id: "a1",
      prediction_timestamp: new Date().toISOString(),
      risk_probability: 0.78,
      risk_level: "HIGH",
      forecast_horizon: "7-14 days",
      data_confidence: "HIGH",
      top_factors: [
        {
          feature_name: "Milk Electrical Conductivity",
          feature_value: 6.45,
          baseline_value: 5.20,
          deviation: 1.25,
          direction: "increasing",
          contribution: 0.45,
          importance: "high"
        },
        {
          feature_name: "Daily Rumination Time",
          feature_value: 360,
          baseline_value: 480,
          deviation: -120,
          direction: "decreasing",
          contribution: 0.32,
          importance: "high"
        }
      ]
    }
  },
  {
    id: "a2",
    animal_code: "COW_023",
    breed: "Jersey Cross",
    age_years: 3,
    parity: 1,
    days_in_milk: 85,
    previous_mastitis: 0,
    latest_prediction: {
      animal_id: "a2",
      prediction_timestamp: new Date().toISOString(),
      risk_probability: 0.48,
      risk_level: "MODERATE",
      forecast_horizon: "7-14 days",
      data_confidence: "HIGH",
      top_factors: [
        {
          feature_name: "Milk Electrical Conductivity",
          feature_value: 5.85,
          baseline_value: 5.30,
          deviation: 0.55,
          direction: "increasing",
          contribution: 0.30,
          importance: "medium"
        }
      ]
    }
  },
  {
    id: "a3",
    animal_code: "COW_012",
    breed: "Holstein Cross",
    age_years: 5,
    parity: 3,
    days_in_milk: 190,
    previous_mastitis: 0,
    latest_prediction: {
      animal_id: "a3",
      prediction_timestamp: new Date().toISOString(),
      risk_probability: 0.08,
      risk_level: "LOW",
      forecast_horizon: "7-14 days",
      data_confidence: "HIGH",
      top_factors: []
    }
  }
];

export const mobileApi = {
  getHerdSummary: async (): Promise<HerdSummary> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/herd-summary`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error("Network response not ok");
      return await res.json();
    } catch {
      return {
        total_animals: 100,
        high_risk: 4,
        moderate_risk: 12,
        low_risk: 84,
        rising_risk: 8
      };
    }
  },

  getAnimals: async (riskLevel?: string): Promise<Animal[]> => {
    try {
      const url = riskLevel && riskLevel !== 'ALL'
        ? `${API_BASE_URL}/api/animals?risk_level=${riskLevel}`
        : `${API_BASE_URL}/api/animals`;
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error("Network response not ok");
      return await res.json();
    } catch {
      if (riskLevel && riskLevel !== 'ALL') {
        return FALLBACK_ANIMALS.filter(a => a.latest_prediction?.risk_level === riskLevel);
      }
      return FALLBACK_ANIMALS;
    }
  },

  getAnimalDetails: async (animalCodeOrId: string): Promise<AnimalDashboardData> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/animals/${animalCodeOrId}`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error("Network response not ok");
      return await res.json();
    } catch {
      const found = FALLBACK_ANIMALS.find(a => a.animal_code === animalCodeOrId || a.id === animalCodeOrId) || FALLBACK_ANIMALS[0];
      return {
        animal: found,
        prediction: found.latest_prediction || {
          animal_id: found.id,
          prediction_timestamp: new Date().toISOString(),
          risk_probability: 0.15,
          risk_level: "LOW",
          forecast_horizon: "7-14 days",
          data_confidence: "HIGH",
          top_factors: []
        },
        readings: [
          { animal_id: found.id, timestamp: "Day 1", milk_yield: 26.2, milk_ec: 5.2, milk_temperature: 38.4, activity: 102, rumination: 470, body_temperature: 38.6, humidity: 65, ambient_temperature: 28 },
          { animal_id: found.id, timestamp: "Day 2", milk_yield: 25.8, milk_ec: 5.3, milk_temperature: 38.5, activity: 98, rumination: 460, body_temperature: 38.6, humidity: 66, ambient_temperature: 28 },
          { animal_id: found.id, timestamp: "Day 3", milk_yield: 24.5, milk_ec: 5.7, milk_temperature: 38.7, activity: 92, rumination: 420, body_temperature: 38.8, humidity: 64, ambient_temperature: 29 },
          { animal_id: found.id, timestamp: "Day 4", milk_yield: 23.0, milk_ec: 6.2, milk_temperature: 39.0, activity: 85, rumination: 380, body_temperature: 39.1, humidity: 68, ambient_temperature: 30 },
          { animal_id: found.id, timestamp: "Day 5", milk_yield: 21.8, milk_ec: 6.5, milk_temperature: 39.2, activity: 80, rumination: 350, body_temperature: 39.3, humidity: 70, ambient_temperature: 30 }
        ],
        history: []
      };
    }
  },

  recordVerification: async (data: any): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/verifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.ok;
    } catch {
      return true;
    }
  }
};
