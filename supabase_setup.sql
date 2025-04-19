
-- Create tables
create table if not exists users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  role text check (role in ('admin', 'user', 'driver')) not null default 'user'
);

create table if not exists drivers (
  id text primary key,
  user_id uuid references users(id),
  name text not null,
  status text check (status in ('active', 'inactive')) not null default 'inactive',
  vehicle_type text not null,
  current_location jsonb not null,
  photo text,
  phone text,
  current_delivery text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists delivery_requests (
  id text primary key,
  tracking_id text unique,
  status text check (status in ('pending', 'in_progress', 'completed', 'declined')) not null default 'pending',
  pickup_location text not null,
  delivery_location text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  priority text check (priority in ('normal', 'urgent')) default 'normal',
  package_type text,
  estimated_delivery timestamp with time zone,
  temperature jsonb,
  pickup_coordinates jsonb,
  delivery_coordinates jsonb,
  current_coordinates jsonb,
  assigned_driver text references drivers(id),
  estimated_cost numeric(10,2),
  distance numeric(10,2),
  created_by uuid references users(id)
);

create table if not exists tracking_updates (
  id uuid default uuid_generate_v4() primary key,
  request_id text references delivery_requests(id) on delete cascade,
  status text not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  location text not null,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table users enable row level security;
alter table drivers enable row level security;
alter table delivery_requests enable row level security;
alter table tracking_updates enable row level security;

-- Drop existing policies if they're causing issues
drop policy if exists "Users can view their own profile" on users;
drop policy if exists "Public can view active drivers" on drivers;
drop policy if exists "Admins can manage all drivers" on drivers;
drop policy if exists "Users can view their own requests" on delivery_requests;
drop policy if exists "Drivers can view assigned requests" on delivery_requests;
drop policy if exists "Admins can manage all requests" on delivery_requests;
drop policy if exists "Public can view tracking updates" on tracking_updates;
drop policy if exists "Only admins and assigned drivers can create updates" on tracking_updates;

-- Create fixed policies
-- Users table policies
create policy "Users can view their own profile"
  on users for select
  using (auth.uid() = id);

-- Drivers table policies
create policy "Public can view active drivers"
  on drivers for select
  using (status = 'active');

create policy "Admins can insert drivers"
  on drivers for insert
  with check (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can update drivers"
  on drivers for update
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can delete drivers"
  on drivers for delete
  using (auth.jwt() ->> 'role' = 'admin');

-- Delivery requests policies
create policy "Users can view their own requests"
  on delivery_requests for select
  using (created_by = auth.uid());

create policy "Users can create their own requests"
  on delivery_requests for insert
  with check (created_by = auth.uid());

create policy "Users can update their own requests"
  on delivery_requests for update
  using (created_by = auth.uid());

create policy "Drivers can view assigned requests"
  on delivery_requests for select
  using (assigned_driver in (
    select id from drivers where user_id = auth.uid()
  ));

create policy "Admins can view all requests"
  on delivery_requests for select
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can insert requests"
  on delivery_requests for insert
  with check (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can update requests"
  on delivery_requests for update
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can delete requests"
  on delivery_requests for delete
  using (auth.jwt() ->> 'role' = 'admin');

-- Tracking updates policies
create policy "Public can view tracking updates"
  on tracking_updates for select
  using (true);

create policy "Admins can create tracking updates"
  on tracking_updates for insert
  with check (auth.jwt() ->> 'role' = 'admin');

create policy "Drivers can create updates for assigned deliveries"
  on tracking_updates for insert
  with check (
    auth.uid() in (
      select user_id from drivers d
      join delivery_requests dr on dr.assigned_driver = d.id
      where dr.id = request_id
    )
  );
