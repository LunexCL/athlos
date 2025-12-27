import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import AcademyModel from '@/estructura/Academy';
import { Academy as AcademyInterface, CreateAcademyData } from '../types';
import { generateAppointmentsFromAcademy, deleteAcademyAppointments } from '../utils/academyAppointments';

// Convertir modelo a interfaz para compatibilidad
const toAcademyInterface = (academy: AcademyModel): AcademyInterface => ({
  id: academy.docId,
  name: academy.name,
  sportType: academy.sportType,
  description: academy.description,
  numberOfCourts: academy.numberOfCourts,
  courtPrice: academy.courtPrice,
  pricePerStudent: academy.pricePerStudent,
  headCoachId: academy.headCoachId || undefined,
  headCoachName: academy.headCoachName || undefined,
  courts: academy.courts,
  schedules: academy.schedules,
  exerciseIds: academy.exerciseIds,
  status: academy.status,
  createdBy: academy.createdBy,
  createdAt: academy.timestampCreatedAt,
  updatedAt: academy.timestampUpdatedAt,
});

export const useAcademies = () => {
  const [academies, setAcademies] = useState<AcademyInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const { tenant, user } = useAuth();

  useEffect(() => {
    if (!tenant?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Listener en tiempo real usando el modelo Academy
    const unsubscribe = AcademyModel.onSnapshotOrdered(
      tenant.id,
      'createdAt',
      'desc',
      (academyModels) => {
        setAcademies(academyModels.map(toAcademyInterface));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [tenant?.id]);

  const addAcademy = async (data: CreateAcademyData) => {
    if (!tenant?.id || !user?.uid) {
      throw new Error('No tenant ID or user ID');
    }

    // Validate max clients per court (padel = 4)
    const maxClientsPerCourt = data.sportType === 'padel' ? 4 : 6;
    for (const court of data.courts) {
      if (court.clientIds.length > maxClientsPerCourt) {
        throw new Error(`MAX_${maxClientsPerCourt}_CLIENTS_PER_COURT`);
      }
    }

    const academy = new AcademyModel(tenant.id);
    academy.name = data.name;
    academy.sportType = data.sportType;
    academy.description = data.description || '';
    academy.numberOfCourts = data.numberOfCourts;
    academy.courtPrice = data.courtPrice;
    academy.pricePerStudent = data.pricePerStudent;
    academy.headCoachId = data.headCoachId || '';
    academy.headCoachName = data.headCoachName || '';
    academy.schedules = data.schedules;
    academy.exerciseIds = data.exerciseIds || [];
    academy.status = 'active';
    academy.createdBy = user.uid;

    // Generate court IDs
    academy.courts = data.courts.map((court, index) => ({
      ...court,
      id: `court_${Date.now()}_${index}`,
    }));

    await academy.save();

    // Generar appointments automáticamente
    try {
      const appointmentsCount = await generateAppointmentsFromAcademy(
        tenant.id, 
        toAcademyInterface(academy)
      );
      console.log(`📅 Generated ${appointmentsCount} appointments for academy`);
    } catch (appointmentError) {
      console.error('⚠️ Error generating appointments:', appointmentError);
    }

    return academy.docId;
  };

  const updateAcademy = async (
    id: string,
    updates: Partial<Omit<AcademyInterface, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>
  ) => {
    if (!tenant?.id) throw new Error('No tenant ID');

    const academy = await AcademyModel.getById(tenant.id, id);
    if (!academy) throw new Error('Academia no encontrada');

    if (updates.name !== undefined) academy.name = updates.name;
    if (updates.sportType !== undefined) academy.sportType = updates.sportType;
    if (updates.description !== undefined) academy.description = updates.description || '';
    if (updates.numberOfCourts !== undefined) academy.numberOfCourts = updates.numberOfCourts;
    if (updates.courtPrice !== undefined) academy.courtPrice = updates.courtPrice;
    if (updates.pricePerStudent !== undefined) academy.pricePerStudent = updates.pricePerStudent;
    if (updates.headCoachId !== undefined) academy.headCoachId = updates.headCoachId || '';
    if (updates.headCoachName !== undefined) academy.headCoachName = updates.headCoachName || '';
    if (updates.courts !== undefined) academy.courts = updates.courts;
    if (updates.schedules !== undefined) academy.schedules = updates.schedules;
    if (updates.exerciseIds !== undefined) academy.exerciseIds = updates.exerciseIds;
    if (updates.status !== undefined) academy.status = updates.status;

    await academy.save();
  };

  const deleteAcademy = async (id: string, deleteFutureAppointments: boolean = true) => {
    if (!tenant?.id) throw new Error('No tenant ID');

    // Delete associated appointments using utility function
    if (deleteFutureAppointments) {
      const deletedCount = await deleteAcademyAppointments(tenant.id, id, false);
      console.log(`✅ Deleted ${deletedCount} future appointments`);
    }

    const academy = await AcademyModel.getById(tenant.id, id);
    if (!academy) throw new Error('Academia no encontrada');

    await academy.delete();
  };

  const getAcademiesByCoach = (coachId: string) => {
    return academies.filter((academy) =>
      academy.courts.some((court) => court.assignedCoachId === coachId) ||
      academy.headCoachId === coachId
    );
  };

  return {
    academies,
    loading,
    addAcademy,
    updateAcademy,
    deleteAcademy,
    getAcademiesByCoach,
  };
};
