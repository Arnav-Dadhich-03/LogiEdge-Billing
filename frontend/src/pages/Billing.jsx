import React, { useState, useEffect } from 'react';
import { getCustomers, getItems, createInvoice } from '../utils/api';
import { formatCurrency } from '../utils/format';
import InvoiceDetailModal from '../components/InvoiceDetailModal';

// Step indicator
function StepBar({ step }) {
  const steps = ['Select Customer', 'Select Items', 'Review & Create'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: i < step ? 'var(--green)' : i === step ? 'var(--accent)' : 'var(--ink-4)',
              color: i <= step ? 'var(--ink)' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
              transition: 'all 0.3s ease',
              flexShrink: 0,
              boxShadow: i === step ? 'var(--shadow-accent)' : 'none',
            }}>
              {i < step ? '✓' : i + 1}
            </div>
            <span style={{
              fontSize: 13, fontWeight: i === step ? 600 : 400,
              color: i === step ? 'var(--text-primary)' : i < step ? 'var(--green)' : 'var(--text-muted)',
              whiteSpace: 'nowrap',
            }}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: 1, margin: '0 16px',
              background: i < step ? 'var(--green)' : 'var(--border)',
              transition: 'background 0.3s ease',
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function Billing() {
  const [step, setStep] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedItems, setSelectedItems] = useState({}); // { item_code: qty }
  const [loading, setLoading] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getCustomers(), getItems()]).then(([cRes, iRes]) => {
      setCustomers(cRes.data.data.filter(c => c.is_active === 'Y'));
      setItems(iRes.data.data);
    });
  }, []);

  const activeItems = items.filter(i => i.is_active === 'Y');

  const setQty = (code, qty) => {
    setSelectedItems(prev => {
      if (qty <= 0) {
        const next = { ...prev };
        delete next[code];
        return next;
      }
      return { ...prev, [code]: qty };
    });
  };

  const getQty = (code) => selectedItems[code] || 0;

  const selectedItemsList = activeItems
    .filter(i => selectedItems[i.item_code])
    .map(i => ({ ...i, qty: selectedItems[i.item_code], total: i.selling_price * selectedItems[i.item_code] }));

  const subtotal = selectedItemsList.reduce((s, i) => s + i.total, 0);
  const isGstRegistered = selectedCustomer?.cust_gst && selectedCustomer.cust_gst.trim().length > 0;
  const gstAmount = isGstRegistered ? 0 : subtotal * 0.18;
  const grandTotal = subtotal + gstAmount;

  const handleCreate = async () => {
    if (!selectedCustomer || selectedItemsList.length === 0) return;
    setLoading(true); setError('');
    try {
      const res = await createInvoice({
        cust_id: selectedCustomer.cust_id,
        items: selectedItemsList.map(i => ({ item_code: i.item_code, quantity: i.qty })),
      });
      setCreatedInvoice(res.data.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to create invoice');
    } finally { setLoading(false); }
  };

  const resetForm = () => {
    setStep(0); setSelectedCustomer(null); setSelectedItems({});
    setCreatedInvoice(null); setError('');
  };

  if (createdInvoice) {
    return (
      <>
        <div className="page-header">
          <div className="page-title-group">
            <h1 className="page-title">Invoice Created</h1>
            <p className="page-subtitle">Your invoice has been generated successfully</p>
          </div>
        </div>
        <div className="page-body">
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div className="alert alert-success" style={{ marginBottom: 24, fontSize: 15, padding: '16px 20px' }}>
              ✅ Invoice <strong>{createdInvoice.invoice_id}</strong> created successfully!
            </div>

            <div className="invoice-preview" style={{ marginBottom: 24 }}>
              <div className="invoice-header-row">
                <div>
                  <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Invoice ID</div>
                  <div className="invoice-id-badge">{createdInvoice.invoice_id}</div>
                </div>
                <span className="badge badge-active">Generated</span>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Customer</div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{createdInvoice.cust_name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{createdInvoice.cust_address}</div>
              </div>

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
                  {(createdInvoice.items || []).filter(Boolean).map((item, i) => (
                    <tr key={i}>
                      <td>{item.item_name}</td>
                      <td className="right">{formatCurrency(item.unit_price)}</td>
                      <td className="right">{item.quantity}</td>
                      <td className="right" style={{ fontWeight: 600 }}>{formatCurrency(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="invoice-totals">
                <div className="total-row">
                  <span className="total-label">Subtotal</span>
                  <span className="total-value">{formatCurrency(createdInvoice.subtotal)}</span>
                </div>
                {createdInvoice.gst_applied
                  ? <div className="total-row"><span className="total-label">GST (18%)</span><span className="total-value" style={{ color: 'var(--red)' }}>+{formatCurrency(createdInvoice.gst_amount)}</span></div>
                  : <div style={{ fontSize: 12, color: 'var(--green)' }}>✓ GST Registered — No GST Applied</div>
                }
                <div className="total-row grand">
                  <span className="total-label" style={{ color: 'var(--text-secondary)' }}>Grand Total</span>
                  <span className="total-value">{formatCurrency(createdInvoice.total_amount)}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary btn-lg" onClick={resetForm} style={{ flex: 1 }}>
                Create Another Invoice
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">New Invoice</h1>
          <p className="page-subtitle">Generate a billing invoice for a customer</p>
        </div>
        {step > 0 && (
          <button className="btn btn-ghost" onClick={() => { setStep(0); setSelectedCustomer(null); setSelectedItems({}); }}>
            ← Start Over
          </button>
        )}
      </div>

      <div className="page-body">
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <StepBar step={step} />

          {/* Step 0: Select Customer */}
          {step === 0 && (
            <div style={{ animation: 'fadeIn 0.2s ease' }}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Select a Customer</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Choose the customer to bill. Only active customers are shown.</p>
              </div>
              {customers.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">👥</div><div className="empty-title">No active customers</div><div className="empty-desc">Add customers in the Master module first.</div></div>
              ) : (
                <div className="entity-grid">
                  {customers.map(c => (
                    <div key={c.cust_id} className={`entity-card ${selectedCustomer?.cust_id === c.cust_id ? 'selected' : ''}`}
                      onClick={() => setSelectedCustomer(c)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div className="entity-card-name">{c.cust_name}</div>
                        {selectedCustomer?.cust_id === c.cust_id && (
                          <div style={{ color: 'var(--accent)', fontSize: 18 }}>✓</div>
                        )}
                      </div>
                      <div className="entity-card-meta">{c.cust_address}</div>
                      {c.cust_gst
                        ? <div style={{ fontSize: 11, color: 'var(--green)' }}>✓ GST Registered</div>
                        : <div style={{ fontSize: 11, color: 'var(--red)' }}>⚠ Not GST Registered (+18% GST)</div>
                      }
                    </div>
                  ))}
                </div>
              )}
              {selectedCustomer && (
                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-primary btn-lg" onClick={() => setStep(1)}>
                    Continue with {selectedCustomer.cust_name} →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Select Items */}
          {step === 1 && (
            <div style={{ animation: 'fadeIn 0.2s ease' }}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Select Items</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Choose products and set quantities. Inactive items cannot be added.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
                {/* Items grid */}
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                    {items.map((item) => {
                      const qty = getQty(item.item_code);
                      const isInactive = item.is_active !== 'Y';
                      return (
                        <div key={item.item_code} className="entity-card" style={{
                          opacity: isInactive ? 0.5 : 1,
                          cursor: isInactive ? 'not-allowed' : 'default',
                          border: qty > 0 ? '1px solid var(--accent)' : undefined,
                          background: qty > 0 ? 'var(--accent-dim)' : undefined,
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <div className="entity-card-name" style={{ fontSize: 14 }}>{item.item_name}</div>
                            {isInactive && <span className="badge badge-inactive">Inactive</span>}
                          </div>
                          <div className="entity-card-price" style={{ fontSize: 16, marginBottom: 12 }}>{formatCurrency(item.selling_price)}</div>
                          {!isInactive && (
                            qty === 0 ? (
                              <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => setQty(item.item_code, 1)}>
                                + Add
                              </button>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div className="qty-stepper">
                                  <button className="qty-btn" onClick={() => setQty(item.item_code, qty - 1)}>−</button>
                                  <span className="qty-display">{qty}</span>
                                  <button className="qty-btn" onClick={() => setQty(item.item_code, qty + 1)}>+</button>
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
                                  {formatCurrency(item.selling_price * qty)}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cart summary */}
                <div className="card" style={{ position: 'sticky', top: 90 }}>
                  <div className="card-header">
                    <h3 className="card-title">Order Summary</h3>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selectedItemsList.length} item{selectedItemsList.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="card-body" style={{ padding: '16px 20px' }}>
                    {selectedItemsList.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                        No items selected yet
                      </div>
                    ) : (
                      <>
                        {selectedItemsList.map(item => (
                          <div key={item.item_code} className="billing-item-row">
                            <div>
                              <div className="billing-item-name">{item.item_name}</div>
                              <div className="billing-item-price">{formatCurrency(item.selling_price)} × {item.qty}</div>
                            </div>
                            <div className="billing-item-total">{formatCurrency(item.total)}</div>
                          </div>
                        ))}
                        <div className="divider" />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                          <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                          <span>{formatCurrency(subtotal)}</span>
                        </div>
                        {!isGstRegistered ? (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                            <span style={{ color: 'var(--text-muted)' }}>GST (18%)</span>
                            <span style={{ color: 'var(--red)' }}>+{formatCurrency(gstAmount)}</span>
                          </div>
                        ) : (
                          <div style={{ fontSize: 11, color: 'var(--green)', marginBottom: 6 }}>✓ GST Registered — No GST</div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--accent)', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                          <span>Total</span>
                          <span>{formatCurrency(grandTotal)}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button className="btn btn-primary" style={{ width: '100%' }}
                      disabled={selectedItemsList.length === 0} onClick={() => setStep(2)}>
                      Review Invoice →
                    </button>
                    <button className="btn btn-ghost btn-sm" style={{ width: '100%' }} onClick={() => setStep(0)}>
                      ← Back
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Review & Create */}
          {step === 2 && (
            <div style={{ animation: 'fadeIn 0.2s ease', maxWidth: 680 }}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Review Invoice</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Please confirm the details before generating the invoice.</p>
              </div>

              {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

              <div className="invoice-preview" style={{ marginBottom: 24 }}>
                <div className="invoice-header-row">
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Invoice ID</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1 }}>Auto-generated on create</div>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Customer Details</div>
                  <div className="invoice-customer-info">
                    <div className="invoice-info-row"><span className="invoice-info-label">Name</span><span className="invoice-info-value" style={{ fontWeight: 600 }}>{selectedCustomer?.cust_name}</span></div>
                    <div className="invoice-info-row"><span className="invoice-info-label">Address</span><span className="invoice-info-value">{selectedCustomer?.cust_address}</span></div>
                    <div className="invoice-info-row"><span className="invoice-info-label">PAN</span><span className="invoice-info-value" style={{ fontFamily: 'monospace' }}>{selectedCustomer?.cust_pan}</span></div>
                    <div className="invoice-info-row"><span className="invoice-info-label">GST No.</span><span className="invoice-info-value" style={{ fontFamily: 'monospace' }}>{selectedCustomer?.cust_gst || <span style={{ color: 'var(--text-muted)' }}>Not Registered</span>}</span></div>
                  </div>
                </div>

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
                    {selectedItemsList.map((item) => (
                      <tr key={item.item_code}>
                        <td>{item.item_name}</td>
                        <td className="right">{formatCurrency(item.selling_price)}</td>
                        <td className="right">{item.qty}</td>
                        <td className="right" style={{ fontWeight: 600 }}>{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="invoice-totals">
                  <div className="total-row"><span className="total-label">Subtotal</span><span className="total-value">{formatCurrency(subtotal)}</span></div>
                  {!isGstRegistered
                    ? <div className="total-row"><span className="total-label">GST (18%)</span><span className="total-value" style={{ color: 'var(--red)' }}>+{formatCurrency(gstAmount)}</span></div>
                    : <div style={{ fontSize: 12, color: 'var(--green)' }}>✓ GST Registered Customer — No GST Applied</div>
                  }
                  <div className="total-row grand">
                    <span className="total-label" style={{ color: 'var(--text-secondary)' }}>Grand Total</span>
                    <span className="total-value">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-ghost btn-lg" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handleCreate} disabled={loading}>
                  {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Creating Invoice...</> : '✓ Create Invoice'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
