/*
  # Add Lights Festival Fields

  1. Changes to `events` table
    - Add `price` (numeric) - Ticket price
    - Add `badge` (text, nullable) - Badge text like "SELLING FAST", "NEW", etc.
    - Add `featured` (boolean) - Whether event should appear on landing page
    
  2. Security
    - Existing RLS policies remain unchanged
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'price'
  ) THEN
    ALTER TABLE events ADD COLUMN price numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'badge'
  ) THEN
    ALTER TABLE events ADD COLUMN badge text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'featured'
  ) THEN
    ALTER TABLE events ADD COLUMN featured boolean DEFAULT false;
  END IF;
END $$;