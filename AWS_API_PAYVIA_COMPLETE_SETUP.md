# Complete AWS Setup Guide for api.payvia.ondeets.ai

## Overview

This guide covers the complete setup of `api.payvia.ondeets.ai` using AWS services including Route 53, API Gateway, Certificate Manager, WAF, CloudWatch, and X-Ray.

## Architecture

```
Internet → Route 53 (DNS) → API Gateway (Custom Domain) → Lambda/Backend
                              ↓
                         AWS WAF (Security)
                              ↓
                         CloudWatch (Monitoring)
                              ↓
                         X-Ray (Tracing)
```

---

## Step 1: SSL/TLS Certificate (AWS Certificate Manager)

### Request Certificate

1. **Open AWS Certificate Manager Console**
   - https://console.aws.amazon.com/acm/

2. **Request Public Certificate**
   - Click "Request a certificate"
   - Choose "Request a public certificate"
   - Click "Next"

3. **Add Domain Names**
   ```
   Domain name: api.payvia.ondeets.ai
   ```
   - Optional: Add `*.payvia.ondeets.ai` for wildcard coverage

4. **Select Validation Method**
   - Choose **DNS validation** (recommended)
   - Click "Request"

5. **Complete DNS Validation**
   - AWS will provide CNAME records
   - Add these records to Route 53 (see Step 2)
   - Wait for validation (usually 5-10 minutes)

### Certificate ARN
Save the Certificate ARN - you'll need it for API Gateway:
```
arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERTIFICATE_ID
```

**Important:** Certificates for API Gateway custom domains must be in **us-east-1** region.

---

## Step 2: DNS Configuration (Route 53)

### Create/Verify Hosted Zone

1. **Open Route 53 Console**
   - https://console.aws.amazon.com/route53/

2. **Check Hosted Zone for ondeets.ai**
   - If it exists, use it
   - If not, create it:
     - Click "Create hosted zone"
     - Domain name: `ondeets.ai`
     - Type: Public hosted zone
     - Click "Create"

3. **Note Nameservers**
   - Copy the NS record values
   - Update your domain registrar to use these nameservers

### Add Certificate Validation Records

1. Go to your hosted zone: `ondeets.ai`
2. Click "Create record"
3. Use the CNAME name and value from ACM Step 1.5
4. Click "Create records"

### Create API Gateway A Record (Do After Step 3)

After setting up API Gateway custom domain, create:

1. **Record name:** `api.payvia`
2. **Record type:** `A - IPv4 address`
3. **Alias:** Yes
4. **Route traffic to:**
   - Alias to API Gateway API
   - Region: Your API region
   - API Gateway domain name: (from Step 3)
5. Click "Create records"

---

## Step 3: API Gateway Setup

### Create REST API

1. **Open API Gateway Console**
   - https://console.aws.amazon.com/apigateway/

2. **Create API**
   - Click "Create API"
   - Choose "REST API" (or HTTP API for simpler use cases)
   - Protocol: REST
   - Create new API
   - API name: `PayVia API`
   - Description: `PayVia payment processing API`
   - Endpoint Type: Regional
   - Click "Create API"

### Create Resources and Methods

1. **Create Resource**
   - Actions → Create Resource
   - Resource Name: `process`
   - Resource Path: `/process`
   - Enable CORS: Yes
   - Click "Create Resource"

2. **Create POST Method**
   - Select the `/process` resource
   - Actions → Create Method → POST
   - Integration type:
     - Lambda Function (if using Lambda)
     - HTTP (if proxying to another service)
     - Mock (for testing)
   - Click "Save"

3. **Configure CORS**
   - Select the resource
   - Actions → Enable CORS
   - Access-Control-Allow-Origin: `*` (or specific domains like `https://payvia.ai`)
   - Access-Control-Allow-Headers: `Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token`
   - Access-Control-Allow-Methods: `GET,POST,PUT,DELETE,OPTIONS`
   - Click "Enable CORS and replace existing CORS headers"

### Remove API Key Requirement (Fix 403 Error)

1. **Select Method** (e.g., POST /process)
2. Click "Method Request"
3. **API Key Required:** Set to `false`
4. Click the checkmark to save

### Configure Custom Domain

1. **Navigate to Custom Domain Names**
   - Sidebar → Custom domain names
   - Click "Create"

2. **Configure Domain**
   - Domain name: `api.payvia.ondeets.ai`
   - TLS version: TLS 1.2 (recommended)
   - Certificate:
     - Select from ACM
     - Choose the certificate from Step 1
   - Click "Create domain name"

3. **Add API Mapping**
   - Select your custom domain
   - Click "Configure API mappings"
   - Click "Add new mapping"
   - API: Select your API (PayVia API)
   - Stage: prod (or your stage name)
   - Path: (leave empty for root)
   - Click "Save"

4. **Note the API Gateway Domain Name**
   - Copy the "API Gateway domain name" (e.g., `d-abc123xyz.execute-api.us-east-1.amazonaws.com`)
   - Use this in Route 53 (Step 2 - Create API Gateway A Record)

### Deploy API

1. **Create Deployment**
   - Actions → Deploy API
   - Deployment stage:
     - Select "[New Stage]"
     - Stage name: `prod`
   - Stage description: Production
   - Click "Deploy"

2. **Test the API**
   ```bash
   # Test with API Gateway URL
   curl https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod/process

   # Test with custom domain (after DNS propagation)
   curl https://api.payvia.ondeets.ai/process
   ```

---

## Step 4: Security Implementation

### 4.1 Resource Policy (Allow Public Access)

1. **Navigate to Resource Policy**
   - Select your API
   - Resource Policy (left sidebar)

2. **Add Policy**
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

3. **Save and Deploy**
   - Click "Save"
   - Actions → Deploy API

### 4.2 AWS WAF (Web Application Firewall)

1. **Open AWS WAF Console**
   - https://console.aws.amazon.com/wafv2/

2. **Create Web ACL**
   - Click "Create web ACL"
   - Name: `PayVia-API-Protection`
   - Resource type: Regional resources (API Gateway)
   - Region: Your API region
   - Click "Next"

3. **Add Rules**
   - **AWS Managed Rules:**
     - Core rule set (protects against OWASP Top 10)
     - Known bad inputs
     - SQL database
   - **Rate-based rule:**
     - Name: `RateLimit`
     - Rate limit: 2000 requests per 5 minutes
     - Action: Block

4. **Associate with API Gateway**
   - Add AWS resources
   - Select your API Gateway stage
   - Click "Create web ACL"

### 4.3 API Keys (Optional - For Client Management)

If you need API keys:

1. **Create API Key**
   - API Gateway → API Keys
   - Actions → Create API Key
   - Name: `Client-Name-Key`
   - Auto generate
   - Click "Save"

2. **Create Usage Plan**
   - API Gateway → Usage Plans
   - Create
   - Name: `Basic-Plan`
   - Rate: 1000 requests per second
   - Burst: 2000 requests
   - Quota: 1000000 requests per month
   - Add API Stage: Select your API and stage
   - Click "Next" → "Done"

3. **Associate API Key with Usage Plan**
   - Select the usage plan
   - Usage Plan Keys → Add API Key to Usage Plan
   - Select your API key
   - Click "Add"

4. **Require API Key for Method**
   - Select method (e.g., POST /process)
   - Method Request
   - API Key Required: `true`
   - Deploy API

---

## Step 5: Monitoring and Analytics

### 5.1 CloudWatch Logs

1. **Enable Execution Logs**
   - Select your API → Stages → prod
   - Logs/Tracing tab
   - CloudWatch Settings:
     - Enable CloudWatch Logs: ✓
     - Log level: INFO (or ERROR for production)
     - Log full requests/responses data: ✓ (for debugging)
     - Data trace: ✓

2. **Create IAM Role for API Gateway Logging**

   If you see an error about missing role:

   - Go to IAM → Roles → Create Role
   - Service: API Gateway
   - Use case: API Gateway
   - Policy: AmazonAPIGatewayPushToCloudWatchLogs
   - Role name: `APIGatewayCloudWatchRole`
   - Create role
   - Copy the Role ARN

   Then:
   - API Gateway → Settings (left sidebar at bottom)
   - CloudWatch log role ARN: Paste the role ARN
   - Save

3. **View Logs**
   - CloudWatch Console → Logs → Log groups
   - Filter: `API-Gateway-Execution-Logs`
   - Select your API log group
   - View log streams

### 5.2 CloudWatch Alarms

1. **Create Alarm for High Error Rate**
   - CloudWatch → Alarms → Create Alarm
   - Select metric:
     - AWS/ApiGateway
     - API Name: PayVia API
     - Metric: 5XXError
   - Conditions:
     - Threshold type: Static
     - Greater than: 10
     - Datapoints: 2 out of 5
   - Configure actions:
     - Create SNS topic
     - Email: your-email@example.com
   - Alarm name: `PayVia-API-High-5XX-Errors`
   - Create alarm

2. **Create Alarm for High Latency**
   - Metric: Latency
   - Statistic: Average
   - Greater than: 1000 ms
   - Alarm name: `PayVia-API-High-Latency`

### 5.3 AWS X-Ray Tracing

1. **Enable X-Ray in API Gateway**
   - Select API → Stages → prod
   - Logs/Tracing tab
   - X-Ray Tracing: Enable ✓
   - Save Changes
   - Deploy API

2. **View X-Ray Traces**
   - X-Ray Console: https://console.aws.amazon.com/xray/
   - Service map: Visual representation of your API
   - Traces: Individual request traces
   - Analytics: Performance insights

---

## Step 6: Troubleshooting

### Enable Route 53 Health Checks

1. **Create Health Check**
   - Route 53 → Health checks → Create health check
   - Name: `api-payvia-ondeets-health`
   - What to monitor: Endpoint
   - Protocol: HTTPS
   - Domain name: `api.payvia.ondeets.ai`
   - Path: `/health` (create a health endpoint)
   - String matching: (optional) `"status":"ok"`
   - Request interval: 30 seconds
   - Failure threshold: 3
   - Create alarm: Yes
   - SNS topic: Create new or select existing
   - Create health check

### VPC Flow Logs (If Using VPC)

1. **Enable Flow Logs**
   - VPC Console → Your VPC
   - Flow logs tab
   - Create flow log
   - Filter: All (or Reject for troubleshooting)
   - Destination: CloudWatch Logs
   - Log group: Create new: `/aws/vpc/flowlogs`
   - IAM role: Create new or select existing
   - Create flow log

---

## Step 7: Testing the Complete Setup

### Test DNS Resolution

```bash
# Check DNS resolution
dig api.payvia.ondeets.ai

# Should return A record pointing to API Gateway
nslookup api.payvia.ondeets.ai
```

### Test SSL Certificate

```bash
# Check SSL certificate
openssl s_client -connect api.payvia.ondeets.ai:443 -servername api.payvia.ondeets.ai

# Should show valid certificate for api.payvia.ondeets.ai
```

### Test API Endpoint

```bash
# Test without API key (should work if API Key Required = false)
curl -X POST https://api.payvia.ondeets.ai/process \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Test with API key (if required)
curl -X POST https://api.payvia.ondeets.ai/process \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"test": "data"}'

# Test CORS preflight
curl -X OPTIONS https://api.payvia.ondeets.ai/process \
  -H "Origin: https://payvia.ai" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

### Test from Frontend

```javascript
// Test from payvia.ai frontend
fetch('https://api.payvia.ondeets.ai/process', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // 'x-api-key': 'YOUR_API_KEY' // if required
  },
  body: JSON.stringify({ test: 'data' })
})
  .then(res => res.json())
  .then(data => console.log('Success:', data))
  .catch(err => console.error('Error:', err));
```

---

## Quick Reference: Common Commands

### Deploy API After Changes
```bash
# AWS CLI
aws apigateway create-deployment \
  --rest-api-id YOUR_API_ID \
  --stage-name prod \
  --region us-east-1
```

### Check Certificate Status
```bash
aws acm describe-certificate \
  --certificate-arn YOUR_CERT_ARN \
  --region us-east-1
```

### Test API with AWS CLI
```bash
aws apigateway test-invoke-method \
  --rest-api-id YOUR_API_ID \
  --resource-id YOUR_RESOURCE_ID \
  --http-method POST \
  --path-with-query-string '/process' \
  --body '{"test":"data"}'
```

### View CloudWatch Logs
```bash
aws logs tail /aws/apigateway/PayVia-API --follow
```

---

## Troubleshooting Checklist

- [ ] Certificate validated in ACM (status: Issued)
- [ ] DNS CNAME records added for certificate validation
- [ ] API Gateway custom domain created with certificate
- [ ] API mapping configured (API + Stage)
- [ ] Route 53 A record points to API Gateway domain
- [ ] API deployed to prod stage
- [ ] API Key Required set to `false` (or API key provided in requests)
- [ ] Resource policy allows public access (or specific origins)
- [ ] CORS enabled with correct headers
- [ ] WAF rules don't block legitimate traffic
- [ ] CloudWatch logs enabled and IAM role configured
- [ ] X-Ray tracing enabled
- [ ] DNS propagation complete (can take up to 48 hours, usually <1 hour)

---

## Cost Optimization Tips

1. **API Gateway Caching** - Enable caching to reduce backend calls
2. **CloudWatch Logs Retention** - Set retention period (7-14 days for development)
3. **X-Ray Sampling** - Use sampling rules to reduce tracing costs
4. **WAF Rate Limiting** - Protects against high-volume attacks
5. **Reserved Capacity** - Consider for predictable high-volume APIs

---

## Security Best Practices

1. **Use API Keys or OAuth** - For production, don't allow anonymous access
2. **Enable AWS WAF** - Protect against OWASP Top 10 and DDoS
3. **Implement Rate Limiting** - Prevent abuse and control costs
4. **Use VPC Endpoints** - For private APIs that don't need internet access
5. **Enable CloudTrail** - Audit API configuration changes
6. **Rotate API Keys** - Regular rotation for security
7. **Least Privilege IAM** - Grant minimum necessary permissions

---

## Next Steps

Once the API is working:

1. **Create Health Endpoint**
   ```javascript
   // Lambda function
   exports.handler = async (event) => {
       return {
           statusCode: 200,
           body: JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() })
       };
   };
   ```

2. **Implement Authentication**
   - AWS Cognito for user authentication
   - API Keys for client applications
   - IAM authentication for AWS service-to-service

3. **Set Up CI/CD**
   - AWS CodePipeline for automated deployments
   - Infrastructure as Code with CloudFormation or Terraform

4. **Documentation**
   - Create API documentation with OpenAPI/Swagger
   - Publish to API Gateway console

---

## Summary

You've now set up a complete, production-ready API infrastructure with:

- ✅ Custom domain with SSL/TLS (Certificate Manager)
- ✅ DNS routing (Route 53)
- ✅ API hosting (API Gateway)
- ✅ Security (WAF, Resource Policy, CORS)
- ✅ Monitoring (CloudWatch, X-Ray)
- ✅ Health checks and alarms

The 403 Forbidden error should be resolved by:
1. Setting "API Key Required" to `false`
2. Updating Resource Policy to allow public access
3. Deploying the API

**Access your API at:** `https://api.payvia.ondeets.ai/`
