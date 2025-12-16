import { addDoc, collection, Timestamp, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Academy, AcademySchedule } from '../types';

/**
 * Genera appointments automáticos en el calendario basados en los horarios de una academia
 */
export const generateAppointmentsFromAcademy = async (
  tenantId: string,
  academy: Academy
): Promise<number> => {
  if (!academy.schedules || academy.schedules.length === 0) {
    console.log('⚠️ No schedules configured for academy:', academy.name);
    return 0;
  }

  const appointmentsRef = collection(db, 'tenants', tenantId, 'appointments');
  let createdCount = 0;

  for (const schedule of academy.schedules) {
    const dates = generateDatesFromSchedule(schedule);
    
    for (const date of dates) {
      // Para cada cancha, crear appointment por cada cliente
      for (const court of academy.courts) {
        if (court.clientIds.length === 0) continue;

        // Crear un appointment por cada cliente en la cancha
        for (let i = 0; i < court.clientIds.length; i++) {
          const clientId = court.clientIds[i];
          const clientName = court.clientNames[i] || 'Cliente';

          // Calcular endTime
          const [hours, minutes] = schedule.startTime.split(':').map(Number);
          const endMinutes = hours * 60 + minutes + schedule.duration;
          const endHours = Math.floor(endMinutes / 60);
          const endMins = endMinutes % 60;
          const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

          const appointmentData = {
            clientId,
            clientName,
            sportType: academy.sportType,
            date,
            startTime: schedule.startTime,
            endTime,
            duration: schedule.duration,
            status: 'scheduled',
            isPaid: false,
            academyId: academy.id,
            courtId: court.id,
            exerciseIds: academy.exerciseIds || [],
            notes: `Academia: ${academy.name} - Cancha ${court.courtNumber}`,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };

          try {
            await addDoc(appointmentsRef, appointmentData);
            createdCount++;
          } catch (error) {
            console.error('Error creating appointment:', error);
          }
        }
      }
    }
  }

  console.log(`✅ Generated ${createdCount} appointments for academy:`, academy.name);
  return createdCount;
};

/**
 * Genera todas las fechas basadas en un schedule
 */
function generateDatesFromSchedule(schedule: AcademySchedule): string[] {
  const dates: string[] = [];
  const startDate = new Date(schedule.startDate);
  const endDate = schedule.endDate ? new Date(schedule.endDate) : null;
  
  // Si no hay endDate, generar para los próximos 3 meses
  const maxDate = endDate || new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000);

  let currentDate = new Date(startDate);
  
  // Encontrar la primera fecha que coincida con el día de la semana
  while (currentDate.getDay() !== schedule.dayOfWeek && currentDate <= maxDate) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Generar todas las fechas con ese día de la semana
  while (currentDate <= maxDate) {
    if (currentDate.getDay() === schedule.dayOfWeek && currentDate >= startDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
    }
    currentDate.setDate(currentDate.getDate() + 7); // Siguiente semana
  }

  return dates;
}

/**
 * Elimina todos los appointments asociados a una academia
 * @param tenantId - ID del tenant
 * @param academyId - ID de la academia
 * @param deleteAll - Si es true, elimina todos. Si es false, solo los futuros
 * @returns Número de appointments eliminados
 */
export const deleteAcademyAppointments = async (
  tenantId: string,
  academyId: string,
  deleteAll: boolean = false
): Promise<number> => {
  console.log('🗑️ Deleting appointments for academy:', academyId, { deleteAll });
  
  const appointmentsRef = collection(db, 'tenants', tenantId, 'appointments');
  const q = query(appointmentsRef, where('academyId', '==', academyId));
  
  try {
    const snapshot = await getDocs(q);
    let deletedCount = 0;
    const today = new Date().toISOString().split('T')[0];
    
    for (const docSnap of snapshot.docs) {
      const appointment = docSnap.data();
      
      // Si deleteAll es false, solo eliminamos futuras
      if (!deleteAll) {
        const appointmentDate = appointment.date || new Date(appointment.startTime).toISOString().split('T')[0];
        if (appointmentDate < today) {
          console.log('⏭️ Skipping past appointment:', docSnap.id);
          continue;
        }
      }
      
      await deleteDoc(docSnap.ref);
      deletedCount++;
      console.log('✅ Deleted appointment:', docSnap.id);
    }
    
    console.log(`🎯 Deleted ${deletedCount} appointments for academy:`, academyId);
    return deletedCount;
  } catch (error) {
    console.error('❌ Error deleting academy appointments:', error);
    throw error;
  }
};
