-- Add category column to transactions table
alter table public.transactions 
add column if not exists category text;

