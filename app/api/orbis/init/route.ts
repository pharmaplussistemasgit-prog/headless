import { NextResponse } from 'next/server';

const ORBIS_API_URL = 'https://posdeveloper.orbisfarma.com.mx';
const API_KEY = process.env.ORBIS_API_KEY || '4AD42EC77114956F33B16AC27D136F85'; // Fallback for dev

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { cardnumber, storeid = '9999', posid = '9999', employeeid = 'origis' } = body;

        const response = await fetch(`${ORBIS_API_URL}/setTransactionInit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ApiKey': API_KEY
            },
            body: JSON.stringify({
                cardnumber,
                storeid,
                posid,
                employeeid
            })
        });

        if (!response.ok) {
            throw new Error(`Orbis API Error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Orbis Init Error:', error);
        return NextResponse.json(
            { error: 'Failed to initialize transaction', details: error.message },
            { status: 500 }
        );
    }
}
