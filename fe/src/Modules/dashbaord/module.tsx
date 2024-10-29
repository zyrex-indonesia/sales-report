import React from 'react';

const Dashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome to the dashboard! Here, you can view your recent activity and monitor key metrics.</p>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-gray-100 p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Users</h2>
          <p>100 Active Users</p>
        </div>

        <div className="bg-gray-100 p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Reports</h2>
          <p>50 Reports Generated</p>
        </div>

        <div className="bg-gray-100 p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Sales</h2>
          <p>$10,000 in Revenue</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
