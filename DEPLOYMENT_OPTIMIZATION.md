# Local Build & Deployment Workflow (Hostinger)

Because Hostinger shared hosting has limited RAM, you should **never** run `npm run build` on the server. Follow these steps for a lightning-fast experience.

## 1. Prepare Locally (on your computer)

1. Open your terminal in the project folder.
2. Run the build command:

   ```bash
   npm run build
   ```

3. This will create a `.next/standalone` folder.

## 2. Upload to Hostinger

1. In Hostinger Panel, go to **File Manager**.
2. Go to your domain's folder (e.g., `public_html/yemkaf`).
3. Upload the content of `.next/standalone`.
4. Upload the **Public** folder to `.next/standalone/public`.
5. Upload the **Static** assets from `.next/static` to `.next/standalone/.next/static`.

## 3. Configure Node.js (Hostinger Panel)

1. Go to **Node.js Dashboard** in Hostinger.
2. Set the **Application Root** to your upload directory.
3. Set the **Startup File** to `server.js`.
4. Add Environment Variables (DATABASE_URL, etc.) in the Hostinger panel instead of a `.env` file for better security and performance.
5. Click **Start** or **Restart**.

## Why this works?

- **No Build Lag**: All the heavy work happens on your computer.
- **Standalone Mode**: Node.js only loads what is strictly necessary, saving RAM.
- **ISR**: Pages are pre-rendered into static HTML, so the server just "sends the file" instead of thinking.
