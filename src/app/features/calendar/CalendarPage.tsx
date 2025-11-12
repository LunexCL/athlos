import { useState } from 'react';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react';
import { NewAppointmentModal } from './NewAppointmentModal';

export const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);

  // Mock data - will be replaced with real data
  const appointments = [];

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

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
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
            <Button onClick={() => setShowNewAppointmentModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Clase
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Clases Hoy</p>
                  <p className="text-2xl font-bold">0</p>
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
                  <p className="text-2xl font-bold">0</p>
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
                  <p className="text-2xl font-bold">0</p>
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
            <div className="grid grid-cols-7 gap-2">
              {/* Day Headers */}
              {weekDays.map((day, index) => {
                const isToday = day.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={index}
                    className={`text-center p-4 rounded-lg ${
                      isToday ? 'bg-primary text-primary-foreground' : 'bg-gray-50'
                    }`}
                  >
                    <p className="text-xs font-medium mb-1">{dayNames[index]}</p>
                    <p className="text-2xl font-bold">{day.getDate()}</p>
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
                <Button onClick={() => setShowNewAppointmentModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Clase
                </Button>
              </div>
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
    </DashboardLayout>
  );
};
