
import { createClient } from '@supabase/supabase-js';

// Usamos las mismas constantes que están en src/integrations/supabase/client.ts
const supabaseUrl = 'https://gwikxlahhmjypjlrrdkl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3aWt4bGFoaG1qeXBqbHJyZGtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzMTUyMTgsImV4cCI6MjA1Nzg5MTIxOH0.-b9va7NqOalKIRNH9zgH7QEdJJpOyq4aCYtSEGa8IfY';

// Optimizamos la configuración del cliente
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false // Cambiamos a false para evitar chequeos innecesarios
  }
});

export default supabase;
