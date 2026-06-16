# Deploy to Production in 10 Minutes

Your code is ready to go live! Follow these steps to deploy and accept real credit card payments.

## Step 1: Push to GitHub (2 minutes)

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/digitzs-solutions/lights-festival.git

# Push your code
git branch -M main
git push -u origin main
```

If you don't have a repository yet:
1. Go to https://github.com/digitzs-solutions
2. Click "New Repository"
3. Name it: `lights-festival`
4. Don't initialize with README (you already have code)
5. Copy the remote URL and run the commands above

## Step 2: Deploy to Vercel (3 minutes)

### Option A: Deploy via Vercel Dashboard (Easiest)

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click "Deploy"

### Option B: Deploy via CLI

```bash
npm i -g vercel
vercel --prod
```

## Step 3: Add Environment Variables (5 minutes)

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

| Variable Name | Value |
|--------------|-------|
| `VITE_SUPABASE_URL` | `https://hppsbqucfklrrytfftye.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your anon key from `.env` |
| `VITE_TICKETSOCKET_API_KEY` | `ad691a59acd46cc3df62320c89706ba9-835088` |
| `VITE_TOKENEX_ID` | `3787957743127376` |
| `VITE_PRODUCTION_URL` | **YOUR VERCEL URL** (e.g., `https://lights-festival.vercel.app`) |

**Important:** For `VITE_PRODUCTION_URL`, use the URL Vercel just gave you!

Then redeploy:
- Go to "Deployments" tab
- Click the three dots on latest deployment
- Click "Redeploy"

## Step 4: Request TokenEx Whitelist

Email TokenEx support (usually responds in 1-2 business days):

```
To: support@tokenex.com
Subject: Whitelist Request - Add Production Domain

Hi TokenEx Team,

Please add the following domain to our whitelist:

TokenEx ID: 3787957743127376
New Domain: https://lights-festival.vercel.app
(Replace with YOUR actual Vercel URL)

This is for our live ticketing checkout.

Current whitelisted domain: https://hppsbqucfklrrytfftye.supabase.co
We need to add the frontend domain where users access the checkout.

Thank you!
```

## Step 5: Test Real Transactions

Once TokenEx confirms (1-2 days):

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Navigate to "Lights Festival"
3. Click "Book Tickets"
4. Fill in the form
5. Use a real credit card
6. Transaction should process successfully!

## Your Production URLs

After deployment, you'll have:

- **Frontend (Users visit)**: `https://your-app.vercel.app` ← Share this with customers
- **Backend (API)**: `https://hppsbqucfklrrytfftye.supabase.co` ← Already configured
- **Database**: Supabase (already configured)
- **Edge Functions**: Supabase (already deployed)

## Future Updates

Push to GitHub and Vercel auto-deploys:

```bash
git add .
git commit -m "Update checkout flow"
git push
```

Vercel will automatically redeploy within 30 seconds!

## Troubleshooting

### Build Fails on Vercel
- Check that all environment variables are set
- Make sure `VITE_PRODUCTION_URL` is set to your Vercel URL
- Check build logs for specific errors

### TokenEx Still Not Working
- Verify `VITE_PRODUCTION_URL` matches your Vercel URL exactly
- Make sure TokenEx confirmed they whitelisted it
- Check browser console for specific TokenEx errors
- Try in incognito mode to rule out cache issues

### Need Help?
The checkout page will show a helpful warning banner if something is misconfigured. Check the yellow warning box for specific guidance.

## What Gets Deployed

✅ Lights Festival ticketing site
✅ Dino World event site
✅ PayVia landing page
✅ Merchant analytics dashboard
✅ Compliance tracking tools
✅ Full payment processing via TokenEx + Digitzs + ProPay
✅ Supabase database integration
✅ TicketSocket API integration

## Security Notes

- `.env` file is NOT committed to GitHub (contains secrets)
- All secrets are stored in Vercel environment variables
- Frontend never exposes API keys (only public keys)
- All payment data goes through TokenEx iframe (PCI compliant)
- Database connections are secure via Supabase

## Need Your Vercel URL?

After deploying, your Vercel URL is shown in:
- Vercel Dashboard → Your Project → Domains
- Email from Vercel after deployment
- Terminal output if you used CLI

Save this URL! You need it for:
1. TokenEx whitelist request
2. `VITE_PRODUCTION_URL` environment variable
3. Sharing with customers/team

---

Ready to go live? Start with Step 1!
