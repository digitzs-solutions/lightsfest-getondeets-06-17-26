import type { VercelRequest, VercelResponse } from '@vercel/node';

// PayVia SDK equivalent - mirrors @digitzs/payvia interface
// When the SDK is installable, replace with:
// import { getPayViaClient, buildPaymentMethodData } from '@digitzs/payvia';

const PAYVIA_API_URLS: Record<string, string> = {
  staging: 'https://api.payvia.staging.ondeets.ai',
  production: 'https://api.payvia.ondeets.ai',
};

const TOKEN_CACHE_TTL = 55 * 60 * 1000;
let cachedToken: { token: string; expiresAt: number } | null = null;

function buildPaymentMethodData(token: string, expiry: string, cardholderName: string) {
  const cleanDate = expiry.replace('/', '');
  const expirationMonth = cleanDate.substring(0, 2) || '01';
  const expirationYear = cleanDate.length >= 4
    ? cleanDate.substring(2, 6)
    : `20${cleanDate.substring(2, 4)}`;

  return {
    type: 'card' as const,
    token,
    expirationMonth,
    expirationYear,
    cardholderName,
  };
}

function getPayViaClient() {
  const API_KEY = process.env.PAYVIA_API_KEY || process.env.VITE_PAYVIA_API_KEY || '';
  const APP_KEY = process.env.PAYVIA_APP_KEY || process.env.VITE_PAYVIA_APP_KEY || '';
  const MERCHANT_ID = process.env.PAYVIA_MERCHANT_ID || process.env.VITE_PAYVIA_MERCHANT_ID || '';
  const ENVIRONMENT = process.env.PAYVIA_ENVIRONMENT || process.env.VITE_PAYVIA_ENVIRONMENT || 'production';
  const API_URL = PAYVIA_API_URLS[ENVIRONMENT] || PAYVIA_API_URLS.production;

  async function getAuthToken(): Promise<string> {
    if (cachedToken && cachedToken.expiresAt > Date.now()) {
      return cachedToken.token;
    }

    const response = await fetch(`${API_URL}/v4/auth/token`, {
      method: 'POST',
      headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { type: 'auth', attributes: { appKey: APP_KEY } } }),
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
    amount: number;
    orderId: string;
    customerInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      billingAddress: {
        address1: string;
        city: string;
        state: string;
        zip: string;
        country: string;
      };
    };
    paymentMethodData: ReturnType<typeof buildPaymentMethodData>;
  }

  async function processPayment(params: ProcessPaymentParams) {
    const authToken = await getAuthToken();

    const response = await fetch(`${API_URL}/v4/payments`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          type: 'payments',
          attributes: {
            merchantId: MERCHANT_ID,
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

  return { getAuthToken, processPayment, apiKey: API_KEY, appKey: APP_KEY };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const client = getPayViaClient();

    if (!client.apiKey || !client.appKey) {
      return res.status(500).json({ success: false, error: 'PayVia API credentials not configured' });
    }

    const { token, amount, orderId, expiry, cardholderName, customerInfo } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'No payment token provided' });
    }

    const paymentMethodData = buildPaymentMethodData(
      token,
      expiry || '',
      cardholderName || 'Customer'
    );

    const result = await client.processPayment({
      amount,
      orderId: orderId || `ORD-${Date.now()}`,
      customerInfo: customerInfo || {
        firstName: 'Customer',
        lastName: '',
        email: '',
        phone: '',
        billingAddress: { address1: 'Not Provided', city: 'Not Provided', state: 'NY', zip: '00000', country: 'US' },
      },
      paymentMethodData,
    });

    return res.status(200).json({
      success: true,
      transactionId: result.data?.id || null,
      status: result.data?.attributes?.status || 'completed',
      amount,
      paymentMethod: 'card',
      gateway: result.meta?.gateway || 'nmi',
    });
  } catch (error: any) {
    console.error('Payment process error:', error);
    const status = error.status || 500;
    const message = error.message || 'Unknown error';
    return res.status(status).json({ success: false, error: message, code: error.code || 'processing_error' });
  }
}
