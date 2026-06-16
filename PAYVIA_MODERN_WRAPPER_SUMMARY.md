# PayVia Modern Wrapper Guide - Key Insights

## Document Overview
This guide provides comprehensive documentation for integrating with PayVia's payment processing platform, which serves as a modern wrapper around various payment processors.

## Key Takeaways

### 1. **PayVia Architecture**
- PayVia acts as a unified wrapper/abstraction layer over multiple payment processors
- Supports processor switching without changing client-side code
- Provides consistent API regardless of underlying processor (NMI, ProPay, etc.)

### 2. **Authentication & Security**
- Uses API keys for authentication
- Implements TokenEx for PCI DSS compliance
- Supports both sandbox and production environments
- Requires proper CORS configuration for browser-based integrations

### 3. **Integration Patterns**

#### Direct Integration
- Client communicates directly with PayVia API
- Requires API authentication
- Best for server-to-server communication

#### TokenEx Integration
- Uses iframe-based tokenization
- Client never handles raw card data
- Reduces PCI scope significantly
- Requires domain whitelisting

### 4. **Common Issues & Solutions**

#### 403 Forbidden Errors
**Causes:**
- API Key Required setting enabled but key not provided
- Restrictive resource policy in API Gateway
- CORS headers missing or misconfigured
- Domain not whitelisted (for TokenEx)

**Solutions:**
- Set "API Key Required" to false in API Gateway (for public endpoints)
- Update resource policy to allow intended traffic
- Deploy API after making changes
- Contact TokenEx to whitelist domains

#### CORS Issues
**Required Headers:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Client-Info, Apikey
```

### 5. **API Endpoints**

#### Process Payment
```
POST https://api.payvia.ondeets.ai/process
```

**Request Body:**
```json
{
  "amount": 100.00,
  "currency": "USD",
  "token": "tokenex_token",
  "merchantId": "merchant_id",
  "description": "Payment description"
}
```

### 6. **Environment Configuration**

#### Sandbox
- Base URL: `https://api.sandbox.payvia.ondeets.ai`
- Use test card numbers
- No real transactions

#### Production
- Base URL: `https://api.payvia.ondeets.ai`
- Real transactions
- Production credentials required

### 7. **TokenEx Configuration**

#### Required Settings
- TokenEx ID: Provided by PayVia/TokenEx
- Authentication Key: For API authentication
- Scheme: Determines tokenization behavior
- CSS customization: For iframe styling

#### Whitelisted Domains
- Must request domain whitelisting from TokenEx support
- Include all domains (dev, staging, production)
- Allow 24-48 hours for whitelisting
- Use exact domain format (with/without www)

### 8. **Best Practices**

#### Security
- Never expose API keys in client-side code
- Use environment variables for configuration
- Implement server-side validation
- Use HTTPS for all communications

#### Error Handling
- Implement comprehensive error handling
- Log errors for debugging
- Provide user-friendly error messages
- Handle network timeouts gracefully

#### Testing
- Test in sandbox environment first
- Verify all payment scenarios
- Test error cases
- Validate token generation
- Confirm transaction processing

### 9. **Processor Switching**

PayVia's key advantage is seamless processor switching:

1. **Configuration Change**: Update processor in PayVia dashboard
2. **No Code Changes**: Client code remains the same
3. **Automatic Routing**: PayVia routes to new processor
4. **Transparent Migration**: Users unaffected

### 10. **Support & Troubleshooting**

#### Common Debugging Steps
1. Check browser console for errors
2. Verify API endpoint URL
3. Confirm authentication credentials
4. Review CORS headers
5. Check network tab for failed requests
6. Validate request payload format

#### Getting Help
- Contact PayVia support for API issues
- Contact TokenEx support for iframe/tokenization issues
- Check API documentation for endpoint specifications
- Review error codes and messages

## Integration Checklist

- [ ] Obtain API credentials (sandbox & production)
- [ ] Configure environment variables
- [ ] Set up TokenEx iframe (if using)
- [ ] Request domain whitelisting
- [ ] Configure CORS headers
- [ ] Implement error handling
- [ ] Test in sandbox environment
- [ ] Validate all payment scenarios
- [ ] Deploy to production
- [ ] Monitor transaction processing

## Related Documentation

- **AWS Setup Guide**: See `AWS_API_PAYVIA_COMPLETE_SETUP.md`
- **TokenEx Setup**: See `TOKENEX_SETUP.md`
- **Quick Start**: See `QUICK_START_DIGITZS.md`
- **Error Handling**: See `PAYVIA_ERROR_HANDLING_GUIDE.md`

## Notes

This guide complements the AWS infrastructure setup and provides the application-level integration details needed to successfully process payments through PayVia.
