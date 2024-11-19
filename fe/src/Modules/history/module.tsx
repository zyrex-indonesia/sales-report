import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BaseLayout from '@components/layouts/base';

interface ReportData {
  id: number;
  userId: number;
  username: string;
  location: string;
  name: string;
  photo: string;
  submissionTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  description: string;
}

const HistoryModule: React.FC = () => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [filteredReports, setFilteredReports] = useState<ReportData[]>([]);
  const [uniqueUsernames, setUniqueUsernames] = useState<string[]>([]);
  const [filter, setFilter] = useState({
    username: '',
    date: '',
    customerName: '',
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get<ReportData[]>(
          'http://localhost:5000/api/reports',
          {
            withCredentials: true,
          }
        );
        const data = response.data || [];
        setReports(data);
        setFilteredReports(data);

        const usernames = [...new Set(data.map((report) => report.username))];
        setUniqueUsernames(usernames);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchReports();
  }, []);

  useEffect(() => {
    const filtered = reports.filter((report) => {
      const matchesUsername =
        filter.username && report.username
          ? report.username.toLowerCase().includes(filter.username.toLowerCase())
          : true;

      const matchesDate =
        filter.date && report.createdAt
          ? report.createdAt.startsWith(filter.date)
          : true;

      const matchesCustomerName = filter.customerName
        ? report.name.toLowerCase().includes(filter.customerName.toLowerCase())
        : true;

      return matchesUsername && matchesDate && matchesCustomerName;
    });

    setFilteredReports(filtered);
  }, [filter, reports]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <BaseLayout>
      <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff', fontSize: '2.5rem' }}>
        Reports History
      </h1>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          padding: '20px',
          marginBottom: '20px',
          gap: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '10px',
        }}
      >
        <div>
          <label htmlFor="username" style={{ fontWeight: 'bold', marginRight: '10px' }}>
            Filter by Username:
          </label>
          <select
            id="username"
            name="username"
            value={filter.username}
            onChange={handleInputChange}
            style={{
              padding: '8px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              fontSize: '16px',
              background: '#fff',
            }}
          >
            <option value="">All Users</option>
            {uniqueUsernames.map((username) => (
              <option key={username} value={username}>
                {username}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="date" style={{ fontWeight: 'bold', marginRight: '10px' }}>
            Filter by Date:
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={filter.date}
            onChange={handleInputChange}
            style={{
              padding: '8px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              fontSize: '16px',
            }}
          />
        </div>

        <div>
          <label htmlFor="customerName" style={{ fontWeight: 'bold', marginRight: '10px' }}>
            Filter by Customer Name:
          </label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            placeholder="Enter customer name"
            value={filter.customerName}
            onChange={handleInputChange}
            style={{
              padding: '8px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              fontSize: '16px',
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          padding: '20px',
          maxWidth: '100%',
          margin: '0 auto',
        }}
      >
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <div
              key={report.id}
              style={{
                backgroundColor: '#f5f5f5',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '20px',
              }}
            >
              <div>
                {report.photo && (
                  <img
                    src={`http://localhost:5000${report.photo}`}
                    alt="Report"
                    style={{
                      width: '150px',
                      height: '150px',
                      borderRadius: '10px',
                      objectFit: 'cover',
                    }}
                  />
                )}
              </div>
              <div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Username:</strong> {report.username}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Customer Name:</strong> {report.name}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Date:</strong> {new Date(report.createdAt).toLocaleDateString()}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Description:</strong> {report.description}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#000' }}>No matching reports found.</p>
        )}
      </div>
    </BaseLayout>
  );
};

export default HistoryModule;
