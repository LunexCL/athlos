/**
 * Calendar and appointment types for Sprint 3
 */

export interface Availability {
  id: string;
  tenantId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  duration: number; // minutes
  priceType?: 'low' | 'high'; // Para diferenciar horarios de precio bajo y alto
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  tenantId: string;
  clientId: string;
  clientName?: string; // Denormalizado para mostrar en UI
  instructorId: string;
  sportType?: string; // Tipo de deporte de la cita
  date?: string; // YYYY-MM-DD format
  startTime: Date | string; // Date object o HH:mm format
  endTime: Date | string; // Date object o HH:mm format
  duration?: number; // Duración en minutos
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'scheduled' | 'no-show';
  isPaid?: boolean; // Estado de pago
  academyId?: string; // ID de la academia si es clase grupal
  courtId?: string; // ID de la cancha dentro de la academia
  exerciseIds?: string[]; // IDs de ejercicios asignados
  notes?: string;
  googleEventId?: string | null;
  recurringGroupId?: string | null; // ID del grupo de clases recurrentes
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringAppointment {
  id: string;
  tenantId: string;
  clientId: string;
  clientName: string;
  sportType: string;
  startTime: string; // HH:mm format
  duration: number; // minutes
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlot {
  date: Date;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  appointmentId?: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'scheduled' | 'no-show';
