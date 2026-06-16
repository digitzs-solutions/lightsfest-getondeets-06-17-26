import type { VercelRequest, VercelResponse } from '@vercel/node';

const PAYVIA_API_URLS: Record<string, string> = {
  staging: 'https://api.payvia.staging.ondeets.ai',
  production: 'https://api.payvia.ondeets.ai',
};

function parseExpirationDate(expiry: string) {
  const cleanDate = expiry.replace('/', '');
  const expirationMonth = cleanDate.substring(0, 2) || '01';
  const expirationYear = `20${cleanDate.substring(2, 4)}` || '2099';
  return { expirationMonth, expirationYear };
}

function buildPaymentMethodData(token: string, expiry: string, cardholderName: string) {
  const { expirationMonth, expirationYear } = parseExpirationDate(expiry);
  return { type: 'card' as const, token, expirationMonth, expirationYear, cardholderName };
}

const TOKEN_CACHE_TTL = 55 * 60 * 1000;
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAuthToken(apiUrl: string, apiKey: string, appKey: string): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const response = await fetch(`${apiUrl}/v4/auth/token`, {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { type: 'auth', attributes: { appKey } } }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Authentication failed: ${errorText}`);
  }

  const result = await response.json();
  const token = result.data.attributes.app_token;
  cachedToken = { token, expiresAt: Date.now() + TOKEN_CACHE_TTL };
  return token;
}

interface ProcessPaymentParams {
  apiUrl: string;
  apiKey: string;
  authToken: string;
  merchantId: string;
  amount: number;
  orderId: string;
  customerInfo: any;
  paymentMethodData: any;
}

async function processPayment(params: ProcessPaymentParams) {
  const response = await fetch(`${params.apiUrl}/v4/payments`, {
    method: 'POST',
    headers: {
      'x-api-key': params.apiKey,
      Authorization: `Bearer ${params.authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        type: 'payments',
        attributes: {
          merchantId: params.merchantId,
          amount: params.amount,
          currency: 'USD',
          orderId: params.orderId,
          customerInfo: params.customerInfo,
          paymentMethodData: params.paymentMethodData,
        },
      },
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    const firstError = result.errors?.[0];
    throw {
      status: response.status,
      message: firstError?.detail || firstError?.title || 'Payment failed',
      code: firstError?.code || 'payment_failed',
    };
  }

  return result;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const API_KEY = process.env.PAYVIA_API_KEY || '';
    const APP_KEY = process.env.PAYVIA_APP_KEY || '';
    const MERCHANT_ID = process.env.PAYVIA_MERCHANT_ID || '';
    const ENVIRONMENT = process.env.PAYVIA_ENVIRONMENT || 'production';
    const API_URL = PAYVIA_API_URLS[ENVIRONMENT] || PAYVIA_API_URLS.production;

    if (!API_KEY || !APP_KEY) {
      return res.status(500).json({ success: false, error: 'PayVia API credentials not configured' });
    }

    const { token, amount, orderId, expiry, cardholderName, customerInfo } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'No payment token provided' });
    }

    const authToken = await getAuthToken(API_URL, API_KEY, APP_KEY);
    const paymentMethodData = buildPaymentMethodData(token, expiry || '', cardholderName || 'Customer');

    const result = await processPayment({
      apiUrl: API_URL,
      apiKey: API_KEY,
      authToken,
      merchantId: MERCHANT_ID,
      amount,
      orderId: orderId || `ORD-${Date.now()}`,
      customerInfo: customerInfo || {
        firstName: 'Customer',
        lastName: '',
        email: '',
        billingAddress: { address1: 'Not Provided', city: 'Not Provided', state: 'NY', zip: '00000', country: 'US' },
      },
      paymentMethodData,
    });

    return res.status(200).json({
      success: result.success ?? true,
      transactionId: result.transactionId || result.data?.id || null,
      status: result.status || result.data?.attributes?.status || 'completed',
      amount,
      paymentMethod: result.paymentMethod || 'card',
      gateway: result.meta?.gateway || result.gateway || 'nmi',
    });
  } catch (error: any) {
    console.error('Payment process error:', error);
    const status = error.status || 500;
    const message = error.message || 'Unknown error';
    return res.status(status).json({ success: false, error: message, code: error.code || 'processing_error' });
  }
}
