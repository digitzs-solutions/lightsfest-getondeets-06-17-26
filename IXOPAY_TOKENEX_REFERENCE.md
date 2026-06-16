# Ixopay (aka TokenEx) - Technical Reference

## Overview

PayVia leverages Ixopay's tokenization platform (branded as TokenEx) to provide PCI DSS Level 1 compliant payment processing with device-level triple-hash encryption. This document consolidates technical resources and implementation details.

---

## Official Documentation Links

### Ixopay Platform
- **Homepage**: https://www.ixopay.com/
- **Core Documentation**: https://documentation.ixopay.com/modules/docs/tokenex/welcome
- **PCI Configuration**: https://documentation.ixopay.com/modules/docs/tokenex/welcome#pci-configuration
- **Solutions Overview**: https://www.ixopay.com/solutions/reduce-fraud-increase-security

### Fraud Prevention & Risk Analysis
- **Kount Integration**: https://documentation.ixopay.com/modules/docs/tokenex/kount-data-collection-and-risk-analysis

### Developer Resources
- **TokenEx Web SDK Documentation**: https://github.com/TokenEx/tokenex.github.io/blob/master/content/Web.md
- **Demo Application**: https://tokenexwebdemo.azurewebsites.net/Home

---

## PayVia + Ixopay Integration Architecture

PayVia uses Ixopay's tokenization layer to provide secure payment processing that never exposes card data to merchant servers.

```
Customer Browser
    ↓
Ixopay/TokenEx Iframe (Device-level tokenization)
    ↓
PayVia Service Layer
    ↓
Digitzs Gateway
    ↓
ProPay MID
    ↓
Stripe Processor
```

### Key Benefits

1. **PCI Scope Reduction**
   - Card data tokenized at device level
   - Merchant never touches sensitive card data
   - Reduces PCI compliance to SAQ-A (simplest form)

2. **Triple-Hash Encryption**
   - Encryption happens in browser before transmission
   - Three layers of cryptographic hashing
   - Even Ixopay cannot reverse the encryption without keys

3. **Fraud Prevention**
   - Device fingerprinting
   - IP address tracking
   - Kount risk analysis integration
   - Behavioral analytics

4. **Processor Agnostic**
   - Works with any payment processor
   - Easy to switch processors without code changes
   - Current configuration: Stripe via ProPay

---

## Technical Implementation

### Current Configuration

**TokenEx Account Details:**
- **TokenEx ID**: `6747114507881848` (Digitzs account)
- **Token Scheme**: `sixTokenSixDigit` (6 first digits + TOKEN + 4 last digits)
- **Encryption**: Triple-hash at device level
- **Authentication**: HMAC-SHA256 with 20-minute expiration

**Merchant Configuration:**
- **Digitzs MID**: `digitzs-escapefrom-33738480-5013250-1771770463`
- **ProPay MID**: `33738480-5013250-1771770463`
- **Processor**: Stripe
- **Pricing**: 2.99% + $0.30 per transaction

### Authentication Flow

Ixopay requires time-limited HMAC authentication keys to initialize iframes:

1. **Frontend requests auth key** from Edge Function
2. **Edge Function generates HMAC**:
   ```
   Payload: tokenExID|origin|timestamp|tokenScheme
   Signature: HMAC-SHA256(payload, clientSecretKey)
   AuthKey: Base64(signature)
   ```
3. **Frontend initializes iframe** with auth key
4. **Iframe loads** with 20-minute expiration window

**Implementation**: `/supabase/functions/tokenex-auth/index.ts`

### Tokenization Flow

1. **User enters card details** in secure iframe
2. **Triple-hash encryption** at device level
3. **Token generated** by Ixopay servers
4. **Token returned** to frontend (e.g., `6747114507881848`)
5. **Token sent** to backend with transaction data
6. **Backend processes** payment using token
7. **Card data never** touches merchant infrastructure

**Implementation**: `/src/services/payvia.ts`

### Transaction Processing

**Edge Function**: `/supabase/functions/payvia-process/index.ts`

Receives:
- TokenEx token (replaces card number)
- Customer information
- Event details
- Device fingerprint data

Routes through:
- Digitzs Gateway (transparent routing)
- ProPay MID (merchant account)
- Stripe (processor)

Returns:
- Transaction ID
- Approval/decline status
- Error details (if any)

---

## PCI DSS Compliance

### Ixopay's PCI Certification

- **Level**: PCI DSS Level 1 Service Provider
- **Scope**: Full payment tokenization infrastructure
- **Certification**: Annually audited by QSA (Qualified Security Assessor)

### Merchant PCI Requirements

With Ixopay tokenization:
- **SAQ Type**: SAQ-A (simplest, ~22 questions)
- **Network Scan**: Not required
- **Attestation**: Annual self-assessment only
- **No card data storage**: No merchant server touches card data

Without tokenization:
- **SAQ Type**: SAQ-D (complex, ~300+ questions)
- **Network Scan**: Quarterly ASV scans required
- **Attestation**: May require QSA audit
- **Secure storage**: PCI-compliant infrastructure needed

### PCI Configuration Guide

See: https://documentation.ixopay.com/modules/docs/tokenex/welcome#pci-configuration

Key configurations:
1. **Iframe Integration**: Ensures card data never enters DOM
2. **HTTPS Required**: All pages must use TLS 1.2+
3. **CSP Headers**: Content Security Policy to prevent XSS
4. **Token Storage**: Tokens can be stored safely (not reversible)

---

## Fraud Prevention Features

### Device Fingerprinting

Ixopay collects comprehensive device data:

**Automatic Collection:**
- Browser user agent
- Screen resolution
- Color depth
- Timezone
- Browser language
- Installed plugins
- Canvas fingerprint
- WebGL fingerprint

**Server-Side Collection:**
- IP address
- Geolocation
- ISP information
- Proxy detection

**Implementation in Project:**
```typescript
// /src/services/payvia.ts
const deviceData = {
  ipAddress: '', // Collected server-side
  userAgent: navigator.userAgent,
  browserLanguage: navigator.language,
  screenResolution: `${screen.width}x${screen.height}`,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};
```

### Kount Integration

Ixopay integrates with Kount for advanced risk analysis:

**Documentation**: https://documentation.ixopay.com/modules/docs/tokenex/kount-data-collection-and-risk-analysis

**Features:**
- Real-time fraud scoring
- Device reputation tracking
- Velocity checks (transactions per IP/device)
- Geolocation validation
- Email/phone verification
- Machine learning models

**Risk Scores:**
- 0-20: Low risk (approve)
- 21-40: Medium risk (review)
- 41-70: High risk (challenge)
- 71-100: Very high risk (decline)

### Velocity Checks

Automatic monitoring for:
- Multiple transactions from same IP
- Multiple transactions from same device
- Multiple transactions with same email
- Rapid-fire transaction attempts
- Unusual purchasing patterns

---

## Integration with Current Project

### Files Modified for Ixopay Integration

1. **`/src/components/PayviaCheckout.tsx`**
   - Embeds TokenEx iframes
   - Handles tokenization callbacks
   - Collects device data

2. **`/src/services/payvia.ts`**
   - Initializes TokenEx SDK
   - Manages authentication
   - Processes transactions

3. **`/supabase/functions/tokenex-auth/index.ts`**
   - Generates HMAC auth keys
   - Validates request origin
   - Returns time-limited tokens

4. **`/supabase/functions/payvia-process/index.ts`**
   - Receives tokenized transactions
   - Routes through Digitzs gateway
   - Logs for chargeback defense

### Environment Variables Required

**Supabase Edge Function Secrets:**
```bash
# TokenEx/Ixopay Configuration
TOKENEX_ID=6747114507881848
TOKENEX_SECRET_KEY=<client-secret-key>

# Digitzs Gateway
DIGITZS_MERCHANT_ID=digitzs-escapefrom-33738480-5013250-1771770463
DIGITZS_API_KEY=<api-key>
DIGITZS_APP_KEY=<app-key>
```

**Frontend Environment Variables:**
```bash
VITE_SUPABASE_URL=<supabase-project-url>
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
```

### Current Status

**Demo Mode:**
- TokenEx ID configured
- Client Secret Key needs to be added
- Mock transactions for testing

**To Enable Production:**
1. Obtain Client Secret Key from TokenEx portal
2. Add as Supabase Edge Function secret
3. Verify HTTPS on production domain
4. Test with $1 parking pass transactions
5. Monitor transaction logs

---

## Testing & Debugging

### Test Card Numbers

**Visa:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

**Mastercard:**
- Success: `5555 5555 5555 4444`

**American Express:**
- Success: `3782 822463 10005`

**Any CVV**: 123
**Any Expiration**: Future date (e.g., 12/25)
**Any ZIP**: 12345

### TokenEx Demo Application

Test the TokenEx platform directly:
https://tokenexwebdemo.azurewebsites.net/Home

Features:
- Live iframe demonstration
- Token generation testing
- API response viewing
- Various configuration options

### Debugging Tools

**Browser Console:**
```javascript
// Enable TokenEx debug mode
localStorage.setItem('tx-debug', 'true');

// Log all TokenEx events
iframe.on('load', () => console.log('Iframe loaded'));
iframe.on('tokenize', (data) => console.log('Token:', data));
iframe.on('error', (err) => console.error('Error:', err));
iframe.on('validate', (data) => console.log('Validation:', data));
```

**Edge Function Logs:**
- View in Supabase Dashboard → Edge Functions → Logs
- Filter by function name
- Check for authentication errors
- Verify HMAC generation

---

## Security Best Practices

### Authentication Key Management

1. **Never expose Client Secret Key** in frontend code
2. **Generate keys server-side** only
3. **Use 20-minute expiration** (TokenEx requirement)
4. **Validate request origin** before generating keys
5. **Rotate secrets periodically** (quarterly recommended)

### Token Handling

1. **Tokens are safe to store** (not reversible to card data)
2. **Use HTTPS** for all token transmission
3. **Implement CSP headers** to prevent XSS
4. **Log token usage** for audit trail
5. **Never log full card numbers** (PCI violation)

### Fraud Prevention

1. **Collect comprehensive device data** on every transaction
2. **Store device fingerprints** for chargeback defense
3. **Monitor velocity patterns** for unusual activity
4. **Implement 3D Secure** for high-value transactions
5. **Use address verification** (AVS) when available

---

## Support & Resources

### Ixopay Support

- **Email**: support@ixopay.com
- **Documentation**: https://documentation.ixopay.com/
- **GitHub**: https://github.com/TokenEx

### TokenEx Support

- **Email**: support@tokenex.com
- **Phone**: 1-800-836-3710
- **Portal**: https://portal.tokenex.com

### Digitzs/PayVia Support

- **Email**: support@digitzs.com
- **Phone**: 1-888-123-4567
- **Contact**: Laura@digitzs.com

---

## Related Documentation

- **`PAYVIA_INTEGRATION.md`** - Overview of PayVia checkout integration
- **`TOKENEX_SETUP.md`** - Step-by-step TokenEx credential setup
- **`DIGITZS_PAYVIA_END_TO_END.md`** - Complete implementation guide
- **`TICKETSOCKET_SETUP.md`** - TicketSocket API integration

---

## Appendix: Ixopay vs TokenEx Branding

**Note**: Ixopay and TokenEx are the same platform with different branding:

- **Ixopay**: Company name and platform
- **TokenEx**: Product name for tokenization service
- **Same technology**: Identical API, features, and security
- **Use interchangeably**: Documentation uses both names

Our implementation uses:
- "TokenEx" in code variables and function names
- "Ixopay" when referencing company documentation
- Both terms refer to the same tokenization platform

---

**Document Version**: 1.0
**Last Updated**: March 22, 2026
**Author**: Digitzs Integration Team
**Status**: Reference Documentation
