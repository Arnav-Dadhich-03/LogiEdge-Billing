-- LogiEdge Billing Dashboard Database Schema
-- PostgreSQL

-- Drop tables if they exist (for fresh setup)
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- Customers Master Table
CREATE TABLE customers (
    cust_id VARCHAR(10) PRIMARY KEY,
    cust_name VARCHAR(255) NOT NULL,
    cust_address TEXT,
    cust_pan VARCHAR(10),
    cust_gst VARCHAR(20),
    is_active CHAR(1) DEFAULT 'Y' CHECK (is_active IN ('Y', 'N')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Items Master Table
CREATE TABLE items (
    item_code VARCHAR(10) PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    selling_price NUMERIC(12, 2) NOT NULL CHECK (selling_price >= 0),
    is_active CHAR(1) DEFAULT 'Y' CHECK (is_active IN ('Y', 'N')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices Transaction Table
CREATE TABLE invoices (
    invoice_id VARCHAR(10) PRIMARY KEY,
    cust_id VARCHAR(10) NOT NULL REFERENCES customers(cust_id),
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    gst_applied BOOLEAN DEFAULT FALSE,
    gst_amount NUMERIC(12, 2) DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoice Items (Line Items) Table
CREATE TABLE invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id VARCHAR(10) NOT NULL REFERENCES invoices(invoice_id) ON DELETE CASCADE,
    item_code VARCHAR(10) NOT NULL REFERENCES items(item_code),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL,
    line_total NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_invoices_cust_id ON invoices(cust_id);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);

-- Seed Customer Master Data
INSERT INTO customers (cust_id, cust_name, cust_address, cust_pan, cust_gst, is_active) VALUES
('C00001', 'Gupta Enterprize Pvt. Ltd.', 'Gurgaon, Haryana', 'BCNSG1234H', '06BCNSG1234H1Z5', 'Y'),
('C00002', 'Mahesh Industries Pvt. Ltd.', 'Delhi, Delhi', 'AMNSM1234U', '07AMNSM1234U1Z5', 'Y'),
('C00003', 'Omkar and Brothers Pvt. Ltd.', 'Uttrakhand, Uttar Pradesh', 'CNBSO1234S', '05CNBSO1234S1Z5', 'N'),
('C00004', 'Bhuwan Infotech.', 'Alwar, Rajasthan', 'CMNSB1234A', '08CMNSB1234A1Z5', 'Y'),
('C00005', 'Swastik Software Pvt. Ltd.', 'Gurgaon, Haryana', 'AGBCS1234B', '06AGBCS1234B1Z5', 'Y');

-- Seed Item Master Data
INSERT INTO items (item_code, item_name, selling_price, is_active) VALUES
('IT00001', 'Laptop', 85000.00, 'Y'),
('IT00002', 'LED Monitor', 13450.00, 'Y'),
('IT00003', 'Pen Drive', 980.00, 'Y'),
('IT00004', 'Mobile', 18900.00, 'Y'),
('IT00005', 'Headphone', 2350.00, 'N'),
('IT00006', 'Bagpack', 1200.00, 'Y'),
('IT00007', 'Powerbank', 1400.00, 'Y');

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
