import { useState, useEffect } from 'react';
import { CreditCard, Lock, AlertCircle, Loader2 } from 'lucide-react';

interface NMICollectCheckoutProps {
  amount: number;
  description: string;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
}

declare global {
  interface Window {
    CollectJS: {
      configure: (config: {
        variant?: string;
        styleSniffer?: boolean;
        callback?: (response: { token: string }) => void;
        validationCallback?: (field: string, valid: boolean, message?: string[]) => void;
        timeoutCallback?: () => void;
        fieldsAvailableCallback?: () => void;
        customCss?: Record<string, string>;
        fields?: {
          ccnumber?: { selector: string; title?: string; placeholder?: string };
          ccexp?: { selector: string; title?: string; placeholder?: string };
          cvv?: { selector: string; title?: string; placeholder?: string };
        };
      }) => void;
      startPaymentRequest: () => void;
    };
  }
}

export default function NMICollectCheckout({
  amount,
  description,
  onSuccess,
  onError,
}: NMICollectCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collectJsReady, setCollectJsReady] = useState(false);
  const [collectJsLoading, setCollectJsLoading] = useState(true);

  const [formData, setFormData] = useState({
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

  useEffect(() => {
    const tokenizationKey = import.meta.env.VITE_NMI_TOKENIZATION_KEY;

    console.log('NMI Tokenization Key:', tokenizationKey ? 'Present' : 'Missing');

    if (!tokenizationKey) {
      setError('NMI tokenization key is not configured. Please check your environment variables.');
      setCollectJsLoading(false);
      return;
    }

    const existingScript = document.querySelector('script[src*="Collect.js"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.src = 'https://secure.digitzs.transactiongateway.com/token/Collect.js';
    script.setAttribute('data-tokenization-key', tokenizationKey);
    script.async = true;

    script.onload = () => {
      console.log('CollectJS script loaded');

      setTimeout(() => {
        if (window.CollectJS) {
          console.log('Configuring CollectJS...');
          window.CollectJS.configure({
            variant: 'inline',
            styleSniffer: false,
            callback: handleTokenCallback,
            validationCallback: handleValidationCallback,
            fieldsAvailableCallback: () => {
              console.log('CollectJS fields are ready');
              setCollectJsReady(true);
              setCollectJsLoading(false);
            },
            timeoutCallback: () => {
              console.error('CollectJS timeout');
              setError('Payment form timed out. Please refresh and try again.');
              setCollectJsLoading(false);
            },
            customCss: {
              'border': '1px solid #d1d5db',
              'border-radius': '0.5rem',
              'padding': '0.75rem 1rem',
              'font-size': '1rem',
              'line-height': '1.5',
              'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            },
            fields: {
              ccnumber: {
                selector: '#ccnumber',
                title: 'Card Number',
                placeholder: '0000 0000 0000 0000',
              },
              ccexp: {
                selector: '#ccexp',
                title: 'Expiry',
                placeholder: 'MM / YY',
              },
              cvv: {
                selector: '#cvv',
                title: 'CVV',
                placeholder: '123',
              },
            },
          });
        } else {
          console.error('CollectJS not available after script load');
          setError('Payment form failed to initialize. Please refresh the page.');
          setCollectJsLoading(false);
        }
      }, 500);
    };

    script.onerror = () => {
      console.error('Failed to load CollectJS script');
      setError('Failed to load payment form. Please check your network connection and refresh the page.');
      setCollectJsLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const handleTokenCallback = async (response: { token: string }) => {
    console.log('Token received from CollectJS');

    try {
      const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      const paymentResponse = await fetch(
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
            paymentToken: response.token,
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
              description,
            },
            deviceData: {
              ipAddress: '0.0.0.0',
              userAgent: navigator.userAgent,
            },
            merchantId: '33595002',
          }),
        }
      );

      const result = await paymentResponse.json();

      if (result.success) {
        onSuccess(result.transactionId);
      } else {
        const errorMsg = result.message || 'Payment failed. Please try again.';
        setError(errorMsg);
        onError(errorMsg);
      }
    } catch (err) {
      console.error('Payment error:', err);
      const errorMsg = 'An error occurred processing your payment. Please try again.';
      setError(errorMsg);
      onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleValidationCallback = (field: string, valid: boolean, message?: string[]) => {
    console.log('Validation callback:', field, valid, message);
    if (!valid && message) {
      setError(message.join(', '));
    } else if (valid && error) {
      setError(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      setFormData({ ...formData, [name]: value.replace(/\D/g, '').substring(0, 10) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
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

    if (!collectJsReady) {
      setError('Payment form is not ready. Please wait a moment and try again.');
      return;
    }

    setLoading(true);

    try {
      window.CollectJS.startPaymentRequest();
    } catch (err) {
      console.error('CollectJS error:', err);
      setError('Failed to process payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-700 max-w-2xl mx-auto my-8">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Secure Checkout</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Powered by NMI Collect.js</p>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium">PCI Compliant</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">{description}</h3>
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

        {collectJsLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <p className="text-sm text-blue-800">Loading secure payment form...</p>
          </div>
        )}

        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Payment Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <div id="ccnumber" className="min-h-[44px]"></div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <div id="ccexp" className="min-h-[44px]"></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <div id="cvv" className="min-h-[44px]"></div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Billing Information</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
          <button
            type="submit"
            disabled={loading || !collectJsReady}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Card data is secured by NMI Collect.js. Your payment information never touches our servers.
        </p>
      </form>
    </div>
  );
}
