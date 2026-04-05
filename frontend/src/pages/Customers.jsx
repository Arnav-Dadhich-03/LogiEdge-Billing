import React, { useState, useEffect } from 'react';
import { getCustomers, createCustomer } from '../utils/api';

function AddCustomerModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ cust_name: '', cust_address: '', cust_pan: '', cust_gst: '', is_active: 'Y' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.cust_name.trim()) { setError('Customer name is required'); return; }
    setLoading(true); setError('');
    try {
      await createCustomer(form);
      onSuccess();
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to create customer');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add New Customer</h2>
          <button className="btn btn-icon" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Customer Name *</label>
                <input className="form-input" name="cust_name" value={form.cust_name} onChange={handleChange} placeholder="Acme Corp Pvt. Ltd." />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" name="is_active" value={form.is_active} onChange={handleChange}>
                  <option value="Y">Active</option>
                  <option value="N">Inactive</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" name="cust_address" value={form.cust_address} onChange={handleChange} placeholder="City, State" />
            </div>
            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">PAN Number <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>(10 digits)</span></label>
                <input className="form-input" name="cust_pan" value={form.cust_pan} onChange={handleChange} placeholder="ABCDE1234F" maxLength={10} style={{ textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: 1 }} />
              </div>
              <div className="form-group">
                <label className="form-label">GST Number <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>(15 digits)</span></label>
                <input className="form-input" name="cust_gst" value={form.cust_gst} onChange={handleChange} placeholder="22ABCDE1234F1Z5" maxLength={15} style={{ textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: 1 }} />
              </div>
            </div>
            <div className="alert" style={{ background: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.2)', color: 'var(--blue)', fontSize: 12 }}>
              💡 If GST Number is provided, 18% GST will <strong>not</strong> be applied on invoices for this customer.
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Creating...</> : 'Create Customer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filterActive, setFilterActive] = useState('all');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await getCustomers();
      setCustomers(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const filtered = customers.filter(c =>
    filterActive === 'all' ? true : filterActive === 'active' ? c.is_active === 'Y' : c.is_active === 'N'
  );

  return (
    <>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Manage customer master data</p>
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
            Add Customer
          </button>
        </div>
      </div>

      <div className="page-body">
        {loading ? (
          <div className="entity-grid">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="entity-card" style={{ cursor: 'default' }}>
                <div className="skeleton" style={{ height: 16, width: '75%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 22, width: 60 }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <div className="empty-title">No customers found</div>
            <div className="empty-desc">Add your first customer to get started.</div>
          </div>
        ) : (
          <div className="entity-grid">
            {filtered.map(c => (
              <div key={c.cust_id} className="entity-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div className="entity-card-name">{c.cust_name}</div>
                  <span className={`badge ${c.is_active === 'Y' ? 'badge-active' : 'badge-inactive'}`}>
                    {c.is_active === 'Y' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="entity-card-meta">
                  {c.cust_address && <div>📍 {c.cust_address}</div>}
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                  {c.cust_pan && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                      PAN: <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', letterSpacing: 1 }}>{c.cust_pan}</span>
                    </div>
                  )}
                  {c.cust_gst ? (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      GST: <span style={{ fontFamily: 'monospace', color: 'var(--green)', letterSpacing: 0.5 }}>{c.cust_gst}</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>⚠</span> Not GST Registered
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8, fontFamily: 'monospace' }}>{c.cust_id}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && <AddCustomerModal onClose={() => setShowAdd(false)} onSuccess={fetchCustomers} />}
    </>
  );
}
