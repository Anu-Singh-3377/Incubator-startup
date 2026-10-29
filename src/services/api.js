import { supabase } from '../lib/supabaseClient';

// API service for interacting with the Express backend

const BASE_URL = '/api';

/**
 * Helper to make JSON requests with error handling
 */
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('vb_auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    console.error(`[API Error: ${endpoint}]`, err.message);
    throw err;
  }
};

export const authApi = {
  // Password login
  login: async ({ email, password, role }) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role })
    });
    if (data.token) {
      localStorage.setItem('vb_auth_token', data.token);
      localStorage.setItem('vb_user_data', JSON.stringify(data.user));
    }
    return data;
  },

  // Send OTP
  sendOtp: async (identifier) => {
    return await request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier })
    });
  },

  // Verify OTP
  verifyOtp: async (identifier, otp) => {
    const data = await request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier, otp })
    });
    if (data.token) {
      localStorage.setItem('vb_auth_token', data.token);
      localStorage.setItem('vb_user_data', JSON.stringify(data.user));
    }
    return data;
  },

  // Register Startup / Mentor
  register: async (userData) => {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (data.token) {
      localStorage.setItem('vb_auth_token', data.token);
      localStorage.setItem('vb_user_data', JSON.stringify(data.user));
    }
    return data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    return await request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  // Fetch current session profile
  getMe: async () => {
    return await request('/auth/me', {
      method: 'GET'
    });
  },

  // Fetch demo credentials for one-click testing
  getDemoCredentials: async () => {
    return await request('/auth/demo-credentials', {
      method: 'GET'
    });
  },

  // Fetch incubator platform stats
  getStats: async () => {
    return await request('/incubator/stats', {
      method: 'GET'
    });
  },

  // Logout
  logout: () => {
    localStorage.removeItem('vb_auth_token');
    localStorage.removeItem('vb_user_data');
  },

  // Get stored user from local storage
  getStoredUser: () => {
    try {
      const u = localStorage.getItem('vb_user_data');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  // Get stored token
  getStoredToken: () => {
    return localStorage.getItem('vb_auth_token');
  }
};

export const communicationApi = {
  getStatus: async () => {
    return await request('/communication/status', { method: 'GET' });
  },

  sendBroadcast: async (payload) => {
    const { data: { session } } = await supabase?.auth.getSession() || { data: { session: null } };
    if (!session?.access_token) throw new Error('Please sign in with an authorized administrator account.');
    return await request('/communication/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify(payload)
    });
  },

  sendTestEmail: async ({ testEmail, subject, htmlBody }) => {
    const { data: { session } } = await supabase?.auth.getSession() || { data: { session: null } };
    if (!session?.access_token) throw new Error('Please sign in with an authorized administrator account.');
    return await request('/communication/test', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ testEmail, subject, htmlBody })
    });
  }
};


