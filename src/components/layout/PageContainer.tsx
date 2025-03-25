
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className={`flex-1 container mx-auto px-4 pt-24 pb-12 ${className}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PageContainer;
