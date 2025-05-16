const Sidebar = () => {
  return (
    <div className="h-screen w-64 bg-white shadow-md">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-primary">Wartungsteile</h1>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <a href="/" className="block p-2 rounded hover:bg-light text-dark hover:text-primary">
              Dashboard
            </a>
          </li>
          <li>
            <a href="/machines" className="block p-2 rounded hover:bg-light text-dark hover:text-primary">
              Maschinen
            </a>
          </li>
          <li>
            <a href="/parts" className="block p-2 rounded hover:bg-light text-dark hover:text-primary">
              Wartungsteile
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;