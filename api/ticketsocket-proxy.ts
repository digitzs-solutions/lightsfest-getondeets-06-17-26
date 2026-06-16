import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_BASE = 'https://clevergroup.tscheckout.com/api/v1';

async function getAuthToken(): Promise<string> {
  const userName = process.env.TICKETSOCKET_USERNAME || '';
  const password = process.env.TICKETSOCKET_PASSWORD || '';

  if (!userName || !password) {
    throw new Error('TicketSocket username/password not configured');
  }

  const response = await fetch(`${API_BASE}/tokens/without-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userName, password }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(`Token generation failed: ${JSON.stringify(data)}`);
  }

  const token = data.data?.jwt;
  if (!token) throw new Error(`No token in response: ${JSON.stringify(data)}`);
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
    const { action } = req.query;
    const token = await getAuthToken();
    const commonHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    if (action === 'create-order' && req.method === 'POST') {
      const orderData = req.body;
      const tickets = [];
      const qty = orderData.ticketQuantity || 1;
      const ticketTypeId = orderData.ticketTypeId || 1;
      for (let i = 0; i < qty; i++) tickets.push({ ticketTypeId });

      const orderPayload = {
        emailReceipt: 1,
        paymentMethod: 'cash',
        basicInfo: {
          emailAddress: orderData.email,
          firstName: orderData.firstName,
          lastName: orderData.lastName,
          phone: orderData.phone || '',
        },
        tickets,
        fees: [],
      };

      const tsResponse = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: commonHeaders,
        body: JSON.stringify(orderPayload),
      });

      const result = await tsResponse.json();
      if (!tsResponse.ok || !result.success) {
        return res.status(tsResponse.status || 400).json({
          success: false,
          error: result.message || 'Order creation failed',
          details: result,
        });
      }

      return res.status(200).json({
        success: true,
        data: { order_id: result.data?.orderId || result.data?.id || null, status: 'completed', details: result.data },
      });
    }

    return res.status(400).json({ error: 'Invalid action', available: ['POST /api/ticketsocket-proxy?action=create-order'] });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' });
  }
}
