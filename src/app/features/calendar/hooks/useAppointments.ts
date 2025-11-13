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
import { db } from '../../../../lib/firebase';
import { useAuth } from '../../auth/AuthContext';
import { toast } from 'sonner';

export interface Appointment {
  id: string;
  clientId: string;
  clientName?: string; // Denormalized for easier display
  sportType: string;
  date: string; // ISO date string
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  isPaid?: boolean; // Payment status
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateAppointmentData {
  clientId: string;
  clientName: string;
  sportType: string;
  date: string;
  startTime: string;
  duration: number;
  notes?: string;
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { tenant } = useAuth();

  useEffect(() => {
    if (!tenant?.id) {
      console.log('❌ No tenant ID for appointments');
      setLoading(false);
      return;
    }

    console.log('🔑 Loading appointments for tenant:', tenant.id);
    const appointmentsRef = collection(db, 'tenants', tenant.id, 'appointments');
    const q = query(appointmentsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const appointmentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Appointment[];
        console.log('📅 Appointments loaded:', appointmentsData.length, appointmentsData);
        setAppointments(appointmentsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading appointments:', error);
        toast.error('Error al cargar clases', {
          description: 'No se pudieron cargar las clases programadas',
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [tenant?.id]);

  const addAppointment = async (data: CreateAppointmentData) => {
    if (!tenant?.id) {
      console.error('❌ No tenant ID when adding appointment');
      throw new Error('No tenant ID');
    }

    try {
      console.log('💾 Creating appointment with data:', data);
      const appointmentsRef = collection(db, 'tenants', tenant.id, 'appointments');
      
      // Calculate end time
      const [hours, minutes] = data.startTime.split(':').map(Number);
      const endMinutes = hours * 60 + minutes + data.duration;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

      const appointmentData = {
        clientId: data.clientId,
        clientName: data.clientName,
        sportType: data.sportType,
        date: data.date,
        startTime: data.startTime,
        endTime,
        duration: data.duration,
        status: 'scheduled' as const,
        isPaid: false,
        notes: data.notes || '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      console.log('📝 Saving appointment to path:', `tenants/${tenant.id}/appointments`);
      console.log('📝 Appointment data:', appointmentData);
      const docRef = await addDoc(appointmentsRef, appointmentData);
      console.log('✅ Appointment created with ID:', docRef.id);
      
      return true;
    } catch (error) {
      console.error('Error adding appointment:', error);
      throw error;
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    if (!tenant?.id) {
      throw new Error('No tenant ID');
    }

    try {
      const appointmentRef = doc(db, 'tenants', tenant.id, 'appointments', id);
      await updateDoc(appointmentRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!tenant?.id) {
      throw new Error('No tenant ID');
    }

    try {
      const appointmentRef = doc(db, 'tenants', tenant.id, 'appointments', id);
      await deleteDoc(appointmentRef);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  };

  return {
    appointments,
    loading,
    addAppointment,
    updateAppointment,
    deleteAppointment,
  };
};
