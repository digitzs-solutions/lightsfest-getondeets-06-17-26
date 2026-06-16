# Deploy to Vercel - One Command Setup

## Quick Deploy (2 minutes)

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Deploy
```bash
vercel
```

That's it! Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **Project name?** → (press enter for default or type: lightsfest)
- **Directory?** → ./ (press enter)
- **Override settings?** → No

### 3. Add Environment Variables

After first deploy, add your secrets:

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_TICKETSOCKET_API_KEY
vercel env add VITE_TOKENEX_TOKEN_SCHEME
vercel env add VITE_TOKENEX_AUTHENTICATION_KEY
```

Then redeploy:
```bash
vercel --prod
```

### 4. Get Your Production URL

You'll get a URL like:
```
https://lightsfest-abc123.vercel.app
```

**This URL is stable and won't change** - perfect for TokenEx whitelisting!

---

## What Gets Deployed

✅ All React apps (Lights Festival, Dino World, PayVia landing)
✅ Supabase Edge Functions (via Supabase platform)
✅ Full checkout flow with TokenEx iframe
✅ Database connections (already configured)

---

## Sharing with Tristan

1. Send him the Vercel URL
2. Both of you can test simultaneously
3. All data saves to the same Supabase database
4. You'll see each other's test registrations in real-time

---

## TokenEx Whitelisting

Once deployed, send TokenEx support:

**Production Domain to Whitelist:**
```
https://your-project-name.vercel.app
```

They need to add this to your allowed domains list.

---

## Future Updates

Just run:
```bash
vercel --prod
```

Takes 30 seconds to deploy updates.

---

## Need Help?

The `vercel.json` is already configured. Just run the commands above!
