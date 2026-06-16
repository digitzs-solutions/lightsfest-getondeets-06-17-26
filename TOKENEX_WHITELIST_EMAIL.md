# TokenEx Domain Whitelist Request

## Email to TokenEx Support

**To:** support@tokenex.com
**Subject:** Whitelist Request - Add Production Domains for TokenEx ID 3787957743127376

---

**Email Body:**

```
Hello TokenEx Support Team,

We need to whitelist the following production domains for our Lights Festival checkout system:

TokenEx ID: 3787957743127376
Account: CleverGroup/Lights Festival

Please whitelist these domains:
1. https://getonedeets.ai
2. https://ondeets.ai
3. https://payvia.ai

These domains will be used for our production checkout flow with TokenEx Transparent Gateway integration.

Current Setup:
- Integration Type: Transparent Gateway (iframe)
- Token Scheme: sixTOKENfour
- Authentication: HMAC enabled
- Currently Whitelisted: https://hppsbqucfklrrytfftye.supabase.co

Please confirm once these domains have been added to the whitelist.

Thank you!
Best regards,
[Your Name]
```

---

## Alternative: Self-Service via TokenEx Portal

If you have portal access:

1. Login: https://portal.tokenex.com
2. Navigate to: **Settings → Allowed Origins** (or **API Settings → CORS**)
3. Add these domains:
   - `https://getonedeets.ai`
   - `https://ondeets.ai`
   - `https://payvia.ai`
4. Click **Save**

---

## Important Notes

### Why You Can't Use the Current Dev URL
The current WebContainer URL:
```
https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci3-ka1o1yy6--5173--4c73681d.local-credentialless.webcontainer-api.io
```

**Cannot be whitelisted** because:
- It's a temporary development container URL
- It changes every time you restart the development environment
- TokenEx requires stable, production domains

### What Works Right Now
✅ **Supabase URL**: `https://hppsbqucfklrrytfftye.supabase.co` (already whitelisted)

### What Will Work After Whitelisting
⚠️ Pending TokenEx approval:
- `https://getonedeets.ai`
- `https://ondeets.ai`
- `https://payvia.ai`

---

## Deployment Steps (Once Whitelisted)

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Deploy to Vercel** (or your hosting platform):
   - Connect your domain (getonedeets.ai, ondeets.ai, or payvia.ai)
   - Deploy the `dist` folder
   - Set environment variables from `.env`

3. **Update VITE_PRODUCTION_URL** in `.env`:
   ```
   VITE_PRODUCTION_URL=https://getonedeets.ai
   ```

4. **Test the checkout flow**:
   - Visit your domain
   - Click "Get Your Tickets"
   - Fill out checkout form
   - Enter test card: 4111 1111 1111 1111
   - Complete transaction

---

## Testing Checklist

Once domains are whitelisted, verify:

- [ ] TokenEx iframe loads without CORS errors
- [ ] Card tokenization succeeds
- [ ] Payment processes through ProPay
- [ ] Kount session ID is captured
- [ ] Transaction appears in ProPay dashboard
- [ ] Registration is saved to Supabase

---

## Current Configuration

**App is configured to use**: `https://getonedeets.ai` (in .env file)

**To switch domains**, update this line in `.env`:
```bash
VITE_PRODUCTION_URL=https://ondeets.ai  # or payvia.ai
```

Then rebuild and redeploy.

---

## Need Help?

If you get stuck:
1. Check TokenEx portal for whitelist status
2. Email support@tokenex.com with your TokenEx ID
3. Test on https://hppsbqucfklrrytfftye.supabase.co (currently working)
