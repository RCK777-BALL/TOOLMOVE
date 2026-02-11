/*
  # Create stations table

  1. New Tables
    - `stations`
      - `id` (uuid, primary key) - Unique identifier for each station
      - `name` (text, required) - Name of the station
      - `line_id` (uuid) - Reference to line
      - `description` (text) - Description of the station
      - `status` (text) - Status of the station (active, inactive)
      - `created_at` (timestamptz) - Timestamp when the station was created
      - `created_by` (uuid) - User who created the station record
      - `updated_at` (timestamptz) - Timestamp when the station was last updated

  2. Security
    - Enable RLS on `stations` table
    - Add policy for authenticated users to read all stations
    - Add policy for authenticated users to insert stations
    - Add policy for authenticated users to update stations
    - Add policy for authenticated users to delete stations
*/

CREATE TABLE IF NOT EXISTS stations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  line_id uuid REFERENCES lines(id),
  description text DEFAULT '',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all stations"
  ON stations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert stations"
  ON stations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update stations"
  ON stations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete stations"
  ON stations FOR DELETE
  TO authenticated
  USING (true);