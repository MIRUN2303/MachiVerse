import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bvchyvifoeetzwwwmvgo.supabase.co',
  'sb_publishable_5SZdKjgsYdJq8ADG6uURFw_H1SO0Il8'
);

async function run() {
  for (const t of ['users', 'events', 'groups', 'friendships', 'stories', 'notifications', 'group_members', 'attendance', 'leagues', 'teams', 'matches', 'announcements']) {
    const { data, error } = await supabase.from(t).select('count', { count: 'exact', head: true });
    if (!error) {
      const { data: sample } = await supabase.from(t).select('*').limit(1);
      console.log(`✅ ${t}  (${sample?.length || 0} rows)`);
    } else {
      console.log(`❌ ${t}: ${error.message}`);
    }
  }
}
run();
