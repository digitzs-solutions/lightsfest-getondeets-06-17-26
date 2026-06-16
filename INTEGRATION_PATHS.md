# Integration Paths - Credential Requirements

## The Question

**Do we need ProPay cert string and terminal ID when going:**
- TokenEx TPG → Digitzs v2 API → ProPay?

## Short Answer

**NO** - When using TokenEx → Digitzs v2 API, you do NOT need ProPay cert/terminal.

**Why?** Digitzs already has the ProPay credentials stored for MID `33595002` in their system.

## Credential Requirements by Path

### Path 1: TokenEx → Digitzs v2 API → ProPay (RECOMMENDED)
```
Frontend → TokenEx iframe → Token → Digitzs v2 API → ProPay
```

**You Need:**
- ✅ Digitzs MID: `ticketso-clevergroup-33595002-4398786-1724692895`
- ✅ Digitzs API Key
- ✅ TokenEx token

**You DON'T Need:**
- ❌ ProPay cert string (Digitzs has it)
- ❌ ProPay terminal ID (Digitzs has it)

**Why:** Digitzs manages the ProPay credentials internally.

### Path 2: TokenEx TPG → Direct ProPay (More Complex)
```
Frontend → TokenEx iframe → Token → TokenEx API → ProPay
```

**You Need:**
- ✅ TokenEx ID
- ✅ TokenEx API Key
- ✅ ProPay MID: `33595002`
- ✅ ProPay cert string ← **REQUIRED**
- ✅ ProPay terminal ID ← **REQUIRED**

**Why:** TokenEx bypasses Digitzs and goes straight to ProPay.

## Answer to Your Question

> "So curious if these two things are also required going from Tokenex TPG to Digitzs v2 API to ProPay?"

**NO** - ProPay cert and terminal are **NOT required** when using Digitzs v2 API.

Digitzs has the ProPay credentials stored. You only provide the Digitzs MID, and Digitzs handles ProPay routing internally.
