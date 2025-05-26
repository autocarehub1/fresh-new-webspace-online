
-- Create drivers table if it doesn't exist
create table if not exists drivers (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  email text not null unique,
  phone text,
  vehicle_type text,
  photo text,
  status text default 'active' check (status in ('active', 'inactive', 'suspended')),
  
  -- Additional profile fields
  address text,
  city text,
  state text,
  zip_code text,
  date_of_birth date,
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relation text,
  work_experience text,
  availability text,
  preferred_areas text,
  profile_completed boolean default false,
  
  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_active_at timestamp with time zone
);

-- Enable RLS
alter table drivers enable row level security;

-- Create policies for drivers table
create policy "Drivers can view their own profile"
  on drivers for select
  using (auth.uid() = id);

create policy "Drivers can update their own profile"
  on drivers for update
  using (auth.uid() = id);

create policy "Drivers can insert their own profile"
  on drivers for insert
  with check (auth.uid() = id);

create policy "Admins can view all drivers"
  on drivers for select
  using (
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and users.role = 'admin'
    )
  );

create policy "Admins can update all drivers"
  on drivers for update
  using (
    exists (
      select 1 from users 
      where users.id = auth.uid() 
      and users.role = 'admin'
    )
  );

-- Create function to update updated_at timestamp
create or replace function update_drivers_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add trigger for updated_at
drop trigger if exists update_drivers_updated_at on drivers;
create trigger update_drivers_updated_at
  before update on drivers
  for each row
  execute function update_drivers_updated_at();

-- Create storage bucket for driver photos if it doesn't exist
insert into storage.buckets (id, name, public)
values ('driver-photos', 'driver-photos', true)
on conflict (id) do nothing;

-- Create storage policy for driver photos
create policy "Users can upload their own driver photos"
on storage.objects for insert
with check (
  bucket_id = 'driver-photos' and
  auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can view their own driver photos"
on storage.objects for select
using (
  bucket_id = 'driver-photos' and
  auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Public can view driver photos"
on storage.objects for select
using (bucket_id = 'driver-photos');
