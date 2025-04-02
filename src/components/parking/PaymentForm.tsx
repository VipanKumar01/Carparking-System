/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { processPayment } from '@/lib/firebase';
import { Loader2, CreditCard, Wallet, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PaymentFormProps {
  bookingId: string;
  amount: number;
  durationMinutes: number;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  bookingId,
  amount,
  durationMinutes
}) => {
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(bookingId);
    console.log(amount);
    console.log(durationMinutes);
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const result = await processPayment(bookingId, paymentMethod);

      if (result.success) {
        toast({
          title: 'Payment successful',
          description: 'Thank you for your payment!',
        });
        navigate('/', { replace: true });
      } else {
        toast({
          title: 'Payment failed',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Payment failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto glass-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Complete Payment</CardTitle>
        <CardDescription>
          Your parking session has ended
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Parking Summary</h3>
          <div className="bg-background/60 p-4 rounded-md">
            <div className="flex justify-between items-center">
              <span>Duration</span>
              <span className="font-medium">
                {Math.floor(durationMinutes / 60) > 0
                  ? `${Math.floor(durationMinutes / 60)} hours `
                  : ''}
                {durationMinutes % 60} minutes
              </span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Amount</span>
              <span className="text-primary">${amount}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Choose Payment Method</h3>
            <RadioGroup
              defaultValue="credit_card"
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2 bg-background/60 p-3 rounded-md hover:bg-background/80 transition-colors">
                <RadioGroupItem value="credit_card" id="credit_card" />
                <Label htmlFor="credit_card" className="flex items-center w-full cursor-pointer">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Credit / Debit Card
                </Label>
              </div>
              <div className="flex items-center space-x-2 bg-background/60 p-3 rounded-md hover:bg-background/80 transition-colors">
                <RadioGroupItem value="wallet" id="wallet" />
                <Label htmlFor="wallet" className="flex items-center w-full cursor-pointer">
                  <Wallet className="w-4 h-4 mr-2" />
                  Digital Wallet
                </Label>
              </div>
              <div className="flex items-center space-x-2 bg-background/60 p-3 rounded-md hover:bg-background/80 transition-colors">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="flex items-center w-full cursor-pointer">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Cash
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isProcessing}
          >
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isProcessing ? 'Processing...' : `Pay $${amount}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
