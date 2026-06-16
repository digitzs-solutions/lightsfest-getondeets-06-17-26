/*
  # Create Events and Registrations Tables

  1. New Tables
    - `events` - Festival events with dates, locations, and details
    - `registrations` - User registrations for events
  
  2. Security
    - Enable RLS on both tables
    - Public read access for events
    - Registration policies for data integrity
*/

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date text NOT NULL,
  location text NOT NULL,
  city text NOT NULL,
  description text,
  image_url text,
  ticket_url text,
  capacity integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  tickets_quantity integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are publicly readable"
  ON events FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert registrations"
  ON registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Registrations are publicly readable"
  ON registrations FOR SELECT
  TO anon, authenticated
  USING (true);
