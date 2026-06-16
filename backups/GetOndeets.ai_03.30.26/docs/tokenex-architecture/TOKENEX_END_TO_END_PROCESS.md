# Tokenex End-to-End Payment Process Documentation

## Overview
Payvia is a processor-agnostic embedded checkout that wraps Tokenex's iFrame and connects to 200+ payment processors through Tokenex's Transparent Gateway.

## System Architecture

### Components
1. **Payvia Checkout** - Wrapper around Tokenex iFrame
2. **Tokenex iFrame** - Secure tokenization interface
3. **Tokenex Transparent Gateway** - Routes to 200+ processors
4. **Processor MIDs** - Merchant accounts at various processors

## Current Setup

### Events & Their MIDs
- **Lights Fest** - Propay MID: 33595002
- **Escape from Dinosaur Island** - Propay MID: 33595002

### MID Configuration
- **Digitzs MID**: `ticketso-clevergroup-33595002-4398786-1724692895`
  - Tier: TicketSocket-Tier
  - Connected to: Propay MID 33595002
  - White label of: NMI.com

- **NMI Direct MID**: Same Propay MID 33595002
  - Integrated directly to Propay (not through Digitzs)

## Payment Flow (When Tokenex is Active)

### Step 1: Customer Initiates Checkout
```
User clicks "Register" → Opens Payvia Checkout Modal
```

### Step 2: Tokenex iFrame Loads
```javascript
// TokenEx iFrame Configuration
{
  tokenExID: "YOUR_TOKENEX_ID",
  tokenScheme: "PCI",
  origin: "https://your-domain.com",
  timestamp: Date.now(),
  authenticationKey: "generated_hmac_key"
}
```

### Step 3: Customer Enters Card Data
- Card data entered directly into Tokenex iFrame
- PCI compliance handled by Tokenex
- No card data touches your servers

### Step 4: Tokenization
```
Tokenex creates token: "6f7d9a2b-4e3c-8f1a-0b5d-9e2c1f4a7b3d"
Token represents card data securely
```

### Step 5: Token Sent to Your Backend
```javascript
// Frontend sends to your edge function
POST /functions/v1/payvia-process
{
  tokenexToken: "6f7d9a2b-4e3c-8f1a-0b5d-9e2c1f4a7b3d",
  amount: 45.00,
  merchantId: "33595002",
  processor: "propay",
  gatewayType: "digitzs"
}
```

### Step 6: Your Backend Processes via Tokenex Transparent Gateway
```javascript
// Your edge function calls Tokenex API
POST https://api.tokenex.com/v2/TransparentGatewayAPI
Headers:
  tx-tokenex-id: "YOUR_TOKENEX_ID"
  tx-apikey: "YOUR_API_KEY"

Body:
{
  Token: "6f7d9a2b-4e3c-8f1a-0b5d-9e2c1f4a7b3d",
  Amount: "45.00",
  Gateway: "NMI",
  MerchantID: "33595002",
  TransactionType: "sale"
}
```

### Step 7: Tokenex Routes to Processor
```
Tokenex Transparent Gateway
  → Detokenizes card data
  → Routes to NMI/Digitzs
  → Forwards to Propay MID 33595002
  → Processes transaction
```

### Step 8: Response Chain
```
Propay → NMI/Digitzs → Tokenex → Your Edge Function → Frontend
```

### Step 9: Store Transaction
```javascript
// Save to Supabase
INSERT INTO registrations (
  transaction_id,
  customer_email,
  amount,
  status,
  processor
)
```

### Step 10: TicketSocket Integration
```javascript
// Create ticket in TicketSocket
POST https://api.ticketsocket.com/v1/orders
{
  eventId: "ts_event_id",
  customerEmail: "user@example.com",
  ticketQuantity: 2,
  transactionId: "txn_123"
}
```

## API Endpoints & Credentials

### Tokenex
- **iFrame URL**: `https://htp.tokenex.com/iframe/v3/`
- **API URL**: `https://api.tokenex.com/v2/TransparentGatewayAPI`
- **Credentials**:
  - TokenEx ID: (stored in edge function secrets)
  - API Key: (stored in edge function secrets)
  - HMAC Key: (for iFrame authentication)

### Digitzs (NMI White Label)
- **Gateway URL**: `https://digitzs.transactiongateway.com/api/transact.php`
- **MID**: 33595002
- **Credentials**:
  - Security Key: (stored in edge function secrets)

### TicketSocket
- **API URL**: `https://api.ticketsocket.com/v1/`
- **Credentials**:
  - API Key: (stored in edge function secrets)

## Tokenex Configuration Steps (For Reactivation)

### 1. Login to Tokenex Dashboard
- URL: https://portal.tokenex.com

### 2. Configure Transparent Gateway
```
Settings → Transparent Gateway → Add Gateway
  Gateway: NMI
  MID: 33595002
  Credentials: [Propay credentials]
```

### 3. Generate API Keys
```
Settings → API Keys → Create New Key
  Permissions: Tokenize, Detokenize, TransparentGateway
```

### 4. Configure iFrame
```
Settings → iFrame → Configuration
  Allowed Origins: https://your-domain.com
  Token Scheme: PCI
  CVV Required: Yes
  Styles: Custom CSS
```

### 5. Update Edge Function Secrets
```bash
# These will be set via Supabase dashboard
TOKENEX_ID=your_tokenex_id
TOKENEX_API_KEY=your_api_key
TOKENEX_HMAC_KEY=your_hmac_key
```

## Security Features

### PCI Compliance
- Card data never touches your servers
- Tokenex handles all PCI DSS requirements
- You only store tokens, not card data

### 3D Secure (Optional)
- Can be enabled in Tokenex settings
- Adds additional authentication layer
- Reduces chargeback liability

### Device Fingerprinting
- Collect browser/device data
- Send with transaction for fraud detection
- Increases approval rates

## Troubleshooting

### iFrame Won't Load
- Check allowed origins in Tokenex dashboard
- Verify HMAC authentication key is correct
- Check timestamp is within 5-minute window

### Tokenization Fails
- Verify API credentials
- Check card number is valid test card
- Ensure CVV is included if required

### Transaction Declined
- Check MID is active with processor
- Verify amount format (decimal with 2 places)
- Check processor-specific requirements

### TicketSocket Sync Issues
- Verify API key is valid
- Check event ID exists in TicketSocket
- Ensure customer data format is correct

## Migration Path (Tokenex → Direct NMI)

When Tokenex is unavailable, you can process directly through Digitzs/NMI:

### Differences
| Feature | Tokenex | Direct NMI |
|---------|---------|------------|
| PCI Scope | Tokenex handles | You must handle |
| iFrame | Tokenex hosted | Self-hosted form |
| Multi-processor | 200+ processors | NMI/Digitzs only |
| Setup complexity | Higher | Lower |
| Monthly cost | Tokenex + processor | Processor only |

### Implementation
See `DIGITZS_DIRECT_INTEGRATION.md` for direct integration details.

## Testing

### Tokenex Test Cards
```
Visa: 4111111111111111
Mastercard: 5499740000000057
Amex: 371449635398431
CVV: Any 3-4 digits
Expiry: Any future date
```

### Test Environment
- Tokenex Sandbox: Available when account is active
- Test MID: Separate test MID for non-production

## Resume Checklist (When Tokenex Reactivates)

- [ ] Verify Tokenex account is active
- [ ] Confirm billing issue is resolved
- [ ] Test iFrame loads correctly
- [ ] Test tokenization flow
- [ ] Test transaction processing through Transparent Gateway
- [ ] Verify MID 33595002 is still connected
- [ ] Test both Lights Fest and Dinosaur Island events
- [ ] Verify TicketSocket integration still works
- [ ] Update edge function secrets if keys changed
- [ ] Run end-to-end test transaction
- [ ] Monitor first few live transactions

## Support Contacts

### Tokenex
- Support: support@tokenex.com
- Phone: (405) 546-0590
- Portal: https://portal.tokenex.com

### NMI/Digitzs
- Support: support@nmi.com
- Portal: https://secure.digitzs.transactiongateway.com

### Propay
- Support: propay.com/support
- Phone: Check your merchant portal

## Notes
- Tokenex deactivated 2024-03-23 due to billing error on their part
- All MIDs remain active at processor level
- Direct NMI integration implemented as backup
- TicketSocket integration remains functional
