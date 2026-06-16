# TokenEx → Kount → ProPay Flow

This document describes the integration flow using TokenEx for tokenization, Kount for fraud detection, and ProPay for payment processing.

## Architecture

```
User enters card → TokenEx iframe → Get Token → Send to Kount → Get Session ID →
→ Send Token + Session to Backend → Send Token to ProPay → ProPay processes payment
```

## Key Difference from TokenEx Flow

**Previous**: Backend detokenizes card data, then processes
**New**: Backend sends TokenEx token directly to ProPay, ProPay handles detokenization

## ProPay Integration Requirements

ProPay must support one of these methods:

### Option 1: ProPay TokenEx Integration (Preferred)
- ProPay has a direct integration with TokenEx
- Send TokenEx token directly to ProPay
- ProPay detokenizes internally via their TokenEx relationship

### Option 2: ProPay Token Passthrough
- Send TokenEx token as a payment method identifier
- ProPay processes it as a third-party token

## Environment Variables Required

```
VITE_TOKENEX_ID=your_tokenex_id
VITE_TOKENEX_TIMESTAMP_TOLERANCE=10
KOUNT_MERCHANT_ID=your_kount_merchant_id
PROPAY_API_KEY=your_propay_api_key
PROPAY_CERT_STR=your_propay_cert (if needed)
PROPAY_ACCOUNT_NUM=your_propay_account
PROPAY_TERMINAL_ID=your_propay_terminal_id
```

## Benefits

1. **No detokenization needed**: ProPay handles token directly
2. **Simpler backend**: No need to handle raw card data
3. **Better security**: Token never leaves TokenEx/ProPay ecosystem
4. **Kount integration**: Fraud detection still in place

## API Endpoints

### ProPay Payment API (Example)
```
POST https://api.propay.com/protectpay/payments
{
  "accountNumber": "PROPAY_ACCOUNT",
  "terminalId": "TERMINAL_ID",
  "token": "TOKENEX_TOKEN",
  "amount": "99.99",
  "fraudSessionId": "KOUNT_SESSION_ID"
}
```

Note: Actual ProPay API structure depends on their TokenEx integration capabilities.
