import { useEffect } from 'react';
import LoginModule from '@modules/login/module';
import { useRouter } from 'next/router';

const LoginPage: React.FC = () => {
  const router = useRouter();

  // Helper function to handle redirection based on role
  const redirectToPage = (role: string | undefined) => {
    if (role === 'admin') {
      console.log('Redirecting to /dashboard');
      router.push('/dashboard');
    } else if (role === 'user') {
      console.log('Redirecting to /report');
      router.push('/report');
    } else {
      console.error('Invalid role:', role);
    }
  };

  // Check session on page load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('https://api.sales.zyrex.com/api/users/check-session', {
          method: 'GET',
          credentials: 'include', // Include session cookie
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Session data:', data);
          if (data.message === 'Session active') {
            redirectToPage(data.role); // Handle redirection
          } else {
            console.log('No active session found.');
          }
        } else {
          console.error('Failed to check session:', response.status);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    checkSession();
  }, [router]);

  // Handle login success
  const onLoginSuccess = async () => {
    try {
      const response = await fetch('https://api.sales.zyrex.com/api/users/check-session', {
        method: 'GET',
        credentials: 'include', // Include session cookie
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful. Redirecting...');
        redirectToPage(data.role); // Handle redirection
      } else {
        console.error('Session check failed:', response.status);
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return <LoginModule onLoginSuccess={onLoginSuccess} />;
};

export default LoginPage;
