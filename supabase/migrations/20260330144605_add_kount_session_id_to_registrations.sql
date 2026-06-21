/*
  # Add Kount 360 Session ID to Registrations

  ## Changes
  - Adds `kount_session_id` column to `registrations` table to store Kount fraud prevention session IDs
  
  ## Purpose
  This enables real-time fraud prevention through TokenEx's Kount 360 integration.
  The Kount session ID is returned by TokenEx during tokenization and should be stored
  for fraud tracking and analysis purposes.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'kount_session_id'
  ) THEN
    ALTER TABLE registrations ADD COLUMN kount_session_id text;
    COMMENT ON COLUMN registrations.kount_session_id IS 'Kount 360 session ID for fraud prevention tracking';
  END IF;
END $$;
