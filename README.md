# TechSolve Pro — Mailer API

A lightweight Express.js API that handles contact form submissions and sends emails via Gmail SMTP. Designed to be hosted free on **Render.com**.

## Files

```
render-api/
├── server.js        ← Main API server
├── package.json     ← Dependencies
├── .env.example     ← Environment variable template
├── .gitignore       ← Keeps secrets out of Git
└── README.md        ← This file
```

## Local Development

```bash
cd render-api
npm install
cp .env.example .env   # then edit .env with your credentials
node server.js
# → API running at http://localhost:3000
```

Test it:
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","service":"design","message":"Hello"}'
```

## Deploy to Render.com (Free)

### Step 1 — Push render-api/ to GitHub

Create a **new GitHub repository** (e.g. `techsolve-mailer`) and push only the `render-api/` folder contents:

```bash
# Inside render-api/ folder
git init
git add .
git commit -m "Initial mailer API"
git remote add origin https://github.com/YOUR_USERNAME/techsolve-mailer.git
git push -u origin main
```

### Step 2 — Create a Render Web Service

1. Go to [render.com](https://render.com) → Sign up free
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo `techsolve-mailer`
4. Fill in:
   - **Name:** `techsolve-mailer`
   - **Region:** Frankfurt (EU) or nearest
   - **Branch:** `main`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** `Free`
5. Click **"Create Web Service"**

### Step 3 — Add Environment Variables on Render

In your Render service dashboard → **Environment** tab → Add:

| Key | Value |
|-----|-------|
| `GMAIL_USER` | `josephngangamunyui@gmail.com` |
| `GMAIL_APP_PASS` | `pnzsdqryxtghyisq` |
| `ADMIN_EMAIL` | `josephngangamunyui@gmail.com` |

### Step 4 — Get your Render URL

After deploy (~2 min), Render gives you a URL like:
```
https://techsolve-mailer.onrender.com
```

### Step 5 — Update contact.html

In `contact.html`, find this line:
```js
const RENDER_API = 'https://techsolve-mailer.onrender.com/api/contact';
```
Replace `techsolve-mailer` with your actual Render service name if different.

### Step 6 — Test

Visit your form and submit. You should receive:
- ✅ Admin notification email
- ✅ Client auto-reply confirmation email

## Notes

- **Cold starts:** Render free tier sleeps after 15 min inactivity. First request after sleep takes ~10s. Upgrade to Starter ($7/mo) to avoid this.
- **CORS:** Only `techsolvepro.kesug.com` and `localhost` are allowed. Update `allowedOrigins` in `server.js` if your domain changes.
- **Gmail App Password:** Never commit your real `.env` file — it's gitignored.
