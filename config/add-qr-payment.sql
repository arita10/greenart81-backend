-- Add QR Code Payment System
-- Admin uploads QR codes, Users upload payment slips

-- 1. QR Codes Table (Admin manages payment QR codes)
CREATE TABLE IF NOT EXISTS payment_qr_codes (
  id SERIAL PRIMARY KEY,
  bank_name VARCHAR(255) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(255),
  qr_code_image_url TEXT NOT NULL,
  payment_type VARCHAR(100) DEFAULT 'bank_transfer',
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Payment Slips Table (Users upload payment proof)
CREATE TABLE IF NOT EXISTS payment_slips (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  user_id INTEGER REFERENCES users(id),
  qr_code_id INTEGER REFERENCES payment_qr_codes(id),
  slip_image_url TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP,
  transaction_reference VARCHAR(255),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  verified_by INTEGER REFERENCES users(id),
  verified_at TIMESTAMP,
  verification_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Update orders table to support QR payment
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100) DEFAULT 'qr_code';

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_qr_codes_active ON payment_qr_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_slips_order ON payment_slips(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_slips_user ON payment_slips(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_slips_status ON payment_slips(status);

-- 5. Insert sample QR code (you can update this later)
-- Skipping sample insert - admin will create QR codes via API
