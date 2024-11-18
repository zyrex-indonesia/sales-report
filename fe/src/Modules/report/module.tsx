import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BaseLayout from '@components/layouts/base/index';

// Utility function to format time to "HH:mm:ss" format
const formatTime = (timeString: string) => {
  const [time, modifier] = timeString.split(" ");
  let [hours, minutes] = time.split(":");

  if (modifier === "PM" && hours !== "12") {
    hours = String(parseInt(hours, 10) + 12);
  } else if (modifier === "AM" && hours === "12") {
    hours = "00";
  }

  return `${hours}:${minutes}:00`; // Assuming zero seconds
};

const ReportModule: React.FC = () => {
  const [customerName, setCustomerName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('Fetching location...');
  const [photo, setPhoto] = useState<File | null>(null);
  const [description, setDescription] = useState(''); // New state for description
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionTime, setSubmissionTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    // Capture the current time when the component mounts
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    setSubmissionTime(formattedTime);
  
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
  
          try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
              params: {
                lat: latitude,
                lon: longitude,
                format: 'json'
              }
            });
            const address = response.data.display_name;
            setLocation(address || 'Location not available');
          } catch (error) {
            console.error('Error fetching location:', error);
            setLocation('Failed to fetch location');
          }
        },
        (error) => {
          console.error('Error fetching location:', error);
          setLocation('Failed to fetch location');
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setLocation('Geolocation not supported');
    }
  }, []);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

        if (!allowedTypes.includes(file.type)) {
            alert("Please upload a valid image file (JPEG, JPG, PNG)");
            return;
        }
        setPhoto(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Prevent multiple submissions if already submitting
    if (isSubmitting) return;
  
    setIsSubmitting(true);
  
    if (!customerName || !date || !photo) {
      alert('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }
  
    const formData = new FormData();
    formData.append('customerName', customerName);
    formData.append('date', date);
    formData.append('location', location);
    formData.append('submissionTime', formatTime(submissionTime));
    formData.append('endTime', formatTime(endTime));
    formData.append('photo', photo);
    formData.append('description', description);  // Ensure description is added here
  
    try {
      const response = await axios.post('http://localhost:5000/api/reports/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      
      console.log('Form submitted successfully:', response.data);
      alert('Form submitted successfully!');
  
      setCustomerName('');
      setDate('');
      setLocation('Fetching location...');
      setPhoto(null);
      setSubmissionTime('');
      setEndTime('');
      setDescription('');  // Clear description field
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <BaseLayout>
      <form
        onSubmit={handleSubmit}
        style={{
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          width: '50%',
          margin: '0 auto',
          marginTop: '50px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Customer Name:</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid #ccc',
              backgroundColor: '#e0e0e0',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid #ccc',
              backgroundColor: '#e0e0e0',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Submission Time:</label>
          <input
            type="text"
            value={submissionTime}
            readOnly
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid #ccc',
              backgroundColor: '#e0e0e0',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>End Time:</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid #ccc',
              backgroundColor: '#e0e0e0',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Location:</label>
          <input
            type="text"
            value={location}
            readOnly
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid #ccc',
              backgroundColor: '#e0e0e0',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid #ccc',
              backgroundColor: '#e0e0e0',
              outline: 'none',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Photo:</label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid #ccc',
              backgroundColor: '#e0e0e0',
              outline: 'none',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            fontWeight: 'bold',
            border: 'none',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </BaseLayout>
  );
};

export default ReportModule;
