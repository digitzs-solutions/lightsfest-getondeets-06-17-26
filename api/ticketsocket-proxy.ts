import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_BASE = (process.env.TS_API_URL || 'https://clevergroup.tscheckout.com') + '/api/v1';

let cachedAuth: { token: string; expiresAt: number } | null = null;

async function getAuthToken(): Promise<string> {
  if (cachedAuth && cachedAuth.expiresAt > Date.now()) {
    return cachedAuth.token;
  }

  const userName = process.env.TS_USERNAME || '';
  const password = process.env.TS_PASSWORD || '';
  const publicKey = process.env.TS_PUBLIC_KEY || '';
  const publicKeySlug = process.env.TS_PUBLIC_KEY_SLUG || '';

  if (!userName || !password) {
    throw new Error('TSCheckout credentials not configured');
  }

  const response = await fetch(`${API_BASE}/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userName, password, publicKey, publicKeySlug }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(`TSCheckout auth failed: ${JSON.stringify(data)}`);
  }

  const token = data.data?.jwt;
  if (!token) throw new Error(`No JWT in response: ${JSON.stringify(data)}`);

  cachedAuth = { token, expiresAt: Date.now() + 50 * 60 * 1000 };
  return token;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action, eventId } = req.query;
    const token = await getAuthToken();
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    // List events (available for online purchase)
    if (action === 'events') {
      const tsResponse = await fetch(`${API_BASE}/events?status=availableonline&_include=sold`, {
        method: 'GET',
        headers,
      });
      const result = await tsResponse.json();
      if (!tsResponse.ok) {
        return res.status(tsResponse.status).json({ success: false, error: 'Failed to fetch events', details: result });
      }
      return res.status(200).json({ success: true, data: result.data || result });
    }

    // Get ticket types for an event
    if (action === 'ticket-types') {
      const eid = eventId || '';
      if (!eid) {
        return res.status(200).json({ success: true, data: [] });
      }
      const tsResponse = await fetch(`${API_BASE}/events/${eid}/ticket-types`, {
        method: 'GET',
        headers,
      });
      const result = await tsResponse.json();
      if (!tsResponse.ok) {
        return res.status(200).json({ success: true, data: [] });
      }
      return res.status(200).json({ success: true, data: result.data || result });
    }

    // Describe order (pricing preview) before payment
    if (action === 'describe-order' && req.method === 'POST') {
      const body = req.body;
      const tsResponse = await fetch(`${API_BASE}/orders/describe`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          includeFees: 1,
          paymentMethod: process.env.TS_ORDER_PAYMENT_METHOD || 'cash',
          basicInfo: body.basicInfo,
          tickets: body.tickets,
          promoCodes: body.promoCodes,
        }),
      });
      const result = await tsResponse.json();
      return res.status(tsResponse.ok ? 200 : 400).json({
        success: tsResponse.ok,
        data: result.data || result,
      });
    }

    // Create order after payment is verified (detachPaymentMethod: true)
    // Matches reference: paymentMethod='credit', detachPaymentMethod=true
    if (action === 'create-order' && req.method === 'POST') {
      const orderData = req.body;
      const tickets = [];
      const qty = orderData.ticketQuantity || 1;
      const ticketTypeId = orderData.ticketTypeId;

      if (!ticketTypeId) {
        return res.status(400).json({ success: false, error: 'ticketTypeId is required' });
      }

      for (let i = 0; i < qty; i++) {
        tickets.push({
          ticketTypeId,
          partyMember: orderData.firstName || '',
          partyMemberLastName: orderData.lastName || '',
          partyMemberEmail: orderData.email || '',
        });
      }

      // Payment is collected externally via PayVia, so the TicketSocket order
      // must NOT re-charge the card. Use a non-charging payment method
      // (default 'cash' records the sale amount; override with TS_ORDER_PAYMENT_METHOD
      // e.g. 'comp'/'check' if your TicketSocket instance prefers another value).
      const orderPayload = {
        paymentMethod: process.env.TS_ORDER_PAYMENT_METHOD || 'cash',
        emailReceipt: '1',
        includeFees: 1,
        basicInfo: {
          firstName: orderData.firstName,
          lastName: orderData.lastName,
          emailAddress: orderData.email,
        },
        tickets,
        promoCodes: orderData.promoCode ? [{ code: orderData.promoCode }] : undefined,
      };

      const tsResponse = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderPayload),
      });

      const result = await tsResponse.json();
      const createdOrderId = result.data?.id || result.data?.orderId || null;
      // TicketSocket can return HTTP 200 + success:true but still fail the order
      // at the payment step (e.g. TSD1001). Treat a missing order id or an
      // embedded error message as a real failure.
      const orderError = result.data?.error || result.data?.message;
      if (!tsResponse.ok || !result.success || !createdOrderId || orderError) {
        console.error('[TSCheckout create-order] failed', {
          status: tsResponse.status,
          payload: orderPayload,
          response: result,
        });
        return res.status(tsResponse.ok ? 400 : tsResponse.status).json({
          success: false,
          error: orderError || result.message || 'Order creation failed',
          details: result,
        });
      }

      console.log('[TSCheckout create-order] success', { orderId: createdOrderId });

      return res.status(200).json({
        success: true,
        data: {
          orderId: createdOrderId,
          status: 'completed',
          details: result.data,
        },
      });
    }

    return res.status(400).json({
      error: 'Invalid action',
      available: ['events', 'ticket-types', 'describe-order', 'create-order'],
    });
  } catch (error) {
    console.error('[TSCheckout Proxy]', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
