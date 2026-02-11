/*
  # Rename Tools to Reasons and Restructure Data Model

  ## Overview
  Transforms the tools tracking system into a reasons-based system for tracking tool move reasons.
  The "tools" table becomes "reasons" with predefined values for why tools are moved.

  ## Changes
  
  ### 1. Table Renaming and Restructuring
  - Rename `tools` table to `reasons`
  - Simplify schema to focus on reason tracking:
    - `id` (uuid, primary key) - Unique identifier
    - `name` (text) - Name of the reason (e.g., "gap", "part", "fitup")
    - `description` (text, nullable) - Optional description
    - `status` (text) - Status: 'active' or 'inactive'
    - `created_at` (timestamptz) - Creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp
  
  ### 2. Update tool_moves Table
  - Rename `tool_id` column to `reason_id`
  - Update foreign key constraint to reference reasons table
  
  ### 3. Seed Predefined Reasons
  - gap
  - part
  - fitup
  - Measurement
  - WCR

  ## Security
  - RLS policies are preserved and updated for the reasons table
  - All existing policies remain in effect
  
  ## Notes
  - All existing data in the tools table will be cleared
  - Triggers and functions are preserved
  - Tool moves referencing old tool_id will be cleared
*/

-- Drop existing tool_moves records (they reference old tools)
TRUNCATE TABLE tool_moves CASCADE;

-- Drop existing tools records
TRUNCATE TABLE tools CASCADE;

-- Rename tools table to reasons
ALTER TABLE tools RENAME TO reasons;

-- Drop old columns that don't apply to reasons
ALTER TABLE reasons DROP COLUMN IF EXISTS category;
ALTER TABLE reasons DROP COLUMN IF EXISTS location;
ALTER TABLE reasons DROP COLUMN IF EXISTS user_id;

-- Add description column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reasons' AND column_name = 'description'
  ) THEN
    ALTER TABLE reasons ADD COLUMN description text;
  END IF;
END $$;

-- Update status constraint to only allow active/inactive
ALTER TABLE reasons DROP CONSTRAINT IF EXISTS tools_status_check;
ALTER TABLE reasons ADD CONSTRAINT reasons_status_check CHECK (status IN ('active', 'inactive'));

-- Update trigger name
DROP TRIGGER IF EXISTS update_tools_updated_at ON reasons;
CREATE TRIGGER update_reasons_updated_at
  BEFORE UPDATE ON reasons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update RLS policies
DROP POLICY IF EXISTS "Authenticated users can view all tools" ON reasons;
DROP POLICY IF EXISTS "Authenticated users can insert tools" ON reasons;
DROP POLICY IF EXISTS "Authenticated users can update tools" ON reasons;
DROP POLICY IF EXISTS "Authenticated users can delete tools" ON reasons;

CREATE POLICY "Authenticated users can view all reasons"
  ON reasons
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert reasons"
  ON reasons
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update reasons"
  ON reasons
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete reasons"
  ON reasons
  FOR DELETE
  TO authenticated
  USING (true);

-- Update tool_moves table to reference reasons
ALTER TABLE tool_moves RENAME COLUMN tool_id TO reason_id;

-- Drop old foreign key constraint and add new one
ALTER TABLE tool_moves DROP CONSTRAINT IF EXISTS tool_moves_tool_id_fkey;
ALTER TABLE tool_moves ADD CONSTRAINT tool_moves_reason_id_fkey 
  FOREIGN KEY (reason_id) REFERENCES reasons(id) ON DELETE CASCADE;

-- Insert predefined reasons
INSERT INTO reasons (name, description, status) VALUES
  ('gap', 'Tool moved for gap-related work', 'active'),
  ('part', 'Tool moved for part-related work', 'active'),
  ('fitup', 'Tool moved for fitup operations', 'active'),
  ('Measurement', 'Tool moved for measurement tasks', 'active'),
  ('WCR', 'Tool moved for WCR (Weld Control Record) work', 'active')
ON CONFLICT DO NOTHING;
