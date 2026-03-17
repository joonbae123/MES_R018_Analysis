-- Add section_id and rework columns to raw_data table
ALTER TABLE raw_data ADD COLUMN section_id TEXT DEFAULT '';
ALTER TABLE raw_data ADD COLUMN rework INTEGER DEFAULT 0;
ALTER TABLE raw_data ADD COLUMN wo_number TEXT DEFAULT '';

-- Create index for section_id lookups
CREATE INDEX IF NOT EXISTS idx_raw_data_section_id ON raw_data(section_id);
CREATE INDEX IF NOT EXISTS idx_raw_data_rework ON raw_data(rework);
