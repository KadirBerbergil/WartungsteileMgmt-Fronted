const Header = () => {
  return (
    <header className="h-16 bg-white border-b shadow-sm flex items-center justify-between px-6">
      <div className="flex items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Suchen..."
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            {/* Hier könnte ein Suchicon stehen */}
            🔍
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-gray-500 hover:text-primary">
          {/* Benachrichtigungsicon */}
          🔔
        </button>
        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
          {/* Profilbild oder Initialen */}
          A
        </div>
      </div>
    </header>
  );
};

export default Header;