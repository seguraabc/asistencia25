
import { createClient } from '@supabase/supabase-js';

// Usamos las mismas constantes que están en src/integrations/supabase/client.ts
const supabaseUrl = 'https://rjaezvlosvfccrkbtmfo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqYWV6dmxvc3ZmY2Nya2J0bWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NTAxNTgsImV4cCI6MjA1ODQyNjE1OH0.SY8pCT5l7hV9-eBNB3gUeZpEzz8AfnPSgrtg5LqhNCg';

// Optimizamos la configuración del cliente
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false // Cambiamos a false para evitar chequeos innecesarios
  }
});

export default supabase;
