-- TREASURE_TOYSHOP core schema. Money is stored as integer minor units (GBP pence).
create extension if not exists pgcrypto;

-- ---------- profiles & roles ----------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now()
);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- security definer avoids RLS recursion when policies need the caller's role
create function public.current_user_role() returns text
language sql security definer stable set search_path = public as
$$ select role from public.profiles where id = auth.uid() $$;

create function public.is_admin() returns boolean
language sql stable as $$ select coalesce(public.current_user_role() = 'admin', false) $$;

-- ---------- catalogue ----------
create table public.products (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  sku               text not null unique,
  name              text not null,
  description       text not null default '',
  department        text not null check (department in ('kids', 'collectors')),
  audience          text not null check (audience in ('children', 'collectors')),
  category          text not null,
  manufacturer      text,
  scale             text,
  price_minor       integer not null check (price_minor >= 0),
  discount_percent  integer not null default 0 check (discount_percent between 0 and 100),
  stock             integer not null default 0 check (stock >= 0),
  age_min           integer check (age_min >= 0),
  safety_notes      text,
  occasions         text[] not null default '{}' check (occasions <@ array['birthday', 'christmas', 'premium']),
  is_featured       boolean not null default false,
  is_limited        boolean not null default false,
  is_new            boolean not null default false,
  is_published      boolean not null default false,
  seo_title         text,
  seo_description   text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  -- a collectible can never be marketed as a children's product (and vice versa)
  constraint department_matches_audience check (
    (department = 'kids' and audience = 'children') or (department = 'collectors' and audience = 'collectors')
  )
);
create index products_department_idx on public.products (department) where is_published;
create index products_occasions_idx on public.products using gin (occasions);

create table public.product_images (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products (id) on delete cascade,
  url          text not null,
  alt          text not null,
  position     integer not null default 0,
  is_featured  boolean not null default false
);
create index product_images_product_idx on public.product_images (product_id, position);

-- ---------- enquiries (replaces orders: no online payment) ----------
create table public.enquiries (
  id              uuid primary key default gen_random_uuid(),
  reference       text not null unique,
  customer_name   text not null,
  customer_email  text,
  customer_phone  text,
  country         text not null,
  notes           text,
  status          text not null default 'new' check (status in ('new', 'contacted', 'agreed', 'delivered', 'cancelled')),
  created_at      timestamptz not null default now()
);

create table public.enquiry_items (
  id                uuid primary key default gen_random_uuid(),
  enquiry_id        uuid not null references public.enquiries (id) on delete cascade,
  product_id        uuid references public.products (id) on delete set null,
  product_name      text not null,
  sku               text not null,
  unit_price_minor  integer not null,
  quantity          integer not null check (quantity between 1 and 10)
);
create index enquiry_items_enquiry_idx on public.enquiry_items (enquiry_id);

-- ---------- content ----------
create table public.gift_collections (
  id         uuid primary key default gen_random_uuid(),
  occasion   text not null check (occasion in ('birthday', 'christmas', 'premium')),
  title      text not null,
  is_active  boolean not null default true,
  starts_at  timestamptz,
  ends_at    timestamptz
);

create table public.site_settings (
  key    text primary key,
  value  jsonb not null
);

create table public.newsletter_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  created_at  timestamptz not null default now()
);

create table public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  message     text not null,
  created_at  timestamptz not null default now()
);

create table public.audit_logs (
  id          bigint generated always as identity primary key,
  actor_id    uuid references auth.users (id),
  action      text not null,
  entity      text not null,
  entity_id   text,
  created_at  timestamptz not null default now()
);

-- keep updated_at fresh
create function public.touch_updated_at() returns trigger language plpgsql as
$$ begin new.updated_at = now(); return new; end $$;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ---------- Row Level Security ----------
alter table public.profiles               enable row level security;
alter table public.products               enable row level security;
alter table public.product_images         enable row level security;
alter table public.enquiries              enable row level security;
alter table public.enquiry_items          enable row level security;
alter table public.gift_collections       enable row level security;
alter table public.site_settings          enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages       enable row level security;
alter table public.audit_logs             enable row level security;

-- profiles: read/update your own row, but you can never change your own role
create policy "own profile read"   on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "own profile update" on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = public.current_user_role());
create policy "admin manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

-- catalogue: the public sees published products only; admins manage everything
create policy "public read published products" on public.products for select using (is_published or public.is_admin());
create policy "admin write products"           on public.products for all using (public.is_admin()) with check (public.is_admin());

create policy "public read images of published products" on public.product_images for select
  using (exists (select 1 from public.products p where p.id = product_id and (p.is_published or public.is_admin())));
create policy "admin write images" on public.product_images for all using (public.is_admin()) with check (public.is_admin());

-- enquiries: written by the server (service role bypasses RLS); only admins can read
create policy "admin read enquiries"      on public.enquiries      for all using (public.is_admin()) with check (public.is_admin());
create policy "admin read enquiry items"  on public.enquiry_items  for all using (public.is_admin()) with check (public.is_admin());

create policy "public read active collections" on public.gift_collections for select using (is_active or public.is_admin());
create policy "admin write collections"        on public.gift_collections for all using (public.is_admin()) with check (public.is_admin());

create policy "public read settings" on public.site_settings for select using (true);
create policy "admin write settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

create policy "admin read subscribers" on public.newsletter_subscribers for select using (public.is_admin());
create policy "admin read messages"    on public.contact_messages       for select using (public.is_admin());
create policy "admin read audit"       on public.audit_logs             for select using (public.is_admin());

-- ---------- storage: public read, admin-only write for product media ----------
insert into storage.buckets (id, name, public) values ('product-media', 'product-media', true)
  on conflict (id) do nothing;
create policy "public read media" on storage.objects for select using (bucket_id = 'product-media');
create policy "admin write media" on storage.objects for all
  using (bucket_id = 'product-media' and public.is_admin())
  with check (bucket_id = 'product-media' and public.is_admin());
