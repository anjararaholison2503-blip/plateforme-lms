import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { LayoutProvider } from '../../contexts/LayoutContext';
import AIChatbot from '../common/AIChatbot';
export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const onMenuClick = () => setMobileMenuOpen(true);

  return (
    <LayoutProvider value={{ onMenuClick }}>
      <div className="flex h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden">
        <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Outlet />
        </div>
      <AIChatbot />
      </div>
    </LayoutProvider>
  );
}