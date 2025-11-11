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
import { signInWithEmail } from '@/lib/auth';
import { getAuthErrorMessage } from './types';

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es requerido')
    .email('Correo electrónico inválido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const history = useHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      await signInWithEmail(data.email, data.password);

      toast({
        variant: 'success',
        title: '¡Bienvenido!',
        message: 'Has iniciado sesión correctamente',
      });

      // Redirect to home/dashboard
      history.push('/home');
    } catch (error: any) {
      console.error('Login error:', error);
      
      const message = error?.code 
        ? getAuthErrorMessage(error.code)
        : 'Error al iniciar sesión. Intenta nuevamente';

      toast({
        variant: 'error',
        title: 'Error al iniciar sesión',
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
                Iniciar sesión
              </CardTitle>
              <CardDescription className="text-center">
                Ingresa tus credenciales para acceder
              </CardDescription>
            </CardHeader>

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

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Contraseña</Label>
                    <a
                      href="/reset-password"
                      className="text-sm text-primary hover:underline"
                      onClick={(e) => {
                        e.preventDefault();
                        history.push('/reset-password');
                      }}
                    >
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register('password')}
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    {...register('rememberMe')}
                    disabled={isLoading}
                  />
                  <Label htmlFor="rememberMe" className="text-sm font-normal">
                    Recordar mi sesión
                  </Label>
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
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar sesión'
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  ¿No tienes cuenta?{' '}
                  <a
                    href="/register"
                    className="text-primary font-medium hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      history.push('/register');
                    }}
                  >
                    Regístrate gratis
                  </a>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </IonContent>
    </IonPage>
  );
};
