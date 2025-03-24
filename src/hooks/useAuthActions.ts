
import { useState } from 'react';
import { toast } from 'sonner';
import supabase from '../supabase';
import { createUserObject, saveSessionToStorage, removeSessionFromStorage } from '../utils/authUtils';
import { loadInitialData } from '../utils/googleSheetsApi';
import { User } from './useSessionManager';

export function useAuthActions(setUser: (user: User | null) => void, setIsLoading: (isLoading: boolean) => void) {
  const login = async (email: string, password: string, isRegistering = false) => {
    try {
      console.log(`Iniciando ${isRegistering ? 'registro' : 'sesión'} con correo: ${email}`);
      
      // Validations
      if (!email || !email.includes('@')) {
        toast.error('Por favor ingrese un correo electrónico válido');
        throw new Error('Por favor ingrese un correo electrónico válido');
      }

      if (!password || password.length < 6) {
        toast.error('La contraseña debe tener al menos 6 caracteres');
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      setIsLoading(true);

      if (isRegistering) {
        // Handle signup
        console.log("Creando cuenta nueva...");
        const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              name: email.split('@')[0]
            }
          }
        });
        
        if (signUpError) {
          console.error("Error al crear cuenta:", signUpError);
          throw signUpError;
        }
        
        if (newUser) {
          console.log("Cuenta creada exitosamente:", newUser.email);
          const userObj = createUserObject(newUser);
          setUser(userObj);
          saveSessionToStorage(newUser);
          toast.success(`¡Bienvenido/a ${userObj.name}! Se ha creado tu cuenta.`);
          
          try {
            await loadInitialData();
          } catch (dataError) {
            console.error("Error al cargar datos iniciales:", dataError);
            // Continuamos aunque falle la carga de datos
          }
        }
      } else {
        // Handle sign-in
        console.log("Iniciando sesión...");
        const { data: { user: supabaseUser }, error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });

        if (error) {
          console.error("Error al iniciar sesión:", error);
          throw error;
        }

        if (supabaseUser) {
          console.log("Sesión iniciada exitosamente:", supabaseUser.email);
          const newUser = createUserObject(supabaseUser);
          setUser(newUser);
          saveSessionToStorage(supabaseUser);
          toast.success(`¡Bienvenido/a ${newUser.name}!`);
          
          try {
            await loadInitialData();
          } catch (dataError) {
            console.error("Error al cargar datos iniciales:", dataError);
            // Continuamos aunque falle la carga
          }
        }
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al iniciar sesión';
      console.error(mensaje, error);
      toast.error(mensaje);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log("Cerrando sesión...");
      setIsLoading(true);
      
      // Sign out and clear storage in parallel
      await Promise.all([
        supabase.auth.signOut(),
        removeSessionFromStorage()
      ]);
      
      console.log("Sesión cerrada exitosamente");
      setUser(null);
      toast.info('Sesión cerrada correctamente');
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al cerrar sesión';
      console.error(mensaje, error);
      toast.error(mensaje);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    logout
  };
}
