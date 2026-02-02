/**
 * SMS Service Adapter
 * 
 * Defines the interface for sending SMS notifications.
 * Currently keeps a generic implementation.
 * 
 * TODO: User must configure specific endpoint and keys here.
 */

// Interface for what we expect from an SMS provider
interface SMSProvider {
    send(phone: string, message: string): Promise<boolean>;
}

// Configuration for the Customer's SMS Service
const SMS_CONFIG = {
    // Replace these with actual values provided by the client's SMS provider
    apiUrl: process.env.SMS_API_URL || 'https://api.generic-sms-provider.com/send',
    apiKey: process.env.SMS_API_KEY || 'your-api-key',
    senderId: process.env.SMS_SENDER_ID || 'PharmaPlus'
};

/**
 * Sends an SMS to the specified phone number.
 * 
 * @param phone Phone number (e.g., "573001234567")
 * @param message Text message content
 * @returns boolean indicating success
 */
export async function sendSMS(phone: string, message: string): Promise<boolean> {

    // 1. Validation
    if (!phone || !message) {
        console.warn('[SMS] Missing phone or message');
        return false;
    }

    try {
        console.log(`[SMS] Attempting to send to ${phone}: "${message}"`);

        // 2. Real Implementation (Uncomment and adjust when credentials are ready)
        /*
        const response = await fetch(SMS_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SMS_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                to: phone,
                from: SMS_CONFIG.senderId,
                text: message
            })
        });

        if (!response.ok) {
            throw new Error(`SMS Provider Error: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('[SMS] Success:', data);
        */

        // 3. Mock Implementation (For Testing/Demo)
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('[SMS] MOCK SENT (Check console for details)');
        return true;

    } catch (error) {
        console.error('[SMS] Failed to send:', error);
        return false;
    }
}
