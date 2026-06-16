# Bolt Dashboard Configuration Guide

## Required Supabase Edge Function Secrets

The following environment variables need to be configured in your Supabase project dashboard to enable Payvia v4 payment processing.

### How to Add Secrets in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** in the left sidebar
3. Click on **Manage secrets**
4. Add each secret listed below

---

## Payvia v4 API Configuration

These secrets enable the `payvia-process` edge function to authenticate with Payvia and process payments through Digitzs merchant accounts.

### Required Secrets

#### 1. PAYVIA_API_URL
```
https://api.payvia.staging.ondeets.ai
```
**Description:** Base URL for Payvia v4 API (staging environment)

**Note:** For production, change to `https://api.payvia.ondeets.ai`

---

#### 2. PAYVIA_API_KEY
```
pOZnjKUSBk8pEhBoOAu0qzz6WpfqLxm3YmmZnDy2
```
**Description:** API key for authenticating requests to Payvia

**Source:** From Payvia dashboard / Jira docs

**Usage:** Sent as `x-api-key` header in both auth and payment requests

---

#### 3. PAYVIA_APP_KEY
```
HTxKp4jh1cSIprscR81zXt6EtsOup1wNf8HPNLr5vTNWMAUloj0i7yEhVmIxZrck
```
**Description:** Application key for obtaining authentication tokens

**Source:** From Payvia dashboard / Jira docs

**Usage:** Sent in POST body to `/v4/auth/token` endpoint

---

#### 4. PAYVIA_MERCHANT_ID
```
ticketso-clevergroup-33595002-4398786-1724692895
```
**Description:** Digitzs merchant ID that routes to TicketSocket's ProPay account

**Format:** `{provider}-{merchant}-{ppMID}-{config}-{timestamp}`

**Breakdown:**
- `ticketso` - Provider (TicketSocket)
- `clevergroup` - Merchant name
- `33595002` - ProPay MID
- `4398786` - Config ID
- `1724692895` - Creation timestamp

**Usage:** Identifies which merchant account to use for payment processing

---

## Optional: ProPay Configuration (if using direct ProPay)

Only needed if you're using the `propay-process` edge function for direct ProPay integration.

#### PROPAY_CERT_STRING
```
[Get from ProPay merchant portal]
```
**Description:** Certificate string from ProPay account

---

#### PROPAY_TERMINAL_ID
```
[Get from ProPay merchant portal]
```
**Description:** Terminal ID from ProPay account

---

#### PROPAY_ACCOUNT_NUM
```
33595002
```
**Description:** ProPay merchant account number (same as MID)

---

## Already Configured Secrets

These should already be set up from previous configuration:

✅ **TICKETSOCKET_API_KEY** - For TicketSocket integration
✅ **TICKETSOCKET_API_URL** - TicketSocket API endpoint
✅ **TOKENEX_API_KEY_1** - Primary TokenEx authentication key
✅ **TOKENEX_API_KEY_2** - Secondary TokenEx key
✅ **TOKENEX_API_KEY_3** - Tertiary TokenEx key
✅ **DIGITZS_SECURITY_KEY** - NMI White Label security key
✅ **KOUNT_360_USERNAME** - Kount fraud prevention username
✅ **KOUNT_360_API_KEY** - Kount fraud prevention API key

---

## Verification

After adding the secrets, verify they're configured correctly:

1. Check the secrets list in Supabase dashboard
2. Redeploy the `payvia-process` edge function
3. Test a payment through the application
4. Check edge function logs for authentication success

### Test Payment Flow

```javascript
// Should see in logs:
// ✅ "Processing Payvia v4 transaction"
// ✅ "Payvia auth successful"
// ✅ "Payment processed successfully"
```

---

## Environment-Specific Configuration

### Staging (Current Setup)
```bash
PAYVIA_API_URL=https://api.payvia.staging.ondeets.ai
PAYVIA_MERCHANT_ID=ticketso-clevergroup-33595002-4398786-1724692895
```

### Production (Future)
```bash
PAYVIA_API_URL=https://api.payvia.ondeets.ai
PAYVIA_MERCHANT_ID=ticketso-clevergroup-33595002-4398786-1724692895
```

**Note:** The API_KEY and APP_KEY remain the same for both environments.

---

## Testing Alternative Merchant IDs

If you want to test with different processors, you can temporarily change PAYVIA_MERCHANT_ID:

### Test with Stripe
```
digitzs-stripe-test-718643500-3230807-1732171363
```

### Test with Generic ProPay
```
digitzs-test-718643500-3230807-1732171363
```

### Test with Real Cards (ProPay)
```
digitzs-paolomercha-718714640-3388619-1767883025
```

---

## Troubleshooting

### Authentication Failed (401)
- Verify `PAYVIA_API_KEY` is correct
- Verify `PAYVIA_APP_KEY` is correct
- Check edge function logs for specific error

### Payment Failed (400)
- Verify `PAYVIA_MERCHANT_ID` format is correct
- Check if merchant account has transaction limits
- Verify TokenEx token is being passed correctly

### "Activity limit exceeded"
- Some test MIDs have daily transaction limits
- Switch to a different test MID
- Contact Digitzs to increase limits

---

## Support Resources

- **Payvia API Docs:** https://payvia-65a748ab.mintlify.app/
- **Jira MID Config:** `docs/Jira_Payvia_Change_Processors_Configured+MIDs+for+Different+Processors..doc`
- **Integration Guide:** `PAYVIA_V4_INTEGRATION.md`
- **Comparison Doc:** `NMI_DIRECT_VS_PAYVIA_WRAPPER.md`

---

## Quick Copy-Paste for Dashboard

```
Name: PAYVIA_API_URL
Value: https://api.payvia.staging.ondeets.ai

Name: PAYVIA_API_KEY
Value: pOZnjKUSBk8pEhBoOAu0qzz6WpfqLxm3YmmZnDy2

Name: PAYVIA_APP_KEY
Value: HTxKp4jh1cSIprscR81zXt6EtsOup1wNf8HPNLr5vTNWMAUloj0i7yEhVmIxZrck

Name: PAYVIA_MERCHANT_ID
Value: ticketso-clevergroup-33595002-4398786-1724692895
```
