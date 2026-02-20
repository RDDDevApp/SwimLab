-- Migration 006: Multi-groupes & Modification Feedback
-- Sprint 9: Allow swimmers in multiple groups + editable feedback within 24h

-- 1. Remove UNIQUE constraint on group_members (user_id, group_id) if it exists
-- This allows a swimmer to be in multiple groups
DROP INDEX IF EXISTS group_members_user_id_group_id_key;
ALTER TABLE group_members DROP CONSTRAINT IF EXISTS group_members_user_id_group_id_key;

-- Add a unique constraint on (group_id, user_id) to prevent duplicate membership in SAME group
-- but allow membership in DIFFERENT groups
CREATE UNIQUE INDEX IF NOT EXISTS idx_group_members_unique
  ON group_members(group_id, user_id);

-- 2. Add push_tokens table for notifications (Sprint 10)
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, token)
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_tokens(user_id);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY push_tokens_user_all ON push_tokens
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3. Add notification preferences to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_feedback BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_reminder BOOLEAN DEFAULT true;
