import { useState } from 'react';
import { Calendar, MapPin } from 'lucide-react';
import RegistrationModal from './RegistrationModal';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  city: string;
  description: string;
  image_url: string;
  ticketsocket_event_id?: string;
}

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const [showRegistration, setShowRegistration] = useState(false);

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-48 object-cover"
        />
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-orange-500 font-semibold mb-1">{event.city}</p>
            <h3 className="text-2xl font-bold text-gray-900">{event.title}</h3>
          </div>

          <div className="space-y-2 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span className="text-sm">{event.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span className="text-sm">{event.location}</span>
            </div>
          </div>

          <p className="text-gray-600 text-sm">{event.description}</p>

          {event.ticketsocket_event_id ? (
            <button
              onClick={() => setShowRegistration(true)}
              className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
            >
              REGISTER NOW
            </button>
          ) : (
            <button
              disabled
              className="w-full py-3 bg-gray-300 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
              title="Online registration not available for this event"
            >
              COMING SOON
            </button>
          )}
        </div>
      </div>

      {showRegistration && (
        <RegistrationModal event={event} onClose={() => setShowRegistration(false)} />
      )}
    </>
  );
}
