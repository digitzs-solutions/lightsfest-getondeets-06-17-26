/*
  # Add Payment Token Field

  1. Changes to `registrations` table
    - Add `payment_token` (text, nullable) - TokenEx payment token for processing
    
  2. Security
    - Existing RLS policies remain unchanged
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'payment_token'
  ) THEN
    ALTER TABLE registrations ADD COLUMN payment_token text;
  END IF;
END $$;