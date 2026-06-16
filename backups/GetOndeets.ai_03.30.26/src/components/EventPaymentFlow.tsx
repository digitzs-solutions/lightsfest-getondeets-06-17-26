import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, CheckCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../services/supabase';
import NMICollectCheckout from './NMICollectCheckout';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  city: string;
  description: string;
  image_url: string;
  capacity: number;
  ticketsocket_event_id: string | null;
}

export default function EventPaymentFlow() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error loading events:', error);
    } else if (data) {
      setEvents(data);
    }
    setIsLoading(false);
  };

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setShowPayment(true);
  };

  const handlePaymentSuccess = (txId: string) => {
    setTransactionId(txId);
    setPaymentSuccess(true);
  };

  const handlePaymentError = (error: string) => {
    alert(`Payment failed: ${error}`);
  };

  const handleBackToEvents = () => {
    setShowPayment(false);
    setSelectedEvent(null);
    setPaymentSuccess(false);
    setTransactionId('');
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-slate-400 mb-6">
              Your ticket purchase for <span className="text-emerald-400 font-semibold">{selectedEvent?.title}</span> is confirmed.
            </p>
            <div className="bg-slate-900 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-400 mb-1">Transaction ID</p>
              <p className="text-white font-mono text-sm">{transactionId}</p>
            </div>
            <button
              onClick={handleBackToEvents}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showPayment && selectedEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleBackToEvents}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </button>

          <div className="mb-8">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex gap-4">
                <img
                  src={selectedEvent.image_url}
                  alt={selectedEvent.title}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-2">{selectedEvent.title}</h2>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {selectedEvent.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedEvent.location}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <NMICollectCheckout
            amount={1}
            description={`${selectedEvent.title} - ${selectedEvent.date}`}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Select an Event
          </h1>
          <p className="text-xl text-slate-400">
            Choose an event and pay $1 to get started
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 mt-4">Loading events...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-emerald-500 transition-all hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
                onClick={() => handleEventSelect(event)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    $1.00
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{event.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      {event.location}, {event.city}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Users className="w-4 h-4 text-emerald-400" />
                      Capacity: {event.capacity}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventSelect(event);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all"
                  >
                    Select Event
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
