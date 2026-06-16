import { useState } from 'react';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';

interface DigitzsCheckoutProps {
  amount: number;
  eventName: string;
  eventDate: string;
  eventTime: string;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
}

export default function DigitzsCheckout({
  amount,
  eventName,
  eventDate,
  eventTime,
  onSuccess,
  onCancel,
}: DigitzsCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substring(0, 19);
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'cardNumber') {
      setFormData({ ...formData, [name]: formatCardNumber(value) });
    } else if (name === 'expiry') {
      setFormData({ ...formData, [name]: formatExpiry(value) });
    } else if (name === 'cvv') {
      setFormData({ ...formData, [name]: value.replace(/\D/g, '').substring(0, 4) });
    } else if (name === 'phone') {
      setFormData({ ...formData, [name]: value.replace(/\D/g, '').substring(0, 10) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const cardNumberClean = formData.cardNumber.replace(/\s/g, '');
    if (cardNumberClean.length < 13 || cardNumberClean.length > 19) {
      setError('Please enter a valid card number');
      return false;
    }

    const expiryClean = formData.expiry.replace(/\D/g, '');
    if (expiryClean.length !== 4) {
      setError('Please enter a valid expiry date (MM/YY)');
      return false;
    }

    const month = parseInt(expiryClean.substring(0, 2));
    if (month < 1 || month > 12) {
      setError('Invalid expiry month');
      return false;
    }

    if (formData.cvv.length < 3 || formData.cvv.length > 4) {
      setError('Please enter a valid CVV');
      return false;
    }

    if (!formData.firstName || !formData.lastName) {
      setError('Please enter your name');
      return false;
    }

    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }

    if (formData.phone.length < 10) {
      setError('Please enter a valid phone number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      const expiryMMYY = formData.expiry.replace(/\D/g, '');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/digitzs-direct`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            amount,
            currency: 'USD',
            orderId,
            customerInfo: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              zip: formData.zip,
              country: formData.country,
            },
            eventInfo: {
              eventName,
              eventDate,
              eventTime,
            },
            cardData: {
              cardNumber: formData.cardNumber.replace(/\s/g, ''),
              expiry: expiryMMYY,
              cvv: formData.cvv,
            },
            deviceData: {
              ipAddress: '0.0.0.0',
              userAgent: navigator.userAgent,
            },
            merchantId: '33595002',
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        onSuccess(result.transactionId);
      } else {
        setError(result.message || 'Payment failed. Please try again.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('An error occurred processing your payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Secure Checkout</h2>
              <p className="text-sm text-gray-600 mt-1">Complete your payment</p>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <Lock className="w-5 h-5" />
              <span className="text-sm font-medium">Secure</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900">{eventName}</h3>
                <p className="text-sm text-blue-700">{eventDate} at {eventTime}</p>
                <p className="text-2xl font-bold text-blue-900 mt-2">${amount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Payment Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="0000 0000 0000 0000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiry"
                    value={formData.expiry}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Billing Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  placeholder="(555) 555-5555"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address (Optional)
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="TX"
                    maxLength={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP
                  </label>
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Your payment is processed securely through Digitzs/NMI. We never store your card information.
          </p>
        </form>
      </div>
    </div>
  );
}
