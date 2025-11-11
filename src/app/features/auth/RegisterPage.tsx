import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { registerWithEmail } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { getAuthErrorMessage } from './types';

// Validation schema
const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es requerido')
    .email('Correo electrónico inválido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(50, 'La contraseña es demasiado larga'),
  confirmPassword: z.string(),
  displayName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre es demasiado largo'),
  businessName: z
    .string()
    .min(2, 'El nombre del negocio debe tener al menos 2 caracteres')
    .max(100, 'El nombre del negocio es demasiado largo'),
  businessType: z.enum(['gym', 'clinic', 'personal_training', 'other']).optional(),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, 'Debes aceptar los términos y condiciones'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const history = useHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      businessType: 'other',
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      // Register user with Firebase Auth
      const userCredential = await registerWithEmail(
        data.email,
        data.password,
        data.displayName
      );

      // Store tenant data in temporary Firestore collection
      // The Cloud Function will read this and create the tenant
      await setDoc(doc(db, '_pendingTenants', userCredential.user.uid), {
        businessName: data.businessName,
        businessType: data.businessType || 'other',
      });

      toast({
        variant: 'success',
        title: '¡Registro exitoso!',
        message: 'Tu cuenta ha sido creada correctamente',
      });

      // Redirect to home (AuthContext will load user data)
      history.push('/home');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      const message = error?.code 
        ? getAuthErrorMessage(error.code)
        : 'Error al crear la cuenta. Intenta nuevamente';

      toast({
        variant: 'error',
        title: 'Error en el registro',
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
                Crear cuenta
              </CardTitle>
              <CardDescription className="text-center">
                Regístrate para comenzar a gestionar tu negocio
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                {/* Display Name */}
                <div className="space-y-2">
                  <Label htmlFor="displayName">
                    Nombre completo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="displayName"
                    placeholder="Juan Pérez"
                    {...register('displayName')}
                    disabled={isLoading}
                  />
                  {errors.displayName && (
                    <p className="text-sm text-red-500">{errors.displayName.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Correo electrónico <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    {...register('email')}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                {/* Business Name */}
                <div className="space-y-2">
                  <Label htmlFor="businessName">
                    Nombre del negocio <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="businessName"
                    placeholder="Mi Gimnasio"
                    {...register('businessName')}
                    disabled={isLoading}
                  />
                  {errors.businessName && (
                    <p className="text-sm text-red-500">{errors.businessName.message}</p>
                  )}
                </div>

                {/* Business Type */}
                <div className="space-y-2">
                  <Label htmlFor="businessType">Tipo de negocio</Label>
                  <select
                    id="businessType"
                    {...register('businessType')}
                    disabled={isLoading}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="gym">Gimnasio</option>
                    <option value="clinic">Clínica/Kinesiología</option>
                    <option value="personal_training">Entrenamiento Personal</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Contraseña <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Confirmar contraseña <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    {...register('acceptTerms')}
                    disabled={isLoading}
                    className="mt-1"
                  />
                  <Label htmlFor="acceptTerms" className="text-sm font-normal">
                    Acepto los{' '}
                    <a href="/terms" className="text-primary underline">
                      términos y condiciones
                    </a>{' '}
                    y la{' '}
                    <a href="/privacy" className="text-primary underline">
                      política de privacidad
                    </a>
                  </Label>
                </div>
                {errors.acceptTerms && (
                  <p className="text-sm text-red-500">{errors.acceptTerms.message}</p>
                )}
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
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear cuenta'
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  ¿Ya tienes cuenta?{' '}
                  <a
                    href="/login"
                    className="text-primary font-medium hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      history.push('/login');
                    }}
                  >
                    Inicia sesión
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
