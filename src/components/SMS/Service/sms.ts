// SMS Leopard API Configuration - EXACTLY like your Google Apps Script
const SMS_LEOPARD_CONFIG = {
  API_KEY: 'yxFXqkhbsdbm2cCeXOju',
  API_SECRET: 'GHwclfNzr8ZT6iSOutZojrWheLKH3FWGw9rQ2eGQ',
  BASE_URL: 'https://api.smsleopard.com/v1'
};

// Type definitions
export interface SMSResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

export interface BalanceResponse {
  balance: number;
}

/**
 * Add query parameters to URL - Same as your String.prototype.addQuery
 */
const addQueryParams = (url: string, params: Record<string, string>): string => {
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  return `${url}?${queryString}`;
};

/**
 * Send SMS using SMS Leopard API - EXACTLY like your smsLeopard function
 */
export const sendSMSLeopard = async (phoneNumber: string, message: string): Promise<SMSResponse> => {
  try {
    // Format phone number to match your existing system
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Create credentials exactly like your Google Apps Script
    const credentials = `${SMS_LEOPARD_CONFIG.API_KEY}:${SMS_LEOPARD_CONFIG.API_SECRET}`;
    const encodedCredentials = btoa(credentials);
    
    // Build URL with query parameters EXACTLY like your implementation
    const url = addQueryParams(`${SMS_LEOPARD_CONFIG.BASE_URL}/sms/send`, {
      username: SMS_LEOPARD_CONFIG.API_KEY,
      password: SMS_LEOPARD_CONFIG.API_SECRET,
      message: message,
      destination: formattedPhone,
      source: "sms_Leopard"  // Using "sms_Leopard" as source
    });

    console.log('SMS Leopard API URL:', url);

    // Using GET request EXACTLY like your Google Apps Script
    const response = await fetch(url, {
      method: 'GET',  // GET request like your implementation
      headers: {
        'Authorization': `Basic ${encodedCredentials}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SMS API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('SMS sent successfully:', result);
    
    // Return success message like your Google Apps Script
    return {
      success: true,
      message: `Delivery Report: SMS successfully sent on ${new Date()}`,
      data: result
    };
  } catch (error) {
    console.error('SMS sending failed:', error);
    
    // Return error message like your Google Apps Script
    return {
      success: false,
      message: `error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: error
    };
  }
};

/**
 * Check SMS balance - EXACTLY like your airtimeBalance function
 */
export const checkSMSBalance = async (): Promise<number | string> => {
  try {
    const credentials = `${SMS_LEOPARD_CONFIG.API_KEY}:${SMS_LEOPARD_CONFIG.API_SECRET}`;
    const encodedCredentials = btoa(credentials);
    
    const response = await fetch(`${SMS_LEOPARD_CONFIG.BASE_URL}/balance`, {
      method: 'GET',  // GET request like your implementation
      headers: {
        'Authorization': `Basic ${encodedCredentials}`,
      }
    });

    if (!response.ok) {
      throw new Error(`Balance check failed: ${response.status}`);
    }

    const result: BalanceResponse = await response.json();
    console.log('Balance check result:', result);
    
    // Return exactly like your Google Apps Script
    return result.balance;
  } catch (error) {
    console.error('Balance check error:', error);
    throw error;
  }
};

/**
 * Format phone number to E.164 format - Same as your system
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  let cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('7')) {
    cleaned = '254' + cleaned;
  } else if (cleaned.startsWith('+254')) {
    cleaned = cleaned.substring(1);
  }
  
  return cleaned;
};

/**
 * SMS Message Templates - Same structure as your templates
 */
export const smsTemplates = {
  mpesaSuccess: (customerName: string, amount: number, loanId: string): string => 
    `Dear ${customerName}, your loan disbursement of KES ${amount?.toLocaleString()} for Loan #${loanId} has been successfully sent to your M-PESA account. Thank you for choosing Mular Credit.`,

  mpesaFailed: (customerName: string, loanId: string): string =>
    `Dear ${customerName}, we encountered an issue processing your M-PESA disbursement for Loan #${loanId}. Our team will contact you shortly.`,

  disbursementConfirmation: (customerName: string, amount: number, loanId: string): string =>
    `Dear ${customerName}, your loan of KES ${amount?.toLocaleString()} (Loan #${loanId}) has been disbursed successfully. Check your M-PESA for funds.`,

  loanApproved: (customerName: string, amount: number, loanId: string): string =>
    `Dear ${customerName}, your loan application #${loanId} for KES ${amount?.toLocaleString()} has been approved. Disbursement in progress.`
};

/**
 * Send SMS notification with the EXACT same behavior as your Google Apps Script
 */
export const sendSMSNotification = async (phoneNumber: string, message: string): Promise<SMSResponse> => {
  return await sendSMSLeopard(phoneNumber, message);
};