const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("ERROR: Env vars missing");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  try {
    const { data, error } = await supabase.from('mpesa_callbacks').select('employee_id').limit(1);
    if (error) {
      console.log("ERROR:", error.message);
    } else {
      console.log("SUCCESS: employee_id exists");
    }
  } catch (err) {
    console.log("CRASH:", err.message);
  }
}
check();
