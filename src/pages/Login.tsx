import React, { useEffect } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import LoginForm from '@/components/auth/LoginForm';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <PageContainer className="flex items-center justify-center">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </PageContainer>
  );
};

export default Login;
