// src/components/layout/Layout.tsx - Scroll-Problem ENDGÜLTIG behoben
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        {/* ENDGÜLTIGE LÖSUNG: Korrektes Scrolling mit ausreichend Platz */}
        <main className="flex-1 overflow-y-auto bg-gray-50" style={{ height: 'calc(100vh - 64px)' }}>
          <div className="p-6 pb-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;