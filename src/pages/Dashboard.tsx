/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import ParkingGrid from '@/components/parking/ParkingGrid';
import BookingForm from '@/components/parking/BookingForm';
import ActiveBooking from '@/components/parking/ActiveBooking';
import PaymentForm from '@/components/parking/PaymentForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { getActiveBooking, getUserBookings } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar, History } from 'lucide-react';

const Dashboard = () => {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [completedBooking, setCompletedBooking] = useState<any>(null);
  const [bookingHistory, setBookingHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [standupDuration, setStandupDuration] = useState(Number);
  const [standupAmount, setStandupAmount] = useState(Number);
  const { currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, isLoading]);

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A';

    // If it's a Firebase server timestamp object
    if (typeof timestamp === 'object' && timestamp.hasOwnProperty('seconds')) {
      return new Date(timestamp?.seconds * 1000).toLocaleString();
    }

    // If it's a regular timestamp number
    if (typeof timestamp === 'number') {
      return new Date(timestamp).toLocaleString();
    }

    return 'N/A';
  };

  const calculateAmountAndDuration = (entryTime: any) => {
    const entryDate = new Date(entryTime?.seconds * 1000); // Convert Firebase timestamp to Date
    const now = new Date(); // Current time

    // Calculate the duration in milliseconds
    const durationMs = now.getTime() - entryDate.getTime();

    // Convert the duration to minutes
    const durationMinutes = Math.floor(durationMs / (1000 * 60));

    // Calculate amount ($1 per minute)
    const amount = durationMinutes;

    return {
      durationMinutes,
      amount
    };
  };

  const fetchBookingTime = async () => {
    const activeResult = await getActiveBooking(currentUser.uid);

    const { durationMinutes, amount } = calculateAmountAndDuration(activeResult?.data?.entryTime);
    console.log('Duration in minutes:', durationMinutes);
    console.log('Amount: $', amount);
    setStandupDuration(durationMinutes);
    setStandupAmount(amount);

    if (activeResult.success) {
      setActiveBooking(activeResult.data);
    }
  }

  const fetchData = async () => {
    if (!currentUser) return;

    setIsLoading(true);

    try {
      const activeResult = await getActiveBooking(currentUser.uid);
      fetchBookingTime();
      if (activeResult.success) {
        setActiveBooking(activeResult.data);
      }


      // Get booking history
      const historyResult = await getUserBookings(currentUser.uid);
      console.log("historyResult==>>", historyResult.data);

      if (historyResult.success) {
        // Filter out active bookings and sort by entry time descending
        const history = historyResult.data
          .filter((booking: any) => booking.status !== 'active')
          .sort((a: any, b: any) => {
            const aTime = a.entryTime || 0;
            const bTime = b.entryTime || 0;
            return bTime - aTime; // Sort descending
          });

        setBookingHistory(history);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your booking data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const handleSlotSelect = (slotNumber: number) => {
    setSelectedSlot(slotNumber);
    setIsBooking(true);
  };

  const handleBookingComplete = () => {
    setSelectedSlot(null);
    setIsBooking(false);
    fetchData();
  };

  const handleExitComplete = () => {
    setCompletedBooking(activeBooking);
    setActiveBooking(null);
  };

  const handlePaymentComplete = () => {
    setCompletedBooking(null);
    fetchData();
  };

  if (isLoading) {
    return (
      <PageContainer className="flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading your dashboard...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-3/5">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            {isBooking ? (
              <BookingForm
                selectedSlot={selectedSlot}
                onBookingComplete={handleBookingComplete}
                onCancel={() => {
                  setSelectedSlot(null);
                  setIsBooking(false);
                }}
              />
            ) : (
              completedBooking ? (
                <PaymentForm
                  bookingId={completedBooking.id}
                  amount={standupAmount}
                  durationMinutes={standupDuration}
                  onPaymentComplete={handlePaymentComplete}
                />
              ) : (
                <ParkingGrid
                  onSlotSelect={handleSlotSelect}
                  selectedSlot={selectedSlot}
                  disableSelection={!!activeBooking}
                />
              )
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-2/5">
            {activeBooking ? (
              <ActiveBooking
                booking={activeBooking}
                onExit={handleExitComplete}
              />
            ) : (
              <Tabs defaultValue="current">
                <TabsList className="w-full">
                  <TabsTrigger value="current" className="flex-1">
                    <Calendar className="w-4 h-4 mr-1" /> Current Status
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex-1">
                    <History className="w-4 h-4 mr-1" /> History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="current">
                  <Card>
                    <CardHeader>
                      <CardTitle>Parking Status</CardTitle>
                      <CardDescription>
                        {activeBooking
                          ? "Your current parking booking"
                          : "You don't have any active parking bookings"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-6">
                        <p className="text-muted-foreground mb-4">
                          Select an available parking slot to book it
                        </p>
                        <Button
                          onClick={() => document.getElementById('parking-grid')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                          View Available Slots
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="history">
                  <Card>
                    <CardHeader>
                      <CardTitle>Booking History</CardTitle>
                      <CardDescription>
                        Your past parking bookings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {bookingHistory.length === 0 ? (
                        <div className="text-center py-6">
                          <p className="text-muted-foreground">
                            You don't have any past bookings
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {bookingHistory.map((booking) => (
                            <div
                              key={booking.id}
                              className="p-4 rounded-md border border-border bg-background/60"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">Slot {booking.slotNumber}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Vehicle: {booking.vehicleNumber}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">${booking.amount || 'N/A'}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {booking.durationMinutes
                                      ? `${Math.floor(booking.durationMinutes / 60) > 0
                                        ? `${Math.floor(booking.durationMinutes / 60)}h `
                                        : ''}${booking.durationMinutes % 60}m`
                                      : 'N/A'}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2 flex justify-between items-center text-xs text-muted-foreground">
                                <span>
                                  {formatTimestamp(booking.entryTime)}
                                </span>
                                <span className={`px-2 py-1 rounded-full ${booking.paymentStatus === 'completed'
                                  ? 'bg-green-500/20 text-green-600'
                                  : 'bg-orange-500/20 text-orange-600'
                                  }`}>
                                  {booking.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Dashboard;