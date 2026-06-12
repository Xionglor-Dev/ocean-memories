-- Backfill existing rows so display_order starts at 0 and follows timeline order.
with ordered_memories as (
  select
    id,
    (row_number() over (order by date asc, created_at asc, id asc) - 1)::integer
      as automatic_display_order
  from public.memories
)
update public.memories
set display_order = ordered_memories.automatic_display_order
from ordered_memories
where memories.id = ordered_memories.id;

create or replace function public.assign_memory_display_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Serialize inserts so two new memories cannot receive the same order number.
  perform pg_advisory_xact_lock(3829110475827131432);

  select coalesce(max(display_order), -1) + 1
  into new.display_order
  from public.memories;

  return new;
end;
$$;

drop trigger if exists memories_assign_display_order on public.memories;
-- Future inserts append to the bottom without asking the admin for a number.
create trigger memories_assign_display_order
before insert on public.memories
for each row execute function public.assign_memory_display_order();
