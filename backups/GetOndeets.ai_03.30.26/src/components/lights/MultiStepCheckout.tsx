import { useState, useEffect } from 'react';
import { X, Calendar, Users, Mail, Phone, User, CreditCard, Check } from 'lucide-react';
import { createTicketOrder } from '../../services/ticketsocket';
import { supabase } from '../../services/supabase';

interface Event {
  id: string;
  title: string;
  location: string;
  date: string;
  price: number;
  image: string;
  ticketsocket_event_id?: string;
}

interface MultiStepCheckoutProps {
  event: Event;
  onClose: () => void;
}

type Step = 'event-details' | 'contact-info' | 'payment' | 'success';

export default function MultiStepCheckout({ event, onClose }: MultiStepCheckoutProps) {
  const [currentStep, setCurrentStep] = useState<Step>('event-details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenExReady, setTokenExReady] = useState(false);
  const [tokenExInstance, setTokenExInstance] = useState<any>(null);
  const [orderConfirmation, setOrderConfirmation] = useState<any>(null);

  const [eventDetails, setEventDetails] = useState({
    selectedDate: event.date,
    quantity: 1,
  });

  const [contactInfo, setContactInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [paymentInfo, setPaymentInfo] = useState({
    expiryDate: '',
  });

  useEffect(() => {
    if (currentStep === 'payment') {
      loadTokenEx();
    }

    return () => {
      if (tokenExInstance) {
        try {
          tokenExInstance.remove();
        } catch (e) {
          console.log('TokenEx cleanup');
        }
      }
    };
  }, [currentStep]);

  const loadTokenEx = () => {
    const existingScript = document.querySelector('script[src*="tokenex.com"]');
    if (existingScript) {
      initializeTokenEx();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://htp.tokenex.com/Iframe/Iframe-v3.min.js';
    script.async = true;
    script.onload = () => {
      initializeTokenEx();
    };
    document.body.appendChild(script);
  };

  const initializeTokenEx = async () => {
    if (!(window as any).TokenEx) {
      setTimeout(initializeTokenEx, 100);
      return;
    }

    try {
      const tokenizationKey = import.meta.env.VITE_NMI_TOKENIZATION_KEY;

      if (!tokenizationKey) {
        console.error('TokenEx tokenization key not configured');
        return;
      }

      const authResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tokenex-auth`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            origin: window.location.origin,
            tokenScheme: 'nGUID',
          }),
        }
      );

      const authData = await authResponse.json();

      if (!authData.success) {
        console.error('Failed to get TokenEx auth:', authData.error);
        setError('Payment system initialization failed');
        return;
      }

      const iframeConfig = {
        tokenExID: tokenizationKey,
        tokenScheme: 'nGUID',
        authenticationKey: authData.authenticationKey,
        timestamp: authData.timestamp,
        origin: window.location.origin,
        pci: true,
        enableValidateOnBlur: true,
        inputType: 'text',
        enablePrettyFormat: true,
        styles: {
          base: 'font-family: system-ui, -apple-system, sans-serif; padding: 14px; font-size: 16px; color: #1f2937; border: none; width: 100%; box-sizing: border-box;',
          focus: 'outline: none;',
          error: 'color: #ef4444;',
          placeholder: 'color: #9ca3af;',
        },
        placeholder: '4242 4242 4242 4242',
        cvv: true,
        cvvContainerID: 'tokenex-cvv',
        cvvPlaceholder: '123',
        cvvStyles: {
          base: 'font-family: system-ui, -apple-system, sans-serif; padding: 14px; font-size: 16px; color: #1f2937; border: none; width: 100%; box-sizing: border-box;',
          focus: 'outline: none;',
          error: 'color: #ef4444;',
          placeholder: 'color: #9ca3af;',
        },
      };

      console.log('Initializing TokenEx with config:', {
        tokenExID: tokenizationKey,
        tokenScheme: iframeConfig.tokenScheme,
        timestamp: iframeConfig.timestamp,
        origin: iframeConfig.origin,
        hasAuthKey: !!iframeConfig.authenticationKey,
        authKeyLength: iframeConfig.authenticationKey?.length,
      });

      const iframe = new (window as any).TokenEx.Iframe('tokenex-card-number', iframeConfig);

      iframe.on('load', () => {
        console.log('TokenEx iframe loaded successfully');
        setTokenExReady(true);
      });

      iframe.on('error', (error: any) => {
        console.error('TokenEx iframe error:', error);
        setError('Payment system error. Please refresh and try again.');
      });

      iframe.on('validate', (data: any) => {
        console.log('TokenEx validation:', data);
      });

      iframe.on('tokenize', (data: any) => {
        console.log('TokenEx tokenize event:', data);
      });

      console.log('Calling iframe.load()...');
      iframe.load();
      setTokenExInstance(iframe);
      console.log('TokenEx iframe instance created and load() called');
    } catch (error) {
      console.error('Error initializing TokenEx:', error);
      setError('Failed to initialize payment system. Please refresh the page.');
    }
  };

  const handleEventDetailsNext = () => {
    if (eventDetails.quantity < 1) {
      setError('Please select at least 1 ticket');
      return;
    }
    setError(null);
    setCurrentStep('contact-info');
  };

  const handleContactInfoNext = () => {
    if (!contactInfo.firstName || !contactInfo.lastName || !contactInfo.email || !contactInfo.phone) {
      setError('Please fill in all contact information');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactInfo.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError(null);
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!tokenExInstance) {
        throw new Error('Payment system not ready. Please refresh and try again.');
      }

      if (!paymentInfo.expiryDate) {
        throw new Error('Please enter card expiry date');
      }

      const tokenResult = await new Promise<any>((resolve, reject) => {
        tokenExInstance.tokenize((result: any) => {
          if (result.error) {
            reject(new Error(result.error));
          } else {
            resolve(result);
          }
        });
      });

      const totalAmount = event.price * eventDetails.quantity;

      const ticketSocketResult = await createTicketOrder({
        eventId: event.ticketsocket_event_id || event.id,
        firstName: contactInfo.firstName,
        lastName: contactInfo.lastName,
        email: contactInfo.email,
        phone: contactInfo.phone,
        ticketQuantity: eventDetails.quantity,
        eventTitle: event.title,
        eventDate: eventDetails.selectedDate,
        totalAmount,
      });

      if (!ticketSocketResult.success) {
        throw new Error(ticketSocketResult.error || 'Failed to create order');
      }

      const orderId = ticketSocketResult.data?.order_id;

      const { data: registration, error: dbError } = await supabase
        .from('registrations')
        .insert({
          event_id: event.id,
          first_name: contactInfo.firstName,
          last_name: contactInfo.lastName,
          email: contactInfo.email,
          phone: contactInfo.phone,
          tickets_quantity: eventDetails.quantity,
          ticketsocket_order_id: orderId,
          payment_token: tokenResult.token,
          order_status: 'completed',
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to save registration');
      }

      setOrderConfirmation({
        orderId,
        totalAmount,
        ticketQuantity: eventDetails.quantity,
        email: contactInfo.email,
      });

      setCurrentStep('success');
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 'event-details', label: 'Event Details' },
      { id: 'contact-info', label: 'Contact Info' },
      { id: 'payment', label: 'Payment' },
    ];

    const currentIndex = steps.findIndex(s => s.id === currentStep);

    return (
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                  index <= currentIndex
                    ? 'bg-[#cd2bee] text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < currentIndex ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              <span className="text-xs mt-2 text-gray-600 hidden sm:block">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-1 flex-1 mx-2 rounded transition-colors ${
                  index < currentIndex ? 'bg-[#cd2bee]' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderEventDetails = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h3>
        <p className="text-gray-600 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {eventDetails.selectedDate}
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Number of Tickets
        </label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setEventDetails(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
            className="w-12 h-12 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-xl font-bold hover:border-[#cd2bee] transition-colors"
          >
            -
          </button>
          <div className="flex-1 text-center">
            <div className="text-3xl font-bold text-gray-900">{eventDetails.quantity}</div>
            <div className="text-sm text-gray-500">tickets</div>
          </div>
          <button
            type="button"
            onClick={() => setEventDetails(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
            className="w-12 h-12 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-xl font-bold hover:border-[#cd2bee] transition-colors"
          >
            +
          </button>
        </div>
      </div>

      <div className="bg-[#cd2bee]/10 rounded-xl p-6">
        <div className="flex items-center justify-between text-lg">
          <span className="font-medium text-gray-700">Total Price:</span>
          <span className="text-3xl font-bold text-[#cd2bee]">
            ${(event.price * eventDetails.quantity).toFixed(2)}
          </span>
        </div>
      </div>

      <button
        onClick={handleEventDetailsNext}
        className="w-full py-4 bg-[#cd2bee] text-white text-lg font-bold rounded-full hover:bg-[#a61cbd] transition-colors"
      >
        Continue to Contact Info
      </button>
    </div>
  );

  const renderContactInfo = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Contact Information</h3>
        <p className="text-gray-600">We'll send your tickets to this email</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              First Name
            </div>
          </label>
          <input
            type="text"
            value={contactInfo.firstName}
            onChange={(e) => setContactInfo(prev => ({ ...prev, firstName: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#cd2bee] focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Last Name
            </div>
          </label>
          <input
            type="text"
            value={contactInfo.lastName}
            onChange={(e) => setContactInfo(prev => ({ ...prev, lastName: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#cd2bee] focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Address
          </div>
        </label>
        <input
          type="email"
          value={contactInfo.email}
          onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#cd2bee] focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Phone Number
          </div>
        </label>
        <input
          type="tel"
          value={contactInfo.phone}
          onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#cd2bee] focus:border-transparent"
          required
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setCurrentStep('event-details')}
          className="flex-1 py-4 border-2 border-gray-300 text-gray-700 text-lg font-bold rounded-full hover:border-gray-400 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleContactInfoNext}
          className="flex-1 py-4 bg-[#cd2bee] text-white text-lg font-bold rounded-full hover:bg-[#a61cbd] transition-colors"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );

  const renderPayment = () => (
    <form onSubmit={handlePaymentSubmit} className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Information</h3>
        <p className="text-gray-600">Your payment is secure and encrypted</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Card Number
            </div>
          </label>
          <div
            id="tokenex-card-number"
            className="bg-white border border-gray-300 rounded-xl overflow-hidden relative"
            style={{ minHeight: '50px' }}
          >
            {!tokenExReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-sm text-gray-500">Loading secure payment form...</div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date
            </label>
            <input
              type="text"
              value={paymentInfo.expiryDate}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                  value = value.slice(0, 2) + '/' + value.slice(2, 4);
                }
                setPaymentInfo(prev => ({ ...prev, expiryDate: value }));
              }}
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
            <div
              id="tokenex-cvv"
              className="bg-white border border-gray-300 rounded-xl overflow-hidden"
              style={{ minHeight: '50px' }}
            />
          </div>
        </div>
      </div>

      <div className="bg-[#cd2bee]/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-700">Tickets ({eventDetails.quantity}x ${event.price})</span>
          <span className="font-bold text-gray-900">${(event.price * eventDetails.quantity).toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-300 pt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">Total</span>
          <span className="text-3xl font-bold text-[#cd2bee]">
            ${(event.price * eventDetails.quantity).toFixed(2)}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setCurrentStep('contact-info')}
          disabled={loading}
          className="flex-1 py-4 border-2 border-gray-300 text-gray-700 text-lg font-bold rounded-full hover:border-gray-400 transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading || !tokenExReady}
          className="flex-1 py-4 bg-[#cd2bee] text-white text-lg font-bold rounded-full hover:bg-[#a61cbd] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Complete Purchase'}
        </button>
      </div>
    </form>
  );

  const renderSuccess = () => (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-10 h-10 text-green-600" />
      </div>

      <h3 className="text-3xl font-bold text-gray-900 mb-4">
        You're All Set!
      </h3>

      <p className="text-lg text-gray-600 mb-8">
        Your tickets have been sent to<br />
        <span className="font-semibold text-gray-900">{orderConfirmation?.email}</span>
      </p>

      <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
        <h4 className="font-bold text-gray-900 mb-4">Order Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-mono font-semibold">{orderConfirmation?.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Event:</span>
            <span className="font-semibold">{event.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-semibold">{eventDetails.selectedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tickets:</span>
            <span className="font-semibold">{orderConfirmation?.ticketQuantity}</span>
          </div>
          <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between">
            <span className="font-bold text-gray-900">Total Paid:</span>
            <span className="font-bold text-[#cd2bee] text-lg">
              ${orderConfirmation?.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-4 bg-[#cd2bee] text-white text-lg font-bold rounded-full hover:bg-[#a61cbd] transition-colors"
      >
        Close
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-2xl font-bold text-gray-900">
            {currentStep === 'success' ? 'Order Complete' : 'Book Your Tickets'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {currentStep !== 'success' && renderStepIndicator()}

          {currentStep === 'event-details' && renderEventDetails()}
          {currentStep === 'contact-info' && renderContactInfo()}
          {currentStep === 'payment' && renderPayment()}
          {currentStep === 'success' && renderSuccess()}
        </div>
      </div>
    </div>
  );
}
