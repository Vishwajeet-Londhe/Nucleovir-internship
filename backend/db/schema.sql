-- Run this file to set up your database
-- psql -U postgres -d paperlens -f db/schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS papers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT,
  input_type    VARCHAR(10)  NOT NULL CHECK (input_type IN ('text', 'pdf', 'url')),
  raw_text      TEXT,
  source_url    TEXT,
  pdf_url       TEXT,
  status        VARCHAR(20)  NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress      INTEGER      NOT NULL DEFAULT 5 CHECK (progress >= 0 AND progress <= 100),
  error_message TEXT,
  result        JSONB,
  created_at    TIMESTAMPTZ  DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_papers_status     ON papers(status);
CREATE INDEX IF NOT EXISTS idx_papers_created_at ON papers(created_at DESC);
