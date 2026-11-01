-- Run once in Supabase Dashboard > SQL Editor. Does not delete any existing photos.
drop policy if exists "couple delete private guest photos" on storage.objects;
create policy "couple delete private guest photos"
on storage.objects for delete to authenticated
using (
 bucket_id = 'wedding-guests'
 and exists (select 1 from public.wedding_admins where user_id = auth.uid())
);
