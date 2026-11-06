import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import AddExpenseModal from '../components/AddExpenseModal';
import { useNotifications } from '../context/NotificationContext';
import AlertBanner from '../components/AlertBanner';

export const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { activeAlerts, dismissNotification } = useNotifications();

  const handleExpenseSaved = () => {
    // Increment refreshKey to notify child routes to reload data
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-bg-main flex text-text-main selection:bg-brand-purple selection:text-white overflow-x-hidden">
      {/* Sidebar (Desktop persistent, mobile collapsible via hamburger) */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Navbar
          onOpenAddExpense={() => setIsAddModalOpen(true)}
          setMobileOpen={setMobileOpen}
        />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6 pb-24 md:pb-8">
          {/* Active Global Alerts */}
          {activeAlerts && activeAlerts.length > 0 && (
            <div className="space-y-3">
              {activeAlerts.map((alert, idx) => (
                <AlertBanner
                  key={alert._id || idx}
                  alert={alert}
                  onDismiss={() => dismissNotification(alert._id)}
                />
              ))}
            </div>
          )}

          {/* Child Page Content with refresh context passed */}
          <Outlet context={{ refreshKey, triggerRefresh: handleExpenseSaved }} />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />

      {/* Global Quick Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onExpenseSaved={handleExpenseSaved}
      />
    </div>
  );
};

export default DashboardLayout;

