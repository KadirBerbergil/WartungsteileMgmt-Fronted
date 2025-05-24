// src/components/layout/Layout.tsx - Professionelles Scrolling ohne Overflow-Probleme
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        {/* PROFESSIONELLE LÖSUNG: Sauberes Scrolling mit klaren Grenzen */}
        <main className="flex-1 overflow-hidden bg-gray-50 relative">
          <div className="h-full overflow-y-auto">
            <div className="p-6 min-h-full">
              <div className="pb-8">
                <Outlet />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;