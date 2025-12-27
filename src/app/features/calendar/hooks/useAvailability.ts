import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import AvailabilityModel from '@/estructura/Availability';
import { Availability as AvailabilityInterface } from '../types';

// Convertir modelo a interfaz para compatibilidad
const toAvailabilityInterface = (av: AvailabilityModel): AvailabilityInterface => ({
  id: av.docId,
  tenantId: av.tenantId,
  dayOfWeek: av.dayOfWeek,
  startTime: av.startTime,
  endTime: av.endTime,
  duration: av.duration,
  priceType: av.priceType || undefined,
  isActive: av.isActive,
  createdAt: av.createdAt,
  updatedAt: av.updatedAt,
});

export const useAvailability = () => {
  const [availabilities, setAvailabilities] = useState<AvailabilityInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { tenant } = useAuth();

  useEffect(() => {
    if (!tenant?.id) {
      setAvailabilities([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Listener en tiempo real usando el modelo Availability
    const unsubscribe = AvailabilityModel.onSnapshotOrdered(
      tenant.id,
      'dayOfWeek',
      'asc',
      (availabilityModels) => {
        setAvailabilities(availabilityModels.map(toAvailabilityInterface));
        setLoading(false);
        setError(null);
      }
    );

    return () => unsubscribe();
  }, [tenant?.id]);

  const addAvailability = async (availabilityData: Omit<AvailabilityInterface, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>) => {
    if (!tenant?.id) throw new Error('No tenant ID');

    const availability = new AvailabilityModel(tenant.id);
    availability.dayOfWeek = availabilityData.dayOfWeek;
    availability.startTime = availabilityData.startTime;
    availability.endTime = availabilityData.endTime;
    availability.duration = availabilityData.duration;
    availability.priceType = availabilityData.priceType || null;
    availability.isActive = availabilityData.isActive;

    await availability.save();
    return availability.docId;
  };

  const updateAvailability = async (availabilityId: string, updates: Partial<Omit<AvailabilityInterface, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>) => {
    if (!tenant?.id) throw new Error('No tenant ID');

    const availability = await AvailabilityModel.getById(tenant.id, availabilityId);
    if (!availability) throw new Error('Disponibilidad no encontrada');

    if (updates.dayOfWeek !== undefined) availability.dayOfWeek = updates.dayOfWeek;
    if (updates.startTime !== undefined) availability.startTime = updates.startTime;
    if (updates.endTime !== undefined) availability.endTime = updates.endTime;
    if (updates.duration !== undefined) availability.duration = updates.duration;
    if (updates.priceType !== undefined) availability.priceType = updates.priceType || null;
    if (updates.isActive !== undefined) availability.isActive = updates.isActive;

    await availability.save();
  };

  const deleteAvailability = async (availabilityId: string) => {
    if (!tenant?.id) throw new Error('No tenant ID');

    const availability = await AvailabilityModel.getById(tenant.id, availabilityId);
    if (!availability) throw new Error('Disponibilidad no encontrada');

    await availability.delete();
  };

  // Helper: Get availabilities for a specific day
  const getAvailabilitiesForDay = (dayOfWeek: number): AvailabilityInterface[] => {
    return availabilities.filter(
      av => av.dayOfWeek === dayOfWeek && av.isActive
    );
  };

  // Helper: Check if a time slot is available
  const isTimeSlotAvailable = (dayOfWeek: number, startTime: string, endTime: string): boolean => {
    const dayAvailabilities = getAvailabilitiesForDay(dayOfWeek);
    
    if (dayAvailabilities.length === 0) return false;

    // Check if the requested time falls within any availability block
    return dayAvailabilities.some(av => {
      return startTime >= av.startTime && endTime <= av.endTime;
    });
  };

  return {
    availabilities,
    loading,
    error,
    addAvailability,
    updateAvailability,
    deleteAvailability,
    getAvailabilitiesForDay,
    isTimeSlotAvailable,
  };
};
