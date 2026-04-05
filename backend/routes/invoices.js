const express = require('express');
const router = express.Router();
const pool = require('../db');

// Generate unique invoice ID: INVC + 6 random digits
function generateInvoiceId() {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `INVC${digits}`;
}

// GET all invoices with customer info
router.get('/', async (req, res) => {
  try {
    const { search, cust_id } = req.query;
    let query = `
      SELECT i.*, c.cust_name, c.cust_address, c.cust_pan, c.cust_gst,
             json_agg(json_build_object(
               'item_code', ii.item_code,
               'item_name', it.item_name,
               'quantity', ii.quantity,
               'unit_price', ii.unit_price,
               'line_total', ii.line_total
             ) ORDER BY ii.id) as items
      FROM invoices i
      JOIN customers c ON i.cust_id = c.cust_id
      LEFT JOIN invoice_items ii ON i.invoice_id = ii.invoice_id
      LEFT JOIN items it ON ii.item_code = it.item_code
    `;
    const params = [];
    const conditions = [];

    if (search) {
      params.push(`%${search.toUpperCase()}%`);
      conditions.push(`UPPER(i.invoice_id) LIKE $${params.length}`);
    }
    if (cust_id) {
      params.push(cust_id);
      conditions.push(`i.cust_id = $${params.length}`);
    }
    if (conditions.length > 0) query += ` WHERE ` + conditions.join(' AND ');
    query += ` GROUP BY i.invoice_id, c.cust_name, c.cust_address, c.cust_pan, c.cust_gst ORDER BY i.created_at DESC`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single invoice
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, c.cust_name, c.cust_address, c.cust_pan, c.cust_gst,
             json_agg(json_build_object(
               'item_code', ii.item_code,
               'item_name', it.item_name,
               'quantity', ii.quantity,
               'unit_price', ii.unit_price,
               'line_total', ii.line_total
             ) ORDER BY ii.id) as items
      FROM invoices i
      JOIN customers c ON i.cust_id = c.cust_id
      LEFT JOIN invoice_items ii ON i.invoice_id = ii.invoice_id
      LEFT JOIN items it ON ii.item_code = it.item_code
      WHERE i.invoice_id = $1
      GROUP BY i.invoice_id, c.cust_name, c.cust_address, c.cust_pan, c.cust_gst
    `, [req.params.id.toUpperCase()]);

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create invoice
router.post('/', async (req, res) => {
  const { cust_id, items } = req.body;
  if (!cust_id || !items || items.length === 0)
    return res.status(400).json({ success: false, error: 'cust_id and items are required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get customer to check GST
    const custResult = await client.query('SELECT * FROM customers WHERE cust_id = $1', [cust_id]);
    if (custResult.rows.length === 0) throw new Error('Customer not found');
    const customer = custResult.rows[0];

    // GST logic: if customer has GST number, no GST applied; otherwise 18% GST
    const isGstRegistered = customer.cust_gst && customer.cust_gst.trim().length > 0;

    // Calculate subtotal from items
    let subtotal = 0;
    const enrichedItems = [];
    for (const item of items) {
      const itemResult = await client.query('SELECT * FROM items WHERE item_code = $1', [item.item_code]);
      if (itemResult.rows.length === 0) throw new Error(`Item ${item.item_code} not found`);
      const dbItem = itemResult.rows[0];
      const lineTotal = dbItem.selling_price * item.quantity;
      subtotal += lineTotal;
      enrichedItems.push({ ...item, unit_price: dbItem.selling_price, line_total: lineTotal });
    }

    const gstRate = 0.18;
    const gstApplied = !isGstRegistered;
    const gstAmount = gstApplied ? parseFloat((subtotal * gstRate).toFixed(2)) : 0;
    const totalAmount = parseFloat((subtotal + gstAmount).toFixed(2));

    // Generate unique invoice ID (retry if collision)
    let invoice_id;
    let attempts = 0;
    while (attempts < 10) {
      invoice_id = generateInvoiceId();
      const exists = await client.query('SELECT 1 FROM invoices WHERE invoice_id = $1', [invoice_id]);
      if (exists.rows.length === 0) break;
      attempts++;
    }

    // Insert invoice
    const invoiceResult = await client.query(
      `INSERT INTO invoices (invoice_id, cust_id, subtotal, gst_applied, gst_amount, total_amount)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [invoice_id, cust_id, subtotal, gstApplied, gstAmount, totalAmount]
    );

    // Insert invoice items
    for (const item of enrichedItems) {
      await client.query(
        `INSERT INTO invoice_items (invoice_id, item_code, quantity, unit_price, line_total)
         VALUES ($1, $2, $3, $4, $5)`,
        [invoice_id, item.item_code, item.quantity, item.unit_price, item.line_total]
      );
    }

    await client.query('COMMIT');

    // Return full invoice
    const full = await pool.query(`
      SELECT i.*, c.cust_name, c.cust_address, c.cust_pan, c.cust_gst,
             json_agg(json_build_object(
               'item_code', ii.item_code,
               'item_name', it.item_name,
               'quantity', ii.quantity,
               'unit_price', ii.unit_price,
               'line_total', ii.line_total
             ) ORDER BY ii.id) as items
      FROM invoices i
      JOIN customers c ON i.cust_id = c.cust_id
      LEFT JOIN invoice_items ii ON i.invoice_id = ii.invoice_id
      LEFT JOIN items it ON ii.item_code = it.item_code
      WHERE i.invoice_id = $1
      GROUP BY i.invoice_id, c.cust_name, c.cust_address, c.cust_pan, c.cust_gst
    `, [invoice_id]);

    res.status(201).json({ success: true, data: full.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

// GET dashboard stats
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_invoices,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COUNT(DISTINCT cust_id) as unique_customers,
        COALESCE(AVG(total_amount), 0) as avg_invoice_value
      FROM invoices
    `);
    res.json({ success: true, data: stats.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
