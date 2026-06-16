# TokenEx → Kount → TokenEx Flow (Saved Configuration)

This document captures the working configuration for the TokenEx → Kount → TokenEx integration flow before switching to ProPay.

## Architecture

```
User enters card → TokenEx iframe → Get Token → Send to Kount → Get Session ID →
→ Send Token + Session to Backend → TokenEx detokenizes → Processes payment
```

## Key Components

### Frontend: MultiStepCheckout.tsx

- TokenEx iframe for card capture
- Kount 360 data collection
- Sends both token and Kount session to backend

### Backend: digitzs-direct Edge Function

```typescript
// Detokenizes using TokenEx API
const detokenizeResponse = await fetch('https://api.tokenex.com/v2/detokenize', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${tokenExApiKey}`
  },
  body: JSON.stringify({
    tokenExId: tokenExId,
    token: paymentToken
  })
});

// Processes with detokenized card data
```

## Environment Variables Required

```
VITE_TOKENEX_ID=your_tokenex_id
VITE_TOKENEX_TIMESTAMP_TOLERANCE=10
TOKENEX_API_KEY=your_tokenex_api_key (backend)
TOKENEX_TOKEN_SCHEME=your_token_scheme (backend)
KOUNT_MERCHANT_ID=your_kount_merchant_id
```

## Database Schema

```sql
ALTER TABLE registrations ADD COLUMN payment_token text;
ALTER TABLE registrations ADD COLUMN kount_session_id text;
```

## Frontend Payment Flow

1. Initialize TokenEx iframe
2. Initialize Kount 360 datacollection
3. User enters card → TokenEx tokenizes
4. Send token + Kount session to backend
5. Backend detokenizes and processes

## Notes

- TokenEx HMAC authentication handled by tokenex-auth edge function
- Kount session captured for fraud prevention
- Token stored for potential future use (refunds, recurring)
- This flow keeps all PCI compliance with TokenEx
