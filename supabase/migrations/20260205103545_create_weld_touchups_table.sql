/*
  # Create Weld Touch Ups Table

  ## Overview
  Creates the weld touch ups tracking table for managing weld touch up records in a manufacturing environment.

  ## New Tables
  
  ### `weld_touchups`
  - `id` (uuid, primary key) - Unique identifier for each weld touch up record
  - `part_number` (text) - Part number or identifier being touched up
  - `location` (text) - Location where the touch up occurred
  - `weld_type` (text) - Type of weld (e.g., "MIG", "TIG", "Spot")
  - `reason` (text) - Reason for the touch up
  - `completed_by` (text) - Name or ID of person who completed the touch up
  - `status` (text) - Current status: 'pending', 'in_progress', or 'completed'
  - `user_id` (uuid) - Reference to the user who created the record
  - `created_at` (timestamptz) - Timestamp when the record was created
  - `updated_at` (timestamptz) - Timestamp of last update

  ## Security
  
  ### Row Level Security (RLS)
  - RLS is enabled on the `weld_touchups` table
  - Authenticated users can view all weld touch up records
  - Authenticated users can insert new weld touch up records
  - Authenticated users can update any weld touch up record
  - Authenticated users can delete any weld touch up record
  
  ## Notes
  - All timestamps use timezone-aware timestamptz type
  - Status field is constrained to three valid values
  - Updated_at automatically updates on row modification via trigger
*/

-- Create weld_touchups table
CREATE TABLE IF NOT EXISTS weld_touchups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  part_number text NOT NULL,
  location text NOT NULL,
  weld_type text NOT NULL,
  reason text NOT NULL,
  completed_by text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')),
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE weld_touchups ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view all weld touchups"
  ON weld_touchups
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert weld touchups"
  ON weld_touchups
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update weld touchups"
  ON weld_touchups
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete weld touchups"
  ON weld_touchups
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for updated_at (reuse the function created for tools table)
CREATE TRIGGER update_weld_touchups_updated_at
  BEFORE UPDATE ON weld_touchups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
