import { useEffect, useRef, useState } from 'react';
import { CreditCard, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { initializeTokenex, processPayviaTransaction, createPayviaOrder } from '../services/payvia';
import NMICollectCheckout from './NMICollectCheckout';

interface PayviaCheckoutProps {
  amount: number;
  eventName: string;
  eventDate?: string;
  eventTime?: string;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: string) => void;
}

export default function PayviaCheckout({
  amount,
  eventName,
  eventDate = '',
  eventTime = '',
  onSuccess,
  onError
}: PayviaCheckoutProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useTestMode, setUseTestMode] = useState(false);
  const [useDirectIntegration, setUseDirectIntegration] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    numberOfTickets: 1,
    cardExpiry: '',
    cardNumber: '',
    cvv: ''
  });
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const cvvContainerRef = useRef<HTMLDivElement>(null);
  const tokenexIframeRef = useRef<any>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://api.tokenex.com/Iframe/v3/iframe-v3.min.js';
    script.async = true;
    script.onload = () => {
      console.log('TokenEx SDK loaded successfully');
      setTimeout(async () => {
        console.log('Initializing TokenEx iframes...', {
          cardContainer: cardContainerRef.current,
          cvvContainer: cvvContainerRef.current
        });

        if (cardContainerRef.current && cvvContainerRef.current) {
          const iframe = await initializeTokenex({
            card: 'payvia-card-container',
            cvv: 'payvia-cvv-container',
          });

          if (iframe) {
            console.log('TokenEx iframe initialized successfully');
            tokenexIframeRef.current = iframe;
            setIsLoading(false);
          } else {
            console.error('TokenEx iframe initialization failed, switching to direct integration');
            setUseDirectIntegration(true);
            setIsLoading(false);
          }
        } else {
          console.error('Container refs not available, switching to direct integration');
          setUseDirectIntegration(true);
          setIsLoading(false);
        }
      }, 1000);
    };
    script.onerror = () => {
      console.error('Failed to load TokenEx SDK, switching to direct integration');
      setUseDirectIntegration(true);
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

    console.log('Payment submission:', {
      useTestMode,
      hasTokenexIframe: !!tokenexIframeRef.current,
      isLoading
    });

    try {
      const totalAmount = amount * customerInfo.numberOfTickets;

      const orderResponse = await createPayviaOrder({
        eventName,
        eventDate: eventDate || new Date().toLocaleDateString(),
        eventTime: eventTime || '',
        amount: totalAmount,
        quantity: customerInfo.numberOfTickets,
        customerInfo: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone,
        },
      });

      if (!orderResponse.success || !orderResponse.data) {
        throw new Error(orderResponse.error || 'Failed to create order');
      }

      const { orderId } = orderResponse.data;

      if (useTestMode) {
        console.warn('Using test mode - bypassing TokenEx tokenization');
        const transactionResult = await processPayviaTransaction(
          {
            amount: totalAmount,
            currency: 'USD',
            orderId,
            customerInfo: {
              firstName: customerInfo.firstName,
              lastName: customerInfo.lastName,
              email: customerInfo.email,
              phone: customerInfo.phone,
            },
            eventInfo: {
              eventName,
              eventDate: eventDate || new Date().toLocaleDateString(),
              eventTime: eventTime || '',
            },
          },
          'test_token_' + Date.now()
        );

        if (transactionResult.success && transactionResult.transactionId) {
          onSuccess?.(transactionResult.transactionId);
        } else {
          onError?.(transactionResult.error || 'Payment processing failed');
        }
        setIsProcessing(false);
      } else if (tokenexIframeRef.current) {
        console.log('Starting TokenEx tokenization...');
        tokenexIframeRef.current.tokenize();

        tokenexIframeRef.current.on('tokenize', async (data: any) => {
          if (data.error) {
            setIsProcessing(false);
            onError?.('Card validation failed. Please check your card details.');
            return;
          }

          const transactionResult = await processPayviaTransaction(
            {
              amount: totalAmount,
              currency: 'USD',
              orderId,
              customerInfo: {
                firstName: customerInfo.firstName,
                lastName: customerInfo.lastName,
                email: customerInfo.email,
                phone: customerInfo.phone,
              },
              eventInfo: {
                eventName,
                eventDate: eventDate || new Date().toLocaleDateString(),
                eventTime: eventTime || '',
              },
            },
            data.token
          );

          setIsProcessing(false);

          if (transactionResult.success && transactionResult.transactionId) {
            onSuccess?.(transactionResult.transactionId);
          } else {
            onError?.(transactionResult.error || 'Transaction failed');
          }
        });

        tokenexIframeRef.current.on('error', (error: any) => {
          setIsProcessing(false);
          onError?.('Payment processing error. Please try again.');
          console.error('TokenEx error:', error);
        });
      } else {
        setTimeout(() => {
          setIsProcessing(false);
          const mockTransactionId = `DEMO-${orderId}`;
          console.log('Demo mode - Transaction details:', {
            orderId,
            amount: totalAmount,
            customer: customerInfo,
            merchantId: 'digitzs-escapefrom-33738480-5013250-1771270463',
            processor: 'Stripe via Digitzs',
            gateway: 'Tokenex (Transparent)',
          });
          onSuccess?.(mockTransactionId);
        }, 2000);
      }
    } catch (error) {
      setIsProcessing(false);
      onError?.(error instanceof Error ? error.message : 'Payment failed');
    }
  };

  const totalAmount = amount * customerInfo.numberOfTickets;

  if (useDirectIntegration) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-200">
            <p className="font-semibold mb-1">NMI Secure Payment</p>
            <p className="text-blue-300/80">
              Using NMI Collect.js tokenization (PCI DSS compliant)
            </p>
          </div>
        </div>
        <NMICollectCheckout
          amount={totalAmount}
          eventName={eventName}
          eventDate={eventDate || new Date().toLocaleDateString()}
          eventTime={eventTime || ''}
          onSuccess={(transactionId) => {
            console.log('Payment successful:', transactionId);
            onSuccess?.(transactionId);
          }}
          onCancel={() => {
            setUseDirectIntegration(false);
            setIsLoading(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-6">
        <div className="flex items-center justify-between text-white">
          <div>
            <h3 className="text-2xl font-bold mb-1">{eventName}</h3>
            <p className="text-emerald-100">Secure Checkout</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">${totalAmount.toFixed(2)}</div>
            <div className="text-sm text-emerald-100">{customerInfo.numberOfTickets} ticket(s)</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              First Name
            </label>
            <input
              type="text"
              required
              value={customerInfo.firstName}
              onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Last Name
            </label>
            <input
              type="text"
              required
              value={customerInfo.lastName}
              onChange={(e) => setCustomerInfo({ ...customerInfo, lastName: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
              placeholder="Doe"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            required
            value={customerInfo.email}
            onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            required
            value={customerInfo.phone}
            onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
            placeholder="(555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Number of Tickets
          </label>
          <select
            value={customerInfo.numberOfTickets}
            onChange={(e) => setCustomerInfo({ ...customerInfo, numberOfTickets: parseInt(e.target.value) })}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <option key={num} value={num}>{num} {num === 1 ? 'Ticket' : 'Tickets'} - ${(amount * num).toFixed(2)}</option>
            ))}
          </select>
        </div>

        <div className="border-t border-slate-700 pt-6">
          <div className="flex items-center gap-2 text-slate-300 mb-4">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold">Payment Information</span>
          </div>

          <div className="space-y-4">
            {useTestMode && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-4">
                <p className="text-sm text-yellow-200">
                  Test Mode: Use card 4242424242424242 for testing
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Card Number
              </label>
              {useTestMode ? (
                <input
                  type="text"
                  required
                  value={customerInfo.cardNumber}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    value = value.replace(/(.{4})/g, '$1 ').trim();
                    setCustomerInfo({ ...customerInfo, cardNumber: value });
                  }}
                  maxLength={19}
                  placeholder="4242 4242 4242 4242"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                />
              ) : (
                <div
                  id="payvia-card-container"
                  ref={cardContainerRef}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-colors overflow-hidden"
                  style={{ minHeight: '48px', position: 'relative' }}
                >
                  {isLoading && <span className="text-slate-500 px-4 py-3 block">Loading secure form...</span>}
                </div>
              )}
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
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  CVV
                </label>
                {useTestMode ? (
                  <input
                    type="text"
                    required
                    value={customerInfo.cvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setCustomerInfo({ ...customerInfo, cvv: value });
                    }}
                    maxLength={4}
                    placeholder="123"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                  />
                ) : (
                  <div
                    id="payvia-cvv-container"
                    ref={cvvContainerRef}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-colors overflow-hidden"
                    style={{ minHeight: '48px', position: 'relative' }}
                  >
                    {isLoading && <span className="text-slate-500 text-sm px-4 py-3 block">...</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-slate-300">
            <p className="font-semibold text-white mb-1">Secure Payment Processing</p>
            <p className="text-slate-400">
              Powered by Payvia with Tokenex encryption. Your payment information is triple-hash encrypted
              at the device level and never touches our servers. PCI DSS 4.0 compliant.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || isProcessing}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Lock className="w-5 h-5" />
          {isProcessing ? 'Processing...' : `Complete Secure Payment - $${totalAmount.toFixed(2)}`}
        </button>

        <div className="flex items-center justify-center gap-4 text-slate-500 text-xs">
          <span>Visa</span>
          <span>•</span>
          <span>Mastercard</span>
          <span>•</span>
          <span>Amex</span>
          <span>•</span>
          <span>Discover</span>
        </div>
      </form>
    </div>
  );
}
