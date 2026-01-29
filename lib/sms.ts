import { toast } from "sonner";

export interface SMSMessage {
    to: string;
    body: string;
}

export const SMS_PROVIDER = "MOCK_TWILIO";

export async function sendSMS(message: SMSMessage): Promise<{ success: boolean; id?: string }> {
    console.log(`[${SMS_PROVIDER}] Sending SMS to ${message.to}: ${message.body}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulate success
    return {
        success: true,
        id: `SM${Math.random().toString(36).substring(7).toUpperCase()}`
    };
}

export function scheduleSMSReminder(reminder: any) {
    // In a real app, this would call a backend API to schedule a Cron Job or Lambda.
    // Here we just notify the user that the system "registered" it.
    console.log("Scheduling reminder for:", reminder);

    // Mock simulation of immediate "Safety Check" SMS
    toast.message("📱 SMS de Prueba", {
        description: `Hola ${reminder.patientName || 'Usuario'}, te recordaremos tomar ${reminder.productName} a las ${reminder.times[0]}.`,
    });
}
