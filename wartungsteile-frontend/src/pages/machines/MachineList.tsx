// src/pages/machines/MachineList.tsx - Premium Business Design
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMachines } from '../../hooks/useMachines';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  CogIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  ChevronDownIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  DocumentArrowUpIcon,
  SparklesIcon,
  BoltIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  TrendingUpIcon,
  SignalIcon
} from '@heroicons/react/24/outline';

const MachineList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { data: machines, isLoading, error } = useMachines();

  const filteredMachines = machines?.filter(machine => {
    const matchesSearch = machine.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         machine.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || machine.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: string) => {
    const configs = {
      'Active': {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-400',
        icon: CheckCircleIcon,
        label: 'Aktiv'
      },
      'InMaintenance': {
        bg: 'bg-amber-50', 
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-400',
        icon: WrenchScrewdriverIcon,
        label: 'In Wartung'
      },
      'OutOfService': {
        bg: 'bg-red-50',
        text: 'text-red-700', 
        border: 'border-red-200',
        dot: 'bg-red-400',
        icon: ExclamationTriangleIcon,
        label: 'Außer Betrieb'
      }
    };

    return configs[status as keyof typeof configs] || {
      bg: 'bg-slate-50',
      text: 'text-slate-700', 
      border: 'border-slate-200',
      dot: 'bg-slate-400',
      icon: CogIcon,
      label: status
    };
  };

  const renderStatusBadge = (status: string, size: 'sm' | 'md' = 'sm') => {
    const config = getStatusConfig(status);
    const StatusIcon = config.icon;
    
    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} ${size === 'md' ? 'text-sm' : 'text-xs'} font-medium`}>
        <div className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`}></div>
        <StatusIcon className={`${size === 'md' ? 'h-4 w-4' : 'h-3 w-3'}`} />
        <span>{config.label}</span>
      </div>
    );
  };

  const stats = machines ? {
    total: machines.length,
    active: machines.filter(m => m.status === 'Active').length,
    inMaintenance: machines.filter(m => m.status === 'InMaintenance').length,
    outOfService: machines.filter(m => m.status === 'OutOfService').length,
    avgOperatingHours: Math.round(machines.reduce((sum, m) => sum + m.operatingHours, 0) / machines.length),
    maintenanceDue: machines.filter(m => m.operatingHours > 1000).length
  } : { total: 0, active: 0, inMaintenance: 0, outOfService: 0, avgOperatingHours: 0, maintenanceDue: 0 };

  const getMaintenanceUrgency = (hours: number) => {
    if (hours > 1500) return { level: 'critical', color: 'text-red-600', bg: 'bg-red-100' };
    if (hours > 1000) return { level: 'high', color: 'text-amber-600', bg: 'bg-amber-100' };
    if (hours > 500) return { level: 'medium', color: 'text-blue-600', bg: 'bg-blue-100' };
    return { level: 'low', color: 'text-emerald-600', bg: 'bg-emerald-100' };
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Premium Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <CogIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                    CNC-Maschinen
                  </h1>
                  <p className="text-slate-600 font-medium">Lademagazine verwalten und überwachen</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-600 font-medium">{stats.active} Aktive Systeme</span>
                </div>
                <div className="text-slate-500">
                  {stats.maintenanceDue} Wartungen fällig
                </div>
                <div className="text-slate-500">
                  Ø {stats.avgOperatingHours}h Laufzeit
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link 
                to="/machines/upload"
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-medium rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200"
              >
                <DocumentArrowUpIcon className="h-4 w-4" />
                <span>PDF-Import</span>
              </Link>
              
              <div className="relative">
                <button 
                  onClick={() => setShowCreateMenu(!showCreateMenu)}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Neu</span>
                  <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${showCreateMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showCreateMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-xl shadow-slate-200/20 z-50 overflow-hidden">
                    <div className="p-2">
                      <Link
                        to="/machines/create"
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm hover:bg-slate-50 rounded-lg transition-colors group"
                        onClick={() => setShowCreateMenu(false)}
                      >
                        <div className="w-8 h-8 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                          <PlusIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">Maschine erstellen</div>
                          <div className="text-xs text-slate-500">Manuell hinzufügen</div>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Premium Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <CogIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-blue-600">
                <TrendingUpIcon className="h-4 w-4" />
                <span className="text-xs font-semibold">+2%</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-1">{stats.total}</div>
            <div className="text-slate-600 text-sm font-medium">Gesamte Maschinen</div>
            <div className="text-slate-500 text-xs mt-1">CNC-Lademagazine</div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <CheckCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-emerald-600">
                <SignalIcon className="h-4 w-4" />
                <span className="text-xs font-semibold">Online</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600 mb-1">{stats.active}</div>
            <div className="text-slate-600 text-sm font-medium">Aktive Systeme</div>
            <div className="text-slate-500 text-xs mt-1">{Math.round((stats.active / stats.total) * 100)}% Verfügbarkeit</div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                <WrenchScrewdriverIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-amber-600">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <span className="text-xs font-semibold">Wartung</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-600 mb-1">{stats.inMaintenance}</div>
            <div className="text-slate-600 text-sm font-medium">In Wartung</div>
            <div className="text-slate-500 text-xs mt-1">Service läuft</div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-purple-600">
                <ChartBarIcon className="h-4 w-4" />
                <span className="text-xs font-semibold">Avg</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-1">{stats.avgOperatingHours}h</div>
            <div className="text-slate-600 text-sm font-medium">Ø Betriebsstunden</div>
            <div className="text-slate-500 text-xs mt-1">Durchschnittliche Laufzeit</div>
          </div>
        </div>

        {/* Premium Search & Filter Bar */}
        <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1 max-w-2xl">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  placeholder="Maschinen durchsuchen..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 focus:bg-white transition-all duration-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-slate-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all duration-200"
              >
                <option value="all">Alle Status</option>
                <option value="Active">Aktiv</option>
                <option value="InMaintenance">In Wartung</option>
                <option value="OutOfService">Außer Betrieb</option>
              </select>

              <button className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-50/50 hover:bg-white border border-slate-200/60 text-slate-700 text-sm font-medium rounded-xl transition-all duration-200">
                <FunnelIcon className="h-4 w-4" />
                <span>Filter</span>
              </button>
              
              <div className="flex bg-slate-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 transition-all duration-200 ${
                    viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2.5 transition-all duration-200 ${
                    viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ListBulletIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/25">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Maschinen werden geladen</h3>
            <p className="text-slate-600">CNC-Systeme werden analysiert...</p>
          </div>
        ) : error ? (
          <div className="bg-white/70 backdrop-blur-sm border border-red-200/60 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/25">
              <ExclamationTriangleIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">Fehler beim Laden</h3>
            <p className="text-slate-600">Die Maschinen konnten nicht geladen werden.</p>
          </div>
        ) : filteredMachines && filteredMachines.length > 0 ? (
          viewMode === 'grid' ? (
            // Premium Grid View
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMachines.map((machine) => {
                const urgency = getMaintenanceUrgency(machine.operatingHours);
                const daysSinceLastMaintenance = machine.lastMaintenanceDate 
                  ? Math.floor((Date.now() - new Date(machine.lastMaintenanceDate).getTime()) / (1000 * 60 * 60 * 24))
                  : null;
                
                return (
                  <div key={machine.id} className="group bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-slate-200/20 transition-all duration-300 overflow-hidden">
                    {/* Header with gradient */}
                    <div className="relative p-6 pb-4 bg-gradient-to-br from-slate-50 via-white to-slate-50">
                      <div className="absolute top-4 right-4">
                        {renderStatusBadge(machine.status)}
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300">
                          <CogIcon className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/machines/${machine.id}`} 
                            className="block group-hover:text-indigo-600 transition-colors duration-200"
                          >
                            <h3 className="font-bold text-lg text-slate-800 mb-1">{machine.number}</h3>
                            <p className="text-slate-600 text-sm font-medium">{machine.type}</p>
                          </Link>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="px-6 pb-6">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-3 bg-slate-50/50 rounded-xl">
                          <div className="text-xl font-bold text-slate-800 mb-1">{machine.operatingHours}</div>
                          <div className="text-xs text-slate-600 font-medium">Betriebsstunden</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50/50 rounded-xl">
                          <div className="text-xl font-bold text-slate-800 mb-1">
                            {daysSinceLastMaintenance !== null ? `${daysSinceLastMaintenance}d` : '—'}
                          </div>
                          <div className="text-xs text-slate-600 font-medium">Letzte Wartung</div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 font-medium">Installation:</span>
                          <span className="text-slate-800 font-semibold">
                            {new Date(machine.installationDate).toLocaleDateString('de-DE')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 font-medium">Wartungsstatus:</span>
                          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${urgency.bg} ${urgency.color}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${urgency.color.replace('text-', 'bg-')}`}></div>
                            <span className="capitalize">{urgency.level}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Link 
                          to={`/machines/${machine.id}`}
                          className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                        >
                          <EyeIcon className="h-4 w-4" />
                          <span>Details</span>
                        </Link>
                        <Link 
                          to={`/machines/${machine.id}/edit`}
                          className="inline-flex items-center justify-center p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl transition-all duration-200"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Premium Table View
            <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-50/50 border-b border-slate-200/60">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Maschine</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Betriebsstunden</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Letzte Wartung</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Installation</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60">
                    {filteredMachines.map((machine) => {
                      const urgency = getMaintenanceUrgency(machine.operatingHours);
                      
                      return (
                        <tr key={machine.id} className="hover:bg-slate-50/50 transition-all duration-200 group">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all duration-200">
                                <CogIcon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <Link 
                                  to={`/machines/${machine.id}`} 
                                  className="font-semibold text-slate-800 hover:text-indigo-600 text-sm transition-colors duration-200"
                                >
                                  {machine.number}
                                </Link>
                                <div className="text-xs text-slate-500 font-medium mt-0.5">{machine.type}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {renderStatusBadge(machine.status)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <span className="font-semibold text-slate-800 text-sm">{machine.operatingHours}h</span>
                              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${urgency.bg} ${urgency.color}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${urgency.color.replace('text-', 'bg-')}`}></div>
                                <span className="capitalize">{urgency.level}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-800 text-sm font-medium">
                              {machine.lastMaintenanceDate 
                                ? new Date(machine.lastMaintenanceDate).toLocaleDateString('de-DE')
                                : <span className="text-slate-400 italic">Keine</span>
                              }
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-800 text-sm font-medium">
                              {new Date(machine.installationDate).toLocaleDateString('de-DE')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Link 
                                to={`/machines/${machine.id}`}
                                className="inline-flex items-center space-x-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
                              >
                                <EyeIcon className="h-3 w-3" />
                                <span>Details</span>
                              </Link>
                              <Link 
                                to={`/machines/${machine.id}/edit`}
                                className="inline-flex items-center justify-center p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-lg transition-all duration-200"
                              >
                                <PencilIcon className="h-3 w-3" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          // Premium Empty State
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-slate-400/25">
              <CogIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">
              {searchQuery || statusFilter !== 'all' ? 'Keine passenden Maschinen gefunden' : 'Noch keine Maschinen registriert'}
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'all' 
                ? 'Versuchen Sie einen anderen Suchbegriff oder Filter' 
                : 'Beginnen Sie mit dem Import Ihrer CNC-Maschinen über PDF-Dokumente oder manuelle Eingabe'
              }
            </p>
            
            {!searchQuery && statusFilter === 'all' && (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link 
                  to="/machines/upload"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200"
                >
                  <SparklesIcon className="h-5 w-5" />
                  <span>PDF-Import starten</span>
                </Link>
                <Link 
                  to="/machines/create"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Manuell erstellen</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MachineList;