# My Ocean Memories Rebuild Prompt

Build a production-ready full-stack web application called "My Ocean Memories".

Project Goal

Create a personal digital scrapbook and memory journal.

Only the owner/admin can create, edit, publish, unpublish, upload photos, or delete memories.
Visitors can only view published memories and like them.

The website should feel emotional, warm, nostalgic, peaceful, magical, and ocean-themed.
It should feel like a combination of:

- Facebook memory posts
- Instagram photo stacks
- A scrapbook journal
- A Polaroid photo album
- An ocean travel diary
- A peaceful life timeline

Technology Requirements

Use:

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Supabase Database
- Supabase Storage
- Supabase Authentication
- Vercel deployment readiness

Use clean architecture, reusable components, server actions where appropriate, protected API routes, and production-quality code.

Required Routes

- `/` public home timeline
- `/memory/[id]` public memory detail page for published memories
- `/login` secure admin login
- `/admin` protected admin dashboard
- `/api/likes` visitor like toggle endpoint
- `/api/admin/upload-photo` protected admin image upload endpoint
- `/robots.txt`
- `/sitemap.xml`

Visual Design

Theme:

A dreamy ocean journey filled with memories, nostalgia, warmth, and peaceful emotions.

Background:

- Animated ocean background
- Soft blue gradient
- Top color: `#DFF6FF`
- Middle color: `#C9EEFF`
- Bottom color: `#AEE2FF`
- Gentle waves
- Floating transparent bubbles
- Tiny glowing particles
- Soft sunlight rays
- Water shimmer
- Subtle parallax feeling
- Calm seamless loop
- Keep the center clean for content cards
- Decorative elements should stay near edges and corners

Main palette:

- Background: `#EAF8FF`
- Timeline: `#7CCBFF`
- Cards: `#FFFFFF`
- Text: `#345066`
- Heart: `#FF5C8A`

Fonts:

- Use `Calligraffitti` for the site name, dates, and memory story text.
- Use `Kaushan Script` for the main quote and memory titles.

Home Page

The home page is a continuous life timeline.

Memories appear in chronological order:

- Oldest at the top
- Newest at the bottom
- New memories automatically append to the bottom

Header text:

Site name:

`My Ocean Memories`

Quote:

`"Every moment leaves a mark. Every memory tells a story. Together, they become the journey that defines a lifetime."`

The quote should use the Kaushan Script font and should not be too large on mobile.

Timeline Design

Create a vertical timeline on desktop only.

- Hide the timeline line on phones so memory cards have more room.
- On desktop, use a soft ocean-current or wave-line style.
- The timeline should feel continuous and not broken.
- Cards should reveal smoothly from bottom to top while scrolling.
- The scroll reveal must feel smooth on phone and desktop.

Memory Card Design

Each memory should look like a premium scrapbook note/card:

- Rounded corners
- White or lightly translucent note background
- Soft shadow
- Ocean scrapbook feeling
- Floating hover animation
- Custom generated cute stickers on the top-right of each note
- No external sticker folder required

Card structure:

- Date formatted as `YYYY.MM.DD`
- Optional title
- Divider line under title
- Photo stack only if images exist
- Story text
- Divider line above like area
- Like area at the bottom-left

If a memory has no images, hide the photo area completely and show only the story.

Photo Stack / Gallery

For memories with multiple photos:

- Display photos as a realistic stacked carousel/deck.
- The active image is in front.
- Inactive images are partially visible behind the active image.
- Inactive images should be slightly scaled down and darker.
- Use `translateX()`, `scale()`, `opacity`, and `z-index`.
- Add soft shadows and smooth transitions.
- Support automatic slow rotation when the visitor is not interacting.
- Manual selection/sliding should remain faster and responsive.
- On desktop, hover should feel magical.
- On phone, sliding must be smooth, especially for two or three images.
- On phone, add left and right arrow buttons so visitors know they can slide.
- The arrows should slide the photo carousel.
- Do not open images fullscreen.
- Do not show an expand icon.
- The cursor can indicate that photos are interactive.

Photo Hover Effect

On hover:

- The photo gently lifts and glows.
- Tiny glowing ocean particles, bubbles, and stardust emerge from the photo.
- Small luminous specks rise upward like memories floating through water.
- Soft blue bioluminescent sparkles appear around the border.
- The effect should stop when the user interacts with the photo deck.

Like System

Visitors can like memories.

- No comments
- No visitor editing
- No visitor login
- One like per browser/device
- Use a visitor cookie
- Hash the visitor ID server-side before storing it
- Store only the hash in the database
- Use optimistic UI for fast heart response
- Use a database unique constraint on `(memory_id, visitor_hash)`

Desktop like behavior:

- Click the heart icon
- Heart changes from outline to filled pink
- Like count updates instantly

Mobile like behavior:

- Double-tap photo to like
- Show a large pink heart burst animation in the center
- Heart grows and fades
- Like count updates quickly

Like area:

- Bottom-left of each memory card
- Desktop: horizontal heart and count
- Mobile: smaller heart, compact layout

Memory Detail Page

Route: `/memory/[id]`

Features:

- Only published memories should be visible
- Missing or draft memories should return not found
- Large photo stack
- Memory date
- Memory title
- Full story
- Like section
- Metadata/Open Graph support
- No share button
- No fullscreen image opening

Admin Authentication

Only one admin account should exist.

Use Supabase Authentication for login, but protect admin access with an `admin_users` table.
Email/password can be valid, but only users listed in `admin_users` may enter `/admin`.

Implement:

- `/login`
- Protected `/admin`
- Middleware or server checks
- Secure logout
- Helpful login loading animation/status after pressing the login button
- Clear error message if the user is not in `admin_users`
- Treat stale or broken Supabase refresh-token cookies as logged out instead of crashing public pages

Login Page Design

- Large centered login card
- Same soft scrapbook note style as memory cards
- Ocean background behind it
- Rounded email and password inputs
- Input borders should match the outer card color
- Login button should be smaller than full-width huge buttons
- On hover, Login text should turn blue
- Show loading feedback after pressing Login

Admin Dashboard

Route: `/admin`

Features:

- Create memory
- Edit memory
- Delete memory
- Upload photos
- Remove existing photos immediately
- Preview memory
- Publish/unpublish memory
- Search memory title
- On Enter in search, highlight matching title with pink highlight
- On phone, pressing "New Memory" should jump to the editor
- On phone, pressing a memory title/status should jump to that memory editor
- After publishing/saving, show a completion message and refresh latest data

Dashboard Design:

- Background should match the soft memory note style
- Dashboard card should have slight opacity
- Logout button should be visually different from Add/New button
- New Memory button hover text should turn blue
- Published state:
  - Published: green check-circle icon
  - Draft: red empty-circle icon

Memory Editor Form

Fields:

- Date
- Title optional
- Story
- Photos
- Published state
- Publish/Save button

Behavior:

- Date defaults to the current date when creating a new memory
- Display order is automatic, starting at 0 and increasing by 1
- Do not ask admin to type display order
- Publish checkbox/control should be compact and clear
- When checked, publish indicator should be green
- When published is checked, Publish Memory button should turn green
- Save button hover text should turn blue

Photo Upload UI:

- Replace large drag area with a plus button
- Pressing plus opens file picker
- Support selecting multiple images at once
- Uploaded/pending images show in a list
- Each image has a small trash button on the top-right corner
- Existing photos can be deleted immediately
- Upload images through an API route, not through Server Action form body, to avoid body-size errors

Database Schema

Create migrations for:

Table: `admin_users`

- `user_id uuid primary key references auth.users(id) on delete cascade`
- `created_at timestamptz`

Table: `memories`

- `id uuid primary key default gen_random_uuid()`
- `date date not null`
- `title text`
- `content text not null`
- `display_order integer not null default 0`
- `is_published boolean not null default false`
- `likes_count integer not null default 0 check (likes_count >= 0)`
- `created_at timestamptz`
- `updated_at timestamptz`

Table: `memory_images`

- `id uuid primary key default gen_random_uuid()`
- `memory_id uuid references memories(id) on delete cascade`
- `image_url text not null`
- `storage_path text not null`
- `sort_order integer not null default 0`
- `created_at timestamptz`

Table: `likes`

- `id uuid primary key default gen_random_uuid()`
- `memory_id uuid references memories(id) on delete cascade`
- `visitor_hash text not null check length is 64`
- `created_at timestamptz`
- unique `(memory_id, visitor_hash)`

Database Requirements:

- Enable RLS
- Visitors can select only published memories and images
- Admin can manage memories and images
- Admin can inspect likes
- Create `is_admin()` helper function
- Create updated-at trigger
- Create likes-count trigger
- Create automatic display-order trigger
- Create public Supabase Storage bucket `memory-images`
- Public can view stored images
- Only admin can upload/update/delete stored images

Security Notes

- Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the browser
- Use service role only on the server
- Public reads should not depend on auth cookies
- Admin writes must be protected server-side
- Do not allow visitors to edit, upload, delete, or publish

SEO / Metadata

Implement:

- Root metadata
- Open Graph metadata
- Twitter cards
- Sitemap
- Robots.txt
- Do not index `/admin`
- Memory detail pages should use private/simple metadata

Responsive Design

Mobile-first.

Phone:

- Single-column timeline
- Hide desktop timeline wave line
- Memory card should be wide enough
- Photo content should be large and not overflow the card
- Heart area should be compact
- Photo carousel must slide smoothly

Tablet/Desktop:

- Center content
- Max width around 900px for public cards
- Dashboard can use a two-column layout
- Timeline wave/current visible only from small/desktop breakpoint upward

Accessibility

Implement:

- Keyboard navigation
- ARIA labels for buttons
- Good color contrast
- Screen-reader friendly labels
- Semantic HTML where possible

Deliverables

Generate:

- Full Next.js project structure
- Supabase migrations
- Supabase setup instructions
- API routes
- Server actions
- React components
- Tailwind styling
- Framer Motion animations
- Authentication system
- Like system
- Image upload system
- Responsive design
- README with setup, phone testing, deployment, and troubleshooting

Quality Requirements

- Production-quality code
- Clean architecture
- Reusable components
- TypeScript-safe
- Lint clean
- Build clean
- Vercel deployment ready
- Calm, premium, emotional ocean scrapbook UI
```

