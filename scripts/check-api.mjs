import { createClient } from '@supabase/supabase-js';

const sup = createClient(
  'https://bvchyvifoeetzwwwmvgo.supabase.co',
  'sb_publishable_5SZdKjgsYdJq8ADG6uURFw_H1SO0Il8'
);

async function main() {
  // Try HEAD request
  const r2 = await sup.from('users').select('*', { head: true, count: 'exact' });
  console.log('head users:', r2.status, r2.statusText, r2.error?.message || 'ok');

  // Try raw fetch
  const url = 'https://bvchyvifoeetzwwwmvgo.supabase.co/rest/v1/users?limit=1';
  const resp = await fetch(url, {
    headers: {
      'apikey': 'sb_publishable_5SZdKjgsYdJq8ADG6uURFw_H1SO0Il8',
      'Authorization': 'Bearer sb_publishable_5SZdKjgsYdJq8ADG6uURFw_H1SO0Il8',
      'Accept': 'application/json',
      'Prefer': 'count=exact'
    }
  });
  const txt = await resp.text();
  console.log('fetch users:', resp.status, resp.statusText);
  console.log('body:', txt.substring(0, 300));
}
main();
