const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://hhuimwvbersrfwfozbyf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhodWltd3ZiZXJzcmZ3Zm96YnlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ3MDYzNCwiZXhwIjoyMDY5MDQ2NjM0fQ.V8ZCkdzwv1w98-K5VaRt-4KrS54X1UFZQUI2WuEOaAY');

async function test() {
  const { data, error } = await supabase.from('employees').select('*').limit(1);
  console.log('Error:', error);
  if (data && data.length) {
    console.log('Columns:', Object.keys(data[0]).filter(k => k.includes('ermin') || k.includes('nterview')));
  }
}
test();
