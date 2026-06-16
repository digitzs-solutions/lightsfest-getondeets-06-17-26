interface CreateEventData {
  title: string;
  description?: string;
  location: string;
  date: string;
  time?: string;
  price: number;
  capacity?: number;
  status?: string;
}

interface TicketSocketEvent {
  id: string;
  title: string;
  location: string;
  date: string;
  price: number;
}

const TICKETSOCKET_EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ticketsocket`;

export async function createTicketSocketEvent(eventData: CreateEventData) {
  try {
    const response = await fetch(`${TICKETSOCKET_EDGE_FUNCTION_URL}/create-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Failed to create event',
        message: errorData.message || errorData.details,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error creating TicketSocket event:', error);
    return {
      success: false,
      error: 'Network error',
      message: error instanceof Error ? error.message : 'Failed to connect to ticket system',
    };
  }
}
