const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:code', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items WHERE item_code = $1', [req.params.code]);
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, error: 'Item not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { item_name, selling_price, is_active } = req.body;
  if (!item_name || selling_price === undefined)
    return res.status(400).json({ success: false, error: 'item_name and selling_price are required' });

  try {
    const lastId = await pool.query("SELECT item_code FROM items ORDER BY item_code DESC LIMIT 1");
    let nextNum = 1;
    if (lastId.rows.length > 0) {
      nextNum = parseInt(lastId.rows[0].item_code.replace('IT', '')) + 1;
    }
    const item_code = `IT${String(nextNum).padStart(5, '0')}`;

    const result = await pool.query(
      `INSERT INTO items (item_code, item_name, selling_price, is_active)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [item_code, item_name, selling_price, is_active || 'Y']
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:code', async (req, res) => {
  const { item_name, selling_price, is_active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE items SET item_name=$1, selling_price=$2, is_active=$3 WHERE item_code=$4 RETURNING *`,
      [item_name, selling_price, is_active, req.params.code]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, error: 'Item not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
