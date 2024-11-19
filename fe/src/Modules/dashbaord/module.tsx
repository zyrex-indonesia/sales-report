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

const DashboardModule: React.FC = () => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [filteredReports, setFilteredReports] = useState<ReportData[]>([]);
  const [uniqueUsernames, setUniqueUsernames] = useState<string[]>([]);
  const [selectedUsername, setSelectedUsername] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await axios.get<ReportData[]>(`${API_BASE_URL}/api/reports/daily`, {
          withCredentials: true,
        });

        const data = response.data || [];
        setReports(data);
        setFilteredReports(data);

        const usernames = [...new Set(data.map((report) => report.username))];
        setUniqueUsernames(usernames);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load reports. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const username = e.target.value;
    setSelectedUsername(username);
    if (username === '') {
      setFilteredReports(reports);
    } else {
      setFilteredReports(reports.filter((report) => report.username === username));
    }
  };

  if (isLoading) {
    return (
      <BaseLayout>
        <p style={{ textAlign: 'center', color: '#333' }}>Loading reports...</p>
      </BaseLayout>
    );
  }

  if (error) {
    return (
      <BaseLayout>
        <p style={{ textAlign: 'center', color: '#333' }}>{error}</p>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div
        style={{
          width: '100%',
          minHeight: '100vh',
          padding: '20px',
          backgroundColor: '#8B0000',
          color: '#ffffff',
        }}
      >
        <h1 style={{ marginBottom: '20px', fontSize: '2rem', textAlign: 'center' }}>Today's Report</h1>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'left' }}>
          <label htmlFor="filter" style={{ marginRight: '10px', fontSize: '1rem' }}>
            Filter by Username:
          </label>
          <select
            id="filter"
            value={selectedUsername}
            onChange={handleFilterChange}
            style={{
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              fontSize: '1rem',
              backgroundColor: '#ffffff',
              color: '#333',
            }}
          >
            <option value="">All</option>
            {uniqueUsernames.map((username) => (
              <option key={username} value={username}>
                {username}
              </option>
            ))}
          </select>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
            gap: '20px',
            width: '100%',
            padding: '0 10px',
          }}
        >
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <div
                key={report.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  padding: '20px',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  fontSize: '14px',
                  color: '#333',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#e9ecef',
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
                <div style={{ marginBottom: '10px', fontSize: '16px' }}>
                  <strong>Customer Name:</strong> {report.name}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Location:</strong>
                  <div
                    style={{
                      backgroundColor: '#f8f9fa',
                      padding: '10px',
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
                      backgroundColor: '#f8f9fa',
                      padding: '10px',
                      borderRadius: '8px',
                      marginTop: '5px',
                    }}
                  >
                    {report.description}
                  </div>
                </div>
                {report.photo && (
                  <img
                    src={`http://localhost:5000/${report.photo}`}
                    alt="Report"
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: '8px',
                      maxHeight: '400px',
                      objectFit: 'cover',
                      marginTop: '10px',
                    }}
                  />
                )}
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: '#ffffff', gridColumn: '1 / -1' }}>
              No reports for the selected username.
            </p>
          )}
        </div>
      </div>
    </BaseLayout>
  );
};

export default DashboardModule;
