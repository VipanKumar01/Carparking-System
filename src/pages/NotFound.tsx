
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/components/layout/PageContainer';
import { Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <PageContainer className="flex items-center justify-center">
      <div className="max-w-md text-center glass-card p-8 rounded-xl animate-fade-in">
        <h1 className="text-6xl font-bold text-primary mb-6">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button onClick={() => navigate('/')} className="px-6">
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    </PageContainer>
  );
};

export default NotFound;
