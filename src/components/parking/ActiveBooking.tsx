/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { exitParkingSlot } from '@/lib/firebase';
import { Loader2, CheckCircle2, Clock, Car } from 'lucide-react';
import { format } from 'date-fns';

interface BookingData {
  id: string;
  slotNumber: number;
  vehicleNumber: string;
  entryTime: { toDate: () => Date };
  userId: string;
  status: string;
  paymentStatus: string;
}

interface ActiveBookingProps {
  booking: BookingData;
  onExit: () => void;
}

const ActiveBooking: React.FC<ActiveBookingProps> = ({ booking, onExit }) => {
  const [isExiting, setIsExiting] = useState(false);
  const { toast } = useToast();

  const handleExit = async () => {
    setIsExiting(true);

    try {
      const result = await exitParkingSlot(booking.id);

      if (result.success) {
        toast({
          title: 'Exit successful',
          description: `Your booking has ended. Total amount: $${result.data.amount}`,
        });
        onExit();
      } else {
        toast({
          title: 'Exit failed',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error exiting parking:', error);
      toast({
        title: 'Exit failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsExiting(false);
    }
  };

  const calculateDuration = () => {
    const now = new Date();
    const entryTime = booking.entryTime.toDate();
    const durationMs = now.getTime() - entryTime.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));

    return {
      minutes: durationMinutes % 60,
      hours: Math.floor(durationMinutes / 60),
      totalMinutes: durationMinutes
    };
  };

  const duration = calculateDuration();
  const estimatedCost = duration.totalMinutes; // $1 per minute

  return (
    <Card className="w-full glass-card">
      <CardHeader className="space-y-1">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">Active Booking</CardTitle>
          <div className="bg-green-500/20 text-green-600 px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-1" /> Active
          </div>
        </div>
        <CardDescription>
          Your vehicle is currently parked
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Slot Number</p>
            <p className="text-lg font-semibold">Slot {booking.slotNumber}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Vehicle Number</p>
            <p className="text-lg font-semibold flex items-center">
              <Car className="w-4 h-4 mr-1" /> {booking.vehicleNumber}
            </p>
          </div>
        </div>

        <Separator />

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Entry Time</p>
          <p className="text-lg font-semibold flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {format(booking.entryTime.toDate(), 'PPp')}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Duration</p>
          <p className="text-lg font-semibold">
            {duration.hours > 0 ? `${duration.hours} hours ` : ''}
            {duration.minutes} minutes
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Estimated Cost</p>
          <p className="text-2xl font-bold text-primary">${estimatedCost}</p>
          <p className="text-xs text-muted-foreground">$1.00 per minute</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant="destructive"
          onClick={handleExit}
          disabled={isExiting}
        >
          {isExiting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isExiting ? 'Processing Exit...' : 'Exit Parking'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ActiveBooking;
