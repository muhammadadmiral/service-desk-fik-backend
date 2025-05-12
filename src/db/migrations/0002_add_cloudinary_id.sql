ALTER TABLE ticket_attachments
ADD COLUMN IF NOT EXISTS cloudinary_id VARCHAR(255);