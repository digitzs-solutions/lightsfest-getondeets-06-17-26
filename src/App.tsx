import { useState, useEffect, useCallback, useRef } from 'react';
import { Sparkles, MapPin, Calendar, X, Lock, Mail, Shield, Loader2, Check, AlertCircle, Music, Users, Heart, ExternalLink, Star, ChevronRight, CreditCard } from 'lucide-react';

const TOKENEX_IFRAME_SRC = 'https://htp.tokenex.com/iframe/iframe-v3.min.js';
const TOKENEX_ORIGIN = 'https://getondeets.ai';
const TOKENEX_SCHEME = 'sixFourAndToken';

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
    registrationUrl: 'https://clevergroup.tscheckout.com/e/anas/the-lights-fest-austin',
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
    registrationUrl: 'https://clevergroup.tscheckout.com/e/anas/the-lights-fest-denver',
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
    registrationUrl: 'https://clevergroup.tscheckout.com/e/anas/the-lights-fest-nashville',
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
    registrationUrl: 'https://clevergroup.tscheckout.com/e/anas/the-lights-fest-phoenix',
  },
];

export default function App() {
  const [checkoutEvent, setCheckoutEvent] = useState<EventItem | null>(null);

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased overflow-x-hidden">
      <Header />
      <Hero />
      <EventsSection onBuyTicket={setCheckoutEvent} />
      <GallerySection />
      <AboutSection />
      <ReviewsSection />
      <FAQSection />
      <Footer />

      {checkoutEvent && (
        <LiveCheckoutModal
          event={checkoutEvent}
          onClose={() => setCheckoutEvent(null)}
        />
      )}
    </div>
  );
}

function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-sm border-b border-slate-100/60'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Sparkles className={`w-5 h-5 transition-colors duration-300 ${scrolled ? 'text-amber-500' : 'text-amber-300'}`} />
          <span className={`text-sm font-bold tracking-wider uppercase transition-colors duration-300 ${scrolled ? 'text-slate-900' : 'text-white'}`}>
            The Lights Fest
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {['Events', 'Gallery', 'About', 'FAQ'].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className={`text-xs font-medium tracking-wide uppercase transition-colors duration-300 hover:opacity-100 ${
                scrolled ? 'text-slate-500 hover:text-slate-900' : 'text-white/70 hover:text-white'
              }`}
            >
              {link}
            </a>
          ))}
        </nav>
        <a
          href="#events"
          className={`hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
            scrolled
              ? 'bg-amber-500 text-white shadow-sm hover:bg-amber-600'
              : 'bg-white/15 text-white border border-white/25 hover:bg-white/25'
          }`}
        >
          Get Tickets
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Sky lanterns rising into the night"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/30 to-slate-900/70" />
      </div>

      <div className="lantern-field absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="lantern"
            style={{
              left: `${5 + (i * 7) % 90}%`,
              animationDelay: `${(i * 1.7) % 12}s`,
              animationDuration: `${14 + (i % 5) * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" style={{ top: '70%' }} />

      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extralight text-white leading-[1.05] tracking-tight mb-6">
          Light the sky.
          <br />
          <span className="font-semibold bg-gradient-to-r from-amber-200 via-yellow-100 to-orange-200 bg-clip-text text-transparent">
            Make a wish.
          </span>
        </h1>
        <p className="text-base sm:text-lg text-white/60 max-w-lg mx-auto leading-relaxed font-light mb-10">
          Join thousands as we release sky lanterns together in a breathtaking moment of collective wonder.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#events"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-amber-500 text-white font-semibold text-sm tracking-wide hover:bg-amber-600 transition-all shadow-[0_8px_30px_rgba(245,158,11,0.35)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.45)] active:scale-[0.97]"
          >
            Find Your Event
            <ChevronRight className="w-4 h-4" />
          </a>
          <a
            href="#gallery"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all"
          >
            See the Magic
          </a>
        </div>
      </div>
    </section>
  );
}

function EventsSection({ onBuyTicket }: { onBuyTicket: (e: EventItem) => void }) {
  const [liveEvents, setLiveEvents] = useState<EventItem[]>(EVENTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/ticketsocket-proxy?action=events', {
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (data.success !== false && Array.isArray(data.data)) {
          const mapped = data.data.slice(0, 4).map((ev: any, i: number) => ({
            ...EVENTS[i],
            title: ev.title || EVENTS[i].title,
            venue: ev.venue || EVENTS[i].venue,
          }));
          if (mapped.length > 0) setLiveEvents(mapped);
        }
      } catch {
        // fallback to static events
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    <section id="events" className="py-24 px-5 sm:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-4">
            <Calendar className="w-3 h-3" />
            2026 Tour Dates
          </div>
          <h2 className="text-3xl sm:text-4xl font-light text-slate-900 tracking-tight mb-3">
            Choose your city
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Four unforgettable evenings across the country. Each event includes a lantern kit, live music, and food vendors.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {liveEvents.map((event) => (
            <div
              key={event.id}
              className="group bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-1"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={event.image}
                  alt={`${event.city} event`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-[10px] font-bold text-amber-600">
                  ${event.price.toFixed(2)}
                </div>
                <div className="absolute bottom-3 left-3">
                  <div className="text-white font-semibold text-sm">{event.city}, {event.state}</div>
                  <div className="text-white/70 text-[11px]">{event.dateLabel}</div>
                </div>
              </div>

              <div className="p-4">
                <div className="text-[11px] text-slate-400 mb-3 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  {event.venue}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onBuyTicket(event)}
                    className="flex-1 py-2.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-all active:scale-[0.97]"
                  >
                    Buy Now
                  </button>
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-200 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 mt-8 text-xs text-slate-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Loading events from TicketSocket...
          </div>
        )}
      </div>
    </section>
  );
}

function GallerySection() {
  const images = [
    'https://images.pexels.com/photos/1387577/pexels-photo-1387577.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1114690/pexels-photo-1114690.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/3560168/pexels-photo-3560168.jpeg?auto=compress&cs=tinysrgb&w=600',
  ];

  return (
    <section id="gallery" className="py-24 px-5 sm:px-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-slate-900 tracking-tight mb-3">Captured moments</h2>
          <p className="text-slate-400 text-sm">Every event is a once-in-a-lifetime experience</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((src, i) => (
            <div
              key={i}
              className={`relative overflow-hidden rounded-xl ${i === 0 ? 'md:row-span-2' : ''} group`}
            >
              <img
                src={src}
                alt="Festival moment"
                className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${i === 0 ? 'h-full min-h-[300px]' : 'h-48 md:h-56'}`}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
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
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              The Lights Fest is the world's largest sky lantern festival tour. Since 2014, over 1 million guests have shared in the magic of releasing lanterns into the night sky together.
            </p>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              Each event features live music, food trucks, lantern decorating stations, and the main event -- a synchronized lantern release that illuminates the sky with thousands of lights.
            </p>
            <div className="grid grid-cols-3 gap-6">
              {[
                { icon: Music, label: 'Live Music', value: 'DJ + Acoustic' },
                { icon: Users, label: 'Attendance', value: '5,000+ guests' },
                { icon: Heart, label: 'Experience', value: 'Since 2014' },
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
              alt="Lanterns floating into the night sky"
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
    { name: 'Sarah M.', city: 'Austin, TX', text: 'Absolutely magical. The moment everyone released their lanterns together... I still get chills thinking about it.', stars: 5 },
    { name: 'Jake R.', city: 'Denver, CO', text: 'Brought my family and we all loved it. The kids decorated their lanterns and the music was great. Unforgettable night.', stars: 5 },
    { name: 'Priya K.', city: 'Nashville, TN', text: 'Perfect date night. The food trucks were excellent and the main lantern release was the most beautiful thing I have ever seen.', stars: 5 },
  ];

  return (
    <section className="py-24 px-5 sm:px-8 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-slate-900 tracking-tight mb-3">What guests are saying</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.name} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: r.stars }).map((_, i) => (
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
    { q: 'What is included with my ticket?', a: 'Each ticket includes entry to the event, one lantern kit with markers for decorating, access to live music performances, and the synchronized lantern release experience.' },
    { q: 'Are the lanterns eco-friendly?', a: 'Yes! Our lanterns are made from 100% biodegradable rice paper and bamboo. The fuel cell is a small wax disc. We also organize post-event cleanup crews.' },
    { q: 'What time should I arrive?', a: 'Gates typically open 2-3 hours before the lantern release. We recommend arriving early to enjoy the music, food, and lantern decorating stations.' },
    { q: 'Can I get a refund?', a: 'We offer full refunds up to 7 days before the event, and 50% refunds within 7 days. No refunds on the day of the event. Contact us for transfers to other dates.' },
  ];

  return (
    <section id="faq" className="py-24 px-5 sm:px-8 bg-white">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-slate-900 tracking-tight mb-3">Common questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-medium text-slate-800">{faq.q}</span>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open === i ? 'rotate-90' : ''}`} />
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
    <footer className="bg-slate-900 py-16 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-bold text-white tracking-wider uppercase">The Lights Fest</span>
            </div>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              The world's largest touring sky lantern festival. Creating unforgettable shared experiences since 2014.
            </p>
          </div>
          <div className="flex gap-12">
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Events</div>
              <div className="space-y-2">
                {EVENTS.map((e) => (
                  <a key={e.id} href={e.registrationUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-slate-400 hover:text-amber-400 transition-colors">
                    {e.city}, {e.state} - {e.dateLabel}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Links</div>
              <div className="space-y-2">
                <a href="https://thelightsfest.com" target="_blank" rel="noopener noreferrer" className="block text-xs text-slate-400 hover:text-amber-400 transition-colors">Official Site</a>
                <a href="#faq" className="block text-xs text-slate-400 hover:text-amber-400 transition-colors">FAQ</a>
                <a href="#about" className="block text-xs text-slate-400 hover:text-amber-400 transition-colors">About</a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} The Lights Festival LLC. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-[10px] text-slate-600">
            <Shield className="w-3 h-3" />
            PCI DSS Level 1 Compliant
          </div>
        </div>
      </div>
    </footer>
  );
}

type CheckoutStep = 'contact' | 'payment' | 'processing' | 'success' | 'error';

function LiveCheckoutModal({ event, onClose }: { event: EventItem; onClose: () => void }) {
  const [step, setStep] = useState<CheckoutStep>('contact');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [tokenExLoaded, setTokenExLoaded] = useState(false);
  const [tokenExReady, setTokenExReady] = useState(false);
  const iframeInstanceRef = useRef<any>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const cvvContainerRef = useRef<HTMLDivElement>(null);

  const handleContactSubmit = () => {
    if (!email || !firstName || !lastName) {
      setError('Please fill in all fields');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }
    setError('');
    setStep('payment');
  };

  useEffect(() => {
    if (step !== 'payment') return;

    let cancelled = false;
    let loadTimeout: ReturnType<typeof setTimeout>;

    async function initTokenEx() {
      if (!(window as any).TokenEx) {
        const script = document.createElement('script');
        script.src = TOKENEX_IFRAME_SRC;
        script.async = true;
        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load TokenEx'));
          document.head.appendChild(script);
        });
      }

      if (cancelled) return;
      setTokenExLoaded(true);

      const authRes = await fetch('/api/tokenex-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: TOKENEX_ORIGIN, tokenScheme: TOKENEX_SCHEME }),
      });
      const authData = await authRes.json();
      if (!authRes.ok || !authData.success) {
        setError('Failed to initialize secure payment. Please try again.');
        return;
      }

      if (cancelled) return;

      const TokenEx = (window as any).TokenEx;
      const iframe = new TokenEx.Iframe('tokenex-card-container', {
        pci: true,
        tokenExID: authData.tokenExID,
        tokenScheme: authData.tokenScheme,
        authenticationKey: authData.authenticationKey,
        timestamp: authData.timestamp,
        origin: TOKENEX_ORIGIN,
        styles: {
          base: 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 0 14px; color: #1e293b; font-size: 14px; line-height: 44px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;',
          focus: 'border-color: #fbbf24; box-shadow: 0 0 0 3px rgba(251,191,36,0.1); outline: none;',
          error: 'border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.1);',
        },
        cvv: true,
        cvvContainerID: 'tokenex-cvv-container',
        cvvPlaceholder: 'CVV',
        placeholder: '4111 1111 1111 1111',
      });

      loadTimeout = setTimeout(() => {
        if (!cancelled && !tokenExReady) {
          setError('Payment form timed out. Please refresh and try again.');
        }
      }, 10000);

      iframe.on('load', () => {
        if (!cancelled) {
          clearTimeout(loadTimeout);
          setTokenExReady(true);
        }
      });

      iframe.on('tokenize', (data: any) => {
        if (!cancelled) {
          processPayment(data.token, expiry, `${firstName} ${lastName}`);
        }
      });

      iframe.on('error', (data: any) => {
        if (!cancelled) setError(data.error || 'Card validation failed');
      });

      iframe.on('validate', (data: any) => {
        if (!data.isValid && data.isCvvValid === false) {
          setError('Please check your card details');
        }
      });

      iframe.load();
      iframeInstanceRef.current = iframe;
    }

    initTokenEx().catch((err) => {
      if (!cancelled) setError(err.message || 'Failed to load payment form');
    });

    return () => {
      cancelled = true;
      clearTimeout(loadTimeout);
      if (iframeInstanceRef.current) {
        try { iframeInstanceRef.current.remove(); } catch {}
        iframeInstanceRef.current = null;
      }
    };
  }, [step]);

  const handlePaySubmit = () => {
    if (!expiry || expiry.length < 4) {
      setError('Please enter a valid expiry date (MM/YY)');
      return;
    }
    setError('');
    if (iframeInstanceRef.current) {
      iframeInstanceRef.current.tokenize();
    } else {
      setError('Payment form not ready. Please wait or refresh.');
    }
  };

  const handleExpiryChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length <= 2) {
      setExpiry(cleaned);
    } else {
      setExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    }
  };

  const processPayment = useCallback(async (token: string, exp: string, cardholderName: string) => {
    setStep('processing');
    setError('');
    try {
      const newOrderId = `LF-${Date.now()}`;
      const res = await fetch('/api/payvia-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          amount: event.price,
          orderId: newOrderId,
          expiry: exp.replace('/', ''),
          cardholderName,
          customerInfo: {
            firstName,
            lastName,
            email,
            billingAddress: { address1: 'Not Provided', city: event.city, state: event.state, zip: '00000', country: 'US' },
          },
        }),
      });
      const result = await res.json();
      if (!res.ok || result.success === false) throw new Error(result.error || 'Payment failed');

      setOrderId(newOrderId);
      setTransactionId(result.transactionId || '');

      fetch('/api/ticketsocket-proxy?action=create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, lastName, ticketQuantity: 1, ticketTypeId: 1 }),
      }).catch(() => {});

      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setStep('error');
    }
  }, [event, firstName, lastName, email]);

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

        <div className="p-6">
          {step !== 'success' && (
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div>
                <div className="text-sm font-medium text-slate-800">{event.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{event.city}, {event.state} &middot; {event.dateLabel}</div>
              </div>
              <div className="text-xl font-bold text-slate-900">${event.price.toFixed(2)}</div>
            </div>
          )}

          {error && step !== 'success' && (
            <div className="flex items-center gap-2.5 p-3 mb-5 rounded-xl bg-red-50 border border-red-100">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {step === 'contact' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">First Name</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-50 transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Last Name</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Smith" className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-50 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-50 transition-all" />
                </div>
              </div>
              <button onClick={handleContactSubmit} className="w-full py-3.5 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-all shadow-[0_4px_14px_rgba(245,158,11,0.3)] active:scale-[0.98] mt-2">
                Continue to Payment
              </button>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                  <CreditCard className="w-3 h-3 inline mr-1" />
                  Card Number
                </label>
                <div
                  id="tokenex-card-container"
                  ref={cardContainerRef}
                  className="w-full h-[48px] rounded-xl overflow-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Expiry</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">CVV</label>
                  <div
                    id="tokenex-cvv-container"
                    ref={cvvContainerRef}
                    className="w-full h-[48px] rounded-xl overflow-hidden"
                  />
                </div>
              </div>

              {!tokenExReady && !error && (
                <div className="flex items-center justify-center gap-2 py-2 text-xs text-slate-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Loading secure payment fields...
                </div>
              )}

              <button
                onClick={handlePaySubmit}
                disabled={!tokenExReady}
                className="w-full py-3.5 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-all shadow-[0_4px_14px_rgba(245,158,11,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Pay ${event.price.toFixed(2)}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                <Lock className="w-2.5 h-2.5" />
                PCI DSS 4.0 Level 1 &middot; TokenEx Secured &middot; ProPay CleverGroup &middot; Live
              </div>
              <button
                onClick={() => { setStep('contact'); setError(''); }}
                className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:border-slate-300 transition-all"
              >
                Back
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-10">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-4" />
              <h3 className="text-base font-semibold text-slate-800 mb-1">Processing live transaction...</h3>
              <p className="text-xs text-slate-400">Charging via ProPay CleverGroup gateway</p>
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
                <div className="flex justify-between text-xs"><span className="text-slate-400">Amount</span><span className="font-bold text-emerald-600">${event.price.toFixed(2)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-400">Gateway</span><span className="font-medium text-slate-700">ProPay (CleverGroup)</span></div>
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
