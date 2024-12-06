import { useState } from 'react';
import LoginModule from '@modules/login/module';
import { useRouter } from 'next/router';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false); // State to handle loading feedback

  const onLoginSuccess = async () => {
    setLoading(true); // Start loading indicator
    try {
      const response = await fetch('/api/users/check-session', {
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
      } else {
        console.error('Failed to determine role:', response.status);
      }
    } catch (error) {
      console.error('Error determining role after login:', error);
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>} {/* Optional loading feedback */}
      <LoginModule onLoginSuccess={onLoginSuccess} />
    </div>
  );
};

export default LoginPage;
