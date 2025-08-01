# Email Confirmation Setup Guide

## Supabase Email Configuration

The Bytewise app now includes a complete email confirmation system for new user signups. Here's how to configure it properly:

### 1. Email Confirmation Settings in Supabase

1. **Go to Authentication Settings**
   - In your Supabase dashboard, navigate to **Authentication** → **Settings**

2. **Enable Email Confirmation**
   - Under **User Signups**, make sure **Enable email confirmations** is checked
   - This ensures new users must confirm their email before accessing the app

3. **Configure Email Templates (Optional)**
   - Go to **Authentication** → **Email Templates**
   - Customize the **Confirm Signup** template with your branding:

```html
<h2>Welcome to Bytewise!</h2>
<p>Thanks for signing up! Click the link below to confirm your email address.</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
<p>If you didn't create an account with us, please ignore this email.</p>
```

### 2. Redirect URL Configuration

1. **Site URL**
   - Set your main domain: `https://your-repl-name.your-username.repl.co`

2. **Redirect URLs**
   - Add these URLs to handle different authentication flows:
   ```
   https://your-repl-name.your-username.repl.co/auth/callback
   https://your-repl-name.your-username.repl.co/?type=signup
   ```

### 3. Email Provider Setup (Production)

For production use, configure a custom email provider:

1. **SMTP Settings**
   - Go to **Settings** → **Auth** → **SMTP Settings**
   - Add your email service credentials (SendGrid, Mailgun, etc.)

2. **Domain Authentication**
   - Set up SPF and DKIM records for better deliverability
   - Use a custom domain for professional appearance

### 4. Email Confirmation Flow

The app handles three confirmation scenarios:

1. **Successful Confirmation**
   - User clicks email link
   - Account is activated
   - Redirected to login with success message

2. **Expired Link**
   - Shows expired message
   - Offers resend option
   - Stores email for resend functionality

3. **Invalid Link**
   - Shows error message
   - Provides link back to signup

### 5. Development Testing

For development, you can:

1. **Check Supabase Auth Logs**
   - Go to **Authentication** → **Users**
   - See confirmation status for each user

2. **Use Email Capture Tools**
   - Services like MailHog or Mailpit for local testing
   - View emails without actual sending

3. **Disable Email Confirmation (Testing Only)**
   - Temporarily disable for testing
   - Users will be signed in immediately after signup

### 6. User Experience Features

The confirmation system includes:

- ✅ Clear success/error messages
- ✅ Email resend functionality  
- ✅ Automatic redirect after confirmation
- ✅ Fallback handling for edge cases
- ✅ Professional email templates
- ✅ Mobile-friendly confirmation pages

### 7. Security Considerations

- Email confirmation prevents spam signups
- Verifies user owns the email address
- Required for password reset functionality
- Improves overall account security

### Troubleshooting

**Email not received:**
- Check spam/junk folder
- Verify email address spelling
- Check Supabase email quota
- Confirm SMTP settings (production)

**Confirmation link not working:**
- Check redirect URL configuration
- Verify link hasn't expired (24 hours default)
- Check for URL encoding issues

**Users bypassing confirmation:**
- Ensure "Enable email confirmations" is checked
- Verify email templates are active
- Check authentication policies

The email confirmation system provides a professional onboarding experience while ensuring account security and authenticity.