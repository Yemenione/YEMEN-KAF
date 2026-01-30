
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

## Phase 11: Application Deployment & Migration

- [x] Database Migration (Hostinger -> LWS) <!-- id: 110 -->
  - [x] Verify connectivity to old database <!-- id: 111 -->
  - [x] Dump data from old database <!-- id: 112 -->
  - [x] Import data to new database <!-- id: 113 -->
- [/] Application Deployment <!-- id: 120 -->
  - [/] Build application for production <!-- id: 121 -->
  - [/] Configure Node.js environment on LWS <!-- id: 122 -->
  - [/] Upload and start application <!-- id: 123 -->

## Phase 12: UI Polish & Adjustments

- [x] Relocating Marquee Below Navbar <!-- id: 130 -->
  - [x] Research current `TopMarquee` positioning in `Navbar.tsx` <!-- id: 131 -->
  - [x] Create implementation plan for relocation <!-- id: 132 -->
  - [x] Move `TopMarquee` component below `<nav>` in `Navbar.tsx` <!-- id: 133 -->
  - [x] Verify marquee positioning and behavior during scroll <!-- id: 134 -->
- [x] Improving UI and Product Display <!-- id: 135 -->
  - [x] Research image path inconsistencies and UI bottlenecks <!-- id: 136 -->
  - [x] Create implementation plan for UI polish <!-- id: 137 -->
  - [x] Standardize image resolution logic in `ProductCard` and `HeroSlider` <!-- id: 138 -->
  - [x] Enhance aesthetics of `HeroSlider` and `ProductCard` <!-- id: 139 -->
  - [x] Final visual audit and spacing adjustments <!-- id: 140 -->
- [x] Global UI Synchronization <!-- id: 141 -->
  - [x] Create shared `getMainImage` utility <!-- id: 142 -->
  - [x] Sync Navbar MegaMenu with shared utility <!-- id: 143 -->
  - [x] Refactor all shop components to use shared utility <!-- id: 144 -->
  - [x] Standardize Product Detail and Shop Listing pages <!-- id: 145 -->
  - [x] Final site-wide consistency check <!-- id: 146 -->
- [x] Full-Screen Hero and Transparent Header <!-- id: 147 -->
  - [x] Research current layout and constraints <!-- id: 148 -->
  - [x] Implement transparent header logic <!-- id: 149 -->
  - [x] Refactor `HeroSlider` for full-screen display <!-- id: 150 -->
  - [x] Fix LanguageSelector visibility and ReferenceError <!-- id: 151 -->

## Phase 13: Housekeeping & Cleanup

- [x] Remove redundant documentation and temp files <!-- id: 161 -->
  - [x] Delete `menu_task.md` <!-- id: 162 -->
  - [x] Delete `README_DEPLOY.md` <!-- id: 163 -->

## Phase 14: Optimization & Health Check

- [ ] Fix Linting Errors (App & Scripts) <!-- id: 170 -->
- [ ] Verify Production Build (`npm run build`) <!-- id: 171 -->
- [ ] Performance Optimization (Images, Caching) <!-- id: 172 -->
- [ ] Comprehensive Functional Testing <!-- id: 173 -->
