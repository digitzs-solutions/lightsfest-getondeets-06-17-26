# FINAL TEST INSTRUCTIONS - TokenEx is Whitelisted

## ✅ TokenEx Confirmed Whitelist

TokenEx support confirmed:
> "We have whitelisted this host (https://hppsbqucfklrrytfftye.supabase.co) in your Production Environment"

---

## 🎯 Two Ways to Test

### Option 1: Simple TokenEx Test Page (RECOMMENDED FIRST)

This is a standalone test page that ONLY tests if TokenEx iframe loads.

**URL:** https://hppsbqucfklrrytfftye.supabase.co/tokenex-test.html

**What to expect:**
- Page loads with purple gradient background
- You see two input fields: "Card Number" and "CVV"
- Within 5 seconds, you should see: "✅ SUCCESS! Domain is whitelisted. TokenEx iframe loaded."
- Try clicking in the Card Number field and typing numbers
- If whitelisted correctly, you can type and it formats: `1234 5678 9012 3456`

**If it fails:**
- You'll see a red error message
- An alert popup will show the exact TokenEx error
- Check the "Event Log" section for detailed logs

---

### Option 2: Full Lights Festival Flow

Test the complete ticket purchase flow.

**URL:** https://hppsbqucfklrrytfftye.supabase.co

**Steps:**
1. Click "Lights Festival" section
2. Click "Buy Tickets"
3. Select date and number of tickets
4. Click "Continue to Details"
5. Fill in contact information
6. Click "Continue to Payment"
7. Wait 5 seconds for TokenEx to load
8. You should see card number and CVV input fields
9. Try typing a test card number: `4111111111111111`

**What to check:**
- Open browser console (F12)
- Look for: `✓ TokenEx iframe LOADED successfully!`
- Card fields should be clickable and accept input
- No error alerts should appear

---

## 🔍 Debugging Steps

### 1. Check Console Logs

Open browser console (F12), you should see:

```
🔄 initializeTokenEx called, checking for TokenEx...
📍 Current origin: https://hppsbqucfklrrytfftye.supabase.co
✅ TokenEx library loaded: function
🔐 Fetching TokenEx auth from edge function...
📥 Auth response status: 200 OK
✅ Auth data received: {...}
Creating TokenEx iframe instance...
✓ TokenEx iframe LOADED successfully!
```

### 2. If You See Errors

Look for error logs like:
```
❌ TokenEx iframe ERROR: {...}
```

The error will contain:
- Error type
- Error message
- Full error details

### 3. Common Error Messages

**"Origin not allowed"** or **"Domain not whitelisted"**
- TokenEx hasn't propagated the whitelist yet
- Wait 15-30 minutes and try again
- Clear browser cache (Ctrl+Shift+R)

**"Authentication failed"**
- Could be HMAC signature issue
- Could be TokenEx ID mismatch
- Check console logs for details

**"Iframe failed to load"**
- Network issue
- Ad blocker blocking iframe
- Try disabling ad blocker

---

## ⏰ If It Still Doesn't Work

TokenEx whitelist changes can take time to propagate. If you get errors:

1. **Wait 15-30 minutes** - Their servers may be caching old whitelist
2. **Try incognito/private window** - Rules out browser cache
3. **Clear browser cache completely**
4. **Try different browser** - Chrome, Firefox, Safari
5. **Check exact URL** - Must be exactly: `https://hppsbqucfklrrytfftye.supabase.co`

---

## 📸 What to Send Me if It Fails

1. **Screenshot of the alert popup** (if one appears)
2. **Full console logs** (F12 → Console tab → copy all logs after clicking payment)
3. **Exact URL you're testing** (copy from browser address bar)
4. **Time you tested** (so I can check server logs)
5. **Error message on screen** (if any)

---

## ✨ What Success Looks Like

### Test Page (tokenex-test.html)
- Green success message: "✅ SUCCESS! Domain is whitelisted"
- Card number field accepts input
- Numbers auto-format as you type
- "Test Tokenization" button works
- Event log shows all green checkmarks

### Full App (Lights Festival)
- Payment step loads without errors
- Two input fields visible (card number and CVV)
- Fields are clickable and responsive
- No red error messages
- No alert popups
- Console shows "TokenEx iframe LOADED successfully!"

---

## 🚀 Next Steps After Success

Once TokenEx loads successfully:

1. Test with a real test card: `4111111111111111`
2. Enter any future expiry date: `12/26`
3. Enter any CVV: `123`
4. Complete a test purchase
5. Check if transaction processes through ProPay
6. Verify registration saves to database

---

## 📞 Support Reference

**TokenEx ID:** 3787957743127376
**Whitelisted Domain:** https://hppsbqucfklrrytfftye.supabase.co
**Environment:** Production
**TokenEx Region:** US1
**Confirmation:** Received from TokenEx support

---

## ⚡ Quick Test Commands

### Test Auth Endpoint
```bash
curl -X POST 'https://hppsbqucfklrrytfftye.supabase.co/functions/v1/tokenex-auth' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcHNicXVjZmtscnJ5dGZmdHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTIzNDMsImV4cCI6MjA4OTY4ODM0M30.e_XiXMdvIMyRX6noViWDUm9T7JTIhl0hRqpIsBVKKvk' \
  -d '{"tokenScheme":"sixTOKENfour","origin":"https://hppsbqucfklrrytfftye.supabase.co"}'
```

Should return: `{"success":true,"authenticationKey":"...","tokenExID":"3787957743127376",...}`

---

## 🎉 It Should Work Now!

TokenEx confirmed the whitelist. All configurations are correct. The build is ready.

**Just deploy and test at:**
- https://hppsbqucfklrrytfftye.supabase.co/tokenex-test.html (simple test)
- https://hppsbqucfklrrytfftye.supabase.co (full app)

If you still see errors, send me the details and we'll debug together!
