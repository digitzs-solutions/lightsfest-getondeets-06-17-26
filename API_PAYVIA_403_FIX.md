# api.payvia.ondeets.ai 403 Forbidden - Resolution Guide

## Problem

`https://api.payvia.ondeets.ai/` returns **403 Forbidden** with AWS API Gateway error:

```json
{
  "message": "Forbidden"
}
```

**Headers indicate AWS API Gateway:**
- `x-amzn-errortype: ForbiddenException`
- `x-amzn-requestid: 77ed8aaf-aedb-42fc-b921-2939de96008c`

**This is SEPARATE from the TokenEx whitelisting issue.**

## Root Causes (AWS API Gateway 403)

### 1. API Key Required ⭐ (Most Likely)

The API endpoint requires an `x-api-key` header.

**Test:**
```bash
curl -H "x-api-key: YOUR_API_KEY" https://api.payvia.ondeets.ai/health
```

**Fix in AWS Console:**
1. Go to API Gateway → Your API
2. Select the method (GET, POST, etc.)
3. Method Request → **API Key Required**: Set to `false`
4. Deploy the API to your stage

### 2. Resource Policy Restriction

API Gateway has a resource policy that restricts access.

**Check Policy:**
```bash
aws apigateway get-rest-api \
  --rest-api-id YOUR_API_ID \
  --query 'policy'
```

**Fix:**
Update the resource policy to allow public access:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "execute-api:Invoke",
      "Resource": "arn:aws:execute-api:REGION:ACCOUNT_ID:API_ID/*"
    }
  ]
}
```

**Apply:**
```bash
aws apigateway update-rest-api \
  --rest-api-id YOUR_API_ID \
  --patch-operations 'op=replace,path=/policy,value="{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":\"*\",\"Action\":\"execute-api:Invoke\",\"Resource\":\"*\"}]}"'

# CRITICAL: Redeploy the API
aws apigateway create-deployment \
  --rest-api-id YOUR_API_ID \
  --stage-name prod
```

### 3. WAF Rules Blocking

AWS Web Application Firewall is blocking requests.

**Check:**
```bash
aws wafv2 get-web-acl-for-resource \
  --resource-arn arn:aws:apigateway:REGION::/restapis/API_ID/stages/STAGE
```

**Fix:**
1. Go to AWS WAF & Shield → Web ACLs
2. Find the ACL attached to your API
3. Review rules and adjust or temporarily disable to test

### 4. IAM Authorization Required

API requires AWS IAM credentials.

**Check:**
```bash
aws apigateway get-method \
  --rest-api-id YOUR_API_ID \
  --resource-id YOUR_RESOURCE_ID \
  --http-method GET \
  --query 'authorizationType'
```

**Fix:**
1. Go to API Gateway → Your API → Method
2. Method Request → Authorization: Change to `NONE`
3. Deploy the API

### 5. Lambda Authorizer

API uses a custom Lambda authorizer requiring specific headers/tokens.

**Check:**
Look for `Authorization` header requirements in your Lambda authorizer code.

**Fix:**
1. Verify the authorizer logic
2. Ensure correct token format is sent
3. Or temporarily disable the authorizer to test

## Quick Diagnostic Steps

### Step 1: Check API Key Requirement
```bash
# Without API key
curl https://api.payvia.ondeets.ai/

# With API key
curl -H "x-api-key: test-key-123" https://api.payvia.ondeets.ai/
```

### Step 2: Check CORS Preflight
```bash
curl -X OPTIONS https://api.payvia.ondeets.ai/ \
  -H "Origin: https://payvia.ai" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

### Step 3: Check Method Availability
```bash
# Try different methods
curl -X GET https://api.payvia.ondeets.ai/
curl -X POST https://api.payvia.ondeets.ai/
curl -X PUT https://api.payvia.ondeets.ai/
```

### Step 4: Enable CloudWatch Logs

In API Gateway:
1. Settings → CloudWatch log role ARN: Add IAM role
2. Stage → Logs/Tracing → Enable CloudWatch Logs
3. Deploy and test
4. View logs in CloudWatch to see exact rejection reason

## Recommended Fix Order

1. ✅ **Check API Key** - Most common issue
2. ✅ **Check Resource Policy** - Second most common
3. ✅ **Deploy After Changes** - Critical step often forgotten
4. ✅ **Check WAF Rules** - If using WAF
5. ✅ **Review Authorization** - If using IAM/Lambda auth

## AWS Console Quick Fix

### Option A: Disable API Key (If Not Needed)

1. AWS Console → API Gateway
2. Select your API: `api.payvia.ondeets.ai`
3. Resources → Select method (GET, POST, etc.)
4. Method Request
5. **API Key Required**: Change to `false`
6. Actions → Deploy API
7. Select stage → Deploy

### Option B: Create and Use API Key

1. API Gateway → API Keys → Create API Key
2. Copy the API key value
3. Usage Plans → Create usage plan
4. Add API stages to the plan
5. Associate API key with usage plan
6. Use the key in requests:
   ```bash
   curl -H "x-api-key: YOUR_KEY" https://api.payvia.ondeets.ai/
   ```

### Option C: Allow Public Access (Resource Policy)

1. API Gateway → Your API → Resource Policy
2. Add policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": "*",
         "Action": "execute-api:Invoke",
         "Resource": "*"
       }
     ]
   }
   ```
3. Save
4. Actions → Deploy API

## Testing After Fix

```bash
# Should return 200 OK (not 403)
curl -I https://api.payvia.ondeets.ai/

# Should return JSON response
curl https://api.payvia.ondeets.ai/health

# Test from frontend domain
curl -H "Origin: https://payvia.ai" https://api.payvia.ondeets.ai/
```

## Summary

**Two separate issues:**

1. **TokenEx Whitelisting** (SOLVED)
   - ✅ `payvia.ai` - whitelisted
   - ✅ `getondeets.ai` - whitelisted
   - ❌ `ondeets.ai` - DNS not configured

2. **API Gateway 403** (NEEDS FIX)
   - `api.payvia.ondeets.ai` requires AWS configuration changes
   - Most likely: API key required OR resource policy restriction
   - Fix: Update API Gateway settings in AWS Console
   - **Don't forget to deploy after changes!**

## Who Needs to Fix This?

**AWS Account Owner** needs to:
1. Log into AWS Console
2. Navigate to API Gateway
3. Find the API for `api.payvia.ondeets.ai`
4. Apply one of the fixes above
5. **Deploy the API** (critical step!)

Once fixed, the API will respond with 200 OK instead of 403 Forbidden.
