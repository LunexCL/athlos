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
import { registerWithEmail, signInWithGoogle } from '@/lib/auth';
import { createTenantAndUser } from '@/lib/tenant';
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
      console.log('📝 Starting registration process...');
      
      // Register user with Firebase Auth
      console.log('1️⃣ Creating user in Firebase Auth...');
      const userCredential = await registerWithEmail(
        data.email,
        data.password,
        data.displayName
      );
      console.log('✅ User created in Auth:', userCredential.user.uid);

      // Create tenant and user documents directly in Firestore
      console.log('2️⃣ Creating tenant and user documents in Firestore...');
      const result = await createTenantAndUser({
        userId: userCredential.user.uid,
        email: data.email,
        displayName: data.displayName,
        businessName: data.businessName,
        businessType: data.businessType,
      });
      console.log('✅ Firestore documents created:', result);

      toast({
        variant: 'success',
        title: '¡Registro exitoso!',
        message: 'Tu cuenta ha sido creada correctamente',
      });

      // Redirect to home (AuthContext will load user data)
      console.log('3️⃣ Redirecting to home...');
      history.push('/home');
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      console.error('Error details:', {
        code: error?.code,
        message: error?.message,
        stack: error?.stack,
      });
      
      const message = error?.code 
        ? getAuthErrorMessage(error.code)
        : error?.message || 'Error al crear la cuenta. Intenta nuevamente';

      toast({
        variant: 'error',
        title: 'Error en el registro',
        message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      console.log('🔐 Starting Google sign in...');
      const userCredential = await signInWithGoogle();
      const user = userCredential.user;
      console.log('✅ Google user authenticated:', user.uid);

      // Check if user already has tenant (returning user)
      console.log('2️⃣ Creating/checking tenant and user documents...');
      const result = await createTenantAndUser({
        userId: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Usuario',
        businessName: user.displayName || 'Mi Negocio',
        businessType: 'other',
      });
      console.log('✅ Firestore setup complete:', result);

      toast({
        variant: 'success',
        title: '¡Bienvenido!',
        message: 'Has iniciado sesión correctamente',
      });

      console.log('3️⃣ Redirecting to home...');
      history.push('/home');
    } catch (error: any) {
      console.error('❌ Google sign in error:', error);
      console.error('Error details:', {
        code: error?.code,
        message: error?.message,
        stack: error?.stack,
      });
      
      const message = error?.code 
        ? getAuthErrorMessage(error.code)
        : error?.message || 'Error al iniciar sesión con Google';

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

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      O continúa con
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continuar con Google
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
