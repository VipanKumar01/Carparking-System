
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Car, LogIn, LogOut, User, Home } from 'lucide-react';

const Navbar: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      const result = await signOut();
      
      if (result.success) {
        toast({
          title: 'Signed out',
          description: 'You have been signed out successfully',
        });
        navigate('/');
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Something went wrong during sign out',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  return (
    <header className="w-full fixed top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Car className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">ParkSmart</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-1">
          <Link to="/" className="px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors flex items-center">
            <Home className="h-4 w-4 mr-1" />
            Home
          </Link>
          
          {isAuthenticated && (
            <Link to="/dashboard" className="px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors flex items-center">
              <User className="h-4 w-4 mr-1" />
              Dashboard
            </Link>
          )}
        </nav>
        
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <>
              <span className="text-sm hidden md:inline-block">
                {currentUser?.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  <LogIn className="h-4 w-4 mr-1" />
                  Sign In
                </Button>
              </Link>
              <Link to="/register" className="hidden md:inline-block">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
