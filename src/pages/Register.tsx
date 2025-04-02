
import React from 'react';
import PageContainer from '@/components/layout/PageContainer';
import RegisterForm from '@/components/auth/RegisterForm';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Register = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <PageContainer className="flex items-center justify-center">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </PageContainer>
  );
};

export default Register;
