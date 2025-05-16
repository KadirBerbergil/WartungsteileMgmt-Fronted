// src/components/layout/Sidebar.tsx
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="h-screen w-64 bg-white shadow-md">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-primary">Wartungsteile</h1>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `block p-2 rounded ${isActive ? 'bg-light text-primary' : 'text-dark hover:bg-light hover:text-primary'}`
              }
              end
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/machines" 
              className={({ isActive }) => 
                `block p-2 rounded ${isActive ? 'bg-light text-primary' : 'text-dark hover:bg-light hover:text-primary'}`
              }
            >
              Maschinen
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/parts" 
              className={({ isActive }) => 
                `block p-2 rounded ${isActive ? 'bg-light text-primary' : 'text-dark hover:bg-light hover:text-primary'}`
              }
            >
              Wartungsteile
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;