# Digitzs Business Model & Architecture

## Executive Summary

**Digitzs = Modern Wrapper Around Legacy Systems**
No processor change, no software change. Pure value-add middleware.

## The Real Live Site

**URL:** https://register3.thelightsfest.com/checkout
**Status:** Production - DO NOT DISTURB
**MID:** `ticketso-viiveevents-32657983-1624031-151762577`
**Processor:** ProPay (wrapped by Digitzs)
**Volume:** Largest merchant - critical to protect

## What Happened 2 Years Ago

### The Plan
Paolo and Ross pushed new Payvia (TokenEx wrapped) iframe to replace v2 checkout:
- **Goal:** Avoid forcing TicketSocket Admin (TSA) to do new v3 integration
- **Why:** v3 API docs never finished and QA tested
- **Benefit:** Stay out of PCI scope with TokenEx

### What Went Wrong
- ✅ Brief success initially
- ❌ iframe not tested on multiple devices
- ❌ Card fields not loading in some browsers
- ❌ Cross-browser contamination issues
- ❌ **REVERTED BACK TO v2 CHECKOUT**

### Current State
**v2 Checkout = IN PCI SCOPE**
- Passing raw PANs directly to ProPay
- No iframe protection
- This is exactly why you need the fix

## The Solution: OneDeets.ai

**Goal:** Beautiful new subsecond loading subdomain that wraps legacy
**Demo Site:** Integrated to TicketSocket using Clever Group MID
**Appears as:** The Lights Fest (but it's actually demo/test)
**Real Lights Fest:** Must not be disturbed on register3.thelightsfest.com

## Pricing Model

### Customer Pays Digitzs
```
Setup:        $290 upfront
Monthly:      $290/month
Per-Txn:      2.99% + $0.30 (ON TOP OF processor fees)
Chargebacks:  $29 per submission/dispute alert
```

### What Customer Sees
When merchant clicks Digitzs v2 (WDE = We Do Everything):
1. Platform sells them on getting new merchant account
2. They click ProPay Terms & Conditions
3. They see: $29/month + 2.99% + $0.30 on all cards + $29/chargeback
4. ProPay charges: Their 4 bps + 5 cents + interchange
5. **Digitzs gets 95% of upside**

### The Math
```
Revenue:  2.99% + $0.30
Cost:     1.99% + $0.30 (ProPay - no TokenEx in v2)
Margin:   1.00% (~1%)
Split:    50/50 with platform partners like TicketSocket

Example on $100 transaction:
- Merchant charged: $100 × 2.99% + $0.30 = $3.29
- ProPay cost:      $100 × 1.99% + $0.30 = $2.29
- Gross margin:     $1.00
- Platform share:   $0.50
- Digitzs keeps:    $0.50
```

## Digitzs.com Positioning

**Tagline:** "Painless Payments for Platforms"
**Target:** ISOs and software platforms
**Value Prop:** Modern wrapper that doesn't require processor switching

## Product Roadmap: Licensed Product for ISOs

### Vision
When Payvia wrapper is on top, Digitzs is just one option:
- Connect NMI to legacy MIDs via Payvia
- Use ANY processor (not just ProPay)
- **Key benefit:** No longer passing raw PANs when using TokenEx wrapper

### Example: Priority Payments Use Case

**Scenario:** Legacy processor with hundreds of ISO resellers

**Current State:**
- Priority Payments processor
- ISOs make same math as Digitzs (tech-forward ISO with buy-rate at ProPay)
- Manual MID creation and management

**With Payvia Wrapper:**
```
Customer's Card → TokenEx iframe → Token →
Payvia API → Digitzs-NMI White Label API →
Priority Payments MID → Approved
```

**Benefits:**
- ISOs upsell legacy merchants
- NO processor change
- Pay $290/$290 + 0.299% + $0.30 on TOP of Priority fees
- Revenue share on all transactions
- Digitzs eats: TokenEx fees, Kount fees, NMI fees

## Three Seamless Products

### 1. Current: Digitzs ProPay MIDs
**Portal:** https://myvalet.ondeets.ai/sign-up
**Creates:** Digitzs ProPay MIDs only
**Monthly Cost:** $0 per MID (ProPay)

### 2. Manual ISO Input
**Portal generates:** Raw data for ISO to manually input
**ISO inputs to:** Their current processor (e.g., Priority)
**Payvia connects:** TokenEx/Kount → Digitzs-NMI → Priority MID
**Cost:** 5 bps + 6 cents (NMI gateway fees within 0.299% + $0.30)

### 3. White Label for ISOs
**Pricing:** $290 setup + $290/month + 0.299% + $0.30
**Digitzs eats:**
- TokenEx fees
- Kount fees
- NMI fees (if needed)
- Vendasta fees ($500/month for unlimited merchants)

**Vendasta provides:**
- Free CRM
- AI Chat Valet ($190/month value)
- Social media management

**Bundle if merchant pays $290:**
- Digitzs eats Vendasta $190/month AI features as value-add

## Cost Structure

### Per-Transaction Costs Digitzs Eats
```
TokenEx:    ~$0.10 per tokenization
Kount:      ~$0.05 per fraud check
NMI:        5 bps + $0.06 (only if using NMI gateway)
```

### Fixed Costs
```
Vendasta:   $500/month (unlimited merchants)
  - Includes CRM
  - Includes $190/month AI features if bundled
```

### Margin Math with All Fees
```
Revenue per $100 transaction:
  2.99% + $0.30 = $3.29

Costs:
  ProPay/Priority: 1.99% + $0.30 = $2.29
  TokenEx:         $0.10
  Kount:           $0.05
  NMI (if used):   $0.11 (5 bps + 6 cents)
  Total cost:      $2.55

Gross margin:      $0.74
Platform share:    $0.37
Digitzs keeps:     $0.37 per $100 transaction
```

## PCI Compliance Impact

### v2 (Current - BAD)
```
Raw PAN → ProPay
❌ In PCI scope
❌ Requires Level 1 compliance
❌ Risk exposure
```

### v3 with Payvia Wrapper (TARGET)
```
TokenEx → Token → Payvia → Digitzs → Processor
✅ Out of PCI scope
✅ SAQ-A compliance
✅ No raw PAN exposure
```

**Cost of being out of scope:** TokenEx + Kount fees (~$0.15/txn)
**Value:** Eliminates Level 1 PCI compliance burden for merchants and platforms

## Target Markets

### 1. Existing Platforms (Like TicketSocket)
- Already have processor relationships
- Don't want to switch
- Need PCI scope reduction
- Value: Security + no disruption

### 2. ISOs with Legacy Merchants
- Hundreds of existing MIDs
- Various processors (Priority, First Data, etc.)
- Looking for value-add upsell
- Value: Revenue share + merchant retention

### 3. New Platforms
- Building from scratch
- Want turnkey solution
- Need CRM + payments + fraud
- Value: All-in-one platform

## Competitive Advantage

**Traditional Payment Processors:**
- Require merchant switching
- Disruptive to existing relationships
- Lost revenue for ISOs

**Digitzs/Payvia Approach:**
- Wrapper around existing infrastructure
- No processor change needed
- ISO keeps existing revenue + adds new revenue stream
- Platform keeps merchant relationships

## Keys to Success

1. **Stability First:** Don't break register3.thelightsfest.com (largest merchant)
2. **Demo on OneDeets:** Use Clever Group MID for testing
3. **Perfect the wrapper:** TokenEx + Kount + multi-processor support
4. **ISO-friendly:** Make it easy to white label and resell
5. **Economics work:** $0.37 per $100 after all costs = sustainable

## Next Phase Goals

1. ✅ Fix v2 → Payvia wrapper (what we just did on demo)
2. ⏳ Test thoroughly on demo site (ondeets.ai)
3. ⏳ Get multi-device testing right (avoid past mistakes)
4. ⏳ Document ISO onboarding process
5. ⏳ Build MyValet integration for Priority/other processors
6. ⏳ Once proven stable → migrate register3.thelightsfest.com

## Critical Understanding

**DO NOT touch register3.thelightsfest.com until:**
- Demo site proven stable on all devices
- Multiple months of successful processing
- Fallback plan documented and tested
- TicketSocket approves migration

**Current work on demo (ondeets.ai) is:**
- Safe testing ground
- Uses Clever Group MID
- Can break without impacting revenue
- Path to eventually fixing the real Lights Fest

---

## Summary

Digitzs wraps legacy infrastructure with modern security and fraud prevention. The business model works because ISOs and platforms don't have to force merchants to switch processors. You charge a premium (0.299% + $0.30) for staying out of PCI scope and adding fraud prevention, and everyone wins: merchants get security, platforms keep relationships, ISOs add revenue, and Digitzs facilitates it all while eating the technology costs.
