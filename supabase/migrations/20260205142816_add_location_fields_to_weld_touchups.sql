/*
  # Add Department, Line, and Station Fields to Weld Touch Ups

  ## Overview
  Adds structured location tracking to the weld_touchups table by adding foreign key references to departments, lines, and stations.

  ## Changes
  
  ### Modified Tables
  
  #### `weld_touchups`
  - `department_id` (uuid, nullable) - Foreign key reference to departments table
  - `line_id` (uuid, nullable) - Foreign key reference to lines table
  - `station_id` (uuid, nullable) - Foreign key reference to stations table
  - `notes` (text, nullable) - Additional notes or information
  
  ## Notes
  - All new fields are nullable to maintain backward compatibility
  - Foreign key constraints ensure data integrity
  - Existing records will have null values for these fields
*/

-- Add new columns to weld_touchups table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'weld_touchups' AND column_name = 'department_id'
  ) THEN
    ALTER TABLE weld_touchups ADD COLUMN department_id uuid REFERENCES departments(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'weld_touchups' AND column_name = 'line_id'
  ) THEN
    ALTER TABLE weld_touchups ADD COLUMN line_id uuid REFERENCES lines(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'weld_touchups' AND column_name = 'station_id'
  ) THEN
    ALTER TABLE weld_touchups ADD COLUMN station_id uuid REFERENCES stations(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'weld_touchups' AND column_name = 'notes'
  ) THEN
    ALTER TABLE weld_touchups ADD COLUMN notes text;
  END IF;
END $$;
