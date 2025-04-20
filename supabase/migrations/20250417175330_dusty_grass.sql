/*
  # Create detection logs table

  1. New Tables
    - `detection_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `timestamp` (timestamptz, default now())
      - `objects_detected` (text array)
      - `distance_warnings` (text array)

  2. Security
    - Enable RLS on `detection_logs` table
    - Add policies for:
      - Users can insert their own logs
      - Users can read only their own logs
*/

CREATE TABLE IF NOT EXISTS detection_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  timestamp timestamptz DEFAULT now(),
  objects_detected text[] NOT NULL,
  distance_warnings text[] NOT NULL
);

ALTER TABLE detection_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own logs
CREATE POLICY "Users can insert their own logs"
  ON detection_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to read their own logs
CREATE POLICY "Users can read their own logs"
  ON detection_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);