
import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 bg-background border-t border-border mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ParkSmart. All rights reserved.
          </p>
          
          <div className="flex items-center mt-4 md:mt-0">
            <p className="text-sm text-muted-foreground flex items-center">
              Made with <Heart className="h-3 w-3 mx-1 text-red-500" /> by the ParkSmart Team
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
