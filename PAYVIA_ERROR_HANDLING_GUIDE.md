# PayVia Error Handling Implementation Guide

## Overview

This project now implements PayVia's official JSON:API error format with comprehensive error handling, retry logic, and user-friendly messaging.

## What Was Implemented

### 1. **JSON:API Error Format (Backend)**

The `payvia-v4-process` edge function now returns errors in PayVia's standard format:

```json
{
  "jsonapi": { "version": "1.0" },
  "errors": [
    {
      "id": "unique_error_id",
      "status": "402",
      "code": "PAYMENT_DECLINED",
      "title": "Payment Required",
      "detail": "Your card was declined. Please try another payment method.",
      "meta": {
        "decline_code": "insufficient_funds",
        "processor_response": "Insufficient funds"
      }
    }
  ]
}
```

### 2. **Error Types and Status Codes**

#### Validation Errors (422)
- Missing required fields (token, amount, expMonth, expYear)
- Returns specific field pointers for form validation
- Example: `/data/attributes/paymentMethodData/expirationMonth`

#### Payment Declined (402)
- Card declined by processor
- Insufficient funds
- Expired card
- Invalid account
- Includes decline codes and processor responses

#### Configuration Errors (500)
- Missing merchant credentials
- Gateway configuration issues

#### Service Unavailable (503)
- Network timeouts
- Fetch failures
- Recommended for retry with backoff

### 3. **Frontend Error Handler Utility**

Created `/src/utils/payvia-error-handler.ts` with:

- **PayViaError class**: Custom error type for PayVia responses
- **handlePayViaResponse()**: Parses and throws typed errors
- **retryWithBackoff()**: Automatic retry with exponential backoff
- **logPayViaError()**: Structured error logging

### 4. **User-Friendly Error Messages**

Error codes are mapped to clear, actionable messages:

| Error Code | User Message |
|------------|--------------|
| `INSUFFICIENT_FUNDS` | "Your card has insufficient funds. Please try another payment method." |
| `CARD_DECLINED` | "Your payment was declined. Please try another card or contact your bank." |
| `VALIDATION_ERROR` | "Please check your payment information and try again." |
| `SERVICE_UNAVAILABLE` | "Our payment service is temporarily unavailable. Please try again later." |

### 5. **Automatic Retry Logic**

Server errors (5xx) and transient failures automatically retry with exponential backoff:

```typescript
// Retries up to 3 times with increasing delays: 1s, 2s, 4s
const result = await retryWithBackoff(async () => {
  const response = await fetch(apiUrl, options);
  return handlePayViaResponse(response);
});
```

### 6. **ProPay Decline Code Mapping**

NMI/ProPay response codes mapped to user messages:

| Code | Meaning |
|------|---------|
| 200 | Transaction declined |
| 201 | Call for authorization |
| 251 | Insufficient funds |
| 252 | No checking account |
| 253 | No savings account |

## How to Test

### Test on Whitelisted Domain

1. Deploy to Supabase (domain is whitelisted with TokenEx):
   ```bash
   # Build the project
   npm run build

   # Deploy to Supabase Storage
   # The app will be available at:
   # https://hppsbqucfklrrytfftye.supabase.co
   ```

2. Test successful payment:
   - Use test card: `4242 4242 4242 4242`
   - Expiry: 12/29
   - Should see success response

3. Test error scenarios:
   - **Expired card**: Use expiry date within 2 months (e.g., 06/26)
   - **Missing fields**: Leave expiry blank
   - **Network error**: Disable network briefly during submission

### Test Error Handling in Console

```javascript
// The frontend exposes error details in console:
// Look for: "PayVia Error: { ... }"

// You'll see structured logs with:
// - timestamp
// - statusCode
// - errors array
// - context (amount, orderId, etc.)
// - userMessage
```

## Key Features

### ✅ Validation Errors
- Field-level validation with specific error pointers
- Clear indication of what needs to be fixed

### ✅ Payment Declined Handling
- User-friendly decline messages
- Includes processor decline codes for debugging
- Distinguishes between validation (400) and payment (402) errors

### ✅ Retry Logic
- Automatic retry for transient errors (5xx)
- Exponential backoff: 1s, 2s, 4s delays
- Does NOT retry client errors (4xx)

### ✅ Error Logging
- Structured error logging with context
- Includes transaction details for debugging
- Alerts on critical errors (5xx)

### ✅ User Experience
- Clear, actionable error messages
- No technical jargon exposed to users
- Field-specific validation feedback

## ProPay Credentials Configured

The following ProPay credentials are now configured:

```
API Key: pOZnjKUSBk8pEhBoOAu0qzz6WpfqLxm3YmmZnDy2
APP Key: AK94lx3fPPIFZLhFU1pjI7YVnxvtg4Ln2za2BXOswuBIU3K3gDErj8JsWqd1AjdA
```

These are stored in `.env` and deployed to Supabase edge functions.

## Common Issues and Solutions

### Issue: "Payment authentication failed"
**Cause**: HMAC signature or TokenEx credentials incorrect
**Solution**: Verify TokenEx API key and ensure domain is whitelisted

### Issue: "Payment was declined (402)"
**Cause**: Card declined by processor
**Solutions**:
- Check card expiry is 3+ months in future
- Verify card has sufficient funds
- Try different payment method
- Check merchant configuration

### Issue: "Validation Failed (422)"
**Cause**: Missing or invalid fields
**Solution**: Check all required fields are provided:
- token (TokenEx token)
- amount (positive number)
- expMonth (2 digits)
- expYear (4 digits)

### Issue: "Service Unavailable (503)"
**Cause**: Network timeout or gateway issue
**Solution**: Wait and retry (automatic retry happens up to 3 times)

## API Reference

### Request Format
```typescript
POST /functions/v1/payvia-v4-process

{
  "token": "424242cO44OC4242",
  "cardType": "visa",
  "amount": 150.00,
  "expMonth": "12",
  "expYear": "2029",
  "zip": "78701",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "kountSessionId": "abc123xyz"
}
```

### Success Response (200)
```json
{
  "success": true,
  "transactionId": "1234567890",
  "authCode": "ABC123",
  "amount": 150.00,
  "responseText": "Approved",
  "token": "424242cO44OC4242"
}
```

### Error Response (402)
```json
{
  "jsonapi": { "version": "1.0" },
  "errors": [
    {
      "status": "402",
      "code": "INSUFFICIENT_FUNDS",
      "title": "Insufficient Funds",
      "detail": "Your card has insufficient funds. Please try another payment method.",
      "meta": {
        "decline_code": "251",
        "processor_response": "Insufficient funds"
      }
    }
  ]
}
```

## Next Steps

1. **Test on Production Domain**: Once your production domain (payvia.ai or ondeets.ai) is whitelisted with TokenEx, test there
2. **Monitor Error Rates**: Set up monitoring for error patterns
3. **Add Analytics**: Track which error types are most common
4. **Implement Webhooks**: Add webhook handling for async payment updates

## Resources

- [PayVia Error Handling Docs](https://payvia-65a748ab.mintlify.app/api-reference/error-handling)
- [JSON:API Specification](https://jsonapi.org/format/#errors)
- [ProPay Response Codes](https://docs.propay.com)

## Support

For issues with:
- **TokenEx**: Contact TokenEx support for domain whitelisting
- **ProPay**: Contact ProPay support for merchant configuration
- **PayVia**: Contact PayVia support for API issues
- **Digitzs**: Contact Digitzs support for security key issues
