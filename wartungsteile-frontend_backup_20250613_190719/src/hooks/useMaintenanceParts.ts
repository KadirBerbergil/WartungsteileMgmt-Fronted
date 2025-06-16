import { useState, useEffect } from 'react';

export interface MaintenancePart {
  id: string;
  partNumber: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  manufacturer?: string;
  stockQuantity: number;
  minStockLevel: number;
  lastUpdated?: string;
}

export const useMaintenanceParts = () => {
  const [data, setData] = useState<MaintenancePart[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/maintenanceparts', {
          headers: {
            'X-API-Key': 'dev-api-key-12345'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch parts');
        }
        
        const parts = await response.json();
        setData(parts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchParts();
  }, []);

  return { data, loading, error };
};