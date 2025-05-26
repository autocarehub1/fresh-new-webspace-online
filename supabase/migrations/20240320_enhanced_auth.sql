-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create table for WebAuthn credentials
create table if not exists webauthn_credentials (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  credential_id text not null,
  public_key text not null,
  counter bigint not null,
  device_type text,
  device_name text,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, credential_id)
);

-- Create table for login attempts and risk scoring
create table if not exists login_attempts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade,
  ip_address text not null,
  user_agent text,
  success boolean not null,
  risk_score integer,
  challenge_required boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create table for KYC documents
create table if not exists kyc_documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  document_type text not null check (document_type in ('license', 'id_card', 'passport')),
  document_number text,
  document_url text not null,
  ocr_data jsonb,
  verification_status text not null check (verification_status in ('pending', 'verified', 'rejected')) default 'pending',
  verified_by uuid references auth.users,
  verified_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create table for MFA settings
create table if not exists mfa_settings (
  user_id uuid references auth.users on delete cascade primary key,
  webauthn_enabled boolean default false,
  totp_enabled boolean default false,
  totp_secret text,
  backup_codes text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create table for audit logs
create table if not exists auth_audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade,
  action text not null,
  ip_address text,
  user_agent text,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table webauthn_credentials enable row level security;
alter table login_attempts enable row level security;
alter table kyc_documents enable row level security;
alter table mfa_settings enable row level security;
alter table auth_audit_logs enable row level security;

-- Create RLS policies
create policy "Users can view their own WebAuthn credentials"
  on webauthn_credentials for select
  using (auth.uid() = user_id);

create policy "Users can manage their own WebAuthn credentials"
  on webauthn_credentials for all
  using (auth.uid() = user_id);

create policy "Users can view their own login attempts"
  on login_attempts for select
  using (auth.uid() = user_id);

create policy "Users can view their own KYC documents"
  on kyc_documents for select
  using (auth.uid() = user_id);

create policy "Users can manage their own KYC documents"
  on kyc_documents for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own MFA settings"
  on mfa_settings for select
  using (auth.uid() = user_id);

create policy "Users can manage their own MFA settings"
  on mfa_settings for all
  using (auth.uid() = user_id);

create policy "Users can view their own audit logs"
  on auth_audit_logs for select
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists idx_webauthn_credentials_user_id on webauthn_credentials(user_id);
create index if not exists idx_login_attempts_user_id on login_attempts(user_id);
create index if not exists idx_login_attempts_ip_address on login_attempts(ip_address);
create index if not exists idx_kyc_documents_user_id on kyc_documents(user_id);
create index if not exists idx_kyc_documents_status on kyc_documents(verification_status);
create index if not exists idx_auth_audit_logs_user_id on auth_audit_logs(user_id);
create index if not exists idx_auth_audit_logs_created_at on auth_audit_logs(created_at);

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_kyc_documents_updated_at
  before update on kyc_documents
  for each row
  execute function update_updated_at_column();

create trigger update_mfa_settings_updated_at
  before update on mfa_settings
  for each row
  execute function update_updated_at_column(); 