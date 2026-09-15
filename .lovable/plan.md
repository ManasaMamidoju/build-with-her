# Verify Google sign-in and admin access

## What the screenshot tells us

Google sign-in now works in a private window after moving the OAuth app to Testing and adding your complete email as a test user. The regular browser was retaining stale Google authorization state.

The app and database are fine. Nothing in the code needs changing. This is a setting on the Google side.

## Keep the working Google configuration

In Google Auth Platform → Audience, keep the app in **Testing** and retain `mamidoju.manasa@gmail.com` under **Test users**.

Testing mode allows up to 100 test users and does not expire for basic email/profile sign-in, so it is fine for now. When you are ready for the public launch we submit the app for verification and switch back to production.

## Also confirm once (both take a minute)

- Google OAuth client → **Authorized redirect URIs** contains exactly:
  `https://srqnyhwknkpqrajefwjs.supabase.co/auth/v1/callback`
- Your Supabase project → Authentication → URL Configuration:
  - Site URL: `https://buildwithhermedia.com`
  - Redirect URLs: `https://id-preview--7f33a9f7-60dc-4bb6-9d8a-1e362ad4422f.lovable.app/**` and `https://buildwithhermedia.com/**`

## Verify the account landed correctly

1. Confirm the new account, profile, and admin role exist in your database.
2. Confirm the account is linked to the existing canonical person record.
3. Open Studio, People, and interview management as the signed-in admin.
4. Confirm the regular browser also works after clearing Google/Supabase site data or signing out of the stale Google session.

## Notes

No sign-in code change is currently indicated. The OAuth request uses the correct client and callback; the private-window success confirms the provider configuration is now valid.
