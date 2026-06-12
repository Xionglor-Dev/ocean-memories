create extension if not exists pgcrypto;

-- One row in this table marks the single owner account allowed into /admin.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  title text,
  content text not null,
  display_order integer not null default 0,
  is_published boolean not null default false,
  likes_count integer not null default 0 check (likes_count >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.memory_images (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories(id) on delete cascade,
  visitor_hash text not null check (char_length(visitor_hash) = 64),
  created_at timestamptz not null default timezone('utc', now()),
  constraint likes_memory_visitor_unique unique (memory_id, visitor_hash)
);

-- Timeline reads are ordered oldest to newest and filtered to public memories.
create index if not exists memories_public_timeline_idx
  on public.memories (is_published, date asc, display_order asc, created_at asc);

create index if not exists memory_images_memory_sort_idx
  on public.memory_images (memory_id, sort_order asc, created_at asc);

create index if not exists likes_memory_idx on public.likes (memory_id);
create index if not exists likes_visitor_idx on public.likes (visitor_hash);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  -- Admin status is checked from auth.uid(), not from visitor-provided data.
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists memories_set_updated_at on public.memories;
create trigger memories_set_updated_at
before update on public.memories
for each row execute function public.set_updated_at();

create or replace function public.update_memory_likes_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Keep memories.likes_count fast to read while likes remains the source of truth.
  if tg_op = 'INSERT' then
    update public.memories
    set likes_count = likes_count + 1
    where id = new.memory_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.memories
    set likes_count = greatest(likes_count - 1, 0)
    where id = old.memory_id;
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists likes_update_memory_count_insert on public.likes;
create trigger likes_update_memory_count_insert
after insert on public.likes
for each row execute function public.update_memory_likes_count();

drop trigger if exists likes_update_memory_count_delete on public.likes;
create trigger likes_update_memory_count_delete
after delete on public.likes
for each row execute function public.update_memory_likes_count();

alter table public.admin_users enable row level security;
alter table public.memories enable row level security;
alter table public.memory_images enable row level security;
alter table public.likes enable row level security;

-- Visitors may read published content, while only the admin can change memories.
drop policy if exists "Admin users can read themselves" on public.admin_users;
create policy "Admin users can read themselves"
on public.admin_users
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Published memories are public" on public.memories;
create policy "Published memories are public"
on public.memories
for select
to anon, authenticated
using (is_published = true or public.is_admin());

drop policy if exists "Admins manage memories" on public.memories;
create policy "Admins manage memories"
on public.memories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Published memory images are public" on public.memory_images;
create policy "Published memory images are public"
on public.memory_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.memories
    where memories.id = memory_images.memory_id
      and (memories.is_published = true or public.is_admin())
  )
);

drop policy if exists "Admins manage memory images" on public.memory_images;
create policy "Admins manage memory images"
on public.memory_images
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can inspect likes" on public.likes;
create policy "Admins can inspect likes"
on public.likes
for select
to authenticated
using (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memory-images',
  'memory-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage is public for viewing, but upload/update/delete stays admin-only.
drop policy if exists "Public can view memory images" on storage.objects;
create policy "Public can view memory images"
on storage.objects
for select
to public
using (bucket_id = 'memory-images');

drop policy if exists "Admins can upload memory images" on storage.objects;
create policy "Admins can upload memory images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'memory-images' and public.is_admin());

drop policy if exists "Admins can update memory images" on storage.objects;
create policy "Admins can update memory images"
on storage.objects
for update
to authenticated
using (bucket_id = 'memory-images' and public.is_admin())
with check (bucket_id = 'memory-images' and public.is_admin());

drop policy if exists "Admins can delete memory images" on storage.objects;
create policy "Admins can delete memory images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'memory-images' and public.is_admin());
