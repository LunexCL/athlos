import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { sportOptions, type SportType } from '@/app/shared/types/sports';
import { useAuth } from '@/app/features/auth/AuthContext';
import { updateTenant } from '@/lib/tenant';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

export const SelectSportPage: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState<SportType | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const history = useHistory();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!selectedSport) {
      toast({
        variant: 'error',
        title: 'Selecciona un deporte',
        message: 'Por favor selecciona tu actividad principal',
      });
      return;
    }

    if (!user?.tenantId) {
      toast({
        variant: 'error',
        title: 'Error',
        message: 'No se pudo identificar tu cuenta',
      });
      return;
    }

    setIsLoading(true);

    try {
      await updateTenant(user.tenantId, {
        businessType: selectedSport,
      });

      toast({
        variant: 'success',
        title: '¡Listo!',
        message: 'Tu deporte ha sido configurado',
      });

      history.push('/home');
    } catch (error: any) {
      console.error('Error updating sport:', error);
      toast({
        variant: 'error',
        title: 'Error',
        message: 'No se pudo guardar tu selección. Intenta nuevamente',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    history.push('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8 flex items-center justify-center">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            Selecciona tu actividad principal
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Esto nos ayudará a personalizar tu experiencia. Podrás trabajar con múltiples deportes después.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {sportOptions.map((sport) => (
              <button
                key={sport.value}
                onClick={() => setSelectedSport(sport.value as SportType)}
                disabled={isLoading}
                className={`
                  relative p-4 rounded-lg border-2 transition-all duration-200
                  hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    selectedSport === sport.value
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-4xl">{sport.icon}</span>
                  <span className="text-sm font-medium text-center">
                    {sport.label}
                  </span>
                </div>
                
                <div className="absolute top-2 right-2">
                  {selectedSport === sport.value ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={isLoading}
              className="flex-1"
            >
              Omitir por ahora
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !selectedSport}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Continuar'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
