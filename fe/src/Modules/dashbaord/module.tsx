import React, { useEffect, useState } from "react";
import axios from "axios";
import BaseLayout from "@components/layouts/base";
import { format, parse } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

interface ReportData {
  id: number;
  username: string;
  name: string;
  submissionTime: string;
  endTime: string;
  location: string;
  description: string;
  photo: string;
}

const DashboardModule: React.FC = () => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [filteredReports, setFilteredReports] = useState<ReportData[]>([]);
  const [uniqueUsernames, setUniqueUsernames] = useState<string[]>([]);
  const [selectedUsername, setSelectedUsername] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const toJakartaTime = (timeString: string): string => {
    try {
      // Parse the time string into a Date object
      const parsedTime = parse(timeString, 'HH:mm:ss', new Date());
  
      // Check if parsing succeeded
      if (isNaN(parsedTime.getTime())) {
        throw new Error(`Invalid time format: ${timeString}`);
      }
  
      // Subtract 7 hours
      parsedTime.setHours(parsedTime.getHours() - 7);
  
      // Return the adjusted time in 'HH:mm:ss' format
      return format(parsedTime, 'HH:mm:ss');
    } catch (error: any) {
      console.error('Error adjusting time:', error.message || error);
      return 'Invalid time';
    }
  };
  
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const username = localStorage.getItem("username");
        const password = localStorage.getItem("password");

        if (!username || !password) {
          setError("Access denied. Admin credentials are required.");
          setIsLoading(false);
          return;
        }

        const response = await axios.get<ReportData[]>(
          `https://api.sales.zyrex.com/api/reports/daily`,
          {
            headers: {
              username,
              password,
            },
            withCredentials: true,
          }
        );

        const data = response.data.map((report) => ({
          ...report,
          submissionTime: toJakartaTime(report.submissionTime)
        }));
        setReports(data);
        setFilteredReports(data);

        const usernames = [...new Set(data.map((report) => report.username))];
        setUniqueUsernames(usernames);
      } catch (err: any) {
        console.error("Error fetching reports:", err);

        if (err.response?.status === 403) {
          setError("Access denied. Admins only.");
        } else if (err.response?.status === 404) {
          setError("No reports found for today.");
        } else {
          setError("Failed to load reports. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const username = e.target.value;
    setSelectedUsername(username);
    if (username === "") {
      setFilteredReports(reports);
    } else {
      setFilteredReports(reports.filter((report) => report.username === username));
    }
  };

  const openPreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  if (isLoading) {
    return (
      <BaseLayout>
        <div className="flex justify-center items-center h-screen text-gray-700">
          <p>Loading reports...</p>
        </div>
      </BaseLayout>
    );
  }

  if (error) {
    return (
      <BaseLayout>
        <div className="flex justify-center items-center h-screen text-gray-700">
          <p>{error}</p>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="w-full min-h-screen px-4 py-6 bg-red-800 text-white">
        {/* Title Section */}
        <h1 className="text-center text-2xl font-bold mb-6 uppercase">Today's Report</h1>

        {/* Filter Section */}
        <div className="mb-6 flex flex-col items-center">
          <label htmlFor="filter" className="mb-2 text-lg">
            Filter by Username:
          </label>
          <select
            id="filter"
            value={selectedUsername}
            onChange={handleFilterChange}
            className="p-2 border rounded bg-white text-gray-700 w-full max-w-md"
          >
            <option value="">All</option>
            {uniqueUsernames.map((username) => (
              <option key={username} value={username}>
                {username}
              </option>
            ))}
          </select>
        </div>

        {/* Reports Section */}
        <div className="grid gap-4">
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-lg p-4 shadow-md text-gray-700 flex flex-col md:flex-row md:gap-4"
              >
                {/* Image Section */}
                {report.photo && (
                  <div
                    className="relative w-full md:w-1/3 cursor-pointer group"
                    onClick={() => openPreview(`https://api.sales.zyrex.com/${report.photo}`)}
                  >
                    <img
                      src={`https://api.sales.zyrex.com/${report.photo}`}
                      alt="Report"
                      className="rounded-md object-cover w-full h-auto"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white font-bold text-lg">Click to preview</p>
                    </div>
                  </div>
                )}

                {/* Report Details */}
                <div className="flex-1">
                  <div className="bg-gray-100 p-2 rounded-lg mb-3 flex justify-between">
                    <span>
                      <strong>Username:</strong> {report.username}
                    </span>
                    <span>
                      <strong>Submission Time:</strong> {report.submissionTime}
                    </span>
                    <span>
                      <strong>End Time:</strong> {report.endTime}
                    </span>
                  </div>
                  <div className="mb-3">
                    <strong>Customer Name:</strong> {report.name}
                  </div>
                  <div className="mb-3">
                    <strong>Location:</strong>
                    <div className="bg-gray-100 p-2 rounded-lg mt-2">{report.location}</div>
                  </div>
                  <div>
                    <strong>Description:</strong>
                    <div className="bg-gray-100 p-2 rounded-lg mt-2">{report.description}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-300">No reports for the selected username.</p>
          )}
        </div>

        {/* Image Preview Modal */}
        {previewImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="relative">
              <img src={previewImage} alt="Preview" className="rounded-lg max-w-full max-h-screen" />
              <button
                onClick={closePreview}
                className="absolute top-2 right-2 text-white rounded-full w-8 h-8 flex items-center justify-center"
              >
                &times;
              </button>
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default DashboardModule;
