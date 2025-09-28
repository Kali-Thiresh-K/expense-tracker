import { api } from '@/lib/api';

export const budgetApi = {
  getBudget: async (token: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/budget`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch budget');
    }
    return response.json();
  },

  updateBudget: async (budget: number, token: string) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/budget`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ budget }),
    });
    if (!response.ok) {
      throw new Error('Failed to update budget');
    }
    return response.json();
  },
};