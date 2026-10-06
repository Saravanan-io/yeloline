import React, { useEffect } from 'react';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import { useApp } from '../../../context/AppContext';
import './AdminLayout.css';

export default function AdminLayout({ children }) {
  const { isSidebarCollapsed, toggleSidebar, activeTab, adminMasterGroupFilter } = useApp();

  // Smooth scroll to top whenever tab or master section changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    const mainContent = document.querySelector('.admin-main-content');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [activeTab, adminMasterGroupFilter]);

  return (
    <div className="admin-app-shell">
      <Header />
      <div className="admin-body-grid">
        {!isSidebarCollapsed && (
          <div className="mobile-sidebar-backdrop" onClick={toggleSidebar} />
        )}
        <Sidebar />
        <main className="admin-main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
