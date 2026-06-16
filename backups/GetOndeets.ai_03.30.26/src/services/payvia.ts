interface TokenexConfig {
  tokenExID: string;
  tokenScheme: string;
  authenticationKey: string;
  timestamp: string;
  origin: string;
}

interface TokenexAuthResponse {
  success: boolean;
  authenticationKey?: string;
  tokenExID?: string;
  timestamp?: string;
  tokenScheme?: string;
  error?: string;
}

interface PayviaTransactionData {
  amount: number;
  currency: string;
  orderId: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  eventInfo: {
    eventName: string;
    eventDate: string;
    eventTime: string;
  };
  deviceData: {
    ipAddress: string;
    userAgent: string;
    browserLanguage: string;
    screenResolution: string;
    timezone: string;
  };
}

interface PayviaResponse {
  success: boolean;
  transactionId?: string;
  token?: string;
  error?: string;
  data?: any;
}

const DIGITZS_MID = 'ticketso-clevergroup-33595002-4398786-1724692895';

async function getTokenexAuthKey(): Promise<TokenexAuthResponse> {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tokenex-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        origin: window.location.origin,
        tokenScheme: 'sixTokenSixDigit',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get TokenEx auth key');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching TokenEx auth key:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function initializeTokenex(containerIds: { card: string; cvv: string }) {
  console.log('initializeTokenex called with:', containerIds);

  if (typeof window === 'undefined' || !(window as any).TokenEx) {
    console.error('TokenEx SDK not loaded', {
      windowUndefined: typeof window === 'undefined',
      tokenExExists: !!(window as any).TokenEx
    });
    return null;
  }

  console.log('Fetching TokenEx auth key...');
  const authResponse = await getTokenexAuthKey();
  console.log('Auth response:', { success: authResponse.success, hasKey: !!authResponse.authenticationKey });

  if (!authResponse.success || !authResponse.authenticationKey) {
    console.error('Failed to get TokenEx authentication key:', authResponse.error);
    return null;
  }

  const TokenEx = (window as any).TokenEx;

  console.log('Creating TokenEx iframe with config:', {
    tokenExID: authResponse.tokenExID,
    tokenScheme: authResponse.tokenScheme,
    cardContainer: containerIds.card,
    cvvContainer: containerIds.cvv,
  });

  try {
    const iframe = new TokenEx.Iframe(containerIds.card, {
      tokenExID: authResponse.tokenExID,
      tokenScheme: authResponse.tokenScheme,
      authenticationKey: authResponse.authenticationKey,
      timestamp: authResponse.timestamp,
      origin: window.location.origin,
      pci: true,
      cvv: true,
      cvvContainerID: containerIds.cvv,
      enableValidateOnBlur: true,
      enablePrettyFormat: true,
      inputType: 'text',
      placeholder: '1234 5678 9012 3456',
      cvvPlaceholder: '123',
      styles: {
        base: 'padding: 12px 16px; font-family: system-ui, -apple-system, sans-serif; font-size: 16px; color: #ffffff; background-color: #1e293b; border: none; width: 100%; box-sizing: border-box;',
        focus: 'outline: none; color: #ffffff;',
        error: 'color: #ef4444;',
        placeholder: 'color: #64748b;',
        cvv: {
          base: 'padding: 12px 16px; font-family: system-ui, -apple-system, sans-serif; font-size: 16px; color: #ffffff; background-color: #1e293b; border: none; width: 100%; box-sizing: border-box;',
          focus: 'outline: none; color: #ffffff;',
          error: 'color: #ef4444;',
          placeholder: 'color: #64748b;',
        }
      },
    });

    iframe.load();

    iframe.on('load', () => {
      console.log('TokenEx iframe loaded successfully and ready for input');
    });

    iframe.on('error', (error: any) => {
      console.error('TokenEx iframe error:', error);
    });

    console.log('TokenEx iframe created and loaded into:', containerIds.card);

    return iframe;
  } catch (error) {
    console.error('Error creating TokenEx iframe:', error);
    return null;
  }
}

function collectDeviceData(): PayviaTransactionData['deviceData'] {
  return {
    ipAddress: '',
    userAgent: navigator.userAgent,
    browserLanguage: navigator.language,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

export async function processPayviaTransaction(
  transactionData: Omit<PayviaTransactionData, 'deviceData'>,
  tokenexToken: string
): Promise<PayviaResponse> {
  try {
    const deviceData = collectDeviceData();

    const fullTransactionData = {
      ...transactionData,
      deviceData,
      tokenexToken,
      merchantId: DIGITZS_MID,
      processor: 'stripe',
      gatewayType: 'transparent',
    };

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payvia-process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(fullTransactionData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Transaction failed',
      };
    }

    const data = await response.json();
    return {
      success: true,
      transactionId: data.transactionId,
      data,
    };
  } catch (error) {
    console.error('Payvia transaction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transaction processing failed',
    };
  }
}

export async function createPayviaOrder(orderData: {
  eventName: string;
  eventDate: string;
  eventTime: string;
  amount: number;
  quantity: number;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}): Promise<PayviaResponse> {
  try {
    const orderId = `EFD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    return {
      success: true,
      data: {
        orderId,
        amount: orderData.amount,
        quantity: orderData.quantity,
        status: 'pending',
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order',
    };
  }
}
