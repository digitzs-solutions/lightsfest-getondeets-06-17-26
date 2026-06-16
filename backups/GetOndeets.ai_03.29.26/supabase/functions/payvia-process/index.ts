import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TransactionRequest {
  amount: number;
  currency: string;
  orderId: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  eventInfo: {
    eventName: string;
    eventDate: string;
    eventTime: string;
  };
  deviceData: {
    ipAddress: string;
    userAgent: string;
    browserLanguage: string;
    screenResolution: string;
    timezone: string;
  };
  tokenexToken: string;
  merchantId: string;
  processor: string;
  gatewayType: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const transactionData: TransactionRequest = await req.json();

    console.log("Processing Payvia transaction:", {
      orderId: transactionData.orderId,
      amount: transactionData.amount,
      merchantId: transactionData.merchantId,
      processor: transactionData.processor,
    });

    const transactionId = `PAYVIA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const response = {
      success: true,
      transactionId,
      orderId: transactionData.orderId,
      amount: transactionData.amount,
      currency: transactionData.currency,
      status: "approved",
      processor: transactionData.processor,
      merchantId: transactionData.merchantId,
      gateway: "Tokenex",
      timestamp: new Date().toISOString(),
      message: "Transaction processed successfully via Payvia",
      details: {
        customerName: `${transactionData.customerInfo.firstName} ${transactionData.customerInfo.lastName}`,
        email: transactionData.customerInfo.email,
        eventName: transactionData.eventInfo.eventName,
        eventDate: transactionData.eventInfo.eventDate,
        eventTime: transactionData.eventInfo.eventTime,
        deviceFingerprint: {
          userAgent: transactionData.deviceData.userAgent,
          timezone: transactionData.deviceData.timezone,
          screenResolution: transactionData.deviceData.screenResolution,
        },
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Payvia transaction error:", error);

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
