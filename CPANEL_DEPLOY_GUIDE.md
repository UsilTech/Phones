# Deploying GsmScope to cPanel (Root Domain: gsmscope.com)

This application is a **full-stack Node.js + React application**. It includes an Express backend (`server.ts` via `app.cjs`) that persists your admin dashboard data (`data/database.json`), handles media uploads (`/uploads`), and serves the compiled frontend (`dist/`).

---

## Prerequisites
- cPanel hosting with **Setup Node.js App** (CloudLinux / Phusion Passenger / LiteSpeed).
- Root domain **gsmscope.com** pointed to your cPanel nameservers or server IP (A record).
- Node.js 18+ or 20+ (Node 20 LTS recommended).

---

## Step 1: Build the App (Locally or on Server)
Before uploading, build the frontend `dist` directory:

1. On your local machine (inside the extracted GitHub project folder):
   ```bash
   npm install
   npm run build
   ```
2. Confirm the `dist/` folder was created.

---

## Step 2: Create Node.js App in cPanel
1. Log into your **cPanel**.
2. Scroll to the **Software** section and click **Setup Node.js App**.
3. Click **Create Application**.
4. Fill in the fields:
   - **Node.js Version**: Select **20.x** (or highest LTS available: 18.x / 22.x).
   - **Application Mode**: **Production**.
   - **Application Root**: `gsmscope` (or `app`, which creates a folder under `/home/username/`).
   - **Application URL**: Select `gsmscope.com` (leave subpath empty for root domain).
   - **Application Startup File**: `app.cjs`
5. Click **Create**.
6. cPanel will start a placeholder application and show a banner with an **enter virtual environment** command at the top.

---

## Step 3: Upload Project Files to cPanel
1. On your computer, select all files **except** `node_modules` (to keep zip size small):
   - `dist/` (from Step 1)
   - `data/`
   - `uploads/`
   - `public/`
   - `src/`
   - `app.cjs`
   - `server.ts`
   - `package.json`
   - `package-lock.json`
   - `tsconfig.json`
   - `vite.config.ts`
   - `index.html`
   - `.env.example`
2. Compress into a `.zip` file (e.g. `gsmscope-deploy.zip`).
3. In cPanel, open **File Manager**.
4. Navigate to your Application Root folder (e.g. `/home/yourusername/gsmscope/`).
5. Click **Upload** and upload your `.zip` file.
6. Once uploaded, right-click the zip file and click **Extract**.
7. Ensure files are directly in the Application Root folder (not nested in an extra subfolder).

---

## Step 4: Install Server Dependencies
You have two easy ways:

### Option A: Via cPanel GUI (Easiest)
1. In cPanel, go back to **Setup Node.js App**.
2. Click the edit pencil icon next to `gsmscope.com`.
3. Under **Detected configuration files**, click **Run NPM Install**.
4. Wait 1–2 minutes for the installation to finish.

### Option B: Via cPanel Terminal
1. In cPanel, open **Terminal**.
2. Copy and paste the "Enter virtual environment" command shown on your Node.js App page (e.g. `source /home/username/nodevenv/gsmscope/20/bin/activate && cd /home/username/gsmscope`).
3. Run:
   ```bash
   npm install
   ```

---

## Step 5: Environment Variables & Permissions Check
1. In cPanel **Setup Node.js App** (edit your `gsmscope.com` application), scroll to **Environment variables** and click **Add Variable**:
   - `NODE_ENV` = `production`
   - `GEMINI_API_KEY` = *(Your Google Gemini API key — enables the Admin Dashboard AI Spec Sourcer & Review Assistant)*
   - *(Optional for outbound SMTP emails)* `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
2. In cPanel **File Manager**, ensure write permissions for data persistence:
   - `data/` folder: `755` (or `775` if needed)
   - `uploads/` folder: `755` (or `775` if needed)
   - `public/uploads/` folder: `755` (or `775` if needed)

This ensures your admin changes (new brands, phones, articles, ad settings, custom scripts) and image uploads persist across server restarts.

---

## Step 6: Restart & Test Connections
1. In **Setup Node.js App**, click **Restart Application**.
2. Visit **https://gsmscope.com/api/health** in your browser to verify that `status: "healthy"`, `cpanelStartupReady: true`, `distReady: true`, and `storage.dataDirWritable: true` are all active.
3. Visit **https://gsmscope.com** and log into **https://gsmscope.com/admin** (under **Database Tools**, click **Test All Connections** anytime to verify live health).

---

## Troubleshooting
- **Blank Screen Fix**:
  1. Ensure the `dist/` folder is uploaded/extracted directly into your application root folder alongside `package.json` and `server.ts`.
  2. If building on the server via cPanel Terminal, run `npm run build` directly. `npm install` runs cleanly without postinstall script memory bottlenecks.
  3. The backend server also includes automatic dynamic Vite transformer fallback to serve the UI even if `dist/` is rebuilding.
  4. Ensure your domain or IP has finished pointing to the server. If testing on HTTP, the server will no longer force unwanted HTTPS redirects or block insecure script requests.
- **Port issues**: In cPanel Passenger, you do not need to manually configure a `PORT` variable; cPanel routes domain requests into `app.cjs` via a Unix domain socket automatically.
- **SSL Certificate**: Go to cPanel > **SSL/TLS Status** > click **Run AutoSSL** to ensure free HTTPS certificate is active for `gsmscope.com`.
- **Backend Health Check**: Open `https://gsmscope.com/api/health` (or `http://your-domain/api/health`) to confirm that Node.js, Express, storage permissions, and database are healthy.

