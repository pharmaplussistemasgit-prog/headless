
import { NextResponse } from 'next/server';

const ORBIS_API_URL = "https://posdeveloper.orbisfarma.com.mx";

// Use the API Key from environment or the one found in docs
const ORBIS_API_KEY = process.env.ORBIS_API_KEY || "4AD42EC77114956F33B16AC27D136F85";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { transactionid, cardnumber, transactionitems } = body;

        // "setTransactionSale" parameters based on Postman
        // Headers: ApiKey
        // Body: transactionid, cardnumber, transactionitems
        // Note: Postman also shows "transactiontotal" and "transactiontaxes" could be needed, 
        // but let's try with minimal first as 'transactionitems' often contains prices.

        // Wait, looking at Postman collection again (from memory/docs):
        // It likely needs the same items string.

        const response = await fetch(`${ORBIS_API_URL}/setTransactionSale`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ApiKey': ORBIS_API_KEY
            },
            body: JSON.stringify({
                transactionid,
                cardnumber,
                transactionitems
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Orbis Sale Error:', response.status, errorText);
            return NextResponse.json({ success: false, message: `Orbis Error: ${response.status}` }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Orbis Proxy Error (Sale):', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
