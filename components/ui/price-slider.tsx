"use client";

import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";

interface PriceSliderProps {
    min: number;
    max: number;
    step?: number;
    value: [number, number];
    onChange: (value: [number, number]) => void;
    formatLabel?: (value: number) => string;
}

export function PriceSlider({
    min,
    max,
    step = 1000,
    value,
    onChange,
    formatLabel = (v) => `$${v}`,
}: PriceSliderProps) {
    // Local state for smooth sliding before committing
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleValueChange = (newValue: number[]) => {
        setLocalValue(newValue as [number, number]);
    };

    const handleCommit = (newValue: number[]) => {
        onChange(newValue as [number, number]);
    };

    return (
        <div className="w-full px-2 py-4">
            {/* Radix Slider */}
            <div className="mb-6">
                <Slider
                    defaultValue={value}
                    value={localValue}
                    min={min}
                    max={max}
                    step={step}
                    onValueChange={handleValueChange}
                    onValueCommit={handleCommit}
                    className="py-4"
                />
            </div>

            {/* Inputs / Labels */}
            <div className="flex items-center justify-between gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 flex flex-col w-28">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Mínimo</span>
                    <span className="text-sm font-bold text-gray-700">{formatLabel(localValue[0])}</span>
                </div>
                <div className="h-[1px] bg-gray-300 w-4"></div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 flex flex-col w-28 text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Máximo</span>
                    <span className="text-sm font-bold text-gray-700">{formatLabel(localValue[1])}</span>
                </div>
            </div>
        </div>
    );
}
