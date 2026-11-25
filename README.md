# TREASURE_TOYSHOP

Premium toy cars and diecast collectibles. **No online payment**: customers add cars to a cart,
then send the list to the business on WhatsApp (or email) to agree price, delivery and payment.

Stack: Next.js 15 (App Router) · TypeScript · Tailwind v4 · Framer Motion · Supabase · Vercel.

## Run it

```bash
npm install
cp .env.example .env.local   # set WhatsApp number and email
npm run dev                  # http://localhost:3000
npm test                     # unit tests
npm run lint                 # type-check
```

With no Supabase keys the site runs on built-in **sample products** (fictional, `SAMPLE-` SKUs).

## Connect Supabase

1. Create a Supabase project (free tier).
2. In the SQL editor run `supabase/migrations/0001_init.sql`, then `0002_admin_media.sql`, then (optional) `supabase/seed.sql`.
3. Put the project URL, anon key and service-role key in `.env.local`.
4. Make yourself admin: sign up once, then run
   `update public.profiles set role = 'admin' where id = '<your auth user id>';`

The service-role key is server-only and is used just by `/api/enquiries`.

## Admin dashboard (`/admin`)

1. In Supabase > Authentication > Users, add a user (email + password) for yourself.
2. Make that user an admin (SQL editor):
   `update public.profiles set role = 'admin' where id = '<user id>';`
3. Open `/admin/login` and sign in.

What you can do: add/edit/delete products (price in £, stock, age, safety notes, SEO, gift
collections, featured/new/limited flags), upload photos and videos by drag and drop (reorder,
choose the featured photo, edit alt text), publish/unpublish, and manage customer enquiries
(status, reply on WhatsApp). Create the product first, then add media on the next screen.

Limits: images 5 MB (JPG/PNG/WebP/AVIF), videos 50 MB (MP4/WebM, Supabase free-tier cap).
Security: every admin page and server action re-checks the admin role; uploads and writes go
through Row Level Security, so a non-admin cannot write even by calling the endpoints directly.

## How an order works

Cart (browser, `localStorage`) → `/enquiry` form → `POST /api/enquiries` (validates, rebuilds the
lines from the catalogue so prices cannot be tampered with, saves the enquiry, builds the message)
→ WhatsApp opens with the list and a reference like `TT-9F3A21BC`.

## Layout

```
src/app            routes (shop, products, gifts, gift-finder, enquiry, api)
src/components     UI grouped by feature
src/services       catalogue access, filtering, gift-finder rules (pure, tested)
src/lib            money, WhatsApp message builder, Supabase clients, rate limit
supabase/          migrations and seed
tests/             Vitest
```

## Not built yet

Customer accounts and wishlist, reviews, newsletter form, editable site settings (contact
details still come from `.env`), seasonal-collection toggles, per-market pricing.
