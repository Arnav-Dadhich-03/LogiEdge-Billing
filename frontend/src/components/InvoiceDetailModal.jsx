import React from 'react';
import { formatCurrency, formatDate } from '../utils/format';

export default function InvoiceDetailModal({ invoice, onClose }) {
  if (!invoice) return null;
  const items = (invoice.items || []).filter(Boolean);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Invoice Details</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {formatDate(invoice.created_at)}
            </div>
          </div>
          <button className="btn btn-icon" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="invoice-preview">
            {/* Invoice Header */}
            <div className="invoice-header-row">
              <div>
                <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Invoice ID</div>
                <div className="invoice-id-badge">{invoice.invoice_id}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Status</div>
                <span className="badge badge-active">Generated</span>
              </div>
            </div>

            {/* Customer Info */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Customer Details</div>
              <div className="invoice-customer-info">
                <div className="invoice-info-row">
                  <span className="invoice-info-label">Name</span>
                  <span className="invoice-info-value" style={{ fontWeight: 600 }}>{invoice.cust_name}</span>
                </div>
                <div className="invoice-info-row">
                  <span className="invoice-info-label">Address</span>
                  <span className="invoice-info-value">{invoice.cust_address}</span>
                </div>
                <div className="invoice-info-row">
                  <span className="invoice-info-label">PAN</span>
                  <span className="invoice-info-value" style={{ fontFamily: 'monospace', letterSpacing: 1 }}>{invoice.cust_pan || '—'}</span>
                </div>
                <div className="invoice-info-row">
                  <span className="invoice-info-label">GST No.</span>
                  <span className="invoice-info-value" style={{ fontFamily: 'monospace', letterSpacing: 1 }}>
                    {invoice.cust_gst || <span style={{ color: 'var(--text-muted)' }}>Not Registered</span>}
                  </span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>Line Items</div>
              <table className="invoice-items-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style={{ textAlign: 'right' }}>Unit Price</th>
                    <th style={{ textAlign: 'right' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td>{item.item_name}</td>
                      <td className="right">{formatCurrency(item.unit_price)}</td>
                      <td className="right">{item.quantity}</td>
                      <td className="right" style={{ fontWeight: 600 }}>{formatCurrency(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="invoice-totals">
              <div className="total-row">
                <span className="total-label">Subtotal</span>
                <span className="total-value">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.gst_applied ? (
                <div className="total-row">
                  <span className="total-label">GST (18%)</span>
                  <span className="total-value" style={{ color: 'var(--red)' }}>+{formatCurrency(invoice.gst_amount)}</span>
                </div>
              ) : (
                <div className="total-row">
                  <span style={{ fontSize: 12, color: 'var(--green)' }}>✓ GST Registered Customer — No GST Applied</span>
                </div>
              )}
              <div className="total-row grand">
                <span className="total-label" style={{ color: 'var(--text-secondary)' }}>Grand Total</span>
                <span className="total-value">{formatCurrency(invoice.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
