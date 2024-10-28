import React from 'react';
import Navbar from '../molecules/navbar';

const BaseLayout: React.FC = ({ children }) => {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

export default BaseLayout;
