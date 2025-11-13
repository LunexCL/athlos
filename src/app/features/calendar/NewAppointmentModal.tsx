import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sportOptions, SportType } from '@/app/shared/types/sports';
import { Calendar, Clock, User, UserPlus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useClients } from '@/app/features/clients/hooks/useClients';
import { useAppointments } from './hooks/useAppointments';
import { useAuth } from '@/app/features/auth/AuthContext';
import { useHistory } from 'react-router-dom';

const appointmentSchema = z.object({
  clientId: z.string().min(1, 'Selecciona un cliente'),
  date: z.string().min(1, 'La fecha es requerida'),
  startTime: z.string().min(1, 'La hora de inicio es requerida'),
  duration: z.number().min(15, 'Duración mínima: 15 minutos'),
  sportType: z.string().min(1, 'Selecciona un tipo de actividad'),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface NewAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { clients, loading: loadingClients } = useClients();
  const { addAppointment } = useAppointments();
  const { tenant } = useAuth();
  const history = useHistory();

  // Filter sports to only show the ones the trainer offers
  const trainerSports = tenant?.settings?.sports || [];
  const availableSports = sportOptions.filter(sport => 
    trainerSports.includes(sport.value)
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      duration: 60,
    },
  });

  const selectedSport = watch('sportType');

  const onSubmit = async (data: AppointmentFormData) => {
    setIsLoading(true);
    try {
      // Get client name for denormalization
      const client = clients.find(c => c.id === data.clientId);
      if (!client) {
        throw new Error('Cliente no encontrado');
      }

      await addAppointment({
        clientId: data.clientId,
        clientName: client.name,
        sportType: data.sportType,
        date: data.date,
        startTime: data.startTime,
        duration: data.duration,
        notes: data.notes,
      });
      
      toast.success('Clase creada', {
        description: `Clase de ${availableSports.find(s => s.value === data.sportType)?.label} programada con ${client.name}`,
      });
      
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error al crear clase:', error);
      toast.error('Error', {
        description: 'No se pudo crear la clase. Intenta nuevamente',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToClients = () => {
    onOpenChange(false);
    history.push('/clients');
  };

  const durations = [
    { value: 30, label: '30 minutos' },
    { value: 45, label: '45 minutos' },
    { value: 60, label: '1 hora' },
    { value: 90, label: '1 hora 30 min' },
    { value: 120, label: '2 horas' },
  ];

  // Si no hay clientes, mostrar CTA
  if (!loadingClients && clients.length === 0) {
    return (
      <Modal
        isOpen={open}
        onClose={() => onOpenChange(false)}
        title="Agrega tu primer cliente"
        description="Para crear una clase, primero necesitas agregar un cliente"
        size="md"
      >
        <div className="text-center py-6">
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tienes clientes todavía
          </h3>
          <p className="text-gray-500 mb-6">
            Comienza agregando tu primer cliente para poder programar clases
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleGoToClients}>
              <UserPlus className="h-4 w-4 mr-2" />
              Agregar Cliente
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Nueva Clase"
      description="Programa una nueva clase con tu cliente"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Loading state */}
        {loadingClients && (
          <div className="text-center py-4 text-gray-500">
            Cargando clientes...
          </div>
        )}
        {/* Client Selection */}
        <div className="space-y-2">
          <Label htmlFor="clientId">
            Cliente <span className="text-red-500">*</span>
          </Label>
          <select
            id="clientId"
            {...register('clientId')}
            disabled={isLoading || loadingClients}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Selecciona un cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          {errors.clientId && (
            <p className="text-sm text-red-500">{errors.clientId.message}</p>
          )}
        </div>

        {/* Sport Type */}
        <div className="space-y-2">
          <Label htmlFor="sportType">
            Tipo de Actividad <span className="text-red-500">*</span>
          </Label>
          <select
            id="sportType"
            {...register('sportType')}
            disabled={isLoading}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Selecciona el tipo de actividad</option>
            {availableSports.map((sport) => (
              <option key={sport.value} value={sport.value}>
                {sport.icon} {sport.label}
              </option>
            ))}
          </select>
          {errors.sportType && (
            <p className="text-sm text-red-500">{errors.sportType.message}</p>
          )}
          {availableSports.length === 0 && (
            <p className="text-sm text-amber-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              No tienes deportes configurados. Ve a tu perfil para agregarlos.
            </p>
          )}
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">
              Fecha <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                id="date"
                type="date"
                {...register('date')}
                disabled={isLoading}
                className="pl-10"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="startTime">
              Hora <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                id="startTime"
                type="time"
                {...register('startTime')}
                disabled={isLoading}
                className="pl-10"
              />
            </div>
            {errors.startTime && (
              <p className="text-sm text-red-500">{errors.startTime.message}</p>
            )}
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label htmlFor="duration">Duración</Label>
          <select
            id="duration"
            {...register('duration', { valueAsNumber: true })}
            disabled={isLoading}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {durations.map((duration) => (
              <option key={duration.value} value={duration.value}>
                {duration.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notas (opcional)</Label>
          <textarea
            id="notes"
            {...register('notes')}
            disabled={isLoading}
            rows={3}
            className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            placeholder="Agrega notas o instrucciones especiales..."
          />
        </div>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creando...' : 'Crear Clase'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
