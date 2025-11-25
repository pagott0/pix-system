create table if not exists public.monthly_budgets (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    month_year date not null,
    amount numeric(15, 2) not null check (amount > 0),
    description text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    constraint monthly_budgets_user_month_unique unique (user_id, month_year)
  );

  alter table public.monthly_budgets enable row level security;

  create policy "Users can view their monthly budget"
    on public.monthly_budgets for select
    using (auth.uid() = user_id);

  create policy "Users can insert their monthly budget"
    on public.monthly_budgets for insert
    with check (auth.uid() = user_id);

  create policy "Users can update their monthly budget"
    on public.monthly_budgets for update
    using (auth.uid() = user_id);

  create policy "Users can delete their monthly budget"
    on public.monthly_budgets for delete
    using (auth.uid() = user_id);
