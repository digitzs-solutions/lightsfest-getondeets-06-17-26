/*
  # Add ProPay Transaction ID to Registrations

  1. Changes
    - Add `propay_transaction_id` column to `registrations` table
      - Stores the ProPay transaction ID for payment tracking
      - Used for refunds, disputes, and reconciliation

  2. Notes
    - This column is separate from `payment_token` which stores the TokenEx token
    - ProPay transaction ID is returned after successful payment processing
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'propay_transaction_id'
  ) THEN
    ALTER TABLE registrations ADD COLUMN propay_transaction_id text;
  END IF;
END $$;
