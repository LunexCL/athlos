import React, { useState } from 'react';
import { usePaymentConfig } from './hooks/usePaymentConfig';
import { useAuth } from '../auth/AuthContext';
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
import { Plus, Trash2, DollarSign, Clock, TrendingUp, TrendingDown, X } from 'lucide-react';
import { sportOptions } from '@/app/shared/types/sports';
import type { PricingConfig, TimeSlotPricing, TimeSlotType } from './types';

export const PricingConfigForm: React.FC<{ 
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}> = ({ open, onOpenChange, onSaved }) => {
  const { config, updatePricing } = usePaymentConfig();
  const { tenant } = useAuth();
  const [pricing, setPricing] = useState<PricingConfig>(config?.pricing || {});
  const [newSportType, setNewSportType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update pricing when config changes or modal opens
  React.useEffect(() => {
    if (open && config?.pricing) {
      setPricing(config.pricing);
    }
  }, [open, config?.pricing]);

  // Get tenant's configured sports
  const tenantSports = tenant?.settings?.sports || [];
  
  // If tenant has no sports configured, use all available sports as fallback
  const sportsToShow = tenantSports.length > 0 
    ? tenantSports 
    : sportOptions.map(s => s.label);
  
  // Filter available sports (sports not yet in pricing)
  const availableSports = sportsToShow.filter(sport => !pricing[sport]);

  console.log('💰 PricingConfigForm render - open:', open, 'pricing:', pricing);
  console.log('🏃 Tenant sports:', tenantSports, 'Available sports:', availableSports);

  if (!open) return null;

  const handleAddSport = () => {
    if (!newSportType.trim()) return;

    setPricing({
      ...pricing,
      [newSportType]: {
        timeSlots: [
          {
            type: 'low',
            label: 'Horario Bajo',
            startTime: '09:00',
            endTime: '17:00',
            prices: {
              60: 0,
              90: 0,
              120: 0,
            },
          },
          {
            type: 'high',
            label: 'Horario Alto',
            startTime: '18:00',
            endTime: '22:00',
            prices: {
              60: 0,
              90: 0,
              120: 0,
            },
          },
        ],
      },
    });
    setNewSportType('');
  };

  const handleRemoveSport = (sportType: string) => {
    const newPricing = { ...pricing };
    delete newPricing[sportType];
    setPricing(newPricing);
  };

  const handleTimeSlotChange = (
    sportType: string,
    slotIndex: number,
    field: 'startTime' | 'endTime' | 'label',
    value: string
  ) => {
    const newPricing = { ...pricing };
    newPricing[sportType].timeSlots[slotIndex][field] = value;
    setPricing(newPricing);
  };

  const handlePriceChange = (
    sportType: string,
    slotIndex: number,
    duration: number,
    value: string
  ) => {
    const numericValue = parseInt(value) || 0;
    const newPricing = { ...pricing };
    newPricing[sportType].timeSlots[slotIndex].prices[duration] = numericValue;
    setPricing(newPricing);
  };

  const handleAddTimeSlot = (sportType: string) => {
    const newPricing = { ...pricing };
    newPricing[sportType].timeSlots.push({
      type: 'low',
      label: 'Nueva Franja',
      startTime: '00:00',
      endTime: '23:59',
      prices: {
        60: 0,
        90: 0,
        120: 0,
      },
    });
    setPricing(newPricing);
  };

  const handleRemoveTimeSlot = (sportType: string, slotIndex: number) => {
    const newPricing = { ...pricing };
    newPricing[sportType].timeSlots.splice(slotIndex, 1);
    setPricing(newPricing);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const success = await updatePricing(pricing);
    if (success) {
      onOpenChange(false);
      onSaved();
    }

    setIsSubmitting(false);
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('es-CL');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Modal Content */}
      <div className="relative z-[10000] w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-2xl m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Configurar Precios por Clase
              </h2>
            </div>
            <p className="text-sm text-gray-600">
              Define los precios para cada deporte y franja horaria
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Add New Sport */}
          {availableSports.length > 0 && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Agregar Deporte
              </Label>
              <div className="flex gap-2">
                <select
                  value={newSportType}
                  onChange={(e) => setNewSportType(e.target.value)}
                  className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecciona un deporte...</option>
                  {availableSports.map((sport) => (
                    <option key={sport} value={sport}>
                      {sport}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  onClick={handleAddSport}
                  disabled={!newSportType}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Agregar
                </Button>
              </div>
            </Card>
          )}

          {/* Existing Sports */}
          <div className="space-y-6">
            {Object.keys(pricing).length > 0 ? (
              Object.entries(pricing).map(([sportType, sportConfig]) => (
                <Card key={sportType} className="p-6 border-2 border-gray-200">
                  {/* Sport Header */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">{sportType}</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSport(sportType)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar Deporte
                    </Button>
                  </div>

                  {/* Time Slots */}
                  <div className="space-y-4">
                    {sportConfig.timeSlots.map((slot, slotIndex) => (
                      <Card key={slotIndex} className={`p-4 ${
                        slot.type === 'high' 
                          ? 'bg-orange-50 border-orange-200' 
                          : 'bg-blue-50 border-blue-200'
                      }`}>
                        {/* Time Slot Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {slot.type === 'high' ? (
                              <TrendingUp className="h-5 w-5 text-orange-600" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-blue-600" />
                            )}
                            <Input
                              value={slot.label}
                              onChange={(e) =>
                                handleTimeSlotChange(sportType, slotIndex, 'label', e.target.value)
                              }
                              className="w-40 font-medium bg-white"
                              placeholder="Nombre franja"
                            />
                          </div>
                          {sportConfig.timeSlots.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveTimeSlot(sportType, slotIndex)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        {/* Time Range */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div>
                            <Label className="text-xs text-gray-600 mb-1 block">
                              <Clock className="h-3 w-3 inline mr-1" />
                              Hora Inicio
                            </Label>
                            <Input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) =>
                                handleTimeSlotChange(sportType, slotIndex, 'startTime', e.target.value)
                              }
                              className="bg-white"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600 mb-1 block">
                              <Clock className="h-3 w-3 inline mr-1" />
                              Hora Fin
                            </Label>
                            <Input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) =>
                                handleTimeSlotChange(sportType, slotIndex, 'endTime', e.target.value)
                              }
                              className="bg-white"
                            />
                          </div>
                        </div>

                        {/* Prices */}
                        <div className="grid grid-cols-3 gap-3">
                          {[60, 90, 120].map((duration) => (
                            <div key={duration}>
                              <Label className="text-xs text-gray-600 mb-1 block">
                                {duration} min
                              </Label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                  $
                                </span>
                                <Input
                                  type="number"
                                  min="0"
                                  step="1000"
                                  value={slot.prices[duration] || 0}
                                  onFocus={(e) => {
                                    if (e.target.value === '0') {
                                      e.target.select();
                                    }
                                  }}
                                  onChange={(e) =>
                                    handlePriceChange(sportType, slotIndex, duration, e.target.value)
                                  }
                                  className="pl-7 bg-white"
                                  placeholder="0"
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatCurrency(slot.prices[duration] || 0)} CLP
                              </p>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}

                    {/* Add Time Slot Button */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTimeSlot(sportType)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Franja Horaria
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No hay precios configurados</p>
              <p className="text-sm mt-1">
                {availableSports.length > 0 
                  ? 'Agrega un deporte para empezar'
                  : 'Primero configura los deportes en tu perfil'}
              </p>
            </div>
          )}
        </div>

        {/* Example Pricing */}
        {tenantSports.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>💡 Sugerencia:</strong> Los precios típicos en Chile son:
            </p>
            <ul className="text-sm text-blue-900 mt-2 space-y-1">
              <li>• 60 min: $12.000 - $20.000</li>
              <li>• 90 min: $18.000 - $28.000</li>
              <li>• 120 min: $24.000 - $35.000</li>
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || Object.keys(pricing).length === 0}
            className="flex-1"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Precios'}
          </Button>
        </div>
      </form>
      </div>
    </div>
);
};
