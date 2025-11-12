import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sportOptions, SportType } from '@/app/shared/types/sports';
import { Calendar, Clock, User } from 'lucide-react';
import { toast } from 'sonner';

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
      // TODO: Implementar guardado en Firestore
      console.log('Nueva clase:', data);
      
      toast.success('Clase creada', {
        description: 'La clase ha sido programada exitosamente',
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

  // Mock clients - will be replaced with real data
  const clients = [
    { id: '1', name: 'Juan Pérez' },
    { id: '2', name: 'María González' },
    { id: '3', name: 'Carlos López' },
  ];

  const durations = [
    { value: 30, label: '30 minutos' },
    { value: 45, label: '45 minutos' },
    { value: 60, label: '1 hora' },
    { value: 90, label: '1 hora 30 min' },
    { value: 120, label: '2 horas' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Nueva Clase</DialogTitle>
          <DialogDescription>
            Programa una nueva clase con tu cliente
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label htmlFor="clientId">
              Cliente <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) => setValue('clientId', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500 text-center">
                    No hay clientes disponibles
                  </div>
                ) : (
                  clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        {client.name}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.clientId && (
              <p className="text-sm text-red-500">{errors.clientId.message}</p>
            )}
          </div>

          {/* Sport Type */}
          <div className="space-y-2">
            <Label htmlFor="sportType">
              Tipo de Actividad <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) => setValue('sportType', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de actividad" />
              </SelectTrigger>
              <SelectContent>
                {sportOptions.map((sport) => (
                  <SelectItem key={sport.value} value={sport.value}>
                    <div className="flex items-center">
                      <span className="mr-2">{sport.icon}</span>
                      {sport.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sportType && (
              <p className="text-sm text-red-500">{errors.sportType.message}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">
                Fecha <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
            <Select
              onValueChange={(value) => setValue('duration', parseInt(value))}
              defaultValue="60"
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la duración" />
              </SelectTrigger>
              <SelectContent>
                {durations.map((duration) => (
                  <SelectItem key={duration.value} value={duration.value.toString()}>
                    {duration.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <textarea
              id="notes"
              {...register('notes')}
              disabled={isLoading}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Agrega notas o instrucciones especiales..."
            />
          </div>

          <DialogFooter>
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
