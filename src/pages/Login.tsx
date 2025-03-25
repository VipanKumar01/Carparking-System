
import React from 'react';
import PageContainer from '@/components/layout/PageContainer';
import LoginForm from '@/components/auth/LoginForm';

const Login = () => {
  return (
    <PageContainer className="flex items-center justify-center">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </PageContainer>
  );
};

export default Login;
