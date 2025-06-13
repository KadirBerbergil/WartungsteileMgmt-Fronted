import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { User, Mail, Shield, Calendar, Key } from 'lucide-react';
import { userService } from '../../services/userService';

const Profile: React.FC = () => {
  const user = userService.getCurrentUserFromStorage();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Die neuen Passwörter stimmen nicht überein');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Das neue Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }

    setLoading(true);
    try {
      await userService.changePassword(
        user!.id,
        passwordData.currentPassword,
        passwordData.newPassword
      );
      setSuccess('Passwort erfolgreich geändert');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Ändern des Passworts');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6">
        <Alert variant="error">Benutzerdaten konnten nicht geladen werden</Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mein Profil</h1>

      {/* Benutzerdaten */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Benutzerdaten</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Benutzername</p>
                <p className="font-medium">{user.username}</p>
              </div>
            </div>

            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">E-Mail</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center">
              <Shield className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Rolle</p>
                <p className="font-medium">
                  {user.role === 'Admin' ? 'Administrator' : 
                   user.role === 'Technician' ? 'Techniker' : 
                   user.role === 'ReadOnly' ? 'Nur Lesen' : user.role}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Letzte Anmeldung</p>
                <p className="font-medium">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('de-DE') : 'Noch nie'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Passwort ändern */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Sicherheit</h2>
            {!isChangingPassword && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsChangingPassword(true)}
              >
                <Key className="h-4 w-4 mr-2" />
                Passwort ändern
              </Button>
            )}
          </div>

          {isChangingPassword && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {error && <Alert variant="error">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aktuelles Passwort
                </label>
                <Input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value
                  })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Neues Passwort
                </label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value
                  })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Neues Passwort bestätigen
                </label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value
                  })}
                  required
                />
              </div>

              <div className="flex space-x-3">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Wird geändert...' : 'Passwort ändern'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setError('');
                  }}
                >
                  Abbrechen
                </Button>
              </div>
            </form>
          )}

          {!isChangingPassword && (
            <p className="text-sm text-gray-600">
              Aus Sicherheitsgründen empfehlen wir, Ihr Passwort regelmäßig zu ändern.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Profile;