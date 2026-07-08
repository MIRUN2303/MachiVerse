-- =============================================
-- CENTRALIZED REQUESTS SYSTEM
-- Single source of truth for all user-to-user requests.
-- =============================================

CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN (
    'friend_request', 'group_invite', 'team_invite', 'event_invite',
    'tournament_invite', 'match_invite', 'group_join_request',
    'team_join_request', 'organization_invite', 'admin_invite',
    'collaboration_request'
  )),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'expired')),
  related_entity_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent duplicate pending requests
CREATE UNIQUE INDEX IF NOT EXISTS idx_requests_pending_unique
  ON requests(sender_id, recipient_id, request_type) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_requests_recipient ON requests(recipient_id, status);
CREATE INDEX IF NOT EXISTS idx_requests_sender ON requests(sender_id, status);

-- RLS
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS requests_select_own ON requests;
  CREATE POLICY requests_select_own ON requests FOR SELECT
    TO authenticated
    USING (recipient_id = auth.uid()::TEXT OR sender_id = auth.uid()::TEXT);

  DROP POLICY IF EXISTS requests_insert_own ON requests;
  CREATE POLICY requests_insert_own ON requests FOR INSERT
    TO authenticated
    WITH CHECK (sender_id = auth.uid()::TEXT);

  DROP POLICY IF EXISTS requests_update_own ON requests;
  CREATE POLICY requests_update_own ON requests FOR UPDATE
    TO authenticated
    USING (recipient_id = auth.uid()::TEXT OR sender_id = auth.uid()::TEXT)
    WITH CHECK (recipient_id = auth.uid()::TEXT OR sender_id = auth.uid()::TEXT);

  DROP POLICY IF EXISTS requests_delete_own ON requests;
  CREATE POLICY requests_delete_own ON requests FOR DELETE
    TO authenticated
    USING (sender_id = auth.uid()::TEXT);
END $$;

-- Allow anon to read/write for pre-auth flows
DROP POLICY IF EXISTS requests_anon_all ON requests;
CREATE POLICY requests_anon_all ON requests FOR ALL TO anon USING (true) WITH CHECK (true);

-- Enable realtime for requests
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE requests;
  END IF;
END $$;
