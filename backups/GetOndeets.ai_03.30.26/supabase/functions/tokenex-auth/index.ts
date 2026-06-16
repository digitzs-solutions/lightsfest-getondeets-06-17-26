import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function generateHMAC(payload: string, secretKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const messageData = encoder.encode(payload);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);

  const hashArray = Array.from(new Uint8Array(signature));
  const hashBase64 = btoa(String.fromCharCode(...hashArray));

  return hashBase64;
}

function getUTCTimestamp(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { origin, tokenScheme = "nGUID" } = await req.json();

    const tokenExID = Deno.env.get("TOKENEX_ID") || "3787957743127376";
    const clientSecretKey = Deno.env.get("TOKENEX_API_KEY_1") || Deno.env.get("TOKENEX_API_KEY");

    if (!clientSecretKey) {
      console.error("TOKENEX_API_KEY_1 not configured");
      return new Response(
        JSON.stringify({
          success: false,
          error: "TokenEx not configured",
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

    const timestamp = getUTCTimestamp();
    const concatenatedString = `${tokenExID}|${origin}|${timestamp}|${tokenScheme}`;

    const authenticationKey = await generateHMAC(concatenatedString, clientSecretKey);

    return new Response(
      JSON.stringify({
        success: true,
        authenticationKey,
        tokenExID,
        timestamp,
        tokenScheme,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("TokenEx auth generation error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to generate authentication key",
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
