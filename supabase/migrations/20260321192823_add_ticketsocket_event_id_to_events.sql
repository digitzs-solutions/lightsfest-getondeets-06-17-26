/*
  # Add TicketSocket Event ID to Events Table

  1. Changes
    - Add `ticketsocket_event_id` column to `events` table
    - This column maps our internal event IDs to TicketSocket event IDs
    - Uses TEXT type to handle various ID formats (numeric or alphanumeric)
  
  2. Notes
    - Nullable field since not all events may be linked to TicketSocket
    - Allows flexibility for events that don't require ticket processing
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'ticketsocket_event_id'
  ) THEN
    ALTER TABLE events ADD COLUMN ticketsocket_event_id TEXT;
  END IF;
END $$;