# End-to-End Production Guide: TokenEx → Kount → Processor Integration

## Table of Contents
1. [Current Working Flow](#current-working-flow)
2. [Production Transaction Checklist](#production-transaction-checklist)
3. [Building Your Next Site](#building-your-next-site)
4. [TicketSocket Integration](#ticketsocket-integration)
5. [Payvia/TokenEx Checkout Embedding](#payviatokenex-checkout-embedding)
6. [Complete Data Flow](#complete-data-flow)
7. [Troubleshooting](#troubleshooting)

---

## Current Working Flow

### Architecture Overview
```
Frontend (React)
    ↓
TokenEx iFrame (captures card data)
    ↓
Kount (fraud detection - session ID)
    ↓
TokenEx (creates token)
    ↓
Digitzs Edge Function (processes payment)
    ↓
ProPay Processor (decrypts token, processes, stores in vault)
    ↓
Response back through chain
```

### Active Components

#### 1. Frontend: LightsFestApp.tsx
- **Location**: `/src/LightsFestApp.tsx`
- **Purpose**: Beautiful event ticketing site with embedded checkout
- **Key Feature**: Multi-step checkout modal with TokenEx iframe

#### 2. TokenEx Configuration
- **Authentication Key ID**: Your TokenEx credentials
- **Token Scheme**: `sixDigitBin` + `fourDigitLast`
- **Timestamp Required**: Yes (prevents replay attacks)
- **URLs to Whitelist**:
  - `https://bzvrxwmyyydwjqkuehkr.supabase.co`
  - `http://localhost:5173`
  - Your production domain

#### 3. Kount Integration
- **Session ID**: Generated client-side using Kount Device Data Collector
- **Merchant ID**: 201000 (your Kount merchant ID)
- **Purpose**: Fraud scoring before payment processing

#### 4. Edge Functions (Backend)
- **digitzs-propay**: Main payment processor
- **tokenex-auth**: Generates TokenEx authentication keys
- **ticketsocket**: Manages event inventory

---

## Production Transaction Checklist

### Before First Transaction

- [ ] **TokenEx Whitelisting** (CRITICAL)
  - Email TokenEx support
  - Request whitelisting for: `https://bzvrxwmyyydwjqkuehkr.supabase.co`
  - Also whitelist `http://localhost:5173` for development
  - Confirm whitelisting is complete before testing

- [ ] **Environment Variables Set**
  ```bash
  # Supabase Edge Functions (already configured)
  TOKENEX_ID=your_tokenex_id
  TOKENEX_API_KEY=your_api_key
  DIGITZS_SECURITY_KEY=your_digitzs_key
  KOUNT_MERCHANT_ID=201000
  TICKETSOCKET_API_KEY=your_ts_key
  ```

- [ ] **Frontend Environment Variables**
  ```bash
  # .env file
  VITE_SUPABASE_URL=https://bzvrxwmyyydwjqkuehkr.supabase.co
  VITE_SUPABASE_ANON_KEY=your_anon_key
  VITE_TOKENEX_ID=your_tokenex_id
  ```

- [ ] **Test Edge Functions**
  ```bash
  # Test TokenEx auth
  curl https://bzvrxwmyyydwjqkuehkr.supabase.co/functions/v1/tokenex-auth

  # Should return: {"authenticationKey":"...","timestamp":"..."}
  ```

### Running First Transaction

1. **Open LightsFest App**
   - Navigate to http://localhost:5173
   - Click "Get Tickets" on any event

2. **Fill Out Checkout Form**
   - Enter attendee details
   - Select ticket quantity
   - Click "Continue to Payment"

3. **Enter Payment Info**
   - TokenEx iframe will load (if whitelisted)
   - Enter test card: `4111111111111111`
   - CVV: `999`
   - Expiry: Any future date

4. **Submit Payment**
   - Kount session ID generated automatically
   - TokenEx creates token
   - Digitzs processes via ProPay
   - Success response with transaction ID

5. **Verify in Database**
   ```sql
   SELECT * FROM registrations
   ORDER BY created_at DESC
   LIMIT 1;
   ```

---

## Building Your Next Site

### Step 1: Clone the Structure

```bash
# Copy the working LightsFest template
cp -r src/LightsFestApp.tsx src/YourNewSite.tsx
cp -r src/components/lights src/components/your-site
```

### Step 2: Update Routing

```typescript
// src/main.tsx
import YourNewSite from './YourNewSite';

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/lights', element: <LightsFestApp /> },
  { path: '/your-site', element: <YourNewSite /> },  // ADD THIS
]);
```

### Step 3: Customize Design

```typescript
// src/YourNewSite.tsx
export default function YourNewSite() {
  return (
    <div className="min-h-screen bg-your-color">
      <Navigation />  {/* Customize your nav */}
      <Hero />        {/* Your hero section */}
      <EventsSection /> {/* Connected to TicketSocket */}
      <Footer />
    </div>
  );
}
```

### Step 4: Connect to TicketSocket

See [TicketSocket Integration](#ticketsocket-integration) below.

### Step 5: Embed Checkout

See [Payvia/TokenEx Checkout Embedding](#payviatokenex-checkout-embedding) below.

---

## TicketSocket Integration

### Overview
TicketSocket provides event inventory, pricing, and availability. Your frontend pulls from their API and displays events dynamically.

### Edge Function: `ticketsocket`

**Location**: `/supabase/functions/ticketsocket/index.ts`

```typescript
// This function proxies TicketSocket API calls
// It handles authentication and CORS

// Get all events
GET /functions/v1/ticketsocket/events

// Get specific event
GET /functions/v1/ticketsocket/events/:eventId

// Response format:
{
  "id": "ts_event_123",
  "name": "Event Name",
  "date": "2026-06-15",
  "available_tickets": 500,
  "price": 45.00,
  "image_url": "https://..."
}
```

### Frontend Integration

```typescript
// src/services/ticketsocket-events.ts
import { supabase } from './supabase';

export async function fetchEvents() {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ticketsocket/events`,
    {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      }
    }
  );
  return response.json();
}
```

### Display Events on Frontend

```typescript
// src/components/EventsSection.tsx
import { useState, useEffect } from 'react';
import { fetchEvents } from '../services/ticketsocket-events';

export default function EventsSection() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents().then(setEvents);
  }, []);

  return (
    <div className="grid grid-cols-3 gap-6">
      {events.map(event => (
        <EventCard
          key={event.id}
          event={event}
          onBuyClick={() => openCheckout(event)}
        />
      ))}
    </div>
  );
}
```

### Connect "Buy" Buttons

```typescript
function EventCard({ event, onBuyClick }) {
  return (
    <div className="event-card">
      <img src={event.image_url} alt={event.name} />
      <h3>{event.name}</h3>
      <p>{event.date}</p>
      <p>${event.price}</p>
      <button
        onClick={onBuyClick}
        disabled={event.available_tickets === 0}
      >
        {event.available_tickets > 0 ? 'Buy Tickets' : 'Sold Out'}
      </button>
    </div>
  );
}
```

---

## Payvia/TokenEx Checkout Embedding

### The Complete Flow

```
User clicks "Buy Tickets"
    ↓
Modal opens with checkout form
    ↓
User fills attendee info → clicks "Continue to Payment"
    ↓
TokenEx iframe loads in payment step
    ↓
User enters card info (stays in iframe - never touches your server)
    ↓
Kount session ID generated (fraud check)
    ↓
User clicks "Complete Purchase"
    ↓
Frontend calls tokenEx.tokenize()
    ↓
TokenEx returns token (e.g., "4111********1111")
    ↓
Frontend sends token + Kount session + order details to your edge function
    ↓
Edge function calls Digitzs/ProPay with token
    ↓
ProPay decrypts token, processes payment, stores in vault
    ↓
Success! Transaction ID returned
```

### Step-by-Step Implementation

#### Step 1: Create Checkout Modal Component

```typescript
// src/components/checkout/CheckoutModal.tsx
import { useState } from 'react';
import { X } from 'lucide-react';

export default function CheckoutModal({ event, onClose }) {
  const [step, setStep] = useState(1); // 1: Info, 2: Payment, 3: Confirmation
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    quantity: 1
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Checkout</h2>
          <button onClick={onClose}><X /></button>
        </div>

        {/* Step Indicator */}
        <div className="flex mb-8">
          <Step number={1} active={step >= 1} label="Your Info" />
          <Step number={2} active={step >= 2} label="Payment" />
          <Step number={3} active={step >= 3} label="Confirmation" />
        </div>

        {/* Step Content */}
        {step === 1 && <AttendeeInfoForm data={formData} setData={setFormData} onNext={() => setStep(2)} />}
        {step === 2 && <PaymentForm formData={formData} event={event} onBack={() => setStep(1)} onSuccess={() => setStep(3)} />}
        {step === 3 && <ConfirmationScreen />}
      </div>
    </div>
  );
}
```

#### Step 2: Attendee Info Form

```typescript
function AttendeeInfoForm({ data, setData, onNext }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onNext(); }}>
      <input
        type="text"
        placeholder="First Name"
        value={data.firstName}
        onChange={(e) => setData({ ...data, firstName: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Last Name"
        value={data.lastName}
        onChange={(e) => setData({ ...data, lastName: e.target.value })}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={data.email}
        onChange={(e) => setData({ ...data, email: e.target.value })}
        required
      />
      <button type="submit">Continue to Payment</button>
    </form>
  );
}
```

#### Step 3: Payment Form with TokenEx Iframe

```typescript
import { useState, useEffect, useRef } from 'react';

function PaymentForm({ formData, event, onBack, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const tokenExRef = useRef(null);
  const kountSessionId = useRef('');

  // Initialize Kount
  useEffect(() => {
    const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    kountSessionId.current = sessionId;

    const script = document.createElement('script');
    script.src = `https://ssl.kaptcha.com/collect/sdk?m=201000&s=${sessionId}`;
    document.body.appendChild(script);

    return () => document.body.removeChild(script);
  }, []);

  // Initialize TokenEx
  useEffect(() => {
    async function initTokenEx() {
      // Get authentication key from your edge function
      const authResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tokenex-auth`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        }
      );
      const { authenticationKey, timestamp } = await authResponse.json();

      // Configure TokenEx iframe
      const iframe = new window.TokenEx.Iframe('tokenExIframe', {
        tokenExID: import.meta.env.VITE_TOKENEX_ID,
        authenticationKey,
        timestamp,
        tokenScheme: 'sixDigitBin+fourDigitLast',
        styles: {
          base: 'font-family: Arial, sans-serif; font-size: 16px; padding: 12px;',
          error: 'color: #ef4444;'
        },
        placeholder: '0000 0000 0000 0000',
        cvv: true
      });

      iframe.load();
      tokenExRef.current = iframe;
    }

    initTokenEx();
  }, []);

  async function handleSubmit() {
    setLoading(true);
    setError('');

    try {
      // Tokenize the card (this happens in TokenEx iframe)
      const tokenResult = await new Promise((resolve, reject) => {
        tokenExRef.current.tokenize((data) => {
          if (data.error) reject(data.error);
          else resolve(data);
        });
      });

      // Process payment via your edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/digitzs-propay`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token: tokenResult.token,
            cardBrand: tokenResult.cardBrand,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            amount: event.price * formData.quantity,
            kountSessionId: kountSessionId.current,
            eventId: event.id,
            quantity: formData.quantity
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        onSuccess();
      } else {
        setError(result.message || 'Payment failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Payment Information</h3>

      {/* TokenEx Iframe Container */}
      <div
        id="tokenExIframe"
        className="border border-gray-300 rounded-lg mb-4"
        style={{ height: '60px' }}
      />

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button onClick={onBack} className="btn-secondary">
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary flex-1"
        >
          {loading ? 'Processing...' : `Pay $${event.price * formData.quantity}`}
        </button>
      </div>
    </div>
  );
}
```

#### Step 4: Load TokenEx Script

```html
<!-- index.html -->
<head>
  <!-- ... other scripts ... -->
  <script src="https://htp.tokenex.com/iframe/iframe-v3.min.js"></script>
</head>
```

---

## Complete Data Flow

### Request Flow (Frontend → Backend)

```javascript
// 1. User submits payment form
{
  "token": "4111********1111",           // From TokenEx
  "cardBrand": "Visa",                   // From TokenEx
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "amount": 45.00,
  "kountSessionId": "1234567890-abc",   // From Kount DDC
  "eventId": "ts_event_123",            // From TicketSocket
  "quantity": 2
}

// 2. Edge function receives token, calls Digitzs API
POST https://secure.digitzs.com/api/v4/transaction/sale
{
  "security_key": "your_digitzs_key",
  "token": "4111********1111",
  "amount": "45.00",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "kount_session_id": "1234567890-abc"
}

// 3. Digitzs/ProPay processes:
//    - Decrypts token using TokenEx API
//    - Runs fraud check via Kount
//    - Processes payment with ProPay processor
//    - Stores card in vault (if recurring)
//    - Returns response

// 4. Edge function saves to database
INSERT INTO registrations (
  event_id,
  first_name,
  last_name,
  email,
  amount,
  payment_status,
  transaction_id,
  kount_session_id,
  payment_token
) VALUES (...);

// 5. Response sent to frontend
{
  "success": true,
  "transactionId": "propay_12345",
  "registrationId": "uuid-here"
}
```

### Response Flow (Backend → Frontend)

```javascript
// Success Response
{
  "success": true,
  "transactionId": "propay_12345",
  "message": "Payment processed successfully",
  "registrationId": "uuid-here",
  "receiptUrl": "https://..."
}

// Error Response
{
  "success": false,
  "error": "DECLINED",
  "message": "Card was declined",
  "code": "INSUFFICIENT_FUNDS"
}
```

---

## Troubleshooting

### TokenEx Iframe Not Loading

**Problem**: White box where iframe should be

**Solutions**:
1. Check console for CORS errors
2. Verify URL is whitelisted with TokenEx
3. Confirm `authenticationKey` and `timestamp` are valid
4. Check TokenEx ID is correct in `.env`

```javascript
// Debug: Log TokenEx config
console.log('TokenEx Config:', {
  tokenExID: import.meta.env.VITE_TOKENEX_ID,
  authKey: authenticationKey.substring(0, 10) + '...',
  timestamp
});
```

### Kount Session ID Issues

**Problem**: Kount script not loading or session ID null

**Solutions**:
1. Check network tab for Kount script
2. Verify merchant ID (201000)
3. Ensure script loads before tokenization

```javascript
// Debug: Verify Kount loaded
console.log('Kount Session ID:', kountSessionId.current);
```

### Payment Fails with "Invalid Token"

**Problem**: Token not recognized by processor

**Solutions**:
1. Verify token scheme matches: `sixDigitBin+fourDigitLast`
2. Check token is being passed correctly to edge function
3. Confirm Digitzs security key is correct

```javascript
// Debug: Log token before sending
console.log('Token being sent:', {
  token: tokenResult.token,
  brand: tokenResult.cardBrand
});
```

### Edge Function Errors

**Problem**: 500 error from edge function

**Solutions**:
1. Check edge function logs in Supabase dashboard
2. Verify all environment variables are set
3. Test edge function directly with curl

```bash
# Test edge function
curl -X POST https://bzvrxwmyyydwjqkuehkr.supabase.co/functions/v1/digitzs-propay \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Database Connection Issues

**Problem**: Can't save registration to database

**Solutions**:
1. Check RLS policies on `registrations` table
2. Verify service role key is used in edge function (not anon key)
3. Confirm table exists and schema matches

```sql
-- Verify table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'registrations';
```

---

## Quick Reference

### URLs
- **Supabase Project**: https://bzvrxwmyyydwjqkuehkr.supabase.co
- **Local Dev**: http://localhost:5173
- **TokenEx Iframe Script**: https://htp.tokenex.com/iframe/iframe-v3.min.js
- **Kount DDC**: https://ssl.kaptcha.com/collect/sdk

### Environment Variables
```bash
# Frontend (.env)
VITE_SUPABASE_URL=https://bzvrxwmyyydwjqkuehkr.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_TOKENEX_ID=your_tokenex_id

# Backend (Supabase Edge Function Secrets)
TOKENEX_ID=your_tokenex_id
TOKENEX_API_KEY=your_api_key
DIGITZS_SECURITY_KEY=your_digitzs_key
KOUNT_MERCHANT_ID=201000
TICKETSOCKET_API_KEY=your_ts_key
```

### Test Cards
```
Visa:       4111111111111111
Mastercard: 5555555555554444
Amex:       378282246310005
CVV:        999
Expiry:     Any future date
```

### Key Files
- Frontend: `/src/LightsFestApp.tsx`
- Checkout: `/src/components/lights/MultiStepCheckout.tsx`
- Payment Processor: `/supabase/functions/digitzs-propay/index.ts`
- TokenEx Auth: `/supabase/functions/tokenex-auth/index.ts`
- TicketSocket: `/supabase/functions/ticketsocket/index.ts`

---

## Next Steps

1. **Whitelist URL with TokenEx**: Email them `https://bzvrxwmyyydwjqkuehkr.supabase.co`
2. **Run Test Transaction**: Follow [Production Transaction Checklist](#production-transaction-checklist)
3. **Verify in Database**: Check `registrations` table for transaction record
4. **Build Next Site**: Use [Building Your Next Site](#building-your-next-site) guide
5. **Go Live**: Deploy to production domain and update whitelist

---

**Questions?** Refer to:
- [TOKENEX_SETUP.md](./TOKENEX_SETUP.md) - TokenEx configuration details
- [TICKETSOCKET_SETUP.md](./TICKETSOCKET_SETUP.md) - TicketSocket API integration
- [DIGITZS_PAYVIA_END_TO_END.md](./DIGITZS_PAYVIA_END_TO_END.md) - Detailed API flow
