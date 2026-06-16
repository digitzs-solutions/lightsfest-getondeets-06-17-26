interface CreateOrderData {
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

interface TicketSocketOrder {
  order_id: string;
  status: string;
  checkout_url?: string;
  payment_url?: string;
  total_amount?: number;
  currency?: string;
}

interface TicketSocketResponse {
  success: boolean;
  data?: TicketSocketOrder;
  error?: string;
  message?: string;
}

const TICKETSOCKET_EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ticketsocket`;

export async function createTicketOrder(orderData: CreateOrderData): Promise<TicketSocketResponse> {
  try {
    const response = await fetch(`${TICKETSOCKET_EDGE_FUNCTION_URL}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Failed to create order',
        message: errorData.message || errorData.details,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error creating ticket order:', error);
    return {
      success: false,
      error: 'Network error',
      message: error instanceof Error ? error.message : 'Failed to connect to ticket system',
    };
  }
}

export async function getOrderStatus(orderId: string): Promise<TicketSocketResponse> {
  try {
    const response = await fetch(`${TICKETSOCKET_EDGE_FUNCTION_URL}/order-status?order_id=${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Failed to get order status',
        message: errorData.message || errorData.details,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error getting order status:', error);
    return {
      success: false,
      error: 'Network error',
      message: error instanceof Error ? error.message : 'Failed to connect to ticket system',
    };
  }
}

export async function getTicketSocketEvents(eventId?: string) {
  try {
    const url = eventId
      ? `${TICKETSOCKET_EDGE_FUNCTION_URL}/events?id=${eventId}`
      : `${TICKETSOCKET_EDGE_FUNCTION_URL}/events`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Failed to fetch events',
        message: errorData.message || errorData.details,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error fetching events:', error);
    return {
      success: false,
      error: 'Network error',
      message: error instanceof Error ? error.message : 'Failed to connect to ticket system',
    };
  }
}
