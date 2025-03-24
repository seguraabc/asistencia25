
import supabase from '../supabase';

// Utilities for user object creation and session management
export const createUserObject = (supabaseUser: any) => {
  const name = supabaseUser.email?.split('@')[0] || 'Usuario';
  return { 
    email: supabaseUser.email!, 
    name, 
    id: supabaseUser.id 
  };
};

export const saveSessionToStorage = (user: any) => {
  if (!user) return;
  localStorage.setItem('supabaseSession', JSON.stringify({ user }));
};

export const removeSessionFromStorage = () => {
  localStorage.removeItem('supabaseSession');
};

export const getStoredSession = () => {
  const storedSession = localStorage.getItem('supabaseSession');
  if (!storedSession) return null;
  
  try {
    return JSON.parse(storedSession);
  } catch (e) {
    console.error("Error parsing stored session:", e);
    return null;
  }
};
