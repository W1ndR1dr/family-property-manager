# F Street Property Tracker - What's New

## From Basic Tracker to Full LLC Management Platform

This document outlines the significant improvements made to transform the F Street Property Tracker from a basic expense tracker into a comprehensive LLC property management and tax preparation tool.

---

## Key Improvements at a Glance

| Before | After |
|--------|-------|
| Cloud-dependent (Base44) | **Standalone** - works offline, you own your data |
| Basic expense categories | **IRS Schedule E aligned** categories for tax prep |
| No tax reporting | **Full tax summary** with Schedule E breakdown |
| Manual PDF creation | **One-click PDF export** for professional reports |
| Simple document storage | **Smart document hub** with expiration alerts |
| No profit distribution tracking | **K-1 allocation worksheets** for each member |
| No data portability | **JSON export/import** for backup & sharing |

---

## New Features

### 1. Complete Data Independence

**Problem Solved:** The original app required a cloud service (Base44) that could change pricing, go offline, or access your financial data.

**Solution:**
- All data stored locally in your browser
- Full JSON export/import for backups
- Share data files directly with family members
- Ready for future Raspberry Pi self-hosted sync

```
Settings → Export All Data → Share JSON file → Family member imports
```

---

### 2. IRS Schedule E Integration

**Problem Solved:** At tax time, you had to manually categorize expenses to match Schedule E line items.

**Solution:** Transaction categories now align directly with IRS Schedule E:

| Schedule E Line | Categories |
|-----------------|------------|
| Line 3 | Rent, Late Fees, Pet Fees, Parking, Laundry |
| Line 5 | Advertising |
| Line 7 | Cleaning & Maintenance |
| Line 9 | Insurance |
| Line 10 | Legal & Professional Fees |
| Line 11 | Management Fees |
| Line 12 | Mortgage Interest |
| Line 14 | Repairs |
| Line 15 | Supplies |
| Line 16 | Property Taxes |
| Line 17 | Utilities |
| Line 19 | HOA, Landscaping, Pest Control, Other |

**Benefit:** Hand your accountant a report that maps directly to tax forms.

---

### 3. Tax Summary Dashboard

**Problem Solved:** No consolidated view of tax-relevant information for the year.

**Solution:** New **Tax Summary** tab in Reports showing:

- **Gross Income** - Total rental income by Schedule E category
- **Total Expenses** - Broken down by Schedule E line items
- **Net Income/Loss** - Calculated automatically
- **K-1 Allocation Worksheet** - Each member's share based on ownership %
- **Capital Account Changes** - Contributions + Income - Distributions

**Benefit:** Generate K-1 supporting documentation in seconds, not hours.

---

### 4. Distribution Tracker

**Problem Solved:** No way to track profit distributions to LLC members or reconcile capital accounts.

**Solution:** New **Distributions** page with:

- Record distributions by member with payment method
- Automatic profit allocation based on ownership percentages
- Running capital account balance per member
- Year-over-year comparison
- K-1 summary showing: Allocated Income, Contributions, Distributions, Capital Change

**Benefit:** Complete transparency for all LLC members on their share of profits.

---

### 5. Professional PDF Reports

**Problem Solved:** Creating shareable reports required manual formatting in Word/Excel.

**Solution:** One-click **Print / Save as PDF** that generates:

- Executive summary with key metrics
- Schedule E Income breakdown
- Schedule E Expense breakdown
- K-1 Allocation by member
- Member contribution summary
- Professional formatting ready to share

**Benefit:** Quarterly stakeholder updates take 30 seconds instead of 30 minutes.

---

### 6. Smart Document Hub

**Problem Solved:** Documents stored without organization, no way to track expiring insurance or leases.

**Solution:** Enhanced document management with:

**New Categories:**
- Tax Documents (returns, K-1s, depreciation)
- Legal (LLC docs, contracts)
- Insurance (policies, certificates)
- Receipts (expense documentation)
- Leases (tenant agreements)
- Property (deeds, inspections)
- Mortgage (loan documents)

**Expiration Tracking:**
- Set expiration dates on insurance policies, leases
- Visual alerts when documents expire or are expiring soon
- Dashboard showing documents requiring attention

**Receipt Linking:**
- Connect receipt documents to specific expense transactions
- Build audit trail for tax deductions

**Benefit:** Never miss an insurance renewal or lease expiration again.

---

### 7. Property Details Page

**Problem Solved:** No central place to record property information needed for taxes.

**Solution:** New **Property** page capturing:

- Property address and type
- Purchase price and date (for depreciation basis)
- Current estimated value
- Appreciation tracking
- Multi-property ready architecture

**Benefit:** All property info in one place for tax prep and estate planning.

---

## For Family Stakeholders

### What This Means For You

**Transparency:** Every member can see exactly how the property is performing and their share of income/losses.

**Tax Preparation:**
- Schedule E data ready to hand to your accountant
- K-1 allocation worksheets pre-calculated
- Receipt documentation linked and organized

**Peace of Mind:**
- Insurance expiration alerts
- Lease renewal reminders
- Complete audit trail

**Collaboration:**
- Export/import data to share updates
- Everyone works from the same numbers
- No more spreadsheet version confusion

---

## Technical Improvements

- **Offline-first:** Works without internet
- **Data ownership:** Your data stays on your devices
- **Future-ready:** Architecture supports Raspberry Pi self-hosting
- **Multi-property ready:** Add more properties when needed

---

## Getting Started

1. **Update the app:** `git pull` to get latest changes
2. **Run locally:** `npm run dev`
3. **Import existing data:** Settings → Import JSON
4. **Explore new features:** Check Tax Summary, Distributions, Documents tabs

---

## What's Next (Roadmap)

- **Phase 3:** Raspberry Pi backend for real-time family sync
- **Phase 4:** Multi-property portfolio management
- **Future:** Bank transaction import, automated categorization

---

*Built for the F Street LLC by the family, for the family.*
