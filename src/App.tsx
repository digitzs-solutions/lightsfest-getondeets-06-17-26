import { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, MapPin, X, Lock, Mail, Phone, Loader2, Check, AlertCircle, Music, Users, Heart, ExternalLink, Star, ChevronRight, ChevronDown, Minus, Plus, Shield, Leaf, Clock, Utensils, Camera, Menu } from 'lucide-react';
import ChatValet from './components/ChatValet';

// PayVia Hosted Checkout - matches @digitzs/payvia SDK constants
const PAYVIA_CHECKOUT_URLS: Record<string, string> = {
  staging: 'https://checkout.staging.digitzs.com',
  production: 'https://checkout.digitzs.com',
};

const PAYVIA_ALLOWED_ORIGINS = [
  'https://checkout.staging.digitzs.com',
  'https://checkout.digitzs.com',
];

const PAYVIA_ENVIRONMENT = import.meta.env.VITE_PAYVIA_ENVIRONMENT || 'production';
const PAYVIA_MERCHANT_ID = import.meta.env.VITE_PAYVIA_MERCHANT_ID || '';

interface EventItem {
  id: string;
  title: string;
  city: string;
  state: string;
  date: string;
  dateLabel: string;
  venue: string;
  price: number;
  image: string;
  registrationUrl: string;
  ticketSocketEventId?: string;
  status?: 'available' | 'sold-out';
}

interface TicketType {
  id: number;
  name: string;
  price: number;
  available: boolean;
}

interface TokenCreatedData {
  token: string;
  amount: number;
  invoice: string;
  merchantId: string;
  tokenData?: {
    firstSix: string;
    lastFour: string;
    token: string;
    referenceNumber: string;
    tokenHMAC: string;
    cvvIncluded: boolean;
    cardType: string;
  };
  paymentMethod?: string;
  form: {
    firstName?: string;
    lastName?: string;
    email?: string;
    cardHolderName?: string;
    expiry?: string;
    zipCode?: string;
  };
}

const EVENTS: EventItem[] = [
  {
    id: 'austin-jul',
    title: 'The Lights Fest',
    city: 'Austin',
    state: 'TX',
    date: '2026-07-19',
    dateLabel: 'July 19, 2026',
    venue: 'Circuit of The Americas',
    price: 1.00,
    image: 'https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg?auto=compress&cs=tinysrgb&w=800',
    registrationUrl: 'https://clevergroup.tscheckout.com/e/clevergroup/the-lights-fest-austin',
    status: 'available',
  },
  {
    id: 'denver-aug',
    title: 'The Lights Fest',
    city: 'Denver',
    state: 'CO',
    date: '2026-08-16',
    dateLabel: 'August 16, 2026',
    venue: 'Bandimere Speedway',
    price: 1.00,
    image: 'https://images.pexels.com/photos/1114690/pexels-photo-1114690.jpeg?auto=compress&cs=tinysrgb&w=800',
    registrationUrl: 'https://clevergroup.tscheckout.com/e/clevergroup/the-lights-fest-denver',
    status: 'available',
  },
  {
    id: 'nashville-sep',
    title: 'The Lights Fest',
    city: 'Nashville',
    state: 'TN',
    date: '2026-09-20',
    dateLabel: 'September 20, 2026',
    venue: 'Nashville Superspeedway',
    price: 1.00,
    image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800',
    registrationUrl: 'https://clevergroup.tscheckout.com/e/clevergroup/the-lights-fest-nashville',
    status: 'available',
  },
  {
    id: 'phoenix-oct',
    title: 'The Lights Fest',
    city: 'Phoenix',
    state: 'AZ',
    date: '2026-10-18',
    dateLabel: 'October 18, 2026',
    venue: 'Wild Horse Pass Motorsports Park',
    price: 1.00,
    image: 'https://images.pexels.com/photos/1387577/pexels-photo-1387577.jpeg?auto=compress&cs=tinysrgb&w=800',
    registrationUrl: 'https://clevergroup.tscheckout.com/e/clevergroup/the-lights-fest-phoenix',
    status: 'available',
  },
];

export default function App() {
  const [checkoutEvent, setCheckoutEvent] = useState<EventItem | null>(null);

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased overflow-x-hidden">
      <Header />
      <Hero />
      <EventsSection onBuyTicket={setCheckoutEvent} />
      <SafetySection />
      <EventDaySection />
      <GallerySection />
      <AboutSection />
      <ReviewsSection />
      <FAQSection />
      <Footer />
      <ChatValet />

      {checkoutEvent && (
        <CheckoutModal
          event={checkoutEvent}
          onClose={() => setCheckoutEvent(null)}
        />
      )}
    </div>
  );
}

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [involvedOpen, setInvolvedOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#' },
    { label: 'Events', href: '#events' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' },
  ];

  const involvedLinks = [
    { label: 'Volunteers', href: 'https://thelightsfest.com/volunteers/' },
    { label: 'Charities', href: 'https://thelightsfest.com/charities/' },
    { label: 'Sponsors', href: 'https://thelightsfest.com/sponsors/' },
    { label: 'Affiliate', href: 'https://thelightsfest.com/affiliate/' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-sm border-b border-slate-100/60'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5">
          <Sparkles className={`w-5 h-5 transition-colors duration-300 ${scrolled ? 'text-amber-500' : 'text-amber-300'}`} />
          <span className={`text-sm font-bold tracking-wider uppercase transition-colors duration-300 ${scrolled ? 'text-slate-900' : 'text-white'}`}>
            The Lights Fest
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`text-xs font-medium tracking-wide uppercase transition-colors duration-300 hover:opacity-100 ${
                scrolled ? 'text-slate-500 hover:text-slate-900' : 'text-white/70 hover:text-white'
              }`}
            >
              {link.label}
            </a>
          ))}

          <div className="relative">
            <button
              onClick={() => setInvolvedOpen(!involvedOpen)}
              onBlur={() => setTimeout(() => setInvolvedOpen(false), 150)}
              className={`flex items-center gap-1 text-xs font-medium tracking-wide uppercase transition-colors duration-300 hover:opacity-100 ${
                scrolled ? 'text-slate-500 hover:text-slate-900' : 'text-white/70 hover:text-white'
              }`}
            >
              Get Involved
              <ChevronDown className="w-3 h-3" />
            </button>
            {involvedOpen && (
              <div className="absolute top-8 left-0 bg-white rounded-xl shadow-xl border border-slate-100 py-2 w-44 animate-fadeIn">
                {involvedLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-xs text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <a
            href="https://shop.thelightsfest.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`text-xs font-medium tracking-wide uppercase transition-colors duration-300 hover:opacity-100 ${
              scrolled ? 'text-slate-500 hover:text-slate-900' : 'text-white/70 hover:text-white'
            }`}
          >
            Store
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#events"
            className={`hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold transition-all duration-300 ${
              scrolled
                ? 'bg-amber-500 text-white shadow-sm hover:bg-amber-600'
                : 'bg-white/15 text-white border border-white/25 hover:bg-white/25'
            }`}
          >
            Get Tickets
          </a>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white/80 hover:bg-white/10'}`}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 shadow-lg animate-fadeIn">
          <div className="px-5 py-4 space-y-3">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-slate-700 py-1.5">
                {link.label}
              </a>
            ))}
            <div className="border-t border-slate-100 pt-3 mt-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Get Involved</p>
              {involvedLinks.map((link) => (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="block text-sm text-slate-600 py-1.5">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Thousands of sky lanterns rising into the night sky at The Lights Fest"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
      </div>

      <div className="lantern-field absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="lantern"
            style={{
              left: `${3 + (i * 5.5) % 92}%`,
              animationDelay: `${(i * 1.4) % 14}s`,
              animationDuration: `${12 + (i % 6) * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" style={{ top: '75%' }} />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 mb-8">
          <Heart className="w-3 h-3 text-amber-300" />
          <span className="text-[11px] font-medium text-white/80 tracking-wide uppercase">A Family Experience Since 2014</span>
        </div>

        <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-extralight text-white leading-[1.05] tracking-tight mb-6">
          Until the
          <br />
          <span className="font-semibold bg-gradient-to-r from-amber-200 via-yellow-100 to-orange-200 bg-clip-text text-transparent">
            next light.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-white/60 max-w-xl mx-auto leading-relaxed font-light mb-10">
          Bringing families together under glowing skies. Write your wishes, light your lantern, and watch thousands rise together in a breathtaking moment you'll never forget.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#events"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-amber-500 text-white font-semibold text-sm tracking-wide hover:bg-amber-600 transition-all shadow-[0_8px_30px_rgba(245,158,11,0.35)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.45)] active:scale-[0.97]"
          >
            View Events
            <ChevronRight className="w-4 h-4" />
          </a>
          <a
            href="#about"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all"
          >
            Learn More
          </a>
        </div>

        <div className="mt-14 flex items-center justify-center gap-8 text-white/40">
          <div className="text-center">
            <div className="text-2xl font-bold text-white/80">1M+</div>
            <div className="text-[10px] uppercase tracking-wider">Guests</div>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white/80">50+</div>
            <div className="text-[10px] uppercase tracking-wider">Cities</div>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white/80">All Ages</div>
            <div className="text-[10px] uppercase tracking-wider">Welcome</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EventsSection({ onBuyTicket }: { onBuyTicket: (e: EventItem) => void }) {
  const [events, setEvents] = useState<EventItem[]>(EVENTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/ticketsocket-proxy?action=events');
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const liveEvents: EventItem[] = data.data.map((ev: any) => ({
            id: `ts-${ev.id}`,
            title: ev.name || 'The Lights Fest',
            city: ev.venue?.city || ev.city || '',
            state: ev.venue?.state || ev.state || '',
            date: ev.start || ev.startDate || '',
            dateLabel: ev.start ? new Date(ev.start).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '',
            venue: ev.venue?.name || ev.venueName || '',
            price: ev.minPrice || ev.price || 1.00,
            image: ev.imageUrl || ev.image || 'https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg?auto=compress&cs=tinysrgb&w=800',
            registrationUrl: ev.url || '',
            ticketSocketEventId: String(ev.id),
            status: 'available' as const,
          }));
          setEvents(liveEvents);
        }
      } catch {
        // keep hardcoded fallback
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    <section id="events" className="py-24 px-5 sm:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-600 mb-3">The Lights Fest</h2>
          <h3 className="text-3xl sm:text-4xl font-light text-slate-900 tracking-tight mb-3">
            Sky Lantern Festivals
          </h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Choose your city below. Each event includes a lantern kit, live music, food vendors, and the synchronized release.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-0 border border-slate-100 rounded-2xl overflow-hidden">
            {events.map((event, idx) => (
              <div
                key={event.id}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 sm:px-8 py-6 hover:bg-amber-50/40 transition-colors group ${
                  idx < events.length - 1 ? 'border-b border-slate-100' : ''
                }`}
              >
                <div className="flex-1 mb-3 sm:mb-0">
                  <div className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider mb-1">
                    {event.dateLabel}
                  </div>
                  <h4 className="text-xl sm:text-2xl font-semibold text-slate-900 group-hover:text-amber-700 transition-colors">
                    {event.city}, {event.state}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                    <MapPin className="w-3 h-3" />
                    {event.venue}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-700">${event.price.toFixed(2)}</span>
                  {event.status === 'sold-out' ? (
                    <span className="px-4 py-2.5 rounded-full bg-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wide">
                      Sold Out
                    </span>
                  ) : (
                    <button
                      onClick={() => onBuyTicket(event)}
                      className="px-5 py-2.5 rounded-full bg-amber-500 text-white text-xs font-semibold uppercase tracking-wide hover:bg-amber-600 transition-all shadow-sm hover:shadow-md active:scale-[0.97]"
                    >
                      Register Now
                    </button>
                  )}
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-200 transition-colors"
                    title="View on TicketSocket"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-[11px] text-slate-400 mt-6">
          Prices are limited and increase as tickets sell. Reserve early for the best rate.
        </p>
      </div>
    </section>
  );
}

function SafetySection() {
  const pillars = [
    {
      icon: Shield,
      title: 'Family Safe',
      items: [
        'All-ages event for the whole family',
        'Certified fire professionals on-site',
        'Ample security at every event',
        'No alcohol permitted',
      ],
    },
    {
      icon: Leaf,
      title: '100% Biodegradable',
      items: [
        'Rice paper, string, and bamboo only',
        'No metal wire in our lanterns',
        '24-hour cleanup crew after each event',
        'Reduced flight time for safer landings',
      ],
    },
    {
      icon: Heart,
      title: 'Giving Back',
      items: [
        'Local charity partnerships every city',
        'Community volunteer opportunities',
        'Portion of proceeds support causes',
        'Building connections since 2014',
      ],
    },
  ];

  return (
    <section className="py-24 px-5 sm:px-8 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-light text-slate-900 tracking-tight mb-3">Safety is our cornerstone</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Perfect safety record across dozens of events in multiple countries. We bring certified fire professionals and custom-designed lanterns to every city.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map(({ icon: Icon, title, items }) => (
            <div key={title} className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-5">
                <Icon className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-4">{title}</h3>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-500">
                    <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EventDaySection() {
  const timeline = [
    { time: '5:30 PM', icon: Clock, title: 'Gates Open', description: 'Arrive early to explore vendors, grab food, and find your spot.' },
    { time: '6:00 PM', icon: Music, title: 'Live Music Begins', description: 'DJ and acoustic performances set the mood as the sun starts to set.' },
    { time: '7:00 PM', icon: Sparkles, title: 'Lantern Decorating', description: 'Write messages of hope, wishes, or memories on your lantern with markers.' },
    { time: '8:30 PM', icon: Utensils, title: 'Last Call for Food', description: 'Enjoy food trucks offering a variety of cuisines before the big moment.' },
    { time: '8:45 PM', icon: Star, title: 'The Lantern Release', description: 'The synchronized release. Thousands of lanterns rise together at nightfall.' },
  ];

  return (
    <section id="event-day" className="py-24 px-5 sm:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-light text-slate-900 tracking-tight mb-3">Your event day</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Gates open a couple hours before sunset. Here's what to expect at a typical Lights Fest evening.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-amber-100 hidden sm:block" />

          <div className="space-y-8">
            {timeline.map(({ time, icon: Icon, title, description }) => (
              <div key={title} className="flex gap-5 sm:gap-8 items-start">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <div className="pt-1">
                  <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-1">{time}</div>
                  <h4 className="text-base font-semibold text-slate-900 mb-1">{title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 bg-amber-50 rounded-2xl p-6 border border-amber-100">
          <h4 className="text-sm font-semibold text-slate-800 mb-2">What to bring</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            Blankets or camping chairs, comfortable shoes, and your camera. Outside food is typically allowed (varies by venue). Your Participant Packet with full details will be emailed one week before your event.
          </p>
        </div>
      </div>
    </section>
  );
}

function GallerySection() {
  const images = [
    { src: 'https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Thousands of lanterns rising into the night sky' },
    { src: 'https://images.pexels.com/photos/1387577/pexels-photo-1387577.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Family watching lanterns together' },
    { src: 'https://images.pexels.com/photos/1114690/pexels-photo-1114690.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Live music performance at the festival' },
    { src: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Festival crowd enjoying the night' },
    { src: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Lanterns floating peacefully above the crowd' },
    { src: 'https://images.pexels.com/photos/3560168/pexels-photo-3560168.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Decorating lanterns with heartfelt messages' },
  ];

  return (
    <section id="gallery" className="py-24 px-5 sm:px-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-slate-900 tracking-tight mb-3">Moments to remember</h2>
          <p className="text-slate-400 text-sm">Every event creates memories that last a lifetime</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((img, i) => (
            <div
              key={i}
              className={`relative overflow-hidden rounded-xl ${i === 0 ? 'md:row-span-2' : ''} group`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${i === 0 ? 'h-full min-h-[300px]' : 'h-48 md:h-56'}`}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
                <div className="p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="w-4 h-4 text-white/80" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="py-24 px-5 sm:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-light text-slate-900 tracking-tight mb-5">More than a festival</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-5">
              The Lights Fest is where dreams take flight and create a spectacle that will leave you breathless. Since 2014, over one million families and friends have shared in the magic of releasing lanterns into the night sky together.
            </p>
            <p className="text-slate-500 text-sm leading-relaxed mb-5">
              Whether you're seeking a romantic escapade, a joyful celebration, or a serene moment of reflection, our sky lantern event promises an unforgettable experience for all ages.
            </p>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              In this shared celebration, you'll find a sense of unity and belonging. Embrace the warmth of human connection as you share stories, laughter, and heartfelt moments with fellow sky gazers.
            </p>
            <div className="grid grid-cols-3 gap-6">
              {[
                { icon: Users, label: 'Family-Friendly', value: 'All Ages' },
                { icon: Music, label: 'Entertainment', value: 'Live Music' },
                { icon: Heart, label: 'Creating Memories', value: 'Since 2014' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</div>
                  <div className="text-xs font-semibold text-slate-700 mt-0.5">{value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Families watching lanterns float into the night sky together"
              className="rounded-2xl shadow-2xl w-full"
              loading="lazy"
            />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-amber-100 rounded-2xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewsSection() {
  const reviews = [
    { name: 'Sarah M.', city: 'Austin, TX', text: 'Brought grandma, parents, and kids. The moment everyone released their lanterns together... it was the most beautiful thing we have ever experienced as a family.' },
    { name: 'The Garcia Family', city: 'Denver, CO', text: 'Our kids decorated their lanterns with wishes for the new year. Watching their faces light up as thousands of lanterns rose was absolutely priceless.' },
    { name: 'Priya & James', city: 'Nashville, TN', text: 'We came for date night and brought our 4-year-old. She still talks about "the night the sky was full of stars we made." Unforgettable.' },
  ];

  return (
    <section className="py-24 px-5 sm:px-8 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-slate-900 tracking-tight mb-3">What families are saying</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.name} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">"{r.text}"</p>
              <div className="text-xs font-semibold text-slate-800">{r.name}</div>
              <div className="text-[10px] text-slate-400">{r.city}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: 'Is this event appropriate for all ages?', a: 'Absolutely! The Lights Fest is for all ages. There is nothing like seeing the amazement in a child\'s eyes as they gaze up at this magical sight. There is ample security at each event, no alcohol is permitted, and it\'s designed to be a positive, uplifting experience for the whole family.' },
    { q: 'What is included with my ticket?', a: 'Each adult ticket includes entry to the event, one lantern kit with markers for decorating, access to live music performances, food vendors, and the synchronized lantern release. Kids tickets (ages 4-12) include a Fun Kit. Children 3 and under are free.' },
    { q: 'Are the lanterns safe and eco-friendly?', a: 'Yes! Our lanterns are made from 100% biodegradable rice paper, string, and bamboo. There is no metal wire. The rice-paper body is fire-resistant. We hire certified fire professionals at every event and maintain a perfect safety record across dozens of events.' },
    { q: 'What time should we arrive?', a: 'Gates open 2-3 hours before sunset. We recommend arriving early to enjoy the live music, food trucks, and lantern decorating stations. The synchronized release takes place at nightfall (approximately 8:45 PM, depending on sunset).' },
    { q: 'What if the weather is bad?', a: 'Event dates are subject to change due to weather. If a Friday/Saturday event is cancelled, the first backup is Sunday of the same weekend. If a make-up date is not scheduled within 90 days, full refunds are offered. Your tickets remain valid for the rescheduled date.' },
    { q: 'Can I get a refund or transfer my tickets?', a: 'Tickets are transferable to another person or location by emailing info@thelightsfest.com. As stated at purchase, tickets are non-refundable unless the event is cancelled. If you purchased the optional Refund Protection Plan, you can submit a refund request.' },
  ];

  return (
    <section id="faq" className="py-24 px-5 sm:px-8 bg-white">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-slate-900 tracking-tight mb-3">Frequently asked questions</h2>
          <p className="text-slate-400 text-sm">Everything you need to know before your event</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-medium text-slate-800 pr-4">{faq.q}</span>
                <ChevronRight className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${open === i ? 'rotate-90' : ''}`} />
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-sm text-slate-500 leading-relaxed">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="contact" className="bg-slate-900 py-16 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-bold text-white tracking-wider uppercase">The Lights Fest</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Creating magical moments that connect people and light up the world, one city at a time. A family experience since 2014.
            </p>
            <p className="text-xs text-slate-500">
              Produced by Viive Events
            </p>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-4">Events</h4>
            <div className="space-y-2.5">
              {EVENTS.map((e) => (
                <a key={e.id} href={e.registrationUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-slate-400 hover:text-amber-400 transition-colors">
                  {e.city}, {e.state} &middot; {e.dateLabel}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-4">Get Involved</h4>
            <div className="space-y-2.5">
              <a href="https://thelightsfest.com/volunteers/" target="_blank" rel="noopener noreferrer" className="block text-xs text-slate-400 hover:text-amber-400 transition-colors">Volunteers</a>
              <a href="https://thelightsfest.com/charities/" target="_blank" rel="noopener noreferrer" className="block text-xs text-slate-400 hover:text-amber-400 transition-colors">Charities</a>
              <a href="https://thelightsfest.com/sponsors/" target="_blank" rel="noopener noreferrer" className="block text-xs text-slate-400 hover:text-amber-400 transition-colors">Sponsors / Exhibitors</a>
              <a href="https://thelightsfest.com/affiliate/" target="_blank" rel="noopener noreferrer" className="block text-xs text-slate-400 hover:text-amber-400 transition-colors">Affiliate</a>
              <a href="https://thelightsfest.com/food/" target="_blank" rel="noopener noreferrer" className="block text-xs text-slate-400 hover:text-amber-400 transition-colors">Food Vendors</a>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-4">Quick Links</h4>
            <div className="space-y-2.5">
              <a href="#faq" className="block text-xs text-slate-400 hover:text-amber-400 transition-colors">FAQ</a>
              <a href="https://thelightsfest.com/contact/" target="_blank" rel="noopener noreferrer" className="block text-xs text-slate-400 hover:text-amber-400 transition-colors">Contact</a>
              <a href="https://shop.thelightsfest.com" target="_blank" rel="noopener noreferrer" className="block text-xs text-slate-400 hover:text-amber-400 transition-colors">Store</a>
              <a href="https://thelightsfest.com/privacy-policy/" target="_blank" rel="noopener noreferrer" className="block text-xs text-slate-400 hover:text-amber-400 transition-colors">Privacy Policy</a>
              <a href="https://thelightsfest.com" target="_blank" rel="noopener noreferrer" className="block text-xs text-slate-400 hover:text-amber-400 transition-colors">Official Site</a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} The Lights Fest. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
              <Lock className="w-3 h-3" />
              PCI DSS 4.0 Level 1
            </div>
            <span className="text-[10px] text-slate-700">Powered by GetOnDeets.ai</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECKOUT MODAL - PayVia + TicketSocket (unchanged payment logic)
// ─────────────────────────────────────────────────────────────────────────────

type CheckoutStep = 'tickets' | 'contact' | 'payment' | 'processing' | 'success' | 'error';

function CheckoutModal({ event, onClose }: { event: EventItem; onClose: () => void }) {
  const [step, setStep] = useState<CheckoutStep>('tickets');
  const [quantity, setQuantity] = useState(1);
  const [ticketTypeId, setTicketTypeId] = useState(1);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    { id: 1, name: 'General Admission', price: event.price, available: true },
  ]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const [iframeReady, setIframeReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const configSentRef = useRef(false);
  const tokenProcessedRef = useRef(false);

  const selectedTicketType = ticketTypes.find(t => t.id === ticketTypeId) || ticketTypes[0];
  const totalAmount = (selectedTicketType?.price || event.price) * quantity;

  useEffect(() => {
    async function fetchTicketTypes() {
      try {
        const res = await fetch(`/api/ticketsocket-proxy?action=ticket-types&eventId=${event.ticketSocketEventId || ''}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setTicketTypes(data.data.map((t: any) => ({
            id: t.id,
            name: t.name || 'General Admission',
            price: t.price || event.price,
            available: t.available !== false,
          })));
          setTicketTypeId(data.data[0].id);
        }
      } catch {
        // keep default ticket types
      } finally {
        setLoadingTickets(false);
      }
    }
    fetchTicketTypes();
  }, [event]);

  useEffect(() => {
    if (step !== 'payment') return;

    const checkoutUrl = PAYVIA_CHECKOUT_URLS[PAYVIA_ENVIRONMENT];

    function sendCheckoutConfig() {
      if (!iframeRef.current?.contentWindow || configSentRef.current) return;

      const invoiceNumber = `LF-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'digitzs:init-checkout',
          config: {
            amount: totalAmount,
            merchantId: PAYVIA_MERCHANT_ID,
            email,
            cardHolderName: `${firstName} ${lastName}`,
            invoice: invoiceNumber,
            isZipCodeEnabled: true,
            isEmailEnabled: false,
            defaultPaymentMethod: 'card',
            styles: {
              backgroundColor: 'transparent',
              buttonColor: '#f59e0b',
              buttonTextColor: '#ffffff',
              inputBorderColor: '#e2e8f0',
              borderRadius: '12px',
              fontSize: '14px',
            },
          },
        },
        checkoutUrl
      );
      configSentRef.current = true;
    }

    function handleMessage(ev: MessageEvent) {
      if (!PAYVIA_ALLOWED_ORIGINS.includes(ev.origin)) return;

      const message = ev.data;
      switch (message.type) {
        case 'digitzs:ready':
          setIframeReady(true);
          setError('');
          sendCheckoutConfig();
          break;

        case 'digitzs:token-created':
          if (tokenProcessedRef.current) return;
          tokenProcessedRef.current = true;
          processPayment(message.data);
          break;

        case 'digitzs:error':
          setError(message.error?.message || 'Payment error occurred');
          break;

        case 'digitzs:resize':
          if (iframeRef.current && message.height > 0) {
            iframeRef.current.style.height = `${message.height}px`;
          }
          break;

        case 'digitzs:validation-error':
          break;
      }
    }

    window.addEventListener('message', handleMessage);

    const iframeTimeout = setTimeout(() => {
      if (!configSentRef.current) {
        setIframeReady(true);
        setError(
          'Payment form could not load. This site must be served from a TokenEx-whitelisted domain (getondeets.ai). ' +
          'Deploy to your production domain or contact TokenEx to whitelist additional origins.'
        );
      }
    }, 10000);

    return () => {
      clearTimeout(iframeTimeout);
      window.removeEventListener('message', handleMessage);
      configSentRef.current = false;
      tokenProcessedRef.current = false;
    };
  }, [step, totalAmount, email, firstName, lastName]);

  const handleTicketsSubmit = () => {
    if (quantity < 1) {
      setError('Select at least 1 ticket');
      return;
    }
    setError('');
    setStep('contact');
  };

  const handleContactSubmit = () => {
    if (!email || !firstName || !lastName) {
      setError('Please fill in all required fields');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }
    setError('');
    setStep('payment');
  };

  const processPayment = useCallback(async (tokenData: TokenCreatedData) => {
    setStep('processing');
    setError('');
    try {
      const res = await fetch('/api/payvia-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tokenData.token,
          amount: totalAmount,
          orderId: tokenData.invoice,
          expiry: tokenData.form.expiry || '12/99',
          cardholderName: tokenData.form.cardHolderName || `${firstName} ${lastName}`,
          customerInfo: {
            firstName,
            lastName,
            email,
            billingAddress: {
              address1: 'Not Provided',
              city: event.city,
              state: event.state,
              zip: tokenData.form.zipCode || '00000',
              country: 'US',
            },
          },
        }),
      });
      const result = await res.json();
      if (!res.ok || result.success === false) {
        throw new Error(result.error || 'Payment failed');
      }

      const paymentRef = result.transactionId || tokenData.invoice;
      setTransactionId(result.transactionId || '');

      const orderRes = await fetch('/api/ticketsocket-proxy?action=create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          ticketQuantity: quantity,
          ticketTypeId,
        }),
      });
      const orderResult = await orderRes.json();

      if (!orderRes.ok || !orderResult.success || !orderResult.data?.orderId) {
        console.error('[Checkout] TicketSocket order creation failed:', orderResult);
        setOrderId(paymentRef);
        setError(
          `Your payment went through (reference: ${paymentRef}), but we couldn't ` +
          `finalize your ticket order. Please contact support with this reference ` +
          `and we'll issue your tickets.`
        );
        setStep('error');
        return;
      }

      setOrderId(String(orderResult.data.orderId));
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setStep('error');
    }
  }, [totalAmount, firstName, lastName, email, event, quantity, ticketTypeId]);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget && step !== 'processing') onClose(); }}
    >
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-slideUp overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span className="text-sm font-semibold text-slate-800">
              {step === 'success' ? 'Confirmed' : 'Secure Checkout'}
            </span>
          </div>
          {step !== 'processing' && (
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        {step !== 'success' && step !== 'error' && (
          <div className="px-6 pt-4">
            <div className="flex items-center gap-1">
              {(['tickets', 'contact', 'payment'] as const).map((s, i) => (
                <div key={s} className="flex-1 flex items-center gap-1">
                  <div className={`h-1 flex-1 rounded-full transition-colors ${
                    ['tickets', 'contact', 'payment', 'processing'].indexOf(step) >= i
                      ? 'bg-amber-400'
                      : 'bg-slate-100'
                  }`} />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1.5 text-[10px] text-slate-400">
              <span>Tickets</span>
              <span>Contact</span>
              <span>Payment</span>
            </div>
          </div>
        )}

        <div className="p-6">
          {step !== 'success' && (
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div>
                <div className="text-sm font-medium text-slate-800">{event.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{event.city}, {event.state} &middot; {event.dateLabel}</div>
              </div>
              {step !== 'tickets' && (
                <div className="text-xl font-bold text-slate-900">${totalAmount.toFixed(2)}</div>
              )}
            </div>
          )}

          {error && step !== 'success' && (
            <div className="flex items-center gap-2.5 p-3 mb-5 rounded-xl bg-red-50 border border-red-100">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {step === 'tickets' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">Ticket Type</label>
                {loadingTickets ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Loading ticket types...
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ticketTypes.filter(t => t.available).map((tt) => (
                      <button
                        key={tt.id}
                        onClick={() => setTicketTypeId(tt.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                          ticketTypeId === tt.id
                            ? 'border-amber-300 bg-amber-50/50 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-sm font-medium text-slate-700">{tt.name}</span>
                        <span className="text-sm font-bold text-slate-900">${tt.price.toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">Quantity</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-semibold text-slate-800 w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-sm text-slate-500">Total</span>
                <span className="text-xl font-bold text-slate-900">${totalAmount.toFixed(2)}</span>
              </div>

              <button
                onClick={handleTicketsSubmit}
                className="w-full py-3.5 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-all shadow-[0_4px_14px_rgba(245,158,11,0.3)] active:scale-[0.98]"
              >
                Continue
              </button>
            </div>
          )}

          {step === 'contact' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">First Name *</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-50 transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Last Name *</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Smith" className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-50 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-50 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-50 transition-all" />
                </div>
              </div>

              <button onClick={handleContactSubmit} className="w-full py-3.5 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-all shadow-[0_4px_14px_rgba(245,158,11,0.3)] active:scale-[0.98] mt-2">
                Continue to Payment
              </button>
              <button
                onClick={() => { setStep('tickets'); setError(''); }}
                className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:border-slate-300 transition-all"
              >
                Back
              </button>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white">
                {!iframeReady && !error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                      <span className="text-xs text-slate-400">Loading secure payment form...</span>
                    </div>
                  </div>
                )}
                <iframe
                  ref={iframeRef}
                  src={PAYVIA_CHECKOUT_URLS[PAYVIA_ENVIRONMENT]}
                  title="PayVia Secure Checkout"
                  className="w-full border-0"
                  style={{ height: '480px', minHeight: '400px' }}
                  allow="payment"
                />
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                <Lock className="w-2.5 h-2.5" />
                PCI DSS 4.0 Level 1 &middot; PayVia Secured &middot; Card data never touches our servers
              </div>
              <button
                onClick={() => { setStep('contact'); setError(''); setIframeReady(false); configSentRef.current = false; }}
                className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:border-slate-300 transition-all"
              >
                Back
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-10">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-4" />
              <h3 className="text-base font-semibold text-slate-800 mb-1">Processing payment...</h3>
              <p className="text-xs text-slate-400">Securing your tickets via PayVia</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <Check className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">You're in!</h3>
              <p className="text-xs text-slate-400 mb-6">Confirmation sent to <span className="font-medium text-slate-600">{email}</span></p>
              <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 mb-6 border border-slate-100">
                <div className="flex justify-between text-xs"><span className="text-slate-400">Order</span><span className="font-mono font-medium text-slate-700">{orderId}</span></div>
                {transactionId && <div className="flex justify-between text-xs"><span className="text-slate-400">Transaction</span><span className="font-mono font-medium text-slate-700">{transactionId}</span></div>}
                <div className="flex justify-between text-xs"><span className="text-slate-400">Event</span><span className="font-medium text-slate-700">{event.city}, {event.state}</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-400">Tickets</span><span className="font-medium text-slate-700">{quantity}x {selectedTicketType?.name}</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-400">Amount</span><span className="font-bold text-emerald-600">${totalAmount.toFixed(2)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-400">Gateway</span><span className="font-medium text-slate-700">PayVia (Digitzs)</span></div>
              </div>
              <button onClick={onClose} className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-all">Done</button>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <AlertCircle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Payment Failed</h3>
              <p className="text-xs text-red-600 mb-6">{error}</p>
              <button onClick={() => { setStep('payment'); setError(''); }} className="w-full py-3.5 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-all">Try Again</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
