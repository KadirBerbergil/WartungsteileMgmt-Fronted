import { useQuery } from '@tanstack/react-query';
import dashboardService from '../services/dashboardService';

export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: dashboardService.getMetrics,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });
};

export const useMaintenanceTrends = (months: number = 6) => {
  return useQuery({
    queryKey: ['dashboard', 'trends', months],
    queryFn: () => dashboardService.getTrends(months),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useMaintenanceDueMachines = () => {
  return useQuery({
    queryKey: ['dashboard', 'maintenance-due'],
    queryFn: dashboardService.getMaintenanceDueMachines,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};