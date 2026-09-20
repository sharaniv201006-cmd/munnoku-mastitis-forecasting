import { mockApi } from './mockApi';
import type { AnimalDashboardData, HerdSummary, Prediction } from '../types';

const FORCE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';
const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://munnoku-mastitis-forecasting.onrender.com');

export const api = {
  getHerdSummary: async (): Promise<HerdSummary> => {
    if (FORCE_MOCK) return mockApi.getHerdSummary();
    try {
      const res = await fetch(`${BASE_URL}/api/herd-summary`);
      if (!res.ok) throw new Error("API error");
      return await res.json();
    } catch {
      return mockApi.getHerdSummary();
    }
  },
  
  getAnimals: async () => {
    if (FORCE_MOCK) return mockApi.getAnimals();
    try {
      const res = await fetch(`${BASE_URL}/api/animals`);
      if (!res.ok) throw new Error("API error");
      return await res.json();
    } catch {
      return mockApi.getAnimals();
    }
  },
  
  getAnimalDetails: async (id: string): Promise<AnimalDashboardData> => {
    if (FORCE_MOCK) return mockApi.getAnimalDetails(id);
    try {
      const res = await fetch(`${BASE_URL}/api/animals/${id}`);
      if (!res.ok) throw new Error("API error");
      return await res.json();
    } catch {
      return mockApi.getAnimalDetails(id);
    }
  },
  
  getAlerts: async (): Promise<Prediction[]> => {
    if (FORCE_MOCK) return mockApi.getAlerts();
    try {
      const res = await fetch(`${BASE_URL}/api/alerts`);
      if (!res.ok) throw new Error("API error");
      return await res.json();
    } catch {
      return mockApi.getAlerts();
    }
  },
  
  recordVerification: async (data: any): Promise<boolean> => {
    if (FORCE_MOCK) return mockApi.recordVerification(data);
    try {
      const res = await fetch(`${BASE_URL}/api/verifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.ok;
    } catch {
      return mockApi.recordVerification(data);
    }
  }
};

