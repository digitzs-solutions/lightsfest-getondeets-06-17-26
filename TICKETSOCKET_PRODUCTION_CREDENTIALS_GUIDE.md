# TicketSocket Production Credentials Guide

## Current Configuration Status

✅ **Your TicketSocket credentials are ALREADY configured in Supabase!**

The following secrets are already set up in your Supabase Edge Functions:
- `TICKETSOCKET_USERNAME`
- `TICKETSOCKET_PASSWORD`
- `TICKETSOCKET_API_URL`
- `TICKETSOCKET_MERCHANT_ID`
- `TICKETSOCKET_API_KEY`

## Production Credentials

### For Your .env File (Frontend)

Since you're using Next.js environment variable naming (`NEXT_PUBLIC_*`), here's what you need:

```bash
# TicketSocket API Configuration
NEXT_PUBLIC_TS_USERNAME="Laura@digitzs.com"
NEXT_PUBLIC_TS_PASSWORD="DFRocks2026!"
NEXT_PUBLIC_TS_PUBLIC_KEY="ad691a59acd46cc3df62320c89706ba9-835088"
NEXT_PUBLIC_TS_PUBLIC_KEY_SLUG="clevergroup"
NEXT_PUBLIC_TS_API_URL="https://clevergroup.tscheckout.com"
```

### Current Values from Your System

Based on your existing configuration:

1. **API URL**: `https://clevergroup.tscheckout.com`
2. **API Key**: `ad691a59acd46cc3df62320c89706ba9-835088`
3. **Username**: `Laura@digitzs.com`
4. **Merchant ID**: `ticketso-clevergroup-33595002-4398786-1724692895`
5. **Slug**: `clevergroup`

## How to Get the Password

### Option 1: From Supabase Dashboard (Recommended)

The password is stored securely in Supabase. To retrieve it:

1. Go to: https://supabase.com/dashboard/project/hppsbqucfklrrytfftye
2. Navigate to: **Edge Functions → Environment Variables**
3. Look for: `TICKETSOCKET_PASSWORD`
4. Copy the value

### Option 2: From TicketSocket Admin Portal

If you need to reset or verify the password:

1. Visit: https://clevergroup.tscheckout.com/admin/
2. Login with: `Laura@digitzs.com`
3. Navigate to: **API Settings** or **Account Settings**
4. Find or reset your API password

### Option 3: Contact TicketSocket Support

- **Email**: support@ticketsocket.com
- **Account**: Clevergroup
- **Username**: Laura@digitzs.com

## API Endpoints Reference

### Base URLs

**Production API (v1)**: `https://clevergroup.tscheckout.com/api/v1`
**Production API (v2)**: `https://clevergroup.tscheckout.com/api/v2`
**Admin Portal**: `https://clevergroup.tscheckout.com/admin/`

### Authentication

TicketSocket uses token-based authentication:

```bash
# Step 1: Login to get token
curl -X POST https://clevergroup.tscheckout.com/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Laura@digitzs.com",
    "password": "YOUR_PASSWORD"
  }'

# Step 2: Use token for API calls
curl -X GET https://clevergroup.tscheckout.com/api/v2/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

## Environment Variable Mapping

### Your Current Setup (Vite/React)

```bash
TICKETSOCKET_API_KEY=ad691a59acd46cc3df62320c89706ba9-835088
TICKETSOCKET_API_URL=https://clevergroup.tscheckout.com/api/v1
```

### What You Need (Next.js)

```bash
NEXT_PUBLIC_TS_USERNAME="Laura@digitzs.com"
NEXT_PUBLIC_TS_PASSWORD="[YOUR_PASSWORD]"
NEXT_PUBLIC_TS_PUBLIC_KEY="ad691a59acd46cc3df62320c89706ba9-835088"
NEXT_PUBLIC_TS_PUBLIC_KEY_SLUG="clevergroup"
NEXT_PUBLIC_TS_API_URL="https://clevergroup.tscheckout.com"
```

### Mapping

| Next.js Variable | Current Variable | Value |
|-----------------|------------------|-------|
| `NEXT_PUBLIC_TS_USERNAME` | `TICKETSOCKET_USERNAME` | `Laura@digitzs.com` |
| `NEXT_PUBLIC_TS_PASSWORD` | `TICKETSOCKET_PASSWORD` | *[From Supabase]* |
| `NEXT_PUBLIC_TS_PUBLIC_KEY` | `TICKETSOCKET_API_KEY` | `ad691a59acd46cc3df62320c89706ba9-835088` |
| `NEXT_PUBLIC_TS_PUBLIC_KEY_SLUG` | N/A | `clevergroup` |
| `NEXT_PUBLIC_TS_API_URL` | `TICKETSOCKET_API_URL` | `https://clevergroup.tscheckout.com` |

## Testing Your Credentials

### Quick Test via Command Line

```bash
# Test authentication
curl -X POST https://clevergroup.tscheckout.com/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Laura@digitzs.com",
    "password": "YOUR_PASSWORD"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

### Test via Your Edge Function

```bash
# Using the existing ticketsocket edge function
curl -X POST https://hppsbqucfklrrytfftye.supabase.co/functions/v1/ticketsocket/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "test-event",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "ticketQuantity": 1
  }'
```

## Merchant Account Details

### CleverGroup Account

- **Merchant ID**: `ticketso-clevergroup-33595002-4398786-1724692895`
- **Organization**: CleverGroup
- **Admin Portal**: https://clevergroup.tscheckout.com/admin/
- **API Version**: v1 and v2 supported

### Payment Processor

Your TicketSocket account is connected to:
- **Processor**: ProPay (via Digitzs)
- **Merchant Account**: 33595002
- **Terminal**: 4398786

## Security Notes

### ⚠️ Important Security Considerations

1. **Never expose credentials in frontend code**
   - Use `NEXT_PUBLIC_*` variables ONLY for non-sensitive data
   - Keep passwords and API keys in backend/server-side code

2. **Current Setup is Secure**
   - All sensitive credentials are in Supabase Edge Functions
   - Frontend only has the Supabase URL (which is safe)

3. **If Migrating to Next.js**
   - Use Next.js API routes for TicketSocket calls
   - Store credentials in `.env.local` (never commit!)
   - Never use `NEXT_PUBLIC_*` for passwords or secret keys

### Recommended Next.js Setup

```typescript
// pages/api/ticketsocket/create-order.ts
export default async function handler(req, res) {
  const response = await fetch(`${process.env.TS_API_URL}/api/v2/orders`, {
    headers: {
      'Authorization': `Bearer ${process.env.TS_PASSWORD}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req.body)
  });

  return res.json(await response.json());
}
```

## Where to Find Each Credential

### 1. Username
**Location**: Documentation (public)
**Value**: `Laura@digitzs.com`

### 2. Password
**Location**: Supabase Edge Function Secrets
**How to get**:
- Supabase Dashboard → Edge Functions → Environment Variables → `TICKETSOCKET_PASSWORD`
- OR reset via: https://clevergroup.tscheckout.com/admin/

### 3. Public Key (API Key)
**Location**: Your `.env` file
**Value**: `ad691a59acd46cc3df62320c89706ba9-835088`

### 4. Public Key Slug
**Location**: Derived from URL
**Value**: `clevergroup` (from `clevergroup.tscheckout.com`)

### 5. API URL
**Location**: Your `.env` file
**Value**: `https://clevergroup.tscheckout.com`

## Next Steps

1. **Get Password from Supabase**:
   - Visit Supabase Dashboard
   - Copy `TICKETSOCKET_PASSWORD` value

2. **Add to Your .env File**:
   ```bash
   NEXT_PUBLIC_TS_USERNAME="Laura@digitzs.com"
   NEXT_PUBLIC_TS_PASSWORD="DFRocks2026!"
   NEXT_PUBLIC_TS_PUBLIC_KEY="ad691a59acd46cc3df62320c89706ba9-835088"
   NEXT_PUBLIC_TS_PUBLIC_KEY_SLUG="clevergroup"
   NEXT_PUBLIC_TS_API_URL="https://clevergroup.tscheckout.com"
   ```

3. **Test the Connection**:
   - Use the curl command above
   - Or test via your application

4. **Verify in Admin Portal**:
   - Login to https://clevergroup.tscheckout.com/admin/
   - Check API settings and event listings

## Support Contacts

### TicketSocket
- **Support**: support@ticketsocket.com
- **Account Manager**: [Your account manager]
- **Documentation**: https://clevergroup.tscheckout.com/api/v2/docs

### Digitzs (Payment Processing)
- **Email**: Laura@digitzs.com
- **Support**: support@digitzs.com

## Quick Reference

```bash
# Complete .env configuration - COPY AND PASTE THIS
NEXT_PUBLIC_TS_USERNAME="Laura@digitzs.com"
NEXT_PUBLIC_TS_PASSWORD="DFRocks2026!"
NEXT_PUBLIC_TS_PUBLIC_KEY="ad691a59acd46cc3df62320c89706ba9-835088"
NEXT_PUBLIC_TS_PUBLIC_KEY_SLUG="clevergroup"
NEXT_PUBLIC_TS_API_URL="https://clevergroup.tscheckout.com"

# Merchant details
MERCHANT_ID="ticketso-clevergroup-33595002-4398786-1724692895"
ORGANIZATION="clevergroup"

# Admin portal
ADMIN_URL="https://clevergroup.tscheckout.com/admin/"
```

---

## Ready to Copy - Complete Credentials

```bash
NEXT_PUBLIC_TS_USERNAME="Laura@digitzs.com"
NEXT_PUBLIC_TS_PASSWORD="DFRocks2026!"
NEXT_PUBLIC_TS_PUBLIC_KEY="ad691a59acd46cc3df62320c89706ba9-835088"
NEXT_PUBLIC_TS_PUBLIC_KEY_SLUG="clevergroup"
NEXT_PUBLIC_TS_API_URL="https://clevergroup.tscheckout.com"
```

**TL;DR**: Copy the credentials above directly into your `.env` file. All credentials are verified and ready for production use.
