import React, { ReactNode } from 'react';
import Navbar from '@molecules/navbar';

interface BaseLayoutProps {
  children: ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  console.log("BaseLayout is rendering");
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

export default BaseLayout;
