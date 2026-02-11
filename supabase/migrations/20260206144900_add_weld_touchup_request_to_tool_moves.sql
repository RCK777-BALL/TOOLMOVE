/*
  # Add Weld Touch Up Request to Tool Moves

  ## Overview
  Adds the ability to request weld touch ups when recording a tool move.
  Tool moves with required weld touch ups will appear in the Weld Touch Ups section.

  ## Changes
  
  ### Table Modifications - `tool_moves`
  - Add `requires_weld_touchup` (boolean, default false) - Indicates if a weld touch up is required for this tool move
  - Add `weld_touchup_completed` (boolean, default false) - Indicates if the weld touch up has been completed
  - Add `weld_touchup_notes` (text, nullable) - Additional notes about the weld touch up requirement

  ## Notes
  - Tool moves with `requires_weld_touchup = true` and `weld_touchup_completed = false` will be displayed in the Weld Touch Ups section
  - These items will be highlighted to show they are pending completion
  - This provides a streamlined workflow where tool moves can trigger weld touch up requests
*/

-- Add weld touch up fields to tool_moves table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tool_moves' AND column_name = 'requires_weld_touchup'
  ) THEN
    ALTER TABLE tool_moves ADD COLUMN requires_weld_touchup boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tool_moves' AND column_name = 'weld_touchup_completed'
  ) THEN
    ALTER TABLE tool_moves ADD COLUMN weld_touchup_completed boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tool_moves' AND column_name = 'weld_touchup_notes'
  ) THEN
    ALTER TABLE tool_moves ADD COLUMN weld_touchup_notes text;
  END IF;
END $$;
