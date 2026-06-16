# Kount 360 Fraud Prevention Integration

## Overview

This document explains how Kount 360 fraud prevention is integrated with TokenEx in your application to provide real-time fraud detection and prevention before payment authorization.

## What is Kount 360?

Kount 360 is an AI-powered fraud prevention service that analyzes transactions in real-time to detect fraudulent activity. When integrated with TokenEx, Kount analyzes each payment attempt and provides a risk score BEFORE the transaction is authorized, helping prevent chargebacks and fraudulent transactions.

## Credentials

Your Kount 360 credentials are stored in the `.env` file:

```
KOUNT_360_USERNAME=paolo@digitzs.com
KOUNT_360_API_KEY=MG9hMXVzcjc2NjRRcEV3dWYzNTg6VjJrS0xhOFB6NjhpOVJ3UEp4VTJaMGtBaHdxTjNLSXFVcXpCMDh5czhGaG0wRnBGVnptOWYtd0dkaUMybE5uZw==
```

**Note:** These credentials are configured on the TokenEx side and don't need to be passed in API calls. TokenEx handles the Kount authentication automatically.

## How It Works

### 1. TokenEx Iframe Initialization

When the payment form loads, TokenEx is configured with Kount enabled:

```typescript
const iframeConfig = {
  tokenExID: tokenizationKey,
  tokenScheme: 'nGUID',
  authenticationKey: authData.authenticationKey,
  timestamp: authData.timestamp,
  origin: window.location.origin,
  pci: true,
  fraudServices: {
    kount: true,  // This enables Kount 360
  },
  // ... other config
};
```

### 2. Data Collection

When Kount is enabled in the TokenEx iframe:
- TokenEx automatically collects device fingerprinting data
- Browser data, IP address, and behavioral patterns are analyzed
- This happens transparently in the background while the user enters payment info

### 3. Tokenization with Fraud Check

When the user submits the payment form:

```typescript
tokenExInstance.tokenize((result) => {
  // Result includes both the payment token AND Kount session ID
  console.log('Payment Token:', result.token);
  console.log('Kount Session ID:', result.kountSessionId);
});
```

### 4. Risk Assessment

TokenEx sends the transaction data to Kount 360, which:
- Analyzes the device fingerprint
- Checks the transaction against known fraud patterns
- Evaluates user behavior and device characteristics
- Returns a risk score and recommendation

### 5. Storage for Audit Trail

The Kount session ID is stored in the database for tracking:

```typescript
const registrationData = {
  // ... other fields
  payment_token: tokenResult.token,
  kount_session_id: tokenResult.kountSessionId, // Stored for fraud tracking
};
```

## Integration Points

### Frontend: MultiStepCheckout.tsx

File: `src/components/lights/MultiStepCheckout.tsx`

Key changes:
1. **Line 144-146**: Kount enabled in iframe config
2. **Line 260-268**: Tokenize callback captures Kount session ID
3. **Line 270-274**: Logging for Kount data verification
4. **Line 296-316**: Kount session ID stored in database

### Database: registrations table

The `registrations` table includes:
- `payment_token` - The tokenized payment token from TokenEx
- `kount_session_id` - The Kount 360 session ID for fraud tracking

Migration file: `supabase/migrations/add_kount_session_id_to_registrations.sql`

## What Kount 360 Detects

Kount 360 analyzes multiple fraud signals including:

1. **Device Fingerprinting**
   - Browser type, version, plugins
   - Screen resolution, timezone, language
   - Operating system details

2. **Behavioral Analysis**
   - How the user navigates the form
   - Time spent on page
   - Mouse movements and typing patterns

3. **Network Analysis**
   - IP address geolocation
   - Proxy/VPN detection
   - IP reputation scoring

4. **Transaction Patterns**
   - Velocity checks (multiple transactions from same device)
   - Card testing attempts
   - Known fraud patterns

## Fraud Response Flow

```
User enters payment info
         ↓
TokenEx collects device data → Sends to Kount 360
         ↓                            ↓
   Tokenizes card                 Analyzes fraud risk
         ↓                            ↓
    Returns token + Kount Session ID
         ↓
Your app stores both for audit trail
         ↓
Transaction proceeds to payment gateway
```

## Testing Kount Integration

### Verify Kount is Active

1. Open browser console
2. Navigate to the payment page
3. Look for these console logs:

```
TokenEx tokenize result: {
  token: "...",
  kountSessionId: "..."
}

Token result with Kount data: {
  token: "...",
  kountSessionId: "...",
  hasKountData: true
}
```

If `hasKountData: true` and you see a `kountSessionId`, Kount is working correctly.

### Test Fraud Detection

To test if Kount is blocking suspicious transactions, TokenEx support can configure test scenarios or you can check your Kount dashboard for risk scores.

## Benefits

1. **Real-time Prevention** - Fraud is detected BEFORE authorization, preventing declined transactions and chargebacks
2. **Reduced Chargebacks** - Proactive blocking of high-risk transactions
3. **Better Approval Rates** - Legitimate customers aren't blocked due to false positives
4. **Compliance** - Meets PCI-DSS requirements for fraud monitoring
5. **Audit Trail** - Session IDs stored for dispute resolution

## Kount Dashboard

Access your Kount 360 dashboard at: https://portal.kount.com

Login with:
- Username: `paolo@digitzs.com`
- Password: `DFRocks2026!`

In the dashboard you can:
- View real-time fraud scores
- See blocked transactions
- Adjust fraud rules and thresholds
- Review historical fraud patterns
- Generate compliance reports

## TokenEx Configuration

Your TokenEx account must have Kount 360 enabled. To verify:

1. Login to TokenEx dashboard: https://portal.us1.tokenex.com
2. Navigate to Configuration → Fraud Services
3. Confirm "Kount 360" is enabled
4. Verify your Kount credentials are configured

## Troubleshooting

### Kount Session ID Not Returned

**Symptom**: `tokenResult.kountSessionId` is undefined

**Solutions**:
1. Verify Kount is enabled in TokenEx dashboard
2. Check that `fraudServices: { kount: true }` is in iframe config
3. Confirm Kount credentials are configured in TokenEx
4. Contact TokenEx support to verify Kount 360 is active on your account

### Console Errors Related to Kount

**Symptom**: Browser console shows Kount-related errors

**Solutions**:
1. Check that the page is served over HTTPS (Kount requires secure context)
2. Verify no browser extensions are blocking third-party scripts
3. Confirm no ad blockers are interfering with Kount data collection

### High Decline Rate

**Symptom**: Legitimate transactions being blocked

**Solutions**:
1. Review fraud rules in Kount dashboard
2. Adjust risk thresholds (may be too strict)
3. Whitelist trusted IP addresses or devices
4. Contact Kount support for rule optimization

## Support Contacts

### TokenEx Support
- Portal: https://support.tokenex.com
- Email: support@tokenex.com
- Phone: (405) 359-0304
- Your TokenEx ID: 3787957743127376

### Kount Support
- Portal: https://support.kount.com
- Email: support@kount.com
- Your Username: paolo@digitzs.com

## Security Notes

1. **Never expose Kount API keys in frontend code** - They're configured server-side in TokenEx
2. **Kount session IDs are safe to store** - They don't contain sensitive data
3. **HTTPS is required** - Kount won't work over insecure connections
4. **Keep credentials secure** - Store in `.env` file, never commit to git

## Next Steps

After integration:

1. **Monitor the first 100 transactions** in Kount dashboard
2. **Adjust fraud rules** based on your risk tolerance
3. **Train your team** on reviewing flagged transactions
4. **Set up alerts** for high-risk transaction patterns
5. **Review monthly reports** for fraud trends

## Additional Resources

- [TokenEx Fraud Services Documentation](https://docs.tokenex.com/docs/fraud-services)
- [Kount 360 Integration Guide](https://kount.github.io/docs/)
- [PCI Compliance with Fraud Prevention](https://www.pcisecuritystandards.org/)
