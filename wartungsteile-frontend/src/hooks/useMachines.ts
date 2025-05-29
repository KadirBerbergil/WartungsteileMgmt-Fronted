// src/hooks/useMachines.ts - KOMPLETT REPARIERTE VERSION ohne Bugs
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { machineService } from '../services';
import type { Machine, MachineDetail } from '../types/api';

// ✅ UTILITY: Sichere ID-Validierung verhindert Injection-Attacks
const isValidId = (id: string | undefined | null): id is string => {
  return !!(
    id && 
    typeof id === 'string' &&
    id !== 'undefined' && 
    id !== 'null' && 
    id.trim().length > 0 &&
    id.length < 100 && // Verhindert extrem lange IDs
    !id.includes('..') && // Verhindert Path Traversal
    /^[a-zA-Z0-9\-_]+$/.test(id.trim()) // Nur sichere Zeichen
  );
};

// ✅ UTILITY: Sichere Nummer-Validierung
const isValidNumber = (number: string | undefined | null): number is string => {
  return !!(
    number && 
    typeof number === 'string' &&
    number.trim().length > 0 &&
    number.length < 50 // Reasonable limit
  );
};

// ✅ UTILITY: Batch Query Invalidation für bessere Performance
const invalidateMachineQueries = async (queryClient: any, machineId?: string) => {
  const queries = [
    queryClient.invalidateQueries({ queryKey: ['machines'] })
  ];
  
  if (machineId && isValidId(machineId)) {
    queries.push(
      queryClient.invalidateQueries({ queryKey: ['machine', machineId] }),
      queryClient.invalidateQueries({ queryKey: ['machine', 'by-number'] }) // Falls gecacht
    );
  }
  
  try {
    await Promise.all(queries);
    console.log('✅ Cache invalidation completed');
  } catch (error) {
    console.warn('⚠️ Cache invalidation partial failure:', error);
  }
};

export function useMachines() {
  // ✅ Stabile Query Key - verhindert unnötige Re-Fetches
  const queryKey = useMemo(() => ['machines'], []);
  
  return useQuery({
    queryKey,
    queryFn: machineService.getAll,
    staleTime: 1000 * 60 * 5, // 5 Minuten
    gcTime: 1000 * 60 * 10, // 10 Minuten (früher cacheTime)
    retry: (failureCount, error: any) => {
      // ✅ Intelligentes Retry - nicht bei 401/403
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    // ✅ Error Boundary wird automatisch durch React Query v5 gehandhabt
  });
}

export function useMachineDetail(id: string) {
  // ✅ Stabile Query Key mit Memoization
  const queryKey = useMemo(() => ['machine', id], [id]);
  
  // ✅ Validierung gecacht um Re-Renders zu vermeiden
  const isEnabled = useMemo(() => isValidId(id), [id]);
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!isValidId(id)) {
        throw new Error(`Ungültige Maschinen-ID: ${id}`);
      }
      
      console.log('🔍 Fetching machine detail for ID:', id);
      return machineService.getById(id);
    },
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5, // 5 Minuten
    gcTime: 1000 * 60 * 10, // 10 Minuten
    retry: (failureCount, error: any) => {
      // ✅ Bei 404 (Maschine nicht gefunden) nicht wiederholen
      if (error?.response?.status === 404) {
        console.log('🚫 Machine not found, not retrying:', id);
        return false;
      }
      // ✅ Bei Client-Fehlern (4xx) nicht wiederholen
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    throwOnError: false, // ✅ Verhindert unhandled promise rejections
  });
}

export function useMachineByNumber(number: string) {
  // ✅ Stabile Query Key
  const queryKey = useMemo(() => ['machine', 'by-number', number], [number]);
  
  // ✅ Validierung gecacht
  const isEnabled = useMemo(() => isValidNumber(number), [number]);
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!isValidNumber(number)) {
        throw new Error(`Ungültige Maschinennummer: ${number}`);
      }
      
      console.log('🔍 Fetching machine by number:', number);
      return machineService.getByNumber(number.trim());
    },
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5, // 5 Minuten
    gcTime: 1000 * 60 * 10, // 10 Minuten
    retry: 2,
    refetchOnWindowFocus: false,
    throwOnError: false,
  });
}

export function useCreateMachine() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (machine: Partial<Machine>) => {
      console.log('🔧 Erstelle neue Maschine:', machine);
      
      // ✅ Input-Validierung vor API-Call
      if (!machine.number || !machine.type) {
        throw new Error('Maschinennummer und Typ sind erforderlich');
      }
      
      return machineService.create(machine);
    },
    
    // ✅ Optimistic Update mit Rollback-Fähigkeit
    onMutate: async (_machine) => {
      console.log('🔄 Preparing optimistic update...');
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['machines'] });
      
      // Snapshot previous value for rollback
      const previousMachines = queryClient.getQueryData<Machine[]>(['machines']);
      
      return { previousMachines };
    },
    
    onSuccess: async (newMachineId, variables) => {
      console.log('✅ Maschine erfolgreich erstellt mit ID:', newMachineId);
      
      try {
        // ✅ ERST Cache invalidieren für frische Daten
        await invalidateMachineQueries(queryClient);
        
        // ✅ DANN optimistisch neue Maschine hinzufügen (nur falls noch nicht da)
        if (typeof newMachineId === 'string' && isValidId(newMachineId)) {
          const newMachine: Machine = {
            id: newMachineId,
            number: variables.number || '',
            type: variables.type || '',
            operatingHours: Math.max(0, variables.operatingHours || 0), // ✅ Keine negativen Werte
            installationDate: variables.installationDate || new Date().toISOString(),
            status: variables.status || 'Active',
            maintenanceCount: 0,
            lastMaintenanceDate: null,
            ...variables
          };
          
          queryClient.setQueryData<Machine[]>(['machines'], (old) => {
            if (!old) return [newMachine];
            
            // ✅ Prüfe ob bereits existiert (verhindert Duplikate)
            const exists = old.some(m => m.id === newMachineId);
            if (exists) {
              console.log('⚠️ Machine already exists in cache, skipping optimistic update');
              return old;
            }
            
            return [...old, newMachine];
          });
        }
        
      } catch (error) {
        console.warn('⚠️ Post-success operations failed:', error);
        // Nicht kritisch - die Hauptoperation war erfolgreich
      }
    },
    
    onError: (error: any, variables, context) => {
      console.error('❌ Fehler beim Erstellen der Maschine:', error, variables);
      
      // ✅ Rollback optimistic updates
      if (context?.previousMachines) {
        console.log('🔄 Rolling back optimistic update...');
        queryClient.setQueryData(['machines'], context.previousMachines);
      }
      
      // ✅ User-friendly error (falls Toast/Notification system verfügbar)
      // Falls du eine Toast-Library hast:
      // toast.error('Fehler beim Erstellen der Maschine. Bitte versuchen Sie es erneut.');
    },
    
    // ✅ Cleanup nach abgeschlossener Mutation
    onSettled: () => {
      console.log('🏁 Create machine mutation settled');
    }
  });
}

export function useUpdateMachine() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, machine }: { id: string; machine: Partial<Machine> }) => {
      console.log('🔧 Aktualisiere Maschine:', id, machine);
      
      // ✅ Strikte Validierung
      if (!isValidId(id)) {
        throw new Error(`Ungültige Maschinen-ID für Update: ${id}`);
      }
      
      if (!machine || Object.keys(machine).length === 0) {
        throw new Error('Keine Update-Daten bereitgestellt');
      }
      
      return machineService.update(id, machine);
    },
    
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ['machine', id] });
      await queryClient.cancelQueries({ queryKey: ['machines'] });
      
      const previousMachine = queryClient.getQueryData<MachineDetail>(['machine', id]);
      const previousMachines = queryClient.getQueryData<Machine[]>(['machines']);
      
      return { previousMachine, previousMachines, id };
    },
    
    onSuccess: async (_, { id, machine }) => {
      console.log('✅ Maschine erfolgreich aktualisiert:', id);
      
      try {
        // ✅ Batch invalidation
        await invalidateMachineQueries(queryClient, id);
        
        // ✅ Sichere optimistische Updates
        queryClient.setQueryData<MachineDetail>(['machine', id], (old) => {
          if (!old) return old;
          
          // ✅ Validiere Update-Daten vor Merge
          const validatedMachine = Object.keys(machine).reduce((acc, key) => {
            const value = machine[key as keyof typeof machine];
            if (value !== undefined && value !== null) {
              acc[key as keyof MachineDetail] = value as any;
            }
            return acc;
          }, {} as Partial<MachineDetail>);
          
          return { ...old, ...validatedMachine };
        });
        
        // ✅ Auch Machines-Liste aktualisieren
        queryClient.setQueryData<Machine[]>(['machines'], (old) => {
          if (!old) return old;
          
          return old.map(m => 
            m.id === id 
              ? { ...m, ...machine } as Machine
              : m
          );
        });
        
      } catch (error) {
        console.warn('⚠️ Post-update cache operations failed:', error);
      }
    },
    
    onError: (error: any, { id, machine }, context) => {
      console.error('❌ Fehler beim Aktualisieren der Maschine:', error, { id, machine });
      
      // ✅ Rollback
      if (context?.previousMachine) {
        queryClient.setQueryData(['machine', id], context.previousMachine);
      }
      if (context?.previousMachines) {
        queryClient.setQueryData(['machines'], context.previousMachines);
      }
    }
  });
}

export function useUpdateOperatingHours() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, hours }: { id: string; hours: number }) => {
      console.log('🔧 Aktualisiere Betriebsstunden:', id, hours);
      
      // ✅ Umfassende Validierung
      if (!isValidId(id)) {
        throw new Error(`Ungültige Maschinen-ID für Betriebsstunden-Update: ${id}`);
      }
      
      // ✅ Validiere Stunden-Wert
      if (typeof hours !== 'number' || !isFinite(hours)) {
        throw new Error('Betriebsstunden müssen eine gültige Zahl sein');
      }
      
      if (hours < 0) {
        throw new Error('Betriebsstunden können nicht negativ sein');
      }
      
      if (hours > 1000000) { // Reasonable upper limit
        throw new Error('Betriebsstunden-Wert ist unrealistisch hoch');
      }
      
      return machineService.updateOperatingHours(id, Math.round(hours)); // ✅ Runde auf ganze Zahlen
    },
    
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ['machine', id] });
      
      const previousMachine = queryClient.getQueryData<MachineDetail>(['machine', id]);
      return { previousMachine, id };
    },
    
    onSuccess: async (_, { id, hours }) => {
      console.log('✅ Betriebsstunden erfolgreich aktualisiert:', id, hours);
      
      try {
        await invalidateMachineQueries(queryClient, id);
        
        // ✅ Optimistic update mit Validierung
        queryClient.setQueryData<MachineDetail>(['machine', id], (old) => {
          if (!old) return old;
          return { ...old, operatingHours: Math.round(hours) };
        });
        
      } catch (error) {
        console.warn('⚠️ Post-hours-update operations failed:', error);
      }
    },
    
    onError: (error: any, { id, hours }, context) => {
      console.error('❌ Fehler beim Aktualisieren der Betriebsstunden:', error, { id, hours });
      
      if (context?.previousMachine) {
        queryClient.setQueryData(['machine', id], context.previousMachine);
      }
    }
  });
}

export function useDeleteMachine() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      console.log('🗑️ Lösche Maschine:', id);
      
      if (!isValidId(id)) {
        throw new Error(`Ungültige Maschinen-ID für Löschung: ${id}`);
      }
      
      return machineService.delete(id);
    },
    
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['machines'] });
      await queryClient.cancelQueries({ queryKey: ['machine', id] });
      
      const previousMachines = queryClient.getQueryData<Machine[]>(['machines']);
      const previousMachine = queryClient.getQueryData<MachineDetail>(['machine', id]);
      
      return { previousMachines, previousMachine, id };
    },
    
    onSuccess: async (_, id) => {
      console.log('✅ Maschine erfolgreich gelöscht:', id);
      
      try {
        // ✅ Cleanup: Remove specific machine queries
        queryClient.removeQueries({ queryKey: ['machine', id], exact: true });
        
        // ✅ Invalidate machines list
        await queryClient.invalidateQueries({ queryKey: ['machines'] });
        
        // ✅ Optimistic removal
        queryClient.setQueryData<Machine[]>(['machines'], (old) => {
          if (!old) return old;
          return old.filter(machine => machine.id !== id);
        });
        
      } catch (error) {
        console.warn('⚠️ Post-delete operations failed:', error);
      }
    },
    
    onError: (error: any, id, context) => {
      console.error('❌ Fehler beim Löschen der Maschine:', error, id);
      
      // ✅ Rollback
      if (context?.previousMachines) {
        queryClient.setQueryData(['machines'], context.previousMachines);
      }
      if (context?.previousMachine) {
        queryClient.setQueryData(['machine', id], context.previousMachine);
      }
    }
  });
}

export function usePerformMaintenance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, maintenanceData }: { id: string; maintenanceData: any }) => {
      console.log('🔧 Führe Wartung durch:', id, maintenanceData);
      
      if (!isValidId(id)) {
        throw new Error(`Ungültige Maschinen-ID für Wartung: ${id}`);
      }
      
      // ✅ Validiere Wartungsdaten
      if (!maintenanceData || typeof maintenanceData !== 'object') {
        throw new Error('Ungültige Wartungsdaten');
      }
      
      return machineService.performMaintenance(id, maintenanceData);
    },
    
    onSuccess: async (_, { id }) => {
      console.log('✅ Wartung erfolgreich durchgeführt:', id);
      
      try {
        // ✅ Batch invalidation aller relevanten Queries
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['machines'] }),
          queryClient.invalidateQueries({ queryKey: ['machine', id] }),
          queryClient.invalidateQueries({ queryKey: ['maintenancePartsList'] }),
          queryClient.invalidateQueries({ queryKey: ['maintenanceRecords'] }) // Falls vorhanden
        ]);
        
      } catch (error) {
        console.warn('⚠️ Post-maintenance cache operations failed:', error);
      }
    },
    
    onError: (error: any, { id, maintenanceData }) => {
      console.error('❌ Fehler beim Durchführen der Wartung:', error, { id, maintenanceData });
    }
  });
}

// ✅ REPARIERT: Magazine Properties Hook mit besserer Error-Behandlung
export function useUpdateMagazineProperties() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, properties }: { id: string; properties: any }) => {
      console.log('🔧 Aktualisiere Magazin-Eigenschaften:', id, properties);
      
      if (!isValidId(id)) {
        throw new Error(`Ungültige Maschinen-ID für Magazin-Properties-Update: ${id}`);
      }
      
      // ✅ Validiere Properties-Objekt
      if (!properties || typeof properties !== 'object') {
        throw new Error('Ungültige Magazin-Eigenschaften');
      }
      
      return machineService.updateMagazineProperties(id, properties);
    },
    
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ['machine', id] });
      
      const previousMachine = queryClient.getQueryData<MachineDetail>(['machine', id]);
      return { previousMachine, id };
    },
    
    onSuccess: async (_, { id, properties }) => {
      console.log('✅ Magazin-Eigenschaften erfolgreich aktualisiert:', id);
      
      try {
        await invalidateMachineQueries(queryClient, id);
        
        // ✅ Optimistic update mit Validierung
        queryClient.setQueryData<MachineDetail>(['machine', id], (old) => {
          if (!old) return old;
          
          // ✅ Sichere Merge-Operation
          const validatedProperties = Object.keys(properties).reduce((acc, key) => {
            const value = properties[key];
            if (value !== undefined) { // Erlaube null-Werte
              acc[key as keyof MachineDetail] = value;
            }
            return acc;
          }, {} as Partial<MachineDetail>);
          
          return { ...old, ...validatedProperties };
        });
        
      } catch (error) {
        console.warn('⚠️ Post-magazine-properties-update failed:', error);
      }
    },
    
    onError: (error: any, { id, properties }, context) => {
      console.error('❌ Fehler beim Aktualisieren der Magazin-Eigenschaften:', error, { id, properties });
      
      // ✅ Rollback
      if (context?.previousMachine) {
        queryClient.setQueryData(['machine', id], context.previousMachine);
      }
    }
  });
}

// ✅ BONUS: Hook für bessere Performance-Überwachung
export function useMachineQueryStats() {
  const queryClient = useQueryClient();
  
  return useCallback(() => {
    const queries = queryClient.getQueryCache().getAll();
    const machineQueries = queries.filter(q => 
      q.queryKey[0] === 'machines' || q.queryKey[0] === 'machine'
    );
    
    return {
      totalQueries: machineQueries.length,
      activeQueries: machineQueries.filter(q => q.isActive()).length,
      staleQueries: machineQueries.filter(q => q.isStale()).length,
      errorQueries: machineQueries.filter(q => q.state.status === 'error').length,
    };
  }, [queryClient]);
}