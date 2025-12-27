import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAcademies } from './hooks/useAcademies';
import { sportOptions } from '@/app/shared/types/sports';
import { GraduationCap, Plus, Users, MapPin, ChevronRight } from 'lucide-react';
import { NewAcademyModal } from './NewAcademyModal';

export const AcademiesPage: React.FC = () => {
  const history = useHistory();
  const { academies, loading } = useAcademies();
  const [showNewModal, setShowNewModal] = useState(false);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando academias...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto" data-tour="academies-section">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Academias/Grupos</h1>
            <p className="text-gray-600 mt-2">
              Gestiona tus academias con múltiples canchas y coaches
            </p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowNewModal(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Nueva Academia
          </Button>
        </div>

        {academies.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tienes academias creadas
                </h3>
                <p className="text-gray-600 mb-4">
                  Comienza creando tu primera academia para gestionar grupos de alumnos
                </p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowNewModal(true)}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Crear Primera Academia
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {academies.map((academy) => {
              const sport = sportOptions.find(s => s.value === academy.sportType);
              
              return (
                <Card 
                  key={academy.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => history.push(`/academies/${academy.id}`)}
                >
                  <CardHeader className={`${sport?.color || 'bg-gray-500'} text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{sport?.icon || '🏃'}</span>
                        <div>
                          <CardTitle className="text-white">{academy.name}</CardTitle>
                          <CardDescription className="text-white/90">
                            {sport?.label || academy.sportType}
                          </CardDescription>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-white/80" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{academy.numberOfCourts} {academy.numberOfCourts === 1 ? 'cancha' : 'canchas'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>
                          {academy.courts.reduce((acc, court) => acc + court.clientIds.length, 0)} alumnos
                        </span>
                      </div>
                      {academy.headCoachName && (
                        <div className="text-xs text-gray-500">
                          Head Coach: {academy.headCoachName}
                        </div>
                      )}
                      <div className="pt-2 border-t">
                        <div className="text-sm">
                          <span className="text-gray-600">Cancha: </span>
                          <span className="font-semibold">${academy.courtPrice.toLocaleString('es-CL')}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Por alumno: </span>
                          <span className="font-semibold">${academy.pricePerStudent.toLocaleString('es-CL')}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* New Academy Modal */}
      <NewAcademyModal 
        open={showNewModal}
        onOpenChange={setShowNewModal}
      />
    </DashboardLayout>
  );
};
