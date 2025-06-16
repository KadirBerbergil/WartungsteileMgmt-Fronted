// src/components/MachineStatusUpdater.tsx - Status Update Component
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { machineService } from '../services';
import type { MachineDetail } from '../types/api';
import {
  CheckIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface MachineStatusUpdaterProps {
  machine: MachineDetail;
  onStatusChange?: (newStatus: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const MachineStatusUpdater: React.FC<MachineStatusUpdaterProps> = ({
  machine,
  onStatusChange,
  disabled = false,
  size = 'md'
}) => {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Aktuellen Status ermitteln
  const currentStatus = machine.status || 'Active';
  const currentStatusDisplay = machineService.getStatusDisplayName(currentStatus);
  
  // Verfügbare Status
  const availableStatuses = machineService.getAvailableStatuses();
  
  // Status-Update Funktion
  const handleStatusUpdate = async (newStatus: string) => {
    if (newStatus === currentStatus || isUpdating) {
      setIsDropdownOpen(false);
      return;
    }
    
    setIsUpdating(true);
    setError(null);
    
    try {
      console.log('🔄 Starting status update:', {
        machineId: machine.id,
        machineNumber: machine.number,
        currentStatus,
        newStatus
      });
      
      await machineService.updateMachineStatus(machine.id, newStatus);
      
      // Erfolg
      console.log('✅ Status update successful');
      
      // Cache invalidieren
      queryClient.invalidateQueries({ queryKey: ['machine', machine.id] });
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      
      // Callback aufrufen
      onStatusChange?.(newStatus);
      
      setIsDropdownOpen(false);
      
    } catch (error: any) {
      console.error('❌ Status update failed:', error);
      setError(error.message || 'Fehler beim Aktualisieren des Status');
    } finally {
      setIsUpdating(false);
    }
  };

  // Status-Farben
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'InMaintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'OutOfService':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Größen-Klassen
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          button: 'px-3 py-1 text-sm',
          dropdown: 'py-1',
          item: 'px-3 py-2 text-sm'
        };
      case 'lg':
        return {
          button: 'px-6 py-3 text-base',
          dropdown: 'py-2',
          item: 'px-4 py-3 text-base'
        };
      default:
        return {
          button: 'px-4 py-2 text-sm',
          dropdown: 'py-1',
          item: 'px-4 py-2 text-sm'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className="relative">
      {/* Status Button - Professionelleres Design */}
      <button
        onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
        disabled={disabled || isUpdating}
        className={`
          relative inline-flex items-center justify-between space-x-3 
          border rounded-lg font-medium transition-all
          ${getStatusColor(currentStatus)}
          ${sizeClasses.button}
          ${disabled || isUpdating 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:shadow-sm cursor-pointer hover:border-opacity-80'
          }
          ${isDropdownOpen ? 'ring-2 ring-blue-500 ring-opacity-20 shadow-sm' : ''}
          min-w-[140px] text-left
        `}
      >
        <div className="flex items-center space-x-2">
          {/* Status Indicator */}
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            currentStatus === 'Active' ? 'bg-green-600' :
            currentStatus === 'InMaintenance' ? 'bg-yellow-600' :
            currentStatus === 'OutOfService' ? 'bg-red-600' :
            'bg-gray-600'
          }`}></div>
          
          <span className="truncate">{currentStatusDisplay}</span>
        </div>
        
        {/* Loading/Dropdown Icon */}
        <div className="flex-shrink-0">
          {isUpdating ? (
            <ArrowPathIcon className="w-4 h-4 animate-spin" />
          ) : !disabled && (
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${
              isDropdownOpen ? 'rotate-180' : ''
            }`} />
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && !disabled && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsDropdownOpen(false)}
          ></div>
          
          {/* Dropdown Content - Professionelleres Design */}
          <div className="absolute top-full right-0 z-20 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <div className="py-1">
              {availableStatuses.map((status) => (
                <button
                  key={status.value}
                  onClick={() => handleStatusUpdate(status.value)}
                  disabled={isUpdating}
                  className={`
                    w-full text-left flex items-center justify-between px-4 py-3
                    hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0
                    ${status.value === currentStatus 
                      ? 'bg-blue-50 text-blue-900' 
                      : 'text-gray-700 hover:text-gray-900'
                    }
                    ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      status.value === 'Active' ? 'bg-green-500' :
                      status.value === 'InMaintenance' ? 'bg-yellow-500' :
                      status.value === 'OutOfService' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`}></div>
                    <span className="font-medium">{status.label}</span>
                  </div>
                  
                  {status.value === currentStatus && (
                    <CheckIcon className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
            
            {/* Status-Hinweis */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                Status wird sofort gespeichert
              </p>
            </div>
            
            {/* Debug Info nur bei Development */}
            {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
              <div className="border-t border-gray-200 px-3 py-2 bg-gray-100">
                <div className="text-xs text-gray-500">
                  <div>Machine: {machine.id.substring(0, 8)}...</div>
                  <div>Current: {currentStatus} ({machineService.getStatusInteger(currentStatus)})</div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 p-3 bg-red-50 border border-red-200 rounded shadow-lg">
          <div className="flex items-start space-x-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-900 font-medium text-sm">Status-Update fehlgeschlagen</p>
              <p className="text-red-800 text-xs mt-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 text-xs underline mt-1"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineStatusUpdater;