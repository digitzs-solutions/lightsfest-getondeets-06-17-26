# 🔑 Get Your Digitzs Security Key - Step by Step

## ⚠️ YOU NEED THIS KEY RIGHT NOW

Your application is showing **"DIGITZS_SECURITY_KEY not configured"** because this environment variable is missing from Supabase.

**This is NOT in your TokenEx account** - it's a separate key from your NMI gateway portal.

---

## 📋 What You Need

- Access to **digitzs.transactiongateway.com**
- Your Digitzs merchant login credentials
- 5 minutes

---

## 🚀 Step-by-Step Instructions

### Step 1: Log Into Digitzs Gateway Portal

1. Open your browser and go to:
   ```
   https://digitzs.transactiongateway.com
   ```

2. Enter your merchant credentials:
   - **Username**: Your Digitzs merchant username
   - **Password**: Your gateway password

   *(If you don't have these, contact Laura@digitzs.com)*

3. Click **Login**

---

### Step 2: Navigate to Security Keys

Once logged in:

1. Look at the top navigation menu
2. Click on **Settings**
3. In the dropdown menu, select **Security Keys**
4. Click on the **API Security Keys** tab

---

### Step 3: Get Your Security Key

You should now see your API Security Key displayed.

**It looks like this:**
```
2F822Rw39fx762MaV7Yy86jXGTC7sCDy
```

**Key characteristics:**
- 32 characters long
- Mix of letters and numbers
- Alphanumeric only (no special characters)

**Actions:**

✅ **If you see a key:** Copy it to your clipboard (click the copy icon or select and copy)

❌ **If you don't see a key:** Click the **"Generate New Key"** button, then copy it

⚠️ **Important:** Keep this key secure! It authenticates all API requests to your payment gateway.

---

### Step 4: Add Key to Supabase Edge Functions

Now you need to add this key as a secret in Supabase:

#### Option A: Via Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard:
   ```
   https://supabase.com/dashboard/project/hppsbqucfklrrytfftye
   ```

2. In the left sidebar, click **Edge Functions**

3. Click on **Secrets** in the Edge Functions menu

4. Click **Add new secret** button

5. Fill in the form:
   - **Name**: `DIGITZS_SECURITY_KEY`
   - **Value**: [Paste your 32-character key here]

6. Click **Save**

7. ✅ Done! The secret is now available to all Edge Functions

#### Option B: Via Supabase CLI (Advanced)

If you prefer command line:

```bash
# Set the secret
supabase secrets set DIGITZS_SECURITY_KEY=<paste-your-key-here>

# Verify it was set
supabase secrets list
```

You should see `DIGITZS_SECURITY_KEY` in the output.

---

### Step 5: Test Your Integration

Now let's verify everything works:

1. **Open your application** in a web browser

2. **Navigate to the ticket purchase page**

3. **Fill in customer information:**
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Phone: 555-123-4567

4. **Enter test card details:**
   - Card Number: `4242 4242 4242 4242`
   - Expiry Date: `12/25`
   - CVV: `123`

5. **Click Submit Payment**

---

### ✅ Success Indicators

If everything is working correctly, you should see:

- ✅ No "DIGITZS_SECURITY_KEY not configured" error
- ✅ Payment processes successfully
- ✅ You receive a transaction ID in the response
- ✅ Success confirmation message appears
- ✅ Transaction shows up in Digitzs gateway portal under **Reports** → **Transactions**

---

### ❌ Troubleshooting

#### Still Getting "Security Key Not Configured"?

**Check 1: Verify the secret exists**
1. Go to Supabase Dashboard → Edge Functions → Secrets
2. Look for `DIGITZS_SECURITY_KEY` in the list
3. If missing, repeat Step 4

**Check 2: Verify the key is correct**
1. Log back into digitzs.transactiongateway.com
2. Go to Settings → Security Keys → API Security Keys
3. Copy the key again (make sure no spaces or line breaks)
4. Update the Supabase secret with the correct value

**Check 3: Test the key directly**

Run this command to test your security key:

```bash
curl -X POST https://digitzs.transactiongateway.com/api/transact.php \
  -d "security_key=YOUR_KEY_HERE" \
  -d "type=validate"
```

**Expected response:**
```
response=1&responsetext=SUCCESS
```

**Error response:**
```
response=3&responsetext=Invalid security key
```

If you get an error, your key is incorrect. Get a fresh copy from the portal.

---

#### Error: "Invalid Security Key"

**Possible causes:**
- Key was copied incorrectly (extra spaces, line breaks)
- Key was regenerated in the portal (old key no longer valid)
- Wrong merchant account / portal login

**Solution:**
1. Log into digitzs.transactiongateway.com
2. Generate a NEW security key
3. Update the Supabase secret with the new key
4. Test again

---

#### Transactions Declining

If the security key works but transactions are declining:

**Check 1: Card number**
- Use test card: `4242424242424242`
- No spaces when testing the API
- Must be valid Luhn checksum

**Check 2: MID status**
1. Log into Digitzs portal
2. Click on **Account** → **Account Settings**
3. Verify Merchant ID **33595002** is active and approved

**Check 3: Gateway logs**
1. Go to **Reports** → **Transaction Search**
2. Look for your recent test transactions
3. Check decline reasons and response codes

**Check 4: Processor status**
- Contact Digitzs support if MID shows as inactive
- Verify Propay MID 33595002 is configured correctly

---

#### Error: "Communication Error"

**Possible causes:**
- Network connectivity issues
- Gateway maintenance
- SSL/TLS certificate issues

**Solution:**
1. Check gateway status (contact Digitzs support)
2. Verify your Supabase Edge Function has internet access
3. Try again in a few minutes
4. Check Digitzs status page or support channels

---

## 🔒 Security Best Practices

### Protecting Your Security Key

1. **NEVER commit to Git**
   - Keys should only be in Supabase secrets
   - Never in `.env` files that get committed
   - Use `.gitignore` to exclude sensitive files

2. **Rotate keys periodically**
   - Generate new keys quarterly
   - Update in Supabase immediately after generating
   - Revoke old keys after updating

3. **Use different keys per environment**
   - Development: Test account security key
   - Production: Live account security key
   - Never mix test and live keys

4. **Monitor for unauthorized usage**
   - Review transaction logs regularly
   - Set up alerts for unusual activity
   - Check for failed authentication attempts
   - Investigate any suspicious patterns

---

## 📞 Need Help?

### Can't Log Into Digitzs Portal?

Contact your merchant account representative:
- **Email**: Laura@digitzs.com
- **Subject**: "Need Digitzs gateway login credentials"

### Security Key Not Working?

Contact Digitzs technical support:
- **Email**: support@nmi.com
- **Phone**: 1-866-481-3280
- **Portal**: https://digitzs.transactiongateway.com/merchants/support

### Still Having Issues?

Make sure you have:
- ✅ Correct 32-character security key from Digitzs portal
- ✅ Added key to Supabase as `DIGITZS_SECURITY_KEY`
- ✅ No typos, spaces, or line breaks in the key
- ✅ MID 33595002 is active in Digitzs portal
- ✅ Using test card 4242424242424242 for testing

---

## 🎯 What This Key Does

Your Digitzs Security Key is used to:

1. **Authenticate API requests** to the NMI gateway
2. **Process credit card transactions** through Propay MID 33595002
3. **Submit sales, voids, refunds, and other operations**
4. **Query transaction status and reports**

**Current flow:**
```
Your App → DigitzsCheckout Component →
digitzs-direct Edge Function (uses DIGITZS_SECURITY_KEY) →
Digitzs Gateway API (digitzs.transactiongateway.com) →
Propay MID 33595002 → Card Networks (Visa/MC/Amex)
```

---

## 📊 Verification Checklist

Before moving forward, verify:

- [ ] Logged into digitzs.transactiongateway.com successfully
- [ ] Found Security Keys section under Settings
- [ ] Copied 32-character API Security Key
- [ ] Added key to Supabase Edge Functions Secrets
- [ ] Named the secret exactly: `DIGITZS_SECURITY_KEY`
- [ ] No spaces or line breaks in the key value
- [ ] Tested a transaction with card 4242424242424242
- [ ] Received successful response with transaction ID
- [ ] Transaction appears in Digitzs portal reports

---

## 🔄 Next Steps After Setup

Once your key is configured and working:

1. **Test thoroughly** with various test cards
2. **Review transaction logs** in Digitzs portal
3. **Set up error monitoring** for declined transactions
4. **Configure email receipts** for customers
5. **Review PCI compliance requirements** (you're now processing card data directly)

---

## 📚 Related Documentation

- **`QUICK_START_DIGITZS.md`** - Quick 5-minute setup guide
- **`DIGITZS_NMI_SECURITY_KEY.md`** - Detailed security key documentation
- **`TOKENEX_END_TO_END_PROCESS.md`** - TokenEx recovery when account reactivates
- **`DIGITZS_DIRECT_INTEGRATION.md`** - Full API implementation guide
- **`IMPLEMENTATION_STATUS.md`** - Current system status

---

**Last Updated**: March 24, 2026
**Version**: 1.0
**Status**: Critical - Required for Payment Processing
