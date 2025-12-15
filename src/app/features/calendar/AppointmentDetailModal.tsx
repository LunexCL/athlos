import { useState } from 'react';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Appointment, useAppointments } from './hooks/useAppointments';
import { sportOptions } from '@/app/shared/types/sports';
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  DollarSign,
  Trash2,
  Edit,
  AlertTriangle,
  Dumbbell,
  Users,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { useExercises } from '@/app/features/academies/hooks/useExercises';
import { useAcademies } from '@/app/features/academies/hooks/useAcademies';

interface AppointmentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
}

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  open,
  onOpenChange,
  appointment,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { updateAppointment, deleteAppointment } = useAppointments();
  const { exercises } = useExercises();
  const { academies } = useAcademies();

  const sport = appointment ? sportOptions.find(s => s.value === appointment.sportType) : null;
  const academy = appointment?.academyId 
    ? academies.find(a => a.id === appointment.academyId) 
    : null;
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleStatusChange = async (newStatus: Appointment['status']) => {
    if (!appointment) return;
    
    setIsLoading(true);
    try {
      await updateAppointment(appointment.id, { status: newStatus });
      toast.success('Estado actualizado', {
        description: `La clase ahora está marcada como ${getStatusLabel(newStatus)}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error', {
        description: 'No se pudo actualizar el estado',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentToggle = async () => {
    if (!appointment) return;
    
    setIsLoading(true);
    const newStatus = !appointment.isPaid;
    
    try {
      await updateAppointment(appointment.id, {
        isPaid: newStatus,
      });
      
      toast.success(newStatus ? 'Clase marcada como pagada ✓' : 'Marcada como pendiente');
    } catch (error) {
      console.error('Error al actualizar pago:', error);
      toast.error('Error al actualizar el pago');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!appointment) return;
    
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!appointment) return;

    setIsLoading(true);
    try {
      await deleteAppointment(appointment.id);
      toast.success('Clase eliminada exitosamente');
      setShowDeleteConfirm(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar la clase');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const getStatusLabel = (status: Appointment['status']) => {
    const labels = {
      scheduled: 'Programada',
      completed: 'Realizada',
      cancelled: 'Cancelada',
      'no-show': 'No asistió',
    };
    return labels[status];
  };

  const getStatusColor = (status: Appointment['status']) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      'no-show': 'bg-orange-100 text-orange-800',
    };
    return colors[status];
  };

  if (!appointment) return null;

  return (<>
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Detalles de la Clase"
      description="Gestiona la información de esta clase"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header con deporte y estado */}
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${sport?.color || 'bg-gray-500'}`}>
              <span className="text-3xl">{sport?.icon || '📅'}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  {sport?.label || appointment.sportType}
                </h3>
                {appointment.academyId && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Users className="w-3 h-3" />
                    Academia
                  </span>
                )}
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusColor(appointment.status)}`}>
                {getStatusLabel(appointment.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Información de la clase */}
        <div className="space-y-4">
          {/* Academia Info */}
          {academy && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <Label className="text-purple-900 font-semibold">Academia: {academy.name}</Label>
                  {appointment.courtId && (
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-purple-600" />
                      <p className="text-sm text-purple-700">Cancha #{appointment.courtId}</p>
                    </div>
                  )}
                  <div className="mt-2 text-sm text-purple-600">
                    <p>💰 Cancha: ${academy.courtPrice.toLocaleString()} | Por alumno: ${academy.pricePerStudent.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cliente */}
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <Label className="text-gray-600">Cliente</Label>
              <p className="text-gray-900 font-medium">{appointment.clientName}</p>
            </div>
          </div>

          {/* Fecha */}
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <Label className="text-gray-600">Fecha</Label>
              <p className="text-gray-900 font-medium capitalize">{formatDate(appointment.date)}</p>
            </div>
          </div>

          {/* Hora y duración */}
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <Label className="text-gray-600">Horario</Label>
              <p className="text-gray-900 font-medium">
                {appointment.startTime} - {appointment.endTime} ({appointment.duration} minutos)
              </p>
            </div>
          </div>

          {/* Notas */}
          {appointment.notes && (
            <div className="flex items-start gap-3">
              <Edit className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <Label className="text-gray-600">Notas</Label>
                <p className="text-gray-900">{appointment.notes}</p>
              </div>
            </div>
          )}

          {/* Ejercicios asignados */}
          {appointment.exerciseIds && appointment.exerciseIds.length > 0 && (
            <div className="flex items-start gap-3">
              <Dumbbell className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <Label className="text-gray-600">Ejercicios Asignados</Label>
                <div className="mt-2 space-y-2">
                  {appointment.exerciseIds.map((exerciseId) => {
                    const exercise = exercises.find(ex => ex.id === exerciseId);
                    if (!exercise) return null;
                    return (
                      <div key={exerciseId} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-gray-900">{exercise.name}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                exercise.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                                exercise.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {exercise.difficulty === 'beginner' ? 'Principiante' :
                                 exercise.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                              </span>
                              {exercise.category && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                  {exercise.category === 'warm-up' && 'Calentamiento'}
                                  {exercise.category === 'drill' && 'Ejercicio'}
                                  {exercise.category === 'technique' && 'Técnica'}
                                  {exercise.category === 'game' && 'Juego'}
                                  {exercise.category === 'cool-down' && 'Enfriamiento'}
                                </span>
                              )}
                            </div>
                            {exercise.description && (
                              <p className="text-sm text-gray-600 mb-1">{exercise.description}</p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              {exercise.duration && (
                                <span>⏱️ {exercise.duration} min</span>
                              )}
                              {exercise.objectives && exercise.objectives.length > 0 && (
                                <span>🎯 {exercise.objectives.length} objetivos</span>
                              )}
                              {exercise.materials && exercise.materials.length > 0 && (
                                <span>🛠️ {exercise.materials.join(', ')}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Estado de pago */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-gray-600" />
              <div>
                <Label className="text-gray-900 font-medium">Estado de Pago</Label>
                <p className="text-sm text-gray-600">
                  {appointment.isPaid ? 'Pagada' : 'Pendiente de pago'}
                </p>
              </div>
            </div>
            <button
              onClick={handlePaymentToggle}
              disabled={isLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                appointment.isPaid ? 'bg-green-600' : 'bg-gray-300'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  appointment.isPaid ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Acciones de estado */}
        <div className="space-y-3">
          <Label className="text-gray-900 font-medium">Cambiar Estado</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={appointment.status === 'scheduled' ? 'default' : 'outline'}
              onClick={() => handleStatusChange('scheduled')}
              disabled={isLoading || appointment.status === 'scheduled'}
              className="justify-start"
            >
              <Clock className="h-4 w-4 mr-2" />
              Programada
            </Button>
            <Button
              variant={appointment.status === 'completed' ? 'default' : 'outline'}
              onClick={() => handleStatusChange('completed')}
              disabled={isLoading || appointment.status === 'completed'}
              className="justify-start"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Realizada
            </Button>
            <Button
              variant={appointment.status === 'cancelled' ? 'default' : 'outline'}
              onClick={() => handleStatusChange('cancelled')}
              disabled={isLoading || appointment.status === 'cancelled'}
              className="justify-start"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancelada
            </Button>
            <Button
              variant={appointment.status === 'no-show' ? 'default' : 'outline'}
              onClick={() => handleStatusChange('no-show')}
              disabled={isLoading || appointment.status === 'no-show'}
              className="justify-start"
            >
              <XCircle className="h-4 w-4 mr-2" />
              No asistió
            </Button>
          </div>
        </div>

        {/* Botón de eliminar */}
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isLoading}
            className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar Clase
          </Button>
        </div>
      </div>

      <ModalFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isLoading}
        >
          Cerrar
        </Button>
      </ModalFooter>
    </Modal>

    {/* Confirmation Modal for Delete */}
    {showDeleteConfirm && (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={cancelDelete}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          {/* Header */}
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Eliminar clase</h2>
            <p className="text-sm text-gray-600 mt-1">
              Esta acción no se puede deshacer.
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-gray-900 font-medium">
                  ¿Estás seguro de que deseas eliminar esta clase?
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={cancelDelete}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={confirmDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>
      </div>
    )}
  </>);
};
