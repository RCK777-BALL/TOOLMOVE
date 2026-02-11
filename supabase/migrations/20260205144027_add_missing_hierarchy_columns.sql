/*
  # Add Missing Hierarchy Columns
  
  1. Schema Changes
    - Add `department_id` to `lines` table (NOT NULL, foreign key to departments)
    - Add `description`, `status`, `created_by` to `lines` table
    - Add `description`, `status`, `created_by` to `stations` table
  
  2. Important Notes
    - Lines must belong to a department
    - Stations must belong to a line (already has line_id)
    - Uses cascade delete for referential integrity
*/

-- Add missing columns to lines table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lines' AND column_name = 'department_id'
  ) THEN
    -- First add the column as nullable
    ALTER TABLE lines ADD COLUMN department_id uuid;
    
    -- Get the first department or create one if none exist
    IF NOT EXISTS (SELECT 1 FROM departments LIMIT 1) THEN
      INSERT INTO departments (name, description, status)
      VALUES ('Default Department', 'Auto-created default department', 'active');
    END IF;
    
    -- Update all existing lines to point to the first department
    UPDATE lines SET department_id = (SELECT id FROM departments LIMIT 1) WHERE department_id IS NULL;
    
    -- Now make it NOT NULL and add foreign key
    ALTER TABLE lines 
      ALTER COLUMN department_id SET NOT NULL,
      ADD CONSTRAINT lines_department_id_fkey 
        FOREIGN KEY (department_id) 
        REFERENCES departments(id) 
        ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lines' AND column_name = 'description'
  ) THEN
    ALTER TABLE lines ADD COLUMN description text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lines' AND column_name = 'status'
  ) THEN
    ALTER TABLE lines ADD COLUMN status text DEFAULT 'active';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lines' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE lines ADD COLUMN created_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Add missing columns to stations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stations' AND column_name = 'description'
  ) THEN
    ALTER TABLE stations ADD COLUMN description text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stations' AND column_name = 'status'
  ) THEN
    ALTER TABLE stations ADD COLUMN status text DEFAULT 'active';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stations' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE stations ADD COLUMN created_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Ensure line_id foreign key has ON DELETE CASCADE
DO $$
BEGIN
  ALTER TABLE stations DROP CONSTRAINT IF EXISTS stations_line_id_fkey;
  ALTER TABLE stations ADD CONSTRAINT stations_line_id_fkey 
    FOREIGN KEY (line_id) 
    REFERENCES lines(id) 
    ON DELETE CASCADE;
END $$;
