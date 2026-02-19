"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface OfferCountDownProps {
    targetDate: string | null; // ISO string 
    className?: string;
    size?: "sm" | "md" | "lg";
}

export default function OfferCountDown({ targetDate, className, size = "sm" }: OfferCountDownProps) {
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (!targetDate) return;

        const calculateTimeLeft = () => {
            const now = new Date();
            // WooCommerce dates might be in UTC or local timezone depending on settings. 
            // Assuming ISO string which usually includes offset or Z, otherwise treated as local.
            // Ideally, ensure backend sends ISO 8601 with offset.
            const end = new Date(targetDate);
            const difference = end.getTime() - now.getTime();

            if (difference <= 0) {
                setIsExpired(true);
                setTimeLeft(null);
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            setTimeLeft({ days, hours, minutes, seconds });
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!targetDate || isExpired) return null;
    if (!timeLeft) return null; // Loading state

    const sizeClasses = {
        sm: { container: "gap-1", box: "w-8 h-8 rounded-md text-[10px]", label: "text-[7px]" },
        md: { container: "gap-2", box: "w-10 h-10 rounded-lg text-xs", label: "text-[8px]" },
        lg: { container: "gap-3", box: "w-14 h-14 rounded-xl text-lg", label: "text-[10px]" },
    };

    const currentSize = sizeClasses[size];

    return (
        <div className={cn("flex flex-col items-start", className)}>
            <div className="flex items-center gap-1.5 text-red-600 font-bold mb-1.5 animate-pulse">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs uppercase tracking-wider">La oferta termina en:</span>
            </div>
            <div className={cn("flex items-center", currentSize.container)}>
                <TimeBox value={timeLeft.days} label="DÍAS" size={currentSize} />
                <span className="text-gray-300 font-light -mt-2">:</span>
                <TimeBox value={timeLeft.hours} label="HRS" size={currentSize} />
                <span className="text-gray-300 font-light -mt-2">:</span>
                <TimeBox value={timeLeft.minutes} label="MIN" size={currentSize} />
                <span className="text-gray-300 font-light -mt-2">:</span>
                <TimeBox value={timeLeft.seconds} label="SEG" size={currentSize} isRed />
            </div>
        </div>
    );
}

function TimeBox({ value, label, size, isRed = false }: { value: number; label: string; size: any; isRed?: boolean }) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center border shadow-sm backdrop-blur-sm bg-white/80",
            size.box,
            isRed ? "border-red-100 text-red-600 bg-red-50/50" : "border-gray-100 text-gray-700"
        )}>
            <span className="font-bold leading-none">{value.toString().padStart(2, '0')}</span>
            <span className={cn("uppercase text-gray-400 font-medium", size.label)}>{label}</span>
        </div>
    );
}
