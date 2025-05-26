-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create table for driver profiles with enhanced fields
create table if not exists driver_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  email text not null,
  full_name text not null,
  phone text not null,
  vehicle_type text not null,
  vehicle_details jsonb,
  license_number text,
  license_expiry date,
  insurance_provider text,
  insurance_policy_number text,
  insurance_expiry date,
  background_check_status text check (background_check_status in ('pending', 'passed', 'failed')) default 'pending',
  verification_status text check (verification_status in ('pending', 'verified', 'rejected')) default 'pending',
  onboarding_status text check (onboarding_status in ('pending', 'in_progress', 'completed')) default 'pending',
  current_step integer default 1,
  total_steps integer default 5,
  documents jsonb,
  preferences jsonb default '{
    "notifications": true,
    "location_sharing": true,
    "auto_accept_deliveries": false
  }',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_active_at timestamp with time zone,
  unique(user_id)
);

-- Create table for driver documents
create table if not exists driver_documents (
  id uuid primary key default uuid_generate_v4(),
  driver_id uuid references driver_profiles on delete cascade not null,
  document_type text not null check (document_type in ('license', 'insurance', 'vehicle_registration', 'background_check')),
  document_url text not null,
  verification_status text check (verification_status in ('pending', 'verified', 'rejected')) default 'pending',
  ocr_data jsonb,
  metadata jsonb,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create table for driver verification history
create table if not exists driver_verification_history (
  id uuid primary key default uuid_generate_v4(),
  driver_id uuid references driver_profiles on delete cascade not null,
  verification_type text not null,
  status text not null,
  notes text,
  verified_by uuid references auth.users,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create table for driver onboarding progress
create table if not exists driver_onboarding_progress (
  id uuid primary key default uuid_generate_v4(),
  driver_id uuid references driver_profiles on delete cascade not null,
  step_number integer not null,
  step_name text not null,
  status text check (status in ('pending', 'in_progress', 'completed', 'failed')) default 'pending',
  data jsonb,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table driver_profiles enable row level security;
alter table driver_documents enable row level security;
alter table driver_verification_history enable row level security;
alter table driver_onboarding_progress enable row level security;

-- Create policies for driver_profiles
create policy "Drivers can view their own profile"
  on driver_profiles for select
  using (auth.uid() = user_id);

create policy "Drivers can update their own profile"
  on driver_profiles for update
  using (auth.uid() = user_id);

create policy "Admins can view all driver profiles"
  on driver_profiles for select
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can update all driver profiles"
  on driver_profiles for update
  using (auth.jwt() ->> 'role' = 'admin');

-- Create policies for driver_documents
create policy "Drivers can view their own documents"
  on driver_documents for select
  using (
    driver_id in (
      select id from driver_profiles where user_id = auth.uid()
    )
  );

create policy "Drivers can insert their own documents"
  on driver_documents for insert
  with check (
    driver_id in (
      select id from driver_profiles where user_id = auth.uid()
    )
  );

create policy "Admins can view all documents"
  on driver_documents for select
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can update all documents"
  on driver_documents for update
  using (auth.jwt() ->> 'role' = 'admin');

-- Create policies for driver_verification_history
create policy "Drivers can view their own verification history"
  on driver_verification_history for select
  using (
    driver_id in (
      select id from driver_profiles where user_id = auth.uid()
    )
  );

create policy "Admins can view all verification history"
  on driver_verification_history for select
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can insert verification history"
  on driver_verification_history for insert
  with check (auth.jwt() ->> 'role' = 'admin');

-- Create policies for driver_onboarding_progress
create policy "Drivers can view their own onboarding progress"
  on driver_onboarding_progress for select
  using (
    driver_id in (
      select id from driver_profiles where user_id = auth.uid()
    )
  );

create policy "Drivers can update their own onboarding progress"
  on driver_onboarding_progress for update
  using (
    driver_id in (
      select id from driver_profiles where user_id = auth.uid()
    )
  );

create policy "Admins can view all onboarding progress"
  on driver_onboarding_progress for select
  using (auth.jwt() ->> 'role' = 'admin');

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add triggers for updated_at
create trigger update_driver_profiles_updated_at
  before update on driver_profiles
  for each row
  execute function update_updated_at_column();

create trigger update_driver_documents_updated_at
  before update on driver_documents
  for each row
  execute function update_updated_at_column();

create trigger update_driver_onboarding_progress_updated_at
  before update on driver_onboarding_progress
  for each row
  execute function update_updated_at_column(); 