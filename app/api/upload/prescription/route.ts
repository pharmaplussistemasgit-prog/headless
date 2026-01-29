import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
    // 1. Check config
    if (!supabaseAdmin) {
        console.error("Supabase Admin client not initialized");
        return NextResponse.json(
            { error: 'Server configuration error: Database not connected' },
            { status: 500 }
        );
    }

    try {
        // 2. Parse Form Data
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No se ha subido ningún archivo' }, { status: 400 });
        }

        // 3. Validations
        // Types: Images (JPG, PNG, WEBP) and PDF
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Formato inválido. Solo se aceptan JPG, PNG o PDF.' },
                { status: 400 }
            );
        }

        // Size: Max 5MB
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'El archivo es demasiado pesado (Máx. 5MB).' },
                { status: 400 }
            );
        }

        // 4. Prepare Upload
        const fileExt = file.name.split('.').pop();
        // Secure random name: timestamp-randomUUID.ext
        const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
        const bucketName = 'medical-prescriptions';

        // Convert File to Buffer/ArrayBuffer for Node env
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 5. Upload to Supabase
        const { data, error } = await supabaseAdmin
            .storage
            .from(bucketName)
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (error) {
            console.error('Supabase Storage Error:', error);

            // Helpful error handling for missing bucket
            if (error.message.includes("The resource was not found") || error.message.includes("Bucket not found")) {
                return NextResponse.json(
                    { error: 'Error de configuración: El bucket de almacenamiento no existe.' },
                    { status: 500 }
                );
            }

            return NextResponse.json(
                { error: 'Error al guardar el archivo en la nube.' },
                { status: 500 }
            );
        }

        // 6. Get Public URL
        const { data: { publicUrl } } = supabaseAdmin
            .storage
            .from(bucketName)
            .getPublicUrl(fileName);

        return NextResponse.json({
            success: true,
            url: publicUrl,
            filename: fileName
        });

    } catch (error: any) {
        console.error('Upload Handler Exception:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor al procesar la subida.' },
            { status: 500 }
        );
    }
}
