import type { VercelRequest, VercelResponse } from '@vercel/node';

// PayVia SDK equivalent - mirrors @digitzs/payvia interface
const PAYVIA_API_URLS: Record<string, string> = {
  staging: 'https://api.payvia.staging.ondeets.ai',
  production: 'https://api.payvia.ondeets.ai',
};

const TOKEN_CACHE_TTL = 55 * 60 * 1000;
let cachedToken: { token: string; expiresAt: number } | null = null;

function parseExpirationDate(expiry: string): { expirationMonth: string; expirationYear: string } {
  const cleanDate = expiry.replace('/', '');
  const expirationMonth = cleanDate.substring(0, 2) || '01';
  const expirationYear = cleanDate.length >= 4
    ? cleanDate.substring(0, 4).startsWith('20') ? cleanDate.substring(0, 4) : `20${cleanDate.substring(2, 4)}`
    : `20${cleanDate.substring(2, 4) || '99'}`;
  return { expirationMonth, expirationYear };
}

function buildPaymentMethodData(token: string, expiry: string, cardholderName: string) {
  const { expirationMonth, expirationYear } = parseExpirationDate(expiry);
  return {
    type: 'card' as const,
    token,
    expirationMonth,
    expirationYear,
    cardholderName,
  };
}

function parseCardholderName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  const [first, ...lastParts] = trimmed.split(' ');
  return {
    firstName: first || 'Unknown',
    lastName: lastParts.join(' ') || 'Customer',
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

  async function processPayment(params: {
    amount: number;
    orderId: string;
    customerInfo: {
      firstName: string;
      lastName: string;
      email: string;
      billingAddress: {
        address1: string;
        city: string;
        state: string;
        zip: string;
        country: string;
      };
    };
    paymentMethodData: ReturnType<typeof buildPaymentMethodData>;
  }) {
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
      expiry || '12/99',
      cardholderName || 'Customer'
    );

    const { firstName: billingFirstName, lastName: billingLastName } =
      parseCardholderName(cardholderName || `${customerInfo?.firstName || ''} ${customerInfo?.lastName || ''}`);

    // PayVia rejects empty billing-address fields, so coalesce each field
    // individually — a present billingAddress object with blank fields must not
    // pass empty strings through.
    const incomingAddress = customerInfo?.billingAddress || {};
    const billingAddress = {
      address1: incomingAddress.address1?.trim() || 'Not Provided',
      city: incomingAddress.city?.trim() || 'Not Provided',
      state: incomingAddress.state?.trim() || 'NY',
      zip: incomingAddress.zip?.trim() || '00000',
      country: incomingAddress.country?.trim() || 'US',
    };

    const result = await client.processPayment({
      amount,
      orderId: orderId || `ORD-${Date.now()}`,
      customerInfo: {
        firstName: customerInfo?.firstName || billingFirstName,
        lastName: customerInfo?.lastName || billingLastName,
        email: customerInfo?.email || '',
        billingAddress,
      },
      paymentMethodData,
    });

    // Check for errors in the PayVia response (per SDK docs)
    if (result.errors && result.errors.length > 0) {
      const error = result.errors[0];
      return res.status(400).json({
        success: false,
        error: error.detail || error.title || 'Payment failed',
        code: error.code || 'payment_failed',
      });
    }

    if (!result.data || result.data.type !== 'payments') {
      return res.status(400).json({ success: false, error: 'Payment processing error' });
    }

    return res.status(200).json({
      success: true,
      transactionId: result.data.id || null,
      status: result.data.attributes?.status || 'completed',
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
