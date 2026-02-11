/*
  # Create Tool Moves Table

  ## Overview
  Creates the tool moves tracking table for managing tool movement records in a manufacturing environment.

  ## New Tables
  
  ### `tool_moves`
  - `id` (uuid, primary key) - Unique identifier for each tool move record
  - `tool_id` (uuid) - Foreign key reference to tools table
  - `from_location` (text) - Previous location of the tool
  - `to_location` (text) - New location of the tool
  - `department_id` (uuid, nullable) - Foreign key reference to departments table
  - `line_id` (uuid, nullable) - Foreign key reference to lines table
  - `station_id` (uuid, nullable) - Foreign key reference to stations table
  - `notes` (text, nullable) - Additional notes about the move
  - `moved_by` (text) - Name or ID of person who moved the tool
  - `user_id` (uuid) - Reference to the user who created the record
  - `created_at` (timestamptz) - Timestamp when the record was created
  - `updated_at` (timestamptz) - Timestamp of last update

  ## Security
  
  ### Row Level Security (RLS)
  - RLS is enabled on the `tool_moves` table
  - Authenticated users can view all tool move records
  - Authenticated users can insert new tool move records
  - Authenticated users can update any tool move record
  - Authenticated users can delete any tool move record
  
  ## Notes
  - All timestamps use timezone-aware timestamptz type
  - Updated_at automatically updates on row modification via trigger
  - Foreign keys ensure data integrity with related tables
*/

-- Create tool_moves table
CREATE TABLE IF NOT EXISTS tool_moves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE,
  from_location text NOT NULL,
  to_location text NOT NULL,
  department_id uuid REFERENCES departments(id),
  line_id uuid REFERENCES lines(id),
  station_id uuid REFERENCES stations(id),
  notes text,
  moved_by text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tool_moves ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view all tool moves"
  ON tool_moves
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert tool moves"
  ON tool_moves
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tool moves"
  ON tool_moves
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tool moves"
  ON tool_moves
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_tool_moves_updated_at
  BEFORE UPDATE ON tool_moves
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
