/*
  # Create departments table

  1. New Tables
    - `departments`
      - `id` (uuid, primary key) - Unique identifier for each department
      - `name` (text, required) - Name of the department
      - `description` (text) - Description of the department
      - `status` (text) - Status of the department (active, inactive)
      - `created_at` (timestamptz) - Timestamp when the department was created
      - `created_by` (uuid) - User who created the department record
      - `updated_at` (timestamptz) - Timestamp when the department was last updated

  2. Security
    - Enable RLS on `departments` table
    - Add policy for authenticated users to read all departments
    - Add policy for authenticated users to insert departments
    - Add policy for authenticated users to update departments
    - Add policy for authenticated users to delete departments
*/

CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all departments"
  ON departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert departments"
  ON departments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update departments"
  ON departments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete departments"
  ON departments FOR DELETE
  TO authenticated
  USING (true);