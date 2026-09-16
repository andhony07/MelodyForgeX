import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../common/Header';
import { Sidebar } from '../common/Sidebar';
import { Footer } from '../common/Footer';
import { useProjectStore } from '../../stores/useProjectStore';

export const AppLayout: React.FC = () => {
  const checkHealth = useProjectStore((state) => state.checkHealth);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(() => {
      checkHealth();
    }, 15000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return (
    <div className="flex flex-col h-screen bg-[#0f1117] text-gray-100 overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[#0f1117] p-6">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};
