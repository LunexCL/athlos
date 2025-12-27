import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import ExerciseModel from '@/estructura/Exercise';
import type { ExerciseCategory, ExerciseDifficulty } from '@/estructura/Exercise';
import { Exercise as ExerciseInterface, CreateExerciseData } from '../types';

// Re-exportar tipos para compatibilidad
export type { ExerciseCategory, ExerciseDifficulty };

// Convertir modelo a interfaz para compatibilidad con código existente
const toExerciseInterface = (exercise: ExerciseModel): ExerciseInterface => ({
  id: exercise.docId,
  name: exercise.name,
  description: exercise.description,
  duration: exercise.duration,
  materials: exercise.materials,
  objectives: exercise.objectives,
  category: exercise.category,
  sportType: exercise.sportType,
  difficulty: exercise.difficulty,
  videoUrl: exercise.videoUrl || undefined,
  imageUrl: exercise.imageUrl || undefined,
  instructions: exercise.instructions,
  createdAt: exercise.timestampCreatedAt,
  updatedAt: exercise.timestampUpdatedAt,
});

export const useExercises = () => {
  const [exercises, setExercises] = useState<ExerciseInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const { tenant } = useAuth();

  useEffect(() => {
    if (!tenant?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Listener en tiempo real usando el modelo Exercise
    const unsubscribe = ExerciseModel.onSnapshotOrdered(
      tenant.id,
      'createdAt',
      'desc',
      (exerciseModels) => {
        setExercises(exerciseModels.map(toExerciseInterface));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [tenant?.id]);

  const addExercise = async (data: CreateExerciseData) => {
    if (!tenant?.id) throw new Error('No tenant ID');

    const exercise = new ExerciseModel(tenant.id);
    exercise.name = data.name;
    exercise.description = data.description;
    exercise.duration = data.duration || 0;
    exercise.materials = data.materials || [];
    exercise.objectives = data.objectives;
    exercise.category = data.category;
    exercise.sportType = data.sportType;
    exercise.difficulty = data.difficulty;
    exercise.videoUrl = data.videoUrl || '';
    exercise.imageUrl = data.imageUrl || '';
    exercise.instructions = data.instructions || '';

    await exercise.save();
    return exercise.docId;
  };

  const updateExercise = async (
    id: string,
    updates: Partial<Omit<ExerciseInterface, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    if (!tenant?.id) throw new Error('No tenant ID');

    const exercise = await ExerciseModel.getById(tenant.id, id);
    if (!exercise) throw new Error('Ejercicio no encontrado');

    if (updates.name !== undefined) exercise.name = updates.name;
    if (updates.description !== undefined) exercise.description = updates.description;
    if (updates.duration !== undefined) exercise.duration = updates.duration;
    if (updates.materials !== undefined) exercise.materials = updates.materials;
    if (updates.objectives !== undefined) exercise.objectives = updates.objectives;
    if (updates.category !== undefined) exercise.category = updates.category;
    if (updates.sportType !== undefined) exercise.sportType = updates.sportType;
    if (updates.difficulty !== undefined) exercise.difficulty = updates.difficulty;
    if (updates.videoUrl !== undefined) exercise.videoUrl = updates.videoUrl || '';
    if (updates.imageUrl !== undefined) exercise.imageUrl = updates.imageUrl || '';
    if (updates.instructions !== undefined) exercise.instructions = updates.instructions;

    await exercise.save();
  };

  const deleteExercise = async (id: string) => {
    if (!tenant?.id) throw new Error('No tenant ID');

    const exercise = await ExerciseModel.getById(tenant.id, id);
    if (!exercise) throw new Error('Ejercicio no encontrado');

    await exercise.delete();
  };

  const getExercisesBySport = (sportType: string) => {
    return exercises.filter((exercise) => exercise.sportType === sportType);
  };

  const getExercisesByCategory = (category: ExerciseInterface['category']) => {
    return exercises.filter((exercise) => exercise.category === category);
  };

  return {
    exercises,
    loading,
    addExercise,
    updateExercise,
    deleteExercise,
    getExercisesBySport,
    getExercisesByCategory,
  };
};
