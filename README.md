# LogiEdge Billing Dashboard

A full-stack billing web application built with React, Node.js/Express, and PostgreSQL.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React JS (CRA), Custom CSS |
| Backend | Node.js, Express JS |
| Database | PostgreSQL |

---

## 📁 Project Structure

```
logedge-billing/
├── frontend/          # React JS app
│   ├── public/
│   └── src/
│       ├── components/   # Reusable components
│       ├── pages/        # Dashboard, Customers, Items, Billing
│       └── utils/        # API calls, formatters
├── backend/           # Node.js + Express API
│   ├── db/
│   │   ├── index.js      # PostgreSQL pool
│   │   └── schema.sql    # ← Run this to set up DB
│   ├── routes/           # customers, items, invoices
│   └── server.js
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. PostgreSQL Database

Create a database and run the schema script:

```bash
psql -U postgres -c "CREATE DATABASE logedge_billing;"
psql -U postgres -d logedge_billing -f backend/db/schema.sql
```

This will create all tables and seed the master data (5 customers, 7 items).

---

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npm install
npm run dev
```

Backend runs on: `http://localhost:5000`

**API Endpoints:**
- `GET /api/customers` — List all customers
- `POST /api/customers` — Create customer
- `GET /api/items` — List all items
- `POST /api/items` — Create item
- `GET /api/invoices` — List invoices (supports `?search=INVC...`)
- `POST /api/invoices` — Create invoice
- `GET /api/invoices/stats/summary` — Dashboard stats
- `GET /api/invoices/:id` — Get specific invoice

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start


Frontend runs on: `http://localhost:3000`

> The `proxy` field in `frontend/package.json` routes API calls to `localhost:5000`.

---

## 🎯 Modules

### Master Module
- **Customers**: View all customers with Active/Inactive filter, add new customers (name, address, PAN, GST, status)
- **Items**: View product catalog, add new items (name, price, status)

### Billing Module
Three-step invoice creation flow:
1. **Select Customer** — shows only active customers
2. **Select Items** — pick items and set quantity with live order summary
3. **Review & Create** — full invoice preview with GST calculation

**GST Logic:**
- Customer has GST number → no GST applied
- Customer without GST number → 18% GST added to subtotal

**Invoice ID** is auto-generated: `INVC` + 6 random digits (e.g. `INVC224830`)

### Dashboard Module
- Overview stats: total invoices, revenue, customers, avg. invoice value
- Full invoice list table
- Search by Invoice ID
- Click any row to view full invoice details

## 🗄️ Database Schema

```
customers       → cust_id, cust_name, address, pan, gst, is_active
items           → item_code, item_name, selling_price, is_active
invoices        → invoice_id, cust_id, subtotal, gst_applied, gst_amount, total_amount
invoice_items   → id, invoice_id, item_code, quantity, unit_price, line_total
```

---

## 📝 Notes
- Remove `node_modules` before pushing to GitHub
- `.env` is gitignored — use `.env.example` as reference
