-- Migration: Add is_internal column to feedback table
-- This column marks feedback submitted internally (not via Google) for low ratings (≤3 stars)

-- Add the is_internal column
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS is_internal BOOLEAN DEFAULT FALSE;

-- Create index for filtered queries
CREATE INDEX IF NOT EXISTS idx_feedback_is_internal ON feedback(is_internal);

-- Add descriptive comment
COMMENT ON COLUMN feedback.is_internal IS 'True if feedback was submitted internally (not via Google), typically for low ratings';
