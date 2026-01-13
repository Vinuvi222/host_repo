// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gkhlvznapvvhmksqight.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdraGx2em5hcHZ2aG1rc3FpZ2h0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkyOTE1MCwiZXhwIjoyMDgzNTA1MTUwfQ.gYkedeBEn2wukeyCCXG1hpml6Tqbgha4dNDIB0heMZQ'; // server-side only
export const supabase = createClient(supabaseUrl, supabaseKey);
