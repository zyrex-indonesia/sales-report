import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Dashboard from '../../Modules/dashbaord/module';
import BaseLayout from '../../components/layouts/BaseLayout';  // Adjusted path to BaseLayout

const DashboardPage = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/'); // Redirect to login if not authenticated
    } else {
      setAuthenticated(true);
    }
  }, [router]);

  if (!authenticated) {
    return null; // Optionally return a loading spinner while checking
  }

  return (
    <BaseLayout>
      <Dashboard />
    </BaseLayout>
  );
};

export default DashboardPage;
