const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all customers
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM customers ORDER BY created_at DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single customer
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM customers WHERE cust_id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, error: 'Customer not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create customer
router.post('/', async (req, res) => {
  const { cust_name, cust_address, cust_pan, cust_gst, is_active } = req.body;
  if (!cust_name) return res.status(400).json({ success: false, error: 'Customer name is required' });

  try {
    // Generate next customer ID
    const lastId = await pool.query(
      "SELECT cust_id FROM customers ORDER BY cust_id DESC LIMIT 1"
    );
    let nextNum = 1;
    if (lastId.rows.length > 0) {
      const last = lastId.rows[0].cust_id;
      nextNum = parseInt(last.replace('C', '')) + 1;
    }
    const cust_id = `C${String(nextNum).padStart(5, '0')}`;

    const result = await pool.query(
      `INSERT INTO customers (cust_id, cust_name, cust_address, cust_pan, cust_gst, is_active)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [cust_id, cust_name, cust_address || null, cust_pan || null, cust_gst || null, is_active || 'Y']
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update customer
router.put('/:id', async (req, res) => {
  const { cust_name, cust_address, cust_pan, cust_gst, is_active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE customers SET cust_name=$1, cust_address=$2, cust_pan=$3, cust_gst=$4, is_active=$5
       WHERE cust_id=$6 RETURNING *`,
      [cust_name, cust_address, cust_pan, cust_gst, is_active, req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, error: 'Customer not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
