# Digitzs/NMI Security Key Setup

## Overview

The Digitzs direct integration requires an **API Security Key** from your NMI gateway account. This is completely separate from TokenEx credentials and is used to authenticate API requests directly to the Digitzs/NMI payment gateway.

---

## Where to Find Your Security Key

### Step 1: Access Digitzs Gateway Portal

Navigate to your white-labeled NMI portal:
```
https://digitzs.transactiongateway.com
```

**Login Credentials:**
- Username: Your Digitzs merchant login
- Password: Your gateway password

### Step 2: Navigate to Security Keys

Once logged in:
1. Click on **Settings** in the main navigation
2. Select **Security Keys** from the dropdown
3. Click on **API Security Keys** tab

### Step 3: Generate or Copy Security Key

You'll see your API Security Key listed. It looks like:
```
2F822Rw39fx762MaV7Yy86jXGTC7sCDy
```

**Important Notes:**
- This is a 32-character alphanumeric string
- Keep this secret - it authenticates all API requests
- If you don't have one, click "Generate New Key"
- You can have multiple keys (useful for different environments)

---

## Add Security Key to Supabase

### Via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** → **Secrets**
3. Click **Add new secret**
4. Enter:
   - **Name**: `DIGITZS_SECURITY_KEY`
   - **Value**: Your 32-character security key from Digitzs portal
5. Click **Save**

### Via Command Line (Alternative)

If using Supabase CLI:
```bash
# Set the secret
supabase secrets set DIGITZS_SECURITY_KEY=2F822Rw39fx762MaV7Yy86jXGTC7sCDy

# Verify it was set
supabase secrets list
```

---

## Testing Your Integration

### Test the Security Key

After adding the security key, test the integration:

```bash
# Make a test API call to verify credentials
curl -X POST https://digitzs.transactiongateway.com/api/transact.php \
  -d "security_key=YOUR_SECURITY_KEY" \
  -d "type=validate"
```

**Expected Response:**
```
response=1&responsetext=SUCCESS
```

### Test Through Your Application

1. Open your application
2. Navigate to the checkout page
3. Enter test card: `4242424242424242`
4. Complete the payment form
5. Submit the transaction

**Success indicators:**
- No "security key missing" error
- Transaction processes successfully
- You receive a transaction ID back
- Transaction appears in Digitzs portal under Reports

---

## Merchant ID Configuration

Your Digitzs/NMI integration connects to **Propay MID 33595002** through the NMI gateway.

### Current Configuration

**White Label Gateway:** `digitzs.transactiongateway.com`
**Merchant ID:** 33595002 (Propay MID)
**API Endpoint:** `https://digitzs.transactiongateway.com/api/transact.php`

### How It Works

```
Your Application
    ↓
Digitzs Direct Integration (using security_key)
    ↓
NMI Gateway (digitzs.transactiongateway.com)
    ↓
Propay MID 33595002
    ↓
Card Networks (Visa/MC/Amex/Discover)
```

---

## TokenEx vs Direct Integration

### TokenEx Flow (Currently Disabled)

```
Browser → TokenEx iframe → Tokenization → Payvia wrapper → Digitzs → Propay → Processor
```

**Pros:**
- PCI compliant (card data never touches your server)
- Triple-hash encryption
- Reduced PCI scope

**Cons:**
- Requires TokenEx account to be active
- Additional service dependency
- More complex integration

### Direct Digitzs/NMI Flow (Current Backup)

```
Browser → Your form → Your server → Digitzs API → Propay → Processor
```

**Pros:**
- Simple, direct API integration
- No third-party dependencies
- Easier to debug and troubleshoot
- Same MID and processor as TokenEx

**Cons:**
- Higher PCI compliance requirements (SAQ D)
- Card data passes through your server
- You're responsible for securing card data

---

## Environment Variables Summary

### Required for Direct Integration

```bash
# Digitzs/NMI Gateway
DIGITZS_SECURITY_KEY=<32-char-api-key>
```

### Required for TokenEx Integration (When Reactivated)

```bash
# TokenEx Configuration
TOKENEX_ID=7320744805319527
TOKENEX_API_KEY=O9YFHDXYNXg4s3b0b1vxyxj5ZQU5l6DMirauHyB7
```

### Optional (Database/Ticketing)

```bash
# TicketSocket
TICKETSOCKET_API_URL=https://clevergroup.tscheckout.com/api/v2
TICKETSOCKET_MERCHANT_ID=ticketso-clevergroup-33595002-4398786-1724692895
TICKETSOCKET_USERNAME=Laura@digitzs.com
TICKETSOCKET_PASSWORD=<password>
```

---

## Troubleshooting

### Error: "DIGITZS_SECURITY_KEY not configured"

**Cause:** The security key environment variable is missing or empty.

**Solution:**
1. Log into Digitzs gateway portal
2. Copy your API Security Key
3. Add it to Supabase Edge Function secrets
4. Redeploy the edge function (happens automatically)
5. Retry the transaction

### Error: "Invalid security key"

**Cause:** The security key is incorrect or has been regenerated.

**Solution:**
1. Verify you copied the entire 32-character key
2. Check for extra spaces or line breaks
3. Generate a new key if necessary
4. Update the secret in Supabase
5. Test again

### Error: "Authentication failed"

**Cause:** Multiple possible reasons.

**Solution:**
1. Verify the security key is correct
2. Check that your IP is not blocked in gateway settings
3. Ensure your merchant account is active
4. Contact Digitzs support if issues persist

### Transactions Declining

**Cause:** MID configuration or processor issues.

**Solution:**
1. Log into Digitzs portal and check MID status
2. Verify Propay MID 33595002 is active
3. Check transaction logs in gateway portal
4. Review decline reasons in response codes
5. Contact Digitzs merchant support

---

## Security Best Practices

### Protecting Your Security Key

1. **Never commit to source control**
   - Use environment variables only
   - Add `.env` to `.gitignore`
   - Use Supabase secrets for production

2. **Rotate keys periodically**
   - Generate new keys quarterly
   - Update in Supabase immediately
   - Monitor for unauthorized usage

3. **Use different keys per environment**
   - Development: Test account key
   - Staging: Separate test key
   - Production: Live account key

4. **Monitor API usage**
   - Review transaction logs regularly
   - Set up alerts for unusual activity
   - Check for failed authentication attempts

### PCI Compliance with Direct Integration

**Important:** When using direct integration (not TokenEx):

1. **You are now in PCI scope**
   - Card data passes through your server
   - You must complete SAQ D (or SAQ D-Merchant)
   - Quarterly network scans required

2. **Required security measures:**
   - HTTPS/TLS 1.2+ on all pages
   - Secure server configuration
   - Regular security updates
   - Access control and monitoring
   - Encryption of stored data (if any)

3. **Do NOT store:**
   - Full card numbers (PAN)
   - CVV/CVC codes
   - PIN data
   - Track data from magnetic stripe

4. **You MAY store:**
   - Cardholder name
   - Expiration date (encrypted)
   - Last 4 digits of card
   - Transaction IDs and references

---

## When TokenEx Reactivates

Once TokenEx reactivates your account:

1. **Switch back to TokenEx flow**
   - The application automatically detects when TokenEx is available
   - Falls back to direct integration when TokenEx fails
   - No code changes needed

2. **Keep both integrations active**
   - Direct integration as backup
   - TokenEx as primary for PCI compliance
   - Seamless failover if TokenEx has issues

3. **PCI Compliance improvement**
   - Back to SAQ-A (simplest form)
   - Card data never touches your servers
   - Reduced compliance burden

---

## Support Contacts

### Digitzs/NMI Support

**Gateway Technical Support:**
- Email: support@nmi.com
- Phone: 1-866-481-3280
- Portal: https://digitzs.transactiongateway.com/merchants/support

**Digitzs Merchant Support:**
- Email: Laura@digitzs.com
- Phone: Contact your account representative

### Security Key Issues

If you cannot find or access your security key:
1. Contact Digitzs merchant support
2. Verify your merchant account status
3. Request new security key generation
4. Update keys in both test and live environments

---

## API Reference

### Direct Post API Endpoint

```
POST https://digitzs.transactiongateway.com/api/transact.php
Content-Type: application/x-www-form-urlencoded
```

### Required Parameters

```
security_key=<your-32-char-key>
type=sale
amount=10.00
ccnumber=4242424242424242
ccexp=1225
cvv=123
firstname=John
lastname=Doe
email=john@example.com
phone=5551234567
```

### Optional Parameters

```
address1=123 Main St
city=Dallas
state=TX
zip=75001
country=US
orderid=ORDER-12345
ipaddress=192.168.1.1
```

### Response Format

```
response=1&responsetext=SUCCESS&authcode=123456&transactionid=7890123456&avsresponse=Y&cvvresponse=M&orderid=ORDER-12345
```

**Response Codes:**
- `1` = Approved
- `2` = Declined
- `3` = Error

---

## Related Documentation

- **`TOKENEX_END_TO_END_PROCESS.md`** - TokenEx integration details
- **`DIGITZS_DIRECT_INTEGRATION.md`** - Direct API implementation guide
- **`IMPLEMENTATION_STATUS.md`** - Current status and recovery steps

---

**Document Version**: 1.0
**Last Updated**: March 24, 2026
**Author**: Integration Team
**Status**: Active - Direct Integration Backup
