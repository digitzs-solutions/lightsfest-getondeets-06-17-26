import { useState } from 'react';
import { X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import NMICollectCheckout from './NMICollectCheckout';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  ticketsocket_event_id?: string;
}

interface RegistrationModalProps {
  event: Event;
  onClose: () => void;
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function RegistrationModal({ event, onClose }: RegistrationModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    tickets: 1,
  });
  const [showPayment, setShowPayment] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'tickets' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    try {
      const { error } = await supabase.from('registrations').insert([
        {
          event_id: event.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          tickets_quantity: formData.tickets,
          ticketsocket_order_id: transactionId,
          order_status: 'completed',
        },
      ]);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error('Error saving registration:', error);
      alert('Payment successful but failed to save registration. Please contact support with transaction ID: ' + transactionId);
    }
  };

  const handlePaymentError = (error: string) => {
    alert(`Payment failed: ${error}`);
    setShowPayment(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Register for {event.title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="text-6xl">✓</div>
              <p className="text-lg font-semibold text-gray-900">Registration Successful!</p>
              <p className="text-gray-600">Check your email for confirmation details.</p>
            </div>
          ) : showPayment ? (
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Name:</span> {formData.firstName} {formData.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Email:</span> {formData.email}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Tickets:</span> {formData.tickets}
                </p>
              </div>
              <NMICollectCheckout
                amount={formData.tickets}
                description={`${event.title} - ${formData.tickets} ticket(s)`}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
              <button
                onClick={() => setShowPayment(false)}
                className="w-full py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Back to Form
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Tickets
                </label>
                <select
                  name="tickets"
                  value={formData.tickets}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Ticket' : 'Tickets'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Event:</span> {event.title}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Date:</span> {event.date}
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
              >
                Continue to Payment
              </button>
            </>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
