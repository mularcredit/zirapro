const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Error: Env vars missing");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  try {
    // Try to catch all tables by querying a non-existent table to see the error message which sometimes lists valid ones
    // Or just try common names
    const names = ['mpesa_callbacks', 'mpesa_results', 'mpesa_logs', 'mpesa_transactions'];
    for (const name of names) {
      const { data, error } = await supabase.from(name).select('*').limit(1);
      if (error) {
        console.log(\`Table \${name}: ERROR - \${error.message} (\${error.code})\`);
      } else {
        console.log(\`Table \${name}: OK\`);
      }
    }
  } catch (err) {
    console.log("Crash:", err.message);
  }
}
check();
