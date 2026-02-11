/*
  # Remove Location Fields from Tool Moves

  ## Overview
  Removes the from_location and to_location columns from the tool_moves table
  as location tracking is now handled through the department, line, and station hierarchy.

  ## Changes
  
  ### Table Modifications
  - Remove `from_location` column from tool_moves table
  - Remove `to_location` column from tool_moves table

  ## Notes
  - Location information is now tracked through the department_id, line_id, and station_id foreign keys
  - This simplifies the data model and ensures location data is consistent with the organizational hierarchy
*/

-- Remove from_location and to_location columns
ALTER TABLE tool_moves DROP COLUMN IF EXISTS from_location;
ALTER TABLE tool_moves DROP COLUMN IF EXISTS to_location;
