import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BaseLayout from '@components/layouts/base';

interface ReportData {
  id: number;
  username: string;
  name: string;
  submissionTime: string;
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
            withCredentials: true,
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
      <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>
        Submission History
      </h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', // Ensures multiple cards per row
          gap: '20px',
          padding: '20px',
          maxWidth: '100%',
          margin: '0 auto',
        }}
      >
        {reports.map((report) => (
          <div
            key={report.id}
            style={{
              backgroundColor: '#f5f5f5',
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              height: '100%', // Use the full height of the container
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#d3d3d3',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '10px',
              }}
            >
              <span>
                <strong>Username:</strong> {report.username}
              </span>
              <span>
                <strong>Time:</strong> {report.submissionTime}
              </span>
            </div>
            <div style={{ marginBottom: '10px', fontSize: '18px' }}>
              <strong>Customer Name:</strong> {report.name}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Location:</strong>
              <div
                style={{
                  backgroundColor: '#e0e0e0',
                  padding: '5px',
                  borderRadius: '8px',
                  marginTop: '5px',
                }}
              >
                {report.location}
              </div>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Description:</strong>
              <div
                style={{
                  backgroundColor: '#e0e0e0',
                  padding: '10px',
                  borderRadius: '8px',
                  marginTop: '5px',
                }}
              >
                {report.description}
              </div>
            </div>
            {report.photo && (
              <div style={{ marginTop: '10px' }}>
                <img
                  src={`http://localhost:5000/${report.photo}`} // Adjust path if necessary
                  alt="Report"
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    maxHeight: '200px',
                    objectFit: 'cover',
                  }}
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
