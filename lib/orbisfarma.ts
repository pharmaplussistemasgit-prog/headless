// Adapters for OrbisFarma API Routes

export interface OrbisInitResponse {
    response?: {
        cardnumber: string;
        cardbalance: number | string;
        transactionid: string; // The confusing part: response has transactionid inside "response"? Or root?
        // Based on PowerShell output: response: @{... transactionid: ...} but JSON might be different. 
        // We'll inspect runtime.
        [key: string]: any;
    };
    transactionid?: string; // It seems to be at root level too based on PS output
    message?: string;
    errorid?: number;
}

export interface OrbisQuoteResponse {
    response?: {
        transactionitems?: string;
        transactionbalance?: number | string;
        [key: string]: any;
    };
    [key: string]: any;
}

export const orbisService = {
    /**
     * Initializes a transaction with a Card Number (Cedula/ID)
     */
    init: async (cardNumber: string): Promise<OrbisInitResponse> => {
        const res = await fetch('/api/orbis/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cardnumber: cardNumber })
        });
        if (!res.ok) throw new Error('Error connecting to agreements service');
        return res.json();
    },

    /**
     * Quotes a list of items to get special prices or validation
     * Items format string: "SKU,QTY,1,1" (Assuming 1,1 are defaults for now)
     */
    quote: async (transactionId: string, cardNumber: string, itemsString: string): Promise<OrbisQuoteResponse> => {
        const res = await fetch('/api/orbis/quote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                transactionid: transactionId,
                cardnumber: cardNumber,
                transactionitems: itemsString
            })
        });
        if (!res.ok) throw new Error('Error quoting items');
        return res.json();
    },

    /**
     * Finalizes the sale
     */
    sale: async (transactionId: string, cardNumber: string, itemsString: string): Promise<any> => {
        const res = await fetch('/api/orbis/sale', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                transactionid: transactionId,
                cardnumber: cardNumber,
                transactionitems: itemsString
            })
        });
        if (!res.ok) throw new Error('Error finalizing sale');
        return res.json();
    }
};
