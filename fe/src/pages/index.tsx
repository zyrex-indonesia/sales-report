// src/pages/login/LoginPage.tsx
import LoginModule from '@modules/login/module';
import { NextPage } from 'next';
import { ReactElement } from 'react';
import { useRouter } from 'next/router';

const LoginPage: NextPage = (): ReactElement => {
  const router = useRouter();

  // Function to handle successful login by storing the token and navigating to the dashboard
  const onLoginSuccess = (token: string) => {
    localStorage.setItem('authToken', token); // Store token in localStorage
    console.log("Login successful, token stored in localStorage.");
    router.push('/dashboard'); // Navigate to dashboard
  };

  return <LoginModule onLoginSuccess={onLoginSuccess} />;
};

export default LoginPage;

