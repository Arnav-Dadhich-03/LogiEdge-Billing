import React, { useState, useEffect } from 'react';
import { getItems, createItem } from '../utils/api';
import { formatCurrency } from '../utils/format';

function AddItemModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ item_name: '', selling_price: '', is_active: 'Y' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.item_name.trim()) { setError('Item name is required'); return; }
    if (!form.selling_price || isNaN(form.selling_price) || Number(form.selling_price) < 0) {
      setError('Valid selling price is required'); return;
    }
    setLoading(true); setError('');
    try {
      await createItem({ ...form, selling_price: Number(form.selling_price) });
      onSuccess(); onClose();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to create item');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add New Item</h2>
          <button className="btn btn-icon" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-row form-row-2">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Item Name *</label>
                <input className="form-input" name="item_name" value={form.item_name} onChange={handleChange} placeholder="e.g. Laptop, LED Monitor" />
              </div>
            </div>
            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Selling Price (₹) *</label>
                <input className="form-input" name="selling_price" type="number" min="0" value={form.selling_price} onChange={handleChange} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" name="is_active" value={form.is_active} onChange={handleChange}>
                  <option value="Y">Active</option>
                  <option value="N">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Creating...</> : 'Create Item'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filterActive, setFilterActive] = useState('all');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await getItems();
      setItems(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const filtered = items.filter(c =>
    filterActive === 'all' ? true : filterActive === 'active' ? c.is_active === 'Y' : c.is_active === 'N'
  );

  const itemIcons = ['💻', '🖥', '💾', '📱', '🎧', '🎒', '🔋'];

  return (
    <>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Items</h1>
          <p className="page-subtitle">Manage item & product catalog</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4, background: 'var(--ink-3)', padding: 4, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            {['all', 'active', 'inactive'].map(f => (
              <button key={f} onClick={() => setFilterActive(f)}
                className="btn btn-sm"
                style={filterActive === f
                  ? { background: 'var(--accent)', color: 'var(--ink)', border: 'none', fontWeight: 600 }
                  : { background: 'transparent', color: 'var(--text-muted)', border: 'none', textTransform: 'capitalize' }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
            Add Item
          </button>
        </div>
      </div>

      <div className="page-body">
        {loading ? (
          <div className="entity-grid">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="entity-card" style={{ cursor: 'default' }}>
                <div className="skeleton" style={{ height: 16, width: '70%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 24, width: '40%', marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 22, width: 60 }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <div className="empty-title">No items found</div>
            <div className="empty-desc">Add your first item to start billing.</div>
          </div>
        ) : (
          <div className="entity-grid">
            {filtered.map((item, idx) => (
              <div key={item.item_code} className="entity-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, background: 'var(--ink-4)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                    {itemIcons[idx % itemIcons.length]}
                  </div>
                  <span className={`badge ${item.is_active === 'Y' ? 'badge-active' : 'badge-inactive'}`}>
                    {item.is_active === 'Y' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="entity-card-name">{item.item_name}</div>
                <div className="entity-card-price">{formatCurrency(item.selling_price)}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 10, fontFamily: 'monospace' }}>{item.item_code}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && <AddItemModal onClose={() => setShowAdd(false)} onSuccess={fetchItems} />}
    </>
  );
}
