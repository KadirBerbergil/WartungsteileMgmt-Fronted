// src/hooks/useMachines.ts - Korrigierte und sichere Hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { machineService } from '../services';
import type { Machine, MachineDetail } from '../types/api';

export function useMachines() {
  return useQuery({
    queryKey: ['machines'],
    queryFn: machineService.getAll,
    staleTime: 1000 * 60 * 5, // 5 Minuten
    retry: 2,
    refetchOnWindowFocus: false,
    onError: (error: any) => {
      console.error('❌ Fehler beim Laden der Maschinen:', error);
    }
  });
}

export function useMachineDetail(id: string) {
  return useQuery({
    queryKey: ['machine', id],
    queryFn: () => {
      if (!id || id === 'undefined' || id === 'null') {
        throw new Error('Ungültige Maschinen-ID');
      }
      return machineService.getById(id);
    },
    enabled: !!id && id !== 'undefined' && id !== 'null' && id.length > 0,
    staleTime: 1000 * 60 * 5, // 5 Minuten
    retry: (failureCount, error: any) => {
      // Bei 404 (Maschine nicht gefunden) nicht wiederholen
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    onError: (error: any) => {
      console.error('❌ Fehler beim Laden der Maschinendetails für ID:', id, error);
    }
  });
}

export function useMachineByNumber(number: string) {
  return useQuery({
    queryKey: ['machine', 'by-number', number],
    queryFn: () => {
      if (!number || number.trim() === '') {
        throw new Error('Ungültige Maschinennummer');
      }
      return machineService.getByNumber(number);
    },
    enabled: !!number && number.trim().length > 0,
    staleTime: 1000 * 60 * 5, // 5 Minuten
    retry: 2,
    refetchOnWindowFocus: false,
    onError: (error: any) => {
      console.error('❌ Fehler beim Laden der Maschine für Nummer:', number, error);
    }
  });
}

export function useCreateMachine() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (machine: Partial<Machine>) => {
      console.log('🔧 Erstelle neue Maschine:', machine);
      return machineService.create(machine);
    },
    onSuccess: (newMachineId, variables) => {
      console.log('✅ Maschine erfolgreich erstellt mit ID:', newMachineId);
      
      // Cache invalidieren
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      
      // Optimistisch neue Maschine zum Cache hinzufügen
      const newMachine: Machine = {
        id: newMachineId,
        number: variables.number || '',
        type: variables.type || '',
        operatingHours: variables.operatingHours || 0,
        installationDate: variables.installationDate || new Date().toISOString(),
        status: variables.status || 'Active',
        maintenanceCount: 0,
        lastMaintenanceDate: null,
        ...variables
      };
      
      queryClient.setQueryData(['machines'], (old: Machine[] | undefined) => {
        if (!old) return [newMachine];
        return [...old, newMachine];
      });
    },
    onError: (error: any, variables) => {
      console.error('❌ Fehler beim Erstellen der Maschine:', error, variables);
    }
  });
}

export function useUpdateMachine() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, machine }: { id: string; machine: Partial<Machine> }) => {
      console.log('🔧 Aktualisiere Maschine:', id, machine);
      
      if (!id || id === 'undefined' || id === 'null') {
        throw new Error('Ungültige Maschinen-ID für Update');
      }
      
      return machineService.update(id, machine);
    },
    onSuccess: (_, { id, machine }) => {
      console.log('✅ Maschine erfolgreich aktualisiert:', id);
      
      // Cache invalidieren
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      queryClient.invalidateQueries({ queryKey: ['machine', id] });
      
      // Optimistisch Maschine im Cache aktualisieren
      queryClient.setQueryData(['machine', id], (old: MachineDetail | undefined) => {
        if (!old) return old;
        return { ...old, ...machine };
      });
    },
    onError: (error: any, { id, machine }) => {
      console.error('❌ Fehler beim Aktualisieren der Maschine:', error, { id, machine });
    }
  });
}

export function useUpdateOperatingHours() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, hours }: { id: string; hours: number }) => {
      console.log('🔧 Aktualisiere Betriebsstunden:', id, hours);
      
      if (!id || id === 'undefined' || id === 'null') {
        throw new Error('Ungültige Maschinen-ID für Betriebsstunden-Update');
      }
      
      if (hours < 0) {
        throw new Error('Betriebsstunden können nicht negativ sein');
      }
      
      return machineService.updateOperatingHours(id, hours);
    },
    onSuccess: (_, { id, hours }) => {
      console.log('✅ Betriebsstunden erfolgreich aktualisiert:', id, hours);
      
      // Cache invalidieren
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      queryClient.invalidateQueries({ queryKey: ['machine', id] });
      
      // Optimistisch Betriebsstunden im Cache aktualisieren
      queryClient.setQueryData(['machine', id], (old: MachineDetail | undefined) => {
        if (!old) return old;
        return { ...old, operatingHours: hours };
      });
    },
    onError: (error: any, { id, hours }) => {
      console.error('❌ Fehler beim Aktualisieren der Betriebsstunden:', error, { id, hours });
    }
  });
}

export function useDeleteMachine() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => {
      console.log('🗑️ Lösche Maschine:', id);
      
      if (!id || id === 'undefined' || id === 'null') {
        throw new Error('Ungültige Maschinen-ID für Löschung');
      }
      
      return machineService.delete(id);
    },
    onSuccess: (_, id) => {
      console.log('✅ Maschine erfolgreich gelöscht:', id);
      
      // Cache invalidieren
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      queryClient.removeQueries({ queryKey: ['machine', id] });
      
      // Optimistisch Maschine aus Liste entfernen
      queryClient.setQueryData(['machines'], (old: Machine[] | undefined) => {
        if (!old) return old;
        return old.filter(machine => machine.id !== id);
      });
    },
    onError: (error: any, id) => {
      console.error('❌ Fehler beim Löschen der Maschine:', error, id);
    }
  });
}

export function usePerformMaintenance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, maintenanceData }: { id: string; maintenanceData: any }) => {
      console.log('🔧 Führe Wartung durch:', id, maintenanceData);
      
      if (!id || id === 'undefined' || id === 'null') {
        throw new Error('Ungültige Maschinen-ID für Wartung');
      }
      
      return machineService.performMaintenance(id, maintenanceData);
    },
    onSuccess: (_, { id }) => {
      console.log('✅ Wartung erfolgreich durchgeführt:', id);
      
      // Cache invalidieren um neue Wartungsdaten zu laden
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      queryClient.invalidateQueries({ queryKey: ['machine', id] });
      queryClient.invalidateQueries({ queryKey: ['maintenancePartsList'] });
    },
    onError: (error: any, { id, maintenanceData }) => {
      console.error('❌ Fehler beim Durchführen der Wartung:', error, { id, maintenanceData });
    }
  });
}

// Utility Hook für Magazine Properties Updates
export function useUpdateMagazineProperties() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, properties }: { id: string; properties: any }) => {
      console.log('🔧 Aktualisiere Magazin-Eigenschaften:', id, properties);
      
      if (!id || id === 'undefined' || id === 'null') {
        throw new Error('Ungültige Maschinen-ID für Magazin-Properties-Update');
      }
      
      return machineService.updateMagazineProperties(id, properties);
    },
    onSuccess: (_, { id }) => {
      console.log('✅ Magazin-Eigenschaften erfolgreich aktualisiert:', id);
      
      // Cache invalidieren
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      queryClient.invalidateQueries({ queryKey: ['machine', id] });
    },
    onError: (error: any, { id, properties }) => {
      console.error('❌ Fehler beim Aktualisieren der Magazin-Eigenschaften:', error, { id, properties });
    }
  });
}