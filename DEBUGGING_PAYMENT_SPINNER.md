# Debugging Payment Spinner Issue

## What Was Added

I've added comprehensive console logging to help identify where the payment is getting stuck:

### Frontend Logs (Browser Console)

Look for these console messages in order:

1. **📤 Preparing payment request** - Shows request details
2. **🌐 Sending payment request...** - Request is being sent
3. **📥 Payment response received** - Response status received
4. **✅ Payment processed successfully** - Payment completed
5. **❌ Payment request error** - If an error occurs

### Backend Logs (Supabase Edge Function)

Check the Supabase dashboard logs for:

1. **"PayVia v4 Request"** - Shows incoming request data
2. **"Digitzs API URL"** - The endpoint being called
3. **"Digitzs response status"** - HTTP status from Digitzs
4. **"Digitzs raw response"** - The actual response text

## Common Issues

### Issue 1: Request Times Out (30 seconds)
**Symptoms**: Spinner for 30 seconds, then error message
**Logs**: `❌ Payment request error: AbortError`
**Causes**:
- Digitzs API is slow/down
- Network connectivity issue
- Edge function timeout

**Solution**: Check Supabase edge function logs to see if request reached the function

### Issue 2: Stuck at "Sending payment request"
**Symptoms**: Spinner never stops, no error
**Logs**: Last log is `🌐 Sending payment request...`
**Causes**:
- CORS issue (unlikely with Supabase edge functions)
- Browser blocking request
- Network connectivity

**Solution**: Open browser DevTools Network tab, look for the request to `/functions/v1/payvia-v4-process`

### Issue 3: Edge Function Error
**Symptoms**: Error returned quickly
**Logs**: Check edge function logs in Supabase dashboard
**Causes**:
- Missing environment variables
- Invalid credentials
- Digitzs API error

**Solution**: Check the specific error in the logs

### Issue 4: Validation Error (422)
**Symptoms**: Error about missing fields
**Logs**: `VALIDATION_ERROR` in response
**Causes**:
- Missing expMonth/expYear
- Invalid amount
- Missing token

**Solution**: Check the request payload in console logs

## How to Debug

### Step 1: Open Browser Console
1. Right-click page → Inspect
2. Go to Console tab
3. Clear console
4. Submit payment
5. Look for the emoji logs (📤, 🌐, 📥, ✅, ❌)

### Step 2: Check Network Tab
1. Go to Network tab
2. Filter by "Fetch/XHR"
3. Look for `payvia-v4-process`
4. Check:
   - Status code
   - Response preview
   - Timing (how long it took)

### Step 3: Check Supabase Logs
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Edge Functions → `payvia-v4-process`
4. Click "Logs" or "Invocations"
5. Look for recent invocations

## Expected Flow

```
1. User clicks "Complete Purchase"
   └─> 📤 Preparing payment request (console)

2. Frontend sends request
   └─> 🌐 Sending payment request (console)
   └─> Request visible in Network tab

3. Edge function receives request
   └─> "PayVia v4 Request" (edge function logs)
   └─> "Sending to Digitzs" (edge function logs)

4. Digitzs processes payment
   └─> "Digitzs response status" (edge function logs)
   └─> "Digitzs raw response" (edge function logs)

5. Edge function returns result
   └─> 📥 Payment response received (console)
   └─> ✅ Payment processed successfully (console)

6. Frontend proceeds to TicketSocket
   └─> "=== STEP 2: Creating TicketSocket order ===" (console)

7. Success page shown
   └─> Spinner stops
   └─> Order confirmation displayed
```

## Quick Test

Open your browser console and paste this to test the edge function directly:

```javascript
const test = async () => {
  const response = await fetch('https://hppsbqucfklrrytfftye.supabase.co/functions/v1/payvia-v4-process', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcHNicXVjZmtscnJ5dGZmdHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTIzNDMsImV4cCI6MjA4OTY4ODM0M30.e_XiXMdvIMyRX6noViWDUm9T7JTIhl0hRqpIsBVKKvk',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: '424242cO44OC4242',
      cardType: 'visa',
      amount: 50.00,
      expMonth: '12',
      expYear: '2029',
      zip: '78701',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      kountSessionId: '',
    }),
  });

  const result = await response.json();
  console.log('Status:', response.status);
  console.log('Result:', result);
};

test();
```

This will help identify if the issue is:
- In the edge function (returns error)
- In the payment gateway (edge function logs show error)
- In the frontend (console logs stop at certain point)

## Next Steps

1. **Run the test**: Try the payment and check console logs
2. **Share the logs**: Copy the console output showing where it stops
3. **Check edge function**: Look at Supabase dashboard for edge function errors
4. **Share error details**: Any error messages or response codes

The detailed logging will tell us exactly where the payment process is getting stuck.
