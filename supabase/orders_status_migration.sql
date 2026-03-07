-- Run this if your orders table already exists and status updates to
-- 'Cancelled' or 'Return Or Refund' are reverting.

alter table public.orders
    drop constraint if exists orders_status_check;

alter table public.orders
    add constraint orders_status_check
    check (status in (
        'Pending',
        'Processing',
        'Shipped',
        'Delivered',
        'Cancelled',
        'Return Or Refund'
    ));
