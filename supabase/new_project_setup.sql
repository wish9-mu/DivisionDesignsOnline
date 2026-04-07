-- ============================================================
-- Division Designs — Full Supabase Project Setup
-- Run this entire script in the SQL Editor of your NEW project.
-- ============================================================

-- Enable required extensions
create extension if not exists pgcrypto;


-- ============================================================
-- 1. PROFILES TABLE
--    Stores public user profile data linked to auth.users
-- ============================================================

create table if not exists public.profiles (
    id          uuid primary key references auth.users(id) on delete cascade,
    username    text,
    first_name  text,
    last_name   text,
    full_name   text,
    contact_number text,
    organization   text,
    delivery_address text,
    updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read their own profile
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
on public.profiles for select
using (auth.uid() = id);

-- Users can insert/update their own profile
drop policy if exists "Users can upsert their own profile" on public.profiles;
create policy "Users can upsert their own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id);


-- ============================================================
-- 2. PRODUCTS TABLE
--    Admin-managed inventory of lanyard products
-- ============================================================

create table if not exists public.products (
    id          uuid primary key default gen_random_uuid(),
    name        text not null,
    type        text not null default 'Standard Lanyards',
    price       numeric not null,
    tag         text default 'New',
    stock       integer default 0,
    image_url   text,
    description text,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

alter table public.products enable row level security;

-- Anyone can read products (storefront)
drop policy if exists "Products are viewable by everyone" on public.products;
create policy "Products are viewable by everyone"
on public.products for select
using (true);

-- Only authenticated users (admins) can insert
drop policy if exists "Users can insert products" on public.products;
create policy "Users can insert products"
on public.products for insert
with check (auth.role() = 'authenticated');

-- Only authenticated users (admins) can update
drop policy if exists "Users can update products" on public.products;
create policy "Users can update products"
on public.products for update
using (auth.role() = 'authenticated');

-- Only authenticated users (admins) can delete
drop policy if exists "Users can delete products" on public.products;
create policy "Users can delete products"
on public.products for delete
using (auth.role() = 'authenticated');


-- ============================================================
-- 3. ORDERS TABLE
--    Standard (checkout) orders placed by customers
-- ============================================================

create table if not exists public.orders (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid references auth.users(id) on delete set null,
    order_code      text not null unique,
    customer_name   text not null,
    customer_email  text not null,
    contact_number  text,
    shipping_address text,
    payment_method  text,
    items_summary   text,
    line_items      jsonb,
    total_amount    numeric(12,2) not null default 0,
    status          text not null default 'Pending'
        check (status in ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Or Refund')),
    order_date      date not null default current_date,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

create index if not exists idx_orders_created_at  on public.orders(created_at desc);
create index if not exists idx_orders_order_code  on public.orders(order_code);
create index if not exists idx_orders_status      on public.orders(status);
create index if not exists idx_orders_user_id     on public.orders(user_id);

-- Shared auto-update function for updated_at (used by all tables below)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists trg_orders_set_updated_at on public.orders;
create trigger trg_orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

alter table public.orders enable row level security;

drop policy if exists "Orders are viewable by everyone" on public.orders;
create policy "Orders are viewable by everyone"
on public.orders for select
using (true);

drop policy if exists "Anyone can create orders" on public.orders;
create policy "Anyone can create orders"
on public.orders for insert
to anon, authenticated
with check (true);

drop policy if exists "Anyone can update orders" on public.orders;
create policy "Anyone can update orders"
on public.orders for update
to anon, authenticated
using (true)
with check (true);


-- ============================================================
-- 4. CUSTOM ORDERS TABLE
--    Custom lanyard requests submitted via the Custom Orders page
-- ============================================================

create table if not exists public.custom_orders (
    id                  uuid primary key default gen_random_uuid(),
    user_id             uuid references auth.users(id) on delete set null,
    reference_id        text not null unique,
    org_name            text not null,
    contact_email       text not null,
    quantity            integer not null default 1,
    lanyard_type        text,
    design_description  text,
    status              text not null default 'Pending Review',
    file_url            text,
    appointment_date    date,
    appointment_time    text,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now()
);

create index if not exists idx_custom_orders_reference_id on public.custom_orders(reference_id);
create index if not exists idx_custom_orders_user_id      on public.custom_orders(user_id);
create index if not exists idx_custom_orders_created_at   on public.custom_orders(created_at desc);

drop trigger if exists trg_custom_orders_set_updated_at on public.custom_orders;
create trigger trg_custom_orders_set_updated_at
before update on public.custom_orders
for each row execute function public.set_updated_at();

alter table public.custom_orders enable row level security;

drop policy if exists "Custom orders viewable by everyone" on public.custom_orders;
create policy "Custom orders viewable by everyone"
on public.custom_orders for select
using (true);

drop policy if exists "Anyone can create custom orders" on public.custom_orders;
create policy "Anyone can create custom orders"
on public.custom_orders for insert
to anon, authenticated
with check (true);

drop policy if exists "Admin can update custom orders" on public.custom_orders;
create policy "Admin can update custom orders"
on public.custom_orders for update
to anon, authenticated
using (true)
with check (true);


-- ============================================================
-- 5. APPOINTMENTS TABLE
--    Booked time slots linked to custom order submissions
-- ============================================================

create table if not exists public.appointments (
    id                  uuid primary key default gen_random_uuid(),
    user_id             uuid references auth.users(id) on delete set null,
    full_name           text,
    email               text,
    phone               text,
    appointment_type    text,
    appointment_date    date not null,
    appointment_time    text not null,
    notes               text,
    status              text not null default 'Scheduled',
    appointment_code    text,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now(),
    -- Prevent double-booking the same slot
    unique (appointment_date, appointment_time)
);

create index if not exists idx_appointments_date on public.appointments(appointment_date);
create index if not exists idx_appointments_user_id on public.appointments(user_id);

drop trigger if exists trg_appointments_set_updated_at on public.appointments;
create trigger trg_appointments_set_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

alter table public.appointments enable row level security;

-- Anyone can read appointment slots (to check availability on booking form)
drop policy if exists "Appointments are viewable by everyone" on public.appointments;
create policy "Appointments are viewable by everyone"
on public.appointments for select
using (true);

drop policy if exists "Anyone can create appointments" on public.appointments;
create policy "Anyone can create appointments"
on public.appointments for insert
to anon, authenticated
with check (true);

drop policy if exists "Admin can update appointments" on public.appointments;
create policy "Admin can update appointments"
on public.appointments for update
to anon, authenticated
using (true)
with check (true);


-- ============================================================
-- 6. STORAGE BUCKETS
--    Create these in: Storage > New Bucket in the dashboard,
--    OR run via Supabase CLI / Storage API.
--
--    Bucket 1: product-images   (public)
--      - Used by AdminProducts to store product photos.
--
--    Bucket 2: custom-order-files  (public)
--      - Used by CustomOrdersPage for uploaded reference files.
--
-- NOTE: SQL cannot directly create storage buckets.
-- After running this script, go to:
--   Supabase Dashboard > Storage > Create a new bucket
-- and create both buckets listed above (set Public = true for each).
-- ============================================================


-- ============================================================
-- 7. SAMPLE PRODUCTS (optional — remove block if not needed)
-- ============================================================

insert into public.products (name, type, price, tag, stock) values
    ('Classic Black Lanyard',     'Standard Lanyards', 120,  'Bestseller', 84),
    ('Woven Red Lanyard',         'Standard Lanyards', 150,  'New',        56),
    ('Reversible Reds',           'Standard Lanyards', 210,  'Featured',   32),
    ('Full-Color Print Lanyard',  'Custom Lanyards',   280,  'Custom',      0),
    ('Embroidered Logo Lanyard',  'Custom Lanyards',   320,  'Custom',      0),
    ('Dye-Sublimation Lanyard',   'Custom Lanyards',   350,  'Premium',    18)
on conflict do nothing;
