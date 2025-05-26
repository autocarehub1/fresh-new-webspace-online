
-- Update drivers table to include all necessary columns for profile completion
alter table drivers 
add column if not exists email text,
add column if not exists address text,
add column if not exists city text,
add column if not exists state text,
add column if not exists zip_code text,
add column if not exists date_of_birth date,
add column if not exists emergency_contact_name text,
add column if not exists emergency_contact_phone text,
add column if not exists emergency_contact_relation text,
add column if not exists work_experience text,
add column if not exists availability text,
add column if not exists preferred_areas text,
add column if not exists profile_completed boolean default false,
add column if not exists last_active_at timestamp with time zone;

-- Add unique constraint on email if not exists
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints 
    where constraint_name = 'drivers_email_key' 
    and table_name = 'drivers'
  ) then
    alter table drivers add constraint drivers_email_key unique (email);
  end if;
end $$;
