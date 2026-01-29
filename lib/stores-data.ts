export interface Store {
    id: string;
    name: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    schedule: string[];
    coordinates: {
        lat: number;
        lng: number;
    };
    image: string;
    googleMapsUrl: string;
    embedUrl: string;
}

export const STORES: Store[] = [
    {
        id: 'sede-principal',
        name: 'Sede Principal - Calle 86',
        address: 'Calle 86 # 27-54',
        city: 'Bogotá D.C.',
        phone: '(601) 593 4010',
        email: 'atencionalusuario@pharmaplus.com.co',
        schedule: [
            'Lunes a Viernes: 7:00 AM - 7:00 PM',
            'Sábados: 8:00 AM - 4:00 PM',
            'Domingos y Festivos: Cerrado'
        ],
        coordinates: {
            lat: 4.673258,
            lng: -74.056094
        },
        image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=2073&auto=format&fit=crop', // Placeholder pro
        googleMapsUrl: 'https://maps.app.goo.gl/pharmaplus-main', // Replace with real link if available
        embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.626707833878!2d-74.05828268465057!3d4.673258043305417!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9a7065099b21%3A0x608149e1399f5795!2sCl.%2086%20%2327-54%2C%20Bogot%C3%A1!5e0!3m2!1ses!2sco!4v1700000000000!5m2!1ses!2sco'
    }
];
