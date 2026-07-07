import { createClient } from '@supabase/supabase-js';

const SVC = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2Y2h5dmlmb2VldHp3d3dtdmdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzI0NjYyMywiZXhwIjoyMDk4ODIyNjIzfQ.1R7NjIR_ECEVvl8eS_xQp4YaRwcwA3GLom3Py2ZERT0';
const URL = 'https://bvchyvifoeetzwwwmvgo.supabase.co';

const svc = createClient(URL, SVC);

// Try using the pg_dump or pg SQL functions
// First check what RPC functions are available
const { data: funcs, error: fErr } = await svc.rpc('extensions_summary').catch(() => ({}));
console.log('extensions:', fErr?.message || 'exists');

// Try the database webhook / function approach
// Actually, let's try to create the function and trigger via the REST API sql endpoint
// Supabase projects have a pg_dump function
const { data: pgResult, error: pgErr } = await svc.rpc('pg_dump', {
  tablename: 'users'
}).catch(e => ({ error: e.message }));
console.log('pg_dump:', pgErr || 'success');

// Try raw SQL via the rest endpoint with PostgREST
const res = await fetch(`${URL}/rest/v1/rpc/`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SVC,
    'Authorization': 'Bearer ' + SVC,
  },
  body: JSON.stringify({})
});
console.log('RPC root:', res.status);

// Try to use pg_ function directly
const res2 = await fetch(`${URL}/rest/v1/`, {
  headers: {
    'apikey': SVC,
    'Authorization': 'Bearer ' + SVC,
  }
});
const text = await res2.text();
console.log('API root (first 500):', text.slice(0, 500));
