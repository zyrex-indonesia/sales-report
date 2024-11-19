import { useEffect } from 'react';
import LoginModule from '@modules/login/module';
import { useRouter } from 'next/router';

const LoginPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/check-session', {
          method: 'GET',
          credentials: 'include', // Include session cookie
        });
  
        if (response.ok) {
          const data = await response.json();
          if (data.message === 'Session active') {
            console.log('Session is active, redirecting to dashboard...');
            router.push('/dashboard'); // Redirect if session is active
          } else {
            console.log('No active session found.');
          }
        } else {
          console.log('Session is not active:', response.status);
          localStorage.removeItem('authToken'); // Clear any stale tokens
          localStorage.removeItem('role');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };
  
    checkSession();
  }, [router]);   // Include `router` in the dependency array

  const onLoginSuccess = () => {
    console.log("Login successful. Redirecting to dashboard.");
    router.push('/dashboard');
  };

  return <LoginModule onLoginSuccess={onLoginSuccess} />;
};

export default LoginPage;
