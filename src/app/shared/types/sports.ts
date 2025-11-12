/**
 * Sport/Activity types for the platform
 */

export type SportType = 
  | 'gym'
  | 'running'
  | 'yoga'
  | 'pilates'
  | 'crossfit'
  | 'boxing'
  | 'swimming'
  | 'cycling'
  | 'tennis'
  | 'soccer'
  | 'basketball'
  | 'functional'
  | 'personal_training'
  | 'physiotherapy'
  | 'nutrition'
  | 'other';

export interface SportOption {
  value: SportType;
  label: string;
  icon: string;
  color: string;
}

export const sportOptions: SportOption[] = [
  { value: 'gym', label: 'Gimnasio', icon: '💪', color: 'bg-blue-500' },
  { value: 'running', label: 'Running', icon: '🏃', color: 'bg-green-500' },
  { value: 'yoga', label: 'Yoga', icon: '🧘', color: 'bg-purple-500' },
  { value: 'pilates', label: 'Pilates', icon: '🤸', color: 'bg-pink-500' },
  { value: 'crossfit', label: 'CrossFit', icon: '🏋️', color: 'bg-red-500' },
  { value: 'boxing', label: 'Box', icon: '🥊', color: 'bg-orange-500' },
  { value: 'swimming', label: 'Natación', icon: '🏊', color: 'bg-cyan-500' },
  { value: 'cycling', label: 'Ciclismo', icon: '🚴', color: 'bg-yellow-500' },
  { value: 'tennis', label: 'Tenis', icon: '🎾', color: 'bg-lime-500' },
  { value: 'soccer', label: 'Fútbol', icon: '⚽', color: 'bg-emerald-500' },
  { value: 'basketball', label: 'Básquetbol', icon: '🏀', color: 'bg-amber-500' },
  { value: 'functional', label: 'Funcional', icon: '🏃‍♂️', color: 'bg-indigo-500' },
  { value: 'personal_training', label: 'Entrenamiento Personal', icon: '👤', color: 'bg-violet-500' },
  { value: 'physiotherapy', label: 'Kinesiología', icon: '🩺', color: 'bg-teal-500' },
  { value: 'nutrition', label: 'Nutrición', icon: '🥗', color: 'bg-rose-500' },
  { value: 'other', label: 'Otro', icon: '📋', color: 'bg-gray-500' },
];

export const getSportLabel = (sport: SportType): string => {
  return sportOptions.find(s => s.value === sport)?.label || 'Otro';
};

export const getSportIcon = (sport: SportType): string => {
  return sportOptions.find(s => s.value === sport)?.icon || '📋';
};

export const getSportColor = (sport: SportType): string => {
  return sportOptions.find(s => s.value === sport)?.color || 'bg-gray-500';
};
