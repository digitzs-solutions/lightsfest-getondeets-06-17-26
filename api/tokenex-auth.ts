import type { VercelRequest, VercelResponse } from '@vercel/node';

async function generateHMAC(payload: string, secretKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const messageData = encoder.encode(payload);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return btoa(String.fromCharCode(...hashArray));
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

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));

  try {
    const { origin, tokenScheme = 'sixFourAndToken' } = req.body;

    const tokenExID = process.env.TOKENEX_ID || '';
    const clientSecretKey = process.env.TOKENEX_API_KEY || '';

    if (!clientSecretKey) {
      return res.status(500).json({ success: false, error: 'TokenEx API key not configured' });
    }

    const timestamp = getUTCTimestamp();
    const concatenatedString = `${tokenExID}|${origin}|${timestamp}|${tokenScheme}`;
    const authenticationKey = await generateHMAC(concatenatedString, clientSecretKey);

    return res.status(200).json({
      success: true,
      authenticationKey,
      tokenExID,
      timestamp,
      tokenScheme,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to generate authentication key',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
