
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { bookParkingSlot } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface BookingFormProps {
  selectedSlot: number | null;
  onBookingComplete: () => void;
  onCancel: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ 
  selectedSlot, 
  onBookingComplete,
  onCancel
}) => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSlot) {
      toast({
        title: 'No slot selected',
        description: 'Please select a parking slot first',
        variant: 'destructive',
      });
      return;
    }
    
    if (!currentUser) {
      toast({
        title: 'Not logged in',
        description: 'You need to be logged in to book a slot',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await bookParkingSlot(
        currentUser.uid,
        selectedSlot,
        vehicleNumber
      );
      
      if (result.success) {
        toast({
          title: 'Booking successful!',
          description: `You've booked slot ${selectedSlot} for vehicle ${vehicleNumber}`,
        });
        onBookingComplete();
      } else {
        toast({
          title: 'Booking failed',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error booking slot:', error);
      toast({
        title: 'Booking failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto glass-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Book Parking Slot</CardTitle>
        <CardDescription>
          {selectedSlot 
            ? `You're booking slot ${selectedSlot}` 
            : 'Please select a slot first'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vehicleNumber">Vehicle Number</Label>
            <Input
              id="vehicleNumber"
              placeholder="e.g., ABC-1234"
              required
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              className="bg-white/10 border-white/20"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !selectedSlot}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? 'Booking...' : 'Book Now'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BookingForm;
