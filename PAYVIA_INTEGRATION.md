# Payvia Checkout Integration - Escape from Dinosaur Island

## Overview

This site demonstrates a **headless Payvia checkout** integration that wraps the Digitzs/ProPay MID through Tokenex iframes, routing transactions transparently to Stripe while TicketSocket remains unaware of the custom payment flow.

## Architecture

```
User Browser
    ↓
Tokenex Iframe (Triple-hash encryption at device level)
    ↓
Payvia Service Layer
    ↓
Digitzs Gateway (digitzs-escapefrom-33738480-5013250-1771270463)
    ↓
ProPay MID (33738480-5013250-1771270463)
    ↓
Stripe Processor
    ↓
TicketSocket Backend (sees only Stripe transactions)
```

## Key Components

### Frontend Integration

**`/src/components/PayviaCheckout.tsx`**
- Embeds Tokenex iframes for card number and CVV
- Collects customer information and device fingerprinting data
- Handles tokenization and payment submission
- Triple-hash encryption at device level (PCI DSS 4.0 compliant)

**`/src/services/payvia.ts`**
- Initializes Tokenex SDK with Digitzs MID configuration
- Manages device data collection (IP, geolocation, browser fingerprint)
- Handles transaction submission to edge function
- Processes payment responses

### Backend Integration

**`/supabase/functions/payvia-process/index.ts`**
- Edge function that receives tokenized payment data
- Routes transactions through Digitzs transparent gateway
- Logs transaction details for chargeback defense
- Returns standardized payment response

## Merchant ID Configuration

**Digitzs MID**: `digitzs-escapefrom-33738480-5013250-1771270463`
- Wraps ProPay MID: `33738480-5013250-1771270463`
- Connected to Stripe processor
- Supports all card types including AMEX

**Tokenex Config**:
- Token Scheme: `sixTokenSixDigit`
- Encryption: Triple-hash at device level
- Never touches our servers (PCI compliant)

## Transaction Flow

1. **Customer selects date/time** → Opens ticket modal
2. **Enters customer info** → First name, last name, email, phone, quantity
3. **Tokenex iframe loads** → Card and CVV fields rendered securely
4. **Customer enters card** → Tokenized at device level (triple-hash)
5. **Submit payment** → Token + customer data + device fingerprint sent to edge function
6. **Edge function processes** → Routes through Digitzs → ProPay → Stripe
7. **Transaction recorded** → Logged in TicketSocket alongside Stripe transactions
8. **Success callback** → User receives confirmation

## Data Captured for Chargeback Defense

Every transaction captures:
- IP Address
- Device fingerprint (user agent, screen resolution, timezone)
- Browser language
- Complete customer information
- Event details (name, date, time)
- Tokenex transaction token
- Gateway routing information

This comprehensive data collection provides maximum protection against chargebacks and fraud.

## Integration with TicketSocket

The beauty of this integration is that **TicketSocket doesn't know** we're using Payvia + Tokenex. They only see:
- Transactions appearing in their Stripe dashboard
- Standard Stripe payment records
- Normal webhook callbacks

Meanwhile, we get:
- Enhanced fraud protection via device fingerprinting
- Chargeback defense data collection
- Tokenex PCI compliance benefits
- Transparent gateway routing flexibility
- 2.99% + $0.30 pricing (vs Stripe's higher rates)

## Processor Flexibility

This same checkout can route to:
- **Stripe** (via Digitzs MID) ✓ Current configuration
- **NMI** (via raw ProPay MID 33738480)
- **PayPal Payments Pro**
- Any processor integrated with Digitzs

Simply change the processor config in the edge function - no frontend changes needed.

## Pricing

**MyValet/Digitzs Pricing**:
- $29/month merchant account
- 2.99% + $0.30 per transaction (all cards including AMEX)
- $29 per chargeback notification
- $29 per optional chargeback management
- $58 per dispute escalation (auto-submission + best win rate)

**Stripe Comparison**:
- 2.9% + $0.30 (Visa/MC)
- 3.5% + $0.30 (AMEX)
- $15 chargeback fee (no management)

## Demo vs Production

**Current Status**: Demo mode
- Tokenex SDK loads but uses fallback mock processing
- Shows transaction flow without real charges
- Console logs full transaction details

**To Enable Production**:
1. Add Tokenex authentication key to `/src/services/payvia.ts`
2. Configure Digitzs API credentials in edge function
3. Set up webhook handlers for payment confirmations
4. Enable live transaction processing

## Testing

Test the flow:
1. Click "Get Tickets" on homepage
2. Select a date (Thursday, Friday, or Saturday)
3. Choose a time slot (5PM - 9PM)
4. Fill in customer information
5. Enter test card: 4242 4242 4242 4242
6. Submit payment
7. View transaction details in console

## Benefits of This Approach

✓ **PCI Compliant** - Tokenex handles all card data
✓ **Fraud Protection** - Device fingerprinting + IP tracking
✓ **Chargeback Defense** - Comprehensive data collection
✓ **Processor Agnostic** - Switch processors without code changes
✓ **TicketSocket Compatible** - Seamless integration
✓ **Better Rates** - 2.99% vs 3.5% for AMEX
✓ **Enhanced Security** - Triple-hash encryption at device level
