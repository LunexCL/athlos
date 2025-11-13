import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Clock, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAvailability } from './hooks/useAvailability';
import { Availability } from './types';

const availabilitySchema = z.object({
  selectedDays: z.array(z.number()).min(1, 'Selecciona al menos un día'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato HH:mm'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato HH:mm'),
  selectedDurations: z.array(z.number()).min(1, 'Selecciona al menos una duración'),
}).refine(data => data.endTime > data.startTime, {
  message: 'La hora de fin debe ser mayor que la de inicio',
  path: ['endTime'],
});

type AvailabilityFormData = z.infer<typeof availabilitySchema>;

const daysOfWeek = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];

const durationOptions = [
  { value: 60, label: '60 minutos (1 hora)' },
  { value: 90, label: '90 minutos (1.5 horas)' },
  { value: 120, label: '120 minutos (2 horas)' },
];

export const AvailabilitySettings: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDurations, setSelectedDurations] = useState<number[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const { availabilities, loading, addAvailability, deleteAvailability, updateAvailability } = useAvailability();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AvailabilityFormData>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      selectedDays: [],
      startTime: '09:00',
      endTime: '18:00',
      selectedDurations: [60],
    },
  });

  const toggleDay = (day: number) => {
    const newSelection = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day].sort();
    setSelectedDays(newSelection);
    setValue('selectedDays', newSelection);
  };

  const selectWeekdays = () => {
    const weekdays = [1, 2, 3, 4, 5]; // Lun-Vie
    setSelectedDays(weekdays);
    setValue('selectedDays', weekdays);
  };

  const selectWeekend = () => {
    const weekend = [0, 6]; // Dom-Sáb
    setSelectedDays(weekend);
    setValue('selectedDays', weekend);
  };

  const clearDays = () => {
    setSelectedDays([]);
    setValue('selectedDays', []);
  };

  const toggleDuration = (duration: number) => {
    const newSelection = selectedDurations.includes(duration)
      ? selectedDurations.filter(d => d !== duration)
      : [...selectedDurations, duration].sort();
    setSelectedDurations(newSelection);
    setValue('selectedDurations', newSelection);
  };

  const selectAllDurations = () => {
    const allDurations = durationOptions.map(d => d.value);
    setSelectedDurations(allDurations);
    setValue('selectedDurations', allDurations);
  };

  const clearDurations = () => {
    setSelectedDurations([]);
    setValue('selectedDurations', []);
  };

  const onSubmit = async (data: AvailabilityFormData) => {
    setIsLoading(true);
    try {
      // Crear disponibilidad para cada combinación de día y duración
      for (const dayOfWeek of data.selectedDays) {
        for (const duration of data.selectedDurations) {
          await addAvailability({
            dayOfWeek,
            startTime: data.startTime,
            endTime: data.endTime,
            duration,
            isActive: true,
          });
        }
      }
      
      const daysNames = data.selectedDays
        .map(d => daysOfWeek.find(day => day.value === d)?.label)
        .join(', ');
      const durationsText = data.selectedDurations
        .map(d => durationOptions.find(opt => opt.value === d)?.label)
        .join(', ');
      
      toast.success('Disponibilidad agregada', {
        description: `${data.selectedDays.length} días × ${data.selectedDurations.length} duraciones = ${data.selectedDays.length * data.selectedDurations.length} bloques creados`,
      });
      
      reset();
      setSelectedDays([]);
      setSelectedDurations([]);
      setIsAdding(false);
    } catch (error) {
      console.error('Error al agregar disponibilidad:', error);
      toast.error('Error', {
        description: 'No se pudo agregar la disponibilidad',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAvailability(id);
      toast.success('Disponibilidad eliminada');
    } catch (error) {
      console.error('Error al eliminar disponibilidad:', error);
      toast.error('Error', {
        description: 'No se pudo eliminar la disponibilidad',
      });
    }
  };

  const handleToggleActive = async (availability: Availability) => {
    try {
      await updateAvailability(availability.id, {
        isActive: !availability.isActive,
      });
      toast.success(availability.isActive ? 'Disponibilidad desactivada' : 'Disponibilidad activada');
    } catch (error) {
      console.error('Error al actualizar disponibilidad:', error);
      toast.error('Error', {
        description: 'No se pudo actualizar la disponibilidad',
      });
    }
  };

  // Group availabilities by day
  const availabilitiesByDay = daysOfWeek.map(day => ({
    ...day,
    slots: availabilities.filter(av => av.dayOfWeek === day.value),
  }));

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Disponibilidad</h2>
            <p className="text-gray-500 mt-1">Configura tus horarios disponibles para clases</p>
          </div>
          <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancelar' : <><Plus className="h-4 w-4 mr-2" />Agregar Horario</>}
        </Button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Nuevo Horario Disponible</CardTitle>
            <CardDescription>Define un bloque de tiempo disponible</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Day Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Selecciona los días</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectWeekdays}
                      className="text-xs"
                    >
                      Lun-Vie
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectWeekend}
                      className="text-xs"
                    >
                      Fin de semana
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearDays}
                      className="text-xs"
                    >
                      Limpiar
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {daysOfWeek.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedDays.includes(day.value)
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-xs">{day.label.substring(0, 3)}</div>
                    </button>
                  ))}
                </div>
                {errors.selectedDays && (
                  <p className="text-sm text-red-500">{errors.selectedDays.message}</p>
                )}
              </div>

              {/* Duration Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Duraciones de clase disponibles</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectAllDurations}
                      className="text-xs"
                    >
                      Todas
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearDurations}
                      className="text-xs"
                    >
                      Limpiar
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {durationOptions.map(duration => (
                    <button
                      key={duration.value}
                      type="button"
                      onClick={() => toggleDuration(duration.value)}
                      className={`p-4 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedDurations.includes(duration.value)
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'
                      }`}
                    >
                      <div className="text-base font-semibold">{duration.value} min</div>
                      <div className="text-xs opacity-80">{duration.label.split(' ').slice(1).join(' ')}</div>
                    </button>
                  ))}
                </div>
                {errors.selectedDurations && (
                  <p className="text-sm text-red-500">{errors.selectedDurations.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Time */}
                <div className="space-y-2">
                  <Label htmlFor="startTime">Hora de Inicio</Label>
                  <Input
                    id="startTime"
                    type="time"
                    {...register('startTime')}
                    disabled={isLoading}
                  />
                  {errors.startTime && (
                    <p className="text-sm text-red-500">{errors.startTime.message}</p>
                  )}
                </div>

                {/* End Time */}
                <div className="space-y-2">
                  <Label htmlFor="endTime">Hora de Fin</Label>
                  <Input
                    id="endTime"
                    type="time"
                    {...register('endTime')}
                    disabled={isLoading}
                  />
                  {errors.endTime && (
                    <p className="text-sm text-red-500">{errors.endTime.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    setIsAdding(false);
                  }}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Guardando...' : 'Guardar Horario'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Availabilities List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500">Cargando disponibilidad...</p>
          </div>
        ) : availabilitiesByDay.every(day => day.slots.length === 0) ? (
          <div className="col-span-full text-center py-12">
            <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay horarios configurados
            </h3>
            <p className="text-gray-500 mb-6">
              Agrega tus horarios disponibles para que los clientes puedan reservar clases
            </p>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Primer Horario
            </Button>
          </div>
        ) : (
          availabilitiesByDay.map(day => {
            if (day.slots.length === 0) return null;
            
            return (
              <div key={day.value}>
                <h3 className="font-semibold text-gray-900 mb-3">{day.label}</h3>
                <div className="space-y-2">
                  {day.slots.map(slot => (
                    <Card
                      key={slot.id}
                      className={`transition-all ${
                        slot.isActive
                          ? 'border-blue-200 bg-white'
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm font-medium">
                              <Clock className="h-4 w-4 mr-2 text-blue-600" />
                              {slot.startTime} - {slot.endTime}
                            </div>
                            <p className="text-xs text-gray-500">
                              {slot.duration} min por clase
                            </p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(slot)}
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">
                                {slot.isActive ? 'Desactivar' : 'Activar'}
                              </span>
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  slot.isActive ? 'bg-green-500' : 'bg-gray-400'
                                }`}
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(slot.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Eliminar</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
    </DashboardLayout>
  );
};
