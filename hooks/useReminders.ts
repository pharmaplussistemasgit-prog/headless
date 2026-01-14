"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export interface Reminder {
    id: string;
    productName: string;
    productImage?: string; // Optional, can be generic if not selected from store
    frequency: string; // e.g., "Todos los días", "Cada 8 horas"
    dosage: string; // e.g., "1 tableta", "2 pufs"
    times: string[]; // ["08:00", "20:00"]
    startDate: string; // ISO Date "2024-01-01"
    duration?: string; // "Permanente" or number of days
    totalQuantity?: number; // For inventory tracking
    currentQuantity?: number;
    notify: boolean;
    notifyLowStock: boolean;
    lowStockThreshold?: number;
}

export interface LogEntry {
    reminderId: string;
    date: string; // "2024-01-01"
    time: string; // "08:00"
    taken: boolean;
    takenAt?: string; // ISO Timestamp
}

const STORAGE_KEY_REMINDERS = "pharma_pillbox_reminders";
const STORAGE_KEY_LOGS = "pharma_pillbox_logs";

export function useReminders() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    // Sync state
    const [isSyncing, setIsSyncing] = useState(false);

    // Initial Load & Auth Check
    useEffect(() => {
        const loadInitialData = async () => {
            // 1. Load Local
            const storedReminders = localStorage.getItem(STORAGE_KEY_REMINDERS);
            const storedLogs = localStorage.getItem(STORAGE_KEY_LOGS);

            let localReminders = storedReminders ? JSON.parse(storedReminders) : [];
            if (storedReminders) setReminders(localReminders);
            if (storedLogs) setLogs(JSON.parse(storedLogs));
            setLoading(false);

            // 2. Load Remote (Silent Sync)
            const token = localStorage.getItem('pharma_auth_token');
            if (token) {
                try {
                    setIsSyncing(true);
                    const response = await fetch('/api/sync-pillbox', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.reminders && Array.isArray(data.reminders) && data.reminders.length > 0) {
                            // Merge Strategy: Remote wins on conflicts or purely additive?
                            // For simplicity Phase 2: Remote wins if exists, otherwise keep local (Union)
                            // Actually, let's just use Remote as Single Source of Truth if logged in, 
                            // but initializing it with Local if Remote is empty.

                            // Strategy: Combine unique IDs
                            const remoteReminders = data.reminders;
                            const combined = [...remoteReminders];

                            // Add local ones that aren't in remote (e.g. created offline)
                            localReminders.forEach((loc: any) => {
                                if (!combined.find(r => r.id === loc.id)) {
                                    combined.push(loc);
                                }
                            });

                            setReminders(combined);
                            // Also save this merged state back to local for offline support next time
                            localStorage.setItem(STORAGE_KEY_REMINDERS, JSON.stringify(combined));
                        }
                    }
                } catch (error) {
                    console.error("Silent Sync Load Error:", error);
                } finally {
                    setIsSyncing(false);
                }
            }
        };

        loadInitialData();
    }, []);

    // Save to LocalStorage & Sync to Cloud
    useEffect(() => {
        if (!loading) {
            // Local Save
            localStorage.setItem(STORAGE_KEY_REMINDERS, JSON.stringify(reminders));
            localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));

            // Remote Sync (Debounced ideally, but here direct for simplicity)
            const token = localStorage.getItem('pharma_auth_token');
            if (token && reminders.length > 0) {
                // We use a small timeout to debounce rapid changes
                const timeoutId = setTimeout(async () => {
                    try {
                        await fetch('/api/sync-pillbox', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ reminders })
                        });
                    } catch (err) {
                        console.error("Silent Sync Save Error:", err);
                    }
                }, 1000); // 1s debounce

                return () => clearTimeout(timeoutId);
            }
        }
    }, [reminders, logs, loading]);

    const addReminder = (reminder: Omit<Reminder, "id">) => {
        const newReminder = { ...reminder, id: uuidv4() };
        setReminders((prev) => [...prev, newReminder]);
    };

    const deleteReminder = (id: string) => {
        setReminders((prev) => prev.filter((r) => r.id !== id));
        // Also clean up logs? Maybe keep for history.
    };

    const updateReminder = (id: string, updates: Partial<Reminder>) => {
        setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    };

    const markAsTaken = (reminderId: string, date: string, time: string) => {
        const newLog: LogEntry = {
            reminderId,
            date,
            time,
            taken: true,
            takenAt: new Date().toISOString(),
        };

        // Remove existing log for this slot if any (toggle logic or overwrite?)
        // Let's assume overwrite/add
        setLogs((prev) => {
            const exists = prev.find(l => l.reminderId === reminderId && l.date === date && l.time === time);
            if (exists) return prev; // Already taken
            return [...prev, newLog];
        });

        // Deduct inventory if tracked
        const reminder = reminders.find(r => r.id === reminderId);
        if (reminder && reminder.currentQuantity !== undefined && reminder.currentQuantity > 0) {
            updateReminder(reminderId, { currentQuantity: reminder.currentQuantity - 1 });
        }
    };

    const unmarkTaken = (reminderId: string, date: string, time: string) => {
        setLogs((prev) => prev.filter(l => !(l.reminderId === reminderId && l.date === date && l.time === time)));
        // Restore inventory if tracked?
        const reminder = reminders.find(r => r.id === reminderId);
        if (reminder && reminder.currentQuantity !== undefined) {
            updateReminder(reminderId, { currentQuantity: reminder.currentQuantity + 1 });
        }
    };

    const getDailyReminders = (date: string) => {
        // Simple logic: returns all reminders active on this date
        // TODO: Filter by frequency/startDate/duration logic for more complex schedules
        return reminders.filter(r => new Date(r.startDate) <= new Date(date));
    };

    const getLogForSlot = (reminderId: string, date: string, time: string) => {
        return logs.find(l => l.reminderId === reminderId && l.date === date && l.time === time);
    };

    return {
        reminders,
        logs,
        loading,
        isSyncing,
        addReminder,
        deleteReminder,
        updateReminder,
        markAsTaken,
        unmarkTaken,
        getDailyReminders,
        getLogForSlot
    };
}
