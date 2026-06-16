# Lights Festival Ticketing Platform

Production-ready event ticketing platform with secure payment processing via TokenEx, Digitzs, and ProPay.

## Features

- **Multiple Event Sites**: Lights Festival, Dino World, and more
- **Secure Payments**: PCI-compliant via TokenEx iframe integration
- **Fraud Prevention**: Kount 360 integration
- **Ticketing API**: TicketSocket integration for order management
- **Real-time Database**: Supabase backend
- **Merchant Analytics**: Performance tracking and compliance monitoring
- **Multi-processor**: Supports Digitzs, ProPay, and PayVia

## Quick Start

### Development

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

### Deploy to Production

See **GITHUB_TO_VERCEL_DEPLOY.md** for complete deployment instructions.

Quick version:
```bash
# Push to GitHub
git remote add origin https://github.com/digitzs-solutions/lights-festival.git
git push -u origin main

# Deploy to Vercel
vercel --prod
```

## Environment Setup

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_TOKENEX_ID` - TokenEx account ID
- `VITE_TICKETSOCKET_API_KEY` - TicketSocket API key
- `VITE_PRODUCTION_URL` - Your production domain (Vercel URL)

## Project Structure

```
src/
├── components/          # React components
│   ├── lights/         # Lights Festival components
│   └── compliance/     # Compliance tracking components
├── services/           # API integrations
│   ├── supabase.ts    # Database client
│   ├── ticketsocket.ts # Ticketing API
│   └── payvia.ts      # Payment processing
├── LightsFestApp.tsx   # Lights Festival app
├── DinoApp.tsx         # Dino World app
└── main.tsx           # App router

supabase/
├── functions/         # Edge Functions (backend API)
│   ├── tokenex-auth/  # TokenEx authentication
│   ├── digitzs-propay/ # Payment processing
│   └── ticketsocket/   # Order management
└── migrations/        # Database schema
```

## Technology Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase Edge Functions (Deno)
- **Database**: PostgreSQL (Supabase)
- **Payments**: TokenEx + Digitzs + ProPay
- **Fraud**: Kount 360
- **Ticketing**: TicketSocket API
- **Hosting**: Vercel (frontend) + Supabase (backend)

## Available Routes

- `/` - Lights Festival (main event site)
- `/dino` - Dino World event
- `/payvia` - PayVia landing page
- `/compliance` - Compliance dashboard
- `/merchant-analytics` - Merchant performance tracking

## Payment Flow

1. User enters billing info
2. TokenEx iframe captures card data (PCI-compliant)
3. Kount performs fraud check
4. Token sent to Digitzs API
5. ProPay processes transaction
6. TicketSocket creates order
7. Confirmation email sent

## Security

- PCI DSS Level 1 compliant via TokenEx
- Card data never touches your servers
- All API keys stored as environment variables
- Row Level Security enabled on all database tables
- HTTPS required for all endpoints

## Documentation

- **GITHUB_TO_VERCEL_DEPLOY.md** - Production deployment guide
- **WHY_PAYMENTS_DONT_WORK_YET.md** - TokenEx whitelist explanation
- **TOKENEX_SETUP.md** - TokenEx integration details
- **DIGITZS_PAYVIA_END_TO_END.md** - Complete payment flow
- **TICKETSOCKET_SETUP.md** - Ticketing API setup

## Support

For issues or questions:
- Check the documentation in the project root
- Review Supabase logs for backend errors
- Check browser console for frontend errors
- Verify all environment variables are set correctly

## License

Proprietary - Digitzs Solutions, Inc.

## Production Checklist

Before going live:

- [ ] Deploy to Vercel
- [ ] Configure all environment variables
- [ ] Request TokenEx whitelist for your Vercel URL
- [ ] Test with real card in production
- [ ] Verify TicketSocket orders are created
- [ ] Check database for registration records
- [ ] Test email confirmations
- [ ] Monitor Supabase logs for errors

---

**Need help deploying?** See GITHUB_TO_VERCEL_DEPLOY.md
