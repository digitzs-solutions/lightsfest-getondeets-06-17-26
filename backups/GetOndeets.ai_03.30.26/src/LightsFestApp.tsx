import { useState } from 'react';
import Navigation from './components/lights/Navigation';
import Hero from './components/lights/Hero';
import MarqueeStrip from './components/lights/MarqueeStrip';
import IntroSection from './components/lights/IntroSection';
import EventSlider from './components/lights/EventSlider';
import CTASection from './components/lights/CTASection';
import GallerySection from './components/lights/GallerySection';
import Footer from './components/lights/Footer';
import MultiStepCheckout from './components/lights/MultiStepCheckout';

export default function LightsFestApp() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const defaultEvent = {
    id: '1',
    title: 'Austin Lights Festival',
    location: 'Austin, TX',
    date: 'March 15, 2026',
    price: 1,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaYZ3Q27V_YXcQLn3VY8q-6U8WaW4NcVGz2-KG3CFOKAFXLcI_lh3J4ZRjAgZASSmANOguYPVkiI1O1zAMeZBsvkYraEsMmntk7hXTSDeE3CZSCOx3am6Q77pqQc9sGEWZaQdGDTBIOJA_9QAYxyKbH0icSQx9moFIgfuHsf0YiResu7nKaVzvGV8bUjxc6U-ivArkd7JPfNKY0Dwrv6Z6ZmurdEoennShIwAXxoq04WY46kwq0tc5drdf3RHAL6nbPBWcsXrL384',
  };

  const handleGetTickets = (event?: any) => {
    setSelectedEvent(event || defaultEvent);
    setShowCheckout(true);
  };

  return (
    <div className="bg-[#f8f6f8]">
      <Navigation onGetTickets={() => handleGetTickets()} />
      <Hero onGetTickets={() => handleGetTickets()} />
      <MarqueeStrip />
      <IntroSection />
      <EventSlider onEventSelect={handleGetTickets} />
      <CTASection />
      <GallerySection />
      <Footer />

      {showCheckout && (
        <MultiStepCheckout
          event={selectedEvent}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}
