/*
  # Make weld_touchups location column nullable
  
  ## Overview
  Makes the location column in weld_touchups table nullable to support use cases where location is tracked through department/line/station hierarchy instead.
  
  ## Changes
  
  ### Modified Tables
  
  #### `weld_touchups`
  - `location` column is now nullable
  
  ## Notes
  - This change maintains data safety by keeping existing location data
  - The column is not dropped to preserve any existing location information
  - Users can now optionally use the department/line/station hierarchy for location tracking
*/

-- Make location column nullable
DO $$
BEGIN
  ALTER TABLE weld_touchups ALTER COLUMN location DROP NOT NULL;
END $$;
