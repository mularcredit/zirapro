import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://hhuimwvbersrfwfozbyf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhodWltd3ZiZXJzcmZ3Zm96YnlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ3MDYzNCwiZXhwIjoyMDY5MDQ2NjM0fQ.V8ZCkdzwv1w98-K5VaRt-4KrS54X1UFZQUI2WuEOaAY');
async function run() {
  const { data, error } = await supabase
    .from('mpesa_callbacks')
    .select('*, employees!inner("First Name", "Last Name", "Employee Number")')
    .limit(5);
  console.log("Error:", error);
  console.log("Data size:", data ? data.length : 0);
}
run();
