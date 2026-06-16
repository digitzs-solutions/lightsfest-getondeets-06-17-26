# Deployment Guide

## Overview
This is a multi-app platform featuring:
- The Lights Festival event website
- PayVia payment integration and testing tools
- Merchant analytics dashboard
- Documentation portal
- Compliance tracking system

Built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### Frontend
- **Modern Design**: Clean, professional UI matching The Lights Fest aesthetic
- **Responsive Layout**: Fully responsive across mobile, tablet, and desktop
- **Navigation**: Fixed header with smooth scrolling navigation
- **Event Management**: Display upcoming events with date, location, and details
- **Registration System**: Modal-based registration form for each event
- **FAQ Section**: Expandable Q&A for common questions
- **Get Involved**: Opportunities for volunteers, charities, sponsors, and affiliates
- **Beautiful Footer**: Contact information and links

### Backend
- **Supabase Database**: Secure PostgreSQL database with Row-Level Security (RLS)
- **Events Table**: Stores all festival events
- **Registrations Table**: Manages user registrations with validation
- **No Third-Party Scripts**: Clean, first-party only implementation

## Architecture

### Database Schema

#### Events Table
```
- id (UUID, primary key)
- title (text)
- date (text)
- location (text)
- city (text)
- description (text)
- image_url (text)
- ticket_url (text)
- capacity (integer)
- created_at (timestamp)
```

#### Registrations Table
```
- id (UUID, primary key)
- event_id (UUID, foreign key to events)
- email (text)
- first_name (text)
- last_name (text)
- phone (text)
- tickets_quantity (integer)
- created_at (timestamp)
```

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (already configured)

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   The `.env` file is already configured with Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

4. **Build for Production**
   ```bash
   npm run build
   ```

## Deployment to Vercel (getondeets.ai)

### Current Setup
The site is deployed at:
- Primary: https://www.getondeets.ai
- Alternate: https://getondeets.ai (redirects to www)

### Deploying Updates

#### Option 1: Using Vercel CLI
```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### Option 2: Using Git Integration
1. Push your changes to your Git repository
2. Vercel will automatically deploy from the connected branch
3. Production deployments happen on push to main/master

#### Option 3: Manual Deployment
1. Build the project locally:
   ```bash
   npm run build
   ```
2. Log in to https://vercel.com/dashboard
3. Select your getondeets.ai project
4. Go to Settings → General → Root Directory (should be `./`)
5. Build settings should be:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Go to Deployments → Deploy

### Environment Variables in Vercel
Make sure these are set in your Vercel project settings:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

To add/update environment variables:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add or update variables
5. Redeploy for changes to take effect

## Security Features

### No Third-Party Scripts
- ✓ No Google Analytics trackers
- ✓ No Facebook Pixel
- ✓ No third-party marketing tools
- ✓ No external ad networks
- ✓ Complete first-party data handling

### Data Protection
- Row-Level Security (RLS) enabled on all tables
- Email addresses validated before storage
- No sensitive data in localStorage
- HTTPS-only communication

### Clean Code
- No console.log debugging in production
- No exposed API keys in client code
- Proper error handling
- CORS-safe API calls

## Managing Events

### Adding Events via Supabase

1. Log in to your Supabase dashboard
2. Go to the `events` table
3. Insert new events:
   ```json
   {
     "title": "Event Name",
     "date": "MONTH DAY, YEAR",
     "location": "City, State",
     "city": "CITY",
     "description": "Event description",
     "image_url": "https://...",
     "ticket_url": "#register-eventname"
   }
   ```

### Viewing Registrations

1. Log in to Supabase dashboard
2. View the `registrations` table
3. Export data as CSV for mailing lists or analysis

## API Integration Points

### Event Retrieval
The application fetches events from Supabase on page load:
```typescript
const { data } = await supabase
  .from('events')
  .select('*')
  .order('date', { ascending: true });
```

### Registration Submission
User registrations are saved directly to Supabase:
```typescript
const { error } = await supabase
  .from('registrations')
  .insert([registrationData]);
```

## Performance Optimizations

- Vite bundling for optimal asset sizes
- Tailwind CSS with PurgeCSS for minimal CSS
- Lazy image loading
- Smooth scroll behavior
- Responsive images with Pexels CDN

## Troubleshooting

### Events Not Loading
- Check Supabase connection in browser console
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Ensure the `events` table exists and has data

### Registration Errors
- Check Supabase RLS policies
- Verify form validation errors in console
- Check network tab for API errors

### Styling Issues
- Run `npm run build` to rebuild CSS
- Clear browser cache
- Check Tailwind configuration

## Maintenance

### Regular Tasks
- Monitor registration submissions in Supabase
- Update event information as needed
- Check for any console errors in production
- Backup registration data regularly

### Scaling
When scaling to multiple cities:
1. Add new events to the database
2. UI automatically adjusts
3. Each event gets its own registration flow
4. No code changes required

## Support

For issues or questions:
1. Check the Supabase dashboard for data issues
2. Review browser console for errors
3. Verify environment variables are correctly set
4. Contact your development team

## Next Steps

1. **Customize Content**: Update event details, descriptions, and images
2. **Add Contact Form**: Implement backend email handling
3. **Analytics**: Add privacy-respecting analytics if needed
4. **Payment Integration**: Add Stripe for ticket purchases
5. **Social Media**: Add social sharing functionality

---

Built with React, TypeScript, Tailwind CSS, and Supabase.
Deployed on Vercel at getondeets.ai.

## TokenEx Integration Note

For TokenEx iframe integration to work properly, you need to request whitelisting for your domain:
- **Domain to whitelist**: `https://www.getondeets.ai` and `https://getondeets.ai`
- Contact TokenEx support to add these origins to your approved list
- This is required for the payment iframe to load and function correctly
