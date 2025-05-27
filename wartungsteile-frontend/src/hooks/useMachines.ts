// src/hooks/useMachines.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { machineService } from '../services';
import type { Machine } from '../types/api';

export function useMachines() {
  return useQuery({
    queryKey: ['machines'],
    queryFn: machineService.getAll,
    staleTime: 1000 * 60 * 5, // 5 Minuten
    retry: 2
  });
}

export function useMachineDetail(id: string) {
  return useQuery({
    queryKey: ['machine', id],
    queryFn: () => machineService.getById(id),
    enabled: !!id && id !== 'undefined',
    staleTime: 1000 * 60 * 5, // 5 Minuten
    retry: 2
  });
}

export function useCreateMachine() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (machine: Partial<Machine>) => machineService.create(machine),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machines'] });
    }
  });
}

export function useUpdateMachine() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, machine }: { id: string; machine: Partial<Machine> }) => 
      machineService.update(id, machine),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      queryClient.invalidateQueries({ queryKey: ['machine', id] });
    }
  });
}

export function useDeleteMachine() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => machineService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machines'] });
    }
  });
}