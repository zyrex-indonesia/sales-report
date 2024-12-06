import { useEffect } from 'react';
import LoginModule from '@modules/login/module';
import { useRouter } from 'next/router';

const LoginPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('https://api.sales.zyrex.com/api/users/check-session', {
          method: 'GET',
          credentials: 'include', // Include session cookie
        });
  
        if (response.ok) {
          const data = await response.json();
          if (data.message === 'Session active') {
            console.log('Session active:', data.role);
            if (data.role === 'admin') {
              router.replace('/dashboard'); // Use replace to avoid infinite loops
            } else if (data.role === 'user') {
              router.replace('/report');
            }
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
  }, [router]);   // Include `router` in the dependency array

  const onLoginSuccess = async () => {
    try {
      const response = await fetch('https://api.sales.zyrex.com/api/users/check-session', {
        method: 'GET',
        credentials: 'include', // Include session cookie
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful. Redirecting based on role...');
        if (data.role === 'admin') {
          router.push('/dashboard'); // Redirect admin to the dashboard
        } else if (data.role === 'user') {
          router.push('/report'); // Redirect user to the report page
        }
      }
    } catch (error) {
      console.error('Error determining role after login:', error);
    }
  };

  return <LoginModule onLoginSuccess={onLoginSuccess} />;
};

export default LoginPage;
