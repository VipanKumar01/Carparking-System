
import React from 'react';
import PageContainer from '@/components/layout/PageContainer';
import RegisterForm from '@/components/auth/RegisterForm';

const Register = () => {
  return (
    <PageContainer className="flex items-center justify-center">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </PageContainer>
  );
};

export default Register;
