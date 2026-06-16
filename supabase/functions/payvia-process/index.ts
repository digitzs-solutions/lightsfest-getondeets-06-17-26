import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * PayVia payment processing edge function.
 * Implements the same logic as @digitzs/payvia SDK's PayViaClient,
 * inlined because the SDK is a private GitHub package unavailable via npm: in Deno.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

// SDK constants: PAYVIA_API_URLS
const PAYVIA_API_URLS: Record<string, string> = {
  staging: "https://api.payvia.staging.ondeets.ai",
  production: "https://api.payvia.ondeets.ai",
};

// SDK utility: parseExpirationDate
function parseExpirationDate(expiry: string): {
  expirationMonth: string;
  expirationYear: string;
} {
  const cleanDate = expiry.replace("/", "");
  const expirationMonth = cleanDate.substring(0, 2) || "01";
  const expirationYear = `20${cleanDate.substring(2, 4)}` || "2099";
  return { expirationMonth, expirationYear };
}

// SDK utility: buildPaymentMethodData
function buildPaymentMethodData(
  token: string,
  expiry: string,
  cardholderName: string
) {
  const { expirationMonth, expirationYear } = parseExpirationDate(expiry);
  return {
    type: "card" as const,
    token,
    expirationMonth,
    expirationYear,
    cardholderName,
  };
}

// Token cache (SDK pattern: 55 min TTL)
const TOKEN_CACHE_TTL = 55 * 60 * 1000;
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAuthToken(apiUrl: string, apiKey: string, appKey: string): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const response = await fetch(`${apiUrl}/v4/auth/token`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        type: "auth",
        attributes: { appKey },
      },
    }),
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
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    billingAddress: {
      address1: string;
      address2?: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
  };
  paymentMethodData: {
    type: "card";
    token: string;
    expirationMonth: string;
    expirationYear: string;
    cardholderName: string;
  };
}

async function processPayment(params: ProcessPaymentParams) {
  const response = await fetch(`${params.apiUrl}/v4/payments`, {
    method: "POST",
    headers: {
      "x-api-key": params.apiKey,
      Authorization: `Bearer ${params.authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        type: "payments",
        attributes: {
          merchantId: params.merchantId,
          amount: params.amount,
          currency: "USD",
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
      message: firstError?.detail || firstError?.title || "Payment failed",
      code: firstError?.code || "payment_failed",
    };
  }

  return result;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const API_KEY = Deno.env.get("PAYVIA_API_KEY") || "pOZnjKUSBk8pEhBoOAu0qzz6WpfqLxm3YmmZnDy2";
    const APP_KEY = Deno.env.get("PAYVIA_APP_KEY") || "AK94lx3fPPIFZLhFU1pjI7YVnxvtg4Ln2za2BXOswuBIU3K3gDErj8JsWqd1AjdA";
    const MERCHANT_ID =
      Deno.env.get("PAYVIA_MERCHANT_ID") ||
      "digitzs-deetstest4-33581424-4333173-1719501441";
    const ENVIRONMENT = Deno.env.get("PAYVIA_ENVIRONMENT") || "production";
    const API_URL = PAYVIA_API_URLS[ENVIRONMENT] || PAYVIA_API_URLS.production;

    if (!API_KEY || !APP_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "PayVia API credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { token, amount, orderId, expiry, cardholderName, customerInfo } = body;

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: "No payment token provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Get auth token (SDK: PayViaClient.getAuthToken)
    const authToken = await getAuthToken(API_URL, API_KEY, APP_KEY);

    // Step 2: Build payment method data (SDK: buildPaymentMethodData)
    const paymentMethodData = buildPaymentMethodData(
      token,
      expiry || "",
      cardholderName || "Customer"
    );

    // Step 3: Process payment (SDK: PayViaClient.processPayment)
    const result = await processPayment({
      apiUrl: API_URL,
      apiKey: API_KEY,
      authToken,
      merchantId: MERCHANT_ID,
      amount,
      orderId: orderId || `ORD-${Date.now()}`,
      customerInfo: customerInfo || {
        firstName: "Customer",
        lastName: "",
        email: "",
        billingAddress: {
            address1: 'Not Provided', // Not collected in checkout
            city: 'Not Provided',
            state: 'NY', // Default to NY - PayVia requires valid 2-letter state code
            zip: '00000',
            country: 'US',
          },
      },
      paymentMethodData,
    });

    return new Response(
      JSON.stringify({
        success: result.success ?? true,
        transactionId: result.transactionId || result.data?.id || null,
        status: result.status || result.data?.attributes?.status || "completed",
        amount,
        paymentMethod: result.paymentMethod || "card",
        gateway: result.meta?.gateway || result.gateway || "nmi",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Payment process error:", error);

    const errObj = error as { status?: number; message?: string; code?: string };
    const status = errObj.status || 500;
    const message = errObj.message || (error instanceof Error ? error.message : "Unknown error");

    return new Response(
      JSON.stringify({
        success: false,
        error: message,
        code: errObj.code || "processing_error",
      }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
