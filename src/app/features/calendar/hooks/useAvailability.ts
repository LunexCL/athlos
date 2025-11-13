import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '../../auth/AuthContext';
import { Availability } from '../types';

export const useAvailability = () => {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
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
    
    // Firestore path: tenants/{tenantId}/availability
    const availabilityRef = collection(db, 'tenants', tenant.id, 'availability');
    const q = query(availabilityRef, orderBy('dayOfWeek', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const availabilityData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            tenantId: tenant.id,
            dayOfWeek: data.dayOfWeek,
            startTime: data.startTime,
            endTime: data.endTime,
            duration: data.duration,
            isActive: data.isActive !== false, // Default to true
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Availability;
        });
        setAvailabilities(availabilityData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching availability:', err);
        setError('Error al cargar disponibilidad');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [tenant?.id]);

  const addAvailability = async (availabilityData: Omit<Availability, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>) => {
    if (!tenant?.id) throw new Error('No tenant ID');

    const availabilityRef = collection(db, 'tenants', tenant.id, 'availability');
    const now = Timestamp.now();

    const newAvailability = {
      dayOfWeek: availabilityData.dayOfWeek,
      startTime: availabilityData.startTime,
      endTime: availabilityData.endTime,
      duration: availabilityData.duration,
      isActive: availabilityData.isActive,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(availabilityRef, newAvailability);
    return docRef.id;
  };

  const updateAvailability = async (availabilityId: string, updates: Partial<Omit<Availability, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>) => {
    if (!tenant?.id) throw new Error('No tenant ID');

    const availabilityRef = doc(db, 'tenants', tenant.id, 'availability', availabilityId);
    
    await updateDoc(availabilityRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  };

  const deleteAvailability = async (availabilityId: string) => {
    if (!tenant?.id) throw new Error('No tenant ID');

    const availabilityRef = doc(db, 'tenants', tenant.id, 'availability', availabilityId);
    
    await deleteDoc(availabilityRef);
  };

  // Helper: Get availabilities for a specific day
  const getAvailabilitiesForDay = (dayOfWeek: number): Availability[] => {
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
