import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  paymentToken?: string; // NMI Collect.js token
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  eventInfo: {
    eventName: string;
    eventDate: string;
    eventTime: string;
  };
  cardData?: {
    cardNumber: string;
    expiry: string; // MMYY format
    cvv: string;
  };
  deviceData: {
    ipAddress: string;
    userAgent: string;
  };
  merchantId?: string;
}

interface DigitzsResponse {
  response: string;
  responsetext: string;
  authcode?: string;
  transactionid?: string;
  avsresponse?: string;
  cvvresponse?: string;
  orderid?: string;
  response_code?: string;
}

Deno.serve(async (req: Request) => {
  console.log("=== EDGE FUNCTION INVOKED ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);

  if (req.method === "OPTIONS") {
    console.log("OPTIONS request - returning CORS headers");
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log("=== STEP 1: Parsing request body ===");
    const paymentData: PaymentRequest = await req.json();
    console.log("Request parsed successfully");

    console.log("=== STEP 2: Processing transaction ===", {
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      merchantId: paymentData.merchantId || '33595002',
    });

    console.log("=== STEP 3: Checking security key ===");
    const DIGITZS_SECURITY_KEY = Deno.env.get("DIGITZS_SECURITY_KEY");
    if (!DIGITZS_SECURITY_KEY) {
      console.error("SECURITY KEY MISSING!");
      throw new Error("DIGITZS_SECURITY_KEY not configured");
    }

    console.log("Security key found:", {
      present: !!DIGITZS_SECURITY_KEY,
      length: DIGITZS_SECURITY_KEY?.length,
      firstChars: DIGITZS_SECURITY_KEY?.substring(0, 10),
    });

    console.log("=== STEP 4: Building request ===");

    const baseParams: Record<string, string> = {
      security_key: DIGITZS_SECURITY_KEY,
      type: 'sale',
      amount: paymentData.amount.toFixed(2),
      firstname: paymentData.customerInfo.firstName,
      lastname: paymentData.customerInfo.lastName,
      email: paymentData.customerInfo.email,
      phone: paymentData.customerInfo.phone.replace(/\D/g, ''),
      orderid: paymentData.orderId,
      ipaddress: paymentData.deviceData.ipAddress,
      test_mode: 'enabled',
    };

    // Use payment token if provided (PCI compliant), otherwise use card data (legacy)
    if (paymentData.paymentToken) {
      console.log("Using payment token (PCI compliant)");
      baseParams.payment_token = paymentData.paymentToken;
    } else if (paymentData.cardData) {
      console.log("Using raw card data (legacy - not PCI compliant)");
      baseParams.ccnumber = paymentData.cardData.cardNumber.replace(/\s/g, '');
      baseParams.ccexp = paymentData.cardData.expiry;
      baseParams.cvv = paymentData.cardData.cvv;
    } else {
      throw new Error("Either paymentToken or cardData must be provided");
    }

    const formData = new URLSearchParams(baseParams);

    if (paymentData.customerInfo.address) {
      formData.append('address1', paymentData.customerInfo.address);
    }
    if (paymentData.customerInfo.city) {
      formData.append('city', paymentData.customerInfo.city);
    }
    if (paymentData.customerInfo.state) {
      formData.append('state', paymentData.customerInfo.state);
    }
    if (paymentData.customerInfo.zip) {
      formData.append('zip', paymentData.customerInfo.zip);
    }
    if (paymentData.customerInfo.country) {
      formData.append('country', paymentData.customerInfo.country);
    }

    console.log("=== STEP 5: SENDING TO DIGITZS ===");
    console.log("URL: https://digitzs.transactiongateway.com/api/transact.php");
    console.log("Request body (CVV hidden):", formData.toString().replace(/cvv=[^&]*/, 'cvv=***'));

    const startTime = Date.now();
    const digitzsResponse = await fetch(
      'https://digitzs.transactiongateway.com/api/transact.php',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    );
    const elapsed = Date.now() - startTime;

    console.log("=== STEP 6: DIGITZS RESPONDED ===");
    console.log("Time elapsed:", elapsed, "ms");
    console.log("HTTP status:", digitzsResponse.status);
    console.log("HTTP status text:", digitzsResponse.statusText);
    console.log("Response headers:", Object.fromEntries(digitzsResponse.headers.entries()));

    const responseText = await digitzsResponse.text();
    console.log("=== STEP 7: RAW RESPONSE FROM DIGITZS ===");
    console.log(responseText);

    const parsedResponse: DigitzsResponse = Object.fromEntries(
      new URLSearchParams(responseText)
    ) as unknown as DigitzsResponse;

    console.log("Digitzs parsed response:", parsedResponse);

    const isApproved = parsedResponse.response === '1';

    if (isApproved) {
      return new Response(
        JSON.stringify({
          success: true,
          transactionId: parsedResponse.transactionid,
          orderId: parsedResponse.orderid || paymentData.orderId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: 'approved',
          authCode: parsedResponse.authcode,
          avsResponse: parsedResponse.avsresponse,
          cvvResponse: parsedResponse.cvvresponse,
          processor: 'Digitzs/NMI',
          merchantId: paymentData.merchantId || '33595002',
          gateway: 'Digitzs',
          timestamp: new Date().toISOString(),
          message: parsedResponse.responsetext || 'Transaction approved',
          details: {
            customerName: `${paymentData.customerInfo.firstName} ${paymentData.customerInfo.lastName}`,
            email: paymentData.customerInfo.email,
            eventName: paymentData.eventInfo.eventName,
            eventDate: paymentData.eventInfo.eventDate,
            eventTime: paymentData.eventInfo.eventTime,
          },
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      const errorMessage = getErrorMessage(parsedResponse.response_code || parsedResponse.response);

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Transaction declined',
          message: parsedResponse.responsetext || errorMessage,
          responseCode: parsedResponse.response_code || parsedResponse.response,
          orderId: paymentData.orderId,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    console.error("Digitzs direct transaction error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Transaction processing failed",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

function getErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    '2': 'Transaction declined',
    '3': 'Transaction error',
    '200': 'Transaction declined',
    '201': 'Do not honor',
    '202': 'Insufficient funds',
    '203': 'Over limit',
    '204': 'Transaction not allowed',
    '220': 'Incorrect payment information',
    '221': 'No such card issuer',
    '222': 'No card number on file',
    '223': 'Expired card',
    '224': 'Invalid expiration date',
    '225': 'Invalid security code',
    '240': 'Call issuer for further information',
    '250': 'Pick up card',
    '251': 'Lost card',
    '252': 'Stolen card',
    '253': 'Fraudulent card',
    '300': 'Transaction rejected',
    '400': 'Transaction error returned by processor',
    '410': 'Invalid merchant configuration',
    '420': 'Communication error',
    '430': 'Duplicate transaction',
  };

  return errorMessages[code] || 'Transaction failed';
}
