import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import EventCard from './EventCard';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  city: string;
  description: string;
  image_url: string;
  ticket_url: string;
  ticketsocket_event_id?: string;
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function EventsSection() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setEvents(data as Event[]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextEvent = () => {
    setCurrentIndex((prev) => (prev + 1) % events.length);
  };

  const prevEvent = () => {
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  };

  return (
    <section id="events" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
          <p className="text-xl text-gray-600">Choose your city and join us for an magical evening</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading events...</p>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
