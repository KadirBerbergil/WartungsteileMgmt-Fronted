import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

const SessionIndicator: React.FC = () => {
  const [remainingTime, setRemainingTime] = useState<string>('');
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);
  
  useEffect(() => {
    const updateRemainingTime = () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = payload.exp * 1000;
        const now = Date.now();
        const timeLeft = expiryTime - now;
        
        if (timeLeft <= 0) {
          setRemainingTime('Abgelaufen');
          setIsExpiringSoon(true);
          return;
        }
        
        const minutes = Math.floor(timeLeft / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        let displayTime = '';
        if (days > 0) {
          displayTime = `${days} Tag${days > 1 ? 'e' : ''}`;
        } else if (hours > 0) {
          displayTime = `${hours} Std.`;
        } else {
          displayTime = `${minutes} Min.`;
          setIsExpiringSoon(minutes <= 10);
        }
        
        setRemainingTime(displayTime);
      } catch (error) {
        console.error('Fehler beim Berechnen der verbleibenden Zeit:', error);
      }
    };
    
    updateRemainingTime();
    const interval = setInterval(updateRemainingTime, 60000); // Jede Minute aktualisieren
    
    return () => clearInterval(interval);
  }, []);
  
  if (!remainingTime) return null;
  
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
      isExpiringSoon 
        ? 'bg-amber-50 text-amber-700' 
        : 'bg-gray-50 text-gray-600'
    }`}>
      <Clock className="h-3.5 w-3.5" />
      <span className="font-medium">Sitzung: {remainingTime}</span>
    </div>
  );
};

export default SessionIndicator;