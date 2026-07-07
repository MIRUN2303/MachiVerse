import { createClient } from '@supabase/supabase-js';

const SVC = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2Y2h5dmlmb2VldHp3d3dtdmdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzI0NjYyMywiZXhwIjoyMDk4ODIyNjIzfQ.1R7NjIR_ECEVvl8eS_xQp4YaRwcwA3GLom3Py2ZERT0';
const URL = 'https://bvchyvifoeetzwwwmvgo.supabase.co';

const svc = createClient(URL, SVC);

// Check pg policies for the users table
const { data: policies, error } = await svc.from('users').select('*').limit(0);
console.log('Can SELECT with service_role:', !error, error?.message || '');

// Try to insert with service_role
const testId = 'test-' + Date.now();
const { error: insErr } = await svc.from('users').insert({
  id: testId,
  name: 'Test',
  email: 'test-' + Date.now() + '@test.com',
  password: '',
  profile_code: 'TEST001',
}).select().single();
console.log('Can INSERT with service_role:', !insErr, insErr?.message || '');

// Cleanup test
if (!insErr) await svc.from('users').delete().eq('id', testId).maybeSingle();
