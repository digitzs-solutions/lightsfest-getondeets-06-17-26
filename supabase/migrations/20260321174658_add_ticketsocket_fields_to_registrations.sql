/*
  # Add TicketSocket Integration Fields

  1. Changes to `registrations` table
    - Add `ticketsocket_order_id` column to store the TicketSocket order ID
    - Add `order_status` column to track payment and order status
    - Add index on `ticketsocket_order_id` for faster lookups

  2. Notes
    - These fields will store the TicketSocket order information
    - `order_status` will track: pending, completed, failed, refunded
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'ticketsocket_order_id'
  ) THEN
    ALTER TABLE registrations ADD COLUMN ticketsocket_order_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'order_status'
  ) THEN
    ALTER TABLE registrations ADD COLUMN order_status text DEFAULT 'pending';
  END IF;
END $$;

-- Create index for faster order lookups
CREATE INDEX IF NOT EXISTS idx_registrations_ticketsocket_order_id 
ON registrations(ticketsocket_order_id);
