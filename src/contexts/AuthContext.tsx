
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSessionManager, User } from '../hooks/useSessionManager';
import { useAuthActions } from '../hooks/useAuthActions';
import { toast } from 'sonner';

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, isRegistering?: boolean) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    user, 
    setUser, 
    isLoading, 
    setIsLoading, 
    checkAuth, 
    setupAuthListener 
  } = useSessionManager();
  
  const { login, logout } = useAuthActions(setUser, setIsLoading);

  // Inicializamos con un estado conocido
  const [initializationComplete, setInitializationComplete] = useState(false);

  // Initialize authentication check and listener
  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error("Error al verificar autenticación:", error);
        toast.error("Ocurrió un error al verificar su sesión");
      } finally {
        // Solo actualizamos si el componente sigue montado
        if (isMounted) {
          setIsLoading(false);
          setInitializationComplete(true);
        }
      }
    };

    setIsLoading(true);
    initialize();
    
    // Set up auth state change listener
    const { data: authListener } = setupAuthListener();

    // Cleanup
    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Mostrar un indicador de carga durante la inicialización
  if (!initializationComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider');
  }
  return context;
};
