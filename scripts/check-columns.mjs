import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bvchyvifoeetzwwwmvgo.supabase.co',
  'sb_publishable_5SZdKjgsYdJq8ADG6uURFw_H1SO0Il8'
);

async function run() {
  const tables = ['users', 'groups', 'group_members', 'events', 'attendance', 'leagues', 'teams', 'matches', 'announcements', 'friendships', 'stories', 'notifications'];
  
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(0);
    if (error) {
      console.log(`\n❌ ${t}: ${error.message}`);
      continue;
    }
    // Get column names from the response (empty data but structure is known)
    // PostgREST doesn't expose columns directly, but we can infer from headers
    console.log(`\n✅ ${t}:`);
  }

  // Try information_schema via REST
  const { data: cols } = await supabase
    .from('information_schema.columns')
    .select('table_name, column_name, data_type, is_nullable')
    .in('table_name', tables);
  console.log('\nColumns from information_schema:', cols?.length || 0);
  if (cols) {
    const grouped = {};
    for (const c of cols) {
      if (!grouped[c.table_name]) grouped[c.table_name] = [];
      grouped[c.table_name].push(`${c.column_name} (${c.data_type})`);
    }
    for (const [table, columns] of Object.entries(grouped)) {
      console.log(`\n${table}:`);
      columns.forEach(c => console.log(`  - ${c}`));
    }
  }
}
run();
