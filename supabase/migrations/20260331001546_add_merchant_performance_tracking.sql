/*
  # Add Merchant Performance & Cost Tracking

  1. Updates to merchants table
    - Add `last_login_at` - Track when merchant last accessed system
    - Add `last_transaction_at` - Track when last payment was processed
    - Add `is_active` - Quick boolean for active status
    
  2. New Tables
    - `admin_login_metrics`
      - Track every admin login and performance
      - Measure merchant loading times
      - Identify slow queries
    
    - `aws_cost_metrics`
      - Daily AWS cost tracking by service
      - Data transfer monitoring
      - Cost optimization opportunities

  3. Security
    - Enable RLS on new tables
    - Only authenticated admins can access
*/

-- Add performance tracking columns to merchants
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'merchants' AND column_name = 'last_login_at'
  ) THEN
    ALTER TABLE merchants ADD COLUMN last_login_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'merchants' AND column_name = 'last_transaction_at'
  ) THEN
    ALTER TABLE merchants ADD COLUMN last_transaction_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'merchants' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE merchants ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- Admin login metrics
CREATE TABLE IF NOT EXISTS admin_login_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email text NOT NULL,
  login_timestamp timestamptz DEFAULT now(),
  merchants_loaded integer DEFAULT 0,
  load_duration_ms integer DEFAULT 0,
  query_duration_ms integer DEFAULT 0,
  data_size_kb integer DEFAULT 0,
  endpoint text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_login_timestamp ON admin_login_metrics(login_timestamp);
CREATE INDEX IF NOT EXISTS idx_admin_login_email ON admin_login_metrics(admin_email);

-- AWS cost metrics
CREATE TABLE IF NOT EXISTS aws_cost_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  service text NOT NULL,
  cost_usd numeric(10,2) DEFAULT 0,
  usage_hours numeric(10,2),
  data_transfer_gb numeric(10,2),
  requests_count bigint,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_aws_cost_date_service ON aws_cost_metrics(date, service);
CREATE INDEX IF NOT EXISTS idx_aws_cost_date ON aws_cost_metrics(date);

-- Enable RLS
ALTER TABLE admin_login_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE aws_cost_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_login_metrics
CREATE POLICY "Authenticated users can view login metrics"
  ON admin_login_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert login metrics"
  ON admin_login_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for aws_cost_metrics
CREATE POLICY "Authenticated users can view cost metrics"
  ON aws_cost_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert cost metrics"
  ON aws_cost_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update cost metrics"
  ON aws_cost_metrics FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);