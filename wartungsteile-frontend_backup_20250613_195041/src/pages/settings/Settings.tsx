import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { 
  Bell, 
  Globe, 
  Palette, 
  Shield, 
  Database,
  RefreshCw,
  Save
} from 'lucide-react';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    notifications: {
      emailAlerts: true,
      maintenanceDue: true,
      lowStock: true,
      systemUpdates: false
    },
    display: {
      language: 'de',
      dateFormat: 'DD.MM.YYYY',
      itemsPerPage: '20',
      theme: 'light'
    },
    system: {
      autoRefresh: true,
      refreshInterval: '60',
      dataRetention: '365'
    }
  });

  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = () => {
    // Hier würde normalerweise die API aufgerufen werden
    localStorage.setItem('userSettings', JSON.stringify(settings));
    setSaveMessage('Einstellungen erfolgreich gespeichert');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Einstellungen</h1>

      {saveMessage && (
        <Alert variant="success" className="mb-6">
          {saveMessage}
        </Alert>
      )}

      {/* Benachrichtigungen */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Bell className="h-5 w-5 text-gray-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Benachrichtigungen</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.notifications.emailAlerts}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: {
                    ...settings.notifications,
                    emailAlerts: e.target.checked
                  }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-gray-700">E-Mail-Benachrichtigungen aktivieren</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.notifications.maintenanceDue}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: {
                    ...settings.notifications,
                    maintenanceDue: e.target.checked
                  }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-gray-700">Benachrichtigung bei fälliger Wartung</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.notifications.lowStock}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: {
                    ...settings.notifications,
                    lowStock: e.target.checked
                  }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-gray-700">Warnung bei niedrigem Lagerbestand</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.notifications.systemUpdates}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: {
                    ...settings.notifications,
                    systemUpdates: e.target.checked
                  }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-gray-700">System-Updates und Wartungshinweise</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Anzeige */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Palette className="h-5 w-5 text-gray-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">Anzeige</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sprache
              </label>
              <select
                value={settings.display.language}
                onChange={(e) => setSettings({
                  ...settings,
                  display: {
                    ...settings.display,
                    language: e.target.value
                  }
                })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="de">Deutsch</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Datumsformat
              </label>
              <select
                value={settings.display.dateFormat}
                onChange={(e) => setSettings({
                  ...settings,
                  display: {
                    ...settings.display,
                    dateFormat: e.target.value
                  }
                })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Einträge pro Seite
              </label>
              <select
                value={settings.display.itemsPerPage}
                onChange={(e) => setSettings({
                  ...settings,
                  display: {
                    ...settings.display,
                    itemsPerPage: e.target.value
                  }
                })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Theme
              </label>
              <select
                value={settings.display.theme}
                onChange={(e) => setSettings({
                  ...settings,
                  display: {
                    ...settings.display,
                    theme: e.target.value
                  }
                })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="light">Hell</option>
                <option value="dark">Dunkel</option>
                <option value="auto">Automatisch</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* System */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Database className="h-5 w-5 text-gray-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">System</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.system.autoRefresh}
                onChange={(e) => setSettings({
                  ...settings,
                  system: {
                    ...settings.system,
                    autoRefresh: e.target.checked
                  }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-gray-700">Automatische Aktualisierung aktivieren</span>
            </label>

            {settings.system.autoRefresh && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aktualisierungsintervall (Sekunden)
                </label>
                <Input
                  type="number"
                  value={settings.system.refreshInterval}
                  onChange={(e) => setSettings({
                    ...settings,
                    system: {
                      ...settings.system,
                      refreshInterval: e.target.value
                    }
                  })}
                  min="30"
                  max="300"
                  className="w-32"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Datenaufbewahrung (Tage)
              </label>
              <Input
                type="number"
                value={settings.system.dataRetention}
                onChange={(e) => setSettings({
                  ...settings,
                  system: {
                    ...settings.system,
                    dataRetention: e.target.value
                  }
                })}
                min="30"
                max="730"
                className="w-32"
              />
              <p className="text-sm text-gray-500 mt-1">
                Logs und temporäre Daten älter als dieser Wert werden automatisch gelöscht
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Speichern Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Einstellungen speichern
        </Button>
      </div>
    </div>
  );
};

export default Settings;