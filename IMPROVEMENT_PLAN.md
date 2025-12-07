# Family Property Manager - Improvement Plan

## Your Requirements

Based on your input:
- **Property:** Single rental property in Sacramento (scalable to multiple later)
- **Priority:** All features - tax transparency, quarterly reports, document storage
- **Sync:** Raspberry Pi home server (you're already planning this)
- **Users:** Family LLC stakeholders who need full transparency

---

## Architecture Decision: Raspberry Pi Backend

**Why Pi over Firebase:**
- Full data ownership (no Google dependency)
- One-time setup, no recurring costs
- Works on your local network or exposed via Cloudflare Tunnel
- You control the backups
- Already in your plans

**Stack for Pi:**
- Backend: Node.js + Express + SQLite (lightweight, perfect for Pi)
- Frontend: This React app (unchanged, just points to Pi API)
- Sync: Real-time via API calls

---

## Implementation Plan

### PHASE 1: Tax & Transparency Features (Week 1)

These make the app immediately useful for all stakeholders:

#### 1.1 Settings & Data Management Page
- Full JSON export/import (immediate backup solution)
- Clear all data option
- API endpoint configuration (for when Pi is ready)

#### 1.2 Enhanced Tax Categorization
Update transaction categories to align with Schedule E:
- Advertising
- Auto and travel
- Cleaning and maintenance
- Commissions
- Insurance
- Legal and professional fees
- Management fees
- Mortgage interest
- Other interest
- Repairs
- Supplies
- Taxes (property)
- Utilities
- Depreciation (auto-calculated)

#### 1.3 Property Details Page
- Property address, purchase price, date
- Cost basis (for depreciation)
- Current estimated value
- Property type, year built
- Support for MULTIPLE properties (future-proof)

#### 1.4 Distribution Tracker
- Calculate net income by period
- Split by ownership percentage
- Track actual distributions paid
- Show running balance per member
- Generate K-1 summary data

---

### PHASE 2: Reporting & Documents (Week 2)

#### 2.1 Enhanced Quarterly Reports
- Income statement by quarter
- Cash flow summary
- Member contribution summary
- Distribution summary
- Expense breakdown by Schedule E category
- **PDF export** for sharing

#### 2.2 Annual Tax Package
Generate year-end package with:
- Full year income/expense by category
- Depreciation schedule
- K-1 allocation worksheet
- Capital account summary per member

#### 2.3 Document Enhancements
- Link documents to transactions (receipts)
- Link documents to properties (deeds, insurance)
- Document categories: Tax, Legal, Insurance, Receipts, Other
- Expiration date tracking (insurance renewals)

---

### PHASE 3: Raspberry Pi Backend (Week 3)

#### 3.1 Simple REST API
```
POST /api/sync - Push all local data
GET  /api/sync - Pull latest data
GET  /api/data/:entity - Get specific entity
POST /api/data/:entity - Create/update entity
```

#### 3.2 SQLite Database
- Same data model as localStorage
- Automatic backups to USB/cloud
- Simple admin interface

#### 3.3 Frontend Sync Mode
- Toggle between "Local Only" and "Synced" mode
- Auto-sync on changes when connected
- Offline support with sync on reconnect

---

### PHASE 4: Multi-Property Support (Week 4)

#### 4.1 Property Selector
- Add property dropdown in header
- Filter all data by selected property
- "All Properties" view for portfolio overview

#### 4.2 Portfolio Dashboard
- Combined net income across properties
- Property comparison metrics
- Aggregate reports

---

## Database Schema (for Pi Backend)

```sql
-- Properties (multi-property ready)
properties: id, name, address, city, state, zip,
            purchase_date, purchase_price, cost_basis,
            current_value, property_type, year_built, notes

-- Members (unchanged)
members: id, name, role, ownership_percentage, email, phone

-- Transactions (add property_id, tax_category)
transactions: id, property_id, type, category, tax_category,
              amount, date, description, vendor, receipt_url,
              quarter, year

-- Contributions (add property_id)
contributions: id, property_id, member_id, amount,
               contribution_type, date, description, quarter, year

-- Distributions (NEW)
distributions: id, property_id, member_id, amount, date,
               period, description, method

-- Documents (add property_id, expiration)
documents: id, property_id, name, category, file_url,
           description, expiration_date, linked_transaction_id
```

---

## Immediate Next Steps

Ready to implement? Here's the order:

| Step | Feature | Why First |
|------|---------|-----------|
| 1 | Settings page + JSON export/import | Backup & share NOW |
| 2 | Property Details page | Foundation for everything |
| 3 | Tax-aligned categories | Schedule E compliance |
| 4 | Distribution tracker | Core LLC transparency |
| 5 | Enhanced quarterly reports | Stakeholder communication |
| 6 | Pi backend setup | Real-time family sync |

---

## Ready to Start?

Approve this plan and I'll begin with Phase 1 - the Settings page with full data export/import, so you can immediately start sharing data with your brother-in-law while we build out the rest.
