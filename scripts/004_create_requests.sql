-- Create payment_requests table
create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  amount decimal(15, 2) not null check (amount > 0),
  description text,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.payment_requests enable row level security;

-- RLS Policies for payment_requests
create policy "Users can view requests they sent or received" on public.payment_requests 
  for select using (auth.uid() = requester_id or auth.uid() = receiver_id);

create policy "Users can create payment requests" on public.payment_requests 
  for insert with check (auth.uid() = requester_id);

create policy "Users can update requests they received" on public.payment_requests 
  for update using (auth.uid() = receiver_id);

create policy "Users can delete requests they sent" on public.payment_requests 
  for delete using (auth.uid() = requester_id);

-- Create index for efficient querying of pending requests
create index if not exists idx_payment_requests_receiver_status 
  on public.payment_requests(receiver_id, status) 
  where status = 'pending';

