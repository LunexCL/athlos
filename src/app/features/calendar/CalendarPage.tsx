import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus, Users } from 'lucide-react';
import { NewAppointmentModal } from './NewAppointmentModal';
import { AppointmentDetailModal } from './AppointmentDetailModal';
import { SetupRequirementBanner } from './SetupRequirementBanner';
import { useAppointments, Appointment } from './hooks/useAppointments';
import { useClients } from '@/app/features/clients/hooks/useClients';
import { usePaymentConfig } from '@/app/features/payments/hooks/usePaymentConfig';
import { sportOptions } from '@/app/shared/types/sports';

export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const { appointments, loading } = useAppointments();
  const { clients } = useClients();
  const { config } = usePaymentConfig();

  // Check if setup is complete
  const hasClients = clients.length > 0;
  const hasPaymentConfig = !!config && !!config.pricing && Object.keys(config.pricing).length > 0;
  const setupComplete = hasClients && hasPaymentConfig;

  console.log('🗓️ CalendarPage - Appointments:', appointments.length, 'Loading:', loading);

  // Obtener el appointment actualizado en tiempo real
  const selectedAppointment = useMemo(() => {
    if (!selectedAppointmentId) return null;
    return appointments.find(apt => apt.id === selectedAppointmentId) || null;
  }, [selectedAppointmentId, appointments]);

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const todayAppointments = appointments.filter(apt => 
      apt.date === today && apt.status === 'scheduled'
    );
    
    const weekAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= startOfWeek && aptDate <= endOfWeek && apt.status === 'scheduled';
    });

    const pendingAppointments = appointments.filter(apt => 
      apt.status === 'scheduled' && new Date(apt.date) >= new Date()
    );

    return {
      today: todayAppointments.length,
      thisWeek: weekAppointments.length,
      pending: pendingAppointments.length,
    };
  }, [appointments, currentDate]);

  const handleOpenModal = () => {
    if (!setupComplete) {
      return; // Banner will show the required actions
    }
    console.log('Abriendo modal de nueva clase...');
    setShowNewAppointmentModal(true);
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get week days
  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const weekDays = getWeekDays();
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: { [key: string]: typeof appointments } = {};
    appointments.forEach(apt => {
      if (!grouped[apt.date]) {
        grouped[apt.date] = [];
      }
      grouped[apt.date].push(apt);
    });
    // Sort appointments by start time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return grouped;
  }, [appointments]);

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  const getSportColor = (sportType: string) => {
    const sport = sportOptions.find(s => s.value === sportType);
    return sport?.color || 'bg-gray-500';
  };

  const getSportEmoji = (sportType: string) => {
    const sport = sportOptions.find(s => s.value === sportType);
    return sport?.icon || '📅';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
            <p className="text-gray-500 mt-1">Gestiona tus clases y disponibilidad</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={goToToday}>
              Hoy
            </Button>
            <Button onClick={handleOpenModal} disabled={!setupComplete}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Clase
            </Button>
          </div>
        </div>

        {/* Setup Requirement Banner */}
        <SetupRequirementBanner />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Clases Hoy</p>
                  <p className="text-2xl font-bold">{stats.today}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50">
                  <CalendarIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Esta Semana</p>
                  <p className="text-2xl font-bold">{stats.thisWeek}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pendientes</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-50">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="capitalize">{formatMonth(currentDate)}</CardTitle>
                <CardDescription>Vista semanal de tu agenda</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={goToNextWeek}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Cargando calendario...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-7 gap-2">
                  {/* Day Headers */}
                  {weekDays.map((day, index) => {
                    const isToday = day.toDateString() === new Date().toDateString();
                    const dateStr = day.toISOString().split('T')[0];
                    const dayAppointments = appointmentsByDate[dateStr] || [];
                    
                    return (
                      <div key={index} className="min-h-[200px]">
                        <div
                          className={`text-center p-3 rounded-lg mb-2 ${
                            isToday ? 'bg-primary text-primary-foreground' : 'bg-gray-50'
                          }`}
                        >
                          <p className="text-xs font-medium mb-1">{dayNames[index]}</p>
                          <p className="text-xl font-bold">{day.getDate()}</p>
                        </div>
                        
                        {/* Appointments for this day */}
                        <div className="space-y-2">
                          {dayAppointments.map((apt) => (
                            <div
                              key={apt.id}
                              onClick={() => setSelectedAppointmentId(apt.id)}
                              className={`p-2 rounded-lg border-l-4 ${getSportColor(apt.sportType)} bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                            >
                              <div className="flex items-center gap-1 mb-1">
                                <span className="text-sm">{getSportEmoji(apt.sportType)}</span>
                                <span className="text-xs font-medium text-gray-600">
                                  {apt.startTime}
                                </span>
                                {apt.academyId && (
                                  <Users className="w-3 h-3 text-purple-600 ml-auto" />
                                )}
                              </div>
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {apt.clientName}
                              </p>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">
                                  {apt.duration} min
                                </p>
                                {apt.academyId && (
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">
                                    Academia
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Empty State */}
                {appointments.length === 0 && (
                  <div className="text-center py-12 mt-6 border-t">
                    <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No hay clases programadas
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Comienza creando tu primera clase
                    </p>
                    <Button onClick={handleOpenModal}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Clase
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Configura tu disponibilidad y horarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto py-4 justify-start">
                <div className="text-left">
                  <p className="font-medium">Configurar Disponibilidad</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Define tus horarios de trabajo
                  </p>
                </div>
              </Button>
              <Button variant="outline" className="h-auto py-4 justify-start">
                <div className="text-left">
                  <p className="font-medium">Ver Historial</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Revisa clases anteriores
                  </p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Appointment Modal */}
      <NewAppointmentModal
        open={showNewAppointmentModal}
        onOpenChange={setShowNewAppointmentModal}
      />

      {/* Appointment Detail Modal */}
      <AppointmentDetailModal
        open={selectedAppointment !== null}
        onOpenChange={(open) => !open && setSelectedAppointmentId(null)}
        appointment={selectedAppointment}
      />
    </DashboardLayout>
  );
};
