-- Add invite_code to groups
ALTER TABLE groups ADD COLUMN IF NOT EXISTS invite_code TEXT NOT NULL DEFAULT '';
CREATE UNIQUE INDEX IF NOT EXISTS idx_groups_invite_code ON groups(invite_code) WHERE invite_code != '';

-- Group join requests (user requests to join a private group)
CREATE TABLE IF NOT EXISTS group_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(group_id, user_id)
);
