-- Create profiles table to extend auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now()
);

-- Create accounts table (each user has a main account with balance)
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  balance decimal(15, 2) default 1000.00,
  institution_name text default 'Pix+ Bank',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create pix_keys table
-- Simplified unique constraint - will use application-level validation and trigger for single-use key types
create table if not exists public.pix_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  key_type text not null check (key_type in ('phone', 'email', 'cpf', 'random')),
  key_value text not null,
  created_at timestamp with time zone default now(),
  unique(user_id, key_value)
);

-- Create transactions table
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  amount decimal(15, 2) not null check (amount > 0),
  description text,
  status text default 'completed' check (status in ('pending', 'completed', 'failed')),
  pix_key_used text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.pix_keys enable row level security;
alter table public.transactions enable row level security;

-- RLS Policies for profiles
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);

-- RLS Policies for accounts
create policy "Users can view their own account" on public.accounts for select using (auth.uid() = user_id);
create policy "Users can update their own account" on public.accounts for update using (auth.uid() = user_id);
create policy "Users can insert their own account" on public.accounts for insert with check (auth.uid() = user_id);

-- RLS Policies for pix_keys
create policy "Users can view their own pix keys" on public.pix_keys for select using (auth.uid() = user_id);
create policy "Users can create pix keys" on public.pix_keys for insert with check (auth.uid() = user_id);
create policy "Users can delete their pix keys" on public.pix_keys for delete using (auth.uid() = user_id);

-- RLS Policies for transactions
create policy "Users can view their transactions" on public.transactions for select 
  using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users can create transactions" on public.transactions for insert 
  with check (auth.uid() = sender_id);

-- Create trigger to enforce single phone, email, and cpf per user
create or replace function public.enforce_single_use_keys()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Check if user already has a key of this type for single-use key types
  if new.key_type in ('phone', 'email', 'cpf') then
    if exists (
      select 1 from public.pix_keys 
      where user_id = new.user_id 
      and key_type = new.key_type 
      and id != new.id
    ) then
      raise exception 'User already has a % pix key', new.key_type;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_single_use_keys_trigger on public.pix_keys;

create trigger enforce_single_use_keys_trigger
  before insert or update on public.pix_keys
  for each row
  execute function public.enforce_single_use_keys();

-- Create trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  
  insert into public.accounts (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
