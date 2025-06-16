import api from './api';

export interface DashboardMetrics {
  machines: {
    total: number;
    active: number;
    inMaintenance: number;
    outOfService: number;
    maintenanceDue: number;
    criticalAlerts: number;
  };
  parts: {
    total: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
    reorderRequired: number;
  };
  maintenance: {
    completedThisMonth: number;
    scheduledThisWeek: number;
    averageDowntime: number;
    costThisMonth: number;
  };
  recentActivities: Activity[];
  lastUpdated: string;
}

export interface Activity {
  type: string;
  title: string;
  description: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  machineNumber?: string;
  partNumber?: string;
}

export interface MaintenanceTrends {
  monthlyTrends: MonthlyTrend[];
  totalMaintenances: number;
  totalCost: number;
  averageDowntime: number;
}

export interface MonthlyTrend {
  year: number;
  month: number;
  monthName: string;
  maintenanceCount: number;
  totalCost: number;
  averageDowntime: number;
  partsReplaced: number;
}

export interface MaintenanceDueMachine {
  machineNumber: string;
  machineType: string;
  location: string;
  operatingHours: number;
  lastMaintenanceDate?: string;
  daysOverdue: number;
  hoursOverdue: number;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  lastTechnician?: string;
  estimatedDowntime: number;
}

const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    const response = await api.get<DashboardMetrics>('/dashboard/metrics');
    return response.data;
  },

  async getTrends(months: number = 6): Promise<MaintenanceTrends> {
    const response = await api.get<MaintenanceTrends>('/dashboard/trends', {
      params: { months }
    });
    return response.data;
  },

  async getMaintenanceDueMachines(): Promise<MaintenanceDueMachine[]> {
    const response = await api.get<MaintenanceDueMachine[]>('/dashboard/maintenance-due');
    return response.data;
  }
};

export default dashboardService;