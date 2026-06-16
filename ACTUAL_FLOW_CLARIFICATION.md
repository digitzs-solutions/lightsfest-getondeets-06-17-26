# CRITICAL: What We're Actually Working On

## The Real Production Site (DO NOT TOUCH)

**URL:** https://register3.thelightsfest.com/checkout
**MID:** `ticketso-viiveevents-32657983-1624031-151762577`
**Status:** 🔴 PRODUCTION - LARGEST MERCHANT - DO NOT DISTURB
**Current State:** v2 checkout (raw PANs to ProPay) - IN PCI SCOPE
**Why v2:** TokenEx iframe wrapper failed 2 years ago (device issues)

## The Demo Site We're Working On

**URL:** https://[ondeets.ai subdomain] (or local dev)
**MID:** `ticketso-clevergroup-33595002-4398786-1724692895` (Clever Group MID)
**Status:** ✅ SAFE TO MODIFY - DEMO/TESTING ONLY
**Purpose:** Appears as Lights Fest but actually our test environment
**Current Work:** Implementing Payvia wrapper correctly

## What Just Happened

### Problem We Solved
Local demo was trying to use TokenEx tokens with Digitzs v2 Direct API:
```
❌ TokenEx token → digitzs.transactiongateway.com/api/transact.php
ERROR: "11111 - Invalid card number"
```

### Solution We Implemented
Route through Payvia v4 API wrapper:
```
✅ TokenEx token → payvia-process edge function → 
Payvia v4 API → Digitzs → ProPay MID 33595002
```

**File Changed:** `src/components/lights/MultiStepCheckout.tsx`
**Change:** Updated endpoint from `digitzs-tokenex` to `payvia-process`
**Impact:** Demo site only - testing ground for eventual production rollout

## The History (2 Years Ago)

### What Happened
1. Paolo and Ross pushed TokenEx iframe wrapper to production
2. Goal: Get TicketSocket merchants out of PCI scope without v3 API rewrite
3. Initial success ✅
4. Then: Multi-device issues, cross-browser problems
5. Emergency rollback to v2 (raw PANs) ❌
6. This is why register3.thelightsfest.com is IN PCI SCOPE today

### Why It Matters
- Can't risk another failed production rollout
- Must test thoroughly on demo first
- Must verify all devices/browsers
- Must have fallback plan

## Current Architecture Comparison

### Real Production (register3.thelightsfest.com)
```
⚠️ v2 CHECKOUT - IN PCI SCOPE:
Card form → Raw PAN → Digitzs v2 API → 
ProPay MID 32657983 → Approved

ISSUES:
- Raw PAN touches servers
- Level 1 PCI compliance required
- Security risk
- Given 6 months to migrate to v3
```

### Demo Site (ondeets.ai / local dev)
```
✅ PAYVIA WRAPPER - OUT OF PCI SCOPE:
TokenEx iframe → Token → Payvia v4 API → 
Detokenizes server-side → Digitzs v2 → 
ProPay MID 33595002 (Clever Group) → Approved

BENEFITS:
- Token never becomes PAN on your servers
- SAQ-A compliance (easiest)
- Tested on demo before production
- This IS the v3 migration path
```

## MID Clarification

### Production MID (ViiVee Events - Lights Fest)
```
ticketso-viiveevents-32657983-1624031-151762577
         └─ viiveevents (event company)
                       └─ 32657983 (ProPay MID)
```
**Status:** Live, processing real transactions, largest volume

### Demo MID (Clever Group - Test)
```
ticketso-clevergroup-33595002-4398786-1724692895
         └─ clevergroup (test account)
                       └─ 33595002 (ProPay MID)
```
**Status:** Test/demo, safe to break, used for development

## The Business Model Context

### Why Modern Wrapper Matters

**Value Proposition:**
- ISO partners don't lose merchant relationships
- No processor switching required
- Add $290/$290 + 0.299% + $0.30 on TOP of existing fees
- Split revenue 50/50 with platforms

**Example with Priority Payments:**
- ISO has legacy Priority Payments MIDs
- Wrap with Payvia/TokenEx/Kount
- Route through Digitzs-NMI white label to Priority
- ISO keeps existing margins + adds new revenue stream
- Merchant gets PCI scope reduction + fraud prevention

### Cost Structure Digitzs Eats
```
TokenEx:    ~$0.10/transaction
Kount:      ~$0.05/transaction  
NMI:        5 bps + $0.06 (if needed)
Vendasta:   $500/month (unlimited merchants)

Total per $100 transaction:
Revenue:  $2.99 + $0.30 = $3.29
Costs:    ~$2.55 (processor + tech stack)
Margin:   ~$0.74
Split:    $0.37 platform, $0.37 Digitzs
```

## Why We Can't Touch Production Yet

### Lessons from 2 Years Ago
1. ❌ Pushed iframe to production too fast
2. ❌ Didn't test all devices thoroughly  
3. ❌ Had to emergency rollback
4. ❌ Lost trust with TicketSocket
5. ❌ Merchants stuck in PCI scope since then

### What We Must Do Now
1. ✅ Perfect it on demo site first
2. ⏳ Test every device and browser
3. ⏳ Run parallel processing (demo vs production)
4. ⏳ Document every edge case
5. ⏳ Get TicketSocket approval
6. ⏳ Plan migration with fallback

## Where We Are Today

### Demo Site Status
- ✅ Payvia v4 wrapper implemented
- ✅ TokenEx iframe configured  
- ✅ Edge function deployed
- ✅ Using Clever Group MID (safe)
- ⏳ Need thorough testing
- ⏳ Need device compatibility verification

### Production Site Status
- 🔴 Still on v2 (raw PANs)
- 🔴 Still in PCI scope
- 🔴 DO NOT TOUCH until demo proven
- 🔴 Largest merchant - critical revenue

## Next Steps (In Order)

### Phase 1: Demo Validation (NOW)
1. Test with real cards on demo
2. Verify all device types
3. Check all major browsers
4. Confirm fraud prevention (Kount)
5. Validate TicketSocket integration
6. Document success metrics

### Phase 2: ISO Product Development
1. Build MyValet integration for Priority/other processors
2. Create ISO onboarding documentation
3. Test NMI gateway routing to non-ProPay processors
4. Verify white label functionality
5. Calculate exact cost structure per processor

### Phase 3: Production Migration (LATER)
1. Present results to TicketSocket
2. Plan migration schedule
3. Create fallback procedures
4. Monitor first transactions closely
5. Gradually increase volume
6. Full cutover only when 100% confident

## Key Takeaways

1. **We're working on DEMO, not production** - Safe to experiment
2. **Payvia wrapper = v3 migration path** - This is what auditors want
3. **Business model = wrapper economics** - Must work for ISOs
4. **Can't rush production** - Learned that lesson 2 years ago
5. **Demo uses Clever Group MID** - Real Lights Fest uses ViiVee Events MID

## Questions to Consider

### For v2 Path Analysis
1. How exactly does register3.thelightsfest.com currently process?
2. What iframe/form is being used (if any)?
3. Is it truly raw PAN to ProPay or some other tokenization?
4. What caused the original iframe failures?

### For ISO Product
1. Which processors have you validated routing to?
2. What's the NMI gateway setup process?
3. How do ISOs white label the MyValet portal?
4. What's the exact margin split options?

### For Production Readiness
1. What metrics define "ready for production"?
2. Who at TicketSocket needs to approve?
3. What's the rollback procedure?
4. How long will parallel processing run?

---

**REMEMBER:** Everything we build and test is on the DEMO/DEV environment using Clever Group MID. The real Lights Fest on register3.thelightsfest.com with ViiVee Events MID is untouchable until we have absolute confidence in the wrapper solution.
