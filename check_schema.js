const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  try {
    const { data, error } = await supabase.from('employees').select('*').limit(1);
    if (error) {
      console.log("Employees Error:", error.message);
    } else if (data && data.length > 0) {
      console.log("Employees columns:", Object.keys(data[0]));
    } else {
      console.log("Employees is empty");
    }

    const { data: d2, error: e2 } = await supabase.from('mpesa_callbacks').select('*').limit(1);
    if (e2) {
      console.log("MpesaCallbacks Error:", e2.message);
    } else if (d2 && d2.length > 0) {
      console.log("MpesaCallbacks columns:", Object.keys(d2[0]));
    } else {
      console.log("MpesaCallbacks is empty");
    }
  } catch (err) {
    console.log("CRASH:", err.message);
  }
}
check();
