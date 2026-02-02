'use client';

import { useEffect, useState } from 'react';
import { fetchB2CPromotions, fetchB2BPromotions } from '@/lib/erp-promotions';
import { appendPromotions, Promotion } from '@/lib/promotions';
// Import auth hook if available, e.g. useAuth from a context
// import { useAuth } from '@/context/AuthContext'; 

export function PromotionsProvider({ children }: { children: React.ReactNode }) {
    const [loaded, setLoaded] = useState(false);
    // const { user } = useAuth(); // If we have auth context to detect login

    useEffect(() => {
        async function loadB2C() {
            try {
                const b2cRules = await fetchB2CPromotions();
                if (b2cRules.length > 0) {
                    console.log('📦 Loaded B2C Promotions:', b2cRules.length);
                    appendPromotions(b2cRules);
                }
            } catch (err) {
                console.error('Failed to load B2C promotions', err);
            } finally {
                setLoaded(true);
            }
        }

        loadB2C();
    }, []);

    // Effect for B2B (Separate or combined)
    // useEffect(() => {
    //    if (user && user.isB2B) {
    //        fetchB2BPromotions(user.id).then(rules => appendPromotions(rules));
    //    }
    // }, [user]);

    return <>{children}</>;
}
