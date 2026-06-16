# Deploy Lights Festival NOW (Without Touching ondeets.ai)

## Quick Deploy to Vercel - Get a Public URL in 5 Minutes

This will create a **completely separate deployment** (like `lightsfest-demo.vercel.app`) without touching ondeets.ai or getonedeets.ai.

---

## Option 1: Deploy via Vercel CLI (Fastest)

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
cd /path/to/your/project
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account/team
- **Link to existing project?** → No
- **What's your project's name?** → `lightsfest-demo` (or any name)
- **In which directory is your code located?** → `./`
- **Want to modify settings?** → No

Vercel will:
1. Build your project
2. Deploy it
3. Give you a URL like: `https://lightsfest-demo.vercel.app`

### Step 4: Set Environment Variables
```bash
vercel env add VITE_SUPABASE_URL
# Paste: https://hppsbqucfklrrytfftye.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcHNicXVjZmtscnJ5dGZmdHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTIzNDMsImV4cCI6MjA4OTY4ODM0M30.e_XiXMdvIMyRX6noViWDUm9T7JTIhl0hRqpIsBVKKvk
```

Then redeploy:
```bash
vercel --prod
```

**Done! You now have a stable public URL to whitelist in TokenEx.**

---

## Option 2: Deploy via Vercel Dashboard (No CLI Required)

### Step 1: Create GitHub Repo
If your code isn't on GitHub yet:

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Lights Festival production ready"

# Create a repo on GitHub: https://github.com/new
# Name it something like: lightsfest-demo

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/lightsfest-demo.git
git branch -M main
git push -u origin main
```

### Step 2: Import to Vercel
1. Go to: https://vercel.com/new
2. Click **Import Git Repository**
3. Select your `lightsfest-demo` repo
4. Configure:
   - **Project Name**: `lightsfest-demo`
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (already set in vercel.json)
   - **Output Directory**: `dist` (already set in vercel.json)

5. **Add Environment Variables**:
   ```
   VITE_SUPABASE_URL = https://hppsbqucfklrrytfftye.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcHNicXVjZmtscnJ5dGZmdHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTIzNDMsImV4cCI6MjA4OTY4ODM0M30.e_XiXMdvIMyRX6noViWDUm9T7JTIhl0hRqpIsBVKKvk
   ```

6. Click **Deploy**

Wait 2-3 minutes for deployment to complete.

### Step 3: Get Your URL
- Vercel will show you the deployment URL
- Example: `https://lightsfest-demo.vercel.app`
- **Save this URL** - this is what you'll whitelist in TokenEx

---

## Option 3: Use Netlify (Alternative)

If you prefer Netlify over Vercel:

### Via Netlify CLI
```bash
npm i -g netlify-cli
netlify login
netlify deploy --prod
```

### Via Netlify Dashboard
1. Go to: https://app.netlify.com/start
2. Import from GitHub
3. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Add environment variables (same as above)
5. Deploy

---

## What to Do After Deployment

### 1. Copy Your Deployment URL
```
https://lightsfest-demo.vercel.app
(or whatever URL you get)
```

### 2. Test That It Works
- Open the URL in your browser
- Click "Get Tickets"
- You should see the checkout modal
- **TokenEx iframe won't load yet** (because not whitelisted)

### 3. Request TokenEx Whitelisting
Send this to Tristan/Tommy when they're available:

---

**Subject: TokenEx Whitelisting Request - Lights Festival Demo**

Hi Tristan/Tommy,

I've deployed the Lights Festival checkout to test live transactions:

**URL to whitelist:** `https://lightsfest-demo.vercel.app`

Please whitelist this URL in the TokenEx dashboard:
1. Login to TokenEx Portal
2. Settings → Allowed Origins
3. Add: `https://lightsfest-demo.vercel.app`

Once whitelisted, I'll be able to run live end-to-end tests and see data flowing through TokenEx → Kount 360 → Digitzs v2 → ProPay → MyIQ.

Thanks!

---

### 4. Once Whitelisted, Test Live Transaction
- Go to your deployment URL
- Click "Get Tickets"
- Complete checkout with test card: `4111111111111111`
- Watch transaction flow through all systems

---

## Checking Your Edge Functions

Your Supabase Edge Functions are already deployed and working:
```
✅ tokenex-auth - Generates HMAC authentication
✅ payvia-process - Processes payments via Digitzs v2/ProPay
✅ ticketsocket - Creates ticket orders
```

You can verify they're accessible:
```bash
# Test tokenex-auth endpoint
curl -X POST https://hppsbqucfklrrytfftye.supabase.co/functions/v1/tokenex-auth \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"tokenScheme":"sixTOKENfour","origin":"https://lightsfest-demo.vercel.app"}'
```

---

## Summary

**Current Status:**
- ✅ Frontend built and tested
- ✅ Edge functions deployed to Supabase
- ✅ Database configured
- ✅ Ready for deployment

**Your Next Steps:**
1. Deploy to Vercel (Option 1 or 2 above) - **5 minutes**
2. Get deployment URL
3. Share URL with Tristan/Tommy for TokenEx whitelisting
4. Test live transactions once whitelisted

**This is completely separate from ondeets.ai and getonedeets.ai - no risk of interfering with those sites.**

---

## Need Help?

If you run into any issues:
- Check build logs in Vercel/Netlify dashboard
- Verify environment variables are set correctly
- Make sure all files are committed to git
- Test locally first: `npm run build && npm run preview`

---

**Let's get this deployed and whitelisted so you can run live transactions!**
