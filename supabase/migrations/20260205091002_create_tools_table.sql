/*
  # Create Tools Table

  ## Overview
  Creates the main tools tracking table for managing tool inventory in a manufacturing environment.

  ## New Tables
  
  ### `tools`
  - `id` (uuid, primary key) - Unique identifier for each tool
  - `name` (text) - Name of the tool (e.g., "Wrench", "Drill")
  - `category` (text) - Category classification (e.g., "Hand Tools", "Power Tools")
  - `location` (text) - Current physical location of the tool
  - `status` (text) - Current status: 'available', 'in_use', or 'maintenance'
  - `user_id` (uuid) - Reference to the user who created/owns the record
  - `created_at` (timestamptz) - Timestamp when the tool was added to the system
  - `updated_at` (timestamptz) - Timestamp of last update

  ## Security
  
  ### Row Level Security (RLS)
  - RLS is enabled on the `tools` table
  - Authenticated users can view all tools
  - Authenticated users can insert new tools
  - Authenticated users can update any tool
  - Authenticated users can delete any tool
  
  ## Notes
  - All timestamps use timezone-aware timestamptz type
  - Status field is constrained to three valid values
  - Updated_at automatically updates on row modification via trigger
*/

-- Create tools table
CREATE TABLE IF NOT EXISTS tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  location text NOT NULL,
  status text NOT NULL CHECK (status IN ('available', 'in_use', 'maintenance')),
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view all tools"
  ON tools
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert tools"
  ON tools
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tools"
  ON tools
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tools"
  ON tools
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_tools_updated_at
  BEFORE UPDATE ON tools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
