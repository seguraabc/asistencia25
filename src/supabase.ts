// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Tipos generados (opcional pero recomendado)
// Para generarlos: npx supabase gen types typescript > src/types/database.ts
import type { Database } from '@/types/database';

// Configuración segura con variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validación en tiempo de ejecución (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      'Supabase credentials are missing. Please check your .env.local file'
    );
  }
}

// Creación del cliente con tipos
const supabase = createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  },
  // Opciones adicionales recomendadas:
  realtime: {
    heartbeatIntervalMs: 10000
  }
});

export default supabase;
