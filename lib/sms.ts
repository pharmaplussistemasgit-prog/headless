import { NextResponse } from 'next/server';

interface SMSResponse {
    status?: string;
    message?: string;
    data?: any[];
}

const API_URL = 'https://contacto-virtual.com/sms/back_sms/public/api/send/sms/json';

export async function sendSMS(phone: string, message: string) {
    const email = process.env.SMS_API_EMAIL;
    const token = process.env.SMS_API_TOKEN;

    if (!email || !token) {
        console.error('SMS API credentials missing');
        return { success: false, error: 'Configuration Error' };
    }

    // Ensure phone has 57 prefix if not present (assuming Colombia for now based on docs)
    // The docs show examples with '57' prefix.
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10 && cleanPhone.startsWith('3')) {
        cleanPhone = '57' + cleanPhone;
    }

    const payload = {
        token: token,
        email: email,
        type_send: '1via',
        data: [
            {
                cellphone: cleanPhone,
                message: message.substring(0, 757) // Limit per docs
            }
        ]
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data: SMSResponse = await response.json();

        // Check for "SEND_OK" logic or specific error codes mentioned in docs
        // Docs say: >0 is SEND_OK.
        // The example response shows "status": "OK" and "id_sms" > 0 in data.

        if (data.status === 'OK' || (data.data && data.data.length > 0 && data.data[0].id_sms > 0)) {
            return { success: true, data };
        } else {
            console.error('SMS API Error Response:', data);
            return { success: false, error: data.message || 'Error sending SMS', details: data };
        }

    } catch (error) {
        console.error('SMS Send Error:', error);
        return { success: false, error: 'Network or Server Error' };
    }
}
