const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

const handleResponse = async (response: Response) => {
  try {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Something went wrong');
    }
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to the server. Please check your internet connection or try again later.');
    }
    throw error;
  }
};

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  register: async (email: string, password: string, fullName: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, fullName }),
    });
    return handleResponse(response);
  },
  // Expenses
  getExpenses: async (token: string) => {
    const response = await fetch(`${API_URL}/expenses`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  createExpense: async (data: any, token: string) => {
    const response = await fetch(`${API_URL}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateExpense: async (id: string, data: any, token: string) => {
    const response = await fetch(`${API_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteExpense: async (id: string, token: string) => {
    const response = await fetch(`${API_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },
};