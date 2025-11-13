import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { usePaymentConfig } from './hooks/usePaymentConfig';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  FileText, 
  CheckCircle, 
  Settings,
  DollarSign,
} from 'lucide-react';
import type { PaymentProvider } from './types';
import { ManualConfigForm } from './ManualConfigForm';
import { MercadoPagoConfigForm } from './MercadoPagoConfigForm';
import { PricingConfigForm } from './PricingConfigForm';

export const PaymentSettingsPage: React.FC = () => {
  const { config, loading, loadConfig } = usePaymentConfig();
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(
    config?.provider || null
  );
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [showPricingForm, setShowPricingForm] = useState(false);

  console.log('🎨 PaymentSettingsPage render - config:', config, 'selectedProvider:', selectedProvider);

  // Update selectedProvider when config changes
  useEffect(() => {
    console.log('🔄 Config changed in PaymentSettingsPage:', config);
    if (config?.provider) {
      console.log('✅ Updating selectedProvider to:', config.provider);
      setSelectedProvider(config.provider);
    } else {
      console.log('❌ No config provider found');
    }
  }, [config]);

  const providers = [
    {
      id: 'manual' as PaymentProvider,
      name: 'Pago Manual',
      icon: FileText,
      description: 'Comprobantes de transferencia',
      features: ['Sin comisiones', 'Aprobación manual', 'Transferencia bancaria'],
      commission: 'Gratis',
      color: 'blue',
      recommended: false,
    },
    {
      id: 'mercadopago' as PaymentProvider,
      name: 'Mercado Pago',
      icon: CreditCard,
      description: 'Pagos automáticos',
      features: [
        'Tarjetas de crédito/débito',
        'Mercado Pago Wallet',
        'Efectivo (PagoFácil)',
        'Confirmación automática',
      ],
      commission: '3.5% + IVA',
      color: 'green',
      recommended: true,
    },
  ];

  const handleProviderSelect = (provider: PaymentProvider) => {
    setSelectedProvider(provider);
    setShowConfigForm(true);
  };

  const handleConfigSaved = async () => {
    setShowConfigForm(false);
    setShowPricingForm(false);
    // Reload config to show updated data
    await loadConfig();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Configuración de Pagos
            </h1>
          </div>
          <p className="text-gray-600">
            Configura cómo recibirás los pagos de tus clientes
          </p>
        </div>

        {/* Current Configuration Status */}
        {config && (
          <Card className="p-4 mb-6 bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">
                  Método de pago configurado
                </p>
                <p className="text-sm text-green-700">
                  {config.provider === 'manual' ? 'Pago Manual' : 'Mercado Pago'} -{' '}
                  {config.isActive ? 'Activo' : 'Inactivo'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Provider Selection */}
        {!showConfigForm && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Selecciona un Método de Pago
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {providers.map((provider) => (
                <Card
                  key={provider.id}
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    config?.provider === provider.id
                      ? 'border-2 border-blue-600 bg-blue-50'
                      : 'border border-gray-200'
                  }`}
                  onClick={() => handleProviderSelect(provider.id)}
                >
                  {/* Recommended Badge */}
                  {provider.recommended && (
                    <div className="mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ⭐ Recomendado
                      </span>
                    </div>
                  )}

                  {/* Icon and Title */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`p-3 rounded-lg ${
                        provider.color === 'green'
                          ? 'bg-green-100'
                          : 'bg-blue-100'
                      }`}
                    >
                      <provider.icon
                        className={`h-6 w-6 ${
                          provider.color === 'green'
                            ? 'text-green-600'
                            : 'text-blue-600'
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {provider.name}
                      </h3>
                      <p className="text-sm text-gray-600">{provider.description}</p>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-4">
                    {provider.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Commission */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-600">Comisión</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {provider.commission}
                    </span>
                  </div>

                  {/* Action Button */}
                  <Button
                    className="w-full mt-4"
                    variant={config?.provider === provider.id ? 'outline' : 'default'}
                  >
                    {config?.provider === provider.id
                      ? 'Reconfigurar'
                      : 'Activar'}
                  </Button>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Configuration Form */}
        {showConfigForm && selectedProvider && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Configurar {selectedProvider === 'manual' ? 'Pago Manual' : 'Mercado Pago'}
              </h2>
              <Button
                variant="outline"
                onClick={() => setShowConfigForm(false)}
              >
                Cancelar
              </Button>
            </div>

            {selectedProvider === 'manual' && (
              <ManualConfigForm onSaved={handleConfigSaved} />
            )}

            {selectedProvider === 'mercadopago' && (
              <MercadoPagoConfigForm onSaved={handleConfigSaved} />
            )}
          </div>
        )}

        {/* Pricing Configuration */}
        {config && !showConfigForm && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Precios por Clase
                </h2>
              </div>
              <Button
                onClick={() => {
                  console.log('🎯 Opening pricing modal');
                  setShowPricingForm(true);
                }}
                variant="outline"
              >
                Configurar Precios
              </Button>
            </div>

            <Card className="p-6">
              {config.pricing && Object.keys(config.pricing).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(config.pricing).map(([sport, sportConfig]) => (
                    <div
                      key={sport}
                      onClick={() => setShowPricingForm(true)}
                      className="border-b border-gray-200 last:border-0 pb-4 last:pb-0 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{sport}</h3>
                        <span className="text-xs text-blue-600 font-medium">
                          Clic para editar
                        </span>
                      </div>
                      <div className="space-y-3">
                        {sportConfig.timeSlots.map((slot, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg ${
                              slot.type === 'high'
                                ? 'bg-orange-50 border border-orange-200'
                                : 'bg-blue-50 border border-blue-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                {slot.label}
                              </span>
                              <span className="text-xs text-gray-500">
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              {Object.entries(slot.prices).map(([duration, price]) => (
                                <div key={duration} className="text-sm">
                                  <span className="text-gray-600">{duration} min:</span>
                                  <span className="ml-1 font-semibold text-gray-900">
                                    ${(price as number).toLocaleString('es-CL')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">
                    No has configurado precios todavía
                  </p>
                  <Button onClick={() => setShowPricingForm(true)}>
                    Configurar Precios
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Pricing Modal */}
        <PricingConfigForm 
          open={showPricingForm}
          onOpenChange={setShowPricingForm}
          onSaved={handleConfigSaved}
        />
      </div>
    </DashboardLayout>
  );
};
