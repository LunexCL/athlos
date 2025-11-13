import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '../auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { sportOptions, SportType } from '@/app/shared/types/sports';
import { CheckCircle2, Circle, ArrowRight, Dumbbell } from 'lucide-react';
import { toast } from 'sonner';

export const OnboardingPage: React.FC = () => {
  const [selectedSports, setSelectedSports] = useState<SportType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { tenant, user } = useAuth();
  const history = useHistory();

  // Force enable scroll on mount
  useEffect(() => {
    // Force body to allow scroll
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    return () => {
      // Cleanup
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const toggleSport = (sport: SportType) => {
    setSelectedSports((prev) => {
      const newSelection = prev.includes(sport)
        ? prev.filter((s) => s !== sport)
        : [...prev, sport];
      
      console.log('🎾 Sport toggled:', sport);
      console.log('📋 Current selection:', newSelection);
      
      return newSelection;
    });
  };

  const handleContinue = async () => {
    console.log('🎯 handleContinue called');
    console.log('📊 Selected sports:', selectedSports);
    console.log('🏢 Tenant from context:', tenant);
    console.log('👤 User:', user);
    
    if (selectedSports.length === 0) {
      toast.error('Selecciona al menos un deporte', {
        description: 'Necesitas elegir al menos una actividad para continuar',
      });
      return;
    }

    if (!user?.uid) {
      toast.error('Error', { description: 'No se encontró información del usuario' });
      return;
    }

    setIsLoading(true);
    console.log('💾 Saving to Firestore...');
    
    try {
      // Primero, obtener el tenantId del documento del usuario
      let tenantId = tenant?.id;
      
      if (!tenantId) {
        console.log('🔍 Getting tenantId from user document...');
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          tenantId = userDoc.data().tenantId;
          console.log('✅ Found tenantId in user doc:', tenantId);
        }
      }
      
      console.log('🔑 TenantId to use:', tenantId);
      
      if (!tenantId) {
        console.error('❌ No tenant ID found in context or user document');
        toast.error('Error', { 
          description: 'No se encontró información del tenant. Intenta cerrar sesión y volver a entrar.',
        });
        setIsLoading(false);
        return;
      }

      console.log('📝 Updating tenant:', tenantId);
      const tenantRef = doc(db, 'tenants', tenantId);
      await updateDoc(tenantRef, {
        'settings.sports': selectedSports,
        'settings.onboardingCompleted': true,
        updatedAt: new Date(),
      });

      console.log('✅ Saved successfully!');
      
      toast.success('¡Configuración completada!', {
        description: 'Redirigiendo al inicio...',
      });

      // Force complete page reload to refresh auth context
      setTimeout(() => {
        window.location.assign('/home');
      }, 1500);
    } catch (error: any) {
      console.error('❌ Error updating tenant:', error);
      console.error('❌ Error code:', error?.code);
      console.error('❌ Error message:', error?.message);
      toast.error('Error', {
        description: 'No se pudo guardar la configuración. Intenta nuevamente',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto px-4 py-12">
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mb-4">
              <Dumbbell className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              ¡Bienvenido a Athlos! 👋
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Para comenzar, selecciona las actividades o deportes que ofreces a tus clientes
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pb-8">
            {/* Sports Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {sportOptions.map((sport) => {
                const isSelected = selectedSports.includes(sport.value);
                return (
                  <button
                    key={sport.value}
                    onClick={() => toggleSport(sport.value)}
                    disabled={isLoading}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all duration-200
                      ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 shadow-md scale-105'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    {/* Check Icon */}
                    <div className="absolute top-2 right-2">
                      {isSelected ? (
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-300" />
                      )}
                    </div>

                    {/* Sport Info */}
                    <div className="text-center">
                      <div className="text-3xl mb-2">{sport.icon}</div>
                      <p
                        className={`text-sm font-medium ${
                          isSelected ? 'text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        {sport.label}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Count */}
            {selectedSports.length > 0 && (
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  {selectedSports.length === 1
                    ? '1 actividad seleccionada'
                    : `${selectedSports.length} actividades seleccionadas`}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={handleContinue}
                disabled={isLoading || selectedSports.length === 0}
                size="lg"
                className="min-w-[200px]"
              >
                {isLoading ? 'Guardando...' : 'Continuar'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-500 mt-6 mb-8">
          No te preocupes, podrás modificar esto más adelante en la configuración
        </p>
      </div>
    </div>
  );
};
