const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function list() {
  try {
    const { data, error } = await supabase.from('employees').select('count', { count: 'exact', head: true });
    if (error) console.log("Employees Error:", error.message);
    else console.log("Employees exists");

    const { data: d2, error: e2 } = await supabase.from('mpesa_callbacks').select('count', { count: 'exact', head: true });
    if (e2) console.log("MpesaCallbacks Error:", e2.message);
    else console.log("MpesaCallbacks exists");

    // Try a direct SQL-ish check if possible via RPC or just common tables
    const tables = ['employees', 'mpesa_callbacks', 'salary_advance', 'salary_advance_settings'];
    for (const t of tables) {
      const { error } = await supabase.from(t).select('*', { count: 'exact', head: true });
      console.log(\`Table \${t}: \${error ? 'ERROR: ' + error.message : 'OK'}\`);
    }
  } catch (err) {
    console.log("CRASH:", err.message);
  }
}
list();
