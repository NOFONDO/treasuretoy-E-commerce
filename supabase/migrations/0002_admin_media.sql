-- Product videos, audit-log writes for admins, and upload limits on the media bucket.
create table public.product_videos (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  url         text not null,
  position    integer not null default 0
);
create index product_videos_product_idx on public.product_videos (product_id, position);

alter table public.product_videos enable row level security;

create policy "public read videos of published products" on public.product_videos for select
  using (exists (select 1 from public.products p where p.id = product_id and (p.is_published or public.is_admin())));
create policy "admin write videos" on public.product_videos for all
  using (public.is_admin()) with check (public.is_admin());

create policy "admin insert audit" on public.audit_logs for insert with check (public.is_admin());

-- 5 MB images, 50 MB videos (Supabase free-tier per-file limit). Enforced by Storage itself.
update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm']
where id = 'product-media';
