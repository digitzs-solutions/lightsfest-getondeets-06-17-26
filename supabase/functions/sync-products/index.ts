import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const API_BASE = "https://clevergroup.tscheckout.com/api/v1";

const EVENTS_TO_SYNC = [
  {
    title: "The Lights Fest - Austin, TX",
    description: "Release sky lanterns under the Texas stars. Live music, food trucks, and a breathtaking shared moment of wonder.",
    venue: "Circuit of The Americas",
    city: "Austin",
    state: "TX",
    date: "2026-07-19",
    time: "19:00",
    ticketPrice: 1.00,
    ticketName: "General Admission",
  },
  {
    title: "The Lights Fest - Denver, CO",
    description: "The Rocky Mountain sky comes alive as thousands of lanterns float upward. An unforgettable summer evening.",
    venue: "Bandimere Speedway",
    city: "Denver",
    state: "CO",
    date: "2026-08-16",
    time: "19:30",
    ticketPrice: 1.00,
    ticketName: "General Admission",
  },
  {
    title: "The Lights Fest - Nashville, TN",
    description: "Music City meets sky lantern magic. Join us for live performances and a communal lantern release.",
    venue: "Nashville Superspeedway",
    city: "Nashville",
    state: "TN",
    date: "2026-09-20",
    time: "19:00",
    ticketPrice: 1.00,
    ticketName: "General Admission",
  },
  {
    title: "The Lights Fest - Phoenix, AZ",
    description: "Under the clear desert sky, thousands of lanterns illuminate the Arizona night in perfect unison.",
    venue: "Wild Horse Pass Motorsports Park",
    city: "Phoenix",
    state: "AZ",
    date: "2026-10-18",
    time: "18:30",
    ticketPrice: 1.00,
    ticketName: "General Admission",
  },
];

async function getAuthToken(): Promise<string> {
  const userName = Deno.env.get("TICKETSOCKET_USERNAME") || "Laura@digitzs.com";
  const password = Deno.env.get("TICKETSOCKET_PASSWORD") || "DFRocks2026!";

  const response = await fetch(`${API_BASE}/tokens/without-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userName, password }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(`Auth failed: ${JSON.stringify(data)}`);
  }

  return data.data?.jwt;
}

async function createEvent(token: string, event: typeof EVENTS_TO_SYNC[0]) {
  const eventPayload = {
    title: event.title,
    description: event.description,
    venue: event.venue,
    address: `${event.city}, ${event.state}`,
    startDate: `${event.date}T${event.time}:00`,
    endDate: `${event.date}T23:00:00`,
    timezone: "America/Chicago",
    status: "active",
    isPublic: true,
  };

  const eventResponse = await fetch(`${API_BASE}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(eventPayload),
  });

  const eventResult = await eventResponse.json();

  if (!eventResponse.ok) {
    return { success: false, event: event.title, error: eventResult };
  }

  const eventId = eventResult.data?.id || eventResult.data?.eventId;

  if (eventId) {
    const ticketTypePayload = {
      name: event.ticketName,
      price: event.ticketPrice,
      quantity: 500,
      description: `${event.ticketName} - includes lantern kit`,
      sortOrder: 1,
    };

    await fetch(`${API_BASE}/events/${eventId}/ticket-types`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(ticketTypePayload),
    });
  }

  return { success: true, event: event.title, eventId };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const token = await getAuthToken();
    const results = [];

    for (const event of EVENTS_TO_SYNC) {
      const result = await createEvent(token, event);
      results.push(result);
    }

    const successCount = results.filter((r) => r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${successCount}/${EVENTS_TO_SYNC.length} events to TicketSocket`,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
