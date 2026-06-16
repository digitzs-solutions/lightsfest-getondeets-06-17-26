# TicketSocket Integration Setup

## Overview

The LightsFest website is now integrated with TicketSocket API v2 for ticket sales and payment processing. The integration uses a secure Edge Function to handle API calls to the TicketSocket merchant account at Digitzs.

## Credentials Configured

The following credentials have been configured:

- **API URL**: `https://clevergroup.tscheckout.com/api/v2`
- **Merchant ID**: `ticketso-clevergroup-33595002-4398786-1724692895`
- **Username**: `Laura@digitzs.com`
- **Admin Portal**: https://clevergroup.tscheckout.com/admin/

## How It Works

### Authentication

The Edge Function authenticates with TicketSocket using username/password credentials:
1. Calls `/auth/login` endpoint to obtain an access token
2. Uses the token for all subsequent API requests
3. Authentication happens automatically for each request

### Registration Flow

1. User fills out the registration form with:
   - First and last name
   - Email address
   - Phone number (optional)
   - Number of tickets

2. When the form is submitted:
   - The frontend calls the TicketSocket Edge Function
   - The Edge Function authenticates with TicketSocket API v2
   - Creates an order in TicketSocket with merchant ID and customer details
   - The registration is saved to the Supabase database with the TicketSocket order ID
   - If TicketSocket returns a checkout URL, the user is redirected to complete payment

3. The registration record includes:
   - Customer information
   - Event details
   - TicketSocket order ID
   - Order status (pending, completed, failed, refunded)

### Edge Function Endpoints

The TicketSocket Edge Function provides three endpoints:

#### 1. Create Order
**POST** `/functions/v1/ticketsocket/create-order`

Creates a new ticket order in TicketSocket API v2.

**Request Body:**
```json
{
  "eventId": "event-id",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "ticketQuantity": 2,
  "eventTitle": "Holiday Light Show",
  "eventDate": "2024-12-25"
}
```

**TicketSocket API Payload:**
```json
{
  "merchant_id": "ticketso-clevergroup-33595002-4398786-1724692895",
  "customer": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "items": [
    {
      "event_id": "event-id",
      "quantity": 2
    }
  ]
}
```

#### 2. Get Events
**GET** `/functions/v1/ticketsocket/events`
**GET** `/functions/v1/ticketsocket/events?id=event-id`

Fetches event information from TicketSocket for the configured merchant.

#### 3. Get Order Status
**GET** `/functions/v1/ticketsocket/order-status?order_id=order-id`

Retrieves the current status of an order.

## Database Schema

The `registrations` table includes:

- `ticketsocket_order_id` (text) - Stores the TicketSocket order ID
- `order_status` (text) - Tracks order status (default: 'pending')
- Index on `ticketsocket_order_id` for fast lookups

## Security

- All API calls to TicketSocket are made server-side through the Edge Function
- API credentials (username/password) are never exposed to the frontend
- Authentication tokens are obtained dynamically for each request
- The Edge Function is configured as a public endpoint (verify_jwt: false) to allow direct ticket purchases without user authentication
- Credentials are stored in Supabase Edge Function secrets

## Environment Variables

The following environment variables are configured in Supabase:

- `TICKETSOCKET_API_URL` - API endpoint (v2)
- `TICKETSOCKET_MERCHANT_ID` - Merchant identifier
- `TICKETSOCKET_USERNAME` - API username
- `TICKETSOCKET_PASSWORD` - API password

## Testing

To test the integration:

1. Visit the LightsFest website
2. Click "Register" on any event
3. Fill out the registration form
4. Submit the form
5. The system will:
   - Authenticate with TicketSocket
   - Create an order
   - Save registration to database
   - Redirect to checkout if a payment URL is provided

## Troubleshooting

If you encounter errors:

1. Check Edge Function logs in Supabase Dashboard
2. Verify credentials are correct in the admin portal
3. Ensure the event IDs match between your database and TicketSocket
4. Check that the API v2 endpoint is accessible
5. Review authentication response for token issues

## API Documentation

- **TicketSocket API v2 Docs**: https://clevergroup.tscheckout.com/api/v2/docs
- **Admin Portal**: https://clevergroup.tscheckout.com/admin/

## Files Modified/Created

- `/supabase/functions/ticketsocket/index.ts` - Edge Function for TicketSocket API v2
- `/src/services/ticketsocket.ts` - Frontend service utilities
- `/src/components/RegistrationModal.tsx` - Updated registration flow
- Database migration: `add_ticketsocket_fields_to_registrations.sql`
- `.env` - Local development credentials (not deployed)
