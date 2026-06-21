/*
  # Compliance Tracking Database Schema

  ## Overview
  Creates a comprehensive compliance tracking system for PCI DSS, SOC 2, and other frameworks.
  Integrates with Scrut.io as a local extension for real-time dashboards and custom metrics.

  ## Tables Created

  ### 1. compliance_frameworks
  Stores supported compliance frameworks (PCI DSS, SOC 2, ISO 27001, etc.)
  - `id` (uuid, primary key)
  - `name` (text) - Framework name
  - `version` (text) - Framework version
  - `description` (text)
  - `active` (boolean) - Whether actively monitored
  - `created_at`, `updated_at` (timestamptz)

  ### 2. compliance_controls
  Individual compliance controls/requirements from each framework
  - `id` (uuid, primary key)
  - `framework_id` (uuid, foreign key)
  - `control_id` (text) - e.g., "1.2.1" for PCI DSS
  - `title` (text)
  - `description` (text)
  - `category` (text) - Network Security, Data Protection, etc.
  - `priority` (text) - Critical, High, Medium, Low
  - `status` (text) - Implemented, Partial, Not Implemented, N/A
  - `implementation_percentage` (int)
  - `last_tested_at` (timestamptz)
  - `next_test_due` (timestamptz)
  - `owner` (text) - Team/person responsible
  - `created_at`, `updated_at` (timestamptz)

  ### 3. control_evidence
  Links evidence artifacts to specific controls
  - `id` (uuid, primary key)
  - `control_id` (uuid, foreign key)
  - `evidence_type` (text) - Screenshot, Log File, Policy Document, etc.
  - `evidence_source` (text) - AWS, GitHub, TokenEx, Manual, etc.
  - `evidence_url` (text) - S3 URL or external link
  - `description` (text)
  - `collected_at` (timestamptz)
  - `collected_by` (text)
  - `auto_collected` (boolean)
  - `valid_until` (timestamptz)
  - `created_at`, `updated_at` (timestamptz)

  ### 4. risk_register
  Active risks and their treatment plans
  - `id` (uuid, primary key)
  - `risk_id` (text) - e.g., "R-001"
  - `title` (text)
  - `description` (text)
  - `likelihood` (text) - Low, Medium, High
  - `impact` (text) - Low, Medium, High, Critical
  - `risk_score` (decimal)
  - `status` (text) - Open, In Progress, Mitigated, Accepted, Closed
  - `treatment_strategy` (text) - Mitigate, Accept, Transfer, Avoid
  - `treatment_plan` (text)
  - `owner` (text)
  - `identified_date` (date)
  - `target_closure_date` (date)
  - `actual_closure_date` (date)
  - `related_controls` (text[]) - Array of control IDs
  - `created_at`, `updated_at` (timestamptz)

  ### 5. audit_findings
  Issues identified during audits
  - `id` (uuid, primary key)
  - `audit_date` (date)
  - `auditor` (text)
  - `finding_id` (text)
  - `control_id` (uuid, foreign key)
  - `severity` (text) - Critical, High, Medium, Low, Info
  - `title` (text)
  - `description` (text)
  - `recommendation` (text)
  - `status` (text) - Open, In Remediation, Resolved, Risk Accepted
  - `remediation_plan` (text)
  - `due_date` (date)
  - `resolved_date` (date)
  - `created_at`, `updated_at` (timestamptz)

  ### 6. remediation_tasks
  Action items for closing gaps and findings
  - `id` (uuid, primary key)
  - `finding_id` (uuid, foreign key to audit_findings, nullable)
  - `risk_id` (uuid, foreign key to risk_register, nullable)
  - `control_id` (uuid, foreign key to compliance_controls, nullable)
  - `title` (text)
  - `description` (text)
  - `priority` (text) - P0, P1, P2, P3
  - `status` (text) - Not Started, In Progress, Blocked, Completed
  - `assigned_to` (text)
  - `due_date` (date)
  - `completed_date` (date)
  - `estimated_hours` (int)
  - `actual_hours` (int)
  - `blockers` (text)
  - `created_at`, `updated_at` (timestamptz)

  ### 7. vendors
  Third-party service providers
  - `id` (uuid, primary key)
  - `name` (text)
  - `service_type` (text)
  - `website` (text)
  - `pci_relevance` (text) - Critical, High, Medium, Low, None
  - `data_access_level` (text)
  - `assessment_status` (text) - Complete, In Progress, Pending, Overdue
  - `aoc_on_file` (boolean)
  - `aoc_expiry_date` (date)
  - `soc2_on_file` (boolean)
  - `soc2_expiry_date` (date)
  - `last_assessment_date` (date)
  - `next_assessment_due` (date)
  - `contact_name` (text)
  - `contact_email` (text)
  - `notes` (text)
  - `created_at`, `updated_at` (timestamptz)

  ### 8. training_records
  Employee security awareness training
  - `id` (uuid, primary key)
  - `employee_email` (text)
  - `employee_name` (text)
  - `training_module` (text)
  - `required_for_role` (text)
  - `frequency` (text) - Annual, Semi-annual, Quarterly
  - `completion_date` (date)
  - `expiry_date` (date)
  - `score` (int)
  - `passed` (boolean)
  - `certificate_url` (text)
  - `created_at`, `updated_at` (timestamptz)

  ### 9. policy_acknowledgments
  Employee policy sign-offs
  - `id` (uuid, primary key)
  - `policy_name` (text)
  - `policy_version` (text)
  - `employee_email` (text)
  - `employee_name` (text)
  - `acknowledged_at` (timestamptz)
  - `ip_address` (text)
  - `signature_data` (text)
  - `created_at`, `updated_at` (timestamptz)

  ### 10. compliance_scores
  Historical compliance score tracking
  - `id` (uuid, primary key)
  - `framework_id` (uuid, foreign key)
  - `date` (date)
  - `overall_score` (decimal)
  - `implemented_count` (int)
  - `partial_count` (int)
  - `not_implemented_count` (int)
  - `total_controls` (int)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Authenticated users can read all compliance data
  - Only compliance team (via app logic) can update
  - Audit trails via created_at/updated_at timestamps

  ## Indexes
  - Control lookups by framework and status
  - Evidence by control and collection date
  - Risks by status and score
  - Tasks by status and due date
  - Vendor assessments by due date
*/

-- Create compliance_frameworks table
CREATE TABLE IF NOT EXISTS compliance_frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  version text NOT NULL,
  description text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create compliance_controls table
CREATE TABLE IF NOT EXISTS compliance_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id uuid REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
  control_id text NOT NULL,
  title text NOT NULL,
  description text,
  category text,
  priority text DEFAULT 'Medium',
  status text DEFAULT 'Not Implemented',
  implementation_percentage int DEFAULT 0,
  last_tested_at timestamptz,
  next_test_due timestamptz,
  owner text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(framework_id, control_id)
);

-- Create control_evidence table
CREATE TABLE IF NOT EXISTS control_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id uuid REFERENCES compliance_controls(id) ON DELETE CASCADE,
  evidence_type text NOT NULL,
  evidence_source text NOT NULL,
  evidence_url text,
  description text,
  collected_at timestamptz DEFAULT now(),
  collected_by text,
  auto_collected boolean DEFAULT false,
  valid_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create risk_register table
CREATE TABLE IF NOT EXISTS risk_register (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  likelihood text,
  impact text,
  risk_score decimal(3,1),
  status text DEFAULT 'Open',
  treatment_strategy text,
  treatment_plan text,
  owner text,
  identified_date date DEFAULT CURRENT_DATE,
  target_closure_date date,
  actual_closure_date date,
  related_controls text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create audit_findings table
CREATE TABLE IF NOT EXISTS audit_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_date date NOT NULL,
  auditor text NOT NULL,
  finding_id text NOT NULL,
  control_id uuid REFERENCES compliance_controls(id) ON DELETE SET NULL,
  severity text NOT NULL,
  title text NOT NULL,
  description text,
  recommendation text,
  status text DEFAULT 'Open',
  remediation_plan text,
  due_date date,
  resolved_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create remediation_tasks table
CREATE TABLE IF NOT EXISTS remediation_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id uuid REFERENCES audit_findings(id) ON DELETE SET NULL,
  risk_id uuid REFERENCES risk_register(id) ON DELETE SET NULL,
  control_id uuid REFERENCES compliance_controls(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  priority text DEFAULT 'P2',
  status text DEFAULT 'Not Started',
  assigned_to text,
  due_date date,
  completed_date date,
  estimated_hours int,
  actual_hours int,
  blockers text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  service_type text,
  website text,
  pci_relevance text,
  data_access_level text,
  assessment_status text DEFAULT 'Pending',
  aoc_on_file boolean DEFAULT false,
  aoc_expiry_date date,
  soc2_on_file boolean DEFAULT false,
  soc2_expiry_date date,
  last_assessment_date date,
  next_assessment_due date,
  contact_name text,
  contact_email text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create training_records table
CREATE TABLE IF NOT EXISTS training_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_email text NOT NULL,
  employee_name text NOT NULL,
  training_module text NOT NULL,
  required_for_role text,
  frequency text,
  completion_date date,
  expiry_date date,
  score int,
  passed boolean DEFAULT false,
  certificate_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create policy_acknowledgments table
CREATE TABLE IF NOT EXISTS policy_acknowledgments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_name text NOT NULL,
  policy_version text NOT NULL,
  employee_email text NOT NULL,
  employee_name text NOT NULL,
  acknowledged_at timestamptz DEFAULT now(),
  ip_address text,
  signature_data text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create compliance_scores table
CREATE TABLE IF NOT EXISTS compliance_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id uuid REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  overall_score decimal(5,2),
  implemented_count int DEFAULT 0,
  partial_count int DEFAULT 0,
  not_implemented_count int DEFAULT 0,
  total_controls int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(framework_id, date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_controls_framework ON compliance_controls(framework_id);
CREATE INDEX IF NOT EXISTS idx_controls_status ON compliance_controls(status);
CREATE INDEX IF NOT EXISTS idx_controls_category ON compliance_controls(category);
CREATE INDEX IF NOT EXISTS idx_evidence_control ON control_evidence(control_id);
CREATE INDEX IF NOT EXISTS idx_evidence_collected ON control_evidence(collected_at);
CREATE INDEX IF NOT EXISTS idx_risks_status ON risk_register(status);
CREATE INDEX IF NOT EXISTS idx_risks_score ON risk_register(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON remediation_tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON remediation_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON remediation_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_vendors_assessment_due ON vendors(next_assessment_due);
CREATE INDEX IF NOT EXISTS idx_training_employee ON training_records(employee_email);
CREATE INDEX IF NOT EXISTS idx_training_expiry ON training_records(expiry_date);
CREATE INDEX IF NOT EXISTS idx_scores_framework ON compliance_scores(framework_id, date);

-- Enable Row Level Security
ALTER TABLE compliance_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE remediation_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Authenticated users can read all compliance data
CREATE POLICY "Authenticated users can view frameworks"
  ON compliance_frameworks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view controls"
  ON compliance_controls FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view evidence"
  ON control_evidence FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view risks"
  ON risk_register FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view findings"
  ON audit_findings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view tasks"
  ON remediation_tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view vendors"
  ON vendors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view training"
  ON training_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view acknowledgments"
  ON policy_acknowledgments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view scores"
  ON compliance_scores FOR SELECT
  TO authenticated
  USING (true);

-- Insert initial data: PCI DSS v4.0 framework
INSERT INTO compliance_frameworks (name, version, description, active)
VALUES 
  ('PCI DSS', 'v4.0', 'Payment Card Industry Data Security Standard', true),
  ('SOC 2', 'Type II', 'Service Organization Control 2', false),
  ('ISO 27001', '2022', 'Information Security Management', false)
ON CONFLICT DO NOTHING;
