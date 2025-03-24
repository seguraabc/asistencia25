
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import supabase from '../supabase';
import { createUserObject, saveSessionToStorage, removeSessionFromStorage, getStoredSession } from '../utils/authUtils';
import { loadInitialData } from '../utils/googleSheetsApi';

export type User = {
  email: string;
  name: string;
  id: string;
};

export function useSessionManager() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verify current authentication status
  const checkAuth = useCallback(async () => {
    try {
      console.log("Verificando autenticación...");
      
      // Try to get session from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error obteniendo sesión:", sessionError);
        throw sessionError;
      }
      
      if (session?.user) {
        console.log("Sesión encontrada en Supabase:", session.user.email);
        const newUser = createUserObject(session.user);
        setUser(newUser);
        saveSessionToStorage(session.user);
        
        try {
          await loadInitialData();
        } catch (dataError) {
          console.error("Error cargando datos iniciales:", dataError);
          // Continuamos aunque falle la carga de datos
        }
        return;
      }
      
      // If no Supabase session, try local storage
      const storedSession = getStoredSession();
      if (storedSession?.user) {
        console.log("Sesión encontrada en localStorage:", storedSession.user.email);
        const newUser = createUserObject(storedSession.user);
        setUser(newUser);
        return;
      }
      
      console.log("No se encontró ninguna sesión activa");
      setUser(null);
    } catch (error) {
      console.error("Error verificando autenticación:", error);
      setUser(null);
      throw error;
    }
  }, []);

  // Set up Supabase auth listener
  const setupAuthListener = useCallback(() => {
    console.log("Configurando listener de autenticación");
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Cambio de estado de autenticación:", event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log("Usuario ha iniciado sesión:", session.user.email);
        const newUser = createUserObject(session.user);
        setUser(newUser);
        saveSessionToStorage(session.user);
        
        try {
          await loadInitialData();
        } catch (error) {
          console.error("Error cargando datos iniciales:", error);
          // No bloqueamos aunque falle la carga
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("Usuario ha cerrado sesión");
        removeSessionFromStorage();
        setUser(null);
      }
    });
  }, []);

  return {
    user,
    setUser,
    isLoading,
    setIsLoading,
    checkAuth,
    setupAuthListener
  };
}
