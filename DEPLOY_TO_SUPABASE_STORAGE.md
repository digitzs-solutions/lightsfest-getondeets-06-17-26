# Deploy to Supabase Storage - TokenEx Testing

Since `https://hppsbqucfklrrytfftye.supabase.co` is already whitelisted by TokenEx, we can host the app there for immediate testing.

## Step 1: Build the App

Already done! The `dist/` folder contains your production build.

## Step 2: Create a Public Storage Bucket

1. Go to Supabase Dashboard:
   https://supabase.com/dashboard/project/hppsbqucfklrrytfftye/storage/buckets

2. Click **"New bucket"**

3. Configure bucket:
   - **Name**: `app`
   - **Public bucket**: ✅ Enable (important!)
   - Click **Create bucket**

## Step 3: Upload Files

1. Click on the `app` bucket you just created

2. Upload all files from the `dist/` folder:
   - `index.html`
   - `assets/` folder (contains JS and CSS)
   - Any other files in `dist/`

**Important**: Maintain the folder structure! Upload the `assets/` folder as-is.

## Step 4: Access Your App

Your app will be accessible at:

```
https://hppsbqucfklrrytfftye.supabase.co/storage/v1/object/public/app/index.html
```

## Step 5: Test TokenEx

1. Open the URL above in your browser
2. Navigate to the Lights Festival page
3. Click "Get Tickets" on any event
4. Go through the checkout flow
5. Enter payment details in the TokenEx iframe

**This should work now because:**
- ✅ Page is served from `https://hppsbqucfklrrytfftye.supabase.co`
- ✅ TokenEx expects origin: `https://hppsbqucfklrrytfftye.supabase.co`
- ✅ Domain is already whitelisted by TokenEx

## Alternative: Supabase Edge Function for Hosting

Instead of Storage, you could also create an Edge Function that serves the HTML. This gives you more control over routing.

### Create hosting edge function:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const indexHtml = await Deno.readTextFile("./index.html");

serve(async (req) => {
  const url = new URL(req.url);

  if (url.pathname === "/" || url.pathname === "/index.html") {
    return new Response(indexHtml, {
      headers: { "content-type": "text/html" },
    });
  }

  return new Response("Not Found", { status: 404 });
});
```

Then deploy with:
```bash
supabase functions deploy app-host
```

Access at:
```
https://hppsbqucfklrrytfftye.supabase.co/functions/v1/app-host
```

## Troubleshooting

### Assets Not Loading

If CSS/JS files don't load, check:
1. Assets are in `app/assets/` folder in Storage
2. Paths in `index.html` are relative (not absolute)
3. Bucket is public

### TokenEx Still Fails

If TokenEx still shows origin errors:
1. Open browser DevTools Console
2. Check what origin TokenEx sees
3. Verify you're accessing via Supabase URL (not localhost)
4. Clear browser cache and try again

## Next Steps

Once TokenEx works from the Supabase URL, you can:

1. **Deploy to Vercel** with custom domain (`getondeets.ai`)
2. **Request TokenEx whitelist** for your custom domain
3. **Update** `VITE_PRODUCTION_URL` to your custom domain
4. **Rebuild and redeploy** to production

For now, the Supabase Storage deployment lets you test the full payment flow immediately!
