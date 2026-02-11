/*
  # Create lines table

  1. New Tables
    - `lines`
      - `id` (uuid, primary key) - Unique identifier for each line
      - `name` (text, required) - Name of the line
      - `department_id` (uuid) - Reference to department
      - `description` (text) - Description of the line
      - `status` (text) - Status of the line (active, inactive)
      - `created_at` (timestamptz) - Timestamp when the line was created
      - `created_by` (uuid) - User who created the line record
      - `updated_at` (timestamptz) - Timestamp when the line was last updated

  2. Security
    - Enable RLS on `lines` table
    - Add policy for authenticated users to read all lines
    - Add policy for authenticated users to insert lines
    - Add policy for authenticated users to update lines
    - Add policy for authenticated users to delete lines
*/

CREATE TABLE IF NOT EXISTS lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  department_id uuid REFERENCES departments(id),
  description text DEFAULT '',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all lines"
  ON lines FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert lines"
  ON lines FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update lines"
  ON lines FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete lines"
  ON lines FOR DELETE
  TO authenticated
  USING (true);