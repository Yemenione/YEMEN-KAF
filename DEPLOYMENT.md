# Yemen Kaf - Production Deployment Guide

Follow these steps to deploy your application to Vercel and ensure everything works perfectly.

## 1. Vercel Environment Variables

Add these key environment variables in your Vercel Dashboard (Settings > Environment Variables):

| Variable | Value |
| :--- | :--- |
| `DATABASE_URL` | `mysql://...` (Your production MySQL URL) |
| `JWT_SECRET` | `yemkaf_secret_key_2024_luxury` (Or your custom secret) |
| `NEXT_PUBLIC_SITE_URL` | `https://yemenimarket.fr` |
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `RESEND_API_KEY` | `re_...` |
| `GROQ_API_KEY` | `gsk_...` |

## 2. Flutter Production Build

When building your Flutter app for production:

1. **Web**: Run `flutter build web --release --base-href /`
2. **Android/iOS**: Ensure `kReleaseMode` is used (the code I updated will automatically pick up `https://yemenimarket.fr`).

## 3. Database Updates (Done ✅)

I have already updated your database configuration to use the production CDN paths:

- Logo: `/images/logo.png` (or dynamic `logo_url` in settings)
- Splash: `/images/logo.png`

## 4. Troubleshooting

- **CORS Issues**: I have already set up `proxy.ts` and `next.config.ts` to handle CORS automatically for your Vercel domain.
- **Image Errors**: Ensure the `public/uploads` and `public/images` folders are committed to your Git repository so Vercel can serve them.

## 5. cPanel / CloudLinux Deployment

If you are deploying to a cPanel host using **Node.js Selector**:

1. **Upload**: Upload the contents of `deploy.zip` to your server.
2. **DELETE `node_modules`**: You MUST delete the `node_modules` folder that was extracted from the zip file on your server file manager.
   - *Reason*: CloudLinux expects to manage this folder itself as a virtual environment. If a real folder exists, it throws the "Cloudlinux NodeJS Selector demands..." error.
3. **Install Dependencies**: In the Node.js Selector UI, click **"Run NPM Install"**.
   - This will install the correct Linux-compatible dependencies and create the required mapping.
   - *Note*: You might see an **"Error" popup** saying `npm warn deprecated node-domexception...` or similar. **This is usually just a warning.** If the button finishes loading/spinning, you can proceed.
4. **Start App**: Click "Start App".

> [!CAUTION]
> **DO NOT RUN `npm run build` ON THE SERVER.**
> Your server does not have enough RAM to build the application. We have already built it locally. Running `next build` will verify cause an "Out of memory" crash.

## 6. Troubleshooting

### "Out of memory" or "WebAssembly" Errors

If you see `RangeError: WebAssembly.Instance(): Out of memory`:

- **Cause**: The server's memory limit blocks the "Library" version of Prisma.
- **Solution**: You must switch Prisma to "Binary" mode.
- **Action**:
    1. Open your `.env` file **on the server**.
    2. Find or Add these lines:

        ```env
        PRISMA_CLI_QUERY_ENGINE_TYPE=binary
        PRISMA_CLIENT_ENGINE_TYPE=binary
        ```

    3. Save the file.
    4. Run the `db:build` script again.

### Prisma "Internal Server Error" (Critical)

If your app starts but gives **500 Internal Server Error** when checking products:

1. **Missing Folder**: You MUST upload the `prisma` folder from your computer to the server root (same level as `package.json`).
2. **Generate Client**: In cPanel Node.js Selector:
    - Locate the "Run Script" section.
    - Select **`db:build`** (or `prisma generate`).
    - Click **Run**. (Ignore any red error popup if it completes).
3. **Start App**: Then restart the application.

This ensures the database "translator" (Prisma Client) is built correctly for your server.
