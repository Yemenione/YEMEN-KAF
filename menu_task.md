# Dynamic Menu Implementation

## 1. Database

We will use `StoreConfig` with key `menu_main` to store the JSON structure:

```json
[
  { "label": "Home", "href": "/" },
  { "label": "Shop", "href": "/shop" },
  { "label": "Our Story", "href": "/story" }
]
```

## 2. API

- `GET /api/config/menu` (Public) -> returns parsed JSON.
- `POST /api/admin/config` (Admin) -> saves JSON string.

## 3. Admin UI

- Add `MenuEditor` to `admin-portal/settings/page.tsx` (Menus Tab).
- Simple "Add Link", "Remove Link", "Reorder" interface.

## 4. Frontend

- Update `Navbar.tsx` to `useEffect` fetch the menu (or Server Component fetch).
