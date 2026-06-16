# Why Real Payments Don't Work Yet (And How to Fix It)

## The Problem Explained Simply

You have **two different websites**:

1. **Your Backend API** (Supabase Edge Functions)
   - URL: `https://hppsbqucfklrrytfftye.supabase.co`
   - This handles payment processing behind the scenes
   - ✅ This IS whitelisted with TokenEx

2. **Your Frontend Website** (The checkout page users see)
   - Current location: Only on localhost (your computer)
   - URL: `http://localhost:5173` or WebContainer URL
   - ❌ This is NOT whitelisted (and can't be for security)
   - ❌ Your checkout page is not publicly accessible

## Why TokenEx Needs to Whitelist Your Frontend

TokenEx needs to know:
- Where is the checkout page coming from?
- Is it a legitimate, approved website?
- Should we trust this domain to collect card data?

They whitelist **where the user sees the payment form**, not where the API lives.

## Current Situation

```
User visits → localhost:5173 (NOT whitelisted)
                   ↓
            TokenEx blocks it
                   ↓
            Payment form won't work
```

## What You Need

```
User visits → your-app.vercel.app (NEEDS to be whitelisted)
                   ↓
            TokenEx allows it
                   ↓
            Payment form works
                   ↓
            Calls your Supabase backend
                   ↓
            Transaction processes
```

## How to Fix This (3 Steps)

### Step 1: Deploy Your Frontend to Vercel

Your checkout page needs to be publicly accessible.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from your project directory
cd /path/to/your/project
vercel --prod
```

**Follow the prompts:**
- Set up and deploy? → **Yes**
- Which scope? → Your account
- Link to existing project? → **No**
- Project name? → **lights-festival** (or whatever you want)
- Override settings? → **No**

You'll get a URL like: `https://lights-festival-xyz123.vercel.app`

**SAVE THIS URL!** You need it for the next steps.

### Step 2: Configure Environment Variables on Vercel

```bash
# Add each environment variable (Vercel will prompt you to paste the value)
vercel env add VITE_SUPABASE_URL
# Paste: https://hppsbqucfklrrytfftye.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY
# Paste your anon key from .env file

vercel env add VITE_TICKETSOCKET_API_KEY
# Paste your TicketSocket key

vercel env add VITE_TOKENEX_ID
# Paste: 3787957743127376

vercel env add VITE_KOUNT_MERCHANT_ID
# Paste your Kount merchant ID

vercel env add VITE_PRODUCTION_URL
# Paste YOUR VERCEL URL from Step 1 (like: https://lights-festival-xyz123.vercel.app)
```

Then redeploy to use the new variables:
```bash
vercel --prod
```

### Step 3: Request TokenEx Whitelist Your Vercel URL

Email TokenEx support:

```
To: support@tokenex.com
Subject: Whitelist Request - Production Domain

Hi TokenEx Team,

Please whitelist the following domain for our TokenEx account:

TokenEx ID: 3787957743127376
Production Domain: https://lights-festival-xyz123.vercel.app
(Replace with YOUR actual Vercel URL)

Purpose: Live event ticketing checkout for Lights Festival

Currently, only our backend Supabase URL is whitelisted, but our
frontend checkout page is hosted on Vercel.

Thank you!
```

### Step 4: Test Real Transactions

Once TokenEx confirms (usually 1-2 business days):

1. Visit your Vercel URL: `https://lights-festival-xyz123.vercel.app`
2. Go to Lights Festival page
3. Click "Book Tickets"
4. Enter real card details
5. Transaction should process successfully

## Why This Was Confusing

- Supabase URL (`https://hppsbqucfklrrytfftye.supabase.co`) is for your **API/backend**
- Your **frontend** (React app) needs to be deployed separately
- TokenEx needs to whitelist wherever users access your checkout page

## Alternative: Try StackBlitz or Vercel Preview URLs

If you want to test quickly without waiting for TokenEx:

1. **Deploy to Vercel** (as above)
2. Email TokenEx to whitelist your Vercel URL
3. They'll update their whitelist within 1-2 business days
4. Then you can run real transactions

## Check Your Current Status

Open the checkout page and look for the yellow warning banner.

It will tell you:
- If you're on localhost (won't work)
- What URL is currently whitelisted
- Steps to fix it

## Questions?

**Q: Can I just use the Supabase URL for my frontend?**
A: No, Supabase hosting is only for Edge Functions, not frontend apps.

**Q: Why can't localhost be whitelisted?**
A: Security. Anyone could run localhost. TokenEx only allows public, stable URLs.

**Q: How long does TokenEx whitelist take?**
A: Usually 1-2 business days via email support.

**Q: Can I use Netlify instead of Vercel?**
A: Yes! Any hosting platform works (Netlify, Cloudflare Pages, etc.)

## Current Configuration

- **Backend API**: `https://hppsbqucfklrrytfftye.supabase.co` ✅
- **Frontend**: Not deployed yet ❌
- **TokenEx Whitelist**: Backend only (frontend needed) ⚠️
