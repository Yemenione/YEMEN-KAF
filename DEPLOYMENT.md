# Yemen Kaf - Production Deployment Guide

Follow these steps to deploy your application to Vercel and ensure everything works perfectly.

## 1. Vercel Environment Variables

Add these key environment variables in your Vercel Dashboard (Settings > Environment Variables):

| Variable | Value |
| :--- | :--- |
| `DATABASE_URL` | `mysql://...` (Your production MySQL URL) |
| `JWT_SECRET` | `yemkaf_secret_key_2024_luxury` (Or your custom secret) |
| `NEXT_PUBLIC_SITE_URL` | `https://yemen-kaf.vercel.app` |
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `RESEND_API_KEY` | `re_...` |
| `GROQ_API_KEY` | `gsk_...` |

## 2. Flutter Production Build

When building your Flutter app for production:

1. **Web**: Run `flutter build web --release --base-href /`
2. **Android/iOS**: Ensure `kReleaseMode` is used (the code I updated will automatically pick up `https://yemen-kaf.vercel.app`).

## 3. Database Updates (Done ✅)

I have already updated your database configuration to use the production CDN paths:

- Logo: `/cdn/images/logo.png`
- Splash: `/cdn/images/logo.png`

## 4. Troubleshooting

- **CORS Issues**: I have already set up `proxy.ts` and `next.config.ts` to handle CORS automatically for your Vercel domain.
- **Image Errors**: Ensure the `public/uploads` and `public/images` folders are committed to your Git repository so Vercel can serve them.
