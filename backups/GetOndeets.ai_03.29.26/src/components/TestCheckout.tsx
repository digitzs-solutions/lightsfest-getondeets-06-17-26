import { useEffect, useRef, useState } from 'react';
import { CreditCard, Lock, ShieldCheck } from 'lucide-react';

export default function TestCheckout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cardExpiry: ''
  });
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const cvvContainerRef = useRef<HTMLDivElement>(null);
  const tokenexIframeRef = useRef<any>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://htp.tokenex.com/Iframe/Iframe-v3.min.js';
    script.async = true;
    script.onload = async () => {
      console.log('TokenEx SDK loaded');

      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tokenex-auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to get TokenEx auth');
        }

        const { tokenExID, authenticationKey, timestamp } = await response.json();
        console.log('TokenEx credentials received:', { tokenExID, timestamp });

        if (window.TokenEx && cardContainerRef.current && cvvContainerRef.current) {
          const iframe = new window.TokenEx.Iframe('payvia-card-container', {
            tokenExID,
            authenticationKey,
            timestamp,
            tokenScheme: 'PCI',
            pci: true,
            enableValidateOnBlur: true,
            placeholder: '1234 5678 9012 3456',
            styles: {
              base: 'font-family: Arial, sans-serif; font-size: 16px; color: #fff; padding: 0; background: transparent;',
              focus: 'outline: none;',
              error: 'color: #ef4444;',
              placeholder: 'color: #64748b;'
            },
            cvv: false
          });

          const cvvIframe = new window.TokenEx.Iframe('payvia-cvv-container', {
            tokenExID,
            authenticationKey,
            timestamp,
            tokenScheme: 'PCI',
            pci: true,
            cvv: true,
            enableValidateOnBlur: true,
            placeholder: '123',
            styles: {
              base: 'font-family: Arial, sans-serif; font-size: 16px; color: #fff; padding: 0; background: transparent;',
              focus: 'outline: none;',
              error: 'color: #ef4444;',
              placeholder: 'color: #64748b;'
            }
          });

          iframe.load();
          cvvIframe.load();

          tokenexIframeRef.current = { card: iframe, cvv: cvvIframe };
          console.log('TokenEx iframes loaded successfully');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('TokenEx initialization error:', error);
        setIsLoading(false);
      }
    };

    script.onerror = () => {
      console.error('Failed to load TokenEx SDK');
      setIsLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      if (tokenexIframeRef.current?.card) {
        tokenexIframeRef.current.card.tokenize();

        tokenexIframeRef.current.card.on('tokenize', async (data: any) => {
          console.log('Token received:', data);

          if (data.error) {
            alert('Card validation failed');
            setIsProcessing(false);
            return;
          }

          setTimeout(() => {
            alert(`Success! Token: ${data.token.substring(0, 20)}...`);
            setIsProcessing(false);
          }, 1000);
        });

        tokenexIframeRef.current.card.on('error', (error: any) => {
          console.error('TokenEx error:', error);
          alert('Payment processing error');
          setIsProcessing(false);
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-6">
          <h2 className="text-3xl font-bold text-white">Test Checkout</h2>
          <p className="text-emerald-100">Escape from Dinosaur Island - Saturday 7:00 PM</p>
          <div className="text-2xl font-bold text-white mt-2">$32.00</div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">First Name</label>
              <input
                type="text"
                required
                value={customerInfo.firstName}
                onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Last Name</label>
              <input
                type="text"
                required
                value={customerInfo.lastName}
                onChange={(e) => setCustomerInfo({ ...customerInfo, lastName: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
            <input
              type="email"
              required
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Phone</label>
            <input
              type="tel"
              required
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="border-t border-slate-700 pt-6">
            <div className="flex items-center gap-2 text-slate-300 mb-4">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <span className="font-semibold">Payment Information</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Card Number
                </label>
                <div
                  id="payvia-card-container"
                  ref={cardContainerRef}
                  style={{
                    minHeight: '48px',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  {isLoading && <span className="text-slate-500">Loading...</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    required
                    value={customerInfo.cardExpiry}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length >= 2) {
                        value = value.slice(0, 2) + '/' + value.slice(2, 4);
                      }
                      setCustomerInfo({ ...customerInfo, cardExpiry: value });
                    }}
                    maxLength={5}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    CVV
                  </label>
                  <div
                    id="payvia-cvv-container"
                    ref={cvvContainerRef}
                    style={{
                      minHeight: '48px',
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      position: 'relative',
                      zIndex: 1
                    }}
                  >
                    {isLoading && <span className="text-slate-500">...</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-300">
              <p className="font-semibold text-white mb-1">Secure Payment Processing</p>
              <p className="text-slate-400">
                This is a test checkout for TokenEx integration.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isProcessing}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Lock className="w-5 h-5" />
            {isProcessing ? 'Processing...' : 'Test Payment - $32.00'}
          </button>
        </form>
      </div>
    </div>
  );
}
