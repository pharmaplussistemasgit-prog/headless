# Plan de Implementación: [T20] Pastillero Virtual 🔴

## Contexto
El "Pastillero Virtual" es una herramienta de fidelización que permite a los usuarios programar recordatorios de toma de medicamentos y reposición de stock.

## Requerimientos T20
1.  **Dashboard:** Página `/pastillero` protegida (o con almacenamiento local si es guest).
2.  **Funcionalidad:**
    *   Agregar Medicamento (Nombre, Dosis, Frecuencia).
    *   Configurar Alertas (Hora, Días).
    *   **Notificaciones SMS:** Integración con proveedor (Simulado inicialmente).
3.  **Persistencia:** LocalStorage (MVP) o Base de Datos (Ideal). *Usaremos LocalStorage para MVP rápido*.

## Estrategia Técnica

### 1. Estructura de Datos (`types/pillbox.ts`)
```typescript
interface PillReminder {
    id: string;
    medicineName: string;
    dosage: string; // "1 tableta"
    frequency: number; // horas (cada 8h)
    nextDose: Date;
    phone: string;
    active: boolean;
}
```

### 2. UI - `/app/pastillero/page.tsx`
*   **Header:** "Mi Salud al Día".
*   **Lista:** Cards con los medicamentos activos.
*   **Formulario (Modal):** Agregar nuevo tratamiento.
*   **Simulación SMS:** Al "activar", mostrar un Toast simulando "SMS enviado a 3001234567: Hora de tu medicina".

### 3. Servicio Mock (`lib/sms-service.ts`)
*   `scheduleReminder(reminder)`: Simula la programación en un cron job externo.

## Archivos Afectados
*   `[NEW] app/pastillero/page.tsx`
*   `[NEW] components/pillbox/ReminderCard.tsx`
*   `[NEW] components/pillbox/AddReminderModal.tsx`
*   `[NEW] lib/pillbox.ts`

## Pasos
1.  Crear estructura de página y layouts.
2.  Implementar lógica de CRUD en local storage.
3.  Simular el dispatch de SMS.
