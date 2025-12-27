import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../../auth/AuthContext';
import AppointmentModel from '@/estructura/Appointment';
import { toast } from 'sonner';

export interface Appointment {
  id: string;
  clientId: string;
  clientName?: string;
  sportType: string;
  date: string;
  startTime: string;
  endTime?: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  isPaid?: boolean;
  notes?: string;
  recurringGroupId?: string;
  exerciseIds?: string[];
  academyId?: string;
  courtId?: string;
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
  recurringGroupId?: string;
  exerciseIds?: string[];
  academyId?: string;
  courtId?: string;
}

// Convertir modelo a interfaz para compatibilidad
const toAppointmentInterface = (apt: AppointmentModel): Appointment => ({
  id: apt.docId,
  clientId: apt.clientId,
  clientName: apt.clientName || undefined,
  sportType: apt.sportType,
  date: apt.date,
  startTime: apt.startTime,
  endTime: apt.endTime || undefined,
  duration: apt.duration,
  status: apt.status as Appointment['status'],
  isPaid: apt.isPaid,
  notes: apt.notes || undefined,
  recurringGroupId: apt.recurringGroupId || undefined,
  exerciseIds: apt.exerciseIds.length > 0 ? apt.exerciseIds : undefined,
  academyId: apt.academyId || undefined,
  courtId: apt.courtId || undefined,
  createdAt: apt.timestampCreatedAt,
  updatedAt: apt.timestampUpdatedAt,
});

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { tenant } = useAuth();

  useEffect(() => {
    if (!tenant?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Listener en tiempo real usando el modelo Appointment
    const unsubscribe = AppointmentModel.onSnapshotOrdered(
      tenant.id,
      'createdAt',
      'desc',
      (appointmentModels) => {
        setAppointments(appointmentModels.map(toAppointmentInterface));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [tenant?.id]);

  const addAppointment = async (data: CreateAppointmentData) => {
    if (!tenant?.id) {
      throw new Error('No tenant ID');
    }

    const appointment = new AppointmentModel(tenant.id);
    appointment.clientId = data.clientId;
    appointment.clientName = data.clientName;
    appointment.sportType = data.sportType;
    appointment.date = data.date;
    appointment.startTime = data.startTime;
    appointment.duration = data.duration;
    appointment.notes = data.notes || '';
    appointment.recurringGroupId = data.recurringGroupId || null;
    appointment.exerciseIds = data.exerciseIds || [];
    appointment.academyId = data.academyId || null;
    appointment.courtId = data.courtId || null;
    appointment.status = 'scheduled';
    appointment.isPaid = false;

    // Calcular endTime
    appointment.calculateEndTime();

    await appointment.save();
    return appointment.docId;
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    if (!tenant?.id) throw new Error('No tenant ID');

    const appointment = await AppointmentModel.getById(tenant.id, id);
    if (!appointment) throw new Error('Cita no encontrada');

    if (updates.clientId !== undefined) appointment.clientId = updates.clientId;
    if (updates.clientName !== undefined) appointment.clientName = updates.clientName || '';
    if (updates.sportType !== undefined) appointment.sportType = updates.sportType;
    if (updates.date !== undefined) appointment.date = updates.date;
    if (updates.startTime !== undefined) appointment.startTime = updates.startTime;
    if (updates.endTime !== undefined) appointment.endTime = updates.endTime || '';
    if (updates.duration !== undefined) appointment.duration = updates.duration;
    if (updates.status !== undefined) appointment.status = updates.status;
    if (updates.isPaid !== undefined) appointment.isPaid = updates.isPaid;
    if (updates.notes !== undefined) appointment.notes = updates.notes || '';
    if (updates.recurringGroupId !== undefined) appointment.recurringGroupId = updates.recurringGroupId || null;
    if (updates.exerciseIds !== undefined) appointment.exerciseIds = updates.exerciseIds || [];
    if (updates.academyId !== undefined) appointment.academyId = updates.academyId || null;
    if (updates.courtId !== undefined) appointment.courtId = updates.courtId || null;

    await appointment.save();
  };

  const deleteAppointment = async (id: string) => {
    if (!tenant?.id) throw new Error('No tenant ID');

    const appointment = await AppointmentModel.getById(tenant.id, id);
    if (!appointment) throw new Error('Cita no encontrada');

    await appointment.delete();
  };

  return {
    appointments,
    loading,
    addAppointment,
    updateAppointment,
    deleteAppointment,
  };
};
