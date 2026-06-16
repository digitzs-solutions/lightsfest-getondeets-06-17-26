import { Calendar, Clock, X, MapPin, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import PayviaCheckout from './PayviaCheckout';
import { supabase } from '../services/supabase';

interface Event {
  id: string;
  name: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  capacity: number;
  price: number;
}

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

function TicketModal({ isOpen, onClose, event }: TicketModalProps) {
  const [showCheckout, setShowCheckout] = useState(false);

  if (!isOpen || !event) return null;

  const handleSuccess = (transactionId: string) => {
    alert(`Payment successful! Transaction ID: ${transactionId}`);
    onClose();
    setShowCheckout(false);
  };

  const handleError = (error: string) => {
    alert(`Payment failed: ${error}`);
  };

  const eventDate = new Date(event.event_date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-emerald-500/20">
        <div className="p-6 border-b border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-white">{event.name}</h3>
              <p className="text-emerald-400 text-lg">{formattedDate}</p>
              <div className="flex items-center gap-4 mt-2 text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{event.event_time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{event.location}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                setShowCheckout(false);
              }}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!showCheckout ? (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
                <h4 className="text-xl font-bold text-white mb-4">Event Details</h4>
                <p className="text-slate-300 mb-6">{event.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Users className="w-5 h-5" />
                    <span>{event.capacity} spots available</span>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-emerald-400">${event.price}</p>
                    <p className="text-slate-400 text-sm">per ticket</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowCheckout(true)}
                className="w-full px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/50"
              >
                Continue to Checkout
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => setShowCheckout(false)}
                className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold"
              >
                ← Back to event details
              </button>
              <PayviaCheckout
                amount={event.price}
                eventName={event.name}
                eventDate={formattedDate}
                eventTime={event.event_time}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DinoTickets() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase(),
      date: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    };
  };

  if (loading) {
    return (
      <section id="tickets" className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-slate-400 text-lg">Loading events...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="tickets" className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Purchase <span className="text-emerald-400">Tickets!</span>
            </h2>
            <p className="text-slate-400 text-lg">Select an event to get started</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {events.map((event) => {
              const { day, date } = formatEventDate(event.event_date);
              return (
                <div
                  key={event.id}
                  className="group bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border-2 border-slate-700 hover:border-emerald-500 transition-all hover:shadow-2xl hover:shadow-emerald-500/20 hover:scale-105"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-8 h-8 text-emerald-400" />
                    <h3 className="text-2xl font-bold text-white">{day}</h3>
                  </div>
                  <p className="text-4xl font-bold text-emerald-400 mb-4">{date}</p>
                  <h4 className="text-xl font-bold text-white mb-2">{event.name}</h4>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{event.event_time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{event.capacity} spots</span>
                    </div>
                  </div>
                  <div className="mb-6">
                    <p className="text-3xl font-bold text-emerald-400">${event.price}</p>
                    <p className="text-slate-400 text-sm">per ticket</p>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="w-full px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/50"
                  >
                    Select Event
                  </button>
                </div>
              );
            })}
          </div>

          {events.length === 0 && !loading && (
            <div className="text-center">
              <p className="text-slate-400 text-lg">No events available at this time.</p>
            </div>
          )}
        </div>
      </section>

      <TicketModal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
      />
    </>
  );
}
