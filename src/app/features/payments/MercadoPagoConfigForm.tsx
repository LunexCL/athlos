import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePaymentConfig } from './hooks/usePaymentConfig';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, Key, Eye, EyeOff } from 'lucide-react';

const mercadoPagoConfigSchema = z.object({
  accessToken: z.string().min(20, 'Access Token requerido (mín. 20 caracteres)'),
  publicKey: z.string().min(20, 'Public Key requerida (mín. 20 caracteres)'),
  isTestMode: z.boolean().optional(),
});

type MercadoPagoConfigFormData = z.infer<typeof mercadoPagoConfigSchema>;

interface MercadoPagoConfigFormProps {
  onSaved: () => void;
}

export const MercadoPagoConfigForm: React.FC<MercadoPagoConfigFormProps> = ({ onSaved }) => {
  const { config, saveConfig } = usePaymentConfig();
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [showPublicKey, setShowPublicKey] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<MercadoPagoConfigFormData>({
    resolver: zodResolver(mercadoPagoConfigSchema),
    defaultValues: {
      accessToken: '',
      publicKey: '',
      isTestMode: false,
    },
  });

  // Update form values when config changes (for editing)
  useEffect(() => {
    if (config?.mercadoPago) {
      reset({
        accessToken: config.mercadoPago.accessToken || '',
        publicKey: config.mercadoPago.publicKey || '',
        isTestMode: config.mercadoPago.isTestMode || false,
      });
    }
  }, [config, reset]);

  const isTestMode = watch('isTestMode');

  const onSubmit = async (data: MercadoPagoConfigFormData) => {
    const success = await saveConfig({
      provider: 'mercadopago',
      accessToken: data.accessToken,
      publicKey: data.publicKey,
      isTestMode: data.isTestMode || false,
    });

    if (success) {
      onSaved();
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Help Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">
            ¿Cómo obtener mis credenciales de Mercado Pago?
          </h4>
          <ol className="text-sm text-yellow-900 space-y-1 list-decimal list-inside">
            <li>Ingresa a tu cuenta de Mercado Pago</li>
            <li>Ve a "Tu negocio" → "Configuración" → "Credenciales"</li>
            <li>Copia tu "Access Token" y "Public Key"</li>
            <li>Pégalos en los campos de abajo</li>
          </ol>
          <a
            href="https://www.mercadopago.cl/developers/panel/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-yellow-900 hover:text-yellow-700"
          >
            Ir a Credenciales de Mercado Pago
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Test Mode Toggle */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="isTestMode"
            {...register('isTestMode')}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <Label htmlFor="isTestMode" className="cursor-pointer">
            <span className="font-medium">Modo de prueba (Sandbox)</span>
            <p className="text-sm text-gray-600">
              Usa credenciales de prueba para testear sin cobros reales
            </p>
          </Label>
        </div>

        <div className="space-y-4">
          {/* Access Token */}
          <div>
            <Label htmlFor="accessToken" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Access Token *
              {isTestMode && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                  TEST
                </span>
              )}
            </Label>
            <div className="relative mt-1">
              <Input
                id="accessToken"
                type={showAccessToken ? 'text' : 'password'}
                {...register('accessToken')}
                placeholder={isTestMode ? "TEST-1234567890..." : "APP_USR-1234567890..."}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowAccessToken(!showAccessToken)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showAccessToken ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.accessToken && (
              <p className="text-sm text-red-600 mt-1">{errors.accessToken.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {isTestMode
                ? 'Debe empezar con TEST-'
                : 'Debe empezar con APP_USR-'}
            </p>
          </div>

          {/* Public Key */}
          <div>
            <Label htmlFor="publicKey" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Public Key *
              {isTestMode && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                  TEST
                </span>
              )}
            </Label>
            <div className="relative mt-1">
              <Input
                id="publicKey"
                type={showPublicKey ? 'text' : 'password'}
                {...register('publicKey')}
                placeholder={isTestMode ? "TEST-1234567890..." : "APP_USR-1234567890..."}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPublicKey(!showPublicKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPublicKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.publicKey && (
              <p className="text-sm text-red-600 mt-1">{errors.publicKey.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {isTestMode
                ? 'Debe empezar con TEST-'
                : 'Debe empezar con APP_USR-'}
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>🔒 Seguridad:</strong> Tus credenciales se guardarán de forma segura
            y encriptada. Nunca se mostrarán a los clientes.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-900">
            <strong>💡 Cómo funciona:</strong> Una vez configurado, tus clientes podrán
            pagar directamente con tarjeta, Mercado Pago Wallet o efectivo. Los pagos se
            confirmarán automáticamente sin que tengas que hacer nada.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
