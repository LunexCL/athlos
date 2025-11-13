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
  Edit
} from 'lucide-react';
import { toast } from 'sonner';

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
  const { updateAppointment, deleteAppointment } = useAppointments();

  if (!appointment) return null;

  const sport = sportOptions.find(s => s.value === appointment.sportType);
  
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
    setIsLoading(true);
    try {
      const newPaymentStatus = !appointment.isPaid;
      await updateAppointment(appointment.id, { isPaid: newPaymentStatus });
      toast.success(newPaymentStatus ? 'Marcada como pagada' : 'Marcada como no pagada');
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Error', {
        description: 'No se pudo actualizar el estado de pago',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta clase?')) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteAppointment(appointment.id);
      toast.success('Clase eliminada');
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Error', {
        description: 'No se pudo eliminar la clase',
      });
    } finally {
      setIsLoading(false);
    }
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

  return (
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
              <h3 className="text-xl font-semibold text-gray-900">
                {sport?.label || appointment.sportType}
              </h3>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusColor(appointment.status)}`}>
                {getStatusLabel(appointment.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Información de la clase */}
        <div className="space-y-4">
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
  );
};
