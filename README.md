# AURA — Luxury E-Commerce & Interior Design Atelier

This project is a premium monorepo featuring a Next.js frontend and a Node.js Express backend mock API.

## Repository Structure
- [/frontend](file:///d:/fintrack/sale%20website/frontend) — Next.js client application with Tailwind CSS and premium UI layouts.
- [/backend](file:///d:/fintrack/sale%20website/backend) — Express REST API serving product data, dashboard metrics, and custom design inquiries.

---

## 1. Preparing for Git and Pushing to GitHub

To make the codebase pushable to GitHub, follow these commands in your local terminal:

```bash
# 1. Initialize a new git repository
git init

# 2. Add all files (the root-level .gitignore will prevent node_modules and .next caches from being added)
git add .

# 3. Commit the codebase
git commit -m "feat: complete luxury e-commerce codebase with password-guarded admin panel"

# 4. Link to your GitHub remote repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 5. Push to the main branch
git branch -M main
git push -u origin main
```

---

## 2. Deploying the Frontend to Vercel

Vercel is optimized for Next.js and will compile production builds automatically.

### Steps to Deploy:
1. Log in to [Vercel](https://vercel.com) and click **Add New** > **Project**.
2. Import your GitHub repository.
3. In the **Configure Project** step:
   - Change the **Root Directory** setting to `frontend`.
   - Toggle on the setting to run builds from this folder.
4. Under **Environment Variables**, add the following key and value:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://your-deployed-backend-api.com/api` (this should point to your live backend server URL once deployed).
5. Click **Deploy**.

---

## 3. Deploying the Backend Server

Since the backend API writes to local JSON files (`inquiries.json` and `products.json`), it should be deployed to a server hosting provider that supports persistent storage or processes (e.g., Render, Railway, or Fly.io).

### Steps to Deploy on Render:
1. Log in to [Render](https://render.com) and click **New** > **Web Service**.
2. Connect your GitHub repository.
3. In the configuration:
   - Set **Root Directory** to `backend`.
   - Set **Build Command** to `npm install`.
   - Set **Start Command** to `npm start`.
4. Render will deploy your Express server and provide a public URL (e.g., `https://aura-backend.onrender.com`).
5. Copy this URL, append `/api` (e.g., `https://aura-backend.onrender.com/api`), and use it as the `NEXT_PUBLIC_API_URL` environment variable for your Vercel frontend deployment.

---

## Local Development Quickstart

To run both applications locally:

### 1. Start the Backend API (Port 5000)
```bash
cd backend
npm install
npm run dev
```

### 2. Start the Frontend Next.js client (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
