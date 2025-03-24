
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { UserPlus, LogIn } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Simplificamos el useEffect para evitar posibles problemas
  useEffect(() => {
    // Solo redirigimos si está autenticado y no está cargando
    if (isAuthenticated && !authLoading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      await login(email, password, isRegister);
    } catch (error) {
      console.error('Login failed', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Mientras se carga la autenticación, mostramos un estado de carga
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Si ya está autenticado, no mostramos nada mientras se redirige
  if (isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md overflow-hidden glass-card animate-slide-up">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-light tracking-tight">Control de Asistencia y Calificaciones</CardTitle>
          <CardDescription>
            {isRegister ? 'Cree su cuenta para acceder al sistema' : 'Inicie sesión para acceder al sistema'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="profesor@escuela.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? 
                (isRegister ? "Creando usuario..." : "Iniciando sesión...") : 
                (isRegister ? 
                  <span className="flex items-center gap-2"><UserPlus size={18} /> Crear cuenta</span> : 
                  <span className="flex items-center gap-2"><LogIn size={18} /> Iniciar sesión</span>
                )
              }
            </Button>
            
            <div className="text-center">
              <button 
                type="button" 
                className="text-primary hover:underline text-sm"
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? "¿Ya tiene una cuenta? Inicie sesión" : "¿No tiene cuenta? Crear una nueva"}
              </button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-xs text-center text-muted-foreground px-8">
            Para propósitos de demostración, puede usar cualquier correo y contraseña (mínimo 6 caracteres)
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
