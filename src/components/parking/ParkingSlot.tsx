
import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Car } from 'lucide-react';

interface ParkingSlotProps {
  slotNumber: number;
  status: 'Empty' | 'Fill';
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const ParkingSlot: React.FC<ParkingSlotProps> = ({
  slotNumber,
  status,
  selected,
  onClick,
  disabled = false,
}) => {
  const isAvailable = status === 'Empty';
  
  return (
    <Card
      className={cn(
        'parking-slot h-40 flex flex-col items-center justify-center p-4 cursor-pointer transition-all duration-300',
        isAvailable ? 'bg-parking-available/20 border-parking-available/30' : 'bg-parking-occupied/10 border-parking-occupied/30',
        selected && 'ring-2 ring-parking-selected border-parking-selected/50 transform scale-105 bg-parking-selected/10',
        disabled && 'opacity-50 cursor-not-allowed',
        'hover:shadow-lg'
      )}
      onClick={disabled ? undefined : onClick}
    >
      <div className="text-2xl font-bold mb-2">Slot {slotNumber}</div>
      
      <div className={cn(
        'rounded-full w-16 h-16 flex items-center justify-center mb-2',
        isAvailable ? 'bg-parking-available/20' : 'bg-parking-occupied/20'
      )}>
        <Car 
          size={32} 
          className={cn(
            'transition-all duration-500',
            isAvailable ? 'text-parking-available opacity-50' : 'text-parking-occupied vehicle-enter'
          )} 
        />
      </div>
      
      <div className={cn(
        'text-sm font-medium px-3 py-1 rounded-full',
        isAvailable ? 'bg-parking-available/20 text-parking-available' : 'bg-parking-occupied/20 text-parking-occupied'
      )}>
        {isAvailable ? 'Available' : 'Occupied'}
      </div>
    </Card>
  );
};

export default ParkingSlot;
