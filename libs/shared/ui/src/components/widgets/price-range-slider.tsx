import * as React from 'react';
import { cn } from '../../index';

export interface PriceRangeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  currencySymbol?: string;
  className?: string;
}

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min = 0,
  max = 10,
  step = 0.1,
  value,
  onChange,
  currencySymbol = 'ETH',
  className,
}) => {
  const [minVal, maxVal] = value;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextMin = Math.min(Number(e.target.value), maxVal - step);
    onChange([Math.max(min, Math.round(nextMin * 100) / 100), maxVal]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextMax = Math.max(Number(e.target.value), minVal + step);
    onChange([minVal, Math.min(max, Math.round(nextMax * 100) / 100)]);
  };

  const minPercent = Math.max(0, Math.min(100, ((minVal - min) / (max - min)) * 100));
  const maxPercent = Math.max(0, Math.min(100, ((maxVal - min) / (max - min)) * 100));

  return (
    <div className={cn('flex flex-col space-y-4 font-mono select-none w-full', className)}>
      <div className="flex items-center justify-between text-caption-12">
        <span className="text-text-secondary font-medium">Faixa de preço</span>
        <span className="font-bold text-text-primary">
          {minVal.toFixed(2)} - {maxVal.toFixed(2)} {currencySymbol}
        </span>
      </div>

      <div className="relative h-6 flex items-center">
        {/* Background track */}
        <div className="absolute w-full h-2 rounded-full bg-surface-raised border border-border-default" />

        {/* Active highlighted range */}
        <div
          className="absolute h-2 rounded-full bg-primary"
          style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
        />

        {/* Min thumb input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={handleMinChange}
          aria-label="Preço mínimo"
          aria-valuemin={min}
          aria-valuemax={maxVal}
          aria-valuenow={minVal}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none z-20 cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-text-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:shadow-md"
        />

        {/* Max thumb input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={handleMaxChange}
          aria-label="Preço máximo"
          aria-valuemin={minVal}
          aria-valuemax={max}
          aria-valuenow={maxVal}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none z-20 cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-text-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:shadow-md"
        />
      </div>

      <div className="flex items-center justify-between text-tiny-10 text-text-muted">
        <span>{min.toFixed(1)} {currencySymbol}</span>
        <span>{max.toFixed(1)} {currencySymbol}</span>
      </div>
    </div>
  );
};

PriceRangeSlider.displayName = 'PriceRangeSlider';
