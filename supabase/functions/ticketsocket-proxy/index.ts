import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const API_BASE = "https://clevergroup.tscheckout.com/api/v1";
const TICKETSOCKET_API_KEY = Deno.env.get("TICKETSOCKET_API_KEY") || "1QbDuXq13UCTuptnc3kf8HZxTEQynWNTp4Qx8Dpu";
const DESTINATION_MID = "digitzs-deetstest4-33581424-4333173-1719501441";
const PROPAY_MID = "33581424";

async function getAuthToken(): Promise<string> {
  const userName = Deno.env.get("TICKETSOCKET_USERNAME");
  const password = Deno.env.get("TICKETSOCKET_PASSWORD");

  if (!userName || !password) {
    throw new Error("TicketSocket username/password not configured");
  }

  const response = await fetch(`${API_BASE}/tokens/without-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userName, password }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(`Token generation failed: ${JSON.stringify(data)}`);
  }

  const token = data.data?.jwt;
  if (!token) {
    throw new Error(`No token in response: ${JSON.stringify(data)}`);
  }
  return token;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();

    if (action === "health" && req.method === "GET") {
      try {
        const token = await getAuthToken();
        return jsonResponse({ success: true, message: "Connected to TicketSocket", tokenLength: token.length });
      } catch (err) {
        return jsonResponse({ success: false, error: err instanceof Error ? err.message : "Unknown" }, 500);
      }
    }

    const token = await getAuthToken();
    const commonHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };

    // GET /events - List all events
    if (action === "events" && req.method === "GET") {
      const eventId = url.searchParams.get("id");
      const endpoint = eventId
        ? `${API_BASE}/events/${eventId}`
        : `${API_BASE}/events`;

      const tsResponse = await fetch(endpoint, { method: "GET", headers: commonHeaders });
      const result = await tsResponse.text();
      return new Response(result, {
        status: tsResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /ticket-types - Get ticket types for an event
    if (action === "ticket-types" && req.method === "GET") {
      const eventId = url.searchParams.get("eventId") || "1";
      const tsResponse = await fetch(`${API_BASE}/events/${eventId}/public-ticket-types`, {
        method: "GET",
        headers: commonHeaders,
      });
      const result = await tsResponse.text();
      return new Response(result, {
        status: tsResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /describe-order - Describe an order (get pricing) before creating
    if (action === "describe-order" && req.method === "POST") {
      const body = await req.json();
      const tsResponse = await fetch(`${API_BASE}/orders/describe`, {
        method: "POST",
        headers: commonHeaders,
        body: JSON.stringify(body),
      });
      const result = await tsResponse.text();
      return new Response(result, {
        status: tsResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /create-order - Create a completed order in TicketSocket
    if (action === "create-order" && req.method === "POST") {
      const orderData = await req.json();

      // Build tickets array (one entry per ticket)
      const tickets = [];
      const qty = orderData.ticketQuantity || 1;
      const ticketTypeId = orderData.ticketTypeId || 1;
      for (let i = 0; i < qty; i++) {
        tickets.push({ ticketTypeId });
      }

      const orderPayload = {
        emailReceipt: 1,
        paymentMethod: "cash",
        basicInfo: {
          emailAddress: orderData.email,
          firstName: orderData.firstName,
          lastName: orderData.lastName,
          phone: orderData.phone || "",
        },
        tickets,
        fees: [],
      };

      const tsResponse = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: commonHeaders,
        body: JSON.stringify(orderPayload),
      });

      const result = await tsResponse.json();

      if (!tsResponse.ok || !result.success) {
        return jsonResponse({
          success: false,
          error: result.message || "Order creation failed",
          details: result,
        }, tsResponse.status || 400);
      }

      return jsonResponse({
        success: true,
        data: {
          order_id: result.data?.orderId || result.data?.id || null,
          status: "completed",
          details: result.data,
        },
      });
    }

    // GET /orders - List orders
    if (action === "orders" && req.method === "GET") {
      const orderId = url.searchParams.get("id");
      const endpoint = orderId
        ? `${API_BASE}/orders/${orderId}`
        : `${API_BASE}/orders`;
      const tsResponse = await fetch(endpoint, { method: "GET", headers: commonHeaders });
      const result = await tsResponse.text();
      return new Response(result, {
        status: tsResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return jsonResponse({
      error: "Invalid action or method",
      available: [
        "GET /health",
        "GET /events",
        "GET /ticket-types?eventId=1",
        "POST /describe-order",
        "POST /create-order",
        "GET /orders",
      ],
    }, 400);
  } catch (error) {
    return jsonResponse({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    }, 500);
  }
});
