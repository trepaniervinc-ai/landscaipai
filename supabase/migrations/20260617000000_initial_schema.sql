-- ─── Enable Extensions ───────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  email             text not null,
  full_name         text,
  avatar_url        text,
  user_type         text check (user_type in ('landscaper', 'homeowner', 'admin')),
  credits_balance   integer not null default 0,
  stripe_customer_id text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using ((select auth.uid()) = id);

create policy "Users can update own profile"
  on public.profiles for update
  using ((select auth.uid()) = id);

-- ─── projects ─────────────────────────────────────────────────────────────────
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  share_slug  text unique,
  is_shared   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Owners can CRUD projects"
  on public.projects for all
  using ((select auth.uid()) = user_id);

create policy "Public can view shared projects"
  on public.projects for select
  using (is_shared = true);

-- ─── images ──────────────────────────────────────────────────────────────────
create table if not exists public.images (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  thumb_path   text,
  file_name    text not null,
  file_size    integer,
  mime_type    text,
  width        integer,
  height       integer,
  created_at   timestamptz not null default now()
);

alter table public.images enable row level security;

create policy "Owners can CRUD images"
  on public.images for all
  using ((select auth.uid()) = user_id);

create policy "Public can view images in shared projects"
  on public.images for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.is_shared = true
    )
  );

-- ─── generations ─────────────────────────────────────────────────────────────
create table if not exists public.generations (
  id              uuid primary key default gen_random_uuid(),
  image_id        uuid not null references public.images(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  parent_gen_id   uuid references public.generations(id),
  storage_path    text,
  status          text not null default 'pending'
                    check (status in ('pending', 'processing', 'completed', 'failed', 'refunded')),
  style_preset    text,
  time_of_day     text,
  season          text,
  weather         text,
  custom_prompt   text,
  is_inpainting   boolean not null default false,
  full_prompt     text,
  error_message   text,
  created_at      timestamptz not null default now(),
  completed_at    timestamptz
);

alter table public.generations enable row level security;

create policy "Owners can CRUD generations"
  on public.generations for all
  using ((select auth.uid()) = user_id);

create policy "Public can view generations in shared projects"
  on public.generations for select
  using (
    exists (
      select 1 from public.images i
      join public.projects p on p.id = i.project_id
      where i.id = image_id and p.is_shared = true
    )
  );

-- ─── credit_transactions ─────────────────────────────────────────────────────
create table if not exists public.credit_transactions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  amount          integer not null,
  type            text not null
                    check (type in ('signup', 'subscription', 'purchase', 'generation', 'refund')),
  description     text,
  generation_id   uuid references public.generations(id),
  stripe_payment_intent_id text,
  created_at      timestamptz not null default now()
);

alter table public.credit_transactions enable row level security;

create policy "Users can view own transactions"
  on public.credit_transactions for select
  using ((select auth.uid()) = user_id);

-- ─── subscriptions ───────────────────────────────────────────────────────────
create table if not exists public.subscriptions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  stripe_subscription_id text unique not null,
  stripe_price_id       text not null,
  plan                  text not null check (plan in ('starter', 'pro', 'business')),
  status                text not null,
  current_period_start  timestamptz,
  current_period_end    timestamptz,
  cancel_at_period_end  boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscription"
  on public.subscriptions for select
  using ((select auth.uid()) = user_id);

-- ─── processed_stripe_events ─────────────────────────────────────────────────
create table if not exists public.processed_stripe_events (
  stripe_event_id text primary key,
  event_type      text not null,
  processed_at    timestamptz not null default now()
);

-- No RLS needed — service role only

-- ─── admin_settings ──────────────────────────────────────────────────────────
create table if not exists public.admin_settings (
  key         text primary key,
  value       text not null,
  description text,
  updated_at  timestamptz not null default now()
);

alter table public.admin_settings enable row level security;

create policy "Public can read settings"
  on public.admin_settings for select
  using (true);

create policy "Admins can update settings"
  on public.admin_settings for update
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and user_type = 'admin'
    )
  );

insert into public.admin_settings (key, value, description) values
  ('free_signup_credits', '3', 'Credits awarded to new users on signup'),
  ('max_image_upload_size_mb', '10', 'Maximum allowed image upload size in MB')
on conflict (key) do nothing;

-- ─── gallery_items ───────────────────────────────────────────────────────────
create table if not exists public.gallery_items (
  id             uuid primary key default gen_random_uuid(),
  generation_id  uuid references public.generations(id),
  storage_path   text,
  caption        text,
  style_preset   text,
  display_order  integer not null default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

alter table public.gallery_items enable row level security;

create policy "Public can view active gallery items"
  on public.gallery_items for select
  using (is_active = true);

create policy "Admins can manage gallery"
  on public.gallery_items for all
  using (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and user_type = 'admin'
    )
  );

-- ─── Postgres Functions ───────────────────────────────────────────────────────

create or replace function public.add_credits(
  p_user_id    uuid,
  p_amount     integer,
  p_type       text,
  p_description text default null
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_balance integer;
begin
  update profiles
    set credits_balance = credits_balance + p_amount,
        updated_at = now()
    where id = p_user_id
  returning credits_balance into v_new_balance;

  insert into credit_transactions (user_id, amount, type, description)
    values (p_user_id, p_amount, p_type, p_description);

  return json_build_object('success', true, 'new_balance', v_new_balance);
end;
$$;

create or replace function public.deduct_credit(
  p_user_id       uuid,
  p_generation_id uuid
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
begin
  select credits_balance into v_balance
    from profiles
    where id = p_user_id
    for update;

  if v_balance < 1 then
    return json_build_object('success', false, 'reason', 'insufficient_credits');
  end if;

  update profiles
    set credits_balance = credits_balance - 1,
        updated_at = now()
    where id = p_user_id;

  insert into credit_transactions (user_id, amount, type, generation_id)
    values (p_user_id, -1, 'generation', p_generation_id);

  return json_build_object('success', true, 'new_balance', v_balance - 1);
end;
$$;

create or replace function public.refund_credit(
  p_user_id       uuid,
  p_generation_id uuid
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_balance integer;
begin
  update profiles
    set credits_balance = credits_balance + 1,
        updated_at = now()
    where id = p_user_id
  returning credits_balance into v_new_balance;

  insert into credit_transactions (user_id, amount, type, generation_id, description)
    values (p_user_id, 1, 'refund', p_generation_id, 'Credit refunded — generation failed');

  return json_build_object('success', true, 'new_balance', v_new_balance);
end;
$$;

-- ─── handle_new_user trigger ─────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_free_credits integer;
begin
  select value::integer into v_free_credits
    from admin_settings
    where key = 'free_signup_credits';

  v_free_credits := coalesce(v_free_credits, 3);

  insert into public.profiles (id, email, full_name, avatar_url, user_type)
    values (
      new.id,
      new.email,
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'avatar_url',
      'homeowner'
    );

  perform public.add_credits(new.id, v_free_credits, 'signup', 'Welcome credits');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
