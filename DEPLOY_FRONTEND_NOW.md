# Deploy Your Frontend to Accept Real Payments

## Current Situation

- Your backend (Edge Functions) is on Supabase: `https://hppsbqucfklrrytfftye.supabase.co`
- Your frontend is only on localhost (not accessible publicly)
- TokenEx needs to whitelist where your **checkout page** lives

## Quick Deploy to Vercel (5 minutes)

### Step 1: Deploy to Vercel

```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy (from project root)
vercel --prod
```

Follow the prompts - it will give you a URL like: `https://lights-festival.vercel.app`

### Step 2: Add Environment Variables to Vercel

```bash
vercel env add VITE_SUPABASE_URL
# Paste: https://hppsbqucfklrrytfftye.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY
# Paste your anon key from .env

vercel env add VITE_TICKETSOCKET_API_KEY
# Paste your TicketSocket key

vercel env add VITE_TOKENEX_ID
# Paste your TokenEx ID

vercel env add VITE_KOUNT_MERCHANT_ID
# Paste your Kount merchant ID
```

Then redeploy to pick up the env vars:
```bash
vercel --prod
```

### Step 3: Get TokenEx to Whitelist Your Vercel URL

Email TokenEx support with:

```
Subject: Whitelist Request - Production Domain

Hi TokenEx Team,

Please whitelist the following domain for TokenEx ID: [YOUR_TOKENEX_ID]

Production Domain: https://your-project.vercel.app

This is for our live event ticketing checkout.

Thanks!
```

### Step 4: Update Origin Configuration

Once TokenEx confirms the whitelist, update the code to use your Vercel URL as the origin.

## Alternative: Use Netlify or Cloudflare Pages

If you prefer different hosting:

### Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```

### Cloudflare Pages
```bash
npm i -g wrangler
wrangler pages deploy dist
```

## Why This Matters

TokenEx validates that the page requesting tokenization is on an approved domain. They currently have:
- ✅ `https://hppsbqucfklrrytfftye.supabase.co` (but your frontend isn't there)
- ❌ localhost (not whitelisted for security)

You need:
- ✅ Your Vercel/Netlify URL whitelisted
- ✅ Your frontend deployed to that URL
- ✅ Origin in code matches the whitelisted URL

## Testing Checklist

After deployment:
1. Visit your Vercel URL
2. Navigate to Lights Festival
3. Try to book tickets
4. TokenEx iframe should load
5. Real card transaction should process

## Current URLs

- **Backend (Edge Functions)**: https://hppsbqucfklrrytfftye.supabase.co/functions/v1/
- **Frontend (needs deployment)**: Deploy to Vercel first
- **Local Dev**: localhost (won't work with live TokenEx)
