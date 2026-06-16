import { useState, useEffect } from 'react';
import { X, Lock, CreditCard, CheckCircle } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { createTicketOrder } from '../../services/ticketsocket';

interface CheckoutModalProps {
  event: any;
  onClose: () => void;
}

export default function CheckoutModal({ event, onClose }: CheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenExReady, setTokenExReady] = useState(false);
  const [tokenExInstance, setTokenExInstance] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    quantity: 1,
    expiryDate: '',
  });

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://htp.tokenex.com/Iframe/Iframe-v3.min.js';
    script.async = true;
    script.onload = () => {
      console.log('TokenEx loaded');
      initializeTokenEx();
    };
    document.body.appendChild(script);

    return () => {
      if (tokenExInstance) {
        try {
          tokenExInstance.remove();
        } catch (e) {
          console.log('TokenEx cleanup error:', e);
        }
      }
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const initializeTokenEx = () => {
    if (!(window as any).TokenEx) {
      console.error('TokenEx not loaded');
      return;
    }

    try {
      const tokenizationKey = import.meta.env.VITE_NMI_TOKENIZATION_KEY;

      if (!tokenizationKey) {
        console.error('TokenEx tokenization key not configured');
        return;
      }

      const iframeConfig = {
        tokenExID: tokenizationKey,
        tokenScheme: 'nGUID',
        authenticationKey: import.meta.env.VITE_TOKENEX_API_KEY_1 || '',
        timestamp: new Date().toISOString(),
        origin: window.location.origin,
        pci: true,
        enableValidateOnBlur: true,
        inputType: 'text',
        enablePrettyFormat: true,
        styles: {
          base: 'font-family: Arial, sans-serif; padding: 12px; font-size: 16px; color: #1f2937; border: none; outline: none; width: 100%;',
          focus: 'color: #1f2937;',
          error: 'color: #ef4444;',
          placeholder: 'color: #9ca3af;',
        },
        placeholder: '4242 4242 4242 4242',
        cvv: true,
        cvvContainerID: 'tokenex-cvv',
        cvvPlaceholder: '123',
      };

      const iframe = new (window as any).TokenEx.Iframe('tokenex-card-number', iframeConfig);

      iframe.on('load', () => {
        console.log('TokenEx card number iframe loaded');
        setTokenExReady(true);
      });

      iframe.on('tokenize', (data: any) => {
        console.log('Tokenization successful:', data);
      });

      iframe.on('error', (error: any) => {
        console.error('TokenEx error:', error);
      });

      iframe.on('validate', (data: any) => {
        console.log('Card validation:', data);
      });

      iframe.load();
      setTokenExInstance(iframe);

    } catch (error) {
      console.error('Error initializing TokenEx:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!tokenExInstance) {
        throw new Error('Payment system not ready. Please refresh and try again.');
      }

      console.log('Tokenizing card data...');
      const tokenResult = await new Promise<any>((resolve, reject) => {
        tokenExInstance.tokenize((result: any) => {
          if (result.error) {
            reject(new Error(result.error));
          } else {
            resolve(result);
          }
        });
      });

      console.log('Card tokenized successfully:', tokenResult.token);

      const totalAmount = event.price * formData.quantity;

      console.log('Creating TicketSocket order...');
      const ticketSocketResult = await createTicketOrder({
        eventId: event.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        ticketQuantity: formData.quantity,
        eventTitle: event.title,
        eventDate: event.date,
        totalAmount,
      });

      if (!ticketSocketResult.success) {
        throw new Error(ticketSocketResult.error || 'Failed to create order');
      }

      const orderId = ticketSocketResult.data?.order_id;
      console.log('TicketSocket order created:', orderId);

      console.log('Saving registration to database...');
      const { error: dbError } = await supabase
        .from('registrations')
        .insert({
          event_id: event.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          tickets_quantity: formData.quantity,
          ticketsocket_order_id: orderId,
          payment_token: tokenResult.token,
          order_status: 'completed',
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to save registration');
      }

      console.log('Registration saved successfully!');
      setSuccess(true);

      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = event ? event.price * formData.quantity : 0;

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your tickets have been confirmed. Check your email for details.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-[#cd2bee] text-white rounded-xl font-semibold hover:bg-[#a61cbd] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Secure Checkout</h2>
            <div className="flex items-center gap-2 text-green-600 mt-1">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">Powered by TicketSocket</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {event && (
            <div className="bg-gradient-to-r from-[#cd2bee]/10 to-purple-100 border border-[#cd2bee]/20 rounded-2xl p-4">
              <div className="flex items-start gap-4">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-20 h-20 object-cover rounded-xl"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-600">{event.location}</p>
                  <p className="text-sm text-gray-600">{event.date}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#cd2bee]">
                    ${event.price}
                  </div>
                  <div className="text-xs text-gray-500">per ticket</div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#cd2bee] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#cd2bee] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#cd2bee] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#cd2bee] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Tickets
            </label>
            <select
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#cd2bee] focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Ticket' : 'Tickets'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Payment Information</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Secure TokenEx Payment via Payvia
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Your card data is tokenized and never touches our servers. Protected by Kount fraud prevention.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <div id="tokenex-card-number" className="min-h-[48px] border border-gray-300 rounded-xl" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#cd2bee] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <div id="tokenex-cvv" className="min-h-[48px] border border-gray-300 rounded-xl" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between text-lg font-bold">
              <span className="text-gray-900">Total</span>
              <span className="text-[#cd2bee]">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-4 bg-[#cd2bee] text-white text-lg font-bold rounded-xl hover:bg-[#a61cbd] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow"
          >
            {loading ? 'Processing...' : `Pay $${totalPrice.toFixed(2)}`}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Secure payment processing via Payvia with TokenEx tokenization and Kount fraud protection.
            Your payment information is fully encrypted and PCI compliant.
          </p>
        </form>
      </div>
    </div>
  );
}
