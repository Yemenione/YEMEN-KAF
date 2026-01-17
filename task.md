
# Tasks: Admin Portal Master Plan

- [x] Phase 1: Advanced Catalog & PIM <!-- id: 40 -->
  - [x] Schema Upgrade (Attributes, Brands, Suppliers) <!-- id: 41 -->
  - [x] Schema Upgrade 2.0 (SEO, Hierarchy) <!-- id: 41-b -->
  - [x] Smart CSV Import (Mapping UI, Validation) <!-- id: 42 -->
  - [x] Stock Management (Movements, Alerts) <!-- id: 43 -->
  - [x] Bulk Product Upload UI <!-- id: 63 -->
  - [x] Category Management (CRUD, Images, Hierarchy, SEO) <!-- id: 64 -->
  - [x] Attributes & Features (Colors, Sizes) <!-- id: 65 -->
  - [x] Brands & Suppliers Management <!-- id: 66 -->
  - [x] Product Variants (Generation, Stock, Prices) <!-- id: 66-b -->
- [x] Phase 2: Design & Media Center <!-- id: 44 -->
  - [x] Media Library (Uploads, Image Manager) <!-- id: 45 -->
  - [x] CMS Page Builder (Rich Text, SEO) <!-- id: 46 -->
  - [x] Homepage/Theme Manager (Hooks) <!-- id: 47 -->
  - [x] Menu & Navigation Builder <!-- id: 67 -->
- [x] Phase 3: CRM & Service <!-- id: 48 -->
  - [x] Customer Groups & Pricing <!-- id: 49 -->
  - [x] Support Ticket System <!-- id: 50 -->
  - [x] RMA / Returns Manager <!-- id: 51 -->
- [x] Phase 4: Order Management (OMS) <!-- id: 52 -->
  - [x] PDF Invoicing & Packing Slips <!-- id: 53 -->
  - [x] Detailed Order Workflow (Timeline) <!-- id: 54 -->
  - [x] Manual Order Entry (Admin POS) <!-- id: 55 -->
  - [x] Shipping & Carriers (Zones, Costs) <!-- id: 68 -->
  - [x] Payment Methods Configuration <!-- id: 69 -->
- [x] Phase 5: International & Localization <!-- id: 56 -->
  - [x] Languages & Translations UI <!-- id: 57 -->
  - [x] Currencies & Exchange Rates <!-- id: 58 -->
  - [x] Tax Rules & Geolocation <!-- id: 59 -->
- [x] Phase 6: Marketing & Analytics <!-- id: 60 -->
  - [x] Cart Rules (Coupons) & Catalog Rules <!-- id: 61 -->
  - [x] Advanced Dashboard Analytics <!-- id: 62 -->
- [x] Phase 7: System & Access Control <!-- id: 70 -->
  - [x] Admin Management (Roles & ACL) <!-- id: 71 -->
  - [x] System Logs & Audits <!-- id: 72 -->
- [x] Phase 8: Global Settings Integration <!-- id: 80 -->
  - [x] Core Settings Manager <!-- id: 81 -->
  - [x] Integrate Site Name & Logo in Navbar <!-- id: 82 -->
  - [x] Integrate Contact Info & Socials in Footer <!-- id: 83 -->
  - [x] Dynamic Primary Color & SEO <!-- id: 84 -->
  - [x] Homepage Hero & Menu Builder <!-- id: 85 -->

## Phase 9: System Hardening & Catalog Preparation (Colissimo Readiness)

- [x] Resolving Prisma EPERM Error (Windows Lock) <!-- id: 91 -->
- [x] Catalog Meta Data Expansion (HS Code, Origin, Dimensions) <!-- id: 92 -->
  - [x] Update Prisma Schema with Logistics fields <!-- id: 93 -->
  - [x] Add `tracking_number` to Order model <!-- id: 94 -->
- [x] Admin API Security Audit <!-- id: 95 -->
  - [x] Refactor `/api/products` for strict Admin middleware <!-- id: 96 -->

## Phase 10: Logistics & Colissimo Integration

- [x] Create `/lib/shipping/colissimo.ts` API Driver <!-- id: 101 -->
- [x] Implement Dynamic Shipping Rates in Checkout <!-- id: 102 -->
- [x] One-Click Label & Customs Form Generation <!-- id: 103 -->
- [x] Automated Tracking Emails (Resend Integration) <!-- id: 104 -->
