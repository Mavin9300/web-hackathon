import { supabase } from '../services/supabaseClient';
import { API_URL } from '../config';

export const REPUTATION_REQUIREMENTS = {
  CHAT: 50,
  FORUM: 30,
  REQUEST: 20
};

export const checkReputation = async (action) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      throw new Error('Not authenticated');
    }

    const res = await fetch(`${API_URL}/api/profiles/check-reputation?action=${action}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.ok) {
      return await res.json();
    } else {
      throw new Error('Failed to check reputation');
    }
  } catch (error) {
    console.error('Reputation check error:', error);
    throw error;
  }
};

export const convertPointsToReputation = async (points) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      throw new Error('Not authenticated');
    }

    const res = await fetch(`${API_URL}/api/profiles/convert-points-to-reputation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ points })
    });

    if (res.ok) {
      return await res.json();
    } else {
      const error = await res.json();
      throw new Error(error.error || 'Failed to convert points');
    }
  } catch (error) {
    console.error('Points conversion error:', error);
    throw error;
  }
};
