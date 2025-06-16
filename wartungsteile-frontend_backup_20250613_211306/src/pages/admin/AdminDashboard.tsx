import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import UserModal from '../../components/admin/UserModal';
import PasswordResetModal from '../../components/admin/PasswordResetModal';
import { BackupManagement } from '../../components/admin/BackupManagement';
import { userService } from '../../services/userService';
import { API_BASE_URL as API_URL, API_KEY } from '../../config';
import { 
  Trash2, 
  RotateCcw, 
  Activity,
  Users,
  Package,
  Cog,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  UserPlus,
  Shield,
  Lock,
  Database,
  Download,
  Calendar,
  HardDrive,
  RefreshCw,
  Key
} from 'lucide-react';

interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: 'created' | 'updated' | 'deleted' | 'restored';
  entityType: 'machine' | 'part';
  entityName: string;
  details?: string;
}

interface DeletedItem {
  id: string;
  type: 'machine' | 'part';
  name: string;
  identifier: string;
  deletedAt: string;
  deletedBy: string;
  canRestore: boolean;
}

interface SystemMetrics {
  totalMachines: number;
  activeMachines: number;
  totalParts: number;
  lowStockParts: number;
  todayActivities: number;
  activeUsers: number;
}

interface SystemStatus {
  database: 'online' | 'offline' | 'error';
  azureStorage: 'connected' | 'disconnected' | 'error';
  formRecognizer: 'ready' | 'unavailable' | 'error';
}

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'technician' | 'viewer';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface BackupJob {
  id: string;
  type: 'manual' | 'scheduled';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  size?: string;
}

const AdminDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<'overview' | 'trash' | 'activity' | 'users' | 'backup'>('overview');
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'machine' | 'part'>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [passwordResetUser, setPasswordResetUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<DeletedItem | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'online',
    azureStorage: 'connected',
    formRecognizer: 'ready'
  });

  // Prüfe System-Status (vereinfacht)
  const checkSystemStatus = async () => {
    // Wenn die Metriken erfolgreich geladen wurden, ist die Datenbank online
    // Das ist eine einfache Prüfung basierend auf dem API-Aufruf
    if (metrics && metrics.totalMachines >= 0) {
      setSystemStatus({
        database: 'online',
        azureStorage: 'connected', // Annahme wenn API funktioniert
        formRecognizer: 'ready' // Annahme wenn API funktioniert
      });
    } else {
      setSystemStatus({
        database: 'offline',
        azureStorage: 'disconnected',
        formRecognizer: 'unavailable'
      });
    }
  };

  // Lade System-Metriken
  const loadMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/audit/summary`, {
        headers: { 
          'X-API-Key': API_KEY,
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Audit Summary Data:', data);
        setMetrics({
          totalMachines: data.machines?.total || 0,
          activeMachines: data.machines?.active || 0,
          totalParts: data.parts?.total || 0,
          lowStockParts: data.parts?.lowStock || 0,
          todayActivities: (data.machines?.createdToday || 0) + (data.machines?.modifiedToday || 0) + 
                          (data.parts?.createdToday || 0) + (data.parts?.modifiedToday || 0),
          activeUsers: data.activeUsers || 1
        });
        // Status als online setzen wenn Daten erfolgreich geladen wurden
        setSystemStatus({
          database: 'online',
          azureStorage: 'connected',
          formRecognizer: 'ready'
        });
      } else {
        console.error('Fehler beim Laden der Metriken:', response.status, response.statusText);
        setError(`Fehler beim Laden der Daten: ${response.statusText}`);
        // Setze Default-Werte wenn API fehlschlägt
        setMetrics({
          totalMachines: 0,
          activeMachines: 0,
          totalParts: 0,
          lowStockParts: 0,
          todayActivities: 0,
          activeUsers: 1
        });
        // Status als offline/error setzen wenn API fehlschlägt
        setSystemStatus({
          database: 'error',
          azureStorage: 'error',
          formRecognizer: 'error'
        });
      }
    } catch (error: any) {
      console.error('Fehler beim Laden der Metriken:', error);
      setError('Verbindung zum Server fehlgeschlagen');
      // Setze Default-Werte bei Fehler
      setMetrics({
        totalMachines: 0,
        activeMachines: 0,
        totalParts: 0,
        lowStockParts: 0,
        todayActivities: 0,
        activeUsers: 1
      });
      // Status als offline setzen bei Netzwerkfehler
      setSystemStatus({
        database: 'offline',
        azureStorage: 'disconnected',
        formRecognizer: 'unavailable'
      });
    }
    setLoading(false);
  };

  // Lade gelöschte Elemente
  const loadDeletedItems = async () => {
    console.log('=== Loading deleted items ===');
    setLoading(true);
    try {
      // Lade gelöschte Maschinen
      const machinesResponse = await fetch(
        `${API_URL}/admin/audit/machines?onlyDeleted=true`,
        { headers: { 
          'X-API-Key': API_KEY,
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        } }
      );
      
      // Lade gelöschte Teile
      const partsResponse = await fetch(
        `${API_URL}/admin/audit/parts?onlyDeleted=true`,
        { headers: { 
          'X-API-Key': API_KEY,
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        } }
      );

      console.log('Machines response status:', machinesResponse.status);
      console.log('Parts response status:', partsResponse.status);

      if (machinesResponse.ok && partsResponse.ok) {
        const machines = await machinesResponse.json();
        const parts = await partsResponse.json();
        
        console.log('Gelöschte Maschinen vom Server:', machines);
        console.log('Anzahl gelöschter Maschinen:', machines.length);
        console.log('Maschinen IDs:', machines.map((m: any) => m.id));
        console.log('Gelöschte Teile vom Server:', parts);
        console.log('Anzahl gelöschter Teile:', parts.length);
        console.log('Teile IDs:', parts.map((p: any) => p.id));

        const deleted: DeletedItem[] = [
          ...machines
            .map((m: any) => ({
              id: m.id,
              type: 'machine' as const,
              name: m.name || m.type || 'Maschine',
              identifier: m.machineNumber || m.number,
              deletedAt: m.deletedAt || m.modifiedAt,
              deletedBy: m.deletedBy || 'System',
              canRestore: true
            })),
          ...parts
            .map((p: any) => ({
              id: p.id,
              type: 'part' as const,
              name: p.name,
              identifier: p.partNumber,
              deletedAt: p.deletedAt || p.modifiedAt,
              deletedBy: p.deletedBy || 'System',
              canRestore: true
            }))
        ];

        // Dedupliziere basierend auf ID (falls es Duplikate gibt)
        const uniqueDeleted = deleted.reduce((acc, item) => {
          const existing = acc.find(i => i.id === item.id);
          if (!existing) {
            acc.push(item);
          }
          return acc;
        }, [] as DeletedItem[]);
        
        console.log('Eindeutige gelöschte Items:', uniqueDeleted.length);
        console.log('Maschinen:', uniqueDeleted.filter(i => i.type === 'machine').length);
        console.log('Teile:', uniqueDeleted.filter(i => i.type === 'part').length);
        console.log('=== Setting deleted items state ===');
        
        setDeletedItems(uniqueDeleted.sort((a, b) => 
          new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime()
        ));
      }
    } catch (error) {
      console.error('Fehler beim Laden gelöschter Elemente:', error);
    }
    setLoading(false);
  };

  // Lade Aktivitäten
  const loadActivities = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/audit/summary`, {
        headers: { 
          'X-API-Key': API_KEY,
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const recentActivities = data.recentActivity || [];
        
        setActivities(recentActivities.map((activity: any, index: number) => ({
          id: `activity-${index}`,
          timestamp: activity.timestamp,
          user: activity.by || 'System',
          action: activity.action.toLowerCase() as any,
          entityType: activity.type.toLowerCase() as any,
          entityName: `${activity.number} - ${activity.name}`,
          details: activity.details
        })));
      }
    } catch (error) {
      console.error('Fehler beim Laden der Aktivitäten:', error);
    }
    setLoading(false);
  };

  // Element wiederherstellen
  const restoreItem = async (item: DeletedItem) => {
    try {
      const endpoint = item.type === 'machine' ? 'machine' : 'part';
      const response = await fetch(
        `${API_URL}/admin/restore/${endpoint}/${item.id}`,
        {
          method: 'POST',
          headers: { 
            'X-API-Key': API_KEY,
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      
      if (response.ok) {
        // Aktualisiere Listen
        await loadDeletedItems();
        await loadActivities();
        await loadMetrics();
        
        // Cache invalidieren
        await queryClient.invalidateQueries();
        
        // Event für andere Komponenten
        window.dispatchEvent(new CustomEvent(`${item.type}s-restored`, { detail: { id: item.id } }));
      }
    } catch (error) {
      console.error('Fehler beim Wiederherstellen:', error);
    }
  };

  // Element permanent löschen
  const permanentDeleteItem = async () => {
    if (!confirmDeleteItem || isDeleting) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      const endpoint = confirmDeleteItem.type === 'machine' ? 'machines' : 'parts';
      const url = `${API_URL}/admin/${endpoint}/${confirmDeleteItem.id}/permanent`;
      
      console.log('Lösche permanent:', url);
      console.log('Item:', confirmDeleteItem);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 
          'X-API-Key': API_KEY,
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Delete response:', result);
        
        // Modal sofort schließen für besseres Benutzererlebnis
        setConfirmDeleteItem(null);
        setDeleteConfirmText('');
        
        // Entferne das gelöschte Element sofort aus der lokalen State
        setDeletedItems(prev => prev.filter(item => item.id !== confirmDeleteItem.id));
        
        // Kurze Verzögerung bevor wir die Listen neu laden
        setTimeout(async () => {
          console.log('Reloading deleted items after permanent deletion...');
          await loadDeletedItems();
          await loadActivities();
          await loadMetrics();
          await queryClient.invalidateQueries();
        }, 1000);
        
      } else {
        const data = await response.json();
        setError(data.error || 'Fehler beim permanenten Löschen');
      }
    } catch (error) {
      console.error('Fehler beim permanenten Löschen:', error);
      setError('Fehler beim permanenten Löschen');
    } finally {
      setIsDeleting(false);
    }
  };

  // Lade Benutzer vom Backend
  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users?includeDeleted=true', {
        headers: { 
          'X-API-Key': 'dev-key-123456',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.map((user: any) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role.toLowerCase(),
          isActive: user.isActive,
          lastLogin: user.lastLoginAt,
          createdAt: user.createdAt
        })));
      }
    } catch (error) {
      console.error('Fehler beim Laden der Benutzer:', error);
    }
    setLoading(false);
  };

  // Mock-Daten für Backups
  const loadBackupJobs = () => {
    setBackupJobs([
      {
        id: '1',
        type: 'scheduled',
        status: 'completed',
        startTime: new Date(Date.now() - 86400000).toISOString(),
        endTime: new Date(Date.now() - 86300000).toISOString(),
        size: '245 MB'
      },
      {
        id: '2',
        type: 'manual',
        status: 'running',
        startTime: new Date(Date.now() - 300000).toISOString()
      }
    ]);
  };

  // Backup starten
  const startBackup = async () => {
    const newBackup: BackupJob = {
      id: Date.now().toString(),
      type: 'manual',
      status: 'running',
      startTime: new Date().toISOString()
    };
    setBackupJobs([newBackup, ...backupJobs]);
    
    // Simuliere Backup-Prozess
    setTimeout(() => {
      setBackupJobs(prev => prev.map(job => 
        job.id === newBackup.id 
          ? { ...job, status: 'completed', endTime: new Date().toISOString(), size: '312 MB' }
          : job
      ));
    }, 5000);
  };

  // Export-Funktion
  const exportData = async (format: 'excel' | 'csv') => {
    try {
      const response = await fetch(`/api/admin/export/${format}`, {
        headers: { 
          'X-API-Key': 'dev-key-123456',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wartungsteile_export_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Export fehlgeschlagen');
      }
    } catch (error) {
      console.error('Export error:', error);
      setError('Export fehlgeschlagen');
    }
  };

  useEffect(() => {
    if (activeSection === 'overview') {
      loadMetrics();
    } else if (activeSection === 'trash') {
      loadDeletedItems();
    } else if (activeSection === 'activity') {
      loadActivities();
    } else if (activeSection === 'users') {
      loadUsers();
    } else if (activeSection === 'backup') {
      loadBackupJobs();
    }
  }, [activeSection]);

  // Filter gelöschte Elemente
  const filteredDeletedItems = deletedItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.identifier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `vor ${diffMins} Minuten`;
    if (diffHours < 24) return `vor ${diffHours} Stunden`;
    if (diffDays < 7) return `vor ${diffDays} Tagen`;
    return date.toLocaleDateString('de-DE');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Administration</h1>
        <p className="text-gray-300">
          Systemverwaltung und Überwachung
        </p>
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSave={() => {
          loadUsers();
          setShowUserModal(false);
          setEditingUser(null);
        }}
      />

      {/* Password Reset Modal */}
      <PasswordResetModal
        isOpen={showPasswordResetModal}
        onClose={() => {
          setShowPasswordResetModal(false);
          setPasswordResetUser(null);
        }}
        user={passwordResetUser}
        onSuccess={() => {
          setShowPasswordResetModal(false);
          setPasswordResetUser(null);
        }}
      />

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <div className="flex min-w-max">
          <button
            onClick={() => setActiveSection('overview')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeSection === 'overview'
                ? 'text-blue-600 border-blue-600 bg-blue-50/50'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Übersicht</span>
            </div>
          </button>
          <button
            onClick={() => setActiveSection('users')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeSection === 'users'
                ? 'text-blue-600 border-blue-600 bg-blue-50/50'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="h-4 w-4" />
              <span>Benutzer</span>
            </div>
          </button>
          <button
            onClick={() => setActiveSection('backup')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeSection === 'backup'
                ? 'text-blue-600 border-blue-600 bg-blue-50/50'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Database className="h-4 w-4" />
              <span>Backup & Wartung</span>
            </div>
          </button>
          <button
            onClick={() => setActiveSection('trash')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeSection === 'trash'
                ? 'text-blue-600 border-blue-600 bg-blue-50/50'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>Papierkorb</span>
              {deletedItems.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {deletedItems.length}
                </Badge>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveSection('activity')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeSection === 'activity'
                ? 'text-blue-600 border-blue-600 bg-blue-50/50'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Aktivitätsprotokoll</span>
            </div>
          </button>
        </div>
      </div>

      {/* Übersicht Section */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {loading && !metrics && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}
          {/* Metriken Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Cog className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold">{metrics?.totalMachines || 0}</span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Maschinen gesamt</h3>
                <p className="text-xs text-gray-500 mt-1">{metrics?.activeMachines || 0} aktiv</p>
              </div>
            </Card>

            <Card className="border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-2xl font-bold">{metrics?.totalParts || 0}</span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Wartungsteile</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {(metrics?.lowStockParts || 0) > 0 && (
                    <span className="text-orange-600">{metrics?.lowStockParts || 0} niedrig</span>
                  )}
                </p>
              </div>
            </Card>

            <Card className="border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-2xl font-bold">{metrics?.todayActivities || 0}</span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Aktivitäten heute</h3>
                <p className="text-xs text-gray-500 mt-1">Änderungen im System</p>
              </div>
            </Card>

            <Card className="border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <Users className="h-6 w-6 text-amber-600" />
                  </div>
                  <span className="text-2xl font-bold">{metrics?.activeUsers || 1}</span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Aktive Benutzer</h3>
                <p className="text-xs text-gray-500 mt-1">Im System angemeldet</p>
              </div>
            </Card>
          </div>

          {/* System Status */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">System Status</h2>
              <div className="space-y-3">
                <div className={`flex items-center justify-between p-3 rounded-lg ${
                  systemStatus.database === 'online' ? 'bg-green-50' : 
                  systemStatus.database === 'error' ? 'bg-red-50' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3">
                    {systemStatus.database === 'online' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : systemStatus.database === 'error' ? (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-600" />
                    )}
                    <span className="font-medium">Datenbank</span>
                  </div>
                  <Badge variant={
                    systemStatus.database === 'online' ? 'default' : 
                    systemStatus.database === 'error' ? 'destructive' : 'secondary'
                  } className={
                    systemStatus.database === 'online' ? 'bg-green-600' : 
                    systemStatus.database === 'error' ? 'bg-red-600' : ''
                  }>
                    {systemStatus.database === 'online' ? 'Online' : 
                     systemStatus.database === 'error' ? 'Fehler' : 'Offline'}
                  </Badge>
                </div>
                
                <div className={`flex items-center justify-between p-3 rounded-lg ${
                  systemStatus.azureStorage === 'connected' ? 'bg-green-50' : 
                  systemStatus.azureStorage === 'error' ? 'bg-red-50' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3">
                    {systemStatus.azureStorage === 'connected' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : systemStatus.azureStorage === 'error' ? (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-600" />
                    )}
                    <span className="font-medium">Azure Storage</span>
                  </div>
                  <Badge variant={
                    systemStatus.azureStorage === 'connected' ? 'default' : 
                    systemStatus.azureStorage === 'error' ? 'destructive' : 'secondary'
                  } className={
                    systemStatus.azureStorage === 'connected' ? 'bg-green-600' : 
                    systemStatus.azureStorage === 'error' ? 'bg-red-600' : ''
                  }>
                    {systemStatus.azureStorage === 'connected' ? 'Verbunden' : 
                     systemStatus.azureStorage === 'error' ? 'Fehler' : 'Getrennt'}
                  </Badge>
                </div>
                
                <div className={`flex items-center justify-between p-3 rounded-lg ${
                  systemStatus.formRecognizer === 'ready' ? 'bg-green-50' : 
                  systemStatus.formRecognizer === 'error' ? 'bg-red-50' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3">
                    {systemStatus.formRecognizer === 'ready' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : systemStatus.formRecognizer === 'error' ? (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-600" />
                    )}
                    <span className="font-medium">Form Recognizer</span>
                  </div>
                  <Badge variant={
                    systemStatus.formRecognizer === 'ready' ? 'default' : 
                    systemStatus.formRecognizer === 'error' ? 'destructive' : 'secondary'
                  } className={
                    systemStatus.formRecognizer === 'ready' ? 'bg-green-600' : 
                    systemStatus.formRecognizer === 'error' ? 'bg-red-600' : ''
                  }>
                    {systemStatus.formRecognizer === 'ready' ? 'Bereit' : 
                     systemStatus.formRecognizer === 'error' ? 'Fehler' : 'Nicht verfügbar'}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Papierkorb Section */}
      {activeSection === 'trash' && (
        <div className="space-y-4">
          {/* Such- und Filterleiste */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterType === 'all'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Alle
                </button>
                <button
                  onClick={() => setFilterType('machine')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterType === 'machine'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Maschinen
                </button>
                <button
                  onClick={() => setFilterType('part')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterType === 'part'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Teile
                </button>
              </div>
            </div>
          </div>

          {/* Zusammenfassung */}
          {filteredDeletedItems.length > 0 && (
            <Card className="mb-4">
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>{filteredDeletedItems.length} gelöschte Elemente</strong> im Papierkorb 
                      ({filteredDeletedItems.filter(i => i.type === 'machine').length} Maschinen, 
                      {filteredDeletedItems.filter(i => i.type === 'part').length} Teile)
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Gelöschte Elemente */}
          {filteredDeletedItems.length === 0 ? (
            <Card>
              <div className="p-12 text-center">
                <Trash2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Papierkorb ist leer</h3>
                <p className="text-gray-500">Keine gelöschten Elemente gefunden</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="max-h-[600px] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDeletedItems.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          item.type === 'machine' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          {item.type === 'machine' ? (
                            <Cog className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Package className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500">{item.identifier}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Gelöscht {formatDate(item.deletedAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>Von {item.deletedBy}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => restoreItem(item)}
                        disabled={!item.canRestore}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Wiederherstellen
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setConfirmDeleteItem(item);
                          setDeleteConfirmText('');
                          setError(null);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Permanent löschen
                      </Button>
                    </div>
                  </div>
                </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Aktivitätsprotokoll Section */}
      {activeSection === 'activity' && (
        <div className="space-y-4">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Letzte Aktivitäten</h2>
              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Keine Aktivitäten vorhanden</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className={`p-2 rounded-full ${
                        activity.action === 'created' ? 'bg-green-100' :
                        activity.action === 'updated' ? 'bg-blue-100' :
                        activity.action === 'deleted' ? 'bg-red-100' :
                        'bg-purple-100'
                      }`}>
                        {activity.action === 'created' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : activity.action === 'updated' ? (
                          <Activity className="h-4 w-4 text-blue-600" />
                        ) : activity.action === 'deleted' ? (
                          <Trash2 className="h-4 w-4 text-red-600" />
                        ) : (
                          <RotateCcw className="h-4 w-4 text-purple-600" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{activity.user}</span>
                          <span className="text-gray-500">
                            {activity.action === 'created' && 'hat erstellt'}
                            {activity.action === 'updated' && 'hat aktualisiert'}
                            {activity.action === 'deleted' && 'hat gelöscht'}
                            {activity.action === 'restored' && 'hat wiederhergestellt'}
                          </span>
                          <span className="font-medium text-gray-900">
                            {activity.entityType === 'machine' ? 'Maschine' : 'Wartungsteil'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{activity.entityName}</p>
                        {activity.details && (
                          <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        {formatDate(activity.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Benutzerverwaltung Section */}
      {activeSection === 'users' && (
        <div className="space-y-6">
          {/* Header mit Aktionen */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Benutzerverwaltung</h2>
            <Button 
              onClick={() => setShowUserModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Neuer Benutzer
            </Button>
          </div>

          {/* Benutzer-Tabelle */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4 font-medium text-gray-700">Benutzer</th>
                    <th className="text-left p-4 font-medium text-gray-700">Rolle</th>
                    <th className="text-left p-4 font-medium text-gray-700">Status</th>
                    <th className="text-left p-4 font-medium text-gray-700">Letzte Anmeldung</th>
                    <th className="text-left p-4 font-medium text-gray-700">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge 
                          variant={user.role === 'admin' ? 'destructive' : user.role === 'technician' ? 'default' : 'secondary'}
                        >
                          {user.role === 'admin' && 'Administrator'}
                          {user.role === 'technician' && 'Techniker'}
                          {user.role === 'viewer' && 'Betrachter'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className={`text-sm ${user.isActive ? 'text-green-700' : 'text-gray-500'}`}>
                            {user.isActive ? 'Aktiv' : 'Inaktiv'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {user.lastLogin ? formatDate(user.lastLogin) : 'Noch nie'}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => {
                            setEditingUser(user);
                            setShowUserModal(true);
                          }}>
                            Bearbeiten
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setPasswordResetUser(user);
                              setShowPasswordResetModal(true);
                            }}
                            title="Passwort zurücksetzen"
                          >
                            <Key className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant={user.isActive ? 'destructive' : 'default'}
                            onClick={async () => {
                              try {
                                if (user.isActive) {
                                  await userService.deactivate(user.id);
                                } else {
                                  await userService.activate(user.id);
                                }
                                await loadUsers();
                              } catch (error) {
                                console.error('Fehler beim Ändern des Benutzerstatus:', error);
                              }
                            }}
                          >
                            {user.isActive ? 'Sperren' : 'Aktivieren'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Passwort-Richtlinien */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Passwort-Richtlinien
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Mindestens 8 Zeichen</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Groß- und Kleinbuchstaben erforderlich</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Mindestens eine Zahl</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Sonderzeichen erforderlich</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Passwort-Ablauf nach 90 Tagen</span>
                </label>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Backup & Wartung Section */}
      {activeSection === 'backup' && (
        <div className="space-y-6">
          <BackupManagement onBackupCreated={() => {
            // Optional: Metriken oder andere Daten neu laden
            loadMetrics();
          }} />

          {/* Export & Wartung */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Daten exportieren
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Exportieren Sie alle Daten für Berichte oder Backups.
                </p>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => exportData('excel')}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Als Excel exportieren (.xlsx)
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => exportData('csv')}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Als CSV exportieren (.csv)
                  </Button>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Datenbank-Wartung
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Optimieren Sie die Datenbank-Performance.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Alte Logs löschen (älter als 90 Tage)</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/admin/maintenance/clean-logs', {
                            method: 'POST',
                            headers: { 
                              'X-API-Key': 'dev-key-123456',
                              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                            }
                          });
                          if (response.ok) {
                            const result = await response.json();
                            alert(result.message);
                          }
                        } catch (error) {
                          console.error('Error cleaning logs:', error);
                        }
                      }}
                    >
                      Ausführen
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Datenbank-Index neu aufbauen</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/admin/maintenance/rebuild-indexes', {
                            method: 'POST',
                            headers: { 
                              'X-API-Key': 'dev-key-123456',
                              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                            }
                          });
                          if (response.ok) {
                            const result = await response.json();
                            alert(result.message);
                          }
                        } catch (error) {
                          console.error('Error rebuilding indexes:', error);
                        }
                      }}
                    >
                      Ausführen
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Temporäre Dateien bereinigen</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/admin/maintenance/clean-temp', {
                            method: 'POST',
                            headers: { 
                              'X-API-Key': 'dev-key-123456',
                              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                            }
                          });
                          if (response.ok) {
                            const result = await response.json();
                            alert(result.message);
                          }
                        } catch (error) {
                          console.error('Error cleaning temp files:', error);
                        }
                      }}
                    >
                      Ausführen
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Bestätigungsmodal für permanentes Löschen */}
      {confirmDeleteItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {confirmDeleteItem.type === 'machine' ? 'Maschine' : 'Wartungsteil'} permanent löschen?
                </h3>
                <p className="text-gray-600 mb-4">
                  Sind Sie sicher, dass Sie {confirmDeleteItem.type === 'machine' ? 'die Maschine' : 'das Wartungsteil'} <span className="font-semibold">{confirmDeleteItem.name}</span> permanent löschen möchten?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-800">
                    <strong>Warnung:</strong> Diese Aktion kann nicht rückgängig gemacht werden. 
                    {confirmDeleteItem.type === 'machine' ? 'Die Maschine' : 'Das Wartungsteil'} wird vollständig aus der Datenbank entfernt.
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  Geben Sie <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">LÖSCHEN</span> ein, um zu bestätigen:
                </p>
                <Input
                  type="text"
                  className="mt-2"
                  placeholder="LÖSCHEN eingeben"
                  value={deleteConfirmText}
                  onChange={(e) => {
                    setDeleteConfirmText(e.target.value);
                  }}
                />
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                {error}
              </Alert>
            )}
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setConfirmDeleteItem(null);
                  setError(null);
                  setDeleteConfirmText('');
                }}
                disabled={isDeleting}
              >
                Abbrechen
              </Button>
              <Button
                id="confirm-delete-button"
                variant="destructive"
                onClick={permanentDeleteItem}
                disabled={deleteConfirmText !== 'LÖSCHEN' || isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Wird gelöscht...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Permanent löschen
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;