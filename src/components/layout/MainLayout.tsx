/**
 * Main Layout Component
 * 
 * Main application layout combining Sidebar, TopNavBar, and content area.
 * Responsive grid/flex structure with adaptive padding.
 */

import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavBar } from './TopNavBar';
import { PageTransition } from './PageTransition';

/**
 * MainLayout Component
 */
export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /**
   * Handle sidebar toggle
   */
  const toggleSidebar = (): void => {
    setSidebarOpen(!sidebarOpen);
  };

  /**
   * Close sidebar
   */
  const closeSidebar = (): void => {
    setSidebarOpen(false);
  };

  /**
   * Handle window resize - close sidebar on mobile when resizing to desktop
   */
  useEffect(() => {
    const handleResize = (): void => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true); // Always open on desktop
      } else {
        setSidebarOpen(false); // Closed by default on mobile
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Sidebar - Fixed on desktop, overlay on mobile */}
      <div className="hidden lg:block">
        <Sidebar isOpen={true} onClose={closeSidebar} />
      </div>
      <div className="lg:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <TopNavBar onMenuClick={toggleSidebar} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <PageTransition>
            <div className="p-2 sm:p-3 md:p-4 lg:p-6">
              <Outlet />
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  );
}

