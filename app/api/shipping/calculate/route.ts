import { NextRequest, NextResponse } from 'next/server';
import {
    getShippingRateByCityCode,
    getShippingRateByCityName,
    formatShippingCost,
    type ShippingRate,
} from '@/lib/shipping-rates';

/**
 * Interfaz para el request body
 */
interface CalculateShippingRequest {
    cityCode?: string;
    cityName?: string;
    stateName?: string;
}

/**
 * Interfaz para la respuesta exitosa
 */
interface CalculateShippingResponse {
    success: true;
    data: {
        cityCode: string;
        cityName: string;
        stateName: string;
        stateCode: string;
        shippingCost: number;
        deliveryDays: number;
        formattedCost: string;
    };
}

/**
 * Interfaz para la respuesta de error
 */
interface ErrorResponse {
    success: false;
    error: string;
    message: string;
}

/**
 * POST /api/shipping/calculate
 * Calcula el costo de envío basado en la ciudad de destino
 */
export async function POST(request: NextRequest) {
    try {
        const body: CalculateShippingRequest = await request.json();

        const { cityCode, cityName, stateName } = body;

        // Validar que se proporcione al menos un parámetro de búsqueda
        if (!cityCode && !cityName) {
            return NextResponse.json<ErrorResponse>(
                {
                    success: false,
                    error: 'MISSING_PARAMETERS',
                    message: 'Debe proporcionar cityCode o cityName',
                },
                { status: 400 }
            );
        }

        let shippingRate: ShippingRate | null = null;

        // Buscar por código de ciudad (más preciso)
        if (cityCode) {
            shippingRate = getShippingRateByCityCode(cityCode);
        }

        // Si no se encuentra por código, buscar por nombre
        if (!shippingRate && cityName) {
            shippingRate = getShippingRateByCityName(cityName, stateName);
        }

        // Si no se encuentra la ciudad
        if (!shippingRate) {
            return NextResponse.json<ErrorResponse>(
                {
                    success: false,
                    error: 'CITY_NOT_FOUND',
                    message: `No se encontró información de envío para la ciudad especificada`,
                },
                { status: 404 }
            );
        }

        // Retornar la información de envío
        const response: CalculateShippingResponse = {
            success: true,
            data: {
                cityCode: shippingRate.cityCode,
                cityName: shippingRate.cityName,
                stateName: shippingRate.stateName,
                stateCode: shippingRate.stateCode,
                shippingCost: shippingRate.shippingCost,
                deliveryDays: shippingRate.deliveryDays,
                formattedCost: formatShippingCost(shippingRate.shippingCost),
            },
        };

        return NextResponse.json(response, {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
            },
        });
    } catch (error) {
        console.error('❌ [ShippingCalculate] Error:', error);

        return NextResponse.json<ErrorResponse>(
            {
                success: false,
                error: 'INTERNAL_ERROR',
                message: 'Error al calcular el costo de envío',
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/shipping/calculate?cityCode=05001
 * Alternativa GET para calcular el costo de envío
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const cityCode = searchParams.get('cityCode');
        const cityName = searchParams.get('cityName');
        const stateName = searchParams.get('stateName');

        // Validar que se proporcione al menos un parámetro de búsqueda
        if (!cityCode && !cityName) {
            return NextResponse.json<ErrorResponse>(
                {
                    success: false,
                    error: 'MISSING_PARAMETERS',
                    message: 'Debe proporcionar cityCode o cityName',
                },
                { status: 400 }
            );
        }

        let shippingRate: ShippingRate | null = null;

        // Buscar por código de ciudad (más preciso)
        if (cityCode) {
            shippingRate = getShippingRateByCityCode(cityCode);
        }

        // Si no se encuentra por código, buscar por nombre
        if (!shippingRate && cityName) {
            shippingRate = getShippingRateByCityName(cityName, stateName || undefined);
        }

        // Si no se encuentra la ciudad
        if (!shippingRate) {
            return NextResponse.json<ErrorResponse>(
                {
                    success: false,
                    error: 'CITY_NOT_FOUND',
                    message: `No se encontró información de envío para la ciudad especificada`,
                },
                { status: 404 }
            );
        }

        // Retornar la información de envío
        const response: CalculateShippingResponse = {
            success: true,
            data: {
                cityCode: shippingRate.cityCode,
                cityName: shippingRate.cityName,
                stateName: shippingRate.stateName,
                stateCode: shippingRate.stateCode,
                shippingCost: shippingRate.shippingCost,
                deliveryDays: shippingRate.deliveryDays,
                formattedCost: formatShippingCost(shippingRate.shippingCost),
            },
        };

        return NextResponse.json(response, {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
            },
        });
    } catch (error) {
        console.error('❌ [ShippingCalculate] Error:', error);

        return NextResponse.json<ErrorResponse>(
            {
                success: false,
                error: 'INTERNAL_ERROR',
                message: 'Error al calcular el costo de envío',
            },
            { status: 500 }
        );
    }
}
