import React, { useState, useEffect, useCallback } from 'react';
import { getInvoices, getStats } from '../utils/api';
import { formatCurrency, formatShortDate } from '../utils/format';
import InvoiceDetailModal from '../components/InvoiceDetailModal';

export default function Dashboard() {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, statsRes] = await Promise.all([
        getInvoices(search ? { search } : {}),
        getStats(),
      ]);
      setInvoices(invRes.data.data);
      setStats(statsRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const statCards = stats ? [
    { label: 'Total Invoices', value: stats.total_invoices, icon: '📄', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    { label: 'Total Revenue', value: formatCurrency(stats.total_revenue), icon: '₹', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    { label: 'Unique Customers', value: stats.unique_customers, icon: '👥', color: '#f5a623', bg: 'rgba(245,166,35,0.1)' },
    { label: 'Avg. Invoice Value', value: formatCurrency(stats.avg_invoice_value), icon: '📊', color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
  ] : [];

  return (
    <>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of all billing activity</p>
        </div>
        <div className="search-bar">
          <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            className="search-input"
            placeholder="Search by Invoice ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="page-body">
        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {loading && !stats
            ? Array(4).fill(0).map((_, i) => (
                <div key={i} className="stat-card">
                  <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 10 }} />
                  <div className="skeleton" style={{ width: '60%', height: 28, marginTop: 8 }} />
                  <div className="skeleton" style={{ width: '80%', height: 14, marginTop: 4 }} />
                </div>
              ))
            : statCards.map((s, i) => (
                <div key={i} className="stat-card" style={{ '--gradient': `linear-gradient(90deg, ${s.color}, transparent)` }}>
                  <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                    <span>{s.icon}</span>
                  </div>
                  <div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </div>
              ))
          }
        </div>

        {/* Invoices Table */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              {search ? `Search Results` : 'Recent Invoices'}
              {invoices.length > 0 && <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8, fontSize: 13 }}>{invoices.length} record{invoices.length !== 1 ? 's' : ''}</span>}
            </h2>
          </div>

          {loading ? (
            <div style={{ padding: '32px', display: 'flex', justifyContent: 'center' }}>
              <div className="spinner" style={{ width: 32, height: 32 }} />
            </div>
          ) : invoices.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🧾</div>
              <div className="empty-title">{search ? 'No results found' : 'No invoices yet'}</div>
              <div className="empty-desc">
                {search ? `No invoice found with ID containing "${search}"` : 'Create your first invoice in the Billing module.'}
              </div>
            </div>
          ) : (
            <div className="table-wrapper" style={{ borderRadius: 0, border: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>GST</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv.invoice_id}>
                      <td>
                        <span className="badge badge-invoice">{inv.invoice_id}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{inv.cust_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{inv.cust_address}</div>
                      </td>
                      <td className="muted">
                        {inv.items && inv.items[0]
                          ? inv.items.filter(Boolean).map(it => it.item_name).join(', ')
                          : '—'}
                      </td>
                      <td>
                        <span className={`badge ${inv.gst_applied ? 'badge-active' : ''}`} style={!inv.gst_applied ? { background: 'var(--ink-4)', color: 'var(--text-muted)', border: '1px solid var(--border)' } : {}}>
                          {inv.gst_applied ? `+18%` : 'GST Reg.'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--accent)' }}>
                          {formatCurrency(inv.total_amount)}
                        </span>
                      </td>
                      <td className="muted">{formatShortDate(inv.created_at)}</td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => setSelectedInvoice(inv)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedInvoice && (
        <InvoiceDetailModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
    </>
  );
}
