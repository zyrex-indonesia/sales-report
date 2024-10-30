import { useEffect } from 'react';
import LoginModule from '@modules/login/module';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

const LoginPage: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    // If the token exists in localStorage, redirect to dashboard
    const token = localStorage.getItem('authToken');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const onLoginSuccess = (token: string) => {
    localStorage.setItem('authToken', token); // Store token in localStorage
    console.log("Login successful, token stored in localStorage.");
    router.push('/dashboard'); // Navigate to dashboard
  };

  return <LoginModule onLoginSuccess={onLoginSuccess} />;
};

export default LoginPage;
