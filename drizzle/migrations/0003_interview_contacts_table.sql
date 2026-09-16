-- Guest contact details move out of the public-facing interviews table into a
-- staff-only companion table.
create table if not exists public.interview_contacts (
  interview_id uuid primary key references public.interviews(id) on delete cascade,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.interview_contacts enable row level security;

drop policy if exists "Team manages interview contacts" on public.interview_contacts;
create policy "Team manages interview contacts"
on public.interview_contacts for all
to authenticated
using (
  has_role(auth.uid(), 'admin')
  or has_role(auth.uid(), 'content_manager')
  or has_role(auth.uid(), 'editor')
)
with check (
  has_role(auth.uid(), 'admin')
  or has_role(auth.uid(), 'content_manager')
  or has_role(auth.uid(), 'editor')
);

grant select, insert, update, delete on public.interview_contacts to authenticated;
grant all on public.interview_contacts to service_role;

create trigger update_interview_contacts_updated_at
before update on public.interview_contacts
for each row execute function public.update_updated_at_column();

insert into public.interview_contacts (interview_id, email, phone)
select id, email, phone from public.interviews
where email is not null or phone is not null
on conflict (interview_id) do nothing;

revoke execute on function public.has_role(uuid, app_role) from anon;
