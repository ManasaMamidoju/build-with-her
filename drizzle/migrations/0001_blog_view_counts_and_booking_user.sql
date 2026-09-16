-- Blog view counts (public read, writes only through the service-role function).
create table if not exists public.blog_post_views (
  slug text primary key,
  views integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.blog_post_views enable row level security;

create policy "Anyone can read blog view counts"
on public.blog_post_views
for select
to anon, authenticated
using (true);

grant select on public.blog_post_views to anon, authenticated;
grant all on public.blog_post_views to service_role;

create or replace function public.increment_blog_post_view(_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.blog_post_views (slug, views) values (_slug, 1)
  on conflict (slug) do update set views = blog_post_views.views + 1, updated_at = now();
end;
$$;

revoke all on function public.increment_blog_post_view(text) from anon, authenticated;
grant execute on function public.increment_blog_post_view(text) to service_role;

-- Bookings can now belong to a person who never signed in (person_id carries identity).
alter table public.bookings alter column user_id drop not null;
