import { useState, useEffect, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Users, 
  MapPin, 
  Calendar,
  Clock,
  DollarSign,
  Dumbbell,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAcademies } from './hooks/useAcademies';
import { useExercises } from './hooks/useExercises';
import { useClients } from '../clients/hooks/useClients';
import { useAppointments } from '../calendar/hooks/useAppointments';
import { toast } from 'sonner';
import { sportOptions } from '@/app/shared/types/sports';

export const AcademyDetailPage: React.FC = () => {
  const { academyId } = useParams<{ academyId: string }>();
  const history = useHistory();
  const { academies, loading: academiesLoading, deleteAcademy } = useAcademies();
  const { exercises } = useExercises();
  const { clients } = useClients();
  const { appointments } = useAppointments();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const academy = academies.find(a => a.id === academyId);
  const sport = academy ? sportOptions.find(s => s.value === academy.sportType) : null;

  // Get academy appointments
  const academyAppointments = useMemo(() => {
    if (!academy) return [];
    return appointments.filter(apt => apt.academyId === academy.id);
  }, [appointments, academy]);

  // Get upcoming appointments
  const upcomingAppointments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return academyAppointments
      .filter(apt => apt.date >= today && apt.status === 'scheduled')
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
      .slice(0, 10);
  }, [academyAppointments]);

  // Get assigned exercises
  const assignedExercises = useMemo(() => {
    if (!academy?.exerciseIds) return [];
    return exercises.filter(ex => academy.exerciseIds.includes(ex.id));
  }, [academy, exercises]);

  const handleGoBack = () => {
    history.push('/academies');
  };

  const handleEdit = () => {
    toast.info('Función de edición en desarrollo');
    // TODO: Implementar EditAcademyModal
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!academy) return;

    setIsDeleting(true);
    try {
      const futureCount = upcomingAppointments.length;
      
      // Delete academy (this will also delete future appointments)
      await deleteAcademy(academy.id, true);
      
      toast.success('Academia eliminada', {
        description: `Se eliminaron ${futureCount} clases futuras`,
      });
      
      history.push('/academies');
    } catch (error) {
      console.error('Error deleting academy:', error);
      toast.error('Error al eliminar la academia');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayOfWeek];
  };

  if (academiesLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500">Cargando academia...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!academy) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertTriangle className="h-16 w-16 text-orange-500" />
          <h2 className="text-2xl font-bold text-gray-900">Academia no encontrada</h2>
          <p className="text-gray-500">La academia que buscas no existe o fue eliminada</p>
          <Button onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Academias
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${sport?.color || 'bg-gray-500'}`}>
                  <span className="text-2xl">{sport?.icon || '🏫'}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{academy.name}</h1>
                  <p className="text-gray-500">{sport?.label || academy.sportType}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDelete}
              className="text-red-600 hover:bg-red-50 border-red-200"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>

        {/* Info General */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Canchas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span className="text-2xl font-bold">{academy.numberOfCourts}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Precio Cancha</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <span className="text-2xl font-bold">${academy.courtPrice.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Precio por Alumno</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-400" />
                <span className="text-2xl font-bold">${academy.pricePerStudent.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Canchas y Coaches */}
        <Card>
          <CardHeader>
            <CardTitle>Canchas y Coaches</CardTitle>
            <CardDescription>Asignaciones de coaches y alumnos por cancha</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {academy.courts.map((court, index) => {
                const courtClients = clients.filter(c => court.clientIds.includes(c.id));
                return (
                  <div key={court.id || index} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-gray-600" />
                        <h3 className="font-semibold text-gray-900">Cancha #{court.courtNumber}</h3>
                      </div>
                      <span className="text-sm text-gray-600">
                        {court.clientIds.length} alumnos
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        <Label className="text-sm text-gray-600">Coach:</Label>
                        <span className="text-sm font-medium">{court.assignedCoachName}</span>
                      </div>
                      
                      <div>
                        <Label className="text-sm text-gray-600 mb-2 block">Alumnos:</Label>
                        <div className="flex flex-wrap gap-2">
                          {courtClients.map(client => (
                            <span 
                              key={client.id}
                              className="px-2 py-1 bg-white rounded border text-sm"
                            >
                              {client.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Horarios */}
        <Card>
          <CardHeader>
            <CardTitle>Horarios</CardTitle>
            <CardDescription>Días y horas de las clases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {academy.schedules.map((schedule, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{getDayName(schedule.dayOfWeek)}</p>
                      <p className="text-sm text-gray-600">
                        {schedule.startDate} {schedule.endDate && `- ${schedule.endDate}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">
                      {schedule.startTime} - {schedule.endTime}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({schedule.duration} min)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ejercicios Asignados */}
        <Card>
          <CardHeader>
            <CardTitle>Ejercicios Asignados</CardTitle>
            <CardDescription>{assignedExercises.length} ejercicios configurados</CardDescription>
          </CardHeader>
          <CardContent>
            {assignedExercises.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Dumbbell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No hay ejercicios asignados</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {assignedExercises.map(exercise => (
                  <div key={exercise.id} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{exercise.name}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        exercise.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                        exercise.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {exercise.difficulty === 'beginner' ? 'Principiante' :
                         exercise.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{exercise.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {exercise.duration && <span>⏱️ {exercise.duration} min</span>}
                      {exercise.category && (
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                          {exercise.category === 'warm-up' && 'Calentamiento'}
                          {exercise.category === 'drill' && 'Ejercicio'}
                          {exercise.category === 'technique' && 'Técnica'}
                          {exercise.category === 'game' && 'Juego'}
                          {exercise.category === 'cool-down' && 'Enfriamiento'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próximas Clases */}
        <Card>
          <CardHeader>
            <CardTitle>Próximas Clases Programadas</CardTitle>
            <CardDescription>{upcomingAppointments.length} clases pendientes</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No hay clases programadas</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingAppointments.map(apt => (
                  <div 
                    key={apt.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => history.push('/calendar')}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {new Date(apt.date).toLocaleDateString('es-ES', { 
                            weekday: 'short', 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </p>
                        <p className="text-sm text-gray-600">{apt.clientName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">{apt.startTime}</span>
                      {apt.courtId && (
                        <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                          Cancha #{apt.courtId}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(false)} />
          
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Eliminar Academia</h2>
              <p className="text-sm text-gray-600 mt-1">
                Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-gray-900 font-medium">
                    ¿Estás seguro de que deseas eliminar esta academia?
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Se eliminarán {upcomingAppointments.length} clases futuras programadas.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-medium text-blue-900">Se mantendrá:</p>
                </div>
                <ul className="text-sm text-blue-700 space-y-1 ml-6">
                  <li>• Clases pasadas (historial)</li>
                  <li>• Información de clientes</li>
                  <li>• Ejercicios creados</li>
                </ul>
              </div>
            </div>

            <div className="p-6 border-t flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar Academia'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
