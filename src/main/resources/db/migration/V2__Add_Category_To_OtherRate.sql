-- Add category, companyRate, and lorryRate columns to other_rate table
ALTER TABLE other_rate ADD COLUMN category VARCHAR(255);
ALTER TABLE other_rate ADD COLUMN company_rate DOUBLE PRECISION DEFAULT 0;
ALTER TABLE other_rate ADD COLUMN lorry_rate DOUBLE PRECISION DEFAULT 0;

-- Update existing records to set category and rates
-- Set 'waiting' category records
UPDATE other_rate 
SET category = 'waiting', 
    company_rate = waiting_comp_rate, 
    lorry_rate = waiting_lorry_rate;

-- Create new records for 'cdwt' category
INSERT INTO other_rate (type, category, company_rate, lorry_rate, cd_comp_rate, cd_lorry_rate, waiting_comp_rate, waiting_lorry_rate, created_at)
SELECT type, 'cdwt', cd_comp_rate, cd_lorry_rate, cd_comp_rate, cd_lorry_rate, waiting_comp_rate, waiting_lorry_rate, created_at
FROM other_rate;