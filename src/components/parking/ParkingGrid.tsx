/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import ParkingSlot from './ParkingSlot';
import { getParkingStatus } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface ParkingGridProps {
  onSlotSelect?: (slotNumber: number) => void;
  selectedSlot?: number | null;
  disableSelection?: boolean;
}

interface ParkingStatus {
  slot1_status: 'Empty' | 'Fill';
  slot2_status: 'Empty' | 'Fill';
  slot3_status: 'Empty' | 'Fill';
  slot4_status: 'Empty' | 'Fill';
  slot5_status: 'Empty' | 'Fill';
  slot6_status: 'Empty' | 'Fill';
  slot_available: number;
  timestamp: any;
  change_description: string;
}

const ParkingGrid: React.FC<ParkingGridProps> = ({
  onSlotSelect,
  selectedSlot = null,
  disableSelection = false
}) => {
  const [parkingStatus, setParkingStatus] = useState<ParkingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);

      try {
        const result = await getParkingStatus();

        if (result.success) {
          setParkingStatus(result.data as ParkingStatus);
        } else {
          setError(result.error);
          toast({
            title: 'Error',
            description: result.error,
            variant: 'destructive',
          });
        }
      } catch (err: any) {
        console.error('Error fetching parking status:', err);
        setError(err.message);
        toast({
          title: 'Error',
          description: 'Failed to load parking status',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const intervalId = setInterval(fetchStatus, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId);
  }, [toast]);

  const handleSlotClick = (slotNumber: number) => {
    if (disableSelection) return;

    if (!isAuthenticated) {
      toast({
        title: 'Please login',
        description: 'You need to be logged in to book a parking slot',
        variant: 'destructive',
      });
      return;
    }

    // Check if slot is available
    const slotStatus = parkingStatus?.[`slot${slotNumber}_status` as keyof ParkingStatus];

    if (slotStatus !== 'Empty') {
      toast({
        title: 'Slot occupied',
        description: 'This parking slot is already occupied',
        variant: 'destructive',
      });
      return;
    }

    if (onSlotSelect) {
      onSlotSelect(slotNumber);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading parking slots...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!parkingStatus) {
    return (
      <Alert>
        <AlertTitle>No Data</AlertTitle>
        <AlertDescription>No parking status data available</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Parking Slots</h2>
        <div className="bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-border">
          <span className="font-medium">{parkingStatus.slot_available}</span> slots available
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5].map((slotNumber) => (
          <ParkingSlot
            key={slotNumber}
            slotNumber={slotNumber}
            status={parkingStatus[`slot${slotNumber}_status` as keyof ParkingStatus]}
            selected={selectedSlot === slotNumber}
            onClick={() => handleSlotClick(slotNumber)}
            disabled={disableSelection}
          />
        ))}
      </div>
      <div className="mt-4 text-sm text-muted-foreground">
        Last updated: {parkingStatus.timestamp?.toDate?.().toLocaleString() || 'Unknown'}
      </div>
    </div>
  );
};

export default ParkingGrid;
