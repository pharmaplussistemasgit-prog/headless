import { NextRequest, NextResponse } from 'next/server';
import { getCitiesByState, getAllStates } from '@/lib/shipping-rates';
import { ISO_TO_DANE_MAP } from '@/lib/colombia-data';

/**
 * GET /api/shipping/cities?stateCode=05
 * Obtiene las ciudades de un departamento específico
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const stateCode = searchParams.get('stateCode');

        // Si no se proporciona stateCode, retornar todos los departamentos
        if (!stateCode) {
            const states = getAllStates();
            return NextResponse.json({
                success: true,
                data: states,
            }, {
                status: 200,
                headers: {
                    'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
                },
            });
        }

        // Convertir código ISO a código DANE
        const stateCodeDANE = ISO_TO_DANE_MAP[stateCode];

        if (!stateCodeDANE) {
            return NextResponse.json({
                success: false,
                error: 'INVALID_STATE_CODE',
                message: `Código de departamento inválido: ${stateCode}`,
            }, { status: 400 });
        }

        // Obtener ciudades del departamento usando código DANE
        const cities = getCitiesByState(stateCodeDANE);

        if (cities.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'STATE_NOT_FOUND',
                message: `No se encontraron ciudades para el departamento ${stateCode}`,
            }, { status: 404 });
        }

        // Mapear a formato simple
        const cityOptions = cities.map(city => ({
            code: city.cityCode,
            name: city.cityName,
        }));

        return NextResponse.json({
            success: true,
            data: cityOptions,
        }, {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
            },
        });
    } catch (error) {
        console.error('❌ [ShippingCities] Error:', error);

        return NextResponse.json({
            success: false,
            error: 'INTERNAL_ERROR',
            message: 'Error al obtener las ciudades',
        }, { status: 500 });
    }
}
