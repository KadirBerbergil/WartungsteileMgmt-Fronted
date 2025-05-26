// src/components/layout/Layout.tsx - Premium Business Design
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden relative">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.03)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none"></div>
          
          <div className="h-full overflow-y-auto">
            <div className="p-8 min-h-full">
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