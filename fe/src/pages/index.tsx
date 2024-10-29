// src/pages/index.tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import LoginPage from '../pages/login/LoginPage';


const IndexPage = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthenticated(true);
      router.push('/dashboard'); // Redirect to dashboard if authenticated
    }
  }, [router]);

  if (authenticated) {
    return null; // Optionally return a loading spinner while redirecting
  }

  return <LoginPage />;
};

export default IndexPage;
