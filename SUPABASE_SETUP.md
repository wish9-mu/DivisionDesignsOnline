# Supabase Setup Instructions

This guide will walk you through setting up Supabase authentication for Division Designs.

## Step 1: Create a Supabase Account and Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign up (you can use GitHub login)
3. Once logged in, click "New Project"
4. Fill in your project details:
   - **Name**: Division Designs (or any name you prefer)
   - **Database Password**: Create a strong password (save this somewhere safe)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Free tier is sufficient for development
5. Click "Create new project" and wait for setup to complete (1-2 minutes)

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, click on the **Settings** icon (gear icon) in the left sidebar
2. Click on **API** in the settings menu
3. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (a long JWT token)
4. Copy these values - you'll need them in the next step

## Step 3: Configure Environment Variables

1. In your project root directory, you should see a file named `.env.local`
2. Open `.env.local` and replace the placeholder values:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Save the file
4. **Important**: Never commit this file to GitHub (it's already in .gitignore)

## Step 4: Enable Email Auth (Optional - Default is already enabled)

1. In your Supabase dashboard, go to **Authentication** > **Providers**
2. Email provider should be enabled by default
3. You can configure email templates under **Authentication** > **Email Templates**

## Step 5: Configure Email Settings (Important for Production)

By default, Supabase uses their email service which has limitations. For development, this is fine.

1. Go to **Authentication** > **URL Configuration**
2. Add your site URL (e.g., `http://localhost:5173` for development)
3. Add redirect URLs for authentication callbacks

## Step 6: Test Your Setup

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to the sign-up page and create a test account
3. Check your email for a confirmation link (in development, emails may go to Supabase's inbox)
4. Confirm your account and try signing in

## Step 7: View Users in Supabase Dashboard

1. Go to **Authentication** > **Users** in your Supabase dashboard
2. You should see any users who have signed up
3. You can manually verify users or manage them from this panel

## Email Confirmation

By default, Supabase requires email confirmation. Users will receive a confirmation email after signing up. To disable this for development:

1. Go to **Authentication** > **Settings**
2. Turn off "Enable email confirmations"
3. Save changes

## Step 8: Deploy Edge Functions (for Paymongo Integration)

Our checkout system integrates with Paymongo securely via Supabase Edge Functions. To ensure this works in production:

1. Install Supabase CLI: `npm i -g supabase` or run commands via `npx supabase`.
2. Link your local project to your remote Supabase instance:
   ```bash
   npx supabase link --project-ref your-project-ref
   ```
3. Set your Paymongo Secret Key in your Supabase project's vault:
   ```bash
   npx supabase secrets set PAYMONGO_SECRET_KEY=sk_test_...
   ```
4. Deploy the functions:
   ```bash
   npx supabase functions deploy create-paymongo-checkout
   npx supabase functions deploy paymongo-webhook
   ```
5. In your Paymongo Dashboard, add a Webhook for `checkout_session.payment.paid` pointing to your deployed webhook URL:
   `https://<your-project-ref>.supabase.co/functions/v1/paymongo-webhook`

## Troubleshooting

### "Invalid API key" error

- Check that your `.env.local` file has the correct values
- Make sure you restart your dev server after changing `.env.local`
- Verify the values match exactly what's in your Supabase dashboard

### Email not arriving

- Check your spam folder
- In development, Supabase has rate limits on emails
- You can manually verify users in the Supabase dashboard

### "User already registered" error

- This means the email is already in use
- Delete the user in Supabase dashboard or use a different email

## Next Steps

Once authentication is working:

- Update the ProfilePage to display user information
- Add sign out functionality to the Navbar
- Protect routes that require authentication
- Store additional user data in Supabase database tables

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/auth-signup)
- [React Auth Tutorial](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)
