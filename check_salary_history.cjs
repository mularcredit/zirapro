const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://hhuimwvbersrfwfozbyf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhodWltd3ZiZXJzcmZ3Zm96YnlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ3MDYzNCwiZXhwIjoyMDY5MDQ2NjM0fQ.V8ZCkdzwv1w98-K5VaRt-4KrS54X1UFZQUI2WuEOaAY');

async function test() {
  console.log("Checking salary_history count...");
  const { data: historyData, error: historyErr, count: historyCount } = await supabase
    .from('salary_history')
    .select('*', { count: 'exact', head: false })
    .limit(10);
  console.log("salary_history rows:", historyData?.length, "Total Count:", historyCount);
  if (historyData && historyData.length) {
    console.log("Sample pay_periods in salary_history:", [...new Set(historyData.map(r => r.pay_period))]);
  }

  console.log("\nChecking payroll_records count...");
  const { data: prData, count: prCount } = await supabase
    .from('payroll_records')
    .select('*', { count: 'exact', head: false })
    .limit(10);
  console.log("payroll_records rows:", prData?.length, "Total Count:", prCount);
  if (prData && prData.length) {
    console.log("Sample pay_periods in payroll_records:", [...new Set(prData.map(r => r["Pay Period"]))]);
  }

  console.log("\nChecking payroll_records_current count...");
  const { data: prcData, count: prcCount } = await supabase
    .from('payroll_records_current')
    .select('*', { count: 'exact', head: false })
    .limit(10);
  console.log("payroll_records_current rows:", prcData?.length, "Total Count:", prcCount);
  if (prcData && prcData.length) {
    console.log("Sample pay_periods in payroll_records_current:", [...new Set(prcData.map(r => r["Pay Period"]))]);
  }
}
test();
