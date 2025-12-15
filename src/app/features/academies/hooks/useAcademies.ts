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
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '../../auth/AuthContext';
import { Academy, CreateAcademyData } from '../types';
import { generateAppointmentsFromAcademy } from '../utils/academyAppointments';

export const useAcademies = () => {
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [loading, setLoading] = useState(true);
  const { tenant, user } = useAuth();

  useEffect(() => {
    if (!tenant?.id) {
      console.log('❌ No tenant ID for academies');
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      try {
        console.log('🔑 Setting up academies listener for tenant:', tenant.id);
        const academiesRef = collection(db, 'tenants', tenant.id, 'academies');
        const q = query(academiesRef, orderBy('createdAt', 'desc'));

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const academiesData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Academy[];
            console.log('🏫 Academies loaded:', academiesData.length);
            setAcademies(academiesData);
            setLoading(false);
          },
          (error) => {
            console.error('Error loading academies:', error);
            setAcademies([]);
            setLoading(false);
          }
        );
      } catch (error) {
        console.error('Error setting up academies listener:', error);
        setAcademies([]);
        setLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        console.log('🧹 Cleaning up academies listener');
        unsubscribe();
      }
    };
  }, [tenant?.id]);

  const addAcademy = async (data: CreateAcademyData) => {
    if (!tenant?.id || !user?.uid) {
      console.error('❌ No tenant ID or user ID when adding academy');
      throw new Error('No tenant ID or user ID');
    }

    // Validations
    if (data.numberOfCourts >= 2 && data.courts.length < 2) {
      throw new Error('NEED_AT_LEAST_TWO_COACHES_FOR_MULTIPLE_COURTS');
    }

    // Validate max clients per court (padel = 4)
    const maxClientsPerCourt = data.sportType === 'padel' ? 4 : 6;
    for (const court of data.courts) {
      if (court.clientIds.length > maxClientsPerCourt) {
        throw new Error(`MAX_${maxClientsPerCourt}_CLIENTS_PER_COURT`);
      }
    }

    try {
      console.log('💾 Creating academy with data:', data);
      const academiesRef = collection(db, 'tenants', tenant.id, 'academies');

      // Generate court IDs
      const courtsWithIds = data.courts.map((court, index) => ({
        ...court,
        id: `court_${Date.now()}_${index}`,
      }));

      const academyData = {
        ...data,
        courts: courtsWithIds,
        status: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: user.uid,
        exerciseIds: data.exerciseIds || [],
      };

      const docRef = await addDoc(academiesRef, academyData);
      console.log('✅ Academy created with ID:', docRef.id);

      // Generar appointments automáticamente
      try {
        const appointmentsCount = await generateAppointmentsFromAcademy(tenant.id, {
          ...academyData,
          id: docRef.id,
        } as Academy);
        console.log(`📅 Generated ${appointmentsCount} appointments for academy`);
      } catch (appointmentError) {
        console.error('⚠️ Error generating appointments:', appointmentError);
        // No lanzamos error aquí, la academia ya fue creada
      }

      return docRef.id;
    } catch (error) {
      console.error('Error creating academy:', error);
      throw error;
    }
  };

  const updateAcademy = async (
    id: string,
    updates: Partial<Omit<Academy, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>
  ) => {
    if (!tenant?.id) {
      throw new Error('No tenant ID');
    }

    try {
      const academyRef = doc(db, 'tenants', tenant.id, 'academies', id);
      await updateDoc(academyRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
      console.log('✅ Academy updated:', id);
    } catch (error) {
      console.error('Error updating academy:', error);
      throw error;
    }
  };

  const deleteAcademy = async (id: string, deleteFutureAppointments: boolean = true) => {
    if (!tenant?.id) {
      throw new Error('No tenant ID');
    }

    try {
      // First, optionally delete future appointments
      if (deleteFutureAppointments) {
        const today = new Date().toISOString().split('T')[0];
        const appointmentsRef = collection(db, 'tenants', tenant.id, 'appointments');
        const q = query(
          appointmentsRef,
          where('academyId', '==', id),
          where('date', '>=', today)
        );
        
        const snapshot = await getDocs(q);
        console.log(`🗑️ Deleting ${snapshot.size} future appointments for academy ${id}`);
        
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      }

      // Then delete the academy
      const academyRef = doc(db, 'tenants', tenant.id, 'academies', id);
      await deleteDoc(academyRef);
      console.log('✅ Academy deleted:', id);
    } catch (error) {
      console.error('Error deleting academy:', error);
      throw error;
    }
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
