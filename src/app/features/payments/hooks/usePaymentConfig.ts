import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  query,
  limit,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { useAuth } from '../../auth/AuthContext';
import { toast } from 'sonner';
import type { PaymentConfig, PaymentConfigFormData, PricingConfig } from '../types';

export const usePaymentConfig = () => {
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const { tenant } = useAuth();

  useEffect(() => {
    if (!tenant?.id) {
      console.log('❌ No tenant ID for payment config');
      setLoading(false);
      return;
    }

    loadConfig();
  }, [tenant?.id]);

  const loadConfig = async () => {
    if (!tenant?.id) return;

    try {
      console.log('🔑 Loading payment config for tenant:', tenant.id);
      const configRef = collection(db, 'tenants', tenant.id, 'paymentConfig');
      const q = query(configRef, limit(1));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        const configData: PaymentConfig = {
          id: doc.id,
          tenantId: tenant.id,
          provider: data.provider,
          isActive: data.isActive,
          mercadoPago: data.mercadoPago,
          bankInfo: data.bankInfo,
          pricing: data.pricing || {},
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
        console.log('⚙️ Payment config loaded:', configData);
        setConfig(configData);
      } else {
        console.log('📝 No payment config found');
        setConfig(null);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading payment config:', error);
      toast.error('Error al cargar configuración', {
        description: 'No se pudo cargar la configuración de pagos',
      });
      setLoading(false);
    }
  };

  const saveConfig = async (formData: PaymentConfigFormData): Promise<boolean> => {
    if (!tenant?.id) {
      toast.error('Error', { description: 'No se encontró el tenant' });
      return false;
    }

    try {
      const now = Timestamp.now();
      const configData: any = {
        tenantId: tenant.id,
        provider: formData.provider,
        isActive: true,
        updatedAt: now,
      };

      // Manual payment configuration
      if (formData.provider === 'manual') {
        if (!formData.bank || !formData.accountNumber || !formData.rut || !formData.accountName) {
          toast.error('Error', {
            description: 'Complete todos los campos requeridos para pago manual',
          });
          return false;
        }

        configData.bankInfo = {
          bank: formData.bank,
          accountType: formData.accountType || 'Cuenta Corriente',
          accountNumber: formData.accountNumber,
          rut: formData.rut,
          name: formData.accountName,
          email: formData.email,
        };
      }

      // Mercado Pago configuration
      if (formData.provider === 'mercadopago') {
        if (!formData.accessToken || !formData.publicKey) {
          toast.error('Error', {
            description: 'Complete las credenciales de Mercado Pago',
          });
          return false;
        }

        configData.mercadoPago = {
          accessToken: formData.accessToken, // TODO: Encriptar en Cloud Function
          publicKey: formData.publicKey,
          isTestMode: formData.isTestMode || false,
        };
      }

      // Keep existing pricing if not updating
      if (config?.pricing) {
        configData.pricing = config.pricing;
      } else {
        configData.pricing = {};
      }

      let configRef;
      if (config?.id) {
        // Update existing config
        configRef = doc(db, 'tenants', tenant.id, 'paymentConfig', config.id);
        await updateDoc(configRef, configData);
        console.log('✅ Payment config updated');
      } else {
        // Create new config
        configData.createdAt = now;
        const configCollection = collection(db, 'tenants', tenant.id, 'paymentConfig');
        configRef = doc(configCollection);
        await setDoc(configRef, configData);
        console.log('✅ Payment config created');
      }

      toast.success('Configuración guardada', {
        description: 'La configuración de pagos ha sido actualizada',
      });

      // Reload config
      await loadConfig();
      return true;
    } catch (error) {
      console.error('Error saving payment config:', error);
      toast.error('Error al guardar configuración', {
        description: 'No se pudo guardar la configuración',
      });
      return false;
    }
  };

  const updatePricing = async (pricing: PricingConfig): Promise<boolean> => {
    if (!tenant?.id || !config?.id) {
      toast.error('Error', { description: 'No se encontró la configuración' });
      return false;
    }

    try {
      const configRef = doc(db, 'tenants', tenant.id, 'paymentConfig', config.id);
      await updateDoc(configRef, {
        pricing,
        updatedAt: Timestamp.now(),
      });

      console.log('✅ Pricing updated');
      toast.success('Precios actualizados', {
        description: 'Los precios han sido guardados',
      });

      // Reload config
      await loadConfig();
      return true;
    } catch (error) {
      console.error('Error updating pricing:', error);
      toast.error('Error al actualizar precios', {
        description: 'No se pudieron guardar los precios',
      });
      return false;
    }
  };

  const getPrice = (
    sportType: string,
    duration: number,
    appointmentTime?: string // HH:mm format
  ): number | null => {
    if (!config?.pricing || !config.pricing[sportType]) return null;

    const sportConfig = config.pricing[sportType];

    // If no appointment time provided, return price from first time slot
    if (!appointmentTime) {
      return sportConfig.timeSlots[0]?.prices[duration] || null;
    }

    // Find matching time slot
    const matchingSlot = sportConfig.timeSlots.find((slot) => {
      return appointmentTime >= slot.startTime && appointmentTime < slot.endTime;
    });

    return matchingSlot?.prices[duration] || null;
  };

  const hasConfig = (): boolean => {
    return config !== null && config.isActive;
  };

  const isManualPayment = (): boolean => {
    return config?.provider === 'manual' && config.isActive;
  };

  const isMercadoPago = (): boolean => {
    return config?.provider === 'mercadopago' && config.isActive;
  };

  return {
    config,
    loading,
    saveConfig,
    updatePricing,
    getPrice,
    hasConfig,
    isManualPayment,
    isMercadoPago,
    loadConfig,
  };
};
