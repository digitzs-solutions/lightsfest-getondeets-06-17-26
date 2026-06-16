# TokenEx Testing Guide - Working Around Origin Restrictions

## The Problem

TokenEx validates the **actual browser origin** where your page is loaded from. Currently:
- ❌ **Current Origin**: `local-credentialless.webcontainer-api.io` (BLOCKED)
- ✅ **Whitelisted Origin**: `https://hppsbqucfklrrytfftye.supabase.co` (ALLOWED)

**You cannot test TokenEx from localhost or WebContainer.**

---

## Solution Options

### Option 1: Deploy to Vercel (Recommended for Production)

#### Step 1: Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

Follow prompts to:
- Link to GitHub repo (optional)
- Set project name
- Deploy to production

#### Step 2: Get Your Vercel URL
After deployment, you'll get a URL like:
- `https://lights-festival.vercel.app`
- Or custom: `https://getondeets.ai`

#### Step 3: Request TokenEx Whitelist
Email TokenEx support with:

```
Subject: Domain Whitelist Request for TokenEx ID 3787957743127376

Hello TokenEx Support,

Please whitelist the following domain for our TokenEx account:

TokenEx ID: 3787957743127376
Domain to Whitelist: https://getondeets.ai
Alternative Domain: https://lights-festival.vercel.app

We need to process live transactions from this domain.

Thank you,
[Your Name]
```

#### Step 4: Update Environment Variables
Once whitelisted, update your `.env`:
```bash
VITE_PRODUCTION_URL=https://getondeets.ai
```

---

### Option 2: Deploy to Supabase Storage (Quick Test - Works Now!)

Since `https://hppsbqucfklrrytfftye.supabase.co` is **already whitelisted**, you can host your app there.

#### Step 1: Build Your App
```bash
npm run build
```

#### Step 2: Create Supabase Storage Bucket

1. Go to: https://supabase.com/dashboard/project/hppsbqucfklrrytfftye/storage/buckets
2. Click "Create Bucket"
3. Name it: `website`
4. Make it **Public**

#### Step 3: Upload Built Files

Upload all files from `dist/` folder to the `website` bucket:
- `dist/index.html`
- `dist/assets/`
- All other files in `dist/`

#### Step 4: Access Your App

Your app will be accessible at:
```
https://hppsbqucfklrrytfftye.supabase.co/storage/v1/object/public/website/index.html
```

**This URL is already whitelisted by TokenEx!** ✅

#### Step 5: Configure Routing

For proper routing, you may need to:
1. Upload `index.html` as the root
2. Set up redirects in Supabase (or use hash-based routing in React)

---

### Option 3: Use ngrok to Tunnel Localhost (Quick Test)

#### Step 1: Install ngrok
```bash
npm install -g ngrok
```

#### Step 2: Start Your Dev Server
```bash
npm run dev
```

#### Step 3: Create ngrok Tunnel
```bash
ngrok http 5173
```

You'll get a URL like: `https://abc123.ngrok.io`

#### Step 4: Request TokenEx Whitelist
Email TokenEx to whitelist your ngrok URL (changes each time unless you have a paid plan).

---

## Current Status Summary

### ✅ Confirmed Whitelisted Domains
- `https://hppsbqucfklrrytfftye.supabase.co` - Supabase project URL

### ⏳ Requested (Not Confirmed)
- `https://getondeets.ai`
- `https://ondeets.ai`
- `https://payvia.ai`

### ❌ Blocked (Cannot Use)
- `localhost`
- `127.0.0.1`
- WebContainer URLs
- Any non-whitelisted domain

---

## Recommended Path Forward

**For Immediate Testing:**
1. Use **Option 2** (Supabase Storage) - works right now!
2. Access app from Supabase URL
3. Test TokenEx payments

**For Production:**
1. Deploy to Vercel with custom domain (`getondeets.ai`)
2. Get TokenEx to whitelist your domain
3. Update `VITE_PRODUCTION_URL` in `.env`
4. Deploy to production

---

## Testing Checklist

Once deployed to a whitelisted domain:

- [ ] Page loads from whitelisted origin
- [ ] TokenEx iframe loads without errors
- [ ] Card number field is clickable
- [ ] CVV field is clickable
- [ ] Test card tokenizes successfully
- [ ] Kount session ID is captured
- [ ] Payment processes through Digitzs v2 API
- [ ] Transaction completes successfully

---

## Support Contacts

**TokenEx Support:**
- Email: support@tokenex.com
- Phone: Check TokenEx dashboard
- Your TokenEx ID: `3787957743127376`

**Digitzs Support:**
- API Documentation: https://api.digitzs.com/v2/docs
- Your Merchant ID: `ticketso-clevergroup-33595002-4398786-1724692895`
