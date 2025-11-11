import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { resetPassword } from '@/lib/auth';
import { getAuthErrorMessage } from './types';

// Validation schema
const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es requerido')
    .email('Correo electrónico inválido'),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const history = useHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);

    try {
      await resetPassword(data.email);

      setEmailSent(true);

      toast({
        variant: 'success',
        title: 'Correo enviado',
        message: 'Revisa tu bandeja de entrada para restablecer tu contraseña',
      });
    } catch (error: any) {
      console.error('Reset password error:', error);
      
      const message = error?.code 
        ? getAuthErrorMessage(error.code)
        : 'Error al enviar el correo. Intenta nuevamente';

      toast({
        variant: 'error',
        title: 'Error',
        message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div className="flex min-h-full items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Restablecer contraseña
              </CardTitle>
              <CardDescription className="text-center">
                {emailSent
                  ? 'Te hemos enviado un correo con instrucciones'
                  : 'Ingresa tu correo para recibir instrucciones'}
              </CardDescription>
            </CardHeader>

            {emailSent ? (
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-success/10 p-4 text-center">
                  <p className="text-sm text-success-foreground">
                    Hemos enviado un correo a <strong>{getValues('email')}</strong> con
                    instrucciones para restablecer tu contraseña.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Si no ves el correo, revisa tu carpeta de spam.
                  </p>
                </div>
              </CardContent>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      autoComplete="email"
                      {...register('email')}
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <IonSpinner name="crescent" className="mr-2 h-4 w-4" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar correo de recuperación'
                    )}
                  </Button>
                </CardFooter>
              </form>
            )}

            <CardFooter className="flex flex-col space-y-2">
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => history.push('/login')}
              >
                Volver al inicio de sesión
              </Button>
            </CardFooter>
          </Card>
        </div>
      </IonContent>
    </IonPage>
  );
};
