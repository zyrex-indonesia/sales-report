// src/modules/History/index.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BaseLayout from '@components/layouts/base';

interface ReportData {
  id: number;
  username: string; // Changed from userId to username
  customerName: string;
  time: string;
  location: string;
  description: string;
  photo: string;
}

const HistoryModule: React.FC = () => {
  const [reports, setReports] = useState<ReportData[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/reports',
          { 
            withCredentials: true 
          }
        );
        setReports(response.data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };
    fetchReports();
  }, []);

  return (
    <BaseLayout>
      <h1 style={{ textAlign: 'center' }}>Submission History</h1>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {reports.map((report) => (
          <div
            key={report.id}
            style={{
              width: '80%',
              maxWidth: '600px',
              backgroundColor: '#f5f5f5',
              borderRadius: '10px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#d3d3d3', padding: '10px', borderRadius: '8px' }}>
              <span><strong>Username:</strong> {report.username}</span> {/* Display username here */}
              <span><strong>Time:</strong> {report.time}</span>
            </div>
            <div style={{ marginTop: '10px', fontSize: '18px', borderBottom: '1px solid #ccc' }}>
              <strong>Customer Name:</strong> {report.customerName}
            </div>
            <div style={{ marginTop: '10px' }}>
              <strong>Location:</strong> 
              <div style={{ backgroundColor: '#e0e0e0', padding: '5px', borderRadius: '8px', display: 'inline-block', marginTop: '5px' }}>
                {report.location}
              </div>
            </div>
            <div style={{ marginTop: '10px' }}>
              <strong>Description:</strong>
              <div style={{ backgroundColor: '#e0e0e0', padding: '10px', borderRadius: '8px', marginTop: '5px' }}>
                {report.description}
              </div>
            </div>
            {report.photo && (
              <div style={{ marginTop: '10px' }}>
                <img
                  src={`http://localhost:5000/${report.photo}`} // Adjust path if necessary
                  alt="Report"
                  style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </BaseLayout>
  );
};

export default HistoryModule;
