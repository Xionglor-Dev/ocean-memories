# My Ocean Memories

My Ocean Memories is a personal ocean-themed digital scrapbook built with Next.js, Supabase, Tailwind CSS, and Framer Motion.

It is designed as a peaceful timeline of memories: visitors can read published memories, slide through photo stacks, and like memories. Only the owner/admin can create, edit, publish, unpublish, upload photos, or delete memories.

## Features

- Public chronological timeline, oldest memories at the top and newest at the bottom
- Animated ocean background with waves, bubbles, light rays, particles, and soft edge decorations
- Responsive memory cards with scrapbook styling, custom fonts, stickers, and smooth scroll reveal
- Multi-photo stacked carousel with mobile arrows, touch sliding, and automatic slow rotation
- Note-only memories with the photo area hidden when no images exist
- Visitor like system with optimistic heart updates and one-like-per-device protection
- Admin login protected by Supabase Authentication and an `admin_users` allowlist
- Admin dashboard for creating, editing, publishing, deleting, searching, and uploading photos
- Supabase Storage image uploads through an API route to avoid Server Action body limits
- SEO metadata, sitemap, robots.txt, and private memory detail metadata
- Vercel-ready production build

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase Database
- Supabase Storage
- Supabase Authentication
- Lucide React icons

## Routes

- `/` public memory timeline
- `/memory/[id]` public memory detail page for published memories
- `/login` admin login
- `/admin` protected admin dashboard
- `/api/likes` visitor like toggle endpoint
- `/api/admin/upload-photo` protected admin image upload endpoint
- `/robots.txt`
- `/sitemap.xml`

## Local Setup

Install dependencies:

```bash
npm install
```

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
VISITOR_HASH_SECRET=choose_a_long_random_secret
```

Important: `SUPABASE_SERVICE_ROLE_KEY` must stay server-only. Do not expose it in browser code or commit `.env.local`.

Run the dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Supabase Setup

Create a Supabase project, then run the migrations in this order:

```text
supabase/migrations/20260609000000_initial_schema.sql
supabase/migrations/20260610000000_automatic_memory_display_order.sql
```

The migrations create:

- `admin_users`
- `memories`
- `memory_images`
- `likes`
- public `memory-images` storage bucket
- row-level security policies
- automatic `updated_at` trigger
- automatic `likes_count` trigger
- automatic `display_order` assignment for new memories

## Create The Admin Account

1. Go to Supabase Dashboard.
2. Open Authentication.
3. Create the owner/admin user with email and password.
4. Copy the real Auth user UUID.
5. Insert that UUID into `admin_users`:

```sql
insert into public.admin_users (user_id)
values ('PASTE_REAL_AUTH_USER_UUID_HERE');
```

Do not use a fake value like `99999`. The `user_id` column is a UUID and it also references `auth.users(id)`, so the user must already exist in Supabase Authentication.

Recommended: disable public signups in Supabase Auth settings so only the owner account exists.

## Admin Workflow

Log in at:

```text
/login
```

Then open:

```text
/admin
```

From the dashboard you can:

- create a new memory
- edit date, title, story, photos, and published state
- upload multiple photos at once
- remove existing photos
- search memory titles
- preview the memory card
- publish or save as draft
- delete a memory and its photos

New memories are automatically appended to the bottom of the timeline.

## Testing On Your Phone

Make sure your Mac and phone are on the same Wi-Fi.

Start Next.js so other devices can reach it:

```bash
npm run dev -- -H 0.0.0.0
```

Find your Mac IP address:

```bash
ipconfig getifaddr en0
```

On your phone, open:

```text
http://YOUR_MAC_IP:3000
```

Example:

```text
http://192.168.3.66:3000
```

If your phone cannot connect, check that the dev server is still running, both devices are on the same network, and macOS Firewall is not blocking Node.js.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```

## Deployment

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add all environment variables from `.env.local` to Vercel Project Settings.
4. Set `NEXT_PUBLIC_SITE_URL` to your production domain.
5. Run the Supabase migrations before first production use.
6. Create the admin Auth user and insert the user UUID into `admin_users`.
7. Deploy.

## Troubleshooting

### Invalid UUID

If Supabase says:

```text
invalid input syntax for type uuid
```

You inserted a non-UUID value into `admin_users`. Use the real UUID from Supabase Authentication.

### Foreign Key Error

If Supabase says:

```text
violates foreign key constraint "admin_users_user_id_fkey"
```

The UUID does not exist in `auth.users`. Create the admin user in Supabase Authentication first, then insert that exact user ID.

### Invalid Refresh Token

If you see:

```text
Invalid Refresh Token: Refresh Token Not Found
```

Clear the site cookies for localhost or your dev IP, then refresh and log in again. The app also treats broken Supabase cookies as logged out instead of crashing public pages.

### Body Exceeded Limit

Photo uploads use `/api/admin/upload-photo` to avoid sending large files through Server Actions. If this error appears again, restart the dev server after changing `next.config.ts`.

### Images Do Not Load

Check:

- the `memory-images` bucket exists
- the bucket is public
- the storage policies from the migration ran successfully
- `NEXT_PUBLIC_SUPABASE_URL` matches the project storing the images

## Project Structure

```text
app/
  admin/
  api/
  login/
  memory/[id]/
components/
  memory/
  ocean/
  shared/
  timeline/
lib/
  data/
  supabase/
supabase/
  migrations/
types/
```

