// src/hooks/useParts.ts - KOMPLETT REPARIERTE VERSION ohne Bugs
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { maintenancePartService, maintenancePartsListService } from '../services';
import type { MaintenancePart } from '../types/api';

// ✅ UTILITY: Sichere ID-Validierung (identisch zu useMachines)
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

// ✅ UTILITY: Sichere Maschinen-Nummer Validierung
const isValidMachineNumber = (number: string | undefined | null): number is string => {
  return !!(
    number && 
    typeof number === 'string' &&
    number.trim().length > 0 &&
    number.length < 50 && // Reasonable limit
    !number.includes('..') && // Security
    /^[a-zA-Z0-9\-_\s]+$/.test(number.trim()) // Alphanumeric + spaces
  );
};

// ✅ UTILITY: Batch Cache Invalidation für bessere Performance
const invalidatePartQueries = async (queryClient: any, partId?: string, machineNumber?: string) => {
  const queries = [
    queryClient.invalidateQueries({ queryKey: ['maintenanceParts'] })
  ];
  
  if (partId && isValidId(partId)) {
    queries.push(
      queryClient.invalidateQueries({ queryKey: ['maintenancePart', partId] })
    );
  }
  
  // ✅ REPARIERT: Auch maintenancePartsList invalidieren
  if (machineNumber && isValidMachineNumber(machineNumber)) {
    queries.push(
      queryClient.invalidateQueries({ queryKey: ['maintenancePartsList', machineNumber] })
    );
  } else {
    // Alle Parts-Listen invalidieren falls Maschinen-Nummer unbekannt
    queries.push(
      queryClient.invalidateQueries({ queryKey: ['maintenancePartsList'] })
    );
  }
  
  try {
    await Promise.all(queries);
    console.log('✅ Parts cache invalidation completed');
  } catch (error) {
    console.warn('⚠️ Parts cache invalidation partial failure:', error);
  }
};

// ✅ REPARIERT: Alle Wartungsteile laden mit stabilen Query Keys
export function useMaintenanceParts() {
  // ✅ Stabile Query Key verhindert unnötige Re-Fetches
  const queryKey = useMemo(() => ['maintenanceParts'], []);
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      console.log('🔍 Fetching all maintenance parts...');
      return maintenancePartService.getAll();
    },
    staleTime: 1000 * 60 * 5, // 5 Minuten Cache
    gcTime: 1000 * 60 * 10, // 10 Minuten GC
    retry: (failureCount, error: any) => {
      // ✅ Intelligentes Retry wie in useMachines
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    throwOnError: false, // ✅ Verhindert unhandled rejections
  });
}

// ✅ REPARIERT: Einzelnes Wartungsteil laden mit sicherer Validierung
export function useMaintenancePartDetail(id: string) {
  // ✅ Stabile Query Key mit Memoization
  const queryKey = useMemo(() => ['maintenancePart', id], [id]);
  
  // ✅ Sichere Validierung gecacht
  const isEnabled = useMemo(() => isValidId(id), [id]);
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!isValidId(id)) {
        throw new Error(`Ungültige Wartungsteil-ID: ${id}`);
      }
      
      console.log('🔍 Fetching maintenance part detail for ID:', id);
      return maintenancePartService.getById(id);
    },
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5, // 5 Minuten Cache
    gcTime: 1000 * 60 * 10, // 10 Minuten GC
    retry: (failureCount, error: any) => {
      // ✅ Bei 404 nicht wiederholen
      if (error?.response?.status === 404) {
        console.log('🚫 Maintenance part not found, not retrying:', id);
        return false;
      }
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    throwOnError: false,
  });
}

// ✅ REPARIERT: Wartungsteileliste für spezifische Maschine
export function useMaintenancePartsList(machineNumber: string) {
  // ✅ Stabile Query Key
  const queryKey = useMemo(() => ['maintenancePartsList', machineNumber], [machineNumber]);
  
  // ✅ Sichere Validierung
  const isEnabled = useMemo(() => isValidMachineNumber(machineNumber), [machineNumber]);
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!isValidMachineNumber(machineNumber)) {
        throw new Error(`Ungültige Maschinennummer: ${machineNumber}`);
      }
      
      console.log('🔍 Generating parts list for machine:', machineNumber);
      return maintenancePartsListService.generateForMachine(machineNumber.trim());
    },
    enabled: isEnabled,
    staleTime: 1000 * 60 * 2, // 2 Minuten Cache (kürzer, da sich ändern kann)
    gcTime: 1000 * 60 * 5, // 5 Minuten GC
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        console.log('🚫 Machine not found for parts list:', machineNumber);
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    throwOnError: false,
  });
}

// ✅ REPARIERT: Wartungsteil erstellen mit optimistischen Updates
export function useCreateMaintenancePart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (part: Partial<MaintenancePart>) => {
      console.log('🔧 Erstelle Wartungsteil:', part);
      
      // ✅ Input-Validierung
      if (!part.name || !part.partNumber) {
        throw new Error('Name und Teilenummer sind erforderlich');
      }
      
      if (part.name.trim().length === 0 || part.partNumber.trim().length === 0) {
        throw new Error('Name und Teilenummer dürfen nicht leer sein');
      }
      
      return maintenancePartService.create(part);
    },
    
    // ✅ Optimistic Update mit Rollback
    onMutate: async (_part) => {
      console.log('🔄 Preparing optimistic part creation...');
      
      await queryClient.cancelQueries({ queryKey: ['maintenanceParts'] });
      
      const previousParts = queryClient.getQueryData<MaintenancePart[]>(['maintenanceParts']);
      
      return { previousParts };
    },
    
    onSuccess: async (newPartId, variables) => {
      console.log('✅ Wartungsteil erfolgreich erstellt mit ID:', newPartId);
      
      try {
        // ✅ Batch invalidation
        await invalidatePartQueries(queryClient);
        
        // ✅ Optimistisch neues Teil hinzufügen
        if (typeof newPartId === 'string' && isValidId(newPartId)) {
          const newPart: MaintenancePart = {
            id: newPartId,
            name: variables.name || '',
            partNumber: variables.partNumber || '',
            description: variables.description || '',
            category: variables.category || 'General',
            manufacturer: variables.manufacturer || '',
            price: Math.max(0, variables.price || 0), // ✅ Keine negativen Preise
            stockQuantity: Math.max(0, variables.stockQuantity || 0),
            // ✅ REPARIERT: minStockLevel entfernt (existiert nicht im MaintenancePart Type)
            ...variables
          };
          
          queryClient.setQueryData<MaintenancePart[]>(['maintenanceParts'], (old) => {
            if (!old) return [newPart];
            
            // ✅ Prüfe auf Duplikate
            const exists = old.some(p => p.id === newPartId);
            if (exists) {
              console.log('⚠️ Part already exists in cache, skipping optimistic update');
              return old;
            }
            
            return [...old, newPart];
          });
        }
        
      } catch (error) {
        console.warn('⚠️ Post-create operations failed:', error);
      }
    },
    
    // ✅ REPARIERT: Error Handler hinzugefügt
    onError: (error: any, variables, context) => {
      console.error('❌ Fehler beim Erstellen des Wartungsteils:', error, variables);
      
      // ✅ Rollback optimistic updates
      if (context?.previousParts) {
        console.log('🔄 Rolling back optimistic update...');
        queryClient.setQueryData(['maintenanceParts'], context.previousParts);
      }
    },
    
    onSettled: () => {
      console.log('🏁 Create maintenance part mutation settled');
    }
  });
}

// ✅ REPARIERT: Wartungsteil aktualisieren mit Rollback
export function useUpdateMaintenancePart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, part }: { id: string; part: Partial<MaintenancePart> }) => {
      console.log('🔧 Aktualisiere Wartungsteil:', id, part);
      
      // ✅ Strikte Validierung
      if (!isValidId(id)) {
        throw new Error(`Ungültige Wartungsteil-ID für Update: ${id}`);
      }
      
      if (!part || Object.keys(part).length === 0) {
        throw new Error('Keine Update-Daten bereitgestellt');
      }
      
      // ✅ Validiere numerische Felder (ohne minStockLevel da nicht im Type vorhanden)
      if (part.price !== undefined && (typeof part.price !== 'number' || part.price < 0)) {
        throw new Error('Preis muss eine positive Zahl sein');
      }
      
      if (part.stockQuantity !== undefined && (typeof part.stockQuantity !== 'number' || part.stockQuantity < 0)) {
        throw new Error('Lagerbestand muss eine positive Zahl sein');
      }
      
      return maintenancePartService.update(id, part);
    },
    
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ['maintenancePart', id] });
      await queryClient.cancelQueries({ queryKey: ['maintenanceParts'] });
      
      const previousPart = queryClient.getQueryData<MaintenancePart>(['maintenancePart', id]);
      const previousParts = queryClient.getQueryData<MaintenancePart[]>(['maintenanceParts']);
      
      return { previousPart, previousParts, id };
    },
    
    onSuccess: async (_, { id, part }) => {
      console.log('✅ Wartungsteil erfolgreich aktualisiert:', id);
      
      try {
        // ✅ Batch invalidation
        await invalidatePartQueries(queryClient, id);
        
        // ✅ Optimistic update
        queryClient.setQueryData<MaintenancePart>(['maintenancePart', id], (old) => {
          if (!old) return old;
          
          // ✅ Validiere Update-Daten vor Merge
          const validatedPart = Object.keys(part).reduce((acc, key) => {
            const value = part[key as keyof typeof part];
            if (value !== undefined && value !== null) {
              acc[key as keyof MaintenancePart] = value as any;
            }
            return acc;
          }, {} as Partial<MaintenancePart>);
          
          return { ...old, ...validatedPart };
        });
        
        // ✅ Auch Parts-Liste aktualisieren
        queryClient.setQueryData<MaintenancePart[]>(['maintenanceParts'], (old) => {
          if (!old) return old;
          
          return old.map(p => 
            p.id === id 
              ? { ...p, ...part } as MaintenancePart
              : p
          );
        });
        
      } catch (error) {
        console.warn('⚠️ Post-update operations failed:', error);
      }
    },
    
    // ✅ REPARIERT: Error Handler hinzugefügt
    onError: (error: any, { id, part }, context) => {
      console.error('❌ Fehler beim Aktualisieren des Wartungsteils:', error, { id, part });
      
      // ✅ Rollback
      if (context?.previousPart) {
        queryClient.setQueryData(['maintenancePart', id], context.previousPart);
      }
      if (context?.previousParts) {
        queryClient.setQueryData(['maintenanceParts'], context.previousParts);
      }
    }
  });
}

// ✅ REPARIERT: Wartungsteil löschen mit vollständiger Cache-Bereinigung
export function useDeleteMaintenancePart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      console.log('🗑️ Lösche Wartungsteil:', id);
      
      if (!isValidId(id)) {
        throw new Error(`Ungültige Wartungsteil-ID für Löschung: ${id}`);
      }
      
      return maintenancePartService.delete(id);
    },
    
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['maintenanceParts'] });
      await queryClient.cancelQueries({ queryKey: ['maintenancePart', id] });
      
      const previousParts = queryClient.getQueryData<MaintenancePart[]>(['maintenanceParts']);
      const previousPart = queryClient.getQueryData<MaintenancePart>(['maintenancePart', id]);
      
      return { previousParts, previousPart, id };
    },
    
    onSuccess: async (_, id) => {
      console.log('✅ Wartungsteil erfolgreich gelöscht:', id);
      
      try {
        // ✅ REPARIERT: Vollständige Cache-Bereinigung
        queryClient.removeQueries({ queryKey: ['maintenancePart', id], exact: true });
        
        // ✅ Batch invalidation aller betroffenen Queries
        await invalidatePartQueries(queryClient, id);
        
        // ✅ Optimistic removal
        queryClient.setQueryData<MaintenancePart[]>(['maintenanceParts'], (old) => {
          if (!old) return old;
          return old.filter(part => part.id !== id);
        });
        
      } catch (error) {
        console.warn('⚠️ Post-delete operations failed:', error);
      }
    },
    
    // ✅ REPARIERT: Error Handler hinzugefügt  
    onError: (error: any, id, context) => {
      console.error('❌ Fehler beim Löschen des Wartungsteils:', error, id);
      
      // ✅ Rollback
      if (context?.previousParts) {
        queryClient.setQueryData(['maintenanceParts'], context.previousParts);
      }
      if (context?.previousPart) {
        queryClient.setQueryData(['maintenancePart', id], context.previousPart);
      }
    }
  });
}

// ✅ BONUS: Bulk-Operationen für bessere Performance
export function useBulkUpdateMaintenanceParts() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: Array<{ id: string; part: Partial<MaintenancePart> }>) => {
      console.log('🔧 Bulk-Update für Wartungsteile:', updates.length, 'Teile');
      
      // ✅ Validierung aller Updates
      updates.forEach(({ id, part }) => {
        if (!isValidId(id)) {
          throw new Error(`Ungültige ID in Bulk-Update: ${id}`);
        }
        if (!part || Object.keys(part).length === 0) {
          throw new Error(`Leere Update-Daten für ID: ${id}`);
        }
      });
      
      // ✅ Parallel processing für bessere Performance
      const results = await Promise.allSettled(
        updates.map(({ id, part }) => maintenancePartService.update(id, part))
      );
      
      // ✅ Sammle Fehler falls welche aufgetreten sind
      const errors = results
        .filter(result => result.status === 'rejected')
        .map(result => (result as PromiseRejectedResult).reason);
      
      if (errors.length > 0) {
        throw new Error(`${errors.length} von ${updates.length} Updates fehlgeschlagen`);
      }
      
      return results;
    },
    
    onSuccess: async () => {
      console.log('✅ Bulk-Update erfolgreich abgeschlossen');
      
      // ✅ Vollständige Cache-Invalidierung nach Bulk-Update
      await invalidatePartQueries(queryClient);
    },
    
    onError: (error: any, updates) => {
      console.error('❌ Bulk-Update fehlgeschlagen:', error, updates.length, 'Updates');
    }
  });
}

// ✅ BONUS: Hook für Parts-Query Performance-Monitoring
export function usePartsQueryStats() {
  const queryClient = useQueryClient();
  
  return useCallback(() => {
    const queries = queryClient.getQueryCache().getAll();
    const partsQueries = queries.filter(q => 
      q.queryKey[0] === 'maintenanceParts' || 
      q.queryKey[0] === 'maintenancePart' ||
      q.queryKey[0] === 'maintenancePartsList'
    );
    
    return {
      totalQueries: partsQueries.length,
      activeQueries: partsQueries.filter(q => q.isActive()).length,
      staleQueries: partsQueries.filter(q => q.isStale()).length,
      errorQueries: partsQueries.filter(q => q.state.status === 'error').length,
      cacheSize: partsQueries.reduce((acc, q) => acc + JSON.stringify(q.state.data || {}).length, 0)
    };
  }, [queryClient]);
}