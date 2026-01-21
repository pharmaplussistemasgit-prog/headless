export const FILTER_TAG_MAPPING = {
    // FACETA DE USO / FORMA FARMACÉUTICA
    usage: {
        label: "Forma de Uso",
        groups: [
            {
                id: "oral",
                label: "Oral (Tabletas, Jarabes)",
                tags: ["oral", "tableta", "capsula", "comprimido", "jarabe", "suspension", "gotas-orales"]
            },
            {
                id: "topico",
                label: "Tópico (Cremas, Geles)",
                tags: ["topico", "crema", "gel", "pomada", "locion", "unguento"]
            },
            {
                id: "oftalmico",
                label: "Oftálmico (Ojos)",
                tags: ["oftalmico", "solucion-oftalmica", "gotas-oftalmicas", "colirio", "lubricante-del-ojo", "lagrim-arti"]
            },
            {
                id: "inyectable",
                label: "Inyectable",
                tags: ["inyectable", "ampolla", "vial"]
            },
            {
                id: "nasal",
                label: "Nasal",
                tags: ["nasal", "spray-nasal"]
            }
        ]
    },

    // FACETA DE CONDICIÓN / NECESIDAD
    condition: {
        label: "Condición / Necesidad",
        groups: [
            {
                id: "piel",
                label: "Cuidado de la Piel",
                tags: ["acne", "dermatologico", "protector-solar", "hidratante-antiedad", "emolientes", "reparador", "cicatrizante"]
            },
            {
                id: "dolor",
                label: "Dolor y Fiebre",
                tags: ["analgesico", "antiinflamatorio", "fiebre-y-dolores", "migrana"]
            },
            {
                id: "respiratorio",
                label: "Gripe y Respiratorio",
                tags: ["antigripale", "tos", "gripe", "resfriado", "broncodilatador", "congestion"]
            },
            {
                id: "digestivo",
                label: "Estómago y Digestión",
                tags: ["gastroproci", "reflujo", "antiacido", "diarrea", "colon"]
            },
            {
                id: "cronicos",
                label: "Cuidado Crónico",
                tags: ["hipertentension-arte", "diabetes", "hipotiroidismo", "colesterol", "trigliceridos"]
            },
            {
                id: "antibioticos",
                label: "Infecciones (Antibióticos)",
                tags: ["antibiotico", "infecciones", "antimicotico", "antiviral"]
            }
        ]
    }
};
