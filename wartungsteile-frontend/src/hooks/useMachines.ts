// src/hooks/useMachines.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { machineService } from '../services';
import type { Machine } from '../types/api';

export function useMachines() {
  return useQuery({
    queryKey: ['machines'],
    queryFn: machineService.getAll
  });
}

export function useMachineDetail(id: string) {
  return useQuery({
    queryKey: ['machine', id],
    queryFn: () => machineService.getById(id),
    enabled: !!id
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