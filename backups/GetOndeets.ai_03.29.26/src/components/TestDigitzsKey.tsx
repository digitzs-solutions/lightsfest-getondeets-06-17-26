import React, { useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function TestDigitzsKey() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const testSecurityKey = async () => {
    setTesting(true);
    setResult(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      console.log('Supabase URL:', supabaseUrl);
      console.log('Has Anon Key:', !!supabaseKey);

      if (!supabaseUrl || !supabaseKey) {
        setResult({
          success: false,
          message: `Environment variables missing. Please refresh the page.\n\nVITE_SUPABASE_URL: ${!!supabaseUrl}\nVITE_SUPABASE_ANON_KEY: ${!!supabaseKey}\n\nIf this persists, the .env file may not be loaded correctly.`,
        });
        setTesting(false);
        return;
      }

      const apiUrl = `${supabaseUrl}/functions/v1/digitzs-direct`;
      console.log('Testing Digitzs Security Key via:', apiUrl);

      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: 1.00,
            currency: 'USD',
            orderId: `TEST-${Date.now()}`,
            customerInfo: {
              firstName: 'Test',
              lastName: 'User',
              email: 'test@example.com',
              phone: '5555551234',
              address: '123 Test St',
              city: 'Test City',
              state: 'CA',
              zip: '90210',
              country: 'US',
            },
            eventInfo: {
              eventName: 'Security Key Test',
              eventDate: '2024-12-31',
              eventTime: '19:00',
            },
            cardData: {
              cardNumber: '4111111111111111',
              expiry: '1225',
              cvv: '999',
            },
            deviceData: {
              ipAddress: '127.0.0.1',
              userAgent: navigator.userAgent,
            },
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: `✓ Security key is ACTIVE and working!\nTransaction ID: ${data.transactionId}\nAuth Code: ${data.authCode}`,
        });
      } else {
        setResult({
          success: false,
          message: `Security key test failed: ${data.message || data.error}\n\nThis could mean:\n1. The key needs activation in NMI Gateway\n2. The key has expired\n3. The merchant account is not active`,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Digitzs Security Key Test
          </h1>
          <p className="text-gray-600 mb-6">
            Testing the security key configured in Supabase Edge Function
          </p>
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The security key is securely stored in Supabase and not visible here.
              This test will verify if the key is working properly.
            </p>
          </div>

          <button
            onClick={testSecurityKey}
            disabled={testing}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {testing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Testing Security Key...
              </>
            ) : (
              'Test Security Key'
            )}
          </button>

          {result && (
            <div
              className={`mt-6 p-6 rounded-lg ${
                result.success
                  ? 'bg-green-50 border-2 border-green-200'
                  : 'bg-red-50 border-2 border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <h3
                    className={`font-semibold mb-2 ${
                      result.success ? 'text-green-900' : 'text-red-900'
                    }`}
                  >
                    {result.success ? 'Success!' : 'Failed'}
                  </h3>
                  <pre
                    className={`whitespace-pre-wrap text-sm ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {result.message}
                  </pre>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">What this test does:</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Sends a test transaction ($1.00) to Digitzs/NMI</li>
              <li>Uses test card: 4111111111111111</li>
              <li>Validates the security key is active</li>
              <li>Returns transaction details if successful</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
