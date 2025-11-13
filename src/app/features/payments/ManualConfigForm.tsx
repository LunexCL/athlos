import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePaymentConfig } from './hooks/usePaymentConfig';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, CreditCard, User, Mail } from 'lucide-react';

const manualConfigSchema = z.object({
  bank: z.string().min(1, 'Nombre del banco requerido'),
  accountType: z.enum(['Cuenta Corriente', 'Cuenta Vista', 'Cuenta de Ahorro']),
  accountNumber: z.string().min(4, 'Número de cuenta requerido'),
  rut: z.string().min(8, 'RUT requerido'),
  accountName: z.string().min(2, 'Nombre del titular requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
});

type ManualConfigFormData = z.infer<typeof manualConfigSchema>;

interface ManualConfigFormProps {
  onSaved: () => void;
}

export const ManualConfigForm: React.FC<ManualConfigFormProps> = ({ onSaved }) => {
  const { config, saveConfig } = usePaymentConfig();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<ManualConfigFormData>({
    resolver: zodResolver(manualConfigSchema),
    defaultValues: {
      bank: '',
      accountType: 'Cuenta Corriente',
      accountNumber: '',
      rut: '',
      accountName: '',
      email: '',
    },
  });

  // Update form values when config changes (for editing)
  useEffect(() => {
    if (config?.bankInfo) {
      reset({
        bank: config.bankInfo.bank || '',
        accountType: config.bankInfo.accountType || 'Cuenta Corriente',
        accountNumber: config.bankInfo.accountNumber || '',
        rut: config.bankInfo.rut || '',
        accountName: config.bankInfo.name || '',
        email: config.bankInfo.email || '',
      });
    }
  }, [config, reset]);

  const accountType = watch('accountType');

  const onSubmit = async (data: ManualConfigFormData) => {
    const success = await saveConfig({
      provider: 'manual',
      bank: data.bank,
      accountType: data.accountType,
      accountNumber: data.accountNumber,
      rut: data.rut,
      accountName: data.accountName,
      email: data.email || undefined,
    });

    if (success) {
      onSaved();
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="bank" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Banco *
            </Label>
            <Input
              id="bank"
              {...register('bank')}
              placeholder="Ej: Banco de Chile"
              className="mt-1"
            />
            {errors.bank && (
              <p className="text-sm text-red-600 mt-1">{errors.bank.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="accountType" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Tipo de Cuenta *
            </Label>
            <Select
              value={accountType}
              onValueChange={(value) =>
                setValue('accountType', value as 'Cuenta Corriente' | 'Cuenta Vista' | 'Cuenta de Ahorro')
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cuenta Corriente">Cuenta Corriente</SelectItem>
                <SelectItem value="Cuenta Vista">Cuenta Vista</SelectItem>
                <SelectItem value="Cuenta de Ahorro">Cuenta de Ahorro</SelectItem>
              </SelectContent>
            </Select>
            {errors.accountType && (
              <p className="text-sm text-red-600 mt-1">{errors.accountType.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="accountNumber">Número de Cuenta *</Label>
            <Input
              id="accountNumber"
              {...register('accountNumber')}
              placeholder="Ej: 12345678"
              className="mt-1"
            />
            {errors.accountNumber && (
              <p className="text-sm text-red-600 mt-1">{errors.accountNumber.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="rut">RUT del Titular *</Label>
            <Input
              id="rut"
              {...register('rut')}
              placeholder="Ej: 12.345.678-9"
              className="mt-1"
            />
            {errors.rut && (
              <p className="text-sm text-red-600 mt-1">{errors.rut.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="accountName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nombre del Titular *
            </Label>
            <Input
              id="accountName"
              {...register('accountName')}
              placeholder="Ej: Juan Pérez"
              className="mt-1"
            />
            {errors.accountName && (
              <p className="text-sm text-red-600 mt-1">{errors.accountName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email de Confirmación (Opcional)
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="Ej: profesor@athlos.cl"
              className="mt-1"
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Los clientes verán este email al realizar transferencias
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>💡 Cómo funciona:</strong> Tus clientes verán estos datos bancarios
            cuando vayan a pagar. Deberán realizar la transferencia desde su banco y
            luego subir el comprobante para que tú lo apruebes.
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
