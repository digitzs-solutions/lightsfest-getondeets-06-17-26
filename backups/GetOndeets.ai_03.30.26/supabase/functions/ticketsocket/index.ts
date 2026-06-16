import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CreateOrderRequest {
  eventId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  ticketQuantity: number;
  eventTitle: string;
  eventDate: string;
  totalAmount: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const ticketSocketApiUrl = Deno.env.get("TICKETSOCKET_API_URL") || "https://clevergroup.tscheckout.com/api/v1";
    const ticketSocketApiKey = Deno.env.get("TICKETSOCKET_API_KEY");

    if (!ticketSocketApiKey) {
      return new Response(
        JSON.stringify({
          error: "TicketSocket API key not configured",
          message: "Please configure TICKETSOCKET_API_KEY environment variable",
          instructions: "Get your API key from TicketSocket Admin",
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

    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();

    const commonHeaders = {
      "Content-Type": "application/json",
      "X-API-KEY": ticketSocketApiKey,
    };

    if (action === "create-order" && req.method === "POST") {
      const orderData: CreateOrderRequest = await req.json();

      const orderPayload = {
        customer: {
          first_name: orderData.firstName,
          last_name: orderData.lastName,
          email: orderData.email,
          phone: orderData.phone || "",
        },
        items: [
          {
            event_id: orderData.eventId,
            quantity: orderData.ticketQuantity,
            event_title: orderData.eventTitle,
            event_date: orderData.eventDate,
          },
        ],
        total_amount: orderData.totalAmount,
        currency: "USD",
      };

      const fullUrl = `${ticketSocketApiUrl}/orders`;
      console.log("Creating order at URL:", fullUrl);
      console.log("Request payload:", JSON.stringify(orderPayload));

      const ticketSocketResponse = await fetch(fullUrl, {
        method: "POST",
        headers: commonHeaders,
        body: JSON.stringify(orderPayload),
      });

      if (!ticketSocketResponse.ok) {
        const errorData = await ticketSocketResponse.text();
        console.error("TicketSocket API Error:", errorData);

        return new Response(
          JSON.stringify({
            error: "Failed to create order",
            details: errorData,
            status: ticketSocketResponse.status,
          }),
          {
            status: ticketSocketResponse.status,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const result = await ticketSocketResponse.json();

      return new Response(
        JSON.stringify(result),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (action === "events" && req.method === "GET") {
      const eventId = url.searchParams.get("id");
      const endpoint = eventId
        ? `${ticketSocketApiUrl}/events/${eventId}`
        : `${ticketSocketApiUrl}/events`;

      const ticketSocketResponse = await fetch(endpoint, {
        method: "GET",
        headers: commonHeaders,
      });

      if (!ticketSocketResponse.ok) {
        const errorData = await ticketSocketResponse.text();
        return new Response(
          JSON.stringify({
            error: "Failed to fetch events",
            details: errorData,
          }),
          {
            status: ticketSocketResponse.status,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const result = await ticketSocketResponse.json();

      return new Response(
        JSON.stringify(result),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (action === "create-event" && req.method === "POST") {
      const eventData = await req.json();

      const eventPayload = {
        title: eventData.title,
        description: eventData.description || "",
        location: eventData.location,
        date: eventData.date,
        time: eventData.time || "19:00",
        price: eventData.price,
        capacity: eventData.capacity || 1000,
        status: eventData.status || "active",
      };

      const fullUrl = `${ticketSocketApiUrl}/events`;
      console.log("Creating event at URL:", fullUrl);
      console.log("Request payload:", JSON.stringify(eventPayload));

      const ticketSocketResponse = await fetch(fullUrl, {
        method: "POST",
        headers: commonHeaders,
        body: JSON.stringify(eventPayload),
      });

      if (!ticketSocketResponse.ok) {
        const errorData = await ticketSocketResponse.text();
        console.error("TicketSocket API Error:", errorData);

        return new Response(
          JSON.stringify({
            error: "Failed to create event",
            details: errorData,
            status: ticketSocketResponse.status,
          }),
          {
            status: ticketSocketResponse.status,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const result = await ticketSocketResponse.json();

      return new Response(
        JSON.stringify(result),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (action === "order-status" && req.method === "GET") {
      const orderId = url.searchParams.get("order_id");

      if (!orderId) {
        return new Response(
          JSON.stringify({ error: "Order ID is required" }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const ticketSocketResponse = await fetch(
        `${ticketSocketApiUrl}/orders/${orderId}`,
        {
          method: "GET",
          headers: commonHeaders,
        }
      );

      if (!ticketSocketResponse.ok) {
        const errorData = await ticketSocketResponse.text();
        return new Response(
          JSON.stringify({
            error: "Failed to fetch order status",
            details: errorData,
          }),
          {
            status: ticketSocketResponse.status,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const result = await ticketSocketResponse.json();

      return new Response(
        JSON.stringify(result),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Invalid action or method",
        availableActions: ["create-order (POST)", "events (GET)", "create-event (POST)", "order-status (GET)"],
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in TicketSocket function:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
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
