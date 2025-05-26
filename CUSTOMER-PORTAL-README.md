# Customer Portal for Express Medical Dispatch

This document outlines the implementation of a dedicated customer portal for regular clients to manage their delivery requests and view history.

## Features

### Authentication
- Dedicated login/registration page for customers
- Secure authentication using Supabase Auth
- Profile creation during registration

### Dashboard
- Overview of delivery statistics (pending, in progress, completed)
- Quick access to common actions
- Recent delivery requests summary

### Delivery Request Management
- Create new delivery requests
- View request history with filtering and search
- Track ongoing deliveries
- Manage delivery preferences

### Account Management
- Update profile information
- Manage notification preferences
- Security settings (password change, session management)

## Implementation Details

### Database Schema
We've added a `customer_profiles` table to store customer-specific information:
- Personal details (name, company, contact info)
- Notification preferences
- Links to user accounts via Supabase Auth

### Components Created

#### Pages
- `CustomerLogin.tsx` - Login and registration for customers
- `CustomerPortal.tsx` - Main dashboard and portal interface

#### Components
- `CustomerNewRequest.tsx` - Form for creating new delivery requests
- `CustomerRequestHistory.tsx` - History view with filtering and pagination
- `CustomerSettings.tsx` - Profile and preferences management

#### Services
- `customerService.ts` - API functions for customer-related operations

### Security Considerations
- Row-level security (RLS) policies in Supabase
- Each customer can only access their own data
- Protected routes in the application

## Usage Instructions

1. Access the customer portal at `/customer-login`
2. Register a new account or log in with existing credentials
3. Use the dashboard to navigate to different sections:
   - Create new delivery requests
   - View and track existing requests
   - Update profile and preferences

## Technical Notes

### DB Migration
Run the following migration script to set up the required database tables:
```bash
cd supabase
npx supabase migration up
```

### App Routes Update
Run the script to update App.tsx with the new routes:
```bash
./scripts/update-app-tsx.sh
```

## Future Enhancements
- Email notifications for delivery status updates
- Payment integration for billing
- Real-time delivery tracking
- Analytics dashboard for order patterns
- Mobile app integration 