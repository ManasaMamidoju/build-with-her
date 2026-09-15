# Fix the Google sign-in 403

## What the screenshot tells us

Your Google app is set to **External** and **In production**, and Google is asking you to submit it for **verification**. That combination is what produces the "403: you do not have access to this page" screen you saw: an unverified app in production blocks sign-in.

The app and database are fine. Nothing in the code needs changing. This is a setting on the Google side.

## The fix (fastest path, no verification needed)

In Google Auth Platform → Audience:

1. Click **Back to testing**. This moves the app out of production so verification is no longer required.
2. Under **Test users**, click **Add users** and add `mamidoju.manasa@gmail.com` (plus any other address that needs to sign in during build-out).
3. Save.
4. Retry sign-in in a fresh private browser window. Google will show an "unverified app" warning screen; choose Advanced → continue.

Testing mode allows up to 100 test users and does not expire for basic email/profile sign-in, so it is fine for now. When you are ready for the public launch we submit the app for verification and switch back to production.

## Also confirm once (both take a minute)

- Google OAuth client → **Authorized redirect URIs** contains exactly:
  `https://srqnyhwknkpqrajefwjs.supabase.co/auth/v1/callback`
- Your Supabase project → Authentication → URL Configuration:
  - Site URL: `https://buildwithhermedia.com`
  - Redirect URLs: `https://id-preview--7f33a9f7-60dc-4bb6-9d8a-1e362ad4422f.lovable.app/**` and `https://buildwithhermedia.com/**`

## What happens after you sign in

Your account is created in your own database, the admin role is granted to your email automatically, and your name is linked to the existing records, so interviews and people are yours to manage immediately. Tell me once you are in and I will verify the admin role landed and that interview management works end to end.

## Notes

No code changes are part of this plan. If sign-in still fails after the steps above, send me the exact error text or URL from the failing screen and I will trace it from the sign-in flow.
