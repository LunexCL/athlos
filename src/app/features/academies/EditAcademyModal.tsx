import { useState, useEffect } from 'react';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sportOptions } from '@/app/shared/types/sports';
import { GraduationCap, ChevronLeft, ChevronRight, Users, Calendar, Dumbbell, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAcademies } from './hooks/useAcademies';
import { useCoaches } from './hooks/useCoaches';
import { useClients } from '@/app/features/clients/hooks/useClients';
import { useExercises } from './hooks/useExercises';
import { Court, AcademySchedule, Academy } from './types';

interface EditAcademyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  academy: Academy;
}

export const EditAcademyModal: React.FC<EditAcademyModalProps> = ({
  open,
  onOpenChange,
  academy,
}) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { updateAcademy } = useAcademies();
  const { coaches, loading: loadingCoaches } = useCoaches();
  const { clients, loading: loadingClients } = useClients();
  const { exercises } = useExercises();

  // Form state
  const [name, setName] = useState('');
  const [sportType, setSportType] = useState('');
  const [courtPrice, setCourtPrice] = useState(0);
  const [pricePerStudent, setPricePerStudent] = useState(0);
  const [headCoachId, setHeadCoachId] = useState('');
  const [courts, setCourts] = useState<Court[]>([]);
  const [schedules, setSchedules] = useState<AcademySchedule[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

  const maxClientsPerCourt = sportType === 'padel' ? 4 : 6;

  const dayNames = [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
  ];

  // Initialize form with academy data
  useEffect(() => {
    if (academy && open) {
      setName(academy.name);
      setSportType(academy.sportType);
      setCourtPrice(academy.courtPrice);
      setPricePerStudent(academy.pricePerStudent);
      setHeadCoachId(academy.headCoachId || '');
      setCourts([...academy.courts]);
      setSchedules([...academy.schedules]);
      setSelectedExercises([...(academy.exerciseIds || [])]);
    }
  }, [academy, open]);

  const resetForm = () => {
    setStep(1);
    setName(academy.name);
    setSportType(academy.sportType);
    setCourtPrice(academy.courtPrice);
    setPricePerStudent(academy.pricePerStudent);
    setHeadCoachId(academy.headCoachId || '');
    setCourts([...academy.courts]);
    setSchedules([...academy.schedules]);
    setSelectedExercises([...(academy.exerciseIds || [])]);
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onOpenChange(false);
    }
  };

  const validateStep1 = (): boolean => {
    if (!name.trim()) {
      toast.error('El nombre de la academia es requerido');
      return false;
    }
    if (courtPrice < 0 || pricePerStudent < 0) {
      toast.error('Los precios no pueden ser negativos');
      return false;
    }
    return true;
  };

  const handleStep1Next = () => {
    if (!validateStep1()) return;
    setStep(2);
  };

  const validateStep2 = (): boolean => {
    for (const court of courts) {
      if (!court.assignedCoachId || !court.assignedCoachName) {
        toast.error(`La cancha ${court.courtNumber} necesita un coach asignado`);
        return false;
      }
      if (court.clientIds.length === 0) {
        toast.error(`La cancha ${court.courtNumber} necesita al menos un alumno`);
        return false;
      }
      if (court.clientIds.length > maxClientsPerCourt) {
        toast.error(`La cancha ${court.courtNumber} supera el máximo de ${maxClientsPerCourt} alumnos`);
        return false;
      }
    }
    return true;
  };

  const handleStep2Next = () => {
    if (!validateStep2()) return;
    setStep(3);
  };

  const updateCourt = (index: number, updates: Partial<Court>) => {
    const updatedCourts = [...courts];
    updatedCourts[index] = { ...updatedCourts[index], ...updates };
    setCourts(updatedCourts);
  };

  const addClientToCourt = (courtIndex: number, clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const court = courts[courtIndex];
    if (court.clientIds.includes(clientId)) {
      toast.error('Este alumno ya está en la cancha');
      return;
    }
    if (court.clientIds.length >= maxClientsPerCourt) {
      toast.error(`Máximo ${maxClientsPerCourt} alumnos por cancha`);
      return;
    }

    updateCourt(courtIndex, {
      clientIds: [...court.clientIds, clientId],
      clientNames: [...court.clientNames, client.name],
    });
  };

  const removeClientFromCourt = (courtIndex: number, clientId: string) => {
    const court = courts[courtIndex];
    const clientIndex = court.clientIds.indexOf(clientId);

    if (clientIndex === -1) return;

    const newClientIds = court.clientIds.filter(id => id !== clientId);
    const newClientNames = court.clientNames.filter((_, idx) => idx !== clientIndex);

    updateCourt(courtIndex, {
      clientIds: newClientIds,
      clientNames: newClientNames,
    });
  };

  const addSchedule = () => {
    setSchedules([
      ...schedules,
      {
        dayOfWeek: 1, // Lunes por defecto
        startTime: '09:00',
        endTime: '10:00',
        duration: 60,
        startDate: new Date().toISOString().split('T')[0],
      },
    ]);
  };

  const updateSchedule = (index: number, field: keyof AcademySchedule, value: any) => {
    const updated = [...schedules];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-calculate duration if times change
    if (field === 'startTime' || field === 'endTime') {
      const start = field === 'startTime' ? value : updated[index].startTime;
      const end = field === 'endTime' ? value : updated[index].endTime;
      
      if (start && end) {
        const [startHour, startMin] = start.split(':').map(Number);
        const [endHour, endMin] = end.split(':').map(Number);
        const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
        updated[index].duration = duration > 0 ? duration : 60;
      }
    }

    setSchedules(updated);
  };

  const removeSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const toggleExercise = (exerciseId: string) => {
    setSelectedExercises(prev =>
      prev.includes(exerciseId)
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const validateStep3 = (): boolean => {
    if (schedules.length === 0) {
      toast.error('Debes agregar al menos un horario');
      return false;
    }

    for (const schedule of schedules) {
      if (!schedule.startTime || !schedule.endTime) {
        toast.error('Todos los horarios deben tener hora de inicio y fin');
        return false;
      }

      const [startHour, startMin] = schedule.startTime.split(':').map(Number);
      const [endHour, endMin] = schedule.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (endMinutes <= startMinutes) {
        toast.error('La hora de fin debe ser posterior a la hora de inicio');
        return false;
      }

      if (!schedule.startDate) {
        toast.error('Todos los horarios deben tener fecha de inicio');
        return false;
      }

      const startDate = new Date(schedule.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        toast.error('La fecha de inicio debe ser hoy o posterior');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setIsLoading(true);
    try {
      await updateAcademy(academy.id, {
        name,
        courtPrice,
        pricePerStudent,
        headCoachId: headCoachId || undefined,
        headCoachName: headCoachId ? coaches.find(c => c.id === headCoachId)?.name : undefined,
        courts,
        schedules,
        exerciseIds: selectedExercises,
      });

      toast.success('Academia actualizada', {
        description: 'Los cambios se guardaron correctamente',
      });

      handleClose();
    } catch (error: any) {
      console.error('Error al actualizar academia:', error);
      toast.error('Error al actualizar', {
        description: error.message || 'Intenta nuevamente',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const availableClients = clients.filter(c => c.status === 'active');

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={`Editar Academia: ${academy.name}`}
      description={
        step === 1 ? 'Información básica de la academia' :
        step === 2 ? 'Configurar canchas y asignar coaches/clientes' :
        'Horarios y ejercicios'
      }
      size="xl"
    >
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s < step ? 'bg-green-500 text-white' :
                  s === step ? 'bg-blue-600 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
              {s < 3 && (
                <div className={`flex-1 h-1 mx-2 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Nombre de la Academia *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Academia Pádel Pro"
              />
            </div>

            <div>
              <Label>Deporte</Label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {sportOptions.find(s => s.value === sportType)?.icon || '🏃'}
                  </span>
                  <span className="font-medium">
                    {sportOptions.find(s => s.value === sportType)?.label || sportType}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">
                    (No se puede cambiar)
                  </span>
                </div>
              </div>
            </div>

            <div>
              <Label>Número de Canchas</Label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                <span className="font-medium">{courts.length} canchas</span>
                <span className="text-xs text-gray-500 ml-2">
                  (No se puede cambiar)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Precio de la Cancha (CLP) *</Label>
                <Input
                  type="number"
                  value={courtPrice}
                  onChange={(e) => setCourtPrice(Number(e.target.value))}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <Label>Precio por Alumno (CLP) *</Label>
                <Input
                  type="number"
                  value={pricePerStudent}
                  onChange={(e) => setPricePerStudent(Number(e.target.value))}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label>Head Coach (Opcional)</Label>
              <select
                value={headCoachId}
                onChange={(e) => setHeadCoachId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="">Sin head coach</option>
                {coaches.map((coach) => (
                  <option key={coach.id} value={coach.id}>
                    {coach.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Coach que supervisa desde afuera (no necesita cancha asignada)
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Courts Configuration */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Users className="h-4 w-4" />
              <span>Máximo {maxClientsPerCourt} alumnos por cancha</span>
            </div>

            {courts.map((court, index) => (
              <div key={court.id} className="p-4 border rounded-lg space-y-3 bg-gray-50">
                <h3 className="font-semibold text-lg">Cancha {court.courtNumber}</h3>

                <div>
                  <Label>Coach Asignado *</Label>
                  <select
                    value={court.assignedCoachId}
                    onChange={(e) => {
                      const coachId = e.target.value;
                      const coach = coaches.find(c => c.id === coachId);
                      updateCourt(index, {
                        assignedCoachId: coachId,
                        assignedCoachName: coach?.name || '',
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                    disabled={loadingCoaches}
                  >
                    <option value="">Seleccionar coach</option>
                    {coaches.map((coach) => (
                      <option key={coach.id} value={coach.id}>
                        {coach.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>
                    Alumnos ({court.clientIds.length}/{maxClientsPerCourt}) *
                  </Label>
                  
                  {court.clientIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {court.clientIds.map((clientId, clientIndex) => (
                        <div
                          key={clientId}
                          className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          <span>{court.clientNames[clientIndex]}</span>
                          <button
                            type="button"
                            onClick={() => removeClientFromCourt(index, clientId)}
                            className="hover:bg-blue-200 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addClientToCourt(index, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                    disabled={loadingClients || court.clientIds.length >= maxClientsPerCourt}
                  >
                    <option value="">Agregar alumno...</option>
                    {availableClients
                      .filter(client => !court.clientIds.includes(client.id))
                      .map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Schedules and Exercises */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Schedules */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold">Horarios *</Label>
                <Button
                  type="button"
                  onClick={addSchedule}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Horario
                </Button>
              </div>

              {schedules.length === 0 ? (
                <div className="p-8 border-2 border-dashed rounded-lg text-center text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No hay horarios configurados</p>
                  <p className="text-sm">Agrega al menos un horario para las clases</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {schedules.map((schedule, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Horario {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSchedule(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm">Día de la semana</Label>
                          <select
                            value={schedule.dayOfWeek}
                            onChange={(e) => updateSchedule(index, 'dayOfWeek', Number(e.target.value))}
                            className="w-full px-3 py-2 border rounded-lg bg-white text-sm"
                          >
                            {dayNames.map((day, dayIndex) => (
                              <option key={dayIndex} value={dayIndex}>
                                {day}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Label className="text-sm">Fecha de inicio</Label>
                          <Input
                            type="date"
                            value={schedule.startDate}
                            onChange={(e) => updateSchedule(index, 'startDate', e.target.value)}
                            className="text-sm"
                          />
                        </div>

                        <div>
                          <Label className="text-sm">Hora inicio</Label>
                          <Input
                            type="time"
                            value={schedule.startTime}
                            onChange={(e) => updateSchedule(index, 'startTime', e.target.value)}
                            className="text-sm"
                          />
                        </div>

                        <div>
                          <Label className="text-sm">Hora fin</Label>
                          <Input
                            type="time"
                            value={schedule.endTime}
                            onChange={(e) => updateSchedule(index, 'endTime', e.target.value)}
                            className="text-sm"
                          />
                        </div>

                        <div>
                          <Label className="text-sm">Duración (min)</Label>
                          <Input
                            type="number"
                            value={schedule.duration}
                            readOnly
                            className="text-sm bg-gray-100"
                          />
                        </div>

                        <div>
                          <Label className="text-sm">Fecha fin (opcional)</Label>
                          <Input
                            type="date"
                            value={schedule.endDate || ''}
                            onChange={(e) => updateSchedule(index, 'endDate', e.target.value || undefined)}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Exercises */}
            <div>
              <Label className="text-base font-semibold">Ejercicios Asignados (Opcional)</Label>
              <p className="text-sm text-gray-500 mb-3">
                Selecciona los ejercicios que se realizarán en esta academia
              </p>

              {exercises.length === 0 ? (
                <div className="p-6 border rounded-lg text-center text-gray-500">
                  <Dumbbell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No tienes ejercicios creados</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2 border rounded-lg">
                  {exercises.map((exercise) => (
                    <label
                      key={exercise.id}
                      className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedExercises.includes(exercise.id)
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedExercises.includes(exercise.id)}
                        onChange={() => toggleExercise(exercise.id)}
                        className="rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{exercise.name}</p>
                        <p className="text-xs text-gray-500">{exercise.duration} min</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {selectedExercises.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {selectedExercises.length} ejercicio{selectedExercises.length !== 1 ? 's' : ''} seleccionado{selectedExercises.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <ModalFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => step === 1 ? handleClose() : setStep(step - 1)}
          disabled={isLoading}
        >
          {step === 1 ? (
            'Cancelar'
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </>
          )}
        </Button>
        
        {step < 3 ? (
          <Button
            type="button"
            onClick={step === 1 ? handleStep1Next : handleStep2Next}
            disabled={isLoading}
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Guardando...
              </>
            ) : (
              <>
                <GraduationCap className="h-4 w-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};
