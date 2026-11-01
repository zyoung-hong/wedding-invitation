-- Run in a NEW dedicated Supabase project. No guest SELECT/INSERT storage policies.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('wedding-guests','wedding-guests',false,10485760,array['image/jpeg','image/png','image/webp']);

create table public.wedding_admins(user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.wedding_admins enable row level security;
revoke all on public.wedding_admins from anon, authenticated;
grant select on public.wedding_admins to authenticated;
create policy "admins see own membership" on public.wedding_admins for select to authenticated using(user_id=auth.uid());
create policy "couple read private guest photos" on storage.objects for select to authenticated
using(bucket_id='wedding-guests' and exists(select 1 from public.wedding_admins where user_id=auth.uid()));

-- Global daily budget is atomic; captcha still required on every batch.
create table public.wedding_upload_budget(day date primary key, files integer not null);
alter table public.wedding_upload_budget enable row level security;
revoke all on public.wedding_upload_budget from anon, authenticated;
create function public.reserve_wedding_upload(n integer) returns boolean language plpgsql security definer set search_path=public as $$
declare result integer;
begin
 if n < 1 or n > 5 then return false; end if;
 insert into public.wedding_upload_budget values(current_date,n)
 on conflict(day) do update set files=wedding_upload_budget.files+excluded.files
 where wedding_upload_budget.files+excluded.files<=200 returning files into result;
 return result is not null;
end $$;
revoke all on function public.reserve_wedding_upload(integer) from public,anon,authenticated;
grant execute on function public.reserve_wedding_upload(integer) to service_role;
-- After creating the TWO owners in Authentication > Users, add their UUIDs:
-- insert into public.wedding_admins(user_id) values ('GROOM_UUID'),('BRIDE_UUID');
insert into public.wedding_admins (user_id)
values
  ('7342d7c8-a0b8-4271-bb17-83f4852603ef');