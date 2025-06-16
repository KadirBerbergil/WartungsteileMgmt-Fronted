import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Button } from '../ui/Button';
import { Clock, AlertTriangle } from 'lucide-react';
import { userService } from '../../services/userService';

interface SessionManagerProps {
  children: React.ReactNode;
}

const SessionManager: React.FC<SessionManagerProps> = ({ children }) => {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionExpired, setSessionExpired] = useState(false);
  
  // Konfiguration
  const WARNING_TIME = 5 * 60 * 1000; // 5 Minuten vor Ablauf warnen
  const CHECK_INTERVAL = 30 * 1000; // Alle 30 Sekunden prüfen
  
  // Token-Ablaufzeit prüfen
  const checkTokenExpiry = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    
    try {
      // JWT Token dekodieren (ohne Verifizierung)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // exp ist in Sekunden, wir brauchen Millisekunden
      const now = Date.now();
      const timeLeft = expiryTime - now;
      
      // Wenn Token bereits abgelaufen
      if (timeLeft <= 0) {
        setSessionExpired(true);
        setShowWarning(false);
        handleLogout();
        return;
      }
      
      // Wenn weniger als WARNING_TIME übrig
      if (timeLeft <= WARNING_TIME && timeLeft > 0) {
        setShowWarning(true);
        setTimeRemaining(Math.floor(timeLeft / 1000)); // In Sekunden
      } else {
        setShowWarning(false);
      }
      
    } catch (error) {
      console.error('Fehler beim Prüfen des Token-Ablaufs:', error);
    }
  }, []);
  
  // Countdown aktualisieren
  useEffect(() => {
    if (showWarning && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setSessionExpired(true);
            setShowWarning(false);
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [showWarning, timeRemaining]);
  
  // Regelmäßige Prüfung
  useEffect(() => {
    checkTokenExpiry();
    const interval = setInterval(checkTokenExpiry, CHECK_INTERVAL);
    
    // Event Listener für Benutzeraktivität
    const resetTimer = () => {
      // Hier könnte man einen Silent-Refresh implementieren
      checkTokenExpiry();
    };
    
    window.addEventListener('click', resetTimer);
    window.addEventListener('keypress', resetTimer);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('keypress', resetTimer);
    };
  }, [checkTokenExpiry]);
  
  const handleLogout = async () => {
    try {
      await userService.logout();
    } catch (error) {
      console.error('Logout-Fehler:', error);
    } finally {
      navigate('/login');
    }
  };
  
  const handleExtendSession = async () => {
    try {
      // Token erneuern
      await userService.refreshToken();
      setShowWarning(false);
      checkTokenExpiry();
    } catch (error) {
      console.error('Token-Erneuerung fehlgeschlagen:', error);
      handleLogout();
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <>
      {children}
      
      {/* Session-Ablauf-Warnung */}
      <Transition appear show={showWarning} as={Fragment}>
        <Dialog 
          as="div" 
          className="relative z-50" 
          onClose={() => {}} // Nicht schließbar durch Klick außerhalb
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900"
                      >
                        Sitzung läuft ab
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        Ihre Sitzung endet in Kürze
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <span className="font-medium text-yellow-800">
                          Verbleibende Zeit:
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-yellow-800 text-center">
                        {formatTime(timeRemaining)}
                      </div>
                    </div>
                    
                    <p className="mt-4 text-sm text-gray-600">
                      Aus Sicherheitsgründen werden Sie automatisch abgemeldet. 
                      Möchten Sie Ihre Sitzung verlängern?
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="flex-1"
                    >
                      Jetzt abmelden
                    </Button>
                    <Button
                      onClick={handleExtendSession}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Sitzung verlängern
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      
      {/* Session abgelaufen Meldung */}
      <Transition appear show={sessionExpired} as={Fragment}>
        <Dialog 
          as="div" 
          className="relative z-50" 
          onClose={() => {}}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="text-center">
                    <div className="mx-auto p-3 bg-red-100 rounded-full w-fit mb-4">
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium text-gray-900 mb-2"
                    >
                      Sitzung abgelaufen
                    </Dialog.Title>
                    
                    <p className="text-sm text-gray-600 mb-6">
                      Ihre Sitzung ist aus Sicherheitsgründen abgelaufen. 
                      Bitte melden Sie sich erneut an.
                    </p>

                    <Button
                      onClick={() => navigate('/login')}
                      className="w-full"
                    >
                      Zur Anmeldung
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default SessionManager;