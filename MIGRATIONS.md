# Database Migrations

This document lists the SQL scripts available for setting up and updating the Supabase database.

## Essential Scripts

These scripts are critical for the correct functioning of the application, especially the Admin Dashboard and new features.

### 1. Schema Updates

- **`supabase/schema.sql`**: The master schema definition. Recently updated to include `is_admin`, `is_active`, and `prize_quantities`.
- **`ADD_ADMIN_COLUMN.sql`**: Adds the `is_admin` boolean column to the `merchants` table. Required for the Super Admin Dashboard.
- **`ADD_QR_CODE_URL_FIELD.sql`**: Adds `qr_code_url` to `merchants` for storing generated QR codes.
- **`ADD_WEEKLY_SCHEDULE_FIELD.sql`**: Adds `weekly_schedule` JSON column to `merchants` for day-specific redirect strategies.
- **`ADD_EMAIL_TO_FEEDBACK.sql`**: Adds `customer_email` to the `feedback` table.
- **`ADD_SOCIAL_REDIRECT_FIELDS.sql`**: Adds fields for social media URLs (TikTok, Instagram, etc.) and `redirect_strategy`.
- **`ADD_IMAGE_FIELDS.sql`**: Adds `logo_url` and `background_url` to `merchants` and sets up the `merchant-assets` storage bucket with policies.

### 2. Data & Permissions Fixes

- **`FIX_ADMIN_DATA.sql`**: 
  - Inserts missing merchants from `auth.users`.
  - Sets up the `handle_new_user` trigger to automatically create merchant records on user signup.
  - Ensures default values for `is_active` and `subscription_tier`.
- **`FIX_RLS_POLICIES.sql`**: Fixes Row Level Security (RLS) policies for Supabase Storage to allow proper image uploads.

## How to Apply

You can apply these migrations using the Supabase SQL Editor in the dashboard.

1.  **Core Schema**: If starting fresh, run `supabase/schema.sql`.
2.  **Updates**: If updating an existing database, run the following in order (if not already present):
    1.  `ADD_ADMIN_COLUMN.sql`
    2.  `ADD_QR_CODE_URL_FIELD.sql`
    3.  `ADD_WEEKLY_SCHEDULE_FIELD.sql`
    4.  `ADD_EMAIL_TO_FEEDBACK.sql`
    5.  `ADD_SOCIAL_REDIRECT_FIELDS.sql`
    6.  `ADD_IMAGE_FIELDS.sql`
3.  **Fixes**: Run these to ensure data integrity and permissions:
    1.  `FIX_ADMIN_DATA.sql` (Highly recommended to fix any missing merchant records)
    2.  `FIX_RLS_POLICIES.sql` (If experiencing image upload 403 errors)

## Verification

You can verify the admin setup by running:

```sql
SELECT id, email, is_admin, is_active FROM merchants WHERE email = 'your-admin-email@example.com';
```
