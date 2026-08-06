<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Overview & Domain
- **Brand Name:** Estambay Moto Rentals
- **Objective:** Build a motorcycle rental website with a complete admin dashboard for fleet and booking management.
- **Core Features:**
    - Customer Booking & Reservations
    - Booking Management
    - Vehicle Management
    - Vehicle Colors Management
    - Payment Methods Management

# Role & Permission Rules
- **Public (Unauthenticated):**
    - Can view the landing page, browse available vehicles, and submit booking requests.
- **Admin (Authenticated):**
    - Has access to the Admin Dashboard.
    - Full CRUD operations on Vehicles, Vehicle Colors, Payment Methods, and Booking status updates.
    - *Note:* Authenticated admin accounts do not create public customer bookings through the admin portal.

# Core Tech Stack
- **Framework:** Next.js (App Router only — **do not** create files in `pages/`)
- **Language:** TypeScript (Strict mode, no `any` types allowed)
- **Styling:** Tailwind CSS + `shadcn/ui`
- **Database / Auth:** Supabase (`@supabase/ssr` for server-side auth/data)
- **Icons:** `lucide-react` and `react-icons` (Do not install or import alternative icon libraries)

# Database Design
```dbml
Table vehicles {
  id int8 [pk, unique, not null]
  model text [not null]
  year_model int8 [not null]
  daily_price numeric [not null]
  half_day_price numeric [not null]
  hourly_price numeric [not null]
  image text [not null]

  /*
  Status:
    Available = 1
    Under Maintenance = 2
  */
  status int4 [not null, default: 1]
}

Table vehicle_colors {
  id int8 [pk, unique, not null]
  vehicle_id int8 [not null]
  name text [not null]
}
Ref: vehicle_colors.vehicle_id > vehicles.id [delete: cascade, update: set null]

Table bookings {
  id int8 [pk, unique, not null]
  vehicle_id int8 [not null]
  
  number_of_days_rent int8 [not null]
  
  rental_date date [not null]
  time_of_rental timestamp [not null]
  
  return_date date [not null]
  time_of_return timestamp [not null]
  
  full_name text [not null]
  phone_number text [not null]
  facebook_account text [not null]
  payment_method_id int8 [not null]
  payment_receipt_image text [not null]
  drivers_license_image text [not null]
  valid_id_image text [not null]

  /*
  Is delivery:
    No = 0
    Yes = 1
  */
  is_delivery int4 [not null, default: 0]
  address_for_delivery text [not null]
  delivery_fee numeric [not null]
  pickup_fee numeric [not null]

  amount numeric [not null]

  /*
  Booking status:
    Completed = 1
    Change Unit = 2
    Reserved = 3
    Rescheduled = 4
    Cancelled = 5
    On Going = 6
  */
  booking_status int4 [not null, default: 3]

  /*
  Payment status:
    Paid = 1
    Partially Paid = 2
    Pending = 3
  */
  payment_status int4 [not null, default: 3]
}
Ref: bookings.vehicle_id > vehicles.id [delete: set null, update: set null]
Ref: bookings.payment_method_id > payment_methods.id [delete: set null, update: set null]

Table payment_methods {
  id integer [pk, unique, not null]
  name text [not null]
  qr_code_image text [default: null]
}
```

# UI & Theming Rules
- Use `shadcn/ui` CSS variables and standard Tailwind utility classes.
- **Theme Mode:** Dark mode by default.
- **Root CSS Protection:** Never edit root CSS variables or color tokens in `globals.css` unless explicitly instructed.

# Directory Structure
- `@/src/app/` — Pages, layouts, and API route handlers **ONLY**
- `@/src/components/` — Shared feature components and UI modules
- `@/src/components/ui/` — Base `shadcn/ui` primitive components
- `@/src/components/layouts/` — Reusable layout structures (Navbars, Sidebars, Footers)
- `@/src/lib/` — Shared utilities, database queries, Supabase clients, and business logic

# Coding Standards & Best Practices
- **Separation of Concerns:** Keep business and database logic isolated from UI components. Place all queries, mutations, and Supabase client calls inside `@/src/lib/`.
- **Modularity:** Keep components single-purpose and concise (aim for under 150 lines). Break large components down into subcomponents.
- **Exports:**
    - Use `default export` for Next.js App Router pages/layouts.
    - Use `export const` (named exports) for standard React components, helpers, and utilities.
- **Naming Conventions:**
    - Functions/Variables: camelCase with clear intent (e.g., `fetchVehiclesByCategory`).
    - React Components / TS Interfaces: PascalCase.
- **Type Safety:** Explicitly define all props and return types using `interface`. Avoid `any` or loose type assertions (`as Type`).

# Strict Guardrails (DO NOT)
- ❌ **Secrets:** NEVER create, edit, delete, or output `.env`, secret keys, or credential files.
- ❌ **API Keys:** NEVER hardcode credentials. Always reference `process.env`.
- ❌ **Client Database Access:** NEVER execute raw database queries or make direct Supabase calls from Client Components (`'use client'`). Perform data fetching in Server Components, Server Actions, or API Routes.
- ❌ **Dependencies:** DO NOT run `npm install` or add new packages without explicit human permission.

# Antigravity CLI Guidelines
- **Verification:** Run `npm run lint` or `tsc --noEmit` before marking tasks as complete to verify zero TypeScript or lint errors.
- **File Edits:** Keep changes scoped precisely to requested tasks; do not reformat unrelated files or remove the mandatory Next.js header above.