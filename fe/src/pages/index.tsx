import { useEffect } from 'react';
import LoginModule from '@modules/login/module';
import { useRouter } from 'next/router';

const LoginPage: React.FC = () => {
  const router = useRouter();

  // Function to handle redirection based on the user's role
  const redirectToPage = (role: string) => {
    if (role === 'admin') {
      console.log('Redirecting to /dashboard for admin');
      router.push('/dashboard'); // Redirect admin to the dashboard
    } else if (role === 'user') {
      console.log('Redirecting to /report for user');
      router.push('/report'); // Redirect user to the report page
    } else {
      console.error('Invalid role:', role);
    }
  };

  // Check session and redirect if session is active
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
            redirectToPage(data.role); // Redirect based on role
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
  }, [router]); // Include `router` in the dependency array

  // Handle login success
  const onLoginSuccess = async () => {
    try {
      const response = await fetch('https://api.sales.zyrex.com/api/users/check-session', {
        method: 'GET',
        credentials: 'include', // Include session cookie
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful. Redirecting based on role...');
        redirectToPage(data.role); // Redirect based on role
      } else {
        console.error('Session check failed:', response.status);
      }
    } catch (error) {
      console.error('Error determining role after login:', error);
    }
  };

  return <LoginModule onLoginSuccess={onLoginSuccess} />;
};

export default LoginPage;
