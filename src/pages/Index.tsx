
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import ParkingGrid from '@/components/parking/ParkingGrid';
import { Car, CheckCircle, Clock, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { currentUser, isAuthenticated } = useAuth();
  return (
    <PageContainer>
      <div className="w-full max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="py-12 md:py-20 flex flex-col items-center text-center">
          <div className="space-y-2 mb-8">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight animate-fade-in">
              Smart Parking Made Easy
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Book, manage, and pay for parking spaces with just a few clicks
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {!isAuthenticated &&
              (<Link to="/login">
                <Button size="lg" className="text-lg">
                  Get Started
                </Button>
              </Link>)}
            <a href="#features">
              <Button size="lg" variant="outline" className="text-lg">
                Learn More
              </Button>
            </a>
          </div>
        </section>

        {/* Parking Availability */}
        <section className="py-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">Live Parking Availability</h2>
            <p className="text-muted-foreground">See which parking slots are currently available</p>
          </div>

          <ParkingGrid disableSelection={true} />
        </section>

        {/* Features */}
        <section id="features" className="py-12 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Why Choose ParkSmart?</h2>
            <p className="text-muted-foreground">Revolutionizing the parking experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Car className="h-12 w-12 text-primary" />,
                title: "Real-time Availability",
                description: "See which parking slots are available in real-time, no more driving around searching for a spot."
              },
              {
                icon: <Clock className="h-12 w-12 text-primary" />,
                title: "Time-based Billing",
                description: "Pay only for the time you use. Our system calculates charges by the minute for maximum efficiency."
              },
              {
                icon: <CreditCard className="h-12 w-12 text-primary" />,
                title: "Easy Payments",
                description: "Multiple payment options available including credit cards, digital wallets, and cash."
              },
              {
                icon: <CheckCircle className="h-12 w-12 text-primary" />,
                title: "Secure Booking",
                description: "Once you book a slot, it's yours until you leave. No worries about someone taking your spot."
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="glass-card p-6 rounded-xl flex flex-col items-center text-center animate-fade-in"
                style={{ animationDelay: `${0.2 * index}s` }}
              >
                <div className="mb-4 p-3 bg-primary/10 rounded-full">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        {!isAuthenticated && (<section className="py-12 md:py-20 text-center">
          <div className="glass-card p-8 md:p-12 rounded-xl animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of drivers who have simplified their parking experience with ParkSmart.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="text-lg">
                  Create Account
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>)}
      </div>
    </PageContainer>
  );
};

export default Index;
