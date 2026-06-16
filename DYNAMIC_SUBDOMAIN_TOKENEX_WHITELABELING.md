# Dynamic Sub-Domain White-Labeling for TokenEx with AWS

## Overview
Setting up dynamic sub-domains like `lightsfest.ondeets.ai` or `myvalet.ondeets.ai` for TokenEx integration requires coordination between AWS infrastructure and TokenEx configuration.

## Architecture Components

### 1. AWS Infrastructure Layer
- **Route 53**: DNS management for wildcard domains
- **CloudFront**: CDN with custom domain support
- **S3 or Origin**: Static site hosting
- **API Gateway**: API endpoints per subdomain
- **Certificate Manager**: SSL certificates for subdomains
- **Lambda@Edge**: Dynamic routing logic

### 2. TokenEx Layer
- **Domain Whitelisting**: Each subdomain must be whitelisted
- **TokenEx Configuration**: Per-merchant TokenEx IDs
- **Iframe Integration**: Dynamic TokenEx iframe loading

---

## Solution Architecture

### Option A: CloudFront + S3 (Recommended for Static Sites)

```
Client Request → Route 53 (*.ondeets.ai)
              → CloudFront Distribution
              → Lambda@Edge (routing logic)
              → S3 Bucket (per-tenant config)
              → TokenEx Iframe (whitelisted domain)
```

### Option B: API Gateway + Lambda (For Dynamic Apps)

```
Client Request → Route 53 (*.ondeets.ai)
              → API Gateway (custom domain)
              → Lambda Function (tenant resolution)
              → Application Logic
              → TokenEx Integration
```

---

## Step-by-Step Implementation

## Phase 1: AWS DNS & SSL Setup

### 1.1 Request Wildcard SSL Certificate

```bash
# Using AWS Certificate Manager
aws acm request-certificate \
  --domain-name "*.ondeets.ai" \
  --subject-alternative-names "ondeets.ai" \
  --validation-method DNS \
  --region us-east-1
```

**Important**:
- Wildcard certificates MUST be in `us-east-1` for CloudFront
- Validate via DNS (add CNAME records in Route 53)

### 1.2 Create Route 53 Wildcard Record

```json
{
  "Comment": "Wildcard subdomain for tenant sites",
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "*.ondeets.ai",
      "Type": "A",
      "AliasTarget": {
        "HostedZoneId": "Z2FDTNDATAQYW2",
        "DNSName": "d111111abcdef8.cloudfront.net",
        "EvaluateTargetHealth": false
      }
    }
  }]
}
```

---

## Phase 2: CloudFront Distribution Setup

### 2.1 Create CloudFront Distribution

```json
{
  "DistributionConfig": {
    "CallerReference": "ondeets-multitenancy-2024",
    "Aliases": {
      "Quantity": 1,
      "Items": ["*.ondeets.ai"]
    },
    "DefaultRootObject": "index.html",
    "Origins": {
      "Quantity": 1,
      "Items": [{
        "Id": "S3-ondeets-tenants",
        "DomainName": "ondeets-tenants.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": "origin-access-identity/cloudfront/ABCDEFG1234567"
        }
      }]
    },
    "DefaultCacheBehavior": {
      "TargetOriginId": "S3-ondeets-tenants",
      "ViewerProtocolPolicy": "redirect-to-https",
      "LambdaFunctionAssociations": {
        "Quantity": 1,
        "Items": [{
          "LambdaFunctionARN": "arn:aws:lambda:us-east-1:123456789:function:tenant-router:1",
          "EventType": "origin-request"
        }]
      }
    },
    "ViewerCertificate": {
      "ACMCertificateArn": "arn:aws:acm:us-east-1:123456789:certificate/abc-123",
      "SSLSupportMethod": "sni-only",
      "MinimumProtocolVersion": "TLSv1.2_2021"
    },
    "Enabled": true
  }
}
```

### 2.2 Lambda@Edge Tenant Router

Create this function in `us-east-1`:

```javascript
// lambda-edge-tenant-router.js
'use strict';

exports.handler = async (event, context) => {
    const request = event.Records[0].cf.request;
    const host = request.headers.host[0].value;

    // Extract subdomain
    const subdomain = host.split('.')[0];

    // Skip root domain
    if (subdomain === 'ondeets' || subdomain === 'www') {
        return request;
    }

    // Rewrite origin path to include tenant prefix
    request.uri = `/${subdomain}${request.uri}`;

    // Add tenant header for application use
    request.headers['x-tenant-id'] = [{
        key: 'X-Tenant-Id',
        value: subdomain
    }];

    return request;
};
```

Deploy:
```bash
aws lambda create-function \
  --function-name tenant-router \
  --runtime nodejs18.x \
  --role arn:aws:iam::123456789:role/lambda-edge-role \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --region us-east-1 \
  --publish
```

---

## Phase 3: S3 Bucket Structure

### 3.1 Organize by Tenant

```
s3://ondeets-tenants/
├── lightsfest/
│   ├── index.html
│   ├── config.json
│   └── assets/
├── myvalet/
│   ├── index.html
│   ├── config.json
│   └── assets/
└── _shared/
    └── common-assets/
```

### 3.2 Tenant Configuration File

```json
// s3://ondeets-tenants/lightsfest/config.json
{
  "tenantId": "lightsfest",
  "tenantName": "Lights Festival",
  "domain": "lightsfest.ondeets.ai",
  "tokenex": {
    "tokenExID": "lightsfest_tokenex_id",
    "authenticationKey": "lightsfest_auth_key",
    "timestamp": "auto",
    "scheme": "PCI"
  },
  "payvia": {
    "apiUrl": "https://api.payvia.ondeets.ai",
    "merchantId": "lightsfest_merchant_id"
  },
  "branding": {
    "primaryColor": "#FF6B35",
    "logo": "https://lightsfest.ondeets.ai/assets/logo.png",
    "favicon": "https://lightsfest.ondeets.ai/assets/favicon.ico"
  },
  "features": {
    "ticketing": true,
    "merchandise": true,
    "donations": false
  }
}
```

---

## Phase 4: Application Integration

### 4.1 Dynamic Config Loader

```typescript
// src/utils/tenant-config.ts
interface TenantConfig {
  tenantId: string;
  tenantName: string;
  domain: string;
  tokenex: {
    tokenExID: string;
    authenticationKey: string;
    timestamp: string;
    scheme: string;
  };
  payvia: {
    apiUrl: string;
    merchantId: string;
  };
  branding: {
    primaryColor: string;
    logo: string;
    favicon: string;
  };
  features: Record<string, boolean>;
}

export async function loadTenantConfig(): Promise<TenantConfig> {
  const hostname = window.location.hostname;
  const subdomain = hostname.split('.')[0];

  // Fetch tenant config
  const response = await fetch(`/config.json`);

  if (!response.ok) {
    throw new Error(`Failed to load tenant config for ${subdomain}`);
  }

  return await response.json();
}

export function getTenantFromHostname(): string {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');

  if (parts.length >= 2) {
    return parts[0];
  }

  return 'default';
}
```

### 4.2 Dynamic TokenEx Integration

```typescript
// src/components/DynamicTokenExCheckout.tsx
import { useState, useEffect } from 'react';
import { loadTenantConfig, getTenantFromHostname } from '../utils/tenant-config';

export function DynamicTokenExCheckout() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const tenant = getTenantFromHostname();

  useEffect(() => {
    loadTenantConfig().then(cfg => {
      setConfig(cfg);
      setLoading(false);

      // Apply branding
      document.documentElement.style.setProperty('--primary-color', cfg.branding.primaryColor);

      // Update favicon
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) favicon.href = cfg.branding.favicon;

      // Update title
      document.title = cfg.tenantName;

      // Load TokenEx iframe
      initializeTokenEx(cfg.tokenex);
    });
  }, []);

  const initializeTokenEx = (tokenexConfig: any) => {
    const iframe = document.createElement('iframe');
    iframe.id = 'tokenExIframe';
    iframe.src = `https://test-htp.tokenex.com/iframe/v3/index.html`;
    iframe.style.cssText = 'width: 100%; height: 150px; border: none;';

    document.getElementById('tokenex-container')?.appendChild(iframe);

    iframe.onload = () => {
      iframe.contentWindow?.postMessage({
        type: 'tokenEx.init',
        config: {
          tokenExID: tokenexConfig.tokenExID,
          authenticationKey: tokenexConfig.authenticationKey,
          timestamp: Date.now().toString(),
          tokenScheme: tokenexConfig.scheme,
          origin: window.location.origin,
          styles: {
            base: `color: ${config?.branding?.primaryColor || '#333'};`
          }
        }
      }, '*');
    };
  };

  if (loading) {
    return <div>Loading {tenant} configuration...</div>;
  }

  return (
    <div className="tenant-checkout">
      <h1>{config.tenantName}</h1>
      <div id="tokenex-container"></div>
    </div>
  );
}
```

---

## Phase 5: Supabase Tenant Management

### 5.1 Database Schema

```sql
-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subdomain text UNIQUE NOT NULL,
  tenant_name text NOT NULL,
  domain text UNIQUE NOT NULL,

  -- TokenEx Configuration
  tokenex_id text NOT NULL,
  tokenex_auth_key text NOT NULL,
  tokenex_scheme text DEFAULT 'PCI',

  -- PayVia Configuration
  payvia_merchant_id text NOT NULL,
  payvia_api_url text DEFAULT 'https://api.payvia.ondeets.ai',

  -- Branding
  primary_color text DEFAULT '#4F46E5',
  logo_url text,
  favicon_url text,

  -- Features
  features jsonb DEFAULT '{}',

  -- Status
  is_active boolean DEFAULT true,
  whitelisted_at_tokenex boolean DEFAULT false,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active tenants
CREATE POLICY "Public can view active tenants"
  ON tenants FOR SELECT
  USING (is_active = true);

-- Create index for subdomain lookup
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenants_domain ON tenants(domain);

-- Insert example tenants
INSERT INTO tenants (subdomain, tenant_name, domain, tokenex_id, tokenex_auth_key, payvia_merchant_id, primary_color, features) VALUES
('lightsfest', 'Lights Festival', 'lightsfest.ondeets.ai', 'lightsfest_tokenex', 'auth_key_123', 'merchant_lightsfest', '#FF6B35', '{"ticketing": true, "merchandise": true}'),
('myvalet', 'MyValet Services', 'myvalet.ondeets.ai', 'myvalet_tokenex', 'auth_key_456', 'merchant_myvalet', '#10B981', '{"valet": true, "tips": true}');
```

### 5.2 Edge Function for Tenant Config

```typescript
// supabase/functions/tenant-config/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const subdomain = url.searchParams.get('subdomain') ||
                     req.headers.get('x-tenant-id');

    if (!subdomain) {
      return new Response(
        JSON.stringify({ error: 'Subdomain required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('subdomain', subdomain)
      .eq('is_active', true)
      .single();

    if (error || !tenant) {
      return new Response(
        JSON.stringify({ error: 'Tenant not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return sanitized config (without sensitive keys in client response)
    const config = {
      tenantId: tenant.subdomain,
      tenantName: tenant.tenant_name,
      domain: tenant.domain,
      tokenex: {
        tokenExID: tenant.tokenex_id,
        // Don't expose auth key to client - handle server-side
        scheme: tenant.tokenex_scheme
      },
      payvia: {
        apiUrl: tenant.payvia_api_url,
        merchantId: tenant.payvia_merchant_id
      },
      branding: {
        primaryColor: tenant.primary_color,
        logo: tenant.logo_url,
        favicon: tenant.favicon_url
      },
      features: tenant.features
    };

    return new Response(
      JSON.stringify(config),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## Phase 6: TokenEx Whitelisting Process

### 6.1 Submit Whitelisting Request

**Email Template to TokenEx Support:**

```
Subject: Domain Whitelisting Request for Multi-Tenant Implementation

Hello TokenEx Support Team,

We are implementing a multi-tenant payment solution and need to whitelist the following domains:

Primary Domain:
- ondeets.ai
- www.ondeets.ai

Wildcard Domain:
- *.ondeets.ai

Specific Subdomains (initial launch):
- lightsfest.ondeets.ai
- myvalet.ondeets.ai

Additional subdomains will be added dynamically as new tenants onboard.

TokenEx Account: [Your TokenEx Account ID]
Environment: [Production/Sandbox]

Could you please:
1. Whitelist the wildcard domain *.ondeets.ai
2. Confirm if wildcard whitelisting is supported
3. If not, advise on the process for adding new subdomains

Expected launch date: [Date]

Thank you,
[Your Name]
[Company]
```

### 6.2 Automated Whitelisting Workflow

```typescript
// supabase/functions/request-tokenex-whitelist/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req: Request) => {
  const { subdomain, domain } = await req.json();

  // Log whitelisting request
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  await supabase.from('whitelist_requests').insert({
    subdomain,
    domain,
    status: 'pending',
    requested_at: new Date().toISOString()
  });

  // Send notification to admin
  // Email or Slack integration here

  return new Response(
    JSON.stringify({
      message: 'Whitelisting request submitted',
      domain,
      eta: '24-48 hours'
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
});
```

---

## Phase 7: Testing & Validation

### 7.1 Local Testing with Host Override

```bash
# Add to /etc/hosts for local testing
127.0.0.1 lightsfest.ondeets.local
127.0.0.1 myvalet.ondeets.local
```

### 7.2 Verification Checklist

```bash
# DNS Resolution
dig lightsfest.ondeets.ai
dig myvalet.ondeets.ai

# SSL Certificate
openssl s_client -connect lightsfest.ondeets.ai:443 -servername lightsfest.ondeets.ai

# CloudFront Distribution
curl -I https://lightsfest.ondeets.ai

# Tenant Config API
curl https://lightsfest.ondeets.ai/api/config

# TokenEx iframe loading
# Check browser console for iframe initialization
```

---

## Implementation Timeline

### Week 1: AWS Infrastructure
- [ ] Request wildcard SSL certificate
- [ ] Set up Route 53 wildcard DNS
- [ ] Create CloudFront distribution
- [ ] Deploy Lambda@Edge function
- [ ] Configure S3 bucket structure

### Week 2: Application Layer
- [ ] Create Supabase tenant schema
- [ ] Build tenant config loader
- [ ] Implement dynamic TokenEx integration
- [ ] Deploy Edge Function for tenant config
- [ ] Test with 2-3 pilot tenants

### Week 3: TokenEx Integration
- [ ] Submit wildcard domain whitelisting
- [ ] Test iframe loading per subdomain
- [ ] Validate tokenization flow
- [ ] Implement error handling

### Week 4: Production Rollout
- [ ] Deploy to production
- [ ] Monitor logs and metrics
- [ ] Document onboarding process
- [ ] Create tenant admin panel

---

## Cost Considerations

### AWS Costs (Monthly Estimates)

| Service | Usage | Cost |
|---------|-------|------|
| Route 53 | Hosted Zone + Queries | $0.50 + $0.40/million queries |
| CloudFront | Data Transfer | $0.085/GB (first 10TB) |
| Lambda@Edge | Requests + Duration | $0.60/million + compute |
| S3 | Storage + Requests | $0.023/GB + $0.005/1000 requests |
| Certificate Manager | Wildcard SSL | **FREE** |

**Total**: ~$20-100/month depending on traffic

### TokenEx Costs
- Per-transaction fees apply
- Whitelisting is typically free
- Contact TokenEx for multi-tenant pricing

---

## Security Considerations

### 1. Tenant Isolation
- Each tenant's data stored separately
- RLS policies in Supabase
- API key per tenant
- Separate TokenEx IDs

### 2. Authentication
- API Gateway authentication per tenant
- JWT tokens with tenant claims
- Rate limiting per subdomain

### 3. PCI Compliance
- TokenEx handles card data
- No PCI scope for your infrastructure
- Regular security audits

---

## Troubleshooting

### Issue: Subdomain not resolving
```bash
# Check DNS propagation
dig lightsfest.ondeets.ai @8.8.8.8

# Verify Route 53 records
aws route53 list-resource-record-sets --hosted-zone-id Z123ABC
```

### Issue: SSL certificate error
- Ensure certificate is in us-east-1
- Verify certificate includes *.ondeets.ai
- Check CloudFront certificate association

### Issue: TokenEx iframe not loading
- Verify domain is whitelisted
- Check CORS headers
- Validate TokenEx ID for tenant
- Review browser console errors

### Issue: Config not loading
- Check Lambda@Edge logs in CloudWatch
- Verify S3 bucket permissions
- Test Edge Function directly
- Check tenant record in Supabase

---

## Maintenance & Monitoring

### CloudWatch Alarms
```bash
# Lambda@Edge errors
# CloudFront 4xx/5xx errors
# Origin latency
# Certificate expiration
```

### Logging Strategy
- CloudFront access logs → S3
- Lambda@Edge logs → CloudWatch
- Application logs → Supabase
- TokenEx transaction logs → TokenEx dashboard

---

## Next Steps

1. **Immediate**: Request wildcard SSL certificate in AWS
2. **Today**: Set up Supabase tenant table
3. **This Week**: Deploy CloudFront + Lambda@Edge
4. **Next Week**: Submit TokenEx whitelisting request
5. **Testing**: Validate with lightsfest and myvalet subdomains

---

## Additional Resources

- [AWS Multi-Tenant SaaS](https://aws.amazon.com/solutions/implementations/saas-identity-and-isolation/)
- [CloudFront Multi-Origin](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/DownloadDistS3AndCustomOrigins.html)
- [Lambda@Edge](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html)
- [TokenEx Documentation](https://docs.tokenex.com/)
