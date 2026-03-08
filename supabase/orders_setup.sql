-- Orders table setup for Division Designs
-- Run in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete set null,
    order_code text not null unique,
    customer_name text not null,
    customer_email text not null,
    contact_number text,
    shipping_address text,
    payment_method text,
    items_summary text,
    line_items jsonb,
    total_amount numeric(12,2) not null default 0,
    status text not null default 'Pending'
        check (status in ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Or Refund')),
    order_date date not null default current_date,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_order_code on public.orders(order_code);
create index if not exists idx_orders_status on public.orders(status);

-- Keep updated_at current on updates.
create or replace function public.set_orders_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists trg_orders_set_updated_at on public.orders;
create trigger trg_orders_set_updated_at
before update on public.orders
for each row execute function public.set_orders_updated_at();

alter table public.orders enable row level security;

-- Read orders from admin UI and dashboards.
drop policy if exists "Orders are viewable by everyone" on public.orders;
create policy "Orders are viewable by everyone"
on public.orders
for select
using (true);

-- Checkout can insert orders even for non-authenticated users.
drop policy if exists "Anyone can create orders" on public.orders;
create policy "Anyone can create orders"
on public.orders
for insert
to anon, authenticated
with check (true);

-- Admin UI can update order status.
drop policy if exists "Anyone can update orders" on public.orders;
create policy "Anyone can update orders"
on public.orders
for update
to anon, authenticated
using (true)
with check (true);
