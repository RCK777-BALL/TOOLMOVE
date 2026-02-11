/*
  # Enable Realtime for Weld Touch Up Notifications

  1. Changes
    - Enable realtime replication for `tool_moves` table
    - Enable realtime replication for `weld_touchups` table
    - This allows real-time notifications when new weld touch up requests are created

  2. Security
    - No changes to RLS policies
    - Realtime subscriptions respect existing RLS policies
*/

ALTER PUBLICATION supabase_realtime ADD TABLE tool_moves;
ALTER PUBLICATION supabase_realtime ADD TABLE weld_touchups;
