-- Create scheduled_payments table
create table if not exists public.scheduled_payments (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  receiver_pix_key text not null,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  amount decimal(15, 2) not null check (amount > 0),
  description text,
  category text,
  scheduled_date date not null,
  status text default 'pending' check (status in ('pending', 'completed', 'cancelled', 'failed')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.scheduled_payments enable row level security;

-- RLS Policies for scheduled_payments
create policy "Users can view their own scheduled payments" on public.scheduled_payments 
  for select using (auth.uid() = sender_id);

create policy "Users can create scheduled payments" on public.scheduled_payments 
  for insert with check (auth.uid() = sender_id);

create policy "Users can update their own scheduled payments" on public.scheduled_payments 
  for update using (auth.uid() = sender_id);

create policy "Users can delete their own scheduled payments" on public.scheduled_payments 
  for delete using (auth.uid() = sender_id);

-- Create index for efficient querying of due payments
create index if not exists idx_scheduled_payments_date_status 
  on public.scheduled_payments(scheduled_date, status) 
  where status = 'pending';

